using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;

namespace DMS.Application.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICustomerLedgerService _ledgerService;

        public CustomerService(ICustomerRepository customerRepository, ICustomerLedgerService ledgerService)
        {
            _customerRepository = customerRepository;
            _ledgerService = ledgerService;
        }

        public async Task<IEnumerable<Customer>> GetAllCustomersAsync(string? search = null, int? routeId = null, int? salesmanId = null)
        {
            if (!string.IsNullOrWhiteSpace(search))
                return await _customerRepository.SearchAsync(search, routeId, salesmanId);
            return await _customerRepository.GetAllAsync(routeId, salesmanId);
        }

        public async Task<Customer?> GetCustomerByIdAsync(int id) 
            => await _customerRepository.GetByIdAsync(id);

        public async Task<object?> GetCustomerWithHistoryAsync(int id)
        {
            var customer = await _customerRepository.GetByIdWithHistoryAsync(id);
            if (customer == null) return null;

            // Build summarized history response 
            var invoices = customer.Invoices
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new
                {
                    i.InvoiceId,
                    i.InvoiceNumber,
                    i.InvoiceDate,
                    i.TotalAmount,
                    i.Discount,
                    i.NetAmount,
                    i.PaymentStatus,
                    Items = i.InvoiceItems.Select(ii => new
                    {
                        ii.ProductId,
                        ProductName = ii.Product?.ProductName ?? "Unknown",
                        ii.Quantity,
                        ii.UnitPrice,
                        ii.TotalPrice,
                    }),
                    Payments = i.Payments.Select(p => new
                    {
                        p.PaymentId,
                        Amount = p.AmountPaid,
                        p.PaymentDate,
                        Notes = p.PaymentMethod,
                    }),
                });

            // Calculate outstanding balance
            decimal totalInvoiced = customer.Invoices.Sum(i => i.NetAmount);
            decimal totalPaid = customer.Invoices.SelectMany(i => i.Payments).Sum(p => p.AmountPaid);
            decimal outstanding = totalInvoiced - totalPaid;

            return new
            {
                customer.CustomerId,
                customer.CustomerName,
                customer.Phone,
                customer.Address,
                customer.Area,
                customer.CreditLimit,
                customer.Balance,
                Outstanding = outstanding,
                TotalInvoiced = totalInvoiced,
                TotalPaid = totalPaid,
                Invoices = invoices,
            };
        }

        public async Task<Customer> CreateCustomerAsync(Customer customer)
        {
            customer.Balance = 0; // always start at 0
            await _customerRepository.AddAsync(customer);
            await _customerRepository.SaveChangesAsync();
            return customer;
        }

        public async Task UpdateCustomerAsync(Customer customer)
        {
            var existing = await _customerRepository.GetByIdAsync(customer.CustomerId);
            if (existing == null) throw new InvalidOperationException("Customer not found.");

            // Only update editable fields — preserve Balance (managed by invoices)
            existing.CustomerName = customer.CustomerName;
            existing.Phone = customer.Phone;
            existing.Address = customer.Address;
            existing.Area = customer.Area;
            existing.CreditLimit = customer.CreditLimit;

            _customerRepository.Update(existing);
            await _customerRepository.SaveChangesAsync();
        }

        public async Task DeleteCustomerAsync(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer != null)
            {
                _customerRepository.Delete(customer);
                await _customerRepository.SaveChangesAsync();
            }
        }

        // Record a manual payment that reduces the customer's outstanding balance
        public async Task RecordPaymentAsync(int customerId, decimal amount, string? notes)
        {
            var customer = await _customerRepository.GetByIdWithHistoryAsync(customerId);
            if (customer == null) throw new InvalidOperationException("Customer not found.");

            decimal remainingPayment = amount;

            // Find all unpaid/partial invoices and apply the payment across them (FIFO)
            var unpaidInvoices = customer.Invoices
                .Where(i => i.PaymentStatus != "Paid" && i.PaymentStatus != "Cancelled")
                .OrderBy(i => i.InvoiceDate)
                .ToList();

            foreach (var invoice in unpaidInvoices)
            {
                if (remainingPayment <= 0) break;

                decimal balance = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);
                decimal toApply = Math.Min(remainingPayment, balance);

                if (toApply > 0)
                {
                    var payment = new Payment
                    {
                        InvoiceId = invoice.InvoiceId,
                        AmountPaid = toApply,
                        PaymentDate = DateTime.UtcNow,
                        PaymentMethod = notes ?? "Manual Payment",
                    };
                    invoice.Payments.Add(payment);
                    invoice.PaidAmount += toApply;
                    
                    // Recalculate status
                    invoice.RemainingAmount = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);
                    if (invoice.PaidAmount >= invoice.NetAmount)
                        invoice.PaymentStatus = "Paid";
                    else if (invoice.PaidAmount > 0)
                        invoice.PaymentStatus = "Partial";
                    else
                        invoice.PaymentStatus = "Unpaid";

                    remainingPayment -= toApply;
                }
            }

            // Reduce customer balance by the TOTAL amount received
            customer.Balance = Math.Max(0, customer.Balance - amount);
            _customerRepository.Update(customer);

            // Add Ledger Entry (Credit)
            await _ledgerService.AddTransactionAsync(new Application.DTOs.CustomerLedgerDTO
            {
                CustomerId = customerId,
                TransactionType = TransactionType.Credit,
                Amount = amount,
                Description = notes ?? "Payment Received",
                Reference = unpaidInvoices.FirstOrDefault()?.InvoiceNumber, // Principal reference
                Date = DateTime.UtcNow
            });

            await _customerRepository.SaveChangesAsync();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using DMS.Application.DTOs;

namespace DMS.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly ICustomerLedgerService _ledgerService;
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;

        public PaymentService(
            ApplicationDbContext context, 
            IInvoiceRepository invoiceRepository, 
            ICustomerRepository customerRepository,
            ICustomerLedgerService ledgerService,
            Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
        {
            _context = context;
            _invoiceRepository = invoiceRepository;
            _customerRepository = customerRepository;
            _ledgerService = ledgerService;
            _cache = cache;
        }

        private void InvalidateDashboardCache()
        {
            _cache.Remove("dashboard_metrics");
        }

        public async Task<Payment> RecordPaymentAsync(Payment payment)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoice = await _invoiceRepository.GetByIdAsync(payment.InvoiceId);
                if (invoice == null) throw new InvalidOperationException("Invoice not found");

                if (payment.AmountPaid <= 0) throw new InvalidOperationException("Payment amount must be greater than zero");

                // Update Invoice totals
                invoice.PaidAmount += payment.AmountPaid;
                invoice.RemainingAmount = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);

                // Automated Payment Status Update
                UpdateInvoiceStatus(invoice);

                // Update Customer Balance
                var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
                if (customer != null)
                {
                    customer.Balance -= payment.AmountPaid;
                    _customerRepository.Update(customer);
                }

                // Add Ledger Entry
                await _ledgerService.AddTransactionAsync(new CustomerLedgerDTO
                {
                    CustomerId = invoice.CustomerId,
                    TransactionType = TransactionType.Credit,
                    Amount = payment.AmountPaid,
                    Description = $"Payment Received for Invoice: {invoice.InvoiceNumber}",
                    Reference = invoice.InvoiceNumber,
                    Date = payment.PaymentDate == default ? DateTime.UtcNow : payment.PaymentDate
                });

                if (payment.PaymentDate == default) payment.PaymentDate = DateTime.UtcNow;
                await _context.Payments.AddAsync(payment);

                _invoiceRepository.Update(invoice);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                InvalidateDashboardCache();
                return payment;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task ProcessBulkPaymentAsync(BulkPaymentDTO dto)
        {
            if (dto.Amount <= 0) throw new InvalidOperationException("Payment amount must be greater than zero");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
                if (customer == null) throw new InvalidOperationException("Customer not found");

                List<(int InvoiceId, decimal Amount)> allocations;

                if (dto.ManualAllocations != null && dto.ManualAllocations.Any())
                {
                    // Validation: Total allocated must match payment amount
                    var totalAllocated = dto.ManualAllocations.Sum(a => a.Amount);
                    if (totalAllocated > dto.Amount) throw new InvalidOperationException("Total manual allocation exceeds payment amount.");
                    
                    allocations = dto.ManualAllocations.Select(a => (a.InvoiceId, a.Amount)).ToList();
                }
                else
                {
                    // FIFO Allocation
                    allocations = await CalculateFIFOAllocations(dto.CustomerId, dto.Amount);
                }

                foreach (var allocation in allocations)
                {
                    var invoice = await _invoiceRepository.GetByIdAsync(allocation.InvoiceId);
                    if (invoice == null) continue;

                    // Create Payment Record
                    var payment = new Payment
                    {
                        InvoiceId = invoice.InvoiceId,
                        AmountPaid = allocation.Amount,
                        PaymentDate = dto.PaymentDate,
                        PaymentMethod = dto.PaymentMethod
                    };
                    await _context.Payments.AddAsync(payment);

                    // Update Invoice
                    invoice.PaidAmount += allocation.Amount;
                    invoice.RemainingAmount = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);
                    UpdateInvoiceStatus(invoice);
                    _invoiceRepository.Update(invoice);
                }

                // Update Customer Balance
                customer.Balance -= dto.Amount;
                _customerRepository.Update(customer);

                // Add Single Ledger Entry for the Bulk Payment
                string invoiceRef = allocations.Any() ? string.Join(", ", allocations.Select(a => a.InvoiceId)) : "General";
                await _ledgerService.AddTransactionAsync(new CustomerLedgerDTO
                {
                    CustomerId = dto.CustomerId,
                    TransactionType = TransactionType.Credit,
                    Amount = dto.Amount,
                    Description = $"Bulk Payment Received via {dto.PaymentMethod}. Applied to {allocations.Count} invoices.",
                    Reference = $"BULK-{DateTime.UtcNow:yyyyMMdd}",
                    Date = dto.PaymentDate
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                InvalidateDashboardCache();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<List<(int InvoiceId, decimal Amount)>> CalculateFIFOAllocations(int customerId, decimal totalAmount)
        {
            var allocations = new List<(int InvoiceId, decimal Amount)>();
            var remainingPayment = totalAmount;

            var outstandingInvoices = await _context.Invoices
                .Where(i => i.CustomerId == customerId && i.RemainingAmount > 0)
                .OrderBy(i => i.InvoiceDate)
                .ThenBy(i => i.InvoiceId)
                .ToListAsync();

            foreach (var invoice in outstandingInvoices)
            {
                if (remainingPayment <= 0) break;

                decimal amountToApply = Math.Min(remainingPayment, invoice.RemainingAmount);
                allocations.Add((invoice.InvoiceId, amountToApply));
                remainingPayment -= amountToApply;
            }

            return allocations;
        }

        private void UpdateInvoiceStatus(Invoice invoice)
        {
            if (invoice.RemainingAmount <= 0)
                invoice.PaymentStatus = "Paid";
            else if (invoice.PaidAmount > 0)
                invoice.PaymentStatus = "Partial";
            else
                invoice.PaymentStatus = "Unpaid";
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByInvoiceIdAsync(int invoiceId)
        {
            return await _context.Payments
                .Where(p => p.InvoiceId == invoiceId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
        {
            return await _context.Payments
                .Include(p => p.Invoice)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }
    }
}

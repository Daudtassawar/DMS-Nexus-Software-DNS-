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

        public PaymentService(
            ApplicationDbContext context, 
            IInvoiceRepository invoiceRepository, 
            ICustomerRepository customerRepository,
            ICustomerLedgerService ledgerService)
        {
            _context = context;
            _invoiceRepository = invoiceRepository;
            _customerRepository = customerRepository;
            _ledgerService = ledgerService;
        }

        public async Task<Payment> RecordPaymentAsync(Payment payment)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Get the invoice
                var invoice = await _invoiceRepository.GetByIdAsync(payment.InvoiceId);
                if (invoice == null) throw new InvalidOperationException("Invoice not found");

                // 2. Validate amount (Basic check, allow overpayment if business rules allow, but usually not)
                if (payment.AmountPaid <= 0) throw new InvalidOperationException("Payment amount must be greater than zero");

                // 3. Update Invoice totals
                invoice.PaidAmount += payment.AmountPaid;
                invoice.RemainingAmount = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);

                // Note: We do NOT automatically change PaymentStatus here. 
                // Status is now controlled manually by the admin (Phase 6).
                // However, we record the payment to reflect in financial modules.

                // 4. Update Customer Balance
                var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
                if (customer != null)
                {
                    customer.Balance -= payment.AmountPaid;
                    _customerRepository.Update(customer);
                }

                // 5. Add Ledger Entry (Credit)
                await _ledgerService.AddTransactionAsync(new CustomerLedgerDTO
                {
                    CustomerId = invoice.CustomerId,
                    TransactionType = TransactionType.Credit,
                    Amount = payment.AmountPaid,
                    Description = $"Payment Received for Invoice: {invoice.InvoiceNumber}",
                    Reference = invoice.InvoiceNumber,
                    Date = payment.PaymentDate == default ? DateTime.UtcNow : payment.PaymentDate
                });

                // 6. Save Payment
                if (payment.PaymentDate == default) payment.PaymentDate = DateTime.UtcNow;
                await _context.Payments.AddAsync(payment);

                // 7. Persist all changes
                _invoiceRepository.Update(invoice);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return payment;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
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

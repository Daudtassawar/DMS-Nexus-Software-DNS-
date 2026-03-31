using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.DTOs;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Application.Services
{
    public class CustomerLedgerService : ICustomerLedgerService
    {
        private readonly ApplicationDbContext _context;

        public CustomerLedgerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CustomerLedgerDTO>> GetLedgerByCustomerIdAsync(int customerId)
        {
            var ledgers = await _context.CustomerLedgers
                .Where(l => l.CustomerId == customerId)
                .OrderBy(l => l.Date)
                .ThenBy(l => l.Id)
                .ToListAsync();

            var result = new List<CustomerLedgerDTO>();
            decimal runningBalance = 0;

            foreach (var l in ledgers)
            {
                if (l.TransactionType == TransactionType.Debit)
                    runningBalance += l.Amount;
                else
                    runningBalance -= l.Amount;

                result.Add(new CustomerLedgerDTO
                {
                    Id = l.Id,
                    CustomerId = l.CustomerId,
                    TransactionType = l.TransactionType,
                    Amount = l.Amount,
                    Description = l.Description,
                    Reference = l.Reference,
                    Date = l.Date,
                    CreatedByUserId = l.CreatedByUserId,
                    RunningBalance = runningBalance
                });
            }

            // Return descending so newest is on top
            return result.OrderByDescending(r => r.Date).ThenByDescending(r => r.Id);
        }

        public async Task<CustomerLedgerDTO> AddTransactionAsync(CustomerLedgerDTO transactionDto)
        {
            if (transactionDto.Amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");

            var customer = await _context.Customers.FindAsync(transactionDto.CustomerId);
            if (customer == null)
                throw new KeyNotFoundException("Customer not found.");

            // Calculate new running balance
            var currentBalance = await GetRunningBalanceAsync(transactionDto.CustomerId);
            var newBalance = transactionDto.TransactionType == TransactionType.Debit 
                ? currentBalance + transactionDto.Amount 
                : currentBalance - transactionDto.Amount;

            var ledger = new CustomerLedger
            {
                CustomerId = transactionDto.CustomerId,
                TransactionType = transactionDto.TransactionType,
                Amount = transactionDto.Amount,
                Description = transactionDto.Description ?? string.Empty,
                Reference = transactionDto.Reference,
                Date = transactionDto.Date != default ? transactionDto.Date : DateTime.UtcNow,
                CreatedByUserId = transactionDto.CreatedByUserId,
                RunningBalance = newBalance
            };

            _context.CustomerLedgers.Add(ledger);
            
            // Also update the customer's cached balance
            customer.Balance = newBalance;
            _context.Customers.Update(customer);

            await _context.SaveChangesAsync();

            transactionDto.Id = ledger.Id;
            transactionDto.Date = ledger.Date;
            transactionDto.RunningBalance = newBalance;
            
            return transactionDto;
        }

        public async Task<decimal> GetRunningBalanceAsync(int customerId)
        {
            return await _context.CustomerLedgers
                .Where(l => l.CustomerId == customerId)
                .SumAsync(l => l.TransactionType == TransactionType.Debit ? l.Amount : -l.Amount);
        }

        public async Task UpdateTransactionAsync(int id, CustomerLedgerDTO transactionDto)
        {
            var ledger = await _context.CustomerLedgers.FindAsync(id);
            if (ledger == null)
                throw new KeyNotFoundException("Transaction not found.");

            // Since it's a ledger, updates are complex because they affect subsequent running balances.
            // For simplicity in this ERP, we will update the entry and then re-calculate ALL subsequent balances for this customer.
            
            ledger.TransactionType = transactionDto.TransactionType;
            ledger.Amount = transactionDto.Amount;
            ledger.Description = transactionDto.Description ?? string.Empty;
            ledger.Reference = transactionDto.Reference;
            if (transactionDto.Date != default) ledger.Date = transactionDto.Date;

            await _context.SaveChangesAsync();
            await RecalculateBalancesAsync(ledger.CustomerId);
        }

        public async Task DeleteTransactionAsync(int id)
        {
            var ledger = await _context.CustomerLedgers.FindAsync(id);
            if (ledger == null)
                throw new KeyNotFoundException("Transaction not found.");

            int customerId = ledger.CustomerId;
            _context.CustomerLedgers.Remove(ledger);
            await _context.SaveChangesAsync();
            
            await RecalculateBalancesAsync(customerId);
        }

        private async Task RecalculateBalancesAsync(int customerId)
        {
            var ledgers = await _context.CustomerLedgers
                .Where(l => l.CustomerId == customerId)
                .OrderBy(l => l.Date)
                .ThenBy(l => l.Id)
                .ToListAsync();

            decimal runningBalance = 0;
            foreach (var l in ledgers)
            {
                if (l.TransactionType == TransactionType.Debit)
                    runningBalance += l.Amount;
                else
                    runningBalance -= l.Amount;

                l.RunningBalance = runningBalance;
            }

            var customer = await _context.Customers.FindAsync(customerId);
            if (customer != null)
            {
                customer.Balance = runningBalance;
                _context.Customers.Update(customer);
            }

            await _context.SaveChangesAsync();
        }
    }
}

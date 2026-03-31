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
    public class CompanyLedgerService : ICompanyLedgerService
    {
        private readonly ApplicationDbContext _context;

        public CompanyLedgerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CompanyLedgerDTO>> GetLedgerByCompanyIdAsync(int companyId)
        {
            var ledgers = await _context.CompanyLedgers
                .AsNoTracking()
                .Where(l => l.CompanyId == companyId)
                .OrderByDescending(l => l.Date)
                .ThenByDescending(l => l.Id)
                .Select(l => new CompanyLedgerDTO
                {
                    Id = l.Id,
                    CompanyId = l.CompanyId,
                    TransactionType = l.TransactionType,
                    Amount = l.Amount,
                    Description = l.Description,
                    Reference = l.Reference,
                    Date = l.Date,
                    CreatedByUserId = l.CreatedByUserId,
                    RunningBalance = l.RunningBalance
                })
                .ToListAsync();

            return ledgers;
        }

        public async Task<CompanyLedgerDTO> AddTransactionAsync(CompanyLedgerDTO transactionDto)
        {
            if (transactionDto.Amount <= 0)
                throw new ArgumentException("Amount must be greater than zero.");

            var company = await _context.Companies.FindAsync(transactionDto.CompanyId);
            if (company == null)
                throw new KeyNotFoundException("Company not found.");

            // Calculate new running balance
            var currentBalance = await GetRunningBalanceAsync(transactionDto.CompanyId);
            var newBalance = transactionDto.TransactionType == TransactionType.Credit 
                ? currentBalance + transactionDto.Amount 
                : currentBalance - transactionDto.Amount;

            var ledger = new CompanyLedger
            {
                CompanyId = transactionDto.CompanyId,
                TransactionType = transactionDto.TransactionType,
                Amount = transactionDto.Amount,
                Description = transactionDto.Description ?? string.Empty,
                Reference = transactionDto.Reference,
                Date = transactionDto.Date != default ? transactionDto.Date : DateTime.UtcNow,
                CreatedByUserId = transactionDto.CreatedByUserId,
                RunningBalance = newBalance
            };

            _context.CompanyLedgers.Add(ledger);
            await _context.SaveChangesAsync();

            transactionDto.Id = ledger.Id;
            transactionDto.Date = ledger.Date;
            transactionDto.RunningBalance = newBalance;
            
            return transactionDto;
        }

        public async Task<decimal> GetRunningBalanceAsync(int companyId)
        {
            return await _context.CompanyLedgers
                .Where(l => l.CompanyId == companyId)
                .SumAsync(l => l.TransactionType == TransactionType.Credit ? l.Amount : -l.Amount);
        }

        public async Task UpdateTransactionAsync(int id, CompanyLedgerDTO transactionDto)
        {
            var ledger = await _context.CompanyLedgers.FindAsync(id);
            if (ledger == null)
                throw new KeyNotFoundException("Transaction not found.");

            ledger.TransactionType = transactionDto.TransactionType;
            ledger.Amount = transactionDto.Amount;
            ledger.Description = transactionDto.Description ?? string.Empty;
            ledger.Reference = transactionDto.Reference;
            if (transactionDto.Date != default) ledger.Date = transactionDto.Date;

            await _context.SaveChangesAsync();
            await RecalculateBalancesAsync(ledger.CompanyId);
        }

        public async Task DeleteTransactionAsync(int id)
        {
            var ledger = await _context.CompanyLedgers.FindAsync(id);
            if (ledger == null)
                throw new KeyNotFoundException("Transaction not found.");

            int companyId = ledger.CompanyId;
            _context.CompanyLedgers.Remove(ledger);
            await _context.SaveChangesAsync();
            
            await RecalculateBalancesAsync(companyId);
        }

        private async Task RecalculateBalancesAsync(int companyId)
        {
            var ledgers = await _context.CompanyLedgers
                .Where(l => l.CompanyId == companyId)
                .OrderBy(l => l.Date)
                .ThenBy(l => l.Id)
                .ToListAsync();

            decimal runningBalance = 0;
            foreach (var l in ledgers)
            {
                if (l.TransactionType == TransactionType.Credit)
                    runningBalance += l.Amount;
                else
                    runningBalance -= l.Amount;

                l.RunningBalance = runningBalance;
            }

            await _context.SaveChangesAsync();
        }
    }
}

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
    public class CompanyService : ICompanyService
    {
        private readonly ApplicationDbContext _context;

        public CompanyService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CompanyDTO>> GetAllCompaniesAsync()
        {
            return await _context.Companies
                .OrderBy(c => c.Name)
                .Select(c => new CompanyDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    ContactPerson = c.ContactPerson,
                    Phone = c.Phone,
                    Address = c.Address,
                    CreatedAt = c.CreatedAt,
                    RunningBalance = _context.CompanyLedgers
                        .Where(l => l.CompanyId == c.Id)
                        .Sum(l => l.TransactionType == TransactionType.Credit ? l.Amount : -l.Amount)
                })
                .ToListAsync();
        }

        public async Task<CompanyDTO?> GetCompanyByIdAsync(int id)
        {
            var c = await _context.Companies.FindAsync(id);
            if (c == null) return null;

            var balance = await _context.CompanyLedgers
                .Where(l => l.CompanyId == id)
                .SumAsync(l => l.TransactionType == TransactionType.Credit ? l.Amount : -l.Amount);

            return new CompanyDTO
            {
                Id = c.Id,
                Name = c.Name,
                ContactPerson = c.ContactPerson,
                Phone = c.Phone,
                Address = c.Address,
                CreatedAt = c.CreatedAt,
                RunningBalance = balance
            };
        }

        public async Task<CompanyDTO> CreateCompanyAsync(CompanyDTO companyDto)
        {
            if (await _context.Companies.AnyAsync())
            {
                throw new Exception("Company already exists. Only one master company (Gourmet Plant) is allowed in the system.");
            }

            var company = new Company
            {
                Name = companyDto.Name,
                ContactPerson = companyDto.ContactPerson,
                Phone = companyDto.Phone,
                Address = companyDto.Address,
                CreatedAt = DateTime.UtcNow
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            companyDto.Id = company.Id;
            companyDto.CreatedAt = company.CreatedAt;
            return companyDto;
        }

        public async Task UpdateCompanyAsync(int id, CompanyDTO companyDto)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) throw new Exception("Company not found");

            company.Name = companyDto.Name;
            company.ContactPerson = companyDto.ContactPerson;
            company.Phone = companyDto.Phone;
            company.Address = companyDto.Address;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteCompanyAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return;

            // Check if they have ledger entries
            var hasLedgers = await _context.CompanyLedgers.AnyAsync(l => l.CompanyId == id);
            if (hasLedgers) throw new Exception("Cannot delete company with existing ledger transactions.");

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
        }
    }
}

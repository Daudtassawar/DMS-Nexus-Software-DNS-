using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DMS.Application.Services
{
    public class SalesmanService : ISalesmanService
    {
        private readonly ISalesmanRepository _salesmanRepository;
        private readonly ApplicationDbContext _context;

        public SalesmanService(ISalesmanRepository salesmanRepository, ApplicationDbContext context)
        {
            _salesmanRepository = salesmanRepository;
            _context = context;
        }

        public async Task<IEnumerable<Salesman>> GetAllSalesmenAsync()
        {
            return await _salesmanRepository.GetAllAsync();
        }

        public async Task<Salesman?> GetSalesmanByIdAsync(int id)
        {
            return await _salesmanRepository.GetByIdAsync(id);
        }

        public async Task<Salesman> CreateSalesmanAsync(Salesman salesman)
        {
            return await _salesmanRepository.AddAsync(salesman);
        }

        public async Task UpdateSalesmanAsync(Salesman salesman)
        {
            await _salesmanRepository.UpdateAsync(salesman);
        }

        public async Task DeleteSalesmanAsync(int id)
        {
            await _salesmanRepository.DeleteAsync(id);
        }

        public async Task AssignCustomersAsync(int salesmanId, List<int> customerIds)
        {
            var salesman = await _salesmanRepository.GetByIdAsync(salesmanId);
            if (salesman == null) throw new Exception("Salesman not found");

            var customers = await _context.Customers
                .Where(c => customerIds.Contains(c.CustomerId))
                .ToListAsync();

            foreach (var customer in customers)
            {
                customer.SalesmanId = salesmanId;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<object> GetSalesmanPerformanceAsync(int salesmanId, int year, int month)
        {
            var salesman = await _salesmanRepository.GetByIdAsync(salesmanId);
            if (salesman == null) return null!;

            var invoices = await _context.Invoices
                .Where(i => i.SalesmanId == salesmanId &&
                            i.InvoiceDate.Year == year &&
                            i.InvoiceDate.Month == month)
                .ToListAsync();

            var totalSales = invoices.Sum(i => i.TotalAmount);
            var commissionEarned = totalSales * (salesman.CommissionRate / 100);
            var targetProgress = salesman.MonthlyTarget > 0 ? (totalSales / salesman.MonthlyTarget) * 100 : 0;

            return new
            {
                SalesmanId = salesman.SalesmanId,
                Name = salesman.Name,
                Year = year,
                Month = month,
                TotalSales = totalSales,
                MonthlyTarget = salesman.MonthlyTarget,
                TargetProgressPercentage = Math.Round(targetProgress, 2),
                CommissionRate = salesman.CommissionRate,
                CommissionEarned = Math.Round(commissionEarned, 2),
                InvoicesCount = invoices.Count
            };
        }
    }
}

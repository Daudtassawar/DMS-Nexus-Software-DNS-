using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class DistributorRepository : IDistributorRepository
    {
        private readonly ApplicationDbContext _context;

        public DistributorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Distributor>> GetAllAsync()
        {
            return await _context.Distributors
                .OrderBy(d => d.Name)
                .ToListAsync();
        }

        public async Task<Distributor?> GetByIdAsync(int id)
        {
            return await _context.Distributors.FindAsync(id);
        }

        public async Task<Distributor> AddAsync(Distributor distributor)
        {
            _context.Distributors.Add(distributor);
            return distributor;
        }

        public void Update(Distributor distributor)
        {
            _context.Distributors.Update(distributor);
        }

        public void Delete(Distributor distributor)
        {
            _context.Distributors.Remove(distributor);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // ─── Analytics ─────────────────────────────────────────────────────

        public async Task<decimal> GetTotalSalesForDistributorAsync(int distributorId)
        {
            return await _context.InvoiceItems
                .Where(ii => ii.Product.DistributorId == distributorId)
                .SumAsync(ii => (decimal?)ii.TotalPrice) ?? 0;
        }

        public async Task<int> GetTotalStockForDistributorAsync(int distributorId)
        {
            return await _context.Stock
                .Where(s => s.Product.DistributorId == distributorId)
                .SumAsync(s => (int?)s.Quantity) ?? 0;
        }

        /// <summary>
        /// Returns per-product sales totals for this distributor (used for bar chart).
        /// </summary>
        public async Task<IEnumerable<object>> GetProductSalesBreakdownAsync(int distributorId)
        {
            return await _context.InvoiceItems
                .Where(ii => ii.Product.DistributorId == distributorId)
                .GroupBy(ii => new { ii.ProductId, ii.Product.ProductName })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    TotalSales = g.Sum(ii => ii.TotalPrice),
                    TotalUnitsSold = g.Sum(ii => ii.Quantity)
                })
                .OrderByDescending(x => x.TotalSales)
                .ToListAsync<object>();
        }

        /// <summary>
        /// Returns monthly invoice aggregates for past 6 months (used for line chart).
        /// </summary>
        public async Task<IEnumerable<object>> GetMonthlySalesTrendAsync(int distributorId)
        {
            return await _context.InvoiceItems
                .Where(ii => ii.Product.DistributorId == distributorId)
                .GroupBy(ii => new
                {
                    Year = ii.Invoice.InvoiceDate.Year,
                    Month = ii.Invoice.InvoiceDate.Month
                })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalSales = g.Sum(ii => ii.TotalPrice)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync<object>();
        }

        /// <summary>
        /// Returns per-product current stock for this distributor's products.
        /// </summary>
        public async Task<IEnumerable<object>> GetProductInventoryAsync(int distributorId)
        {
            return await _context.Stock
                .Where(s => s.Product.DistributorId == distributorId)
                .GroupBy(s => new { s.ProductId, s.Product.ProductName })
                .Select(g => new
                {
                    ProductName = g.Key.ProductName,
                    TotalStock = g.Sum(s => s.Quantity),
                    WarehouseCount = g.Select(s => s.WarehouseLocation).Distinct().Count()
                })
                .ToListAsync<object>();
        }
        /// <summary>
        /// Nulls out DistributorId on all linked products so they can be safely removed.
        /// </summary>
        public async Task UnlinkProductsAsync(int distributorId)
        {
            var linkedProducts = await _context.Products
                .Where(p => p.DistributorId == distributorId)
                .ToListAsync();

            foreach (var product in linkedProducts)
                product.DistributorId = null;

            await _context.SaveChangesAsync();
        }
    }
}

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchAsync(string? search, string? category)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lower = search.ToLower();
                query = query.Where(p =>
                    p.ProductName.ToLower().Contains(lower) ||
                    (p.Brand != null && p.Brand.ToLower().Contains(lower)) ||
                    (p.Barcode != null && p.Barcode.ToLower().Contains(lower)));
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "All")
            {
                query = query.Where(p => p.Category == category);
            }

            return await query.OrderByDescending(p => p.CreatedDate).ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task<Product?> GetByBarcodeAsync(string barcode)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.Barcode == barcode);
        }

        public async Task<Product> AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            return product;
        }

        public async Task BulkAddAsync(IEnumerable<Product> products)
        {
            await _context.Products.AddRangeAsync(products);
        }

        public void Update(Product product)
        {
            _context.Products.Update(product);
        }

        public void Delete(Product product)
        {
            _context.Products.Remove(product);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;

namespace DMS.Application.Services
{
    public class ProductService
    {
        private readonly IProductRepository _repo;

        public ProductService(IProductRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
            => await _repo.GetAllAsync();

        public async Task<IEnumerable<Product>> SearchProductsAsync(string? search, string? category)
            => await _repo.SearchAsync(search, category);

        public async Task<Product?> GetProductByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<(bool Success, string Message, Product? Product)> CreateProductAsync(Product product)
        {
            // Validate duplicate barcode
            if (!string.IsNullOrEmpty(product.Barcode))
            {
                var existing = await _repo.GetByBarcodeAsync(product.Barcode);
                if (existing != null)
                    return (false, $"A product with barcode '{product.Barcode}' already exists.", null);
            }

            product.CreatedDate = DateTime.UtcNow;
            await _repo.AddAsync(product);
            await _repo.SaveChangesAsync();
            return (true, "Product created.", product);
        }

        public async Task<(bool Success, string Message)> UpdateProductAsync(Product product)
        {
            // Check barcode uniqueness on update (skip same product)
            if (!string.IsNullOrEmpty(product.Barcode))
            {
                var existing = await _repo.GetByBarcodeAsync(product.Barcode);
                if (existing != null && existing.ProductId != product.ProductId)
                    return (false, $"Another product already has barcode '{product.Barcode}'.");
            }

            _repo.Update(product);
            await _repo.SaveChangesAsync();
            return (true, "Product updated.");
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product != null)
            {
                _repo.Delete(product);
                await _repo.SaveChangesAsync();
            }
        }

        public async Task<(int Imported, int Skipped, List<string> Errors)> BulkImportAsync(IEnumerable<Product> products)
        {
            int imported = 0, skipped = 0;
            var errors = new List<string>();

            foreach (var product in products)
            {
                try
                {
                    if (!string.IsNullOrEmpty(product.Barcode))
                    {
                        var existing = await _repo.GetByBarcodeAsync(product.Barcode);
                        if (existing != null)
                        {
                            skipped++;
                            errors.Add($"Skipped '{product.ProductName}': barcode already exists.");
                            continue;
                        }
                    }
                    product.CreatedDate = DateTime.UtcNow;
                    await _repo.AddAsync(product);
                    imported++;
                }
                catch (Exception ex)
                {
                    errors.Add($"Error importing '{product.ProductName}': {ex.Message}");
                    skipped++;
                }
            }

            await _repo.SaveChangesAsync();
            return (imported, skipped, errors);
        }
    }
}

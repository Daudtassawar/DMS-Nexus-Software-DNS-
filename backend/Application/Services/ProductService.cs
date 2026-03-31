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
            var existing = await _repo.GetByIdAsync(product.ProductId);
            if (existing == null) return (false, "Product not found.");

            // Check barcode uniqueness on update (skip same product)
            if (!string.IsNullOrEmpty(product.Barcode))
            {
                var barcodeOwner = await _repo.GetByBarcodeAsync(product.Barcode);
                if (barcodeOwner != null && barcodeOwner.ProductId != product.ProductId)
                    return (false, $"Another product already has barcode '{product.Barcode}'.");
            }

            // Update only mutable fields
            existing.ProductName = product.ProductName;
            existing.Brand = product.Brand;
            existing.Category = product.Category;
            existing.Barcode = product.Barcode;
            existing.PurchasePrice = product.PurchasePrice;
            existing.SalePrice = product.SalePrice;
            existing.Unit = product.Unit;
            existing.MinStockLevel = product.MinStockLevel;
            existing.ExpiryDate = product.ExpiryDate;
            existing.DistributorId = product.DistributorId;

            _repo.Update(existing);
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
            var seenBarcodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var product in products)
            {
                try
                {
                    if (!string.IsNullOrEmpty(product.Barcode))
                    {
                        if (seenBarcodes.Contains(product.Barcode))
                        {
                            skipped++;
                            errors.Add($"Skipped '{product.ProductName}': barcode duplicated in CSV file.");
                            continue;
                        }

                        var existing = await _repo.GetByBarcodeAsync(product.Barcode);
                        if (existing != null)
                        {
                            skipped++;
                            errors.Add($"Skipped '{product.ProductName}': barcode already exists.");
                            continue;
                        }

                        seenBarcodes.Add(product.Barcode);
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

            try 
            {
                await _repo.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                errors.Add($"Database commit failed: {ex.Message}");
                return (0, products.Count(), errors);
            }
            
            return (imported, skipped, errors);
        }
    }
}

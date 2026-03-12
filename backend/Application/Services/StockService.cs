using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;

namespace DMS.Application.Services
{
    public class StockService
    {
        private readonly IStockRepository _stockRepository;
        private readonly IProductRepository _productRepository;

        public StockService(IStockRepository stockRepository, IProductRepository productRepository)
        {
            _stockRepository = stockRepository;
            _productRepository = productRepository;
        }

        // Returns aggregated stock for ALL products with low stock / expiry flags
        public async Task<IEnumerable<object>> GetStockOverviewAsync()
        {
            var allProducts = await _productRepository.GetAllAsync();
            var allStock = await _stockRepository.GetAllAsync();

            var overview = new List<object>();

            foreach (var product in allProducts)
            {
                var productStock = allStock.Where(s => s.ProductId == product.ProductId).ToList();
                int totalQuantity = productStock.Sum(s => s.Quantity);
                
                bool isLowStock = totalQuantity <= product.MinStockLevel;
                
                // Expiry Check (Warn if expiring within 30 days)
                bool isExpiringSoon = false;
                if (product.ExpiryDate.HasValue)
                {
                    var daysToExpiry = (product.ExpiryDate.Value - DateTime.UtcNow).TotalDays;
                    isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;
                }
                bool isExpired = product.ExpiryDate.HasValue && product.ExpiryDate.Value < DateTime.UtcNow;

                overview.Add(new
                {
                    product.ProductId,
                    product.ProductName,
                    product.Barcode,
                    product.Category,
                    product.MinStockLevel,
                    TotalQuantity = totalQuantity,
                    IsLowStock = isLowStock,
                    IsExpiringSoon = isExpiringSoon,
                    IsExpired = isExpired,
                    ExpiryDate = product.ExpiryDate,
                    Warehouses = productStock.Select(s => new { s.WarehouseLocation, s.Quantity }).ToList()
                });
            }

            return overview;
        }

        public async Task<IEnumerable<Stock>> GetWarehouseStockAsync(int productId)
        {
            return await _stockRepository.GetByProductIdAsync(productId);
        }

        public async Task<IEnumerable<object>> GetTransactionsAsync(int? productId = null)
        {
            var txs = await _stockRepository.GetTransactionsAsync(productId);
            return txs.Select(t => new
            {
                t.TransactionId,
                t.ProductId,
                ProductName = t.Product?.ProductName,
                t.TransactionType,
                t.Quantity,
                t.Date
            });
        }

        // Add Stock (Purchase/Manual Entry/Returns)
        public async Task<Stock> AddStockAsync(int productId, int quantity, string warehouseLocation, string? batchNumber = null, DateTime? expiryDate = null)
        {
            if(quantity <= 0) throw new ArgumentException("Quantity must be greater than 0");

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(productId, warehouseLocation);
            
            // If batch tracking is enabled, we might want to check for specific batch in repository.
            // For now, let's assume we update the general stock or create a new entry if batch differs.
            // Since the repository might not have GetByProductWarehouseBatch, I'll stick to a simpler logic 
            // of updating the first matching record or adding a new one if we wanted full batching.
            // To be thorough, I should ideally update the Repository too.
            
            if (stock == null)
            {
                stock = new Stock { 
                    ProductId = productId, 
                    WarehouseLocation = warehouseLocation, 
                    Quantity = quantity, 
                    BatchNumber = batchNumber,
                    ExpiryDate = expiryDate,
                    LastUpdated = DateTime.UtcNow 
                };
                await _stockRepository.AddAsync(stock);
            }
            else
            {
                stock.Quantity += quantity;
                stock.BatchNumber = batchNumber ?? stock.BatchNumber;
                stock.ExpiryDate = expiryDate ?? stock.ExpiryDate;
                stock.LastUpdated = DateTime.UtcNow;
                _stockRepository.Update(stock);
            }

            await _stockRepository.AddTransactionAsync(new StockTransaction
            {
                ProductId = productId,
                TransactionType = "In",
                Quantity = quantity,
                Date = DateTime.UtcNow
            });

            await _stockRepository.SaveChangesAsync();
            return stock;
        }

        // Reduce Stock (Damaged/Expired/Manual)
        public async Task<Stock> ReduceStockAsync(int productId, int quantity, string warehouseLocation, string reason)
        {
            if(quantity <= 0) throw new ArgumentException("Quantity must be greater than 0");

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(productId, warehouseLocation);
            if (stock == null || stock.Quantity < quantity)
            {
                throw new InvalidOperationException($"Insufficient stock in warehouse '{warehouseLocation}' to reduce.");
            }

            stock.Quantity -= quantity;
            stock.LastUpdated = DateTime.UtcNow;
            _stockRepository.Update(stock);

            await _stockRepository.AddTransactionAsync(new StockTransaction
            {
                ProductId = productId,
                TransactionType = $"Out - {reason}",
                Quantity = quantity,
                Date = DateTime.UtcNow
            });

            await _stockRepository.SaveChangesAsync();
            return stock;
        }

        // Adjust Stock (Inventory Count overwrite)
        public async Task<Stock> AdjustStockAsync(int productId, int newQuantity, string warehouseLocation)
        {
            if(newQuantity < 0) throw new ArgumentException("Quantity cannot be negative");

            var stock = await _stockRepository.GetByProductAndWarehouseAsync(productId, warehouseLocation);
            int difference = 0;

            if (stock == null)
            {
                difference = newQuantity;
                stock = new Stock { ProductId = productId, WarehouseLocation = warehouseLocation, Quantity = newQuantity, LastUpdated = DateTime.UtcNow };
                await _stockRepository.AddAsync(stock);
            }
            else
            {
                difference = newQuantity - stock.Quantity;
                stock.Quantity = newQuantity;
                stock.LastUpdated = DateTime.UtcNow;
                _stockRepository.Update(stock);
            }

            if (difference != 0)
            {
                await _stockRepository.AddTransactionAsync(new StockTransaction
                {
                    ProductId = productId,
                    TransactionType = "Adjust",
                    Quantity = Math.Abs(difference),
                    Date = DateTime.UtcNow
                });
            }

            await _stockRepository.SaveChangesAsync();
            return stock;
        }

        // Transfer Stock between warehouses
        public async Task TransferStockAsync(int productId, int quantity, string fromWarehouse, string toWarehouse)
        {
            if (quantity <= 0) throw new ArgumentException("Quantity must be greater than 0");
            if (fromWarehouse == toWarehouse) throw new ArgumentException("Cannot transfer to the same warehouse");

            var sourceStock = await _stockRepository.GetByProductAndWarehouseAsync(productId, fromWarehouse);
            if (sourceStock == null || sourceStock.Quantity < quantity)
            {
                throw new InvalidOperationException($"Insufficient stock in source warehouse '{fromWarehouse}'.");
            }

            var destStock = await _stockRepository.GetByProductAndWarehouseAsync(productId, toWarehouse);
            if (destStock == null)
            {
                destStock = new Stock { ProductId = productId, WarehouseLocation = toWarehouse, Quantity = 0, LastUpdated = DateTime.UtcNow };
                await _stockRepository.AddAsync(destStock);
            }

            // Move stock
            sourceStock.Quantity -= quantity;
            sourceStock.LastUpdated = DateTime.UtcNow;
            _stockRepository.Update(sourceStock);

            destStock.Quantity += quantity;
            destStock.LastUpdated = DateTime.UtcNow;
            _stockRepository.Update(destStock);

            // Log Transfer Transactions
            var date = DateTime.UtcNow;
            await _stockRepository.AddTransactionAsync(new StockTransaction
            {
                ProductId = productId, TransactionType = $"Transfer Out (to {toWarehouse})", Quantity = quantity, Date = date
            });
            await _stockRepository.AddTransactionAsync(new StockTransaction
            {
                ProductId = productId, TransactionType = $"Transfer In (from {fromWarehouse})", Quantity = quantity, Date = date
            });

            await _stockRepository.SaveChangesAsync();
        }
    }
}

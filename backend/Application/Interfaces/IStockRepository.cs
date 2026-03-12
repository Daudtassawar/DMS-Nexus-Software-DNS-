using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IStockRepository
    {
        Task<IEnumerable<Stock>> GetAllAsync();
        // Gets all stock locations for a specific product
        Task<IEnumerable<Stock>> GetByProductIdAsync(int productId);
        // Gets stock for a specific product at a specific warehouse
        Task<Stock?> GetByProductAndWarehouseAsync(int productId, string warehouseLocation);
        // Gets aggregate stock total across all warehouses for a product
        Task<int> GetTotalStockByProductIdAsync(int productId);
        
        Task<Stock> AddAsync(Stock stock);
        void Update(Stock stock);
        
        // Stock Transactions
        Task<StockTransaction> AddTransactionAsync(StockTransaction transaction);
        Task<IEnumerable<StockTransaction>> GetTransactionsAsync(int? productId = null);
        
        Task SaveChangesAsync();
    }
}

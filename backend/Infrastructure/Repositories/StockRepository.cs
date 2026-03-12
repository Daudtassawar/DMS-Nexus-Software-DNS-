using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class StockRepository : IStockRepository
    {
        private readonly ApplicationDbContext _context;

        public StockRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Stock>> GetAllAsync()
        {
            return await _context.Stock
                .Include(s => s.Product)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stock>> GetByProductIdAsync(int productId)
        {
            return await _context.Stock
                .Include(s => s.Product)
                .Where(s => s.ProductId == productId)
                .ToListAsync();
        }

        public async Task<Stock?> GetByProductAndWarehouseAsync(int productId, string warehouseLocation)
        {
            return await _context.Stock
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.ProductId == productId && s.WarehouseLocation == warehouseLocation);
        }

        public async Task<int> GetTotalStockByProductIdAsync(int productId)
        {
            return await _context.Stock
                .Where(s => s.ProductId == productId)
                .SumAsync(s => s.Quantity);
        }

        public async Task<Stock> AddAsync(Stock stock)
        {
            await _context.Stock.AddAsync(stock);
            return stock;
        }

        public void Update(Stock stock)
        {
            _context.Stock.Update(stock);
        }

        public async Task<StockTransaction> AddTransactionAsync(StockTransaction transaction)
        {
            await _context.StockTransactions.AddAsync(transaction);
            return transaction;
        }

        public async Task<IEnumerable<StockTransaction>> GetTransactionsAsync(int? productId = null)
        {
            var query = _context.StockTransactions.Include(st => st.Product).AsQueryable();
            
            if (productId.HasValue)
            {
                query = query.Where(st => st.ProductId == productId.Value);
            }
            
            return await query
                .OrderByDescending(st => st.Date)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

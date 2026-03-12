using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<IEnumerable<Product>> SearchAsync(string? search, string? category);
        Task<Product?> GetByIdAsync(int id);
        Task<Product?> GetByBarcodeAsync(string barcode);
        Task<Product> AddAsync(Product product);
        Task BulkAddAsync(IEnumerable<Product> products);
        void Update(Product product);
        void Delete(Product product);
        Task SaveChangesAsync();
    }
}

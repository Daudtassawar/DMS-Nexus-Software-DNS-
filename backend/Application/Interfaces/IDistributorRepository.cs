using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IDistributorRepository
    {
        Task<IEnumerable<Distributor>> GetAllAsync();
        Task<Distributor?> GetByIdAsync(int id);
        Task<Distributor> AddAsync(Distributor distributor);
        void Update(Distributor distributor);
        void Delete(Distributor distributor);
        Task SaveChangesAsync();

        // Analytics
        Task<decimal> GetTotalSalesForDistributorAsync(int distributorId);
        Task<int> GetTotalStockForDistributorAsync(int distributorId);
        Task<IEnumerable<object>> GetProductSalesBreakdownAsync(int distributorId);
        Task<IEnumerable<object>> GetMonthlySalesTrendAsync(int distributorId);
        Task<IEnumerable<object>> GetProductInventoryAsync(int distributorId);
        Task UnlinkProductsAsync(int distributorId);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IDistributorService
    {
        Task<IEnumerable<Distributor>> GetAllDistributorsAsync();
        Task<Distributor?> GetDistributorByIdAsync(int id);
        Task<Distributor> CreateDistributorAsync(Distributor distributor);
        Task<Distributor?> UpdateDistributorAsync(int id, Distributor updatedDistributor);
        Task<bool> DeleteDistributorAsync(int id);
        
        // Analytics
        Task<object> GetDistributorPerformanceAsync(int id);
    }
}

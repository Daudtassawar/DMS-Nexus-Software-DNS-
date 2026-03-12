using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface ISalesmanService
    {
        Task<IEnumerable<Salesman>> GetAllSalesmenAsync();
        Task<Salesman?> GetSalesmanByIdAsync(int id);
        Task<Salesman> CreateSalesmanAsync(Salesman salesman);
        Task UpdateSalesmanAsync(Salesman salesman);
        Task DeleteSalesmanAsync(int id);
        
        // Performance Tracking
        Task<object> GetSalesmanPerformanceAsync(int salesmanId, int year, int month);
        Task AssignCustomersAsync(int salesmanId, List<int> customerIds);
    }
}

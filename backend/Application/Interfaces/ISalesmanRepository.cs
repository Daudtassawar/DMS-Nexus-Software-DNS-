using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface ISalesmanRepository
    {
        Task<Salesman?> GetByIdAsync(int id);
        Task<IEnumerable<Salesman>> GetAllAsync();
        Task<Salesman> AddAsync(Salesman salesman);
        Task UpdateAsync(Salesman salesman);
        Task DeleteAsync(int id);
    }
}

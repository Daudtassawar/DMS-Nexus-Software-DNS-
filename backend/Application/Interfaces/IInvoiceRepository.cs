using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<IEnumerable<Invoice>> GetAllAsync(int? routeId = null, int? salesmanId = null);
        Task<Invoice?> GetByIdAsync(int id);
        Task<Invoice> AddAsync(Invoice invoice);
        void Update(Invoice invoice);
        void Delete(Invoice invoice);
        Task SaveChangesAsync();
    }
}

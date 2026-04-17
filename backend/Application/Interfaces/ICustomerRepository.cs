using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface ICustomerRepository
    {
        Task<IEnumerable<Customer>> GetAllAsync(int? routeId = null, int? salesmanId = null);
        Task<Customer?> GetByIdAsync(int id);
        Task<Customer?> GetByIdWithHistoryAsync(int id);      // includes invoices + payments
        Task<Customer?> GetByDetailsAsync(string name, string phone, string? area);
        Task<IEnumerable<Customer>> SearchAsync(string query, int? routeId = null, int? salesmanId = null);
        Task<Customer> AddAsync(Customer customer);
        void Update(Customer customer);
        void Delete(Customer customer);
        Task SaveChangesAsync();
    }
}

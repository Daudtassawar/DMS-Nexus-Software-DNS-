using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Application.DTOs;

namespace DMS.Application.Interfaces
{
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyDTO>> GetAllCompaniesAsync();
        Task<CompanyDTO?> GetCompanyByIdAsync(int id);
        Task<CompanyDTO> CreateCompanyAsync(CompanyDTO companyDto);
        Task UpdateCompanyAsync(int id, CompanyDTO companyDto);
        Task DeleteCompanyAsync(int id);
    }
}

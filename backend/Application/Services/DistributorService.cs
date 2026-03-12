using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;

namespace DMS.Application.Services
{
    public class DistributorService : IDistributorService
    {
        private readonly IDistributorRepository _distributorRepository;

        public DistributorService(IDistributorRepository distributorRepository)
        {
            _distributorRepository = distributorRepository;
        }

        public async Task<IEnumerable<Distributor>> GetAllDistributorsAsync()
        {
            return await _distributorRepository.GetAllAsync();
        }

        public async Task<Distributor?> GetDistributorByIdAsync(int id)
        {
            return await _distributorRepository.GetByIdAsync(id);
        }

        public async Task<Distributor> CreateDistributorAsync(Distributor distributor)
        {
            var created = await _distributorRepository.AddAsync(distributor);
            await _distributorRepository.SaveChangesAsync();
            return created;
        }

        public async Task<Distributor?> UpdateDistributorAsync(int id, Distributor updatedDistributor)
        {
            var existing = await _distributorRepository.GetByIdAsync(id);
            if (existing == null) return null;

            existing.Name = updatedDistributor.Name;
            existing.Region = updatedDistributor.Region;
            existing.Contact = updatedDistributor.Contact;

            _distributorRepository.Update(existing);
            await _distributorRepository.SaveChangesAsync();

            return existing;
        }

        public async Task<bool> DeleteDistributorAsync(int id)
        {
            var existing = await _distributorRepository.GetByIdAsync(id);
            if (existing == null) return false;

            // First unlink all products so the FK constraint isn't violated
            await _distributorRepository.UnlinkProductsAsync(id);

            _distributorRepository.Delete(existing);
            await _distributorRepository.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetDistributorPerformanceAsync(int id)
        {
            var distributor = await _distributorRepository.GetByIdAsync(id);
            if (distributor == null) throw new InvalidOperationException("Distributor not found");

            decimal totalSales = await _distributorRepository.GetTotalSalesForDistributorAsync(id);
            int totalInventory = await _distributorRepository.GetTotalStockForDistributorAsync(id);
            var productSales = await _distributorRepository.GetProductSalesBreakdownAsync(id);
            var monthlySales = await _distributorRepository.GetMonthlySalesTrendAsync(id);
            var inventory = await _distributorRepository.GetProductInventoryAsync(id);

            return new
            {
                DistributorId = distributor.DistributorId,
                Name = distributor.Name,
                Region = distributor.Region,
                Contact = distributor.Contact,
                TotalSalesGenerated = totalSales,
                CurrentInventoryStock = totalInventory,
                ProductSalesBreakdown = productSales,
                MonthlySalesTrend = monthlySales,
                InventoryBreakdown = inventory
            };
        }
    }
}

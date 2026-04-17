using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DMS.Infrastructure.Data;
using DMS.Domain.Entities;
using DMS.Application.DTOs;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class SystemSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SystemSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.SystemSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                // Fallback to default if not seeded
                settings = new SystemSetting
                {
                    CompanyName = "Hamdaan Traders",
                    PhoneNumber = "+92 300 8843939",
                    Address = "Sillanwali, Sargodha Road, Sargodha, Pakistan"
                };
            }

            var dto = new SystemSettingDTO
            {
                Id = settings.Id,
                CompanyName = settings.CompanyName,
                Address = settings.Address,
                PhoneNumber = settings.PhoneNumber,
                Email = settings.Email,
                Website = settings.Website,
                LogoPath = settings.LogoPath,
                LastUpdated = settings.LastUpdated
            };

            return Ok(dto);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSettings([FromBody] SystemSettingDTO dto)
        {
            var settings = await _context.SystemSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SystemSetting();
                _context.SystemSettings.Add(settings);
            }

            settings.CompanyName = dto.CompanyName;
            settings.Address = dto.Address;
            settings.PhoneNumber = dto.PhoneNumber;
            settings.Email = dto.Email;
            settings.Website = dto.Website;
            settings.LogoPath = dto.LogoPath;
            settings.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "System settings updated successfully" });
        }
    }
}

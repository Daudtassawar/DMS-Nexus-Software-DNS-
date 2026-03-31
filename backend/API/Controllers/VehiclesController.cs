using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public VehiclesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetAll()
            => Ok(await _db.Vehicles.OrderBy(v => v.VehicleNumber).ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Vehicle>> Get(int id)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();
            return Ok(vehicle);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Vehicle>> Create([FromBody] Vehicle vehicle)
        {
            _db.Vehicles.Add(vehicle);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = vehicle.VehicleId }, vehicle);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> Update(int id, [FromBody] Vehicle vehicle)
        {
            var existing = await _db.Vehicles.FindAsync(id);
            if (existing == null) return NotFound();

            existing.VehicleNumber = vehicle.VehicleNumber;
            existing.DriverName = vehicle.DriverName;
            existing.DriverPhone = vehicle.DriverPhone;
            existing.VehicleType = vehicle.VehicleType;
            existing.IsActive = vehicle.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> Delete(int id)
        {
            var vehicle = await _db.Vehicles.FindAsync(id);
            if (vehicle == null) return NotFound();
            _db.Vehicles.Remove(vehicle);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

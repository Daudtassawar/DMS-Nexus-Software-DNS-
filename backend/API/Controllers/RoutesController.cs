using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Route = DMS.Domain.Entities.Route;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class RoutesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public RoutesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Route>>> GetAll()
            => Ok(await _db.Routes.OrderBy(r => r.RouteName).ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Route>> Get(int id)
        {
            var route = await _db.Routes.FindAsync(id);
            if (route == null) return NotFound();
            return Ok(route);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<Route>> Create([FromBody] Route route)
        {
            _db.Routes.Add(route);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = route.RouteId }, route);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> Update(int id, [FromBody] Route route)
        {
            var existing = await _db.Routes.FindAsync(id);
            if (existing == null) return NotFound();

            existing.RouteName = route.RouteName;
            existing.Area = route.Area;
            existing.Description = route.Description;
            existing.IsActive = route.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> Delete(int id)
        {
            var route = await _db.Routes.FindAsync(id);
            if (route == null) return NotFound();
            _db.Routes.Remove(route);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

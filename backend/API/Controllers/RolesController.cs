using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [RequirePermission("Users.View")] // Usually only admins/managers can access roles
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public RolesController(RoleManager<AppRole> roleManager, ApplicationDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }

        // GET: api/v1/roles
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var result = new List<object>();

            foreach (var role in roles)
            {
                var permissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .Select(rp => rp.Permission)
                    .ToListAsync();
                
                result.Add(new
                {
                    role.Id,
                    role.Name,
                    role.Description,
                    Permissions = permissions.Select(p => p.Id).ToList()
                });
            }

            return Ok(result);
        }

        // GET: api/v1/roles/permissions
        [HttpGet("permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            var permissions = await _context.Permissions.ToListAsync();
            return Ok(permissions);
        }

        // POST: api/v1/roles
        [HttpPost]
        [RequirePermission("Users.Create")] // Same permission scope as creating users
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto req)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { Message = "Role name is required." });

            if (await _roleManager.RoleExistsAsync(req.Name))
                return BadRequest(new { Message = "Role already exists." });

            var role = new AppRole
            {
                Name = req.Name,
                Description = req.Description
            };

            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { Message = "Failed to create role." });

            // Assign permissions
            if (req.Permissions != null && req.Permissions.Any())
            {
                foreach (var permId in req.Permissions)
                {
                    _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId });
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Role created successfully." });
        }

        // PUT: api/v1/roles/{id}
        [HttpPut("{id}")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateRoleDto req)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null) return NotFound(new { Message = "Role not found." });

            if (role.Name == "Admin" && req.Name != "Admin")
                return BadRequest(new { Message = "Cannot rename the core Admin role." });

            role.Name = req.Name;
            role.Description = req.Description;
            var result = await _roleManager.UpdateAsync(role);
            
            if (!result.Succeeded) return BadRequest(new { Message = "Failed to update role." });

            // Update Permissions
            if (req.Permissions != null)
            {
                // Remove existing
                var existingPerms = _context.RolePermissions.Where(rp => rp.RoleId == id);
                _context.RolePermissions.RemoveRange(existingPerms);
                
                // Add new
                foreach (var permId in req.Permissions)
                {
                    _context.RolePermissions.Add(new RolePermission { RoleId = id, PermissionId = permId });
                }
                
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Role updated successfully." });
        }

        // DELETE: api/v1/roles/{id}
        [HttpDelete("{id}")]
        [RequirePermission("Users.Delete")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null) return NotFound(new { Message = "Role not found." });

            if (role.Name == "Admin" || role.Name == "Manager" || role.Name == "Salesman")
                return BadRequest(new { Message = "Cannot delete core system roles." });

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded) return BadRequest(new { Message = "Failed to delete role." });

            return Ok(new { Message = "Role deleted successfully." });
        }
    }

    public class CreateRoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }

    public class UpdateRoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }
}

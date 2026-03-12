using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;
using DMS.Application.Interfaces;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize] // Added to require authentication globally on this controller
    public class UsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IAuditLogService _auditLogService;

        public UsersController(UserManager<AppUser> userManager, IAuditLogService auditLogService)
        {
            _userManager = userManager;
            _auditLogService = auditLogService;
        }

        [HttpPost("create")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            // Check username uniqueness
            var userByName = await _userManager.FindByNameAsync(request.Username);
            if (userByName != null)
                return BadRequest(new { Message = $"The username '{request.Username}' is already taken by another user." });

            // Check email uniqueness only if email is provided
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var userByEmail = await _userManager.FindByEmailAsync(request.Email);
                if (userByEmail != null)
                    return BadRequest(new { Message = $"The email '{request.Email}' is already registered to another user." });
            }

            var roleToAssign = string.IsNullOrEmpty(request.Role) ? "Salesman" : request.Role;

            var user = new AppUser
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Role = roleToAssign,
                Status = "Approved",
                ApprovedBy = User.Identity?.Name,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { Message = $"Action failed. {errors}" });
            }

            await _userManager.AddToRoleAsync(user, roleToAssign);

            var currentUserId = User.Identity?.Name ?? "System";
            await _auditLogService.LogActionAsync(currentUserId, $"User creation: {request.Username} with role {roleToAssign}", HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { Message = "User created successfully." });
        }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Salesman";
    }
}

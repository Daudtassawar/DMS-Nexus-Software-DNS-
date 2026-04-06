using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using DMS.Domain.Entities;
using DMS.Application.Interfaces;
using DMS.Infrastructure.Data;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public AuthController(
            UserManager<AppUser> userManager, 
            SignInManager<AppUser> signInManager, 
            IConfiguration configuration,
            IEmailService emailService,
            ApplicationDbContext context,
            IAuditLogService auditLogService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _context = context;
            _auditLogService = auditLogService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Login via Username OR Email
            var user = await _userManager.FindByNameAsync(request.Username) ?? 
                       await _userManager.FindByEmailAsync(request.Username);
                       
            if (user == null) return Unauthorized(new { Message = "Invalid username/email or password" });

            if (!user.IsActive)
            {
                await LogActivity(user.Id, "Failed - Account Disabled");
                return Unauthorized(new { Message = "Your account has been disabled. Please contact the administrator." });
            }
            
            if (user.Status != "Approved")
            {
                await LogActivity(user.Id, "Failed - Account Pending Approval");
                return Unauthorized(new { Message = "Your account is awaiting admin approval." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                await LogActivity(user.Id, "Failed Login Attempt");
                return Unauthorized(new { Message = "Invalid username/email or password" });
            }

            await LogActivity(user.Id, "Login Success");
            await _auditLogService.LogActionAsync(user.Id, "User login", HttpContext.Connection.RemoteIpAddress?.ToString());

            var roles = await _userManager.GetRolesAsync(user);
            var userRole = roles.Count > 0 ? roles[0] : "None";

            // Fetch RBAC Permissions for the role
            List<string> permissions = new List<string>();
            if (userRole != "None")
            {
                var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Name == userRole);
                if (roleEntity != null)
                {
                    permissions = await _context.RolePermissions
                        .Where(rp => rp.RoleId == roleEntity.Id)
                        .Select(rp => rp.PermissionId)
                        .ToListAsync();
                }
            }

            var token = GenerateJwtToken(user, userRole, permissions);

            return Ok(new 
            { 
                Token = token, 
                User = new { 
                    user.Id, 
                    user.UserName, 
                    user.FullName, 
                    user.Email,
                    Role = userRole,
                    user.EmployeeId,
                    user.RouteId,
                    user.SalesmanId
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUsername = await _userManager.FindByNameAsync(request.Username);
            if (existingUsername != null)
                return BadRequest(new { Message = $"The username '{request.Username}' is already taken. Please choose another one." });
                
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var existingEmail = await _userManager.FindByEmailAsync(request.Email);
                if (existingEmail != null)
                    return BadRequest(new { Message = $"The email '{request.Email}' is already registered to another account." });
            }
            
            // SECURITY FIX: Ignore request.Role for public registration. Always default to Salesman.
            var roleToAssign = "Salesman";

            var user = new AppUser
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Role = roleToAssign,
                Status = "Pending",
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { Message = $"Registration failed. Please try again: {errors}" });
            }

            await _userManager.AddToRoleAsync(user, roleToAssign);

            return Ok(new { Message = "Registration successful. Account awaiting admin approval." });
        }

        [HttpPost("invite")]
        [RequirePermission("Users.Edit")] // Ensure only Admin/authorized users can invite
        public async Task<IActionResult> Invite([FromBody] InviteUserRequest request)
        {
            var userExists = await _userManager.FindByNameAsync(request.Username) ?? await _userManager.FindByEmailAsync(request.Email);
            if (userExists != null)
                return BadRequest(new { Message = "User with this username or email already exists!" });

            string token = Guid.NewGuid().ToString("N");

            AppUser user = new AppUser
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role,
                Status = "Pending",
                InvitationToken = token,
                InvitationExpiry = DateTime.UtcNow.AddHours(24),
                IsActive = true
            };

            // We create the user with a temporary random password, they will set their actual password later
            var tempPassword = Guid.NewGuid().ToString() + "A1!";
            var result = await _userManager.CreateAsync(user, tempPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { Message = $"User invitation failed: {errors}" });
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                await _userManager.AddToRoleAsync(user, request.Role);
            }

            // In a real application, send the invitation email here
            var inviteLink = $"/set-password?token={token}";

            return Ok(new 
            { 
                Message = "User invited successfully. They must set their password and be approved to log in.",
                InviteLink = inviteLink, // For testing/display purposes
                Token = token
            });
        }

        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest request)
        {
            if (request.Password != request.ConfirmPassword)
                return BadRequest(new { Message = "Passwords do not match." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.InvitationToken == request.Token);
            if (user == null)
                return BadRequest(new { Message = "Invalid or expired invitation token." });

            if (user.InvitationExpiry < DateTime.UtcNow)
                return BadRequest(new { Message = "Invitation token has expired." });

            // Generate reset token string to forcibly change the password bypassing current one
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { Message = $"Failed to set password: {errors}" });
            }

            user.InvitationToken = null;
            user.InvitationExpiry = null;
            
            // Status remains Pending Approval
            await _userManager.UpdateAsync(user);

            return Ok(new { Message = "Password set successfully. Account is pending admin approval." });
        }

        [HttpPost("{username}/approve")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> ApproveUser(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = "User not found." });

            if (user.Status == "Approved")
                return BadRequest(new { Message = "User is already approved." });

            user.Status = "Approved";
            user.ApprovedBy = User.Identity?.Name;
            await _userManager.UpdateAsync(user);

            return Ok(new { Message = $"User '{username}' has been approved." });
        }

        [HttpPost("{username}/reject")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> RejectUser(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = "User not found." });

            if (user.Status == "Rejected")
                return BadRequest(new { Message = "User is already rejected." });

            user.Status = "Rejected";
            await _userManager.UpdateAsync(user);

            return Ok(new { Message = $"User '{username}' has been rejected." });
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail(string userId, string token)
        {
            if (userId == null || token == null)
            {
                return BadRequest("Invalid email confirmation url");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{userId}'.");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded)
            {
                return BadRequest("Error confirming your email.");
            }

            return Ok("Thank you for confirming your email.");
        }

        [HttpDelete("{username}")]
        [RequirePermission("Users.Delete")]
        public async Task<IActionResult> DeleteUser(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound(new { Message = $"User '{username}' not found." });
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { Message = $"Could not delete user: {errors}" });
            }

            return Ok(new { Message = $"User '{username}' deleted successfully." });
        }

        [HttpGet("users")]
        [RequirePermission("Users.View")]
        public async Task<IActionResult> GetUsers()
        {
            var users = _userManager.Users.ToList();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FullName,
                    user.IsActive,
                    user.Status,
                    user.InvitationToken,
                    Role = roles.FirstOrDefault() ?? "None"
                });
            }

            return Ok(userList);
        }

        [HttpPut("{username}")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> UpdateUser(string username, [FromBody] UpdateUserRequest request)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = "User not found." });

            user.FullName = request.FullName;
            user.Email = request.Email;
            
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(new { Message = "Failed to update user." });
            
            return Ok(new { Message = "User updated successfully." });
        }

        [HttpPost("{username}/toggle-status")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> ToggleUserStatus(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = "User not found." });

            user.IsActive = !user.IsActive; // Flip the status
            await _userManager.UpdateAsync(user);
            
            string statusMsg = user.IsActive ? "Enabled" : "Disabled";
            return Ok(new { Message = $"User '{username}' is now {statusMsg}." });
        }

        [HttpPost("{username}/reset-password")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> ResetPassword(string username, [FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { Message = "New password cannot be empty." });

            if (request.NewPassword.Length < 8)
                return BadRequest(new { Message = "Password must be at least 8 characters long." });

            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = $"User '{username}' not found." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { Message = $"Password reset failed: {errors}" });
            }

            // Invalidate all existing sessions / JWTs for this user
            await _userManager.UpdateSecurityStampAsync(user);

            return Ok(new { Message = $"Password for '{username}' reset successfully. All existing sessions have been invalidated." });
        }

        [HttpPost("{username}/role")]
        [RequirePermission("Users.Edit")]
        public async Task<IActionResult> AssignRole(string username, [FromBody] AssignRoleRequest request)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = "User not found." });

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles); // Clear old roles
            
            var result = await _userManager.AddToRoleAsync(user, request.NewRole);
            if (!result.Succeeded) return BadRequest(new { Message = "Role assignment failed." });
            
            return Ok(new { Message = $"Role '{request.NewRole}' assigned to '{username}'." });
        }

        [HttpGet("{username}/activity")]
        public async Task<IActionResult> GetUserActivity(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound(new { Message = "User not found." });

            var logs = _context.UserActivityLogs
                .Where(u => u.UserId == user.Id)
                .OrderByDescending(u => u.LoginTime)
                .Take(50)
                .ToList();

            return Ok(logs);
        }

        private async Task LogActivity(string userId, string status)
        {
            try 
            {
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown IP";
                var log = new UserActivityLog
                {
                    UserId = userId,
                    LoginTime = DateTime.UtcNow,
                    IPAddress = ip,
                    Status = status
                };
                
                _context.UserActivityLogs.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to log user activity over UserId: {userId}. Reason: {ex.Message}");
            }
        }

        private string GenerateJwtToken(AppUser user, string role, List<string> permissions)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var keyString = jwtSettings["Key"] ?? "superSecretKey123!456@789#VeryLongSecret";
            var key = Encoding.ASCII.GetBytes(keyString);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Role, role),
                new Claim("Permissions", string.Join(",", permissions)) // Embed permissions
            };

            if (user.RouteId.HasValue)
                claims.Add(new Claim("RouteId", user.RouteId.Value.ToString()));
                
            if (user.SalesmanId.HasValue)
                claims.Add(new Claim("SalesmanId", user.SalesmanId.Value.ToString()));
                
            if (!string.IsNullOrEmpty(user.EmployeeId))
                claims.Add(new Claim("EmployeeId", user.EmployeeId));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class InviteUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "Salesman"; // Default role
    }

    public class SetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    public class AssignRoleRequest
    {
        public string NewRole { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Salesman";
    }
}

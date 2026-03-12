using System;
using Microsoft.AspNetCore.Identity;

namespace DMS.Domain.Entities
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        // Invitation & Approval workflow fields
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public string? ApprovedBy { get; set; }
        public string? InvitationToken { get; set; }
        public DateTime? InvitationExpiry { get; set; }
    }
}

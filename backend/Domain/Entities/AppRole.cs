using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace DMS.Domain.Entities
{
    public class AppRole : IdentityRole
    {
        public string Description { get; set; } = string.Empty;
        
        // Navigation property for Role-Permission mapping
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}

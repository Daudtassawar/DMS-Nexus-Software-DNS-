using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Permission
    {
        public string Id { get; set; } = string.Empty; // e.g., "Products.Create"
        public string Name { get; set; } = string.Empty; // e.g., "Create Products"
        public string Module { get; set; } = string.Empty; // e.g., "Products"
        public string Description { get; set; } = string.Empty; // e.g., "Allows creating new products"

        // Navigation property
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}

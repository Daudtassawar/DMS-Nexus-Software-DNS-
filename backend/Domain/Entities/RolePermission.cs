namespace DMS.Domain.Entities
{
    public class RolePermission
    {
        public string RoleId { get; set; } = string.Empty;
        public AppRole Role { get; set; } = null!;

        public string PermissionId { get; set; } = string.Empty;
        public Permission Permission { get; set; } = null!;
    }
}

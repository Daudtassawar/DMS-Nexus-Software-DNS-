using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Infrastructure.Authorization
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }
        public PermissionRequirement(string permission)
        {
            Permission = permission;
        }
    }

    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            if (context.User == null)
            {
                return Task.CompletedTask;
            }

            // Permissions are stored as claims in the JWT token
            var permissionsClaim = context.User.Claims.FirstOrDefault(c => c.Type == "Permissions");

            if (permissionsClaim != null && permissionsClaim.Value.Split(',').Contains(requirement.Permission))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}

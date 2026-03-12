using Microsoft.AspNetCore.Authorization;
using System;

namespace DMS.Infrastructure.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class RequirePermissionAttribute : AuthorizeAttribute
    {
        public RequirePermissionAttribute(string permission)
        {
            Permission = permission;
            Policy = $"RequirePermission_{permission}";
        }

        public string Permission { get; }
    }
}

using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.API.Middleware
{
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var method = context.Request.Method;
            
            // Only log mutations
            if (method == "POST" || method == "PUT" || method == "DELETE")
            {
                // We must copy the request body if we want to read it, because it's a stream
                context.Request.EnableBuffering();
                
                // Allow the request to proceed first, so we know if it succeeded
                await _next(context);

                // Only log if success
                if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
                {
                    try
                    {
                        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "ANONYMOUS";
                        var userName = context.User.Identity?.Name ?? "ANONYMOUS";
                        var path = context.Request.Path.ToString();
                        
                        // Extract Module and RecordId from path
                        var pathSegments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
                        var module = pathSegments.Length >= 2 ? pathSegments[1] : "System";
                        var recordId = pathSegments.Length >= 3 ? pathSegments[2] : null;

                        using (var scope = context.RequestServices.CreateScope())
                        {
                            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                            
                            var auditLog = new AuditLog
                            {
                                UserId = userId,
                                UserName = userName,
                                Action = method,
                                Module = module,
                                RecordId = recordId,
                                Description = $"{method} request to {path}",
                                Timestamp = DateTime.UtcNow,
                                IPAddress = context.Connection.RemoteIpAddress?.ToString()
                            };

                            dbContext.AuditLogs.Add(auditLog);
                            await dbContext.SaveChangesAsync();
                        }
                    }
                    catch (Exception ex)
                    {
                        // Don't fail the request due to logging failure
                        Console.WriteLine($"Audit logging failed: {ex.Message}");
                    }
                }
            }
            else
            {
                await _next(context);
            }
        }
    }
}

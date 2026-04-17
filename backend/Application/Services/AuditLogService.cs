using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

using DMS.Application.DTOs;

namespace DMS.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;

        public AuditLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Backwards-compatible overload (used by existing code)
        public async Task LogActionAsync(string userId, string action, string? ipAddress = null)
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                UserName = userId, // fallback
                Action = action,
                Module = "System",
                Timestamp = DateTime.UtcNow,
                IPAddress = ipAddress
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        // Full overload with all fields
        public async Task LogActionAsync(string userId, string userName, string action, string module, string? description = null, string? recordId = null, string? ipAddress = null)
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                UserName = userName,
                Action = action,
                Module = module,
                Description = description,
                RecordId = recordId,
                Timestamp = DateTime.UtcNow,
                IPAddress = ipAddress
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<PagedResult<AuditLog>> GetLogsAsync(string? userId, string? module, DateTime? fromDate, DateTime? toDate, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(a => a.UserId == userId || a.UserName.Contains(userId));

            if (!string.IsNullOrEmpty(module))
                query = query.Where(a => a.Module == module);

            if (fromDate.HasValue)
                query = query.Where(a => a.Timestamp >= fromDate.Value.Date);

            if (toDate.HasValue)
                query = query.Where(a => a.Timestamp <= toDate.Value.Date.AddDays(1).AddTicks(-1));

            var totalCount = await query.CountAsync();
            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<AuditLog>
            {
                Items = logs,
                TotalCount = totalCount,
                Page = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }
    }
}

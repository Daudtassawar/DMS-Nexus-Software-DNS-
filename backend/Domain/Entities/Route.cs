using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Route
    {
        public int RouteId { get; set; }
        public string RouteName { get; set; } = string.Empty;
        public string? Area { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Customer> Customers { get; set; } = new List<Customer>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}

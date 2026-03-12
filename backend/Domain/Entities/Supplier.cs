using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Supplier
    {
        public int SupplierId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}

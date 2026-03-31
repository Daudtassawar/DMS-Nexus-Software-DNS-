using System.Collections.Generic;

namespace DMS.Domain.Entities
{
    public class Vehicle
    {
        public int VehicleId { get; set; }
        public string VehicleNumber { get; set; } = string.Empty;
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }
        public string VehicleType { get; set; } = "Truck";
        public bool IsActive { get; set; } = true;

        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }
}

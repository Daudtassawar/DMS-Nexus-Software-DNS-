namespace DMS.Domain.Entities
{
    public class Distributor
    {
        public int DistributorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Region { get; set; }
        public string? Contact { get; set; }
        
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}

namespace Beauty.Models
{
    public class Catalog
    {
        public List<CategoryInfo> Categories { get; set; } = new List<CategoryInfo>();
        public List<BrandInfo> Brands { get; set; } = new List<BrandInfo>();
        public List<Product> Products { get; set; } = new List<Product>();
    }

    public class CategoryInfo
    {
        public string Key { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public List<string> Subs { get; set; } = new List<string>();
    }

    public class BrandInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Logo { get; set; } = string.Empty;
        public string Blurb { get; set; } = string.Empty;
    }

    public class Product
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Sub { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Image { get; set; } = string.Empty;
        public string Tint { get; set; } = string.Empty;
        public bool IsNew { get; set; }
        public int TopRank { get; set; }
        public double Rating { get; set; }
        public int Reviews { get; set; }
    }
}

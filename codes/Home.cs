using System.Globalization;
using System.Text;
using System.Text.Json;
using Beauty.Models;
using SkyNet;

namespace Beauty.codes
{
    public class Home : WebPage
    {

        public override async Task OnInitialized()
        {
            HtmlDoc.SetTitle("Lumé Beauty | Clean Makeup, Skin Care, Hair & Fragrance");
            HtmlDoc.AddMetaElement("viewport", "width=device-width, initial-scale=1");
            HtmlDoc.AddMetaElement("description", "Shop clean makeup, skin care, hair, bath & body and fragrance from the brands you love.");

            Catalog catalog = await LoadCatalog();
            List<Product> fresh = catalog.Products.Where(p => p.IsNew).OrderByDescending(p => p.Id).Take(8).ToList();
            List<Product> top = catalog.Products.Where(p => p.TopRank > 0).OrderBy(p => p.TopRank).Take(8).ToList();

            HtmlDoc.HtmlBodyText = HtmlDoc.HtmlBodyText
                .Replace("{plhd_new}", Grid(fresh, false))
                .Replace("{plhd_top}", Grid(top, true))
                .Replace("{plhd_brands}", BrandTiles(catalog));
        }

        private static string BrandTiles(Catalog catalog)
        {
            StringBuilder sb = new StringBuilder();
            foreach (BrandInfo b in catalog.Brands)
            {
                int count = catalog.Products.Count(p => p.Brand == b.Name);
                if (count == 0)
                {
                    continue;
                }
                sb.Append("<a class=\"hm-brand\" href=\"Brands?brand=" + Slug(b.Name) + "\">");
                sb.Append("<img src=\"" + b.Logo + "\" alt=\"" + HtmlEncode(b.Name) + "\" loading=\"lazy\">");
                sb.Append("<span class=\"hm-instock\">In stock</span><small>" + count + (count == 1 ? " product" : " products") + "</small></a>");
            }
            return sb.ToString();
        }

        public async Task<ApiResponse> Search()
        {
            ApiResponse response = new ApiResponse();
            string q = (GetDataValue("q") ?? string.Empty).Trim();
            if (q.Length > 40)
            {
                q = q.Substring(0, 40);
            }

            Catalog catalog = await LoadCatalog();
            List<Product> hits = new List<Product>();
            if (q.Length >= 2)
            {
                hits = catalog.Products
                    .Where(p => Has(p.Name, q) || Has(p.Brand, q) || Has(p.Sub, q) || Has(CategoryLabel(catalog, p.Category), q))
                    .OrderBy(p => p.TopRank == 0 ? 999 : p.TopRank)
                    .ThenBy(p => p.Id)
                    .ToList();
            }

            StringBuilder sb = new StringBuilder();
            if (hits.Count == 0)
            {
                sb.Append("<div class=\"hm-sg-none\">No results for &ldquo;" + HtmlEncode(q) + "&rdquo;</div>");
            }
            else
            {
                foreach (Product p in hits.Take(6))
                {
                    sb.Append("<a class=\"hm-sg\" href=\"" + p.Category + "?sub=" + Slug(p.Sub) + "\">");
                    sb.Append("<img src=\"" + p.Image + "\" alt=\"\" style=\"background:" + p.Tint + "\">");
                    sb.Append("<span><b>" + HtmlEncode(p.Name) + "</b><small>" + HtmlEncode(p.Brand) + " &middot; $" + Money(p.Price) + "</small></span></a>");
                }
                sb.Append("<div class=\"hm-sg-foot\">" + hits.Count + (hits.Count == 1 ? " product" : " products") + " found</div>");
            }

            response.SetElementContents("hm-sugg", sb.ToString());
            response.ExecuteScript("HomeJs.openSugg();");
            return response;
        }

        private async Task<Catalog> LoadCatalog()
        {
            string file = Path.Combine(DataPath ?? string.Empty, "catalog.json");
            if (!File.Exists(file))
            {
                file = Path.Combine(Directory.GetCurrentDirectory(), "data", "catalog.json");
            }
            if (!File.Exists(file))
            {
                return new Catalog();
            }

            string json = await File.ReadAllTextAsync(file);
            JsonSerializerOptions options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<Catalog>(json, options) ?? new Catalog();
        }

        private static string Slug(string value)
        {
            StringBuilder sb = new StringBuilder();
            foreach (char c in (value ?? string.Empty).Normalize(NormalizationForm.FormD).ToLowerInvariant())
            {
                if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'))
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }

        private static bool Has(string text, string q)
        {
            return (text ?? string.Empty).Contains(q, StringComparison.OrdinalIgnoreCase);
        }

        private static string Money(decimal value)
        {
            return value.ToString("0.00", CultureInfo.InvariantCulture);
        }

        private static string CategoryLabel(Catalog catalog, string key)
        {
            CategoryInfo? c = catalog.Categories.FirstOrDefault(x => x.Key == key);
            return c == null ? key : c.Label;
        }

        private static string Card(Product p, bool showRank)
        {
            string link = p.Category + "?sub=" + Slug(p.Sub);
            int stars = (int)Math.Round(p.Rating / 5.0 * 100);
            StringBuilder sb = new StringBuilder();
            sb.Append("<div class=\"hm-card\">");
            sb.Append("<a class=\"hm-card-img\" href=\"" + link + "\" style=\"background:" + p.Tint + "\">");
            if (showRank && p.TopRank > 0)
            {
                sb.Append("<span class=\"hm-badge hm-b-rank\">#" + p.TopRank + "</span>");
            }
            else if (p.IsNew)
            {
                sb.Append("<span class=\"hm-badge hm-b-new\">NEW</span>");
            }
            sb.Append("<img src=\"" + p.Image + "\" alt=\"" + HtmlEncode(p.Name) + "\" loading=\"lazy\">");
            sb.Append("<span class=\"hm-fav\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"><path d=\"M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z\"/></svg></span>");
            sb.Append("</a>");
            sb.Append("<div class=\"hm-card-body\">");
            sb.Append("<div class=\"hm-card-brand\">" + HtmlEncode(p.Brand) + "</div>");
            sb.Append("<a class=\"hm-card-name\" href=\"" + link + "\">" + HtmlEncode(p.Name) + "</a>");
            sb.Append("<div class=\"hm-rate\"><span class=\"hm-stars\"><i style=\"width:" + stars + "%\"></i></span><span>" + p.Rating.ToString("0.0", CultureInfo.InvariantCulture) + " (" + p.Reviews.ToString("N0", CultureInfo.InvariantCulture) + ")</span></div>");
            sb.Append("<div class=\"hm-card-foot\"><span class=\"hm-price\">$" + Money(p.Price) + "</span><button type=\"button\" class=\"hm-add\">Add to bag</button></div>");
            sb.Append("</div></div>");
            return sb.ToString();
        }

        private static string Grid(List<Product> list, bool showRank)
        {
            if (list.Count == 0)
            {
                return "<div class=\"hm-empty\">No products found. Try another filter.</div>";
            }
            StringBuilder sb = new StringBuilder();
            foreach (Product p in list)
            {
                sb.Append(Card(p, showRank));
            }
            return sb.ToString();
        }
    }
}

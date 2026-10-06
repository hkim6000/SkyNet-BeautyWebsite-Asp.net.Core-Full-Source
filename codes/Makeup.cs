using System.Globalization;
using System.Text;
using System.Text.Json;
using Beauty.Models;
using SkyNet;

namespace Beauty.codes
{
    public class Makeup : WebPage
    {

        private static readonly string[] Sorts = { "featured", "new", "rating", "low", "high" };

        public override async Task OnInitialized()
        {
            HtmlDoc.SetTitle("Makeup | Lumé Beauty");
            HtmlDoc.AddMetaElement("viewport", "width=device-width, initial-scale=1");
            HtmlDoc.AddMetaElement("description", "Foundations, palettes and lip color in finishes from velvet matte to glass shine.");

            Catalog catalog = await LoadCatalog();
            List<KeyValuePair<string, string>> keys = Keys(catalog);
            string key = Slug(QueryValue("sub"));
            if (!keys.Any(k => k.Key == key))
            {
                key = string.Empty;
            }

            List<Product> list = Apply(catalog, key, "featured");
            HtmlDoc.HtmlBodyText = HtmlDoc.HtmlBodyText
                .Replace("{plhd_chips}", Chips(keys, key))
                .Replace("{plhd_count}", CountText(list.Count))
                .Replace("{plhd_key}", key)
                .Replace("{plhd_grid}", Grid(list, false));
        }

        public async Task<ApiResponse> Filter()
        {
            ApiResponse response = new ApiResponse();
            Catalog catalog = await LoadCatalog();
            List<KeyValuePair<string, string>> keys = Keys(catalog);

            string key = Slug(GetDataValue("key"));
            if (!keys.Any(k => k.Key == key))
            {
                key = string.Empty;
            }
            string sort = (GetDataValue("sort") ?? string.Empty).Trim().ToLowerInvariant();
            if (!Sorts.Contains(sort))
            {
                sort = "featured";
            }

            List<Product> list = Apply(catalog, key, sort);
            response.SetElementContents("mk-grid", Grid(list, false));
            response.SetElementContents("mk-count", CountText(list.Count));
            return response;
        }

        private static string CountText(int n)
        {
            return n + (n == 1 ? " product" : " products");
        }

        private static string Chips(List<KeyValuePair<string, string>> keys, string active)
        {
            StringBuilder sb = new StringBuilder();
            foreach (KeyValuePair<string, string> k in keys)
            {
                string act = k.Key == active ? " mk-act" : string.Empty;
                sb.Append("<button type=\"button\" class=\"mk-chip" + act + "\" data-key=\"" + k.Key + "\" onclick=\"MakeupJs.chip(this,'" + k.Key + "')\">" + HtmlEncode(k.Value) + "</button>");
            }
            return sb.ToString();
        }

        private static List<Product> Sort(IEnumerable<Product> items, string sort)
        {
            switch (sort)
            {
                case "new":
                    return items.OrderByDescending(p => p.IsNew).ThenByDescending(p => p.Id).ToList();
                case "rating":
                    return items.OrderByDescending(p => p.Rating).ThenByDescending(p => p.Reviews).ToList();
                case "low":
                    return items.OrderBy(p => p.Price).ThenBy(p => p.Id).ToList();
                case "high":
                    return items.OrderByDescending(p => p.Price).ThenBy(p => p.Id).ToList();
                default:
                    return items.OrderBy(p => p.TopRank == 0 ? 999 : p.TopRank).ThenBy(p => p.Id).ToList();
            }
        }

        private const string Cat = "Makeup";

        private static List<KeyValuePair<string, string>> Keys(Catalog catalog)
        {
            List<KeyValuePair<string, string>> keys = new List<KeyValuePair<string, string>> { new KeyValuePair<string, string>(string.Empty, "All") };
            CategoryInfo? c = catalog.Categories.FirstOrDefault(x => x.Key == Cat);
            if (c != null)
            {
                foreach (string s in c.Subs)
                {
                    keys.Add(new KeyValuePair<string, string>(Slug(s), s));
                }
            }
            return keys;
        }

        private static List<Product> Apply(Catalog catalog, string key, string sort)
        {
            return Sort(catalog.Products.Where(p => p.Category == Cat && (key.Length == 0 || Slug(p.Sub) == key)), sort);
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
                sb.Append("<div class=\"mk-sg-none\">No results for &ldquo;" + HtmlEncode(q) + "&rdquo;</div>");
            }
            else
            {
                foreach (Product p in hits.Take(6))
                {
                    sb.Append("<a class=\"mk-sg\" href=\"" + p.Category + "?sub=" + Slug(p.Sub) + "\">");
                    sb.Append("<img src=\"" + p.Image + "\" alt=\"\" style=\"background:" + p.Tint + "\">");
                    sb.Append("<span><b>" + HtmlEncode(p.Name) + "</b><small>" + HtmlEncode(p.Brand) + " &middot; $" + Money(p.Price) + "</small></span></a>");
                }
                sb.Append("<div class=\"mk-sg-foot\">" + hits.Count + (hits.Count == 1 ? " product" : " products") + " found</div>");
            }

            response.SetElementContents("mk-sugg", sb.ToString());
            response.ExecuteScript("MakeupJs.openSugg();");
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
            sb.Append("<div class=\"mk-card\">");
            sb.Append("<a class=\"mk-card-img\" href=\"" + link + "\" style=\"background:" + p.Tint + "\">");
            if (showRank && p.TopRank > 0)
            {
                sb.Append("<span class=\"mk-badge mk-b-rank\">#" + p.TopRank + "</span>");
            }
            else if (p.IsNew)
            {
                sb.Append("<span class=\"mk-badge mk-b-new\">NEW</span>");
            }
            sb.Append("<img src=\"" + p.Image + "\" alt=\"" + HtmlEncode(p.Name) + "\" loading=\"lazy\">");
            sb.Append("<span class=\"mk-fav\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"><path d=\"M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z\"/></svg></span>");
            sb.Append("</a>");
            sb.Append("<div class=\"mk-card-body\">");
            sb.Append("<div class=\"mk-card-brand\">" + HtmlEncode(p.Brand) + "</div>");
            sb.Append("<a class=\"mk-card-name\" href=\"" + link + "\">" + HtmlEncode(p.Name) + "</a>");
            sb.Append("<div class=\"mk-rate\"><span class=\"mk-stars\"><i style=\"width:" + stars + "%\"></i></span><span>" + p.Rating.ToString("0.0", CultureInfo.InvariantCulture) + " (" + p.Reviews.ToString("N0", CultureInfo.InvariantCulture) + ")</span></div>");
            sb.Append("<div class=\"mk-card-foot\"><span class=\"mk-price\">$" + Money(p.Price) + "</span><button type=\"button\" class=\"mk-add\">Add to bag</button></div>");
            sb.Append("</div></div>");
            return sb.ToString();
        }

        private static string Grid(List<Product> list, bool showRank)
        {
            if (list.Count == 0)
            {
                return "<div class=\"mk-empty\">No products found. Try another filter.</div>";
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

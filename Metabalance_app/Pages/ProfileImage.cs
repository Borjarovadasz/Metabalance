using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Media.Imaging;
using YourAppName.Services;

namespace Metabalance_app.Helpers
{
    public static class ProfileImageHelper
    {
        private static readonly ApiClient _api = new ApiClient();

        public static async Task SetAsync(Image target)
        {
            var me = await _api.GetOwnProfileAsync();
            Apply(target, me.profile_image);
        }

        public static void Apply(Image target, string? s)
        {
            if (target == null) return;

            if (string.IsNullOrWhiteSpace(s))
            {
                target.Source = null;
                return;
            }

            try
            {
                if (s.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
                {
                    var base64 = s.Substring(s.IndexOf(",") + 1);
                    var bytes = Convert.FromBase64String(base64);
                    using var ms = new MemoryStream(bytes);

                    var bmp = new BitmapImage();
                    bmp.BeginInit();
                    bmp.CacheOption = BitmapCacheOption.OnLoad;
                    bmp.StreamSource = ms;
                    bmp.EndInit();
                    bmp.Freeze();

                    target.Source = bmp;
                }
                else
                {
                    var bmp = new BitmapImage();
                    bmp.BeginInit();
                    bmp.CacheOption = BitmapCacheOption.OnLoad;
                    bmp.UriSource = new Uri(s, UriKind.RelativeOrAbsolute);
                    bmp.EndInit();
                    bmp.Freeze();

                    target.Source = bmp;
                }
            }
            catch
            {
                target.Source = null;
            }
        }
    }
}
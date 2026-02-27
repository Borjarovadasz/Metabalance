using System;
using System.IO;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace Metabalance_app.Services
{
    public static class ProfileImageService
    {
        public static event Action? ImageChanged;

        private static ImageSource? _current;
        public static ImageSource Current => _current ??= Default;

        public static ImageSource Default { get; } =
            new BitmapImage(new Uri("/Pages/img/profileicon-removebg-preview.png", UriKind.Relative));

        public static void SetFromDb(string? profileImage)
        {
            _current = BuildImage(profileImage) ?? Default;
            ImageChanged?.Invoke();
        }

        private static ImageSource? BuildImage(string? profileImage)
        {
            if (string.IsNullOrWhiteSpace(profileImage)) return null;

            try
            {
                if (profileImage.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
                {
                    var base64 = profileImage.Substring(profileImage.IndexOf(",") + 1);
                    var bytes = Convert.FromBase64String(base64);
                    using var ms = new MemoryStream(bytes);

                    var bmp = new BitmapImage();
                    bmp.BeginInit();
                    bmp.CacheOption = BitmapCacheOption.OnLoad;
                    bmp.StreamSource = ms;
                    bmp.EndInit();
                    bmp.Freeze();
                    return bmp;
                }

                var img = new BitmapImage();
                img.BeginInit();
                img.CacheOption = BitmapCacheOption.OnLoad;
                img.UriSource = new Uri(profileImage, UriKind.RelativeOrAbsolute);
                img.EndInit();
                img.Freeze();
                return img;
            }
            catch
            {
                return null;
            }
        }
    }
}
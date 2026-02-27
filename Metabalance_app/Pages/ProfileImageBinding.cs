using System.Windows.Controls;

namespace Metabalance_app.Services
{
    public static class ProfileImageAttach
    {
        public static void Attach(Image img)
        {
            if (img == null) return;

            img.Source = ProfileImageService.Current;

            void Handler()
            {
                img.Dispatcher.Invoke(() => img.Source = ProfileImageService.Current);
            }

            ProfileImageService.ImageChanged += Handler;

            img.Unloaded += (_, __) => ProfileImageService.ImageChanged -= Handler;
        }
    }
}
using System.Threading.Tasks;
using System.Windows;
using Metabalance_app.Controls;

namespace Metabalance_app.Helpers
{
    public static class ToastFunction
    {
        private static ToastHost? _host;

        public static void Init(ToastHost host)
        {
            _host = host;
        }

        public static Task ShowInfo(string msg, int ms = 2000) =>
            Show(msg, ToastType.Info, ms);

        public static Task ShowSuccess(string msg, int ms = 2000) =>
            Show(msg, ToastType.Success, ms);

        public static Task ShowError(string msg, int ms = 2500) =>
            Show(msg, ToastType.Error, ms);

        private static Task Show(string msg, ToastType type, int ms)
        {
            if (_host == null) return Task.CompletedTask;

            // UI thread biztosítása
            return Application.Current.Dispatcher.InvokeAsync(() => _host.ShowAsync(msg, type, ms)).Task.Unwrap();
        }
    }
}
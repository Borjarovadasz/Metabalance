using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;

namespace Metabalance_app.Controls
{
    public partial class ToastHost : UserControl
    {
        public ToastHost()
        {
            InitializeComponent();
        }

        public async Task ShowAsync(string message, ToastType type, int ms = 2000)
        {
            // kinézet típus szerint
            switch (type)
            {
                case ToastType.Success:
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(34, 197, 94)); // zöld
                    ToastIcon.Text = "✅";
                    break;

                case ToastType.Error:
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(239, 68, 68)); // piros
                    ToastIcon.Text = "❌";
                    break;

                case ToastType.Info:
                default:
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(55, 65, 81)); // sötétszürke
                    ToastIcon.Text = "ℹ️";
                    break;
            }

            ToastText.Text = message;

            ToastBorder.Visibility = Visibility.Visible;

            // fade in
            var fadeIn = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(160));
            ToastBorder.BeginAnimation(OpacityProperty, fadeIn);

            await Task.Delay(ms);

            // fade out
            var fadeOut = new DoubleAnimation(1, 0, TimeSpan.FromMilliseconds(180));
            ToastBorder.BeginAnimation(OpacityProperty, fadeOut);

            await Task.Delay(190);
            ToastBorder.Visibility = Visibility.Collapsed;
        }
    }

    public enum ToastType
    {
        Info,
        Success,
        Error
    }
}
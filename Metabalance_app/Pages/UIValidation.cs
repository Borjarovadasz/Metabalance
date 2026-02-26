using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace Metabalance_app.Helpers
{
    public static class UIValidation
    {
        public static void SetError(Control input, TextBlock errorBlock, string message)
        {
            input.BorderBrush = Brushes.Red;
            errorBlock.Text = message;
            errorBlock.Visibility = Visibility.Visible;
        }

        public static void ClearError(Control input, TextBlock errorBlock)
        {
            input.ClearValue(Border.BorderBrushProperty);
            errorBlock.Text = "";
            errorBlock.Visibility = Visibility.Collapsed;
        }

        public static void ShowMessage(TextBlock messageBlock, string message, bool success)
        {
            messageBlock.Text = message;
            messageBlock.Foreground = success ? Brushes.Green : Brushes.Red;
            messageBlock.Visibility = Visibility.Visible;
        }

        public static void HideMessage(TextBlock messageBlock)
        {
            messageBlock.Text = "";
            messageBlock.Visibility = Visibility.Collapsed;
        }
    }
}
using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media.Animation;

namespace Metabalance_app
{
    public partial class SplashScreen : Window
    {
        public SplashScreen()
        {
            InitializeComponent();
            Loaded += SplashScreen_Loaded;
        }

        private async void SplashScreen_Loaded(object sender, RoutedEventArgs e)
        {
            await Task.Delay(2500);
            var fade = new DoubleAnimation(1, 0,
                new Duration(TimeSpan.FromMilliseconds(600)));

            fade.Completed += (s, _) =>
            {
                MainWindow main = new MainWindow();
                main.Show();
                this.Close();
            };

            this.BeginAnimation(Window.OpacityProperty, fade);
        }
    }
}

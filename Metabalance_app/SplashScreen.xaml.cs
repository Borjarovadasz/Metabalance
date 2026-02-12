using System.Threading.Tasks;
using System.Windows;

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
            await Task.Delay(2500); // 2.5 mp betöltés animáció

            var main = new MainWindow();
            main.Show();

            this.Close();
        }
    }
}

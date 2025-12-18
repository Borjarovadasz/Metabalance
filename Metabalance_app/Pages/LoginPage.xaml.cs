using System.Windows;
using System.Windows.Controls;

namespace Metabalance_app.Pages
{
    public partial class LoginPage : Page
    {
        public LoginPage()
        {
            InitializeComponent();
        }
        private void BackToMain_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new MainPage());
        }
        private void Registracio_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new RegistrationPage());
        }
        private void Go_Dashboard(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Dashboard());
        }
    }
}

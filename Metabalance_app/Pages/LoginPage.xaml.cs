using System.Windows;
using System.Windows.Controls;
using YourAppName.Services;

namespace Metabalance_app.Pages
{
    public partial class LoginPage : Page

    {

        private readonly ApiClient _api = new ApiClient();
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

        private async void Login_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                bool ok = await _api.LoginAsync(
                    EmailTextBox.Text.Trim(),
                    PasswordBox.Password
                );

                if (ok)
                {
                    MessageBox.Show("Sikeres bejelentkezés ✅");
                    NavigationService.Navigate(new Dashboard());
                }
                else
                {
                    MessageBox.Show("Hibás email vagy jelszó ❌");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }
    }
}

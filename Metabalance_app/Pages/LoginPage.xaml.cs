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
                string email = EmailTextBox.Text.Trim();
                string password = PasswordBox.Password;

                bool ok = await _api.LoginAsync(EmailTextBox.Text.Trim(), PasswordBox.Password);

                if (ok)
                {
                    var me = await _api.GetMeAsync(); 
                    if (me.szerepkor == "admin")
                        NavigationService.Navigate(new AdminPage());
                    else
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

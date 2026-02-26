using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Metabalance_app.Helpers;
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
    
            UIValidation.ClearError(EmailTextBox, EmailError);
            UIValidation.ClearError(PasswordBox, PasswordError);
            UIValidation.HideMessage(GlobalMessage);

            var email = EmailTextBox.Text.Trim();
            var password = PasswordBox.Password;

            bool ok = true;

            if (string.IsNullOrWhiteSpace(email))
            {
                UIValidation.SetError(EmailTextBox, EmailError, "Az e-mail kötelező!");
                ok = false;
            }

            if (string.IsNullOrWhiteSpace(password))
            {
                UIValidation.SetError(PasswordBox, PasswordError, "A jelszó kötelező!");
                ok = false;
            }

            if (!ok) return;

            try
            {
                var loggedIn = await _api.LoginAsync(email, password);

                if (!loggedIn)
                {
                    UIValidation.ShowMessage(GlobalMessage, "Hibás e-mail vagy jelszó ❌", success: false);
                    return;
                }

                UIValidation.ShowMessage(GlobalMessage, "Sikeres bejelentkezés ✅", success: true);

                var me = await _api.GetMeAsync();
                NavigationService.Navigate(me.szerepkor == "admin" ? new AdminPage() : new Dashboard());
            }
            catch (Exception ex)
            {
                UIValidation.ShowMessage(GlobalMessage, "Hiba: " + ex.Message, success: false);
            }
        }
    }
}
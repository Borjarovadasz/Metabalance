using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Text.RegularExpressions;
using YourAppName.Services;
using System.Windows.Media;
using Metabalance_app.Helpers;
using System.Net.NetworkInformation;
using System.Net.Http;
using System.Net;

namespace Metabalance_app.Pages
{
    public partial class RegistrationPage : Page
    {

        private readonly ApiClient _api = new ApiClient();
        public RegistrationPage()
        {
            InitializeComponent();
        }

        private void BackToMain_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new MainPage());
        }

        private static bool IsValidEmail(string email)
        {
            return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }

        private static bool IsValidPhone(string phone)
        {
            return Regex.IsMatch(phone, @"^(?:\+36|06)\d{9}$");
        }

        private async void Register_Click(object sender, RoutedEventArgs e)
        {
            UIValidation.ClearError(FirstNameTextBox, FirstNameError);
            UIValidation.ClearError(LastNameTextBox, LastNameError);
            UIValidation.ClearError(EmailTextBox, EmailError);
            UIValidation.ClearError(PhoneTextBox, PhoneError);
            UIValidation.ClearError(GenderTextBox, GenderError);
            UIValidation.ClearError(PasswordBox, PasswordError);
            UIValidation.ClearError(ConfirmPasswordBox, ConfirmPasswordError);
            UIValidation.HideMessage(GlobalMessage);

            var first = FirstNameTextBox.Text.Trim();
            var last = LastNameTextBox.Text.Trim();
            var email = EmailTextBox.Text.Trim();
            var phone = PhoneTextBox.Text?.Trim() ?? "";
            var gender = GenderTextBox.Text?.Trim() ?? "";
            var password = PasswordBox.Password;
            var confirm = ConfirmPasswordBox.Password;

            bool ok = true;

            if (string.IsNullOrWhiteSpace(first))
            {
                UIValidation.SetError(FirstNameTextBox, FirstNameError, "A keresztnév kötelező!");
                ok = false;
            }

            if (string.IsNullOrWhiteSpace(last))
            {
                UIValidation.SetError(LastNameTextBox, LastNameError, "A vezetéknév kötelező!");
                ok = false;
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                UIValidation.SetError(EmailTextBox, EmailError, "Az e-mail kötelező!");
                ok = false;
            }
            else if (!IsValidEmail(email))
            {
                UIValidation.SetError(EmailTextBox, EmailError, "Hibás e-mail formátum! (pl. valami@domain.com)");
                ok = false;
            }

            if (string.IsNullOrWhiteSpace(phone))
            {
                UIValidation.SetError(PhoneTextBox, PhoneError, "A telefonszám kötelező!");
                ok = false;
            }
            else
            {
                var cleaned = phone.Replace(" ", "").Replace("-", "");
                if (!IsValidPhone(cleaned))
                {
                    UIValidation.SetError(PhoneTextBox, PhoneError, "Hibás telefonszám! (pl. +36201234567 vagy 06201234567)");
                    ok = false;
                }
                phone = cleaned;
            }

            if (string.IsNullOrWhiteSpace(gender))
            {
                UIValidation.SetError(GenderTextBox, GenderError, "Válassz nemet!");
                ok = false;
            }

            if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
            {
                UIValidation.SetError(PasswordBox, PasswordError, "A jelszó minimum 6 karakter!");
                ok = false;
            }

            if (string.IsNullOrWhiteSpace(confirm))
            {
                UIValidation.SetError(ConfirmPasswordBox, ConfirmPasswordError, "Erősítsd meg a jelszót!");
                ok = false;
            }
            else if (password != confirm)
            {
                UIValidation.SetError(ConfirmPasswordBox, ConfirmPasswordError, "A két jelszó nem egyezik!");
                ok = false;
            }

            if (!ok) return;

            try
            {
                await _api.RegisterAsync(first, last, email, password, phone, gender);

                UIValidation.ShowMessage(GlobalMessage, "Sikeres regisztráció ✅ Most be tudsz jelentkezni.", success: true);

                await System.Threading.Tasks.Task.Delay(1200);
                NavigationService?.Navigate(new LoginPage());
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Email mar letezik"))
                    UIValidation.SetError(EmailTextBox, EmailError, "Ez az e-mail már regisztrálva van!");
                else
                    UIValidation.ShowMessage(GlobalMessage, "Hiba: " + ex.Message, success: false);
            }
        }

    }
}


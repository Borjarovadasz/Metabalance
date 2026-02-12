using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using YourAppName.Services;

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
        private async void Register_Click(object sender, RoutedEventArgs e)
        {
            var first = FirstNameTextBox.Text.Trim();
            var last = LastNameTextBox.Text.Trim();
            var email = EmailTextBox.Text.Trim();

            var phone = string.IsNullOrWhiteSpace(PhoneTextBox.Text) ? null : PhoneTextBox.Text.Trim();
            var gender = string.IsNullOrWhiteSpace(GenderTextBox.Text) ? null : GenderTextBox.Text.Trim();

            if (string.IsNullOrWhiteSpace(first) || string.IsNullOrWhiteSpace(last))
            {
                MessageBox.Show("Keresztnév és vezetéknév kötelező! ❌");
                return;
            }

            if (!IsValidEmail(email))
            {
                MessageBox.Show("Hibás e-mail formátum! (pl. valami@domain.com) ❌");
                return;
            }

            if (string.IsNullOrWhiteSpace(PasswordBox.Password) || PasswordBox.Password.Length < 6)
            {
                MessageBox.Show("A jelszó legyen legalább 6 karakter! ❌");
                return;
            }

            if (PasswordBox.Password != ConfirmPasswordBox.Password)
            {
                MessageBox.Show("A két jelszó nem egyezik! ❌");
                return;
            }

            if (phone == null)
            {
                MessageBox.Show("A telefonszám nem lehet üres! ❌");
                return;
            }

            if (!string.IsNullOrWhiteSpace(phone) && !phone.All(char.IsDigit))
            {
                MessageBox.Show("A telefonszám csak számokat tartalmazhat! ❌");
                return;
            }

            if (string.IsNullOrWhiteSpace(gender))
            {
                MessageBox.Show("Válassz nemet! ❌");
                return;
            }
            try
            {
                var firstName = FirstNameTextBox.Text.Trim();
                var lastName = LastNameTextBox.Text.Trim();
                var password = PasswordBox.Password;


                await _api.RegisterAsync(firstName, lastName, email, password, phone, gender);

                MessageBox.Show("Sikeres regisztráció ✅ Most be tudsz jelentkezni.");

                // vissza a loginra (ha frame navigation van)
                NavigationService?.Navigate(new LoginPage());
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }

        private static readonly Regex _onlyDigits = new Regex(@"^[0-9]+$");

        private static bool IsValidEmail(string email)
        {
            try
            {
                var _ = new MailAddress(email);
                return email.Contains("@");
            }
            catch
            {
                return false;
            }
        }

        private void PhoneTextBox_PreviewTextInput(object sender, System.Windows.Input.TextCompositionEventArgs e)
        {
            e.Handled = !_onlyDigits.IsMatch(e.Text);
        }

        private void PhoneTextBox_Pasting(object sender, DataObjectPastingEventArgs e)
        {
            if (!e.DataObject.GetDataPresent(typeof(string)))
            {
                e.CancelCommand();
                return;
            }

            var text = (string)e.DataObject.GetData(typeof(string))!;
            if (!_onlyDigits.IsMatch(text))
                e.CancelCommand();
        }
    }
}

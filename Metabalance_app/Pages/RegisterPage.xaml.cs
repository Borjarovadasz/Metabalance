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
            try
            {
                var firstName = FirstNameTextBox.Text.Trim();
                var lastName = LastNameTextBox.Text.Trim();
                var email = EmailTextBox.Text.Trim();
                var password = PasswordBox.Password;

                var phone = string.IsNullOrWhiteSpace(PhoneTextBox.Text) ? null : PhoneTextBox.Text.Trim();
                var gender = string.IsNullOrWhiteSpace(GenderTextBox.Text) ? null : GenderTextBox.Text.Trim();

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
    }
}

using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using YourAppName.Services;

namespace Metabalance_app.Pages
{
    public partial class AdminPage : Page
    {
        private readonly ApiClient _api = new ApiClient();

        public ObservableCollection<ApiClient.AdminUserDto> Users { get; } = new();

        public AdminPage()
        {
            InitializeComponent();
            Loaded += AdminPage_Loaded;
        }

        private async void AdminPage_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadUsersAsync();
        }

        private async System.Threading.Tasks.Task LoadUsersAsync()
        {
            try
            {
                var list = await _api.AdminListUsersAsync();
                Users.Clear();
                foreach (var u in list)
                    Users.Add(u);

                UsersGrid.ItemsSource = Users;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba felhasználók lekérésekor: " + ex.Message);
            }
        }

        private async void AddUser_Click(object sender, RoutedEventArgs e)
        {
           
            var email = Microsoft.VisualBasic.Interaction.InputBox("Email:", "Új felhasználó", "");
            if (string.IsNullOrWhiteSpace(email)) return;

            var keresztnev = Microsoft.VisualBasic.Interaction.InputBox("Keresztnév:", "Új felhasználó", "");
            if (string.IsNullOrWhiteSpace(keresztnev)) return;

            var vezeteknev = Microsoft.VisualBasic.Interaction.InputBox("Vezetéknév:", "Új felhasználó", "");
            if (string.IsNullOrWhiteSpace(vezeteknev)) return;

            var jelszo = Microsoft.VisualBasic.Interaction.InputBox("Jelszó:", "Új felhasználó", "");
            if (string.IsNullOrWhiteSpace(jelszo)) return;

            try
            {
                await _api.AdminCreateUserAsync(keresztnev, vezeteknev, email.Trim(), jelszo, "user", true);
                await LoadUsersAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba létrehozáskor: " + ex.Message);
            }
        }

        private void GoUser_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Dashboard());
        }
        private async void EditUser_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not Button btn) return;
            if (btn.Tag is not ApiClient.AdminUserDto u) return;

            var dlg = new UserEditDialog(u.nev, u.email, u.szerepkor, u.aktiv)
            {
                Owner = Window.GetWindow(this)
            };

            if (dlg.ShowDialog() != true) return;

            try
            {
              
                await _api.AdminUpdateUserAsync(u.azonosito, dlg.EmailValue, dlg.NewPasswordValue, dlg.ActiveValue);

                
                if (!string.Equals(u.szerepkor, dlg.RoleValue, StringComparison.OrdinalIgnoreCase))
                {
                    await _api.AdminUpdateRoleAsync(u.azonosito, dlg.RoleValue);
                }

                await LoadUsersAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba mentéskor: " + ex.Message);
            }
        }

        private async void DeleteUser_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not Button btn) return;
            if (btn.Tag is not ApiClient.AdminUserDto u) return;

            if (MessageBox.Show($"Biztos törlöd? ({u.email})", "Törlés", MessageBoxButton.YesNo) != MessageBoxResult.Yes)
                return;

            try
            {
                await _api.AdminDeleteUserAsync(u.azonosito);
                await LoadUsersAsync();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba törléskor: " + ex.Message);
            }
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private void Minimize_Click(object sender, RoutedEventArgs e)
        {
            var w = Window.GetWindow(this);
            if (w != null) w.WindowState = WindowState.Minimized;
        }

        private void Maximize_Click(object sender, RoutedEventArgs e)
        {
            var w = Window.GetWindow(this);
            if (w == null) return;

            w.WindowState = (w.WindowState == WindowState.Normal)
                ? WindowState.Maximized
                : WindowState.Normal;
        }

        private void Logout_Click(object sender, RoutedEventArgs e)
        {
            
            Metabalance_app.Services.AuthState.token = "";
            NavigationService.Navigate(new LoginPage());
        }
    }
}

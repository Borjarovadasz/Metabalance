using Microsoft.Win32;
using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Imaging;
using YourAppName.Services;

namespace Metabalance_app.Pages
{
    public partial class ProfilePage : Page
    {
        private readonly ApiClient _api = new ApiClient();

  
        private string? _selectedImageDataUri = null;

      
        private ApiClient.UserProfileDto? _loadedProfile = null;

        public ProfilePage()
        {
            InitializeComponent();
            Loaded += ProfilePage_Loaded;
        }

        private async void ProfilePage_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                _loadedProfile = await _api.GetOwnProfileAsync();

                
                NameBox.Text = _loadedProfile.nev ?? "";
                EmailBox.Text = _loadedProfile.email ?? "";
                PhoneBox.Text = _loadedProfile.phone ?? "";

                SelectGender(_loadedProfile.gender);

                SideNameText.Text = _loadedProfile.nev ?? "";
                SideEmailText.Text = _loadedProfile.email ?? "";

                
                if (!string.IsNullOrWhiteSpace(_loadedProfile.profile_image))
                {
                    var bmp = BitmapFromDataUri(_loadedProfile.profile_image);
                    if (bmp != null)
                    {
                        MainAvatar.Source = bmp;
                        SideAvatar.Source = bmp;
                        TopAvatar.Source = bmp;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Profil betöltés hiba: " + ex.Message);
            }
        }

        private void SelectGender(string? gender)
        {
            if (gender == null) return;

            foreach (var item in GenderBox.Items.OfType<ComboBoxItem>())
            {
                var txt = item.Content?.ToString() ?? "";
                if (string.Equals(txt, gender, StringComparison.OrdinalIgnoreCase))
                {
                    GenderBox.SelectedItem = item;
                    return;
                }
            }
        }

        private void UploadPhoto_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new OpenFileDialog
            {
                Filter = "Képek|*.png;*.jpg;*.jpeg;*.webp;*.bmp",
                Title = "Profilkép kiválasztása"
            };

            if (dlg.ShowDialog() != true) return;

         
            _selectedImageDataUri = FileToDataUri(dlg.FileName);

        
            var bmp = BitmapFromDataUri(_selectedImageDataUri);
            if (bmp != null)
            {
                MainAvatar.Source = bmp;
                SideAvatar.Source = bmp;
                TopAvatar.Source = bmp;
            }
        }

        private async void Save_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                
                var fullName = (NameBox.Text ?? "").Trim();
                string? vezeteknev = null;
                string? keresztnev = null;

                if (!string.IsNullOrWhiteSpace(fullName))
                {
                    var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 1)
                    {
                        vezeteknev = parts[0];
                        keresztnev = "";
                    }
                    else
                    {
                        vezeteknev = parts[0];
                        keresztnev = string.Join(" ", parts.Skip(1));
                    }
                }

                var email = (EmailBox.Text ?? "").Trim();
                var phone = (PhoneBox.Text ?? "").Trim();
                var gender = (GenderBox.SelectedItem as ComboBoxItem)?.Content?.ToString();

              
                var profileImageToSend = _selectedImageDataUri
                                         ?? _loadedProfile?.profile_image;

                await _api.UpdateMyProfileAsync(
                    keresztnev: keresztnev,
                    vezeteknev: vezeteknev,
                    email: string.IsNullOrWhiteSpace(email) ? null : email,
                    phone: string.IsNullOrWhiteSpace(phone) ? null : phone,
                    gender: string.IsNullOrWhiteSpace(gender) ? null : gender,
                    profileImage: string.IsNullOrWhiteSpace(profileImageToSend) ? null : profileImageToSend
                );

                
                SideNameText.Text = fullName;
                SideEmailText.Text = email;

              
                if (_loadedProfile != null)
                {
                    _loadedProfile.nev = fullName;
                    _loadedProfile.email = email;
                    _loadedProfile.phone = phone;
                    _loadedProfile.gender = gender;
                    _loadedProfile.profile_image = profileImageToSend;
                }

                MessageBox.Show("Profil mentve ✅");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Mentés hiba: " + ex.Message);
            }
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            NavigationService?.Navigate(new Dashboard());
        }

        private void Logout_Click(object sender, RoutedEventArgs e)
        {
            Metabalance_app.Services.AuthState.token = "";
            NavigationService?.Navigate(new MainPage());
        }


        private static string FileToDataUri(string filePath)
        {
            var bytes = File.ReadAllBytes(filePath);

            var ext = Path.GetExtension(filePath).ToLowerInvariant();
            var mime = ext switch
            {
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                ".bmp" => "image/bmp",
                _ => "application/octet-stream"
            };

            var b64 = Convert.ToBase64String(bytes);
            return $"data:{mime};base64,{b64}";
        }

        private static BitmapImage? BitmapFromDataUri(string? dataUri)
        {
            if (string.IsNullOrWhiteSpace(dataUri)) return null;
            var comma = dataUri.IndexOf(',');
            if (comma < 0) return null;

            var b64 = dataUri[(comma + 1)..];
            byte[] bytes;

            try { bytes = Convert.FromBase64String(b64); }
            catch { return null; }

            var bmp = new BitmapImage();
            using (var ms = new MemoryStream(bytes))
            {
                bmp.BeginInit();
                bmp.CacheOption = BitmapCacheOption.OnLoad;
                bmp.StreamSource = ms;
                bmp.EndInit();
                bmp.Freeze();
            }
            return bmp;
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

            w.WindowState = w.WindowState == WindowState.Maximized
                ? WindowState.Normal
                : WindowState.Maximized;
        }

        private void Close_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }
    }
}

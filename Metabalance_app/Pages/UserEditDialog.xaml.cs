using System.Windows;

namespace Metabalance_app.Pages
{
    public partial class UserEditDialog : Window
    {
        public string EmailValue { get; private set; } = "";
        public string? NewPasswordValue { get; private set; } = null;
        public string RoleValue { get; private set; } = "user";
        public bool ActiveValue { get; private set; } = true;

        public UserEditDialog(string name, string email, string role, bool active)
        {
            InitializeComponent();

            TbName.Text = name;
            TbEmail.Text = email;

            // role
            if (role == "admin") CbRole.SelectedIndex = 1;
            else CbRole.SelectedIndex = 0;

            ChkActive.IsChecked = active;
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            EmailValue = TbEmail.Text.Trim();
            if (string.IsNullOrWhiteSpace(EmailValue))
            {
                MessageBox.Show("Az email nem lehet üres.");
                return;
            }

            var pass = PbPassword.Password;
            NewPasswordValue = string.IsNullOrWhiteSpace(pass) ? null : pass;

            RoleValue = (CbRole.SelectedItem as System.Windows.Controls.ComboBoxItem)?.Content?.ToString() ?? "user";
            ActiveValue = ChkActive.IsChecked == true;

            DialogResult = true;
            Close();
        }
    }
}

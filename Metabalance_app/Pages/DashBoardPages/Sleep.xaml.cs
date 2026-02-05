using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using YourAppName.Services;

namespace Metabalance_app.Pages
{
    public partial class Sleep : Page
    {
        private readonly ApiClient _api = new ApiClient();
        private bool _initialized = false;

        public Sleep()
        {
            InitializeComponent();

            Loaded += async (_, __) =>
            {
                if (!_initialized)
                {
                    FillTimeBoxes();
                    _initialized = true;
                }

                await LoadSavedSleepAsync();
            };

            IsVisibleChanged += async (_, __) =>
            {
                if (IsVisible)
                    await LoadSavedSleepAsync();
            };
        }

        private void FillTimeBoxes()
        {
     
            BedHourBox.Items.Clear();
            BedMinuteBox.Items.Clear();
            WakeHourBox.Items.Clear();
            WakeMinuteBox.Items.Clear();

            for (int h = 0; h < 24; h++)
            {
                BedHourBox.Items.Add(h);
                WakeHourBox.Items.Add(h);
            }

            for (int m = 0; m < 60; m += 5)
            {
                BedMinuteBox.Items.Add(m);
                WakeMinuteBox.Items.Add(m);
            }

            // default (csak ha nincs adat)
            BedHourBox.SelectedItem = 22;
            BedMinuteBox.SelectedItem = 0;
            WakeHourBox.SelectedItem = 6;
            WakeMinuteBox.SelectedItem = 0;

            ResultText.Text = "";
        }

        private async Task LoadSavedSleepAsync()
        {
            try
            {
                var list = await _api.GetTodayMeasurementsAsync("ALVAS"); // ugyanaz mint mentés!
                var entry = list.OrderByDescending(x => x.id).FirstOrDefault(); 

                if (entry == null)
                {
                    ResultText.Text = "Nincs adat";
                    return;
                }

                // megjegyzes pl: "22:00-06:00"
                var note = entry.megjegyzes ?? "";
                var parts = note.Split('-', StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length == 2 &&
                    TimeSpan.TryParse(parts[0], out var bed) &&
                    TimeSpan.TryParse(parts[1], out var wake))
                {
                    BedHourBox.SelectedItem = bed.Hours;
                    BedMinuteBox.SelectedItem = bed.Minutes;
                    WakeHourBox.SelectedItem = wake.Hours;
                    WakeMinuteBox.SelectedItem = wake.Minutes;
                }

                // A képed szerint unit="h", ertek=8.00 -> órában van!
                // (Ha egyszer még percben mentetted, akkor az entry.mertekegyseg alapján kezeljük)
                int totalMinutes = entry.mertekegyseg == "min"
                    ? (int)Math.Round(entry.ertek)
                    : (int)Math.Round(entry.ertek * 60.0);

                int h = totalMinutes / 60;
                int m = totalMinutes % 60;

                ResultText.Text = $"Alvás: {h} óra {m:00} perc";
            }
            catch (Exception ex)
            {
                ResultText.Text = "Betöltés hiba: " + ex.Message;
            }
        }

        private async void Save_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (BedHourBox.SelectedItem == null || BedMinuteBox.SelectedItem == null ||
                    WakeHourBox.SelectedItem == null || WakeMinuteBox.SelectedItem == null)
                {
                    ResultText.Text = "Válassz ki minden időt!";
                    return;
                }

                int bh = (int)BedHourBox.SelectedItem;
                int bm = (int)BedMinuteBox.SelectedItem;
                int wh = (int)WakeHourBox.SelectedItem;
                int wm = (int)WakeMinuteBox.SelectedItem;

                var start = DateTime.Today.AddHours(bh).AddMinutes(bm);
                var endRaw = DateTime.Today.AddHours(wh).AddMinutes(wm);

                // UI számolás (éjfél átlógás)
                var endCalc = endRaw <= start ? endRaw.AddDays(1) : endRaw;
                var diff = endCalc - start;

                ResultText.Text = $"Alvás: {(int)diff.TotalHours} óra {diff.Minutes:00} perc";

                await _api.AddSleepAsync(start, endRaw);

                // visszatöltjük a mentettet
                await LoadSavedSleepAsync();
            }
            catch (Exception ex)
            {
                ResultText.Text = "Mentés hiba: " + ex.Message;
            }

        }
        private void Exit(object sender, RoutedEventArgs e) => Application.Current.Shutdown();

        private void Minimize(object sender, RoutedEventArgs e)
        {
            Window window = Window.GetWindow(this);
            window.WindowState = System.Windows.WindowState.Minimized;
        }

        private void Maximize(object sender, RoutedEventArgs e)
        {
            Window window = Window.GetWindow(this);
            window.WindowState = window.WindowState == System.Windows.WindowState.Normal
                ? System.Windows.WindowState.Maximized
                : System.Windows.WindowState.Normal;
        }

        private void BackDash(object sender, RoutedEventArgs e) => NavigationService.Navigate(new Dashboard());
        private void BackToMain(object sender, RoutedEventArgs e) => NavigationService.Navigate(new MainPage());
        private void CaloriesClick(object sender, RoutedEventArgs e) => NavigationService.Navigate(new CaloriesPage());
        private void WaterClick(object sender, RoutedEventArgs e) => NavigationService.Navigate(new Water());
        private void WeightClick(object sender, RoutedEventArgs e) => NavigationService.Navigate(new Weight());
    }
}

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using LiveCharts;
using System.Collections.ObjectModel;
using YourAppName.Services;
using Metabalance_app.Helpers;

namespace Metabalance_app.Pages
{

    
    public partial class Sleep : Page
    {
        private readonly ApiClient _api = new ApiClient();
        private bool _initialized = false;
        public ChartValues<double> SleepLast7Days { get; } = new ChartValues<double>();
        public ObservableCollection<string> Last7DaysLabels { get; } = new ObservableCollection<string>();
        public Sleep()
        {
            InitializeComponent();

            DataContext = this;

            Loaded += async (object sender, RoutedEventArgs e) => 

            {
                if (!_initialized)
                {
                    FillTimeBoxes();
                    _initialized = true;
                }

                await LoadSavedSleepAsync();
                await RefreshSleepChartAsync();   
            };

            Loaded += async (object sender, RoutedEventArgs e) =>
            {
                if (!_initialized)
                {
                    FillTimeBoxes();
                    _initialized = true;
                }

                await LoadSavedSleepAsync();
 
                    await ProfileImageHelper.SetAsync(HeaderProfileImage);

            };

            IsVisibleChanged += async (object sender, DependencyPropertyChangedEventArgs e) =>
            {
                if (IsVisible)
                {
                    await LoadSavedSleepAsync();
                }
            };
        }


        private async Task RefreshSleepChartAsync()
        {
            try
            {
                var days = Enumerable.Range(0, 7)
                    .Select(i => DateTime.Today.AddDays(-6 + i))
                    .ToList();

                Last7DaysLabels.Clear();
                SleepLast7Days.Clear();

                foreach (var d in days)
                {
                    Last7DaysLabels.Add(d.ToString("MM.dd"));
                    var list = await _api.GetMeasurementsAsync("ALVAS", d, limit: 500);

                    var totalHours = list.Sum(x => x.ertek);

     
                    if (list.Any() && list.All(x => x.mertekegyseg == "min"))
                        totalHours = totalHours / 60.0;

                    SleepLast7Days.Add(Math.Round(totalHours, 2));
                }
            }
            catch (Exception ex)
            {

                Last7DaysLabels.Clear();
                SleepLast7Days.Clear();
           
            }
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
                var list = await _api.GetTodayMeasurementsAsync("ALVAS");
                var entry = list.OrderByDescending(x => x.id).FirstOrDefault();

                if (entry == null)
                {
                    ResultText.Text = "Nincs adat";
                    return;
                }

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
                    await ToastFunction.ShowError("Válassz ki minden időt!");
                    return;
                }

                int bh = (int)BedHourBox.SelectedItem;
                int bm = (int)BedMinuteBox.SelectedItem;
                int wh = (int)WakeHourBox.SelectedItem;
                int wm = (int)WakeMinuteBox.SelectedItem;

                var today = DateTime.Today;
                var yesterday = today.AddDays(-1);

                var start = yesterday.AddHours(bh).AddMinutes(bm);
                var end = today.AddHours(wh).AddMinutes(wm);

                if (end <= start)
                {
                    await ToastFunction.ShowError("Érvénytelen idő: a felkelés nem lehet korábban, mint a lefekvés.");
                    return;
                }

                var diff = end - start;

                if (diff.TotalHours > 16 || diff.TotalHours <= 0)
                {
                    await ToastFunction.ShowError("Érvénytelen alvásidő (0-16 óra engedélyezett).");
                    return;
                }

                ResultText.Text = $"Alvás: {(int)diff.TotalHours} óra {diff.Minutes:00} perc";

                await _api.AddSleepAsync(start, end);

                await LoadSavedSleepAsync();
                await RefreshSleepChartAsync();

                await ToastFunction.ShowSuccess("Alvás elmentve ✅");
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("SLEEP_EXISTS_TODAY"))
                {
                    await ToastFunction.ShowError("Ma már rögzítettél alvást.");
                    return;
                }

                await ToastFunction.ShowError("Mentés hiba.");
            }
        }



        private void ProfilePage(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new ProfilePage());
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

        private void MoodClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Mood());
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using YourAppName.Services;

namespace Metabalance_app.Pages
{
    
    public partial class Weight : Page
    {
        public Weight()
        {
            InitializeComponent();
            Loaded += async (_, __) => await RefreshWeightAsync();

            IsVisibleChanged += async (_, __) =>
            {
                if (IsVisible)
                    await RefreshWeightAsync();
            };
        }

        private readonly ApiClient _api = new ApiClient();

        private async void WeightPage_Loaded(object sender, RoutedEventArgs e)
        {
            await RefreshWeightAsync();
        }

        private async void AddWeight(object sender, RoutedEventArgs e)
        {
            try
            {
                // 1) Jelenlegi súly beolvasás
                if (!double.TryParse(CurrentWeight.Text.Trim().Replace(',', '.'),
                    out double kg) || kg <= 0)
                {
                    MessageBox.Show("Írj be egy számot a jelenlegi súlyhoz!");
                    return;
                }

                // 2) Cél súly beolvasás  ✅ ITT jön a goalKg deklaráció
                if (!double.TryParse(GoalWeight.Text.Trim().Replace(',', '.'),
                    out double goalKg) || goalKg <= 0)
                {
                    MessageBox.Show("Írj be egy számot a cél súlyhoz!");
                    return;
                }

                // 3) Súly mentés (measurements)
                await _api.CreateMeasurementAsync("TESTSULY", kg, "kg");

                // 4) Cél mentés (goals)  ✅ goalKg MOST már létezik
                var goals = await _api.GetGoalsAsync("TESTSULY");
                var existing = goals.FirstOrDefault();

                if (existing == null)
                    await _api.CreateGoalAsync("TESTSULY", goalKg, "kg");
                else
                    await _api.UpdateGoalAsync(existing.id, goalKg, "kg");

                // 5) UI frissítés
                CurrentWeightDisplay.Text = $"{kg:0.#} kg";
                GoalWeightDisplay.Text = $"{goalKg:0.#} kg";

                // 6) Input ürítés
                CurrentWeight.Text = "";
                GoalWeight.Text = "";

                await RefreshWeightAsync();

                MessageBox.Show("Súly + cél rögzítve ✅");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }


        private bool _hasTodayWeight = false;

        private async Task RefreshWeightAsync()
        {
            try
            {
                // 1) Mai súly (measurement)
                var list = await _api.GetMeasurementsAsync("TESTSULY", DateTime.Today, limit: 100);

                var last = list.OrderByDescending(x => x.datum).FirstOrDefault();
                if (last != null)
                {
                    CurrentWeightDisplay.Text = $"{last.ertek:0.#} kg";
                    AddWeightButton.IsEnabled = false;
                    AddWeightButton.Content = "Ma már rögzítetted";
                }
                else
                {
                    CurrentWeightDisplay.Text = "Nincs adat!";
                    AddWeightButton.IsEnabled = true;
                    AddWeightButton.Content = "+ Súly naplózása";
                }

                // 2) Cél súly (goals)  ✅ EZT MINDIG FUTTASD LE
                var goals = await _api.GetGoalsAsync("TESTSULY");
                var g = goals.FirstOrDefault();

                GoalWeightDisplay.Text = g == null
                    ? "Nincs adat!"
                    : $"{g.celErtek:0.#} kg";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
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
        private void BackDash(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Dashboard());
        }

        private void BackToMain(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new MainPage());
        }

        private void CaloriesClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new CaloriesPage());
        }


        private void WaterClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Water());
        }
    }
}

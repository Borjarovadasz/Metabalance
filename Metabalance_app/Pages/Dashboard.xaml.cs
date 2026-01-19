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

    public partial class Dashboard : Page
    {

        private readonly ApiClient _api = new ApiClient();
        public Dashboard()
        {
            InitializeComponent();

            Loaded += async (_, __) => await RefreshDashboardAsync();
            IsVisibleChanged += async (_, __) =>
            {
                if (IsVisible)
                    await RefreshDashboardAsync();
            };
        }
        
       private async Task RefreshDashboardAsync()
        {
            try
            {
                var waterMl = await _api.GetTodayWaterTotalMlAsync();
                var calories = await _api.GetTodayCaloriesTotalAsync();

                if (calories <= 0.0001)
                {
                    CalorieValueText.Text = "Nincs adat";
                    CalorieHintText.Text = "Rögzíts kalóriát a mai napra!";
                }
                else
                {
                    CalorieValueText.Text = $"{calories:0} kcal";

                    // ha van cél (most nálad fixen 2000 a UI-ban)
                    var goal = 2000.0;
                    var remaining = Math.Max(0, goal - calories);
                    CalorieHintText.Text = $"{remaining:0} kcal maradt a mai keretből.";
                }


                if (waterMl <= 0.0001)
                {
                    WaterValueText.Text = "Nincs adat";
                    WaterHintText.Text = "Rögzíts vizet a mai napra!";
                }
                else
                {
                    var liters = waterMl / 1000.0;
                    WaterValueText.Text = $"{liters:0.0} L";
                    WaterHintText.Text = $"Ma eddig: {waterMl:0} ml";
                }
            }
            catch
            {
                WaterValueText.Text = "Nincs adat";
                WaterHintText.Text = "Nem sikerült betölteni.";
            }


        }

        private async void Dashboard_Loaded(object sender, System.Windows.RoutedEventArgs e)
        {
            try
            {
                var me = await _api.GetMeAsync();
                WelcomeText.Text = $"Üdv újra, {me.nev}! Merre tart ma az egészséged?";
                var d = await _api.GetDailyStatsAsync();
                WaterValueText.Text =
                    d.water > 0 ? $"{d.water:0.0} L" : "Nincs adat";
                CalorieValueText.Text =
                    d.calories > 0 ? $"{d.calories:0} kcal" : "Nincs adat";
                SleepValueText.Text =
                    d.sleep > 0 ? $"{d.sleep:0.0} óra" : "Nincs adat";
                MoodValueText.Text =
                    string.IsNullOrWhiteSpace(d.mood) ? "Nincs adat" : d.mood;
                WeightValueText.Text =
                    d.weight.HasValue ? $"{d.weight.Value:0.0} kg" : "Nincs adat";
            
         
                var parts = (me.nev ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var firstName = parts.Length > 0 ? parts[^1] : me.nev;

                WelcomeText.Text = $"Üdv újra, {firstName}! Merre tart ma az egészséged?";
            }
            catch
            {
                WelcomeText.Text = "Üdv újra! Merre tart ma az egészséged?";
                            WaterValueText.Text = "Nincs adat";
                CalorieValueText.Text = "Nincs adat";
                SleepValueText.Text = "Nincs adat";
                MoodValueText.Text = "Nincs adat";
                WeightValueText.Text = "Nincs adat";
            }
        }
        private void Exit(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }
        private void Minimize(object sender, RoutedEventArgs e)
        {
            Window window = Window.GetWindow(this);
            window.WindowState = WindowState.Minimized;

        }

        private void Maximize(object sender, RoutedEventArgs e)
        {
            Window window = Window.GetWindow(this);
            if (window.WindowState == WindowState.Normal)
                window.WindowState = WindowState.Maximized;
            else
                window.WindowState = WindowState.Normal;


        }
        private void Calories(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new CaloriesPage());
        }

        private void SleepPage(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Sleep());
        }

        private void BackToMain(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new MainPage());
        }

        private void WaterClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Water());
        }

        private void WeightClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Weight());
        }


    }
}

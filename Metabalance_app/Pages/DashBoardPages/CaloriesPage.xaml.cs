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
    public partial class CaloriesPage : Page
    {
        public CaloriesPage()
        {
            InitializeComponent();
            Loaded += CaloriesPage_Loaded;
        }

        private readonly ApiClient _api = new ApiClient();
        private const int DailyGoalKcal = 2000;

        private async void CaloriesPage_Loaded(object sender, RoutedEventArgs e)
        {
            await RefreshCaloriesAsync();
        }

        private async void AddFood_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // kcal beolvasás
                if (!int.TryParse(CaloriesBox.Text.Trim(), out int cal) || cal <= 0)
                {
                    MessageBox.Show("Írj be egy pozitív számot a kalóriához!");
                    return;
                }

                // ételnév
                string foodName = FoodNameBox.Text.Trim();
                if (string.IsNullOrWhiteSpace(foodName))
                    foodName = "Ismeretlen étel";

                // ✅ mentés backendbe
                await _api.CreateMeasurementAsync(
                    tipus: "KALORIA",
                    ertek: cal,
                    mertekegyseg: "kcal",
                    megjegyzes: foodName
                );

                // input ürítés
                FoodNameBox.Text = "";
                CaloriesBox.Text = "";

                // ✅ frissítés DB-ből
                await RefreshCaloriesAsync();

                MessageBox.Show("Étel rögzítve ✅");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }

        private async System.Threading.Tasks.Task RefreshCaloriesAsync()
        {
            try
            {
                // mai KALORIA mérések
                var list = await _api.GetMeasurementsAsync(tipus: "KALORIA", datum: DateTime.Today, limit: 100);

                var total = list.Sum(x => x.ertek);

                // UI: összeg + progress
                TotalCalories.Text = $"{total:0}";
                CaloriesProgress.Maximum = DailyGoalKcal;
                CaloriesProgress.Value = Math.Min(total, DailyGoalKcal);

                // UI: lista (legfrissebb felül)
                FoodsList.ItemsSource = list
                    .OrderByDescending(x => x.datum)
                    .Select(x =>
                    {
                        var name = string.IsNullOrWhiteSpace(x.megjegyzes) ? "Ismeretlen étel" : x.megjegyzes;
                        return $"{name} - {x.ertek:0} kcal";
                    })
                    .ToList();
            }
            catch
            {
                TotalCalories.Text = "0";
                CaloriesProgress.Value = 0;
                FoodsList.ItemsSource = null;
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
        private void SleepPage(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Sleep());
        }

        private void BackDash(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Dashboard());
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


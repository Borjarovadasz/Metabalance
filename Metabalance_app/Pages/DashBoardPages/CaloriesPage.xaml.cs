using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
using LiveCharts;
using YourAppName.Services;

namespace Metabalance_app.Pages
{

    public partial class CaloriesPage : Page
    {
        public ChartValues<double> CaloriesLast7Days { get; } = new ChartValues<double>();
        public ObservableCollection<string> Last7DaysLabels { get; } = new ObservableCollection<string>();

        private double _dailyGoalKcal = 2000; // default
        private int? _goalId = null;          // goals táblából

        public CaloriesPage()
        {
            InitializeComponent();

            DataContext = this; // <-- EZ HIÁNYZOTT, emiatt a Binding semmire nem mutatott

            Loaded += CaloriesPage_Loaded;
        }

        private async Task LoadCalorieGoalAsync()
        {
            var goals = await _api.GetGoalsAsync("KALORIA");
            var g = goals.FirstOrDefault();

            if (g != null)
            {
                _goalId = g.id;
                _dailyGoalKcal = g.celErtek;

                SlKcalGoal.Value = _dailyGoalKcal;
                TbKcalGoalValue.Text = $"{_dailyGoalKcal:0} kcal";
            }
            else
            {
                _goalId = null;
                _dailyGoalKcal = 2000;

                SlKcalGoal.Value = 2000;
                TbKcalGoalValue.Text = "2000 kcal";
            }
        }

        private async void CaloriesPage_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadCalorieGoalAsync();
            await RefreshCaloriesAsync();
        }

 

        private readonly ApiClient _api = new ApiClient();

        private async void BtnSaveKcalGoal_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var newGoal = SlKcalGoal.Value;

                if (_goalId == null)
                {
                    await _api.CreateGoalAsync("KALORIA", newGoal, "kcal");
                    var goals = await _api.GetGoalsAsync("KALORIA");
                    _goalId = goals.FirstOrDefault()?.id;
                }
                else
                {
                    await _api.UpdateGoalAsync(_goalId.Value, newGoal, "kcal");
                }

                _dailyGoalKcal = newGoal;

                await RefreshCaloriesAsync();
                MessageBox.Show("Kalória cél elmentve ✅");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }
        private async void SlKcalGoal_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (TbKcalGoalValue == null) return;

            _dailyGoalKcal = SlKcalGoal.Value;

            TbKcalGoalValue.Text = $"{_dailyGoalKcal:0} kcal";
            GoalCaloriesText.Text = $"/ {_dailyGoalKcal:0} Kalória";

            CaloriesProgress.Maximum = _dailyGoalKcal;

            try
            {
                if (_goalId == null)
                {
                    await _api.CreateGoalAsync("KALORIA", _dailyGoalKcal, "kcal");
                    var goals = await _api.GetGoalsAsync("KALORIA");
                    _goalId = goals.FirstOrDefault()?.id;
                }
                else
                {
                    await _api.UpdateGoalAsync(_goalId.Value, _dailyGoalKcal, "kcal");
                }
            }
            catch
            {
                // nem dobunk hibát slider húzás közben
            }
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
                GoalCaloriesText.Text = $"/ {_dailyGoalKcal:0} Kalória";
                CaloriesProgress.Maximum = _dailyGoalKcal;
                CaloriesProgress.Value = Math.Min(total, _dailyGoalKcal);

                // UI: lista (legfrissebb felül)
                FoodsList.ItemsSource = list
                    .OrderByDescending(x => x.datum)
                    .Select(x =>
                    {
                        var name = string.IsNullOrWhiteSpace(x.megjegyzes) ? "Ismeretlen étel" : x.megjegyzes;
                        return $"{name} - {x.ertek:0} kcal";
                    })
                    .ToList();

                                var days = Enumerable.Range(0, 7)
                    .Select(i => DateTime.Today.AddDays(-6 + i))
                    .ToList();

                Last7DaysLabels.Clear();
                CaloriesLast7Days.Clear();

                foreach (var d in days)
                {
                    Last7DaysLabels.Add(d.ToString("MM.dd"));

                    var dayList = await _api.GetMeasurementsAsync(
                        tipus: "KALORIA",
                        datum: d,
                        limit: 500
                    );

                    var dayTotal = dayList.Sum(x => x.ertek);
                    CaloriesLast7Days.Add(dayTotal);
                }
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

        private void MoodClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Mood());
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

        private void CaloriesBox_TextChanged(object sender, TextChangedEventArgs e)
        {

        }
    }


}


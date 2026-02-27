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
using Metabalance_app.Helpers;
using YourAppName.Services;
using Metabalance_app.Helpers;
using Metabalance_app.Services;

namespace Metabalance_app.Pages
{

    public partial class CaloriesPage : Page
    {
        public ChartValues<double> CaloriesLast7Days { get; } = new ChartValues<double>();
        public ObservableCollection<string> Last7DaysLabels { get; } = new ObservableCollection<string>();

        private double _dailyGoalKcal = 2000; 
        private int? _goalId = null;

        public CaloriesPage()
        {
            InitializeComponent();
            DataContext = this;
            ProfileImageAttach.Attach(HeaderProfileImage);
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

        private void SlKcalGoal_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (TbKcalGoalValue == null) return;

            _dailyGoalKcal = SlKcalGoal.Value;

            TbKcalGoalValue.Text = $"{_dailyGoalKcal:0} kcal";
            GoalCaloriesText.Text = $"/ {_dailyGoalKcal:0} Kalória";

            CaloriesProgress.Maximum = _dailyGoalKcal;
        }
        private async void AddFood_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!int.TryParse(CaloriesBox.Text.Trim(), out int cal) || cal <= 0)
                {
                    await ToastFunction.ShowError("Írj be egy pozitív számot a kalóriához!");
                    return;
                }

                string foodName = FoodNameBox.Text.Trim();
                if (string.IsNullOrWhiteSpace(foodName))
                    foodName = "Ismeretlen étel";

                await _api.CreateMeasurementAsync(
                    tipus: "KALORIA",
                    ertek: cal,
                    mertekegyseg: "kcal",
                    megjegyzes: foodName
                );

                FoodNameBox.Text = "";
                CaloriesBox.Text = "";

                await RefreshCaloriesAsync();

                await ToastFunction.ShowSuccess("Étel rögzítve ✅");
            }
            catch (Exception ex)
            {
                await ToastFunction.ShowError("Hiba: " + ex.Message);
            }
        }

        private async void SaveGoal_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_dailyGoalKcal <= 0)
                {
                    await ToastFunction.ShowError("A cél értéke legyen 0-nál nagyobb!");
                    return;
                }

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

                await ToastFunction.ShowSuccess("Cél elmentve ✅");
            }
            catch (Exception ex)
            {
                await ToastFunction.ShowError("Hiba mentéskor: " + ex.Message);
            }
        }
        private async System.Threading.Tasks.Task RefreshCaloriesAsync()
        {
            try
            {
               
                var list = await _api.GetMeasurementsAsync(tipus: "KALORIA", datum: DateTime.Today, limit: 100);

                var total = list.Sum(x => x.ertek);

              
                TotalCalories.Text = $"{total:0}";
                GoalCaloriesText.Text = $"/ {_dailyGoalKcal:0} Kalória";
                CaloriesProgress.Maximum = _dailyGoalKcal;
                CaloriesProgress.Value = Math.Min(total, _dailyGoalKcal);

                
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
        private void ProfilePage(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new ProfilePage());
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

     
    }


}


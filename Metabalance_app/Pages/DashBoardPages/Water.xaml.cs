using System;
using System.Collections.Generic;
using System.Globalization;
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
using Metabalance_app.Helpers;
using System.Windows.Shapes;
using YourAppName.Services;
using Metabalance_app.Controls;

namespace Metabalance_app.Pages
{
 
    public partial class Water : Page
    {
        private readonly ApiClient _api = new ApiClient();
        private double _dailyGoalMl = 2000;
        private int? _goalId = null;


        public Water()
        {
            InitializeComponent();
            Loaded += Water_Loaded;
            Loaded += async (_, __) =>
            {
                await ProfileImageHelper.SetAsync(HeaderProfileImage);
            };
        }

        private async Task LoadWaterGoalAsync()
        {
            var goals = await _api.GetGoalsAsync("VIZ");
            var g = goals.FirstOrDefault();

            if (g != null)
            {
                _goalId = g.id;
                _dailyGoalMl = g.celErtek;
            }
            else
            {
                _goalId = null;
                _dailyGoalMl = 2000; 
            }

            SlGoal.Value = _dailyGoalMl;
            TbGoalValue.Text = $"{_dailyGoalMl:0} ml";
        }
        private async void SaveGoal_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_dailyGoalMl <= 0)
                {
                    await ToastFunction.ShowError("A cél értéke legyen 0-nál nagyobb!");
                    return;
                }

                if (_goalId == null)
                {
                    await _api.CreateGoalAsync("VIZ", _dailyGoalMl, "ml");
                    var goals = await _api.GetGoalsAsync("VIZ");
                    _goalId = goals.FirstOrDefault()?.id;
                }
                else
                {
                    await _api.UpdateGoalAsync(_goalId.Value, _dailyGoalMl, "ml");
                }

                await RefreshWaterProgressAsync();
                await ToastFunction.ShowSuccess("Víz cél elmentve ✅");
            }
            catch (Exception ex)
            {
                await ToastFunction.ShowError("Hiba mentéskor: " + ex.Message);
            }
        }
        private async void Water_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadWaterGoalAsync();
            await RefreshWaterProgressAsync();
        }
        private void SaveWater_Click(object sender, RoutedEventArgs e)
        {
            if (!int.TryParse(WaterAmountText.Text.Trim(), out var v)) v = 0;
            v += 250;
            WaterAmountText.Text = v.ToString();
        }
        private void Minus_Click(object sender, RoutedEventArgs e)
        {
            if (!int.TryParse(WaterAmountText.Text.Trim(), out var v)) v = 0;
            v = Math.Max(0, v - 250);
            WaterAmountText.Text = v.ToString();
        }
        private void ProfilePage(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new ProfilePage());
        }
        private async void BtnAddIntake_Click(object sender, RoutedEventArgs e)
        {
            try
            {
               
                if (!double.TryParse(WaterAmountText.Text.Trim(),
                        NumberStyles.Any,
                        CultureInfo.InvariantCulture,
                        out var ml))
                {
                  
                    if (!double.TryParse(WaterAmountText.Text.Trim(),
                            NumberStyles.Any,
                            new CultureInfo("hu-HU"),
                            out ml))
                    {
                        await ToastFunction.ShowError("Írj be egy számot (ml)!");
                        return;
                    }
                }

                if (ml <= 0)
                {
                    await ToastFunction.ShowError("Adj meg 0-nál nagyobb értéket!");
                    return;
                }

                await _api.CreateMeasurementAsync("VIZ", ml, "ml");
                WaterAmountText.Text = "250";
                await RefreshWaterProgressAsync();

                await ToastFunction.ShowSuccess("Vízbevitel rögzítve ✅");
            }
            catch (Exception ex)
            {
                await ToastFunction.ShowError("Hiba: " + ex.Message);
            }
        }

        private void SlGoal_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            _dailyGoalMl = SlGoal.Value;
            TbGoalValue.Text = $"{_dailyGoalMl:0} ml";
        }
        private async Task RefreshWaterProgressAsync()
        {
            try
            {
                var goal = (double)(int)SlGoal.Value; 
                var list = await _api.GetTodayMeasurementsAsync("VIZ");

             
                var totalMl = list.Sum(x => x.ertek);

      
                GoalText.Text = $"Cél: {goal:0} ml";
                DailyProgressBar.Maximum = goal;
                DailyProgressBar.Value = Math.Min(totalMl, goal);

                var remaining = Math.Max(0, goal - totalMl);
                RemainingText.Text = $"Hátralévő: {remaining:0} ml";

                var percent = goal <= 0 ? 0 : (totalMl / goal) * 100.0;
                if (percent < 0) percent = 0;
                if (percent > 100) percent = 100;

                PercentText.Text = $"{percent:0}%";
                CircleProgress.StrokeDashArray = new System.Windows.Media.DoubleCollection
                {
                    percent, 100 - percent
                };

                // üzenet
                if (totalMl <= 0.0001)
                    TbMessage.Text = "Kezdd el a napot vízzel!";
                else if (remaining <= 0.0001)
                    TbMessage.Text = "Szuper! Megvan a napi cél ✅";
                else
                    TbMessage.Text = "Csak így tovább, folytasd a napot vízzel!";
            }
            catch
            {
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

        private async Task ShowToast(string text)
        {
            ToastText.Text = text;
            Toast.Visibility = Visibility.Visible;

            await Task.Delay(2000);

            Toast.Visibility = Visibility.Collapsed;
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

        private void SleepPage(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Sleep());
        }

        private void WeightClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Weight());
        }


        private void MoodClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Mood());
        }

    }
}

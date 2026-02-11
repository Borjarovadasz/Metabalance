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
using System.Windows.Shapes;
using YourAppName.Services;

namespace Metabalance_app.Pages
{
 
    public partial class Water : Page
    {
        private readonly ApiClient _api = new ApiClient();

        public Water()
        {
            InitializeComponent();
            Loaded += Water_Loaded;
        }

        private async void Water_Loaded(object sender, RoutedEventArgs e)
        {
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

        private async void BtnAddIntake_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // 1) input kiolvasás (ml)
                if (!double.TryParse(WaterAmountText.Text.Trim(),
                        NumberStyles.Any,
                        CultureInfo.InvariantCulture,
                        out var ml))
                {
                    // ha hu-HU miatt vesszőt ír be valaki:
                    if (!double.TryParse(WaterAmountText.Text.Trim(),
                            NumberStyles.Any,
                            new CultureInfo("hu-HU"),
                            out ml))
                    {
                        MessageBox.Show("Írj be egy számot (ml)!");
                        return;
                    }
                }

                if (ml <= 0)
                {
                    MessageBox.Show("Adj meg 0-nál nagyobb értéket!");
                    return;
                }

                await _api.CreateMeasurementAsync("VIZ", ml, "ml");
                WaterAmountText.Text = "250";
                await RefreshWaterProgressAsync();

                MessageBox.Show("Vízbevitel rögzítve ✅");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }

        private async void SlGoal_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            TbGoalValue.Text = $"{(int)SlGoal.Value} ml";
            await RefreshWaterProgressAsync();
        }

   
        private async Task RefreshWaterProgressAsync()
        {
            try
            {
                var goal = (double)(int)SlGoal.Value; // ml
                var list = await _api.GetTodayMeasurementsAsync("VIZ");

                // összes mai ml
                var totalMl = list.Sum(x => x.ertek);

                // UI
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

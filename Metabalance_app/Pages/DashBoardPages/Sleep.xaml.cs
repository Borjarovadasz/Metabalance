using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
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
using Xceed.Wpf.Toolkit;
using YourAppName.Services;

namespace Metabalance_app.Pages
{

    public partial class Sleep : Page
    {
        public Sleep()
        {
            InitializeComponent();

            // órák
            for (int h = 0; h < 24; h++)
            {
                BedHourBox.Items.Add(h);
                WakeHourBox.Items.Add(h);
            }

            // percek (5 perces lépés)
            for (int m = 0; m < 60; m += 5)
            {
                BedMinuteBox.Items.Add(m);
                WakeMinuteBox.Items.Add(m);
            }

            // alapértékek
            BedHourBox.SelectedItem = 22;
            BedMinuteBox.SelectedItem = 0;
            WakeHourBox.SelectedItem = 6;
            WakeMinuteBox.SelectedItem = 0;
        }

        private async void Save_Click(object sender, RoutedEventArgs e)
        {
            int bh = (int)BedHourBox.SelectedItem;
            int bm = (int)BedMinuteBox.SelectedItem;
            int wh = (int)WakeHourBox.SelectedItem;
            int wm = (int)WakeMinuteBox.SelectedItem;

            var start = DateTime.Today.AddHours(bh).AddMinutes(bm);
            var end = DateTime.Today.AddHours(wh).AddMinutes(wm);

            // UI kiírás
            var endCalc = end <= start ? end.AddDays(1) : end;
            var diff = endCalc - start;
            ResultText.Text =
                $"Alvás: {(int)diff.TotalHours} óra {diff.Minutes:00} perc";

            // ⬇️ EZ AZ EGY SOR ad neki reference-t
            var api = new ApiClient();
            await api.AddSleepAsync(start, end);
        }

        private void Exit(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }
        private void Minimize(object sender, RoutedEventArgs e)
        {
            Window window = Window.GetWindow(this);
            window.WindowState = System.Windows.WindowState.Minimized;
        }

        private void Maximize(object sender, RoutedEventArgs e)
        {
            Window window = Window.GetWindow(this);

            if (window.WindowState == System.Windows.WindowState.Normal)
                window.WindowState = System.Windows.WindowState.Maximized;
            else
                window.WindowState = System.Windows.WindowState.Normal;
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

        private void WeightClick(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Weight());
        }
    }
}

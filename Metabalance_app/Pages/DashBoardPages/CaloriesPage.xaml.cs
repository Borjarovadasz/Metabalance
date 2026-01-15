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

namespace Metabalance_app.Pages
{
    public partial class CaloriesPage : Page
    {
        public CaloriesPage()
        {
            InitializeComponent();
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

        private void Button_Click(object sender, RoutedEventArgs e)
        {
             
        }
        private int totalCalories = 0;

        private void AddFood_Click(object sender, RoutedEventArgs e)
        {
            if (!int.TryParse(CaloriesBox.Text.Trim(), out int cal))
            {
                MessageBox.Show("Írj be egy számot!");
                return;
            }

            totalCalories += cal;

            
            TotalCalories.Text = totalCalories.ToString();
            CaloriesProgress.Value = totalCalories;

          
            string foodName = FoodNameBox.Text.Trim();
            if (string.IsNullOrWhiteSpace(foodName))
                foodName = "Ismeretlen étel";

            
            FoodsList.Items.Insert(0, $"{foodName} - {cal} kcal");

            FoodNameBox.Text = "";
            CaloriesBox.Text = "";
        }
    }


}


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
 
    public partial class Water : Page
    {
        public Water()
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

        private void Plus_Click(object sender, RoutedEventArgs e)
        {
            if (int.TryParse(TbIntake.Text, out int currentValue))
            {
                currentValue += 200;      
                TbIntake.Text = currentValue.ToString();
            }
        }

        private void Minus_Click(object sender, RoutedEventArgs e)
        {
            if (int.TryParse(TbIntake.Text, out int currentValue))
            {
                currentValue -= 200;      
                if (currentValue < 0) currentValue = 0; 
                TbIntake.Text = currentValue.ToString();
            }
        }

        private int dailyTotal = 0; 

        private void BtnAddIntake_Click(object sender, RoutedEventArgs e)
        {
            if (int.TryParse(TbIntake.Text, out int intake))
            {
                dailyTotal += intake;

                int goal = (int)SlGoal.Value;

              
                int remaining = goal - dailyTotal;
                if (remaining < 0) remaining = 0;
                TbRemaining.Text = $"Hátralévő: {remaining} ml";

                
                PbDaily.Maximum = goal;
                PbDaily.Value = dailyTotal;

                
                if (dailyTotal >= goal)
                    TbMessage.Text = "Gratulálunk! Elérted a napi célt!";
                else
                    TbMessage.Text = "Csak így tovább, folytasd a napot vízzel!";

                
                double percent = Math.Min((double)dailyTotal / goal * 100, 100);
                TbPercent.Text = $"{Math.Round(percent)}%";

            }
        }
        private void SlGoal_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (TbGoalValue != null)
            {
                TbGoalValue.Text = $"{(int)SlGoal.Value} ml";
            }
        }


    }
}

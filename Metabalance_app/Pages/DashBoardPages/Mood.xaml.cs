using LiveCharts;
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
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using YourAppName.Services;


namespace Metabalance_app.Pages
{
    /// <summary>
    /// Interaction logic for Mood.xaml
    /// </summary>
    /// 

  

    public partial class Mood : Page
    {

        public ChartValues<double> MoodLast7Days { get; } = new ChartValues<double>();
        public ObservableCollection<string> Last7DaysLabels { get; } = new ObservableCollection<string>();

        public string SelectedDayTitle { get; set; } = "Válassz egy napot";
public string SelectedDayDetails { get; set; } = "Kattints egy napra, és itt látod az aznapi hangulatokat.";

private void RefreshBindings()
{
    var dc = DataContext;
    DataContext = null;
    DataContext = dc;
}


        private readonly ApiClient _api = new ApiClient();
        public Mood()
        {
            InitializeComponent();

            DataContext = this;          // <-- EZ HIÁNYZOTT
            BuildCalendar(_shownMonth);  // most már a binding látni fogja

            Loaded += async (_, __) =>
            {
                BuildCalendar(_shownMonth);
                await RefreshMoodChartAsync();
                RefreshBindings(); // ha kell nálad
            };
        }

        public class CalendarCell
        {
            public bool IsDay { get; set; }          // true = valódi nap, false = üres hely
            public int Day { get; set; }             // 1..31
            public string DayText => IsDay ? Day.ToString() : "";
            public double Opacity => IsDay ? 1.0 : 0.0;
            public DateTime Date { get; set; }
        }

        private static string MoodLabel(double v) => v switch
        {
            5 => "Vidám",
            4 => "Boldog",
            3 => "Semleges",
            2 => "Szomorú",
            1 => "Dühös/Stresszes",
            _ => "Ismeretlen"
        };

        private async void DayButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not Button b || b.Tag is not CalendarCell cell || !cell.IsDay) return;

            try
            {
                var moods = await _api.GetMeasurementsAsync("HANGULAT", cell.Date, limit: 500);

                if (moods.Count == 0)
                {
                    MessageBox.Show($"{cell.Date:yyyy-MM-dd}\nNincs hangulat bejegyzés.");
                    return;
                }

                var lines = moods
                    .OrderBy(x => x.datum)
                    .Select(x =>
                    {
                        string time = x.datum.ToString("HH:mm");
                        string label = MoodLabel(x.ertek);
                        string note = string.IsNullOrWhiteSpace(x.megjegyzes) ? "" : $" — {x.megjegyzes}";
                        return $"{time} – {label}{note}";
                    });

                MessageBox.Show($"{cell.Date:yyyy-MM-dd}\n\n" + string.Join("\n", lines));
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }


        private double GetSelectedMoodValue()
        {
            // Keresd meg a bejelölt RadioButton-t a MoodGroup-ból
            var selected = FindVisualChildren<RadioButton>(this)
                .FirstOrDefault(rb => rb.GroupName == "MoodGroup" && rb.IsChecked == true);

            if (selected == null) throw new Exception("Válassz hangulatot!");

            return selected.Content?.ToString() switch
            {
                "Vidám" => 5,
                "Boldog" => 4,
                "Semleges" => 3,
                "Szomorú" => 2,
                "Dühös" => 1,
                "Stresszes" => 1,
                _ => throw new Exception("Ismeretlen hangulat")
            };
        }

        private static IEnumerable<T> FindVisualChildren<T>(DependencyObject depObj) where T : DependencyObject
        {
            if (depObj == null) yield break;
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(depObj); i++)
            {
                var child = VisualTreeHelper.GetChild(depObj, i);
                if (child is T t) yield return t;
                foreach (var childOfChild in FindVisualChildren<T>(child))
                    yield return childOfChild;
            }
        }

        private async void Day_Checked(object sender, RoutedEventArgs e)
        {
            if (sender is not RadioButton rb ||
                rb.Tag is not CalendarCell cell ||
                !cell.IsDay)
                return;

            try
            {
                var moods = await _api.GetMeasurementsAsync("HANGULAT", cell.Date, limit: 500);

                SelectedDayTitle = $"{cell.Date:yyyy.MM.dd}";

                if (moods.Count == 0)
                {
                    SelectedDayDetails = "Nincs hangulat bejegyzés.";
                }
                else
                {
                    SelectedDayDetails = string.Join(Environment.NewLine,
                        moods.OrderBy(x => x.datum).Select(x =>
                        {
                            string time = x.datum.ToString("HH:mm");
                            string label = MoodLabel(x.ertek);
                            string note = string.IsNullOrWhiteSpace(x.megjegyzes) ? "" : $" — {x.megjegyzes}";
                            return $"{time} – {label}{note}";
                        }));
                }

                RefreshBindings();
            }
            catch (Exception ex)
            {
                SelectedDayTitle = "Hiba";
                SelectedDayDetails = ex.Message;
                RefreshBindings();
            }
        }

        private async void SaveMoodBtn_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // kiválasztott hangulat érték (5..1)
                double moodValue = GetSelectedMoodValue(); // lentebb adom
                string note = MoodNoteBox.Text?.Trim() ?? "";
                if (note == "Rövid jegyzet írása a hangulatodhoz...") note = "";

                await _api.CreateMeasurementAsync(
                    tipus: "HANGULAT",
                    ertek: moodValue,
                    mertekegyseg: "skala",
                    megjegyzes: note,
                    datum: DateTime.Now   // <-- EZ A LÉNYEG (időponttal ment)
                );

                MessageBox.Show("Hangulat rögzítve ✅");
                // opcionális: frissítsd a chartot is

                await RefreshMoodChartAsync();
                RefreshBindings();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Hiba: " + ex.Message);
            }
        }

        private async Task RefreshMoodChartAsync()
        {
            var days = Enumerable.Range(0, 7)
                .Select(i => DateTime.Today.AddDays(-6 + i))
                .ToList();

            Last7DaysLabels.Clear();
            MoodLast7Days.Clear();

            foreach (var d in days)
            {
                Last7DaysLabels.Add(d.ToString("MM.dd"));

                var list = await _api.GetMeasurementsAsync("HANGULAT", d, limit: 500);

                if (list.Count == 0)
                {
                    MoodLast7Days.Add(0); // vagy pl. MoodLast7Days.Add(MoodLast7Days.LastOrDefault());
                }
                else
                {
                    double avg = list.Average(x => x.ertek);
                    MoodLast7Days.Add(Math.Round(avg, 2));
                }
            }
        }

        public ObservableCollection<CalendarCell> CalendarCells { get; } = new();
        public string MonthTitle { get; set; } = "";

        private DateTime _shownMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        private void BuildCalendar(DateTime month)
        {
            CalendarCells.Clear();

            var first = new DateTime(month.Year, month.Month, 1);
            MonthTitle = $"Hangulat ({first:yyyy MMMM})";

            int daysInMonth = DateTime.DaysInMonth(first.Year, first.Month);

            // Hétfő = 0, Kedd = 1 ... Vasárnap = 6
            int startOffset = ((int)first.DayOfWeek + 6) % 7;

            // üres cellák az elejére
            for (int i = 0; i < startOffset; i++)
                CalendarCells.Add(new CalendarCell { IsDay = false });

            // napok
            for (int d = 1; d <= daysInMonth; d++)
            {
                CalendarCells.Add(new CalendarCell
                {
                    IsDay = true,
                    Day = d,
                    Date = new DateTime(first.Year, first.Month, d)
                });
            }

            // ha kell, feltölthetjük a végén üressel, hogy teljes sor legyen (opcionális)
            while (CalendarCells.Count % 7 != 0)
                CalendarCells.Add(new CalendarCell { IsDay = false });

            // ha ez VM-ben van: PropertyChanged MonthTitle-ra
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
        private void BackDash(object sender, RoutedEventArgs e)
        {
            NavigationService.Navigate(new Dashboard());
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

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Metabalance_app.Services;

namespace YourAppName.Services
{
    public class ApiClient
    {
        private const string BaseUrl = "http://localhost:5000/";
        private readonly HttpClient _http;

        public ApiClient()
        {
            _http = new HttpClient { BaseAddress = new Uri(BaseUrl) };
        }

        // ===== DTO-k =====

        public class MeasurementDto
        {
            public int id { get; set; }
            public string tipus { get; set; } = "";
            public double ertek { get; set; }
            public string? mertekegyseg { get; set; }
            public DateTime datum { get; set; }
            public string? megjegyzes { get; set; }
        }

        public class UserDto
        {
            public int azonosito { get; set; }
            public string nev { get; set; } = "";
            public string email { get; set; } = "";
            public string szerepkor { get; set; } = "";
        }

        private class LoginResponse
        {
            public string token { get; set; } = "";
        }

        public class DailyStatsDto
        {
            public double water { get; set; }
            public double calories { get; set; }
            public double sleep { get; set; }
            public string? mood { get; set; }
            public double? weight { get; set; }
        }

        // ===== belső helper =====

        private static void EnsureToken()
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token");
        }

        private HttpRequestMessage Authed(HttpMethod method, string url)
        {
            EnsureToken();
            var req = new HttpRequestMessage(method, url);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", AuthState.token);
            return req;
        }

        private static async Task EnsureSuccess(HttpResponseMessage resp)
        {
            if (resp.IsSuccessStatusCode) return;
            throw new Exception(await resp.Content.ReadAsStringAsync());
        }

        // ===== AUTH =====

        public async Task<bool> RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password,
            string? phone = null,
            string? gender = null)
        {
            var payload = new
            {
                keresztnev = firstName,
                vezeteknev = lastName,
                email,
                password,
                phone,
                gender
            };

            var resp = await _http.PostAsJsonAsync("api/auth/register", payload);
            if (resp.IsSuccessStatusCode) return true;

            throw new Exception(await resp.Content.ReadAsStringAsync());
        }

        public async Task<bool> LoginAsync(string email, string password)
        {
            var resp = await _http.PostAsJsonAsync("api/auth/login", new { email, password });
            if (!resp.IsSuccessStatusCode) return false;

            var data = await resp.Content.ReadFromJsonAsync<LoginResponse>();
            if (data == null || string.IsNullOrWhiteSpace(data.token))
                throw new Exception("Sikeres login, de nem jött token a backendtől.");

            AuthState.token = data.token;
            return true;
        }

        public async Task<UserDto> GetMeAsync()
        {
            var req = Authed(HttpMethod.Get, "api/auth/me");
            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);

            return await resp.Content.ReadFromJsonAsync<UserDto>()
                   ?? throw new Exception("Üres válasz");
        }

        // ===== MEASUREMENTS (egységesen: tipus/ertek/mertekegyseg/datum/megjegyzes) =====

        public async Task CreateMeasurementAsync(
            string tipus,
            double ertek,
            string mertekegyseg,
            string? megjegyzes = null,
            DateTime? datum = null)
        {
            var body = new
            {
                tipus,
                ertek,
                mertekegyseg,
                datum = (datum ?? DateTime.Today).ToString("o"), // TODAY -> napi szűréshez stabil
                megjegyzes
            };

            var req = Authed(HttpMethod.Post, "api/measurements");
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        public async Task<List<MeasurementDto>> GetMeasurementsAsync(string tipus, DateTime datum, int limit = 200)
        {
            var url =
                $"api/measurements?tipus={Uri.EscapeDataString(tipus)}&datum={datum:yyyy-MM-dd}&limit={limit}";

            var req = Authed(HttpMethod.Get, url);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);

            return await resp.Content.ReadFromJsonAsync<List<MeasurementDto>>() ?? new List<MeasurementDto>();
        }

        public Task<List<MeasurementDto>> GetTodayMeasurementsAsync(string tipus)
            => GetMeasurementsAsync(tipus, DateTime.Today);

        // ===== NAPI ÖSSZEGZÉSEK =====

        public async Task<double> GetTodayWaterTotalMlAsync()
        {
            var list = await GetTodayMeasurementsAsync("VIZ");
            return list.Sum(x => x.ertek);
        }

        public async Task<double> GetTodayCaloriesTotalAsync()
        {
            var list = await GetTodayMeasurementsAsync("KALORIA");
            return list.Sum(x => x.ertek);
        }

        public async Task<double> GetTodaySleepTotalHoursAsync()
        {
            var list = await GetTodayMeasurementsAsync("ALVAS");
            return list.Sum(x => x.ertek); // ebben a tiszta verzióban ALVAS órában van tárolva
        }

        public async Task<double> GetLatestWeightAsync()
        {
            var list = await GetTodayMeasurementsAsync("TESTSULY");

            var last = list
                .OrderByDescending(x => x.datum)   // ha datum tartalmaz időt is
                .FirstOrDefault();

            return last?.ertek ?? 0.0;
        }

        public class GoalDto
        {
            public int id { get; set; }
            public string tipus { get; set; } = "";
            public double celErtek { get; set; }
            public string mertekegyseg { get; set; } = "";
            public bool aktiv { get; set; }
        }

        public async Task<List<GoalDto>> GetGoalsAsync(string tipus)
        {
            var url = $"api/goals?tipus={Uri.EscapeDataString(tipus)}&aktiv=1";
            var req = Authed(HttpMethod.Get, url);
            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);

            return await resp.Content.ReadFromJsonAsync<List<GoalDto>>() ?? new List<GoalDto>();
        }

        public async Task CreateGoalAsync(string tipus, double celErtek, string mertekegyseg)
        {
            var body = new { tipus, celErtek, mertekegyseg, aktiv = 1 };
            var req = Authed(HttpMethod.Post, "api/goals");
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        public async Task UpdateGoalAsync(int id, double celErtek, string mertekegyseg)
        {
            var body = new { celErtek, mertekegyseg, aktiv = 1 };
            var req = Authed(HttpMethod.Put, $"api/goals/{id}");
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }



        public async Task<MeasurementDto?> GetTodaySleepEntryAsync()
        {
            var list = await GetTodayMeasurementsAsync("ALVAS");
            return list.OrderByDescending(x => x.datum).FirstOrDefault();
        }

        // ===== ALVÁS MENTÉS (ALVAS órában, note: "HH:mm-HH:mm") =====

        public async Task AddSleepAsync(DateTime start, DateTime end)
        {
            if (end <= start) end = end.AddDays(1);
            var diff = end - start;

            double hours = Math.Round(diff.TotalHours, 2);

            await CreateMeasurementAsync(
                tipus: "ALVAS",
                ertek: hours,
                mertekegyseg: "h",
                megjegyzes: $"{start:HH:mm}-{end:HH:mm}",
                datum: DateTime.Today
            );
        }

        // ===== STATISTICS =====

        public async Task<DailyStatsDto> GetDailyStatsAsync()
        {
            var req = Authed(HttpMethod.Get, "api/statistics/daily");
            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);

            return await resp.Content.ReadFromJsonAsync<DailyStatsDto>()
                   ?? throw new Exception("Üres válasz");
        }
    }
}

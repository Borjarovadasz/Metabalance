using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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

        // 🔥 KÖZÖS HttpClient + CookieContainer (ne vesszen el a cookie oldalváltáskor)
        private static readonly HttpClient _http = CreateHttp();

        private static HttpClient CreateHttp()
        {
            var handler = new HttpClientHandler
            {
                UseCookies = true,
                CookieContainer = AuthState.Cookies
            };

            return new HttpClient(handler)
            {
                BaseAddress = new Uri(BaseUrl)
            };
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

        public class ProfileDto
        {
            public int azonosito { get; set; }
            public string nev { get; set; } = "";
            public string email { get; set; } = "";
            public string? phone { get; set; }
            public string? gender { get; set; }
            public string? profile_image { get; set; }
            public string szerepkor { get; set; } = "";
            public DateTime regisztracio_datum { get; set; }

            public class OsszStats
            {
                public string viz { get; set; } = "0";
                public string alvas { get; set; } = "0";
                public string kaloria { get; set; } = "0";
                public string testsuly { get; set; } = "0";
                public string hangulat { get; set; } = "0";
            }
            public OsszStats ossz_statisztikak { get; set; } = new();
        }

        public class UserProfileDto
        {
            public int azonosito { get; set; }
            public string nev { get; set; } = "";
            public string email { get; set; } = "";
            public string? phone { get; set; }
            public string? gender { get; set; }
            public string? profile_image { get; set; }
            public string szerepkor { get; set; } = "";
            public DateTime regisztracio_datum { get; set; }

            public OsszStatsDto? ossz_statisztikak { get; set; }
            public class OsszStatsDto
            {
                public string viz { get; set; } = "0";
                public string alvas { get; set; } = "0";
                public string kaloria { get; set; } = "0";
                public string testsuly { get; set; } = "0";
                public string hangulat { get; set; } = "0";
            }
        }

        public async Task<UserProfileDto> GetOwnProfileAsync()
        {
            var req = Authed(HttpMethod.Get, "api/users/me");
            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);

            return await resp.Content.ReadFromJsonAsync<UserProfileDto>()
                   ?? throw new Exception("Üres válasz");
        }


        public async Task UpdateMyProfileAsync(
                string? keresztnev,
                string? vezeteknev,
                string? email,
                string? phone,
                string? gender,
                string? profileImage)
        {
            var body = new
            {
                keresztnev,
                vezeteknev,
                email,
                phone,
                gender,
                profileImage
            };

            var req = Authed(HttpMethod.Put, "api/users/me"); 
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        public async Task DeleteAccountAsync(string jelszo)
        {
            var req = Authed(HttpMethod.Delete, "api/users/delete");

            req.Content = JsonContent.Create(new { jelszo });

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        
        private class LoginResponse
        {
            public string? token { get; set; }
            public string? lejarat { get; set; }
            public UserDto? felhasznalo { get; set; }
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

        // Auth: ha van Bearer token -> küldjük, amúgy cookie megy automatikusan
        private static HttpRequestMessage Authed(HttpMethod method, string url)
        {
            var req = new HttpRequestMessage(method, url);

            if (!string.IsNullOrWhiteSpace(AuthState.token))
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
            // Avoid sending a stale Bearer token from a previous session.
            AuthState.token = null;

            var resp = await _http.PostAsJsonAsync("api/auth/login", new { email, password });
            if (!resp.IsSuccessStatusCode) return false;

            var data = await resp.Content.ReadFromJsonAsync<LoginResponse>();

            AuthState.token = data != null && !string.IsNullOrWhiteSpace(data.token)
                ? data.token
                : null;

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

        // ===== MEASUREMENTS =====

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
                datum = (datum ?? DateTime.Today).ToString("o"),
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
            return list.Sum(x => x.ertek);
        }

        public async Task<double> GetLatestWeightAsync()
        {
            var list = await GetTodayMeasurementsAsync("TESTSULY");
            var last = list.OrderByDescending(x => x.datum).FirstOrDefault();
            return last?.ertek ?? 0.0;
        }

        // ===== ADMIN =====

        public class AdminUserDto
        {
            public int azonosito { get; set; }
            public string nev { get; set; } = "";
            public string email { get; set; } = "";
            public string szerepkor { get; set; } = "";
            public bool aktiv { get; set; }
        }

        public async Task<List<AdminUserDto>> AdminListUsersAsync()
        {
            var req = Authed(HttpMethod.Get, "api/admin/users");
            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);

            return await resp.Content.ReadFromJsonAsync<List<AdminUserDto>>() ?? new();
        }

        public async Task AdminCreateUserAsync(string keresztnev, string vezeteknev, string email, string jelszo, string szerepkor, bool aktiv)
        {
            var body = new { email, jelszo, szerepkor, aktiv = aktiv ? 1 : 0, keresztnev, vezeteknev };
            var req = Authed(HttpMethod.Post, "api/admin/users");
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        public async Task AdminUpdateUserAsync(int id, string email, string? jelszo, bool aktiv)
        {
            var body = new { email, jelszo = string.IsNullOrWhiteSpace(jelszo) ? null : jelszo, aktiv = aktiv ? 1 : 0 };
            var req = Authed(HttpMethod.Put, $"api/admin/users/{id}");
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        public async Task AdminDeleteUserAsync(int id)
        {
            var req = Authed(HttpMethod.Delete, $"api/admin/users/{id}");
            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }

        // ===== GOALS =====

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

        // ===== ALVÁS =====

        public async Task<MeasurementDto?> GetTodaySleepEntryAsync()
        {
            var list = await GetTodayMeasurementsAsync("ALVAS");
            return list.OrderByDescending(x => x.datum).FirstOrDefault();
        }

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

        public async Task AdminUpdateRoleAsync(int id, string szerepkor)
        {
            var body = new { szerepkor };
            var req = Authed(HttpMethod.Put, $"api/admin/users/{id}/role");
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            await EnsureSuccess(resp);
        }


    }
}

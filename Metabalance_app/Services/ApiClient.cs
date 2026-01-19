using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Metabalance_app.Services;

namespace YourAppName.Services
{
    public class ApiClient
    {
        private readonly HttpClient _http = new HttpClient
        {
            BaseAddress = new Uri("http://localhost:5000/api/auth/")
        };
        public class MeasurementDto
        {
            public int id { get; set; }
            public string tipus { get; set; } = "";
            public double ertek { get; set; }
            public string? mertekegyseg { get; set; }
            public DateTime datum { get; set; }
            public string? megjegyzes { get; set; }
        }

        public async Task CreateMeasurementAsync(string tipus, double ertek, string mertekegyseg, string? megjegyzes = null)
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token");

            var body = new
            {
                tipus,
                ertek,
                mertekegyseg,
                datum = DateTime.Now.ToString("o"),
                megjegyzes = megjegyzes 
            };

            var req = new HttpRequestMessage(HttpMethod.Post, "http://localhost:5000/api/measurements");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", AuthState.token);
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
                throw new Exception(await resp.Content.ReadAsStringAsync());
        }

        public async Task<List<MeasurementDto>> GetMeasurementsAsync(string tipus, DateTime datum, int limit = 200)
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token");

            var url =
                $"http://localhost:5000/api/measurements?tipus={Uri.EscapeDataString(tipus)}&datum={datum:yyyy-MM-dd}&limit={limit}";

            var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", AuthState.token);

            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
                throw new Exception(await resp.Content.ReadAsStringAsync());

            return await resp.Content.ReadFromJsonAsync<List<MeasurementDto>>() ?? new List<MeasurementDto>();
        }


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

        public async Task<List<MeasurementDto>> GetTodayMeasurementsAsync(string tipus)
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token");

            var url = $"http://localhost:5000/api/measurements?tipus={Uri.EscapeDataString(tipus)}&datum={DateTime.Today:yyyy-MM-dd}";

            var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", AuthState.token);

            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
                throw new Exception(await resp.Content.ReadAsStringAsync());

            return await resp.Content.ReadFromJsonAsync<List<MeasurementDto>>() ?? new List<MeasurementDto>();
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

        public async Task<bool> LoginAsync(string email, string password)
        {
            var resp = await _http.PostAsJsonAsync("login", new { email, password });

            if (!resp.IsSuccessStatusCode)
                return false;

            var data = await resp.Content.ReadFromJsonAsync<LoginResponse>();
            if (data == null || string.IsNullOrWhiteSpace(data.token))
                throw new Exception("Sikeres login, de nem jött token a backendtől.");

            // ✅ token eltárolása
            AuthState.token = data.token;

            return true;
        }

        public async Task<UserDto> GetMeAsync()
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token, jelentkezz be!");

            var req = new HttpRequestMessage(HttpMethod.Get, "me"); // ✅ BaseAddress miatt "me"
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", AuthState.token);

            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
                throw new Exception(await resp.Content.ReadAsStringAsync());

            return await resp.Content.ReadFromJsonAsync<UserDto>()
                   ?? throw new Exception("Üres válasz");
        }

        public async Task<bool> RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password,
            string? phone = null,
            string? gender = null
        )
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

            var resp = await _http.PostAsJsonAsync("register", payload);

            if (resp.IsSuccessStatusCode) return true;

            var msg = await resp.Content.ReadAsStringAsync();
            throw new Exception(msg);
        }

        public class DailyStatsDto
        {
            public double water { get; set; }
            public double calories { get; set; }
            public double sleep { get; set; }
            public string? mood { get; set; }
            public double? weight { get; set; }

            // ha van goals object, később bővíthető
        }

        public async Task<DailyStatsDto> GetDailyStatsAsync()
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token");

            var req = new HttpRequestMessage(HttpMethod.Get, "http://localhost:5000/api/statistics/daily");
            req.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", AuthState.token );

            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
                throw new Exception(await resp.Content.ReadAsStringAsync());

            return await resp.Content.ReadFromJsonAsync<DailyStatsDto>()
                   ?? throw new Exception("Üres válasz");
        }

        public class AddMeasurementRequest
        {
            public string type { get; set; } = "";
            public double value { get; set; }
            public string? unit { get; set; }
            public string? recorded_at { get; set; }
            public string? note { get; set; }
        }

        public async Task AddMeasurementAsync(AddMeasurementRequest body)
        {
            if (string.IsNullOrWhiteSpace(AuthState.token))
                throw new Exception("Nincs token");

            var req = new HttpRequestMessage(HttpMethod.Post, "http://localhost:5000/api/measurements");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", AuthState.token);
            req.Content = JsonContent.Create(body);

            var resp = await _http.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
                throw new Exception(await resp.Content.ReadAsStringAsync());
        }

    }
}

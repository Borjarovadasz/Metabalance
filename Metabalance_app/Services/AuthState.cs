using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Metabalance_app.Services
{
    public static class AuthState
    {
        public static string? token; // maradhat, ha később Bearer is lesz
        public static CookieContainer Cookies { get; } = new CookieContainer();
    }
}

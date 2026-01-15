// Simple API helper for frontend requests
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || "Hiba tortent";
    throw new Error(message);
  }
  return data;
};

export { API_URL };


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || "Hiba tortent";
    throw new Error(message);
  }
  return data;
};

export { API_URL };

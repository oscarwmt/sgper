const API_BASE_URL = "http://localhost:4000"; // o desde .env si usas Vite

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  const finalUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url}`;

  const res = await fetch(finalUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  return res;
}

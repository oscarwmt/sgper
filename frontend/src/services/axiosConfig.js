// src/services/axiosConfig.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API,
});

// Interceptor de solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("No autorizado. Redirigiendo a /login...");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
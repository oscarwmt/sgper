// src/authService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function loginUsuario(correo, password) {

  console.log("Login payload:", { correo, password });

  return axios.post(`${API_URL}/api/auth/login`, { correo, password })
    .then(res => res.data);
}

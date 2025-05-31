import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const loginUsuario = async (correo, password) => {
  const response = await axios.post(`${API}/auth/login`, {
    correo,
    password,
  });
  return response.data;
};

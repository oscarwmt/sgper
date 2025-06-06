// src/context/AuthContext.jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("🗂️ Recuperando datos desde localStorage...");
    console.log("Token:", storedToken);
    console.log("User:", storedUser);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      console.log("✅ Datos cargados en el contexto");
    } else {
      console.log("⛔ No hay datos válidos en localStorage");
    }

    setLoading(false);
  }, []);

  const login = (usuario, token) => {
    localStorage.setItem("user", JSON.stringify(usuario));
    localStorage.setItem("token", token);
    setUser(usuario);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const estaAutenticado = !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, estaAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
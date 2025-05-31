import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    console.log("Token guardado en localStorage:", tokenGuardado);
    console.log("Usuario guardado en localStorage:", usuarioGuardado);

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
      console.log("Estado restaurado desde localStorage:", {
        token: tokenGuardado,
        usuario: JSON.parse(usuarioGuardado),
      });
    }
    setCargando(false);
  }, []);

  const login = (usuario, token) => {
    setUsuario(usuario);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  const estaAutenticado = !!usuario && !!token;

  return (
    <AuthContext.Provider
      value={{ usuario, token, login, logout, estaAutenticado, cargando }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { AuthContext }; // ✅ Esta línea resuelve el error

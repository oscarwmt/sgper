// components/PublicOnlyRoute.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado) {
      console.log("🔁 Usuario ya autenticado → Redirigiendo a /dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [estaAutenticado, navigate]);

  if (estaAutenticado) return null;

  return children;
};

export default PublicOnlyRoute;
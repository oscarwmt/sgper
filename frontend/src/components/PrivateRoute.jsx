// PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) return <div>Cargando...</div>;

  return estaAutenticado ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
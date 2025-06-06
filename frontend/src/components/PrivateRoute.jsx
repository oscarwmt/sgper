// components/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { estaAutenticado, loading } = useContext(AuthContext);

  if (loading) return null; // O un loader

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
// src/components/TopNav.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TopNav({ setActiveSection }) {
  const { user, logout } = useAuth();

  const handleClick = (section) => {
    setActiveSection(section);
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "px-4 py-2 text-white bg-blue-600 rounded"
      : "px-4 py-2 text-gray-700 hover:bg-gray-200 rounded";

  return (
    <nav className="bg-white shadow flex items-center justify-between px-4 py-3">
      {/* Secciones del sistema */}
      <div className="flex space-x-4">
        <NavLink
          to="/dashboard/trabajadores"
          className={linkClass}
          onClick={() => handleClick("trabajadores")}
        >
          Trabajadores
        </NavLink>
        <NavLink
          to="/dashboard/empresas"
          className={linkClass}
          onClick={() => handleClick("empresas")}
        >
          Empresas
        </NavLink>
      </div>

      {/* Info del usuario autenticado + logout */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span className="font-medium text-gray-800">
          {user?.nombre || user?.correo}
        </span>
        <span>|</span>
        <span className="font-semibold">
          {user?.empresa_nombre || `Empresa ID: ${user?.empresa_id}`}
        </span>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default TopNav;

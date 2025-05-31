// src/components/TopNav.jsx
import { NavLink } from "react-router-dom";

function TopNav({ setActiveSection }) {
  const handleClick = (section) => {
    setActiveSection(section);
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "px-4 py-2 text-white bg-blue-600 rounded"
      : "px-4 py-2 text-gray-700 hover:bg-gray-200 rounded";

  return (
    <nav className="bg-white shadow flex space-x-4 px-4 py-3">
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
      {/* Aquí puedes agregar más opciones de menú superior si quieres */}
    </nav>
  );
}

export default TopNav;

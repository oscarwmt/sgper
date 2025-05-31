// src/components/SideNav.jsx
import { NavLink } from "react-router-dom";

function SideNav({ activeSection }) {
  const getLinkClass = ({ isActive }) =>
    isActive
      ? "block px-4 py-2 text-white bg-blue-600 rounded mb-1"
      : "block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded mb-1";

  const trabajadoresLinks = (
    <>
      <NavLink to="/dashboard/trabajadores/datos-personales" className={getLinkClass}>
        Datos Personales
      </NavLink>
      <NavLink to="/dashboard/trabajadores/contratos" className={getLinkClass}>
        Contratos
      </NavLink>
      <NavLink to="/dashboard/trabajadores/cargos" className={getLinkClass}>
        Cargos
      </NavLink>
      {/* <NavLink to="/dashboard/trabajadores/crear" className={getLinkClass}>
        Crear Trabajador
      </NavLink> */}
      
    </>
  );

  const empresasLinks = (
    <>
      <NavLink to="/dashboard/empresas/informacion" className={getLinkClass}>
        Información Empresa
      </NavLink>
      <NavLink to="/dashboard/empresas/cargos" className={getLinkClass}>
        Cargos
      </NavLink>
    </>
  );

  return (
    <aside className="w-64 bg-white border-r p-4">
      {activeSection === "trabajadores" && trabajadoresLinks}
      {activeSection === "empresas" && empresasLinks}
      {/* Aquí puedes agregar más secciones si amplías el menú */}
    </aside>
  );
}

export default SideNav;

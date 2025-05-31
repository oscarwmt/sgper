// src/layout/MainLayout.jsx
import { useState, useEffect } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import TopNav from "../components/TopNav";
import SideNav from "../components/SideNav";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("trabajadores");
  const { estaAutenticado } = useAuth();

  // Actualiza la sección activa según la ruta actual
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const sectionFromPath = pathParts[2] || "trabajadores";
    setActiveSection(sectionFromPath);
  }, [location.pathname]);

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNav setActiveSection={setActiveSection} />
      <div className="flex flex-1">
        <SideNav activeSection={activeSection} />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import MainLayout from "./layout/MainLayout.jsx";

import DatosPersonales from "./pages/trabajadores/DatosPersonales.jsx";
import Contratos from "./pages/trabajadores/Contratos.jsx";
import CargosTrabajadores from "./pages/trabajadores/Cargos.jsx";
import TrabajadorForm from "./pages/trabajadores/TrabajadorForm.jsx";
import TrabajadorRemuneraciones from "./pages/trabajadores/TrabajadorRemuneraciones.jsx";
import TrabajadorGestionTalento from "./pages/trabajadores/TrabajadorGestionTalento.jsx";

import InformacionEmpresa from "./pages/empresas/Informacion.jsx";
import CargosEmpresa from "./pages/empresas/Cargos.jsx";

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from "./components/PrivateRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}>
        <Routes>
          {/* Ruta pública */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/trabajadores" replace />} />

            <Route path="trabajadores">
              <Route index element={<DatosPersonales />} />
              <Route path="datos-personales" element={<DatosPersonales />} />
              <Route path="contratos" element={<Contratos />} />
              <Route path="cargos" element={<CargosTrabajadores />} />
              <Route path="crear" element={<TrabajadorForm />} />
              <Route path="editar/:id" element={<TrabajadorForm />} />
              <Route path=":id/remuneraciones" element={<TrabajadorRemuneraciones />} />
              <Route path=":id/gestion-talento" element={<TrabajadorGestionTalento />} />
            </Route>

            <Route path="empresas">
              <Route index element={<InformacionEmpresa />} />
              <Route path="informacion" element={<InformacionEmpresa />} />
              <Route path="cargos" element={<CargosEmpresa />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

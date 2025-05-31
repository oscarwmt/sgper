// src/pages/trabajadores/TrabajadorGestionTalento.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function TrabajadorGestionTalento() {
  const { id } = useParams();
  const { token } = useAuth();

  // Aquí carga o guarda evaluaciones, licencias, etc.
  return (
    <div>
      <h1>Gestión del Talento - Trabajador ID: {id}</h1>
      {/* Formulario de gestión del talento */}
    </div>
  );
}
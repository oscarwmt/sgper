// src/pages/trabajadores/TrabajadorRemuneraciones.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function TrabajadorRemuneraciones() {
  const { id } = useParams();
  const { token } = useAuth();
  const [remu, setRemu] = useState({});

  // Aquí carga o guarda las remuneraciones
  useEffect(() => {
    // fetch /api/trabajadores/${id}/remuneraciones
  }, [id, token]);

  return (
    <div>
      <h1>Remuneraciones del Trabajador ID: {id}</h1>
      {/* Formulario de remuneraciones */}
    </div>
  );
}
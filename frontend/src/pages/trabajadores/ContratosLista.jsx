// src/pages/trabajadores/ContratosLista.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ContratosLista() {
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContratos = async () => {
      setCargando(true);
      try {
        const res = await axios.get("/api/contratos");
        setContratos(res.data.data || []);
      } catch (err) {
        console.error("Error al cargar contratos:", err);
        setError("No se pudieron cargar los contratos");
      } finally {
        setCargando(false);
      }
    };

    fetchContratos();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Listado de Contratos</h2>
        <button
          onClick={() => navigate("/dashboard/trabajadores/contratos/nuevo")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuevo Contrato
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Trabajador</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Inicio</th>
            <th className="p-2 border">Término</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cargando ? (
            <tr><td colSpan="6" className="text-center p-4">Cargando...</td></tr>
          ) : contratos.length === 0 ? (
            <tr><td colSpan="6" className="text-center p-4">No hay contratos disponibles</td></tr>
          ) : (
            contratos.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.nombre_trabajador || `ID ${c.id_trabajadores}`}</td>
                <td className="p-2 border">{c.tipo_contrato}</td>
                <td className="p-2 border">{new Date(c.fecha_inicio).toLocaleDateString()}</td>
                <td className="p-2 border">{c.fecha_termino ? new Date(c.fecha_termino).toLocaleDateString() : "-"}</td>
                <td className="p-2 border">{c.activo ? "Activo" : "Inactivo"}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => navigate(`/dashboard/trabajadores/contratos/editar/${c.id}`)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ContratosLista;

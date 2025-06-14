// src/pages/trabajadores/DatosPersonales.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../../../backend/src/utils/fetchWithAuth";

const PAGE_SIZE = 5;

function DatosPersonales() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modalDesactivarVisible, setModalDesactivarVisible] = useState(false);
  const [trabajadorAEliminar, setTrabajadorAEliminar] = useState(null);

  const navigate = useNavigate();

  const cargarTrabajadores = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const params = new URLSearchParams({
        pagina,
        limite: PAGE_SIZE,
        filtro,
      });

      const res = await fetchWithAuth(`/api/trabajadores?${params.toString()}`);

      if (!res.ok) throw new Error("Error al cargar trabajadores");

      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setTrabajadores(data.data);
        setTotalPaginas(data.total_paginas || 1);
      } else {
        setTrabajadores([]);
        setTotalPaginas(1);
      }
    } catch (e) {
      console.error("Error al cargar trabajadores:", e.message);
      setError("No se pudieron cargar los trabajadores");
      setTrabajadores([]);
      setTotalPaginas(1);
    } finally {
      setCargando(false);
    }
  }, [pagina, filtro]);

  useEffect(() => {
    cargarTrabajadores();
  }, [cargarTrabajadores]);

  function abrirModalDesactivar(trabajador) {
    setTrabajadorAEliminar(trabajador);
    setModalDesactivarVisible(true);
  }

  function cerrarModalDesactivar() {
    setTrabajadorAEliminar(null);
    setModalDesactivarVisible(false);
  }

  async function confirmarDesactivar() {
    if (!trabajadorAEliminar) return;
    setError("");
    try {
      const res = await fetchWithAuth(`/api/trabajadores/${trabajadorAEliminar.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al desactivar trabajador");
      cerrarModalDesactivar();
      cargarTrabajadores();
    } catch (e) {
      console.error("Error al desactivar trabajador:", e.message);
      setError("No se pudo desactivar el trabajador");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Listado de Trabajadores</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o RUT"
          className="border p-2 rounded flex-grow"
          value={filtro}
          onChange={(e) => {
            setPagina(1);
            setFiltro(e.target.value);
          }}
        />
        <button
          onClick={() => navigate("/dashboard/trabajadores/crear")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Crear Trabajador
        </button>
      </div>

      <table className="min-w-full border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">RUT</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cargando ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                Cargando trabajadores...
              </td>
            </tr>
          ) : !Array.isArray(trabajadores) || trabajadores.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No hay trabajadores disponibles
              </td>
            </tr>
          ) : (
            trabajadores.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.rut}</td>
                <td className="border p-2">{t.nombre} {t.apellidos}</td>
                <td className="border p-2">{t.correo}</td>
                <td className="border p-2">{t.telefono || "-"}</td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/dashboard/trabajadores/editar/${t.id}`);
                    }}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => abrirModalDesactivar(t)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center space-x-2">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      {modalDesactivarVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4">Confirmar Desactivar</h2>
            <p>
              ¿Está seguro que desea desactivar a{" "}
              <strong>{trabajadorAEliminar?.nombre}</strong>?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={cerrarModalDesactivar}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDesactivar}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatosPersonales;

// src/pages/trabajadores/DatosPersonales.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

function calcularDigitoVerificador(numero) {
  const digitos = numero.toString().split("").map(Number);
  const pesos = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    suma += digitos[digitos.length - 1 - i] * pesos[i];
  }
  const resto = suma % 11;
  if (resto === 1) return "K";
  if (resto === 0) return 0;
  return 11 - resto;
}

function validarRutCompleto(rutCompleto) {
  if (!rutCompleto || typeof rutCompleto !== "string") return false;
  const partes = rutCompleto.split("-");
  if (partes.length !== 2) return false;
  const numero = partes[0].replace(/\./g, "");
  const dvIngresado = partes[1].toUpperCase();

  if (!/^\d+$/.test(numero)) return false;

  const dvCalculado = calcularDigitoVerificador(numero).toString().toUpperCase();
  return dvCalculado === dvIngresado;
}

function DatosPersonales() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalDesactivarVisible, setModalDesactivarVisible] = useState(false);
  const [trabajadorAEliminar, setTrabajadorAEliminar] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Función para cargar la lista de trabajadores
  const cargarTrabajadores = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams({
        pagina,
        limite: PAGE_SIZE,
        filtro,
      });
      const res = await fetch(`/api/trabajadores?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar trabajadores");
      const data = await res.json();
      setTrabajadores(data.trabajadores);
      setTotalPaginas(data.totalPaginas);
    } catch (e) {
      setError("Error al cargar trabajadores");
      setTrabajadores([]);
      setTotalPaginas(1);
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
      const res = await fetch(`/api/trabajadores/${trabajadorAEliminar.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al desactivar trabajador");
      cerrarModalDesactivar();
      cargarTrabajadores();
    } catch (e) {
      setError("No se pudo desactivar el trabajador");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listado de Trabajadores</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="mb-4 flex items-center space-x-2">
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Trabajador
        </button>
      </div>

      <table className="w-full border border-gray-300 rounded">
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
          {trabajadores.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No se encontraron trabajadores.
              </td>
            </tr>
          ) : (
            trabajadores.map((t) => (
              <tr key={t.id}>
                <td className="border p-2">{t.rut}</td>
                <td className="border p-2">{t.nombre}</td>
                <td className="border p-2">{t.correo}</td>
                <td className="border p-2">{t.telefono}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => navigate(`/trabajadores/editar/${t.id}`)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
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

      {/* Paginación */}
      <div className="mt-4 flex justify-center space-x-2">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-3 py-1 border rounded">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal Confirmar Desactivar */}
      {modalDesactivarVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-80 relative">
            <h2 className="text-xl font-bold mb-4">Confirmar Desactivar</h2>
            <p>
              ¿Está seguro que desea desactivar a{" "}
              <strong>{trabajadorAEliminar?.nombre}</strong>?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={cerrarModalDesactivar}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDesactivar}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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

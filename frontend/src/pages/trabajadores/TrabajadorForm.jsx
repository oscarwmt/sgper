// src/pages/trabajadores/TrabajadorForm.jsx

// === IMPORTACIONES DE LIBRERÍAS Y COMPONENTES ===
import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// === FUNCIONES AUXILIARES ===

/**
 * Valida un RUT chileno (formato: 12.345.678-9)
 * @param {string} rut - El RUT a validar
 * @returns {boolean} - Si es válido o no
 */
function validarRut(rut) {
  if (!rut || typeof rut !== "string") return false;
  const [numero, dvIngresado] = rut.split("-");
  if (!numero || !dvIngresado) return false;
  const cleanRut = numero.replace(/\./g, "");
  if (!/^\d+$/.test(cleanRut)) return false;

  const calcularDV = (num) => {
    let suma = 0,
      multiplo = 2;
    for (let i = num.length - 1; i >= 0; i--) {
      suma += parseInt(num[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const dv = 11 - (suma % 11);
    return dv === 11 ? "0" : dv === 10 ? "K" : dv.toString();
  };

  return calcularDV(cleanRut) === dvIngresado.toUpperCase();
}

// === ESQUEMA DE VALIDACIÓN CON YUP ===

/**
 * Esquema de validación para el formulario de trabajadores.
 * Incluye reglas para todos los campos del formulario.
 */
const schema = yup.object().shape({
  // Campo: RUT
  rut: yup.string().required("RUT es obligatorio").test("valido", "RUT inválido", validarRut),

  // Campo: Nombre
  nombre: yup.string().required("Nombre es obligatorio").min(3),

  // Campo: Apellidos
  apellidos: yup.string().required("Apellidos son obligatorios").min(3),

  // Campo: Correo electrónico
  correo: yup.string().required("Correo es obligatorio").email(),

  // Campo: Teléfono (opcional con formato chileno)
  telefono: yup.string().nullable().matches(/^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/, {
    message: "Teléfono inválido",
    excludeEmptyString: true,
  }),

  // Campo: Fecha de nacimiento
  fechaNacimiento: yup.string().required("Fecha de nacimiento es obligatoria"),

  // Campo: Estado civil
  estadoCivil: yup.string().required("Estado civil es obligatorio"),

  // Campo: Hijos
  hijos: yup.number().min(0).required(),

  // Campo: Dirección
  direccion: yup.string().required("Dirección es obligatoria"),

  // Campo: Casa / Bloque / Depto
  casaBloqueDepto: yup.string(),

  // Campo: Comuna ID
  comunaId: yup.string().required("Debe seleccionar una comuna"),

  // Campo: Ciudad
  ciudad: yup.string().required("Ciudad es obligatoria"),

  // Campo: Departamento ID
  departamentoId: yup.string().required("Debe seleccionar un departamento"),

  // Campo: Cargo ID
  cargoId: yup.string().required("Debe seleccionar un cargo"),

  // Campo: Tipo de contrato
  tipoContrato: yup.string().required("Tipo de contrato es obligatorio"),

  // Campo: Cantidad de duración (solo si no es indefinido)
  cantidadDuracion: yup
  .number()
  .transform((value, originalValue) => (originalValue === "" ? null : value))
  .nullable()
  .when("tipoContrato", {
    is: (val) => val !== "Indefinido",
    then: (schema) =>
      schema.required("Campo obligatorio si no es indefinido").positive("Debe ser mayor a cero"),
    otherwise: (schema) => schema.nullable(),
  }),

  // Campo: Unidad de duración (solo si no es indefinido)
  unidadDuracion: yup
    .string()
    .nullable()
    .when("tipoContrato", {
      is: (val) => val !== "Indefinido",
      then: (schema) => schema.required("Seleccione unidad de duración"),
      otherwise: (schema) => schema.nullable(),
    }),

  // Campo: Jornada laboral ID
  jornadaLaboralId: yup.string().required("Debe seleccionar una jornada"),

  // Campo: Gratificación tipo
  gratificacionTipo: yup.string().required("Seleccione tipo de gratificación"),

  // Campo: Monto de gratificación (solo si es fija)
  gratificacionMonto: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("gratificacionTipo", {
      is: "Fija",
      then: (schema) =>
        schema.required("Monto obligatorio si es fija").positive("Monto debe ser positivo"),
      otherwise: (schema) => schema.nullable(),
    }),
});

// === COMPONENTE PRINCIPAL: TrabajadorForm ===

/**
 * Componente principal para crear o editar un trabajador.
 * Contiene todo el formulario con validación y lógica de carga de datos relacionados.
 */

export default function TrabajadorForm() {
  const { id } = useParams();
  const modoEdicion = !!id;   // true si hay ID => edición
  const navigate = useNavigate();
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [ciudades, setCiudades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [jornadas, setJornadas] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const tipoContrato = watch("tipoContrato");
  const gratificacionTipo = watch("gratificacionTipo");
  const departamentoSeleccionado = watch("departamentoId");

  useEffect(() => {
    const tipo = watch("tipoContrato");
    if (tipo === "Indefinido") {
      setValue("cantidadDuracion", null);
      setValue("unidadDuracion", null);
    }
  }, [watch("tipoContrato")]);
  
  useEffect(() => {
    const tipoGrat = watch("gratificacionTipo");
    if (tipoGrat !== "Fija") {
      setValue("gratificacionMonto", null);
    }
  }, [watch("gratificacionTipo")]);
  
  // Cargar listados
  useEffect(() => {
    if (!token) return;
    const cargarListados = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [resDepartamentos, resJornadas, resComunas] = await Promise.all([
          axios.get(`${API_URL}/api/departamento`, { headers }),
          axios.get(`${API_URL}/api/jornadas`, { headers }),
          axios.get(`${API_URL}/api/comunas`, { headers }),
        ]);

        // Procesar comunas
        let comunasData = [];
        if (Array.isArray(resComunas.data)) {
          comunasData = [...resComunas.data];
        } else if (Array.isArray(resComunas.data?.data)) {
          comunasData = [...resComunas.data.data];
        }

        setComunas(comunasData);

        // Procesar departamentos
        let departamentosData = [];
        if (Array.isArray(resDepartamentos.data)) {
          departamentosData = [...resDepartamentos.data];
        } else if (Array.isArray(resDepartamentos.data?.data)) {
          departamentosData = [...resDepartamentos.data.data];
        }

        setDepartamentos(departamentosData);

        // Procesar jornadas
        let jornadasData = [];
        if (Array.isArray(resJornadas.data)) {
          jornadasData = [...resJornadas.data];
        } else if (Array.isArray(resJornadas.data?.data)) {
          jornadasData = [...resJornadas.data.data];
        }

        setJornadas(jornadasData);

      } catch (err) {
        console.error("Error al cargar listados:", err.message || err.response?.data || err);
        setErrorGeneral("No se pudieron cargar algunos datos. Verifica tu conexión.");
        setDepartamentos([]);
        setJornadas([]);
        setComunas([]);
      }
    };

    cargarListados();
  }, [token]);

  // Cargar trabajador si es edición
  useEffect(() => {
    if (id && token) {
      setCargando(true);
      axios
        .get(`${API_URL}/api/trabajadores/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => {
          reset(data.data); // Accedé al contenido real
        })        
        .catch(() => {
          setErrorGeneral("No se pudo cargar el trabajador");
        })
        .finally(() => setCargando(false));
    }
  }, [id, token, reset]);

  // Cargar cargos según departamento
  useEffect(() => {
    if (departamentoSeleccionado && !isNaN(departamentoSeleccionado) && token) {
      axios
        .get(`${API_URL}/api/cargos?departamentoId=${departamentoSeleccionado}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => {
          const cargosData = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : [];

          setCargos(cargosData);

          if (cargosData.length > 0 && watch("cargoId")) {
            const cargoExiste = cargosData.some((c) => c.id === watch("cargoId"));
            if (!cargoExiste) setValue("cargoId", "");
          }
        })
        .catch((err) => {
          console.error("Error al cargar cargos:", err);
          setCargos([]);
        });
    } else {
      setCargos([]);
    }
  }, [departamentoSeleccionado, token]);

  const onSubmit = async (datos) => {
    console.log("1. onSubmit - Inicio de la función.");
    setErrorGeneral("");
    setCargando(true);
  
    if (!token) {
      console.log("1a. onSubmit - Token no presente. Deteniendo envío.");
      setErrorGeneral("No tienes sesión iniciada");
      setCargando(false);
      return;
    }
  
    try {
      // Armado de objeto limpio según condiciones
      const datosLimpios = {
        ...datos,
        hijos: parseInt(datos.hijos),
        comunaId: datos.comunaId ? parseInt(datos.comunaId) : null,
        departamentoId: datos.departamentoId ? parseInt(datos.departamentoId) : null,
        cargoId: datos.cargoId ? parseInt(datos.cargoId) : null,
        cantidadDuracion:
          datos.tipoContrato !== "Indefinido" && datos.cantidadDuracion
            ? parseInt(datos.cantidadDuracion)
            : null,
        unidadDuracion: datos.tipoContrato !== "Indefinido" ? datos.unidadDuracion : null,
        jornadaLaboralId: datos.jornadaLaboralId ? parseInt(datos.jornadaLaboralId) : null,
        gratificacionMonto:
          datos.gratificacionTipo === "Fija" && datos.gratificacionMonto
            ? parseFloat(datos.gratificacionMonto)
            : null,
      };
  
      console.log("2. onSubmit - Datos limpios preparados:", datosLimpios);
  
      const metodo = modoEdicion ? "put" : "post";
      const url = modoEdicion
        ? `${API_URL}/api/trabajadores/${id}`
        : `${API_URL}/api/trabajadores`;
  
      console.log(`3. onSubmit - Realizando petición ${metodo.toUpperCase()} a URL: ${url}`);
  
      const response = await axios[metodo](url, datosLimpios, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("4. onSubmit - Petición Axios completada. Respuesta:", response.data);
  
      toast.success(
        modoEdicion
          ? "Trabajador actualizado correctamente"
          : "Trabajador creado correctamente"
      );
  
      reset();
      navigate("/trabajadores");
      console.log("5. onSubmit - Navegando a /trabajadores.");
    } catch (err) {
      console.error(
        "X. onSubmit - Error capturado en el try-catch:",
        err.response?.data || err.message
      );
      const msg =
        err?.response?.data?.message || "Error al guardar el trabajador.";
      setErrorGeneral(msg);
      toast.error("Error al guardar trabajador");
    } finally {
      console.log("Y. onSubmit - Bloque finally ejecutado. Cargando a false.");
      setCargando(false);
    }
  };
  
  


  // === RENDERIZADO DEL COMPONENTE ===

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      {/* Título del formulario */}
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Editar Trabajador" : "Crear Trabajador"}
      </h1>

      {/* Mensaje de error global */}
      {errorGeneral && <p className="text-red-600 mb-4">{errorGeneral}</p>}

      {/* Vista de carga */}
      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Datos Personales */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Datos Personales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rut" className="block mb-1 font-medium">
                  RUT
                </label>
                <input
                  id="rut"
                  type="text"
                  {...register("rut")}
                  className={`w-full border p-2 rounded ${
                    errors.rut ? "border-red-600" : "border-gray-300"
                  }`}
                  placeholder="12.345.678-9"
                  disabled={!!id}
                />
                {errors.rut && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.rut.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="nombre" className="block mb-1 font-medium">
                  Nombre(s)
                </label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre")}
                  className={`w-full border p-2 rounded ${
                    errors.nombre ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.nombre && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="apellidos" className="block mb-1 font-medium">
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  type="text"
                  {...register("apellidos")}
                  className={`w-full border p-2 rounded ${
                    errors.apellidos ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.apellidos && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.apellidos.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="correo" className="block mb-1 font-medium">
                  Correo Electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  {...register("correo")}
                  className={`w-full border p-2 rounded ${
                    errors.correo ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.correo && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.correo.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="telefono" className="block mb-1 font-medium">
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  type="text"
                  {...register("telefono")}
                  className={`w-full border p-2 rounded ${
                    errors.telefono ? "border-red-600" : "border-gray-300"
                  }`}
                  placeholder="+56 9 1234 5678"
                />
                {errors.telefono && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.telefono.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="fechaNacimiento"
                  className="block mb-1 font-medium"
                >
                  Fecha de Nacimiento
                </label>
                <input
                  id="fechaNacimiento"
                  type="date"
                  {...register("fechaNacimiento")}
                  className={`w-full border p-2 rounded ${
                    errors.fechaNacimiento ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.fechaNacimiento && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.fechaNacimiento.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="estadoCivil" className="block mb-1 font-medium">
                  Estado Civil
                </label>
                <select
                  id="estadoCivil"
                  {...register("estadoCivil")}
                  className={`w-full border p-2 rounded ${
                    errors.estadoCivil ? "border-red-600" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Viudo">Viudo</option>
                  <option value="Separado">Separado</option>
                </select>
                {errors.estadoCivil && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.estadoCivil.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="hijos" className="block mb-1 font-medium">
                  Hijos (cantidad)
                </label>
                <input
                  id="hijos"
                  type="number"
                  min="0"
                  {...register("hijos", { valueAsNumber: true })}
                  className={`w-full border p-2 rounded ${
                    errors.hijos ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.hijos && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.hijos.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Datos de Contacto */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Datos de Contacto</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="direccion" className="block mb-1 font-medium">
                  Dirección (Calle y Número)
                </label>
                <input
                  id="direccion"
                  type="text"
                  {...register("direccion")}
                  className={`w-full border p-2 rounded ${
                    errors.direccion ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.direccion && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.direccion.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="casaBloqueDepto"
                  className="block mb-1 font-medium"
                >
                  Casa / Bloque / Depto (opcional)
                </label>
                <input
                  id="casaBloqueDepto"
                  type="text"
                  {...register("casaBloqueDepto")}
                  className="w-full border p-2 rounded border-gray-300"
                />
              </div>
              <div>
                <label htmlFor="ciudad" className="block mb-1 font-medium">
                  Ciudad
                </label>
                <input
                  id="ciudad"
                  type="text"
                  {...register("ciudad")}
                  className={`w-full border p-2 rounded ${
                    errors.ciudad ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.ciudad && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.ciudad.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="comunaId" className="block mb-1 font-medium">
                    Comuna
                </label>
                <select id="comunaId"
                    {...register("comunaId")}
                    className={`w-full border p-2 rounded ${
                    errors.comunaId ? "border-red-600" : "border-gray-300"
                    }`}
                >
                    <option value="">Selecciona una comuna</option>
                    {Array.isArray(comunas) && comunas.length > 0 ? (
                    comunas.map((c) => {
                        if (!c || !("id" in c) || !("nombre" in c)) {
                        console.warn("Comuna inválida:", c);
                        return null;
                        }
                        return (
                        <option key={c.id} value={c.id}>
                            {c.nombre}
                        </option>
                        );
                    })
                    ) : (
                    <option disabled>No hay comunas disponibles</option>
                    )}
                </select>
                {errors.comunaId && (
                    <p className="text-red-600 text-sm mt-1">{errors.comunaId.message}</p>
                )}
                </div>
            </div>
          </section>

          {/* Datos Profesionales */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Datos Profesionales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="departamentoId"
                  className="block mb-1 font-medium"
                >
                  Departamento
                </label>
                <select
                  id="departamentoId"
                  {...register("departamentoId")}
                  className={`w-full border p-2 rounded ${
                    errors.departamentoId ? "border-red-600" : "border-gray-300"
                  }`}
                >
                  {Array.isArray(departamentos) && departamentos.length > 0 ? (
                  departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay departamentos disponibles</option>
                )}
                </select>
                {errors.departamentoId && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.departamentoId.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="cargoId" className="block mb-1 font-medium">
                  Cargo
                </label>
                <select
                  id="cargoId"
                  {...register("cargoId")}
                  className={`w-full border p-2 rounded ${
                    errors.cargoId ? "border-red-600" : "border-gray-300"
                  }`}
                  disabled={!departamentoSeleccionado}
                >
                  <option value="">Selecciona un cargo</option>
                  {Array.isArray(cargos) && cargos.length > 0 ? (
                  cargos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay cargos disponibles</option>
                )}
                </select>
                {errors.cargoId && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.cargoId.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Contrato Laboral */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Contrato Laboral</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tipoContrato"
                  className="block mb-1 font-medium"
                >
                  Tipo de Contrato
                </label>
                <select
                  id="tipoContrato"
                  {...register("tipoContrato")}
                  className={`w-full border p-2 rounded ${
                    errors.tipoContrato ? "border-red-600" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Plazo Fijo">Plazo Fijo</option>
                  <option value="Indefinido">Indefinido</option>
                  <option value="Por Obra">Por Obra</option>
                  <option value="Honorarios">Honorarios</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.tipoContrato && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.tipoContrato.message}
                  </p>
                )}
              </div>

              {tipoContrato !== "Indefinido" && (
                <div className="flex gap-4 items-end">
                <div className="w-1/2">
                  <label
                    htmlFor="cantidadDuracion"
                    className="block mb-1 font-medium"
                  >
                    Duración
                  </label>
                  <input
                    id="cantidadDuracion"
                    type="number"
                    {...register("cantidadDuracion", { valueAsNumber: true })}
                    className={`w-16 border p-2 rounded ${
                      errors.cantidadDuracion ? "border-red-600" : "border-gray-300"
                    }`}
                    placeholder="Ej. 12"
                  />
                  {errors.cantidadDuracion && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.cantidadDuracion.message}
                    </p>
                  )}
                </div>
              
                <div className="w-1/2">
                  <label
                    htmlFor="unidadDuracion"
                    className="sr-only" // Oculta visualmente la etiqueta, pero accesible para lectores de pantalla
                  >
                    Unidad de Duración
                  </label>
                  <select
                    id="unidadDuracion"
                    {...register("unidadDuracion")}
                    className={`w-full border p-2 rounded ${
                      errors.unidadDuracion ? "border-red-600" : "border-gray-300"
                    }`}
                    defaultValue="Meses"
                  >
                    <option value="">Selecciona una unidad</option>
                    <option value="Días">Días</option>
                    <option value="Meses">Meses</option>
                  </select>
                  {errors.unidadDuracion && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.unidadDuracion.message}
                    </p>
                  )}
                </div>
              </div>
              )}

                <div>
                <label htmlFor="jornadaLaboralId" className="block mb-1 font-medium">
                    Jornada Laboral
                </label>
                <select
                    id="jornadaLaboralId"
                    {...register("jornadaLaboralId")}
                    className={`w-full border p-2 rounded ${
                    errors.jornadaLaboralId ? "border-red-600" : "border-gray-300"
                    }`}
                >
                    <option value="">Selecciona una jornada</option>
                    {jornadas && Array.isArray(jornadas) && jornadas.length > 0 ? (
                    jornadas.map((j) => (
                        <option key={j.id} value={j.id}>
                        {j.nombre}
                        </option>
                    ))
                    ) : (
                    <option disabled>No hay jornadas disponibles</option>
                    )}
                </select>
                {errors.jornadaLaboralId && (
                    <p className="text-red-600 text-sm mt-1">
                    {errors.jornadaLaboralId.message}
                    </p>
                )}
                </div>

              <div>
                <label
                  htmlFor="gratificacionTipo"
                  className="block mb-1 font-medium"
                >
                  Gratificación
                </label>
                <select
                  id="gratificacionTipo"
                  {...register("gratificacionTipo")}
                  className={`w-full border p-2 rounded ${
                    errors.gratificacionTipo ? "border-red-600" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Fija">Fija</option>
                  <option value="25% Anual">25% Anual</option>
                  <option value="Por Utilidades">Por Utilidades</option>
                </select>
                {errors.gratificacionTipo && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.gratificacionTipo.message}
                  </p>
                )}
              </div>

              {gratificacionTipo === "Fija" && (
                <div>
                  <label
                    htmlFor="gratificacionMonto"
                    className="block mb-1 font-medium"
                  >
                    Monto Fijo de Gratificación
                  </label>
                  <input
                    id="gratificacionMonto"
                    type="number"
                    step="0.01"
                    {...register("gratificacionMonto", { valueAsNumber: true })}
                    className={`w-full border p-2 rounded ${
                      errors.gratificacionMonto ? "border-red-600" : "border-gray-300"
                    }`}
                  />
                  {errors.gratificacionMonto && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.gratificacionMonto.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Botones */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/trabajadores")}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={cargando}
            >
              {id ? "Guardar Cambios" : "Crear Trabajador"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
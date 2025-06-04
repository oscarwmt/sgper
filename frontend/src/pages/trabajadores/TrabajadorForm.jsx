// src/pages/trabajadores/TrabajadorForm.jsx
import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

// Validación RUT chileno
function validarRut(rut) {
  if (!rut || typeof rut !== "string") return false;
  const partes = rut.split("-");
  if (partes.length !== 2) return false;
  const numero = partes[0].replace(/\./g, "");
  const dvIngresado = partes[1].toUpperCase();
  if (!/^\d+$/.test(numero)) return false;

  const calcularDV = (numero) => {
    let suma = 0;
    const pesos = [2, 3, 4, 5, 6, 7];
    for (let i = 0; i < numero.length; i++) {
      suma += parseInt(numero[numero.length - 1 - i]) * pesos[i % 6];
    }
    const resto = suma % 11;
    return resto === 0 ? "0" : resto === 1 ? "K" : (11 - resto).toString();
  };

  return calcularDV(numero) === dvIngresado;
}

// Esquema Yup
const schema = yup.object().shape({
  // Datos Personales
  rut: yup
    .string()
    .required("RUT es obligatorio")
    .test("validar-rut", "Formato RUT inválido", validarRut),
  nombre: yup
    .string()
    .required("Nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  apellidos: yup
    .string()
    .required("Apellidos son obligatorios")
    .min(3, "Los apellidos deben tener al menos 3 caracteres"),
  correo: yup
    .string()
    .required("Correo es obligatorio")
    .email("Correo inválido"),
  telefono: yup
    .string()
    .nullable()
    .matches(/^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/, {
      message: "Formato teléfono inválido",
      excludeEmptyString: true,
    }),
  fechaNacimiento: yup.string().required("Fecha de nacimiento es obligatoria"),
  estadoCivil: yup.string().required("Estado civil es obligatorio"),
  hijos: yup.number().min(0, "La cantidad no puede ser negativa").required(),

  // Datos de Contacto
  direccion: yup.string().required("Dirección es obligatoria"),
  casaBloqueDepto: yup.string(),
  comunaId: yup.string().required("Debe seleccionar una comuna"),
  ciudad: yup.string().required("Ciudad es obligatoria"),

  // Datos Profesionales
  departamentoId: yup.string().required("Debe seleccionar un departamento"),
  cargoId: yup.string().required("Debe seleccionar un cargo"),

  // Contrato Laboral
  tipoContrato: yup.string().required("Tipo de contrato es obligatorio"),
  cantidadDuracion: yup.number()
    .positive("La cantidad debe ser mayor a cero")
    .when("tipoContrato", {
      is: (val) => val !== "Indefinido",
      then: (schema) =>
        schema.required("Este campo es obligatorio si no es indefinido"),
      otherwise: (schema) => schema.nullable(),
    }),
  unidadDuracion: yup.string().when("tipoContrato", {
    is: (val) => val !== "Indefinido",
    then: (schema) =>
      schema.required("Debe seleccionar una unidad de duración"),
    otherwise: (schema) => schema.nullable(),
  }),
  jornadaLaboralId: yup.string().required("Debe seleccionar una jornada"),
  gratificacionTipo: yup.string().required("Debe seleccionar tipo de gratificación"),
  gratificacionMonto: yup.number().when("gratificacionTipo", {
    is: "Fija",
    then: (schema) =>
      schema
        .positive("Debe ser un monto positivo")
        .required("Este campo es obligatorio si la gratificación es fija"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default function TrabajadorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  // Listados
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
  } = useForm({
    resolver: yupResolver(schema),
  });

  const tipoContrato = watch("tipoContrato");
  const gratificacionTipo = watch("gratificacionTipo");
  const departamentoSeleccionado = watch("departamentoId");

// Cargar listados desde la API
useEffect(() => {
    const cargarListados = async () => {
      try {
        const [resCiudades, resDepartamentos, resJornadas, resCargos, resComunas] = await Promise.all([
          axios.get("/api/ciudades", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/departamentos", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/jornadas", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/cargos", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/comunas", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
  
        setCiudades(resCiudades.data || []);
        setDepartamentos(
          Array.isArray(resDepartamentos.data?.data || resDepartamentos.data)
            ? resDepartamentos.data?.data || resDepartamentos.data
            : []
        );
        setJornadas(
          Array.isArray(resJornadas.data?.data || resJornadas.data)
            ? resJornadas.data?.data || resJornadas.data
            : []
        );
        setCargos(
          Array.isArray(resCargos.data?.data || resCargos.data)
            ? resCargos.data?.data || resCargos.data
            : []
        );
  
        // Acá va el set de comunas
        const comunasData = Array.isArray(resComunas.data?.data)
          ? resComunas.data.data
          : Array.isArray(resComunas.data)
          ? resComunas.data
          : [];
        setComunas(comunasData);
        console.log("Comunas cargadas:", comunasData);
  
      } catch (err) {
        console.error("Error al cargar listados:", err);
        setCiudades([]);
        setDepartamentos([]);
        setJornadas([]);
        setCargos([]);
        setComunas([]);
      }
    };
  
    if (token) {
      cargarListados();
    }
  }, [token]);
  

  // Cargar trabajador si es edición
  useEffect(() => {
    if (id) {
      setCargando(true);
      axios
        .get(`/api/trabajadores/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => {
          reset({
            rut: data.rut,
            nombre: data.nombre,
            apellidos: data.apellidos,
            correo: data.correo,
            telefono: data.telefono,
            fechaNacimiento: data.fechaNacimiento,
            estadoCivil: data.estadoCivil,
            hijos: data.hijos,
            direccion: data.direccion,
            casaBloqueDepto: data.casaBloqueDepto,
            comunaId: data.comunaId,
            ciudad: data.ciudad,
            departamentoId: data.departamentoId,
            cargoId: data.cargoId,
            tipoContrato: data.tipoContrato,
            cantidadDuracion: data.cantidadDuracion,
            unidadDuracion: data.unidadDuracion,
            jornadaLaboralId: data.jornadaLaboralId,
            gratificacionTipo: data.gratificacionTipo,
            gratificacionMonto: data.gratificacionMonto,
          });
        })
        .catch((err) => {
          console.error(err);
          setErrorGeneral("No se pudo cargar el trabajador");
        })
        .finally(() => setCargando(false));
    }
  }, [id, token, reset]);

  // Cargar cargos por departamento
  useEffect(() => {
    if (departamentoSeleccionado) {
      axios
        .get(`/api/cargos?departamentoId=${departamentoSeleccionado}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => {
          setCargos(data || []);
          if (!data.some((c) => c.id === data.cargoId)) {
            setValue("cargoId", "");
          }
        });
    } else {
      setCargos([]);
    }
  }, [departamentoSeleccionado, setValue, token]);

  const onSubmit = async (datos) => {
    setErrorGeneral("");
    setCargando(true);

    try {
      const metodo = id ? "put" : "post";
      const url = id
        ? `/api/trabajadores/${id}`
        : "/api/trabajadores";
      await axios[metodo](url, datos, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/trabajadores");
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        "Ocurrió un error al guardar el trabajador.";
      setErrorGeneral(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Editar Trabajador" : "Crear Trabajador"}
      </h1>

      {errorGeneral && (
        <p className="text-red-600 mb-4">{errorGeneral}</p>
      )}

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
                <select
                    id="comunaId"
                    {...register("comunaId")}
                    className={`w-full border p-2 rounded ${
                    errors.comunaId ? "border-red-600" : "border-gray-300"
                    }`}
                >
                    <option value="">Selecciona una comuna</option>
                    {Array.isArray(comunas) && comunas.length > 0 ? (
                    comunas.map((c) => (
                        <option key={c.id} value={c.id}>
                        {c.nombre}
                        </option>
                    ))
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
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
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
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
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
                <>
                  <div>
                    <label
                      htmlFor="cantidadDuracion"
                      className="block mb-1 font-medium"
                    >
                      Cantidad de Duración
                    </label>
                    <input
                      id="cantidadDuracion"
                      type="number"
                      {...register("cantidadDuracion", { valueAsNumber: true })}
                      className={`w-full border p-2 rounded ${
                        errors.cantidadDuracion ? "border-red-600" : "border-gray-300"
                      }`}
                    />
                    {errors.cantidadDuracion && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.cantidadDuracion.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="unidadDuracion"
                      className="block mb-1 font-medium"
                    >
                      Unidad de Duración
                    </label>
                    <select
                      id="unidadDuracion"
                      {...register("unidadDuracion")}
                      className={`w-full border p-2 rounded ${
                        errors.unidadDuracion ? "border-red-600" : "border-gray-300"
                      }`}
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
                </>
              )}

              <div>
                <label
                  htmlFor="jornadaLaboralId"
                  className="block mb-1 font-medium"
                >
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
                  {jornadas.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre}
                    </option>
                  ))}
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
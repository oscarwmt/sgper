import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const schema = yup.object().shape({
  rut: yup
    .string()
    .required("El RUT es obligatorio")
    .matches(
      /^0*(\d{1,3}(\.?\d{3})*)\-?([\dkK])$/,
      "Formato de RUT inválido"
    ),
  nombre: yup.string().required("El nombre es obligatorio"),
  apellidos: yup.string().required("Los apellidos son obligatorios"),
  correo: yup.string().email("Correo inválido").required("Correo es obligatorio"),
  telefono: yup.string().nullable(),
  fechaNacimiento: yup.date().required("Fecha de nacimiento es obligatoria"),
  estadoCivil: yup.string().required("Estado civil es obligatorio"),
  direccion: yup.string().required("La dirección es obligatoria"),
  casaBloqueDepto: yup.string().nullable(),
  ciudad: yup.string().required("La ciudad es obligatoria"),
  cv: yup.mixed().nullable(),
  certificadoAntecedentes: yup.mixed().nullable(),
  certificadoAFP: yup.mixed().nullable(),
  funIsapre: yup.mixed().nullable(),
  cargoId: yup.number()
  .typeError("Debe seleccionar un cargo válido")
  .required("El cargo es obligatorio"),

  departamentoId: yup.number()
    .typeError("Debe seleccionar un departamento válido")
    .required("El departamento es obligatorio"),

  comunaId: yup.number()
    .typeError("Debe seleccionar una comuna válida")
    .required("La comuna es obligatoria"),

    hijos: yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? 0 : Number(originalValue)
    )
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
});

const TrabajadorForm = ({ id, onSuccess }) => {
  const { user } = useContext(AuthContext); // usuario con empresa_id
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [comunas, setComunas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      rut: "",
      nombre: "",
      apellidos: "",
      correo: "",
      telefono: "",
      fechaNacimiento: "",
      estadoCivil: "",
      hijos: 0,
      direccion: "",
      casaBloqueDepto: "",
      ciudad: "",
      comunaId: "",
      departamentoId: "",
      cargoId: "",
      cv: null,
      certificadoAntecedentes: null,
      certificadoAFP: null,
      funIsapre: null,
    },
  });

  const departamentoId = watch("departamentoId");

  useEffect(() => {
    if (departamentoId) {
      setDepartamentoSeleccionado(departamentoId);
      // Filtrar cargos según departamento seleccionado
      axios
        .get(`/api/cargos?id_departamentos=${departamentoId}`)
        .then((res) => setCargos(res.data))
        .catch(() => setCargos([]));
    } else {
      setDepartamentoSeleccionado(null);
      setCargos([]);
    }
  }, [departamentoId]);

  useEffect(() => {
    // Cargar comunas y departamentos para selects
    setCargando(true);
    Promise.all([
      axios.get("/api/comunas"),
      axios.get("/api/departamentos"),
    ])
    .then(([comunasRes, departamentosRes]) => {
      setComunas(Array.isArray(comunasRes.data) ? comunasRes.data : comunasRes.data.data || []);
      setDepartamentos(Array.isArray(departamentosRes.data) ? departamentosRes.data : departamentosRes.data.data || []);
    })    
      .catch(() => {
        setErrorGeneral("Error cargando datos de comunas o departamentos");
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (id) {
      // Cargar datos para editar
      setCargando(true);
      axios
        .get(`/api/trabajadores/${id}`)
        .then(({ data }) => {
          for (const key in data) {
            if (key in schema.fields) {
              setValue(key, data[key]);
            }
          }
          setDepartamentoSeleccionado(data.departamentoId);
        })
        .catch(() => setErrorGeneral("Error cargando datos del trabajador"))
        .finally(() => setCargando(false));
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setErrorGeneral("");
    setCargando(true);
  
    try {
      const formData = new FormData();
  
      const camposNumericos = ["comunaId", "departamentoId", "cargoId", "hijos"];
      const camposArchivos = ["cv", "certificadoAntecedentes", "certificadoAFP", "funIsapre"];
  
      for (const key in data) {
        if (camposArchivos.includes(key)) {
          const file = data[key]?.[0];
          if (file) formData.append(key, file);
        } else if (key === "fechaNacimiento") {
          const fecha = new Date(data[key]);
          if (!isNaN(fecha.getTime())) {
            formData.append(key, fecha.toISOString().split("T")[0]);
          } else {
            formData.append(key, null);
          }
        } else if (camposNumericos.includes(key)) {
          const numero = Number(data[key]);
          formData.append(key, !isNaN(numero) ? numero : null);
        } else {
          formData.append(key, data[key]);
        }
      }
  
      formData.append("empresa_id", user.empresa_id);
  
      if (id) {
        await axios.put(`/api/trabajadores/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/trabajadores", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
  
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar trabajador:", error);
      setErrorGeneral(
        error.response?.data?.message || "Error al guardar trabajador"
      );
    } finally {
      setCargando(false);
    }
  };
  
  
  

  console.log("comunas", comunas);
  console.log("departamentos", departamentos);
  console.log("cargos", cargos);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Editar Trabajador" : "Crear Trabajador"}
      </h1>

      {errorGeneral && <p className="text-red-600 mb-4">{errorGeneral}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Datos Personales */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Datos Personales</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* RUT */}
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
                  <p className="text-red-600 text-sm mt-1">{errors.rut.message}</p>
                )}
              </div>

              {/* Nombre */}
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
                  <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Apellidos */}
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
                  <p className="text-red-600 text-sm mt-1">{errors.apellidos.message}</p>
                )}
              </div>

              {/* Correo */}
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
                  <p className="text-red-600 text-sm mt-1">{errors.correo.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block mb-1 font-medium">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  {...register("telefono")}
                  className={`w-full border p-2 rounded ${
                    errors.telefono ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.telefono && (
                  <p className="text-red-600 text-sm mt-1">{errors.telefono.message}</p>
                )}
              </div>

              {/* Fecha Nacimiento */}
              <div>
                <label htmlFor="fechaNacimiento" className="block mb-1 font-medium">
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

              {/* Estado Civil */}
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
                  <option value="">Seleccione...</option>
                  <option value="soltero">Soltero(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="viudo">Viudo(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                </select>
                {errors.estadoCivil && (
                  <p className="text-red-600 text-sm mt-1">{errors.estadoCivil.message}</p>
                )}
              </div>

              {/* Hijos */}
              <div>
                <label htmlFor="hijos" className="block mb-1 font-medium">
                  Cantidad de Hijos
                </label>
                <input
                  id="hijos"
                  type="number"
                  min="0"
                  {...register("hijos")}
                  className={`w-full border p-2 rounded ${
                    errors.hijos ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.hijos && (
                  <p className="text-red-600 text-sm mt-1">{errors.hijos.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Dirección */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Dirección</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="direccion" className="block mb-1 font-medium">
                  Dirección
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
                  <p className="text-red-600 text-sm mt-1">{errors.direccion.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="casaBloqueDepto"
                  className="block mb-1 font-medium"
                >
                  Casa / Bloque / Depto
                </label>
                <input
                  id="casaBloqueDepto"
                  type="text"
                  {...register("casaBloqueDepto")}
                  className={`w-full border p-2 rounded ${
                    errors.casaBloqueDepto ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.casaBloqueDepto && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.casaBloqueDepto.message}
                  </p>
                )}
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
                  <p className="text-red-600 text-sm mt-1">{errors.ciudad.message}</p>
                )}
              </div>

              <div>
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
                  <option value="">Seleccione...</option>
                  {comunas.map((c, idx) => (
                  <option key={c?.id ?? `comuna-${idx}`} value={c?.id}>
                    {c?.nombre}
                  </option>
                ))}
                </select>
                {errors.comunaId && (
                  <p className="text-red-600 text-sm mt-1">{errors.comunaId.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Departamento y Cargo */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Información Laboral</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="departamentoId" className="block mb-1 font-medium">
                  Departamento
                </label>
                <select
                  id="departamentoId"
                  {...register("departamentoId")}
                  className={`w-full border p-2 rounded ${
                    errors.departamentoId ? "border-red-600" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccione...</option>
                  {departamentos.map((d) => (
                  <option key={d.id_departamentos} value={d.id_departamentos}>
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
                <select {...register("cargoId")}>
                  <option value="">Seleccione...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {errors.cargoId && (
                  <p className="text-red-600 text-sm mt-1">{errors.cargoId.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Archivos */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cargas de Archivos</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="cv" className="block mb-1 font-medium">
                  CV (PDF o DOC)
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...register("cv")}
                  className={`w-full border p-2 rounded ${
                    errors.cv ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.cv && (
                  <p className="text-red-600 text-sm mt-1">{errors.cv.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="certificadoAntecedentes" className="block mb-1 font-medium">
                  Certificado de Antecedentes
                </label>
                <input
                  id="certificadoAntecedentes"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...register("certificadoAntecedentes")}
                  className={`w-full border p-2 rounded ${
                    errors.certificadoAntecedentes ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.certificadoAntecedentes && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.certificadoAntecedentes.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="certificadoAFP" className="block mb-1 font-medium">
                  Certificado AFP
                </label>
                <input
                  id="certificadoAFP"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...register("certificadoAFP")}
                  className={`w-full border p-2 rounded ${
                    errors.certificadoAFP ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.certificadoAFP && (
                  <p className="text-red-600 text-sm mt-1">{errors.certificadoAFP.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="funIsapre" className="block mb-1 font-medium">
                  Formulario FUN Isapre
                </label>
                <input
                  id="funIsapre"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...register("funIsapre")}
                  className={`w-full border p-2 rounded ${
                    errors.funIsapre ? "border-red-600" : "border-gray-300"
                  }`}
                />
                {errors.funIsapre && (
                  <p className="text-red-600 text-sm mt-1">{errors.funIsapre.message}</p>
                )}
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            {id ? "Actualizar Trabajador" : "Crear Trabajador"}
          </button>
        </form>
      )}
    </div>
  );
};

export default TrabajadorForm;

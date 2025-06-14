// src/pages/trabajadores/Contratos.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  trabajadorId: yup.string().required("Seleccione trabajador"),
  tipoContrato: yup.string().required("Seleccione tipo de contrato"),
  fechaInicio: yup.string().required("Seleccione fecha de inicio"),
  jornadaId: yup.string().required("Seleccione jornada laboral"),
  departamentoId: yup.string().required("Seleccione departamento"),
  cargoId: yup.string().required("Seleccione cargo"),
});

function Contratos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [afps, setAfps] = useState([]);
  const [isapres, setIsapres] = useState([]);
  const [tiposContrato, setTiposContrato] = useState([]);
  const [diasVacacionesConsumidos, setDiasVacacionesConsumidos] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const tipoContrato = watch("tipoContrato");
  const departamentoId = watch("departamentoId");
  const fechaInicio = watch("fechaInicio");
  const trabajadorId = watch("trabajadorId");

  // Carga datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          deptRes,
          jornadaRes,
          afpRes,
          isapreRes,
          tiposContratoRes,
        ] = await Promise.all([
          axios.get("/api/departamentos"),
          axios.get("/api/jornadas"),
          axios.get("/api/afps"),
          axios.get("/api/isapres"),
          axios.get("/api/tipos-contrato"),
        ]);

        console.log("Datos de departamentos:", deptRes.data); // 👈 Depuración
        setDepartamentos(deptRes.data);
        setJornadas(jornadaRes.data);
        setAfps(afpRes.data);
        setIsapres(isapreRes.data);
        setTiposContrato(tiposContratoRes.data);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      }
    };

    loadData();
  }, []);

  // Carga cargos según departamento
  useEffect(() => {
    if (departamentoId && !isNaN(parseInt(departamentoId))) {
      console.log("ID enviado a /api/cargos:", departamentoId);
      axios
        .get(`/api/cargos?id_departamento=${departamentoId}`)
        .then((res) => setCargos(res.data))
        .catch((err) => {
          console.error("Error al cargar cargos:", err);
          setCargos([]);
        });
      setValue("cargoId", "");
    } else {
      setCargos([]);
      setValue("cargoId", "");
    }
  }, [departamentoId, setValue]);

  // Simulación o llamada para obtener días vacaciones consumidos
  useEffect(() => {
    if (trabajadorId && fechaInicio) {
      axios
        .get(
          `/api/vacaciones/consumidas?id_trabajadores=${trabajadorId}&fecha_inicio=${fechaInicio}`
        )
        .then((res) => {
          setDiasVacacionesConsumidos(res.data.dias || 0);
        })
        .catch(() => {
          setDiasVacacionesConsumidos(0);
        });
    } else {
      setDiasVacacionesConsumidos(0);
    }
  }, [trabajadorId, fechaInicio]);

  // Calcula vacaciones automáticamente
  useEffect(() => {
    if (!fechaInicio) return;
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    let anosContrato = hoy.getFullYear() - inicio.getFullYear();

    const inicioMesDia = inicio.getMonth() * 100 + inicio.getDate();
    const hoyMesDia = hoy.getMonth() * 100 + hoy.getDate();

    if (hoyMesDia < inicioMesDia) {
      anosContrato--;
    }

    if (anosContrato < 0) anosContrato = 0;

    const vacacionesTotales = anosContrato * 15;
    const vacacionesRestantes = vacacionesTotales - diasVacacionesConsumidos;

    setValue(
      "vacaciones",
      vacacionesRestantes >= 0 ? vacacionesRestantes : 0
    );
  }, [fechaInicio, diasVacacionesConsumidos, setValue]);

  // Búsqueda de trabajadores
  const buscarTrabajadores = async (inputValue) => {
    try {
      const res = await axios.get(`/api/trabajadores`, {
        params: {
          filtro: inputValue,
          empresa_id: user.empresa_id, // este es clave para multiempresa
        },
      });
  
      return res.data.data.map((t) => ({
        label: `${t.rut} - ${t.nombre} ${t.apellidos}`,
        value: t.id,
      }));
    } catch (err) {
      console.error("Error buscando trabajadores:", err.response?.data || err.message);
      return [];
    }
  };
  
  // Enviar formulario
  const onSubmit = async (data) => {
    const payload = {
      id_trabajadores: data.trabajadorId,
      tipo_id_contrato: parseInt(data.tipoContrato, 10),
      fecha_inicio: data.fechaInicio,
      fecha_termino: data.fechaTermino || null,
      jornada_laboral_id: data.jornadaId,
      id_departamentos: data.departamentoId,
      id_cargo: data.cargoId,
      descripcion_funciones: data.descripcion || null,
      sueldo_base: parseFloat(data.sueldoBase) || 0,
      bono_colacion: parseFloat(data.bonoColacion) || 0,
      bono_locomocion: parseFloat(data.bonoLocomocion) || 0,
      otros_bonos: parseFloat(data.otrosBonos) || 0,
      vacaciones: parseInt(data.vacaciones) || 0,
      id_afp: parseInt(data.afpId) || null,
      id_isapre: parseInt(data.isapreId) || null,
    };

    console.log("Datos enviados:", payload);

    if (
      !payload.id_trabajadores ||
      !payload.tipo_id_contrato ||
      !payload.id_departamentos ||
      !payload.jornada_laboral_id ||
      !payload.id_cargo
    ) {
      alert("Faltan campos requeridos");
      return;
    }

    try {
      await axios.post("/api/contratos", payload);
      alert("Contrato creado correctamente");
    } catch (err) {
      console.error("Error al guardar contrato", err.response?.data || err);
      alert("Error al guardar contrato");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Formulario de Contrato</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        {/* Buscar trabajador */}
        <div className="col-span-2">
          <label className="block font-semibold mb-1">Buscar trabajador por RUT</label>
          <Controller
            name="trabajadorId"
            control={control}
            render={({ field }) => (
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={buscarTrabajadores}
                onChange={(e) => field.onChange(e?.value)}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label: `ID: ${field.value}`,
                      }
                    : null
                }
              />
            )}
          />
          {errors.trabajadorId && (
            <p className="text-red-500 text-sm">{errors.trabajadorId.message}</p>
          )}
        </div>

        {/* Tipo de contrato */}
        <div>
          <label className="block">Tipo de contrato</label>
          <select {...register("tipoContrato")} className="w-full border p-2 rounded">
            <option value="">Seleccione</option>
            {tiposContrato.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.tipoContrato && (
            <p className="text-red-500 text-sm">{errors.tipoContrato.message}</p>
          )}
        </div>

        {/* Fecha inicio */}
        <div>
          <label className="block">Fecha inicio</label>
          <input
            type="date"
            {...register("fechaInicio")}
            className="w-full border p-2 rounded"
          />
          {errors.fechaInicio && (
            <p className="text-red-500 text-sm">{errors.fechaInicio.message}</p>
          )}
        </div>

        {/* Fecha término */}
        <div>
          <label className="block">Fecha término</label>
          <input
            type="date"
            {...register("fechaTermino")}
            className="w-full border p-2 rounded"
            disabled={tipoContrato === "Indefinido"}
          />
        </div>

        {/* Departamento */}
        <div>
          <label className="block">Departamento</label>
          <select {...register("departamentoId")} className="w-full border p-2 rounded">
            <option value="">Seleccione</option>
            {departamentos.map((d) => (
              <option key={d.id_departamento} value={d.id_departamento}>
                {d.nombre}
              </option>
            ))}
          </select>
          {errors.departamentoId && (
            <p className="text-red-500 text-sm">{errors.departamentoId.message}</p>
          )}
        </div>

        {/* Cargo */}
        <div>
          <label className="block">Cargo</label>
          <select {...register("cargoId")} className="w-full border p-2 rounded">
            <option value="">Seleccione</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errors.cargoId && (
            <p className="text-red-500 text-sm">{errors.cargoId.message}</p>
          )}
        </div>

        {/* Descripción funciones */}
        <div className="col-span-2">
          <label className="block">Descripción funciones</label>
          <textarea
            {...register("descripcion")}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        {/* Jornada laboral */}
        <div>
          <label className="block">Jornada laboral</label>
          <select {...register("jornadaId")} className="w-full border p-2 rounded">
            <option value="">Seleccione</option>
            {jornadas.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nombre}
              </option>
            ))}
          </select>
          {errors.jornadaId && (
            <p className="text-red-500 text-sm">{errors.jornadaId.message}</p>
          )}
        </div>

        {/* Vacaciones */}
        <div>
          <label className="block">Vacaciones</label>
          <input
            type="number"
            {...register("vacaciones")}
            className="w-full border p-2 rounded bg-gray-100"
            readOnly
          />
        </div>

        {/* Sueldo Base */}
        <div>
          <label className="block">Sueldo Base</label>
          <input
            type="number"
            {...register("sueldoBase")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Bono Locomoción */}
        <div>
          <label className="block">Bono Locomoción</label>
          <input
            type="number"
            {...register("bonoLocomocion")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Bono Colación */}
        <div>
          <label className="block">Bono Colación</label>
          <input
            type="number"
            {...register("bonoColacion")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Otros Bonos */}
        <div>
          <label className="block">Otros Bonos</label>
          <input
            type="number"
            {...register("otrosBonos")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* AFP */}
        <div>
          <label className="block">AFP</label>
          <select {...register("afpId")} className="w-full border p-2 rounded">
            <option value="">Seleccione</option>
            {afps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Isapre */}
        <div>
          <label className="block">Isapre</label>
          <select {...register("isapreId")} className="w-full border p-2 rounded">
            <option value="">Seleccione</option>
            {isapres.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botón submit */}
        <div className="col-span-2 text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Guardar Contrato
          </button>
        </div>
      </form>
    </div>
  );
}

export default Contratos;
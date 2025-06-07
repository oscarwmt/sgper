import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Select from "react-select";

const schema = yup.object().shape({
  trabajadorId: yup.string().required("Selecciona un trabajador"),
  tipoContrato: yup.string().required("Tipo de contrato requerido"),
  fechaInicio: yup.date().required("Fecha de inicio requerida"),
  fechaTermino: yup.date().nullable(),
  departamento: yup.string().required("Departamento requerido"),
  cargo: yup.string().required("Cargo requerido"),
  funciones: yup.string(),
  sueldoBase: yup.number().required("Sueldo base requerido"),
  bonoLocomocion: yup.number().default(0),
  bonoColacion: yup.number().default(0),
  otrosBonos: yup.string(),
  beneficios: yup.string(),
  horario: yup.string(),
  vacaciones: yup.string(),
  politicas: yup.string(),
  afp: yup.string().required("AFP requerida"),
  isapre: yup.string().required("Isapre requerida")
});

const Contratos = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [trabajadores, setTrabajadores] = useState([]);
  const [afps, setAfps] = useState([]);
  const [isapres, setIsapres] = useState([]);

  const tipoContrato = watch("tipoContrato");

  useEffect(() => {
    const fetchData = async () => {
      const [trabRes, afpRes, isapreRes] = await Promise.all([
        axios.get("/api/trabajadores"),
        axios.get("/api/afp"),
        axios.get("/api/isapres")
      ]);
      setTrabajadores(trabRes.data);
      setAfps(afpRes.data);
      setIsapres(isapreRes.data);
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      await axios.post("/api/contratos", formData);
      alert("Contrato creado correctamente");
      reset();
    } catch (error) {
      console.error(error);
      alert("Error creando contrato");
    }
  };

  const handleRutSearch = async (inputValue) => {
    if (inputValue.length >= 2) {
      const { data } = await axios.get(`/api/trabajadores?rut_like=${inputValue}`);
      return data.map((t) => ({ label: `${t.rut} - ${t.nombres} ${t.apellidos}`, value: t.id }));
    }
    return [];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Formulario de Contrato</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
        <div>
          <label className="block font-semibold mb-1">Buscar RUT</label>
          <Controller
            name="trabajadorId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                loadOptions={handleRutSearch}
                defaultOptions
                onChange={(selected) => field.onChange(selected.value)}
                placeholder="Buscar por RUT..."
                className="text-black"
              />
            )}
          />
          {errors.trabajadorId && <p className="text-red-500 text-sm">{errors.trabajadorId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Tipo de contrato</label>
            <select {...register("tipoContrato")} className="w-full p-2 border rounded">
              <option value="">Seleccione</option>
              <option value="INDEFINIDO">Indefinido</option>
              <option value="PLAZO FIJO">Plazo fijo</option>
              <option value="HONORARIOS">Honorarios</option>
            </select>
            {errors.tipoContrato && <p className="text-red-500 text-sm">{errors.tipoContrato.message}</p>}
          </div>
          <div>
            <label>Fecha inicio</label>
            <input type="date" {...register("fechaInicio")} className="w-full p-2 border rounded" />
            {errors.fechaInicio && <p className="text-red-500 text-sm">{errors.fechaInicio.message}</p>}
          </div>
          <div>
            <label>Fecha fin</label>
            <input
              type="date"
              {...register("fechaTermino")}
              disabled={tipoContrato === "INDEFINIDO"}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label>Departamento</label>
            <input type="text" {...register("departamento")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Cargo</label>
            <input type="text" {...register("cargo")} className="w-full p-2 border rounded" />
          </div>
          <div className="col-span-2">
            <label>Descripción funciones</label>
            <textarea {...register("funciones")} className="w-full p-2 border rounded"></textarea>
          </div>

          <div>
            <label>Sueldo base</label>
            <input type="number" {...register("sueldoBase")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Bono locomoción</label>
            <input type="number" {...register("bonoLocomocion")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Bono colación</label>
            <input type="number" {...register("bonoColacion")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Otros bonos</label>
            <input type="text" {...register("otrosBonos")} className="w-full p-2 border rounded" />
          </div>

          <div className="col-span-2">
            <label>Beneficios</label>
            <textarea {...register("beneficios")} className="w-full p-2 border rounded"></textarea>
          </div>
          <div className="col-span-2">
            <label>Horario laboral</label>
            <input type="text" {...register("horario")} className="w-full p-2 border rounded" />
          </div>
          <div className="col-span-2">
            <label>Días de vacaciones</label>
            <input type="text" {...register("vacaciones")} className="w-full p-2 border rounded" />
          </div>
          <div className="col-span-2">
            <label>Políticas empresa</label>
            <textarea {...register("politicas")} className="w-full p-2 border rounded"></textarea>
          </div>

          <div>
            <label>AFP</label>
            <select {...register("afp")} className="w-full p-2 border rounded">
              <option value="">Seleccione</option>
              {afps.map((afp) => (
                <option key={afp.id} value={afp.id}>{afp.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Isapre</label>
            <select {...register("isapre")} className="w-full p-2 border rounded">
              <option value="">Seleccione</option>
              {isapres.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>CV del trabajador</label>
            <input type="file" {...register("cv")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Certificado de antecedentes</label>
            <input type="file" {...register("antecedentes")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Certificado AFP</label>
            <input type="file" {...register("cert_afp")} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>FUN Isapre</label>
            <input type="file" {...register("fun_isapre")} className="w-full p-2 border rounded" />
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar Contrato
        </button>
      </form>
    </div>
  );
};

export default Contratos;

// src/pages/Login.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const schema = yup.object({
  correo: yup.string().email("Correo inválido").required("Requerido"),
  password: yup.string().required("Requerido"),
});

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Ahora dentro del componente

  const onSubmit = async (data) => {
    try {
      const res = await loginUsuario(data.correo, data.password);
      login(res.usuario, res.token); // ✅ guardar en contexto
      navigate("/dashboard"); // ✅ redirigir con useNavigate
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="mb-4">
          <label className="block mb-1">Correo</label>
          <input
            type="email"
            {...register("correo")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500 text-sm">{errors.correo?.message}</p>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2 border rounded"
          />
          <p className="text-red-500 text-sm">{errors.password?.message}</p>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;

// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import trabajadoresRouter from "./routes/trabajadores.js";
import cargasFamiliaresRouter from "./routes/cargasFamiliares.js";
import authRoutes from "./routes/authRoutes.js";
import contratosRouter from "./routes/contratos.js";
import isapresRouter from "./routes/isapres.js";
import afpsRouter from "./routes/afps.js";
import comunasRouter from "./routes/comunas.js";
import departamentosRouter from "./routes/departamentos.js";
import cargosRouter from "./routes/cargos.js";
import jornadasRouter from "./routes/jornadas.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/trabajadores", trabajadoresRouter);
app.use("/api/cargas", cargasFamiliaresRouter);
app.use("/api/auth", authRoutes);
app.use("/api/contratos", contratosRouter);
app.use("/api/isapres", isapresRouter);
app.use("/api/afps", afpsRouter);
app.use("/api", comunasRouter);
app.use("/api", departamentosRouter);
app.use("/api", cargosRouter);
app.use("/api", jornadasRouter);


app.get("/", (req, res) => res.send("API funcionando"));

app.listen(process.env.PORT, () => {
  console.log(`Servidor backend en http://localhost:${process.env.PORT}`);
});

import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET /api/comunas
router.get("/departamento", async (req, res) => {


  let query = "SELECT id_departamento as id, nombre FROM departamentos";

  try {
    const result = await pool.query(query);

    res.json({
      error: false,
      data: result.rows,
      message: result.rows.length > 0 ? "Departamentos cargados" : "Sin departamentos",
    });
  } catch (err) {
    console.error("Error al cargar departamentos:", err);
    res.status(500).json({
      error: true,
      message: "No se pudieron cargar los departamento",
    });
  }
});

export default router;
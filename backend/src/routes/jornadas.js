import express from "express";
import { pool } from "../db.js";
// import { authJwt } from "../middleware/authJwt.js";

const router = express.Router();

// GET /api/jornadas
router.get("/jornadas", async (req, res) => {
  const query = "SELECT id_jornada AS id, nombre FROM jornadas ORDER BY nombre";

  try {
    const result = await pool.query(query);
    res.json({
      error: false,
      data: result.rows,
      message: result.rows.length > 0 ? "Jornadas cargadas" : "Sin jornadas",
    });
  } catch (err) {
    console.error("Error al cargar jornadas:", err);
    res.status(500).json({
      error: true,
      message: "No se pudieron cargar las jornadas",
    });
  }
});

export default router;
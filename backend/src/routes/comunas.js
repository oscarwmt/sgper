import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET /api/comunas
router.get("/comunas", async (req, res) => {
  const { ciudad } = req.query;

  let query = "SELECT id_comunas, nombre FROM comunas";

  try {
    const result = await pool.query(query, ciudad ? [ciudad] : []);

    res.json({
      error: false,
      data: result.rows,
      message: result.rows.length > 0 ? "Comunas cargadas" : "Sin comunas",
    });
  } catch (err) {
    console.error("Error al cargar comunas:", err);
    res.status(500).json({
      error: true,
      message: "No se pudieron cargar las comunas",
    });
  }
});

export default router;
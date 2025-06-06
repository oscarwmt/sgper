import express from "express";
import { pool } from "../db.js";
// import { authJwt } from "../middleware/authJwt.js";

const router = express.Router();

// GET /api/cargos
router.get("/cargos", async (req, res) => {
  const { departamentoId } = req.query;

  let query = "SELECT id_cargo AS id, nombre, id_departamento FROM cargos";
  let values = [];

  if (!departamentoId || isNaN(departamentoId)) {
    return res.status(400).json({
      error: true,
      message: "Debe proporcionar un departamento válido",
      code: "MISSING_DEPARTAMENTO_ID"
    });
  }

    try {
        const result = await pool.query(
          "SELECT id_cargo as id, nombre FROM cargos WHERE id_departamento = $1",
          [parseInt(departamentoId)]
        );
      
        res.json({
          error: false,
          data: result.rows,
          message: result.rows.length > 0 ? "Cargos cargados" : "Sin cargos para este departamento",
        });
      } catch (err) {
        console.error("Error al cargar cargos:", err);
        res.status(500).json({
          error: true,
          message: "No se pudieron cargar los cargos",
        });
      }
});

export default router;
// src/routes/departamentos.js
import express from "express";
import {
  getDepartamentos,
  getDepartamentoById,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento,
} from "../controllers/departamentosController.js";

const router = express.Router();

router.get("/", getDepartamentos);
router.get("/:id", getDepartamentoById);
router.post("/", createDepartamento);
router.put("/:id", updateDepartamento);
router.delete("/:id", deleteDepartamento);

export default router;
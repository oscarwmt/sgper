// src/routes/jornadas.js
import express from "express";
import {
  getJornadas,
  getJornadaById,
  createJornada,
  updateJornada,
  deleteJornada,
} from "../controllers/jornadasController.js";

const router = express.Router();

router.get("/", getJornadas);
router.get("/:id", getJornadaById);
router.post("/", createJornada);
router.put("/:id", updateJornada);
router.delete("/:id", deleteJornada);

export default router;
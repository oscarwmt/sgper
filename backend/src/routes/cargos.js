// src/routes/cargos.js
import express from "express";
import {
  getCargos,
  getCargoById,
  createCargo,
  updateCargo,
  deleteCargo,
} from "../controllers/cargosController.js";

const router = express.Router();

router.get("/", getCargos);
router.get("/:id", getCargoById);
router.post("/", createCargo);
router.put("/:id", updateCargo);
router.delete("/:id", deleteCargo);

export default router;
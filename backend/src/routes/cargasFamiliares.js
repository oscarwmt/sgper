import express from "express";
import {
  getCargasFamiliares,
  getCargaFamiliarById,
  createCargaFamiliar,
  updateCargaFamiliar,
  deleteCargaFamiliar,
} from "../controllers/cargasFamiliaresController.js";

const router = express.Router();

router.get("/", getCargasFamiliares);
router.get("/:id", getCargaFamiliarById);
router.post("/", createCargaFamiliar);
router.put("/:id", updateCargaFamiliar);
router.delete("/:id", deleteCargaFamiliar);

export default router;

import express from "express";
import {
  getTrabajadores,
  getTrabajadorById,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
} from "../controllers/trabajadoresController.js";

const router = express.Router();

router.get("/", getTrabajadores);
router.get("/:id", getTrabajadorById);
router.post("/", createTrabajador);
router.put("/:id", updateTrabajador);
router.delete("/:id", deleteTrabajador);

export default router;

import express from "express";
import {
  // ...
  desactivarTrabajador,
} from "../controllers/trabajadoresController.js";

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
router.patch("/:id/desactivar", desactivarTrabajador);

export default router;

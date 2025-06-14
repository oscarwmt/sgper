import express from "express";
import multer from "multer";
import {
  getTrabajadores,
  getTrabajadorById,
  createTrabajador,
  updateTrabajador,
  deleteTrabajador,
  desactivarTrabajador
} from "../controllers/trabajadoresController.js";
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// === Multer: carga en memoria, puedes cambiar a diskStorage si decides guardar en disco ===
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB por archivo
});

const fileFields = upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "certificadoAntecedentes", maxCount: 1 },
  { name: "certificadoAFP", maxCount: 1 },
  { name: "formularioFUN", maxCount: 1 },
]);

// === Todas las rutas protegidas por autenticación ===
router.get('/', verificarToken, getTrabajadores);

// === Rutas CRUD de trabajadores ===
router.get("/", verificarToken, getTrabajadores);
router.get("/:id", getTrabajadorById);
router.post("/", fileFields, createTrabajador);
router.put("/:id", fileFields, updateTrabajador);
router.delete("/:id", deleteTrabajador);
router.patch("/:id/desactivar", desactivarTrabajador);

export default router;

// src/routes/tipoContrato.js
import express from "express";
import { getTiposContrato } from "../controllers/tipoContratoController.js";

const router = express.Router();
router.get("/", getTiposContrato);

export default router;

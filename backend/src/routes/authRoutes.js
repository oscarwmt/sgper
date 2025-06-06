// src/routes/authRoutes.js
import express from "express";
import { login } from "../controllers/authController.js"; // o como lo tengas
import { pool } from '../db.js';

const router = express.Router();

router.post("/login", login);

export default router;

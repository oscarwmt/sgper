// routes/isapres.js
import express from "express";
import {
  getIsapres,
  getIsapreById,
  createIsapre,
  updateIsapre,
  deleteIsapre,
} from "../controllers/isapresController.js";

const router = express.Router();

router.get("/", getIsapres);
router.get("/:id", getIsapreById);
router.post("/", createIsapre);
router.put("/:id", updateIsapre);
router.delete("/:id", deleteIsapre);

export default router;

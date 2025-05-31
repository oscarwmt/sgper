// routes/afps.js
import express from "express";
import {
  getAfps,
  getAfpById,
  createAfp,
  updateAfp,
  deleteAfp,
} from "../controllers/afpsController.js";

const router = express.Router();

router.get("/", getAfps);
router.get("/:id", getAfpById);
router.post("/", createAfp);
router.put("/:id", updateAfp);
router.delete("/:id", deleteAfp);

export default router;

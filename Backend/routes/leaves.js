import express from "express";
import {
    applyLeave,
    getAllLeaves,
    getMyLeaves,
    updateLeaveStatus,
} from "../controllers/leaveController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/apply", applyLeave);
router.get("/my", getMyLeaves);
router.get("/", adminOnly, getAllLeaves);
router.put("/:id/status", adminOnly, updateLeaveStatus);

export default router;
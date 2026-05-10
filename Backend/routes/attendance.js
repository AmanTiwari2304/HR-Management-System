import express from "express";
import {
    markAttendance,
    getAttendance,
    getMyAttendance,
} from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/my", getMyAttendance);
router.get("/", getAttendance);
router.post("/", adminOnly, markAttendance);

export default router;
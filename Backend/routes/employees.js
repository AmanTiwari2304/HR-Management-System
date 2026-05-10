import express from "express";
import {
    getAllEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from "../controllers/employeeController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getAllEmployees);
router.get("/:id", getEmployee);
router.post("/", adminOnly, createEmployee);
router.put("/:id", adminOnly, updateEmployee);
router.delete("/:id", adminOnly, deleteEmployee);

export default router;
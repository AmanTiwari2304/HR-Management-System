import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const markAttendance = async (req, res) => {
    try {
        const { employeeId, date, status, checkIn, checkOut, remarks } = req.body;

        // Validate required fields
        if (!employeeId || !date || !status) {
            return res.status(400).json({ 
                message: "Missing required fields: employeeId, date, status" 
            });
        }

        // Validate status enum
        const validStatuses = ["present", "absent", "half-day", "late"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
            });
        }

        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({ employee: employeeId, date: dateObj });
        if (existing) {
        const updated = await Attendance.findByIdAndUpdate(
            existing._id,
            { status, checkIn, checkOut, remarks },
            { new: true }
        ).populate("employee", "name employeeId department");
        return res.json(updated);
        }

        const attendance = await Attendance.create({
            employee: employeeId,
            date: dateObj,
            status,
            checkIn,
            checkOut,
            remarks,
        });

        const populated = await attendance.populate("employee", "name employeeId department");
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAttendance = async (req, res) => {
    try {
        const { date, employeeId, month, year } = req.query;
        let filter = {};

        if (employeeId) filter.employee = employeeId;
        if (date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        filter.date = d;
        } else if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        filter.date = { $gte: start, $lte: end };
        }

        const records = await Attendance.find(filter)
        .populate("employee", "name employeeId department designation")
        .sort({ date: -1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMyAttendance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const { month, year } = req.query;
        const m = month || new Date().getMonth() + 1;
        const y = year || new Date().getFullYear();

        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);

        const records = await Attendance.find({
        employee: employee._id,
        date: { $gte: start, $lte: end },
        }).sort({ date: 1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
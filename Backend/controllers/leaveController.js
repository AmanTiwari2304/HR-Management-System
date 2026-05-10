import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";

export const applyLeave = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const { leaveType, startDate, endDate, reason } = req.body;

        // Validate required fields
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ 
                message: "Missing required fields: leaveType, startDate, endDate, reason" 
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate date range
        if (end <= start) {
            return res.status(400).json({ 
                message: "End date must be after start date" 
            });
        }

        // Validate leaveType enum
        const validLeaveTypes = ["sick", "casual", "earned", "maternity", "other"];
        if (!validLeaveTypes.includes(leaveType)) {
            return res.status(400).json({ 
                message: `Invalid leave type. Must be one of: ${validLeaveTypes.join(", ")}` 
            });
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await Leave.create({
            employee: employee._id,
            leaveType,
            startDate: start,
            endDate: end,
            days,
            reason,
        });

        res.status(201).json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllLeaves = async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (employeeId) filter.employee = employeeId;

        const leaves = await Leave.find(filter)
        .populate("employee", "name employeeId department designation")
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) return res.status(404).json({ message: "Employee profile not found" });

        const leaves = await Leave.find({ employee: employee._id })
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminRemarks } = req.body;
        const leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status, adminRemarks, approvedBy: req.user.id },
        { new: true }
        ).populate("employee", "name employeeId department");

        if (!leave) return res.status(404).json({ message: "Leave request not found" });
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
import Employee from "../models/Employee.js";
import User from "../models/User.js";

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const { name, email, phone, department, designation, salary, joiningDate, employeeId, password } = req.body;

        // Validate required fields
        if (!name || !email || !employeeId || !department || !designation || !password) {
            return res.status(400).json({ 
                message: "Missing required fields: name, email, employeeId, department, designation, password" 
            });
        }

        // Create login account for employee
        const user = await User.create({
            name,
            email,
            password: password,
            role: "employee",
        });

        const employee = await Employee.create({
            user: user._id,
            employeeId,
            name,
            email,
            phone,
            department,
            designation,
            salary,
            joiningDate,
        });

        res.status(201).json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        
        // Delete associated user account first, then employee (prevents inconsistency)
        if (employee.user) {
            try {
                await User.findByIdAndDelete(employee.user);
            } catch (userErr) {
                return res.status(500).json({ message: "Failed to delete user account: " + userErr.message });
            }
        }
        
        // Now delete the employee record
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
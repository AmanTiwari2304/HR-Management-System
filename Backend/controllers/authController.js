import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

export const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const user = await User.create({ name, email, password, role });

        res.status(201).json({
            token: generateToken(user),
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        res.json({
            token: generateToken(user),
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
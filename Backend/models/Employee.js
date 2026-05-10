import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        employeeId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        department: { type: String, required: true },
        designation: { type: String, required: true },
        salary: { type: Number, default: 0 },
        joiningDate: { type: Date, default: Date.now },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        date: { type: Date, required: true },
        status: {
            type: String,
            enum: ["present", "absent", "half-day", "late"],
            required: true,
        },
        checkIn: { type: String },
        checkOut: { type: String },
        remarks: { type: String },
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same employee on same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
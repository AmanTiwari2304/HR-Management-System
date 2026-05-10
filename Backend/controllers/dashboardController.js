import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalEmployees,
            activeEmployees,
            todayAttendance,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
            departments,
        ] = await Promise.all([
            Employee.countDocuments(),
            Employee.countDocuments({ status: "active" }),
            Attendance.find({ date: today }).populate("employee", "name department"),
            Leave.countDocuments({ status: "pending" }),
            Leave.countDocuments({ status: "approved" }),
            Leave.countDocuments({ status: "rejected" }),
            Employee.aggregate([
                { $group: { _id: "$department", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        const presentToday = todayAttendance.filter((a) => a.status === "present" || a.status === "late").length;
        const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
        const halfDayToday = todayAttendance.filter((a) => a.status === "half-day").length;

        // Monthly attendance summary (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const end = new Date(d);
            end.setHours(23, 59, 59, 999);

            const records = await Attendance.find({ date: { $gte: d, $lte: end } });
            last7Days.push({
                date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                present: records.filter((r) => r.status === "present" || r.status === "late").length,
                absent: records.filter((r) => r.status === "absent").length,
            });
        }

        res.json({
        employees: { total: totalEmployees, active: activeEmployees },
        attendance: {
            presentToday,
            absentToday,
            halfDayToday,
            totalMarked: todayAttendance.length,
            last7Days,
        },
        leaves: { pending: pendingLeaves, approved: approvedLeaves, rejected: rejectedLeaves },
        departments,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
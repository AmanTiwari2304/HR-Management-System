import { useEffect, useState } from "react";
import api from "../utils/api";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import toast from "react-hot-toast";

const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="card flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
        </div>
        <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
    </div>
    );

    export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
        try {
            const { data } = await api.get("/dashboard");
            setStats(data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
        };
        fetch();
    }, []);

    if (loading) {
        return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin text-4xl">⟳</div>
        </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">
            Overview as of {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
            </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
            title="Total Employees"
            value={stats.employees.total}
            subtitle={`${stats.employees.active} active`}
            icon="👥"
            color="bg-blue-100"
            />
            <StatCard
            title="Present Today"
            value={stats.attendance.presentToday}
            subtitle={`${stats.attendance.absentToday} absent`}
            icon="✅"
            color="bg-green-100"
            />
            <StatCard
            title="Pending Leaves"
            value={stats.leaves.pending}
            subtitle="Awaiting approval"
            icon="⏳"
            color="bg-yellow-100"
            />
            <StatCard
            title="Approved Leaves"
            value={stats.leaves.approved}
            subtitle={`${stats.leaves.rejected} rejected`}
            icon="✔️"
            color="bg-purple-100"
            />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Chart */}
            <div className="card lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
                Attendance – Last 7 Days
            </h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.attendance.last7Days} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
            </ResponsiveContainer>
            </div>

            {/* Departments */}
            <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Department Headcount</h3>
            <div className="space-y-3">
                {stats.departments.map((dept) => (
                <div key={dept._id}>
                    <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{dept._id || "Unassigned"}</span>
                    <span className="text-gray-900 font-semibold">{dept.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                        width: `${Math.min(100, (dept.count / stats.employees.total) * 100)}%`,
                        }}
                    />
                    </div>
                </div>
                ))}
                {stats.departments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No department data</p>
                )}
            </div>
            </div>
        </div>

        {/* Leave Summary */}
        <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Leave Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-3xl font-bold text-yellow-600">{stats.leaves.pending}</p>
                <p className="text-sm text-yellow-700 mt-1">Pending</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{stats.leaves.approved}</p>
                <p className="text-sm text-green-700 mt-1">Approved</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-3xl font-bold text-red-600">{stats.leaves.rejected}</p>
                <p className="text-sm text-red-700 mt-1">Rejected</p>
            </div>
            </div>
        </div>
        </div>
    );
}
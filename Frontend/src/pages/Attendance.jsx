import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_COLORS = {
    present: "badge-success",
    absent: "badge-danger",
    "half-day": "badge-warning",
    late: "badge-info",
};

export default function Attendance() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [form, setForm] = useState({
        employeeId: "",
        date: new Date().toISOString().slice(0, 10),
        status: "present",
        checkIn: "09:00",
        checkOut: "18:00",
        remarks: "",
    });

    const fetchRecords = async () => {
        setLoading(true);
        try {
        const endpoint = isAdmin ? "/attendance" : "/attendance/my";
        const { data } = await api.get(endpoint, {
            params: { month: filters.month, year: filters.year },
        });
        setRecords(data);
        } catch {
        toast.error("Failed to load attendance");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        if (isAdmin) {
        api.get("/employees").then(({ data }) => setEmployees(data)).catch(() => {});
        }
    }, [filters]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.employeeId) return toast.error("Select an employee");
        setSubmitting(true);
        try {
        await api.post("/attendance", form);
        toast.success("Attendance marked!");
        setShowModal(false);
        fetchRecords();
        } catch (err) {
        toast.error(err.response?.data?.message || "Failed to mark attendance");
        } finally {
        setSubmitting(false);
        }
    };

    const summary = {
        present: records.filter((r) => r.status === "present").length,
        absent: records.filter((r) => r.status === "absent").length,
        late: records.filter((r) => r.status === "late").length,
        halfDay: records.filter((r) => r.status === "half-day").length,
    };

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
            <p className="text-gray-500 text-sm mt-1">
                {months[filters.month - 1]} {filters.year}
            </p>
            </div>
            {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
                + Mark Attendance
            </button>
            )}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3">
            <select
            className="input-field w-auto"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            >
            {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
            ))}
            </select>
            <select
            className="input-field w-auto"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            >
            {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
            ))}
            </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
            { label: "Present", value: summary.present, color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Absent", value: summary.absent, color: "bg-red-50 text-red-700 border-red-200" },
            { label: "Late", value: summary.late, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Half Day", value: summary.halfDay, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
            ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
            ))}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
            {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                    {["Date", "Employee", "Department", "Status", "Check In", "Check Out", "Remarks"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {records.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5 text-gray-600">
                        {new Date(r.date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">
                        {r.employee?.name || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{r.employee?.department || "—"}</td>
                        <td className="px-5 py-3.5">
                        <span className={STATUS_COLORS[r.status] || "badge-info"}>{r.status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{r.checkIn || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-600">{r.checkOut || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{r.remarks || "—"}</td>
                    </tr>
                    ))}
                    {records.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                        No attendance records found
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            )}
        </div>

        {/* Mark Attendance Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Mark Attendance</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                    <select
                    required
                    className="input-field"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                        <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                    required
                    type="date"
                    className="input-field"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half-day">Half Day</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                    <input
                        type="time"
                        className="input-field"
                        value={form.checkIn}
                        onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                    <input
                        type="time"
                        className="input-field"
                        value={form.checkOut}
                        onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <input
                    className="input-field"
                    placeholder="Optional note..."
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Saving..." : "Mark Attendance"}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
}
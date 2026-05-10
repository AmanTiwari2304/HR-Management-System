import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DEPARTMENTS = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Design", "Sales"];

const initialForm = {
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    password: "",
};

export default function Employees() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get("/employees");
            setEmployees(data);
        } catch {
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const openAdd = () => {
        setForm(initialForm);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (emp) => {
        setForm({
            employeeId: emp.employeeId,
            name: emp.name,
            email: emp.email,
            phone: emp.phone || "",
            department: emp.department,
            designation: emp.designation,
            salary: emp.salary,
            joiningDate: emp.joiningDate?.slice(0, 10) || "",
            password: "",
        });
        setEditingId(emp._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
        if (editingId) {
            await api.put(`/employees/${editingId}`, form);
            toast.success("Employee updated!");
        } else {
            await api.post("/employees", form);
            toast.success("Employee added! Default password: Employee@123");
        }
        setShowModal(false);
        fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}? This will also delete their login account.`)) return;
        try {
            await api.delete(`/employees/${id}`);
            toast.success("Employee deleted");
            setEmployees((prev) => prev.filter((e) => e._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const filtered = employees.filter(
        (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
            <p className="text-gray-500 text-sm mt-1">{employees.length} total employees</p>
            </div>
            {isAdmin && (
            <button onClick={openAdd} className="btn-primary">
                + Add Employee
            </button>
            )}
        </div>

        {/* Search */}
        <div className="card p-4">
            <input
            type="text"
            placeholder="Search by name, ID, or department..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
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
                    {["Emp ID", "Name", "Department", "Designation", "Salary", "Status", ...(isAdmin ? ["Actions"] : [])].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{emp.employeeId}</td>
                        <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {emp.name[0].toUpperCase()}
                            </div>
                            <div>
                            <p className="font-medium text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.email}</p>
                            </div>
                        </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{emp.department}</td>
                        <td className="px-5 py-3.5 text-gray-600">{emp.designation}</td>
                        <td className="px-5 py-3.5 text-gray-600">
                        ₹{Number(emp.salary).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5">
                        <span className={emp.status === "active" ? "badge-success" : "badge-danger"}>
                            {emp.status}
                        </span>
                        </td>
                        {isAdmin && (
                        <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                            <button
                                onClick={() => openEdit(emp)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(emp._id, emp.name)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                                Delete
                            </button>
                            </div>
                        </td>
                        )}
                    </tr>
                    ))}
                    {filtered.length === 0 && (
                    <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="px-5 py-10 text-center text-gray-400">
                        No employees found
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            )}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {editingId ? "Edit Employee" : "Add New Employee"}
                </h3>
                <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                    ×
                </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                    <input
                    required
                    className="input-field"
                    placeholder="EMP001"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    disabled={!!editingId}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                    required
                    className="input-field"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                    required
                    type="email"
                    className="input-field"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={!!editingId}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                    className="input-field"
                    placeholder="+91 9000000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                    required
                    className="input-field"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <input
                    required
                    className="input-field"
                    placeholder="Software Engineer"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹)</label>
                    <input
                    type="number"
                    className="input-field"
                    placeholder="50000"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                    <input
                    type="date"
                    className="input-field"
                    value={form.joiningDate}
                    onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                    />
                </div>
                {!editingId && (
                    <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Login Password (default: Employee@123)
                    </label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Leave blank for default"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    </div>
                )}
                <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                    <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                    >
                    Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Saving..." : editingId ? "Update" : "Add Employee"}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
}
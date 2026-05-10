import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-danger",
};

const LEAVE_TYPES = ["sick", "casual", "earned", "maternity", "other"];

export default function Leaves() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionForm, setActionForm] = useState({ status: "approved", adminRemarks: "" });
    const [applyForm, setApplyForm] = useState({
        leaveType: "sick",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const endpoint = isAdmin ? "/leaves" : "/leaves/my";
            const params = isAdmin && statusFilter !== "all" ? { status: statusFilter } : {};
            const { data } = await api.get(endpoint, { params });
            setLeaves(data);
        } catch {
            toast.error("Failed to load leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeaves(); }, [statusFilter]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (new Date(applyForm.startDate) > new Date(applyForm.endDate)) {
            return toast.error("End date must be after start date");
        }
        setSubmitting(true);
        try {
            await api.post("/leaves/apply", applyForm);
            toast.success("Leave application submitted!");
            setShowApplyModal(false);
            setApplyForm({ leaveType: "sick", startDate: "", endDate: "", reason: "" });
            fetchLeaves();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to apply");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
        await api.put(`/leaves/${selectedLeave._id}/status`, actionForm);
            toast.success(`Leave ${actionForm.status}!`);
            setShowActionModal(false);
            fetchLeaves();
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setSubmitting(false);
        }
    };

    const openAction = (leave) => {
        setSelectedLeave(leave);
        setActionForm({ status: "approved", adminRemarks: "" });
        setShowActionModal(true);
    };

    const days = (s, e) => {
        const diff = new Date(e) - new Date(s);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const filtered = statusFilter === "all"
        ? leaves
        : leaves.filter((l) => l.status === statusFilter);

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h2 className="text-2xl font-bold text-gray-900">
                {isAdmin ? "Leave Requests" : "My Leaves"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{leaves.length} total requests</p>
            </div>
            {!isAdmin && (
            <button onClick={() => setShowApplyModal(true)} className="btn-primary">
                + Apply Leave
            </button>
            )}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected"].map((s) => (
            <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
                {s}
            </button>
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
                    {[
                        ...(isAdmin ? ["Employee"] : []),
                        "Type", "Start", "End", "Days", "Reason", "Status",
                        ...(isAdmin ? ["Action"] : ["Remarks"]),
                    ].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                        {isAdmin && (
                        <td className="px-5 py-3.5">
                            <p className="font-medium text-gray-900">{leave.employee?.name}</p>
                            <p className="text-xs text-gray-400">{leave.employee?.department}</p>
                        </td>
                        )}
                        <td className="px-5 py-3.5 capitalize text-gray-600">{leave.leaveType}</td>
                        <td className="px-5 py-3.5 text-gray-600">
                        {new Date(leave.startDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                        {new Date(leave.endDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700 font-medium">{leave.days}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs max-w-xs truncate">
                        {leave.reason}
                        </td>
                        <td className="px-5 py-3.5">
                        <span className={STATUS_BADGE[leave.status]}>{leave.status}</span>
                        </td>
                        {isAdmin ? (
                        <td className="px-5 py-3.5">
                            {leave.status === "pending" && (
                            <button
                                onClick={() => openAction(leave)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                                Review
                            </button>
                            )}
                        </td>
                        ) : (
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                            {leave.adminRemarks || "—"}
                        </td>
                        )}
                    </tr>
                    ))}
                    {filtered.length === 0 && (
                    <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                        No leave requests found
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            )}
        </div>

        {/* Apply Leave Modal */}
        {showApplyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Apply for Leave</h3>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>
                <form onSubmit={handleApply} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                    <select
                    className="input-field"
                    value={applyForm.leaveType}
                    onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                    >
                    {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                        required
                        type="date"
                        className="input-field"
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                        required
                        type="date"
                        className="input-field"
                        value={applyForm.endDate}
                        min={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    />
                    </div>
                </div>
                {applyForm.startDate && applyForm.endDate && (
                    <p className="text-sm text-blue-600 font-medium">
                    Duration: {days(applyForm.startDate, applyForm.endDate)} day(s)
                    </p>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                    <textarea
                    required
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Explain the reason for leave..."
                    value={applyForm.reason}
                    onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary">
                    Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Submitting..." : "Apply Leave"}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* Admin Action Modal */}
        {showActionModal && selectedLeave && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Review Leave Request</h3>
                <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>
                <div className="p-6 space-y-4">
                {/* Leave Details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <p><span className="font-medium text-gray-600">Employee:</span> {selectedLeave.employee?.name}</p>
                    <p><span className="font-medium text-gray-600">Leave Type:</span> <span className="capitalize">{selectedLeave.leaveType}</span></p>
                    <p><span className="font-medium text-gray-600">Duration:</span> {selectedLeave.days} day(s)</p>
                    <p><span className="font-medium text-gray-600">Dates:</span> {new Date(selectedLeave.startDate).toLocaleDateString("en-IN")} – {new Date(selectedLeave.endDate).toLocaleDateString("en-IN")}</p>
                    <p><span className="font-medium text-gray-600">Reason:</span> {selectedLeave.reason}</p>
                </div>

                <form onSubmit={handleAction} className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
                    <div className="grid grid-cols-2 gap-3">
                        {["approved", "rejected"].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setActionForm({ ...actionForm, status: s })}
                            className={`py-2.5 rounded-lg text-sm font-medium capitalize border-2 transition-colors ${
                            actionForm.status === s
                                ? s === "approved"
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-red-500 bg-red-50 text-red-700"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                        >
                            {s === "approved" ? "✓ Approve" : "✗ Reject"}
                        </button>
                        ))}
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
                    <textarea
                        rows={2}
                        className="input-field resize-none"
                        placeholder="Add a note for the employee..."
                        value={actionForm.adminRemarks}
                        onChange={(e) => setActionForm({ ...actionForm, adminRemarks: e.target.value })}
                    />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowActionModal(false)} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? "Processing..." : "Confirm Decision"}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}
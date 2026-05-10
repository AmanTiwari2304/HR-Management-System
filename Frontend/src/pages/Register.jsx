import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
        adminSecret: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
        return toast.error("Passwords do not match");
        }
        if (form.password.length < 6) {
        return toast.error("Password must be at least 6 characters");
        }
        if (form.role === "admin" && form.adminSecret !== "HRSYSTEM2026") {
        return toast.error("Invalid admin secret key");
        }

        setLoading(true);
        try {
        await api.post("/auth/register", {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
        });
        toast.success("Account created! Please login.");
        navigate("/login");
        } catch (err) {
        toast.error(err.response?.data?.message || "Registration failed");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">

            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                HR
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 mt-1 text-sm">Register to HR Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                </label>
                <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                </div>

                {/* Email */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                </label>
                <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                </div>

                {/* Role */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {["admin", "employee"].map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, role: r, adminSecret: "" })}
                        className={`py-2.5 rounded-lg text-sm font-medium capitalize border-2 transition-colors ${
                        form.role === r
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                    >
                        {r === "admin" ? "🛡️ Admin" : "👤 Employee"}
                    </button>
                    ))}
                </div>
                </div>

                {/* Admin Secret Key — only shown when admin is selected */}
                {form.role === "admin" && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Admin Secret Key
                    </label>
                    <input
                    type="password"
                    required
                    placeholder="Enter admin secret key"
                    className="input-field"
                    value={form.adminSecret}
                    onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                    Contact your system administrator for the secret key.
                    </p>
                </div>
                )}

                {/* Password */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                </label>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 6 characters"
                    className="input-field pr-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                    {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>
                </div>

                {/* Confirm Password */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password
                </label>
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your password"
                    className="input-field"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                {/* Live match indicator */}
                {form.confirmPassword && (
                    <p
                    className={`text-xs mt-1 font-medium ${
                        form.password === form.confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                    >
                    {form.password === form.confirmPassword
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                )}
                </div>

                {/* Submit */}
                <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-base mt-2"
                >
                {loading ? "Creating Account..." : "Create Account"}
                </button>
            </form>

            {/* Navigate to Login */}
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
                >
                Sign In
                </Link>
            </p>
            </div>
        </div>
        </div>
    );
}
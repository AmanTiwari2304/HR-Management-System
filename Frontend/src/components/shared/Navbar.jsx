import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
            <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
            ☰
            </button>
            <h1 className="text-lg font-semibold text-gray-800 hidden md:block">
            HR Management System
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
            Welcome, <span className="font-medium">{user?.name}</span>
            </span>
            <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize hidden sm:block ${
                user?.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
            >
            {user?.role}
            </span>
            <button onClick={handleLogout} className="btn-danger text-sm py-1.5 px-3">
            Logout
            </button>
        </div>
        </header>
    );
}
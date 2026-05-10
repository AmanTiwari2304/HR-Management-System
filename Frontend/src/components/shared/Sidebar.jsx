import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "📊",
    adminOnly: true,
  },
  {
    to: "/employees",
    label: "Employees",
    icon: "👥",
    adminOnly: true,
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: "📅",
    adminOnly: false,
  },
  {
    to: "/leaves",
    label: "Leaves",
    icon: "🌴",
    adminOnly: false,
  },
];

export default function Sidebar({ open, setOpen }) {
    const { user } = useAuth();

    return (
        <>
        {/* Mobile overlay */}
        {open && (
            <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setOpen(false)}
            />
        )}

        <aside
            className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                HR
                </div>
                <span className="font-semibold text-lg">HR System</span>
            </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems
                .filter((item) => !item.adminOnly || user?.role === "admin")
                .map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`
                    }
                >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                </NavLink>
                ))}
            </nav>

            {/* User info */}
            <div className="px-4 py-4 border-t border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
            </div>
            </div>
        </aside>
        </>
    );
}
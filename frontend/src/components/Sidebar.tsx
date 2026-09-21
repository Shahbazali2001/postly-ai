import { NavLink, useLocation } from "react-router-dom";
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserIcon,
  Wand2Icon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Sidebar Toggle
const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { user, logout } = useAuth();

  // NavLinks
  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
    { name: "Accounts", icon: UserIcon, path: "/accounts" },
    { name: "Scheduler", icon: CalendarDaysIcon, path: "/schedule" },
    { name: "AI Composer", icon: Wand2Icon, path: "/ai-composer" },
  ];

  // Location
  const location = useLocation();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full transform transition-transform duration-200 ease-in-out md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 md:shadow-none md:flex-shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex text-xl font-bold tracking-tight text-slate-800 items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="size-6" />
          <span>Postly AI</span>
        </div>
      </div>

      {/* Nav Label */}
      <div className="px-6 py-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ease-in-out border ${
                isActive
                  ? "bg-red-50 text-red-600 border-red-100 shadow-xs"
                  : "text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
              }`}
              to={item.path}
              key={item.name}
              end={item.path === "/dashboard"}
              onClick={() => setIsOpen(false)}
            >
              <item.icon
                className={`size-4.5 shrink-0 ${
                  isActive ? "text-red-500" : "text-slate-400"
                }`}
              />
              <span>{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-4 rounded-full bg-red-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
          {/* User Avatar */}
          <div className="size-9 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {/* User Name and Mail ID */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
        {/* Logout Button */}
        <button
          className="mt-2 flex items-center gap-2 px-3 py-2 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer"
          onClick={logout}
        >
          <LogOutIcon className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

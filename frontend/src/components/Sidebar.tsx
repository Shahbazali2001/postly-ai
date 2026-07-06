import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  UserIcon,
  Wand2Icon,
} from "lucide-react";

// Sidebar Toggle
const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // NavLinks
  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
    { name: "Accounts", icon: UserIcon, path: "/accounts" },
    { name: "Scheduler", icon: CalendarDaysIcon, path: "/schedule" },
    { name: "AI Composer", icon: Wand2Icon, path: "/ai-composer" },
  ];

  // Location
  const location = useLocation();

  // User and Logout
  const { user, logout } = {
    logout: () => {
      window.location.href = "/";
    },

    user: {
      name: "John Doe",
      email: "johndoe@example.com",
    },
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col h-full transform transition-transform duration-200 ease-in-out md-relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex text-xl tracking-tight text-slate-800 items-center gap-1.5">
          <img src="/logo.svg" alt="Logo" className="size-6" />
          Postly AI
        </div>
      </div>

      {/* Nav Label*/}
      <div className="px-6 py-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Menu
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-150 ease-in-out hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm hover:shadow-red-100 border ${isActive ? "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-slate-100" : "text-slate-500 border-transparent hover:text-slate-700"}`}
              to={item.path}
              key={item.name}
              end={item.path === "/dashboard"}
              onClick={() => setIsOpen(false)}
            >
              <item.icon
                className={`size-4.5 shrink-0 ${isActive ? "text-red-500" : "text-slate-500"}`}
              />
              {item.name}
              {isActive && (
                <span className="ml-auto w-1.5 h-5 rounded-full bg-red-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
          {/* User Avatar */}
          <div className="size-8 rounded-full bg-linear-to-br from-red-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {/* User Name and Mail ID */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">
              {user?.name}
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

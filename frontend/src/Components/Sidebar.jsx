import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut, Settings } from "lucide-react";
import useAuthStore from "../useAuthStore";
import { t } from "../../i18n";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuthStore();

  const menuItems = [
    { label: t("nav.pos"), icon: "🛍️", path: "/pos" },
    { label: t("nav.tables"), icon: "📋", path: "/tables" },
    { label: t("nav.kds"), icon: "👨‍🍳", path: "/kds" },
    { label: t("nav.bar"), icon: "🍷", path: "/bar" },
    { label: t("nav.butcher"), icon: "🥩", path: "/butcher" },
    { label: t("nav.grocery"), icon: "🛒", path: "/grocery" },
    { label: t("nav.rooms"), icon: "🏨", path: "/rooms" },
    { label: t("nav.reports"), icon: "📊", path: "/reports" },
    { label: "Users", icon: "👥", path: "/users", admin: true },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (!user?.role) return false;

    // Admin-only items (superadmin only)
    if (item.admin) {
      return user.role === "superadmin";
    }

    const roleMenuMap = {
      superadmin: menuItems,
      manager: menuItems,
      cashier: [menuItems[0], menuItems[7]],
      waiter: [menuItems[1]],
      kitchen: [menuItems[2]],
      bar: [menuItems[3]],
      butcher: [menuItems[4]],
      grocery: [menuItems[5]],
      receptionist: [menuItems[6]],
    };

    return roleMenuMap[user.role]?.includes(item);
  });

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-blue-900 text-white transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-blue-700 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-bold">🏨 SmartHMS</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors group"
              title={!isOpen ? item.label : ""}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-blue-700 p-4 space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          title={!isOpen ? "Settings" : ""}
        >
          <Settings size={20} />
          {isOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          title={!isOpen ? t("nav.logout") : ""}
        >
          <LogOut size={20} />
          {isOpen && (
            <span className="text-sm font-medium">{t("nav.logout")}</span>
          )}
        </button>
      </div>

      {/* User Info */}
      {isOpen && (
        <div className="p-4 border-t border-blue-700">
          <p className="text-xs font-semibold truncate">{user?.name}</p>
          <p className="text-xs text-blue-300 truncate uppercase">
            {user?.role}
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

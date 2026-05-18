import React from "react";
import { Bell, Clock, DollarSign } from "lucide-react";
import Badge from "./Badge";
import { t } from "../../i18n";

export const TopBar = ({ notificationCount = 0 }) => {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4 ml-64">
        {/* Left side - Current time and status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={18} />
            <span className="text-sm font-semibold">{currentTime}</span>
          </div>
        </div>

        {/* Right side - Notifications and controls */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            {notificationCount > 0 && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center"
              >
                {notificationCount}
              </Badge>
            )}
          </button>

          {/* Currency display */}
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-lg">
            <DollarSign size={16} className="text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-900">ETB</span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 font-medium">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

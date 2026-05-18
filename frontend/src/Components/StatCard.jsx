import React from "react";
import Badge from "./Badge";

export const StatCard = ({ title, value, icon, trend, color = "blue" }) => {
  const colors = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    red: "border-red-500 bg-red-50",
    purple: "border-purple-500 bg-purple-50",
  };

  return (
    <div className={`border-l-4 ${colors[color]} rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
      {trend && (
        <p className="text-xs text-gray-600 mt-2">
          {trend > 0 ? "📈" : "📉"} {Math.abs(trend)}% vs last period
        </p>
      )}
    </div>
  );
};

export default StatCard;

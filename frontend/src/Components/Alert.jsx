import React from "react";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

export const Alert = ({ type = "info", title, message, onClose }) => {
  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }[type];

  const textColor = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  }[type];

  const iconColor = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }[type];

  const icons = {
    success: <CheckCircle className={`w-5 h-5 ${iconColor}`} />,
    error: <XCircle className={`w-5 h-5 ${iconColor}`} />,
    warning: <AlertCircle className={`w-5 h-5 ${iconColor}`} />,
    info: <Info className={`w-5 h-5 ${iconColor}`} />,
  };

  return (
    <div className={`p-4 border rounded-lg ${bgColor} ${textColor}`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

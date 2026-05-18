import React from "react";
import { Loader } from "lucide-react";

export const Card = ({
  children,
  className = "",
  loading = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      {...props}
    >
      {loading ? (
        <div className="p-6 flex items-center justify-center min-h-32">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

export default Card;

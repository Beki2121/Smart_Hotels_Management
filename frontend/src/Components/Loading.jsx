import React from "react";
import { Loader } from "lucide-react";

export const Loading = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 text-lg font-semibold">{message}</p>
    </div>
  </div>
);

export const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader
      className={`animate-spin text-blue-600 ${sizes[size]} ${className}`}
    />
  );
};

export default Loading;

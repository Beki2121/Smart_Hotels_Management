import React from "react";
import Badge from "./Badge";

export const RoomCard = ({ roomNumber, status, type, price, onClick }) => {
  const statusColors = {
    available: "success",
    occupied: "warning",
    reserved: "primary",
    maintenance: "danger",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all p-4 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">Room {roomNumber}</h3>
        <Badge variant={statusColors[status]}>{status}</Badge>
      </div>
      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p>Type: {type}</p>
        <p className="font-semibold text-gray-900">
          ETB {price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          /night
        </p>
      </div>
    </div>
  );
};

export default RoomCard;

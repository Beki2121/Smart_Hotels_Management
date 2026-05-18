import React from "react";
import Badge from "./Badge";

export const TableCard = ({
  tableId,
  status,
  seatsCount,
  occupants,
  onClick,
}) => {
  const statusColors = {
    available: "success",
    occupied: "warning",
    reserved: "primary",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all p-4 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">Table {tableId}</h3>
        <Badge variant={statusColors[status]}>{status}</Badge>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Seats: {seatsCount}</p>
        {occupants && <p>Occupants: {occupants}</p>}
      </div>
    </div>
  );
};

export default TableCard;

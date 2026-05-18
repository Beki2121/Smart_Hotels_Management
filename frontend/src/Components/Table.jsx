import React from "react";

export const Table = ({ children, className = "" }) => (
  <div className="overflow-x-auto">
    <table className={`w-full ${className}`}>{children}</table>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-gray-100 border-b-2 border-gray-300">{children}</thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200">{children}</tbody>
);

export const TableRow = ({ children, className = "", onClick }) => (
  <tr
    className={`hover:bg-gray-50 transition-colors ${onClick ? "cursor-pointer" : ""} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableHeader = ({ children, className = "" }) => (
  <th
    className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 ${className}`}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className = "" }) => (
  <td className={`px-6 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);

export default Table;

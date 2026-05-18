import React, { useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export const DataGrid = ({
  data = [],
  columns = [],
  loading = false,
  sortBy = null,
  onSort = null,
  onRowClick = null,
}) => {
  const [sortConfig, setSortConfig] = React.useState(sortBy);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : 1;
      }
      return aValue > bValue ? -1 : 1;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (columnKey) => {
    const newDirection =
      sortConfig?.key === columnKey && sortConfig?.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key: columnKey, direction: newDirection });
    onSort?.({ key: columnKey, direction: newDirection });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!sortedData.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No data found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-300">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() =>
                  column.sortable !== false && handleSort(column.key)
                }
                className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 ${
                  column.sortable !== false
                    ? "cursor-pointer hover:bg-gray-200"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable !== false &&
                    sortConfig?.key === column.key &&
                    (sortConfig?.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className="px-6 py-3 text-sm text-gray-700"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;

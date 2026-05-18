import React from "react";
import { Trash2 } from "lucide-react";
import Button from "./Button";

export const OrderItemRow = ({
  item,
  quantity,
  price,
  onRemove,
  onQuantityChange,
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
        ETB{" "}
        {(price * quantity).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
      </td>
      <td className="px-4 py-3 text-sm">
        <Button
          size="sm"
          variant="danger"
          onClick={onRemove}
          className="px-2 py-1"
        >
          <Trash2 size={16} />
        </Button>
      </td>
    </tr>
  );
};

export default OrderItemRow;

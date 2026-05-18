import React from "react";
import Badge from "./Badge";
import Button from "./Button";
import { ShoppingCart } from "lucide-react";

export const MenuItemCard = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
      {/* Image */}
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-xs text-gray-600 mb-3">{item.description}</p>

        {/* Badge */}
        {item.available === false && (
          <Badge variant="danger" size="sm" className="mb-3">
            Out of Stock
          </Badge>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ETB{" "}
            {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(item)}
            disabled={item.available === false}
          >
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;

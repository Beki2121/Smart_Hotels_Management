import React from "react";
import Card, { CardBody, CardFooter } from "./Card";
import Button from "./Button";

export const CartSummary = ({ items = [], onCheckout, onClear }) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <Card>
      <CardBody>
        <h3 className="font-bold text-lg mb-4">Order Summary</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">
              ETB{" "}
              {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (15%):</span>
            <span className="font-semibold">
              ETB {tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-t border-gray-300 pt-2 flex justify-between">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-lg text-blue-600">
              ETB {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClear}>
          Clear
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CartSummary;

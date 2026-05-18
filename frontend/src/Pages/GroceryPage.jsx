import React, { useState } from "react";
import { useMenuItems } from "../api/hooks";
import useCartStore from "../useCartStore";
import {
  Sidebar,
  TopBar,
  SearchInput,
  MenuItemCard,
  Card,
  CardBody,
  Button,
  Select,
  Loading,
} from "../Components";

export const GroceryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const { data: menuItems, isLoading } = useMenuItems("Grocery");
  const cartStore = useCartStore();

  const filteredItems =
    menuItems?.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🛒 Grocery Module
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu */}
            <div className="lg:col-span-2 space-y-4">
              <SearchInput
                placeholder="Search grocery items..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm("")}
              />

              {isLoading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={() => cartStore.addItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="space-y-4">
              {cartStore.items.length > 0 && (
                <Card>
                  <CardBody>
                    <h3 className="font-bold text-lg mb-3">
                      Items ({cartStore.getItemCount()})
                    </h3>
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                      {cartStore.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm pb-2 border-b"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            ETB{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "en-US",
                              { minimumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Select
                      label="Payment Method"
                      options={[
                        { label: "Cash", value: "cash" },
                        { label: "Telebirr", value: "telebirr" },
                        { label: "CBE Birr", value: "cbe" },
                      ]}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>
                          ETB{" "}
                          {cartStore.getTotal().toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <Button variant="primary" className="w-full mt-4">
                      Complete Sale
                    </Button>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryPage;

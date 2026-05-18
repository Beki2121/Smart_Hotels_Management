import React, { useState } from "react";
import { useMenuItems, useCreateBillMutation } from "../api/hooks";
import useCartStore from "../useCartStore";
import {
  Sidebar,
  TopBar,
  SearchInput,
  MenuItemCard,
  CartSummary,
  Card,
  CardBody,
  CardFooter,
  Button,
  Select,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Loading,
  Alert,
} from "../Components";
import { t } from "../../i18n";

export const POSPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const { data: menuItems, isLoading, error } = useMenuItems(selectedCategory);
  const cartStore = useCartStore();
  const createBillMutation = useCreateBillMutation();

  const filteredItems =
    menuItems?.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const categories = ["Restaurant", "Bar", "Butcher", "Grocery"];

  const handleCheckout = async () => {
    if (cartStore.items.length === 0) return;

    try {
      const billData = {
        items: cartStore.items,
        subtotal: cartStore.getTotal(),
        discount,
        tax: cartStore.getTotal() * 0.15,
        total: cartStore.getTotal() * 1.15 - discount,
        paymentMethod,
      };

      await createBillMutation.mutateAsync(billData);
      cartStore.clearCart();
      setDiscount(0);
      alert("Bill created successfully!");
    } catch (err) {
      alert("Error creating bill: " + err.message);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              title="Error loading menu"
              message={error.message}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-4">
                <SearchInput
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm("")}
                />
                <Select
                  options={categories.map((cat) => ({
                    label: cat,
                    value: cat,
                  }))}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  placeholder="All Categories"
                />
              </div>

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

            {/* Cart & Billing */}
            <div className="space-y-4">
              {/* Cart Items */}
              <Card>
                <CardBody>
                  <h3 className="font-bold text-lg mb-4">
                    Cart ({cartStore.getItemCount()})
                  </h3>
                  {cartStore.items.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Cart is empty
                    </p>
                  ) : (
                    <div className="overflow-x-auto mb-4">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeader>Item</TableHeader>
                            <TableHeader>Qty</TableHeader>
                            <TableHeader>Price</TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cartStore.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    cartStore.updateItemQuantity(
                                      item.id,
                                      parseInt(e.target.value),
                                    )
                                  }
                                  className="w-12 px-2 py-1 border border-gray-300 rounded"
                                />
                              </TableCell>
                              <TableCell>
                                ETB{" "}
                                {(item.price * item.quantity).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                  },
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Summary & Payment */}
              {cartStore.items.length > 0 && (
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>
                        ETB{" "}
                        {cartStore.getTotal().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (15%):</span>
                      <span>
                        ETB{" "}
                        {(cartStore.getTotal() * 0.15).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-lg text-blue-600">
                        ETB{" "}
                        {(
                          cartStore.getTotal() * 1.15 -
                          discount
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
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
                  </CardBody>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        cartStore.clearCart();
                        setDiscount(0);
                      }}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCheckout}
                      loading={createBillMutation.isPending}
                      className="flex-1"
                    >
                      Checkout
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;

import React, { useState } from "react";
import { useOrders, useCreateOrderMutation } from "../api/hooks";
import useCartStore from "../useCartStore";
import {
  Sidebar,
  TopBar,
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  Alert,
  Loading,
} from "../Components";
import { Plus, X } from "lucide-react";

export const WaiterPage = () => {
  const [orders, setOrders] = useState([]);
  const { data: allOrders, isLoading } = useOrders({
    status: ["pending", "preparing"],
  });
  const createOrderMutation = useCreateOrderMutation();

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Waiter Station
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardBody>
                  <h2 className="text-xl font-bold mb-4">Active Orders</h2>
                  {isLoading ? (
                    <p>Loading orders...</p>
                  ) : allOrders?.length === 0 ? (
                    <p className="text-gray-500">No active orders</p>
                  ) : (
                    <div className="space-y-3">
                      {allOrders?.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-lg">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                Table {order.tableNumber}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="mt-3 text-sm text-gray-700">
                            {order.items?.map((item, idx) => (
                              <p key={idx}>
                                {item.quantity}x {item.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardBody>
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Button variant="primary" className="w-full">
                      <Plus size={18} /> New Order
                    </Button>
                    <Button variant="secondary" className="w-full">
                      View Menu
                    </Button>
                    <Button variant="secondary" className="w-full">
                      My Orders
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterPage;

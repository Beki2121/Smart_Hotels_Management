import React, { useState, useEffect } from "react";
import { useOrders, useUpdateOrderMutation } from "../api/hooks";
import useSocketStore from "../useSocketStore";
import {
  TopBar,
  Card,
  CardBody,
  Button,
  Badge,
  Alert,
  Loading,
} from "../Components";
import { Wine } from "lucide-react";

export const BarDisplayPage = () => {
  const {
    data: orders,
    isLoading,
    error,
  } = useOrders({ module: "bar", status: ["pending", "preparing"] });
  const updateOrderMutation = useUpdateOrderMutation();
  const socketStore = useSocketStore();

  useEffect(() => {
    socketStore.connect();
    return () => socketStore.disconnect();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        data: { status: newStatus },
      });
      socketStore.emit("order_updated", { orderId, status: newStatus });
    } catch (err) {
      alert("Error updating order: " + err.message);
    }
  };

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];

  return (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-black min-h-screen p-6">
      <TopBar />

      <div className="mt-6">
        <h1 className="text-5xl font-bold text-white mb-2">🍷 Bar Display</h1>
        <p className="text-purple-300 mb-6">Real-time bar order management</p>

        {error && (
          <Alert
            type="error"
            title="Error loading orders"
            message={error.message}
          />
        )}

        {isLoading ? (
          <div className="text-white text-center py-16">
            Loading bar orders...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Orders */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-red-500">●</span>
                Pending ({pendingOrders.length})
              </h2>
              {pendingOrders.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700">
                  <CardBody className="text-center py-12">
                    <p className="text-gray-400">No pending orders</p>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="bg-red-950 border-red-700">
                      <CardBody>
                        <h3 className="text-white text-2xl font-bold mb-3">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="bg-gray-900 p-4 rounded mb-4">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-white text-lg mb-2 pb-2 border-b border-gray-700 last:border-0"
                            >
                              <span className="font-semibold">
                                {item.quantity}x {item.name}
                              </span>
                              {item.notes && (
                                <p className="text-yellow-300 text-sm mt-1">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() =>
                            handleStatusChange(order.id, "preparing")
                          }
                          loading={updateOrderMutation.isPending}
                        >
                          Start Preparation
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Preparing Orders */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-500">●</span>
                Preparing ({preparingOrders.length})
              </h2>
              {preparingOrders.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700">
                  <CardBody className="text-center py-12">
                    <p className="text-gray-400">No orders being prepared</p>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-4">
                  {preparingOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="bg-yellow-950 border-yellow-700"
                    >
                      <CardBody>
                        <h3 className="text-white text-2xl font-bold mb-3">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="bg-gray-900 p-4 rounded mb-4">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-white text-lg mb-2 pb-2 border-b border-gray-700 last:border-0"
                            >
                              <span className="font-semibold">
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="success"
                          className="w-full"
                          onClick={() => handleStatusChange(order.id, "ready")}
                          loading={updateOrderMutation.isPending}
                        >
                          Ready for Pickup
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarDisplayPage;

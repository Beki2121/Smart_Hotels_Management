import React, { useState, useEffect } from "react";
import { useOrders, useUpdateOrderMutation } from "../api/hooks";
import useSocketStore from "../useSocketStore";
import {
  Sidebar,
  TopBar,
  Card,
  CardBody,
  Button,
  Badge,
  Alert,
  Loading,
} from "../Components";
import { Clock, CheckCircle } from "lucide-react";
import { t } from "../../i18n";

export const KDSPage = () => {
  const {
    data: orders,
    isLoading,
    error,
  } = useOrders({ status: ["pending", "preparing"] });
  const updateOrderMutation = useUpdateOrderMutation();
  const socketStore = useSocketStore();
  const [filter, setFilter] = useState("all");

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

  const filteredOrders =
    orders?.filter((order) => {
      if (filter === "all") return true;
      return order.status === filter;
    }) || [];

  const priorityOrder = filteredOrders.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  return (
    <div className="flex bg-black min-h-screen">
      <div className="flex-1">
        <TopBar />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              title="Error loading orders"
              message={error.message}
            />
          )}

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">
              Kitchen Display System
            </h1>
            <div className="flex gap-2">
              {["all", "pending", "preparing"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "primary" : "secondary"}
                  onClick={() => setFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-white text-center py-8">Loading orders...</div>
          ) : priorityOrder.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700">
              <CardBody className="text-center py-16">
                <p className="text-white text-2xl font-semibold">
                  No pending orders
                </p>
                <p className="text-gray-400 mt-2">All caught up! 👍</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityOrder.map((order) => {
                const waitTime = Math.floor(
                  (Date.now() - new Date(order.createdAt).getTime()) / 60000,
                );
                const isUrgent = waitTime > 15;

                return (
                  <Card
                    key={order.id}
                    className={`bg-gray-900 border-2 ${
                      isUrgent
                        ? "border-red-500"
                        : order.status === "preparing"
                          ? "border-yellow-500"
                          : "border-gray-700"
                    }`}
                  >
                    <CardBody>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-white text-lg font-bold">
                          Order #{order.orderNumber}
                        </h3>
                        <Badge variant={isUrgent ? "danger" : "primary"}>
                          {waitTime} min
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <h4 className="text-white font-semibold text-sm">
                          Table {order.tableNumber}
                        </h4>
                        <div className="bg-gray-800 p-3 rounded max-h-40 overflow-y-auto">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-white text-sm mb-2 pb-2 border-b border-gray-700 last:border-0"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-gray-400">
                                {item.notes}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(order.id, "preparing")
                            }
                            loading={updateOrderMutation.isPending}
                            className="flex-1"
                          >
                            Start
                          </Button>
                        )}
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(order.id, "ready")}
                          loading={updateOrderMutation.isPending}
                          className="flex-1"
                        >
                          Ready
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KDSPage;

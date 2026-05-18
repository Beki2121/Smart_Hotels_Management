import React, { useEffect, useState } from "react";
import useAuthStore from "./useAuthStore";
import api from "./apiClient";

const OrdersPage = () => {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    table_id: "",
    items: [],
  });

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      setError("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!formData.table_id || formData.items.length === 0) {
      setError("Please select table and add items");
      return;
    }

    try {
      const response = await api.post("/orders", {
        table_id: parseInt(formData.table_id),
        items: formData.items,
      });

      const data = await response.json();

      if (response.ok) {
        setOrders([data, ...orders]);
        setShowForm(false);
        setFormData({ table_id: "", items: [] });
        setError("");
      } else {
        setError(data.error || "Failed to create order");
      }
    } catch (err) {
      setError("Error creating order");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? data : o)));
      }
    } catch (err) {
      setError("Error updating order status");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 Orders Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Order"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>New Order</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Table Number</label>
              <select
                value={formData.table_id}
                onChange={(e) =>
                  setFormData({ ...formData, table_id: e.target.value })
                }
              >
                <option value="">Select Table</option>
                <option value="1">Table 1</option>
                <option value="2">Table 2</option>
                <option value="3">Table 3</option>
              </select>
            </div>

            <div className="form-group">
              <label>Add Item</label>
              <input type="text" placeholder="Item name" />
            </div>
          </div>

          <button className="btn-primary" onClick={handleCreateOrder}>
            Create Order
          </button>
        </div>
      )}

      {loading ? (
        <div className="loader">Loading orders...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>Table {order.table_id}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>${order.total_amount?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === "pending" && (
                      <button
                        className="btn-sm"
                        onClick={() =>
                          handleStatusChange(order.id, "completed")
                        }
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

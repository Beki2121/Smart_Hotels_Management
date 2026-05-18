import React, { useEffect, useState } from "react";
import useAuthStore from "./useAuthStore";
import api from "./apiClient";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeBookings: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/daily-summary");
      const data = await response.json();

      if (response.ok) {
        setStats({
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          activeBookings: data.activeBookings || 0,
          pendingPayments: data.pendingPayments || 0,
        });
      }
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>Welcome, {user.name}!</p>
        </div>
        <div className="header-right">
          <span className="role-badge">{user.role}</span>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loader">Loading dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon="🏠"
            color="purple"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon="⏳"
            color="orange"
          />
        </div>
      )}

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn">Create Order</button>
          <button className="action-btn">Book Room</button>
          <button className="action-btn">Generate Report</button>
          <button className="action-btn">Manage Users</button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

export default DashboardPage;

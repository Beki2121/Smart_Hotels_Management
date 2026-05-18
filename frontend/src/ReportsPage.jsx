import React, { useEffect, useState } from "react";
import api from "./apiClient";

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/daily-summary");
      const data = await response.json();

      if (response.ok) {
        setReport(data);
      } else {
        setError("Failed to load report");
      }
    } catch (err) {
      setError("Error loading report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Reports & Analytics</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="filter-section">
        <div className="date-range">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading report...</div>
      ) : report ? (
        <div className="report-container">
          <div className="report-grid">
            <div className="report-card">
              <h3>Total Revenue</h3>
              <p className="report-value">
                ${report.totalRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="report-card">
              <h3>Total Orders</h3>
              <p className="report-value">{report.totalOrders || 0}</p>
            </div>

            <div className="report-card">
              <h3>Total Bookings</h3>
              <p className="report-value">{report.totalBookings || 0}</p>
            </div>

            <div className="report-card">
              <h3>Average Order Value</h3>
              <p className="report-value">
                ${report.averageOrderValue?.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="report-card">
              <h3>Active Guests</h3>
              <p className="report-value">{report.activeGuests || 0}</p>
            </div>

            <div className="report-card">
              <h3>Room Occupancy</h3>
              <p className="report-value">
                {report.occupancyRate?.toFixed(1) || "0"}%
              </p>
            </div>
          </div>

          <div className="detailed-section">
            <h2>Order Breakdown</h2>
            <div className="chart-placeholder">
              <p>Chart will display here with more detailed data</p>
            </div>
          </div>

          <div className="detailed-section">
            <h2>Top Menu Items</h2>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.topItems?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.revenue?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="error-banner">No data available</div>
      )}
    </div>
  );
};

export default ReportsPage;

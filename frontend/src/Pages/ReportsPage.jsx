import React, { useState } from "react";
import { useReports, useCloseDayMutation } from "../api/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Sidebar,
  TopBar,
  Card,
  CardBody,
  Button,
  Input,
  Alert,
  Loading,
} from "../Components";
import { Download, TrendingUp } from "lucide-react";

const reportData = [
  { date: "2024-01-01", revenue: 45000, orders: 52, tables: 12 },
  { date: "2024-01-02", revenue: 52000, orders: 61, tables: 15 },
  { date: "2024-01-03", revenue: 48500, orders: 55, tables: 10 },
  { date: "2024-01-04", revenue: 61000, orders: 68, tables: 18 },
  { date: "2024-01-05", revenue: 75000, orders: 88, tables: 20 },
  { date: "2024-01-06", revenue: 92000, orders: 105, tables: 20 },
  { date: "2024-01-07", revenue: 68000, orders: 78, tables: 14 },
];

export const ReportsPage = () => {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-07");
  const [cashCount, setCashCount] = useState("");
  const [notes, setNotes] = useState("");
  const { data: reports, isLoading } = useReports();
  const closeDayMutation = useCloseDayMutation();

  const handleCloseDay = async () => {
    if (!cashCount) {
      alert("Please enter physical cash count");
      return;
    }

    try {
      await closeDayMutation.mutateAsync({
        date: new Date().toISOString().split("T")[0],
        cashCount: parseFloat(cashCount),
        notes,
      });
      setCashCount("");
      setNotes("");
      alert("Day closed successfully!");
    } catch (err) {
      alert("Error closing day: " + err.message);
    }
  };

  const totalRevenue = reportData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = reportData.reduce((sum, d) => sum + d.orders, 0);
  const avgRevenue = Math.floor(totalRevenue / reportData.length);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            📊 Reports & Analytics
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardBody>
                <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ETB {totalRevenue.toLocaleString()}
                </p>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp size={16} /> +12% vs last period
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-gray-600 text-sm mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalOrders}
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Avg. {Math.floor(totalOrders / reportData.length)}/day
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-gray-600 text-sm mb-2">Daily Average</p>
                <p className="text-3xl font-bold text-gray-900">
                  ETB {avgRevenue.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Based on {reportData.length} days
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardBody>
                <h3 className="font-bold text-lg mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `ETB ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="font-bold text-lg mb-4">Orders per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10B981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Close Day Section */}
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Close Day</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Physical Cash Count"
                  type="number"
                  placeholder="Enter amount"
                  value={cashCount}
                  onChange={(e) => setCashCount(e.target.value)}
                />
                <Input
                  label="Notes"
                  placeholder="Optional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleCloseDay}
                loading={closeDayMutation.isPending}
              >
                Close Day
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useReports } from "../api/hooks";
import {
  Sidebar,
  TopBar,
  Card,
  CardBody,
  StatCard,
  Loading,
  Alert,
} from "../Components";
import { t } from "../../i18n";

const dashboardData = [
  { name: "Mon", revenue: 45000, orders: 52 },
  { name: "Tue", revenue: 52000, orders: 61 },
  { name: "Wed", revenue: 48500, orders: 55 },
  { name: "Thu", revenue: 61000, orders: 68 },
  { name: "Fri", revenue: 75000, orders: 88 },
  { name: "Sat", revenue: 92000, orders: 105 },
  { name: "Sun", revenue: 68000, orders: 78 },
];

const moduleBreakdown = [
  { name: "Restaurant", value: 45, color: "#3B82F6" },
  { name: "Bar", value: 25, color: "#8B5CF6" },
  { name: "Butcher", value: 15, color: "#EF4444" },
  { name: "Grocery", value: 10, color: "#10B981" },
  { name: "Rooms", value: 5, color: "#F59E0B" },
];

export const AdminDashboard = () => {
  const { data: reports, isLoading, error } = useReports();

  if (isLoading) return <Loading />;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        {/* Main Content */}
        <div className="p-6">
          {error && (
            <Alert
              type="error"
              title="Error loading data"
              message={error.message}
            />
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Today's Revenue"
              value="ETB 92,000"
              icon="💰"
              trend={12}
              color="blue"
            />
            <StatCard
              title="Total Orders"
              value="105"
              icon="📋"
              trend={8}
              color="green"
            />
            <StatCard
              title="Active Tables"
              value="12/20"
              icon="🍽️"
              trend={-3}
              color="purple"
            />
            <StatCard
              title="Room Occupancy"
              value="68%"
              icon="🏨"
              trend={5}
              color="orange"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardBody>
                <h3 className="font-bold text-lg mb-4">Weekly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `ETB ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      dot={{ r: 5 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Module Breakdown */}
            <Card>
              <CardBody>
                <h3 className="font-bold text-lg mb-4">Revenue by Module</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moduleBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moduleBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Chart */}
            <Card>
              <CardBody>
                <h3 className="font-bold text-lg mb-4">Orders per Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10B981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardBody>
                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    {
                      time: "14:32",
                      action: "Order #105 completed",
                      user: "Waiter 01",
                    },
                    {
                      time: "14:28",
                      action: "Room 305 checked in",
                      user: "Receptionist",
                    },
                    {
                      time: "14:15",
                      action: "Bill generated",
                      user: "Cashier 02",
                    },
                    {
                      time: "14:02",
                      action: "Order #104 ready",
                      user: "Kitchen",
                    },
                    {
                      time: "13:58",
                      action: "Table 5 seated",
                      user: "Waiter 01",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between pb-3 border-b border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600">{activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

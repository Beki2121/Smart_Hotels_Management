import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./useAuthStore";
import { LandingPage } from "./Pages/LandingPage";
import { LoginPage } from "./LoginPage";
import { AdminDashboard } from "./Pages/AdminDashboard";
import { POSPage } from "./Pages/POSPage";
import { TablesPage } from "./Pages/TablesPage";
import { KDSPage } from "./Pages/KDSPage";
import { BarDisplayPage } from "./Pages/BarDisplayPage";
import { WaiterPage } from "./Pages/WaiterPage";
import { ButcherPage } from "./Pages/ButcherPage";
import { GroceryPage } from "./Pages/GroceryPage";
import { RoomsPage } from "./Pages/RoomsPage";
import { ReportsPage } from "./Pages/ReportsPage";
import { InventoryPage } from "./Pages/InventoryPage";
import { UsersPage } from "./Pages/UsersPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Admin/Manager Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* POS Routes */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POSPage />
            </ProtectedRoute>
          }
        />

        {/* Restaurant Routes */}
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <TablesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kds"
          element={
            <ProtectedRoute>
              <KDSPage />
            </ProtectedRoute>
          }
        />

        {/* Bar Routes */}
        <Route
          path="/bar"
          element={
            <ProtectedRoute>
              <BarDisplayPage />
            </ProtectedRoute>
          }
        />

        {/* Waiter Routes */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoute>
              <WaiterPage />
            </ProtectedRoute>
          }
        />

        {/* Butcher Routes */}
        <Route
          path="/butcher"
          element={
            <ProtectedRoute>
              <ButcherPage />
            </ProtectedRoute>
          }
        />

        {/* Grocery Routes */}
        <Route
          path="/grocery"
          element={
            <ProtectedRoute>
              <GroceryPage />
            </ProtectedRoute>
          }
        />

        {/* Rooms Routes */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        {/* Reports Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        {/* Users Management Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

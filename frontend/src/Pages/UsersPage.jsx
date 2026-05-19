import React, { useState, useEffect } from "react";
import {
  Sidebar,
  TopBar,
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Alert,
  Loading,
} from "../Components";
import useAuthStore from "../useAuthStore";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2 } from "lucide-react";

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "cashier",
    password: "",
    pin: "",
  });

  // Check if user is superadmin
  useEffect(() => {
    if (!user || user.role !== "superadmin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) payload.password = formData.password;
      if (formData.pin) payload.pin = formData.pin;

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      setSuccess("User created successfully!");
      setFormData({
        name: "",
        email: "",
        role: "cashier",
        password: "",
        pin: "",
      });
      setShowForm(false);
      await fetchUsers();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(
        `${API_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to delete user");

      setSuccess("User deleted successfully!");
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "superadmin", label: "Super Admin" },
    { value: "manager", label: "Manager" },
    { value: "cashier", label: "Cashier" },
    { value: "waiter", label: "Waiter" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bar", label: "Bar" },
    { value: "butcher", label: "Butcher" },
    { value: "grocery", label: "Grocery" },
    { value: "receptionist", label: "Receptionist" },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />

        <div className="p-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          )}

          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Users Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>

          {/* Create User Form */}
          {showForm && (
            <Card className="mb-6">
              <CardBody>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Create New User
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Username"
                      type="text"
                      placeholder="Enter username"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      options={roles}
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="PIN (4 digits)"
                      type="text"
                      placeholder="Enter PIN"
                      maxLength="4"
                      value={formData.pin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pin: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" loading={loading}>
                      Create User
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* Users Table */}
          <Card>
            <CardBody>
              {loading && !users.length ? (
                <Loading />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Username
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-8 text-gray-500"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {u.name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {u.email || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  u.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {u.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

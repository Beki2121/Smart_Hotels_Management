import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "./useAuthStore";
import Button from "./Components/Button";
import Input from "./Components/Input";
import Alert from "./Components/Alert";
import { t } from "../i18n";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usePIN, setUsePIN] = useState(false);
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (usePIN) {
      if (!pin || pin.length !== 4) newErrors.pin = "PIN must be 4 digits";
    } else {
      if (!password) newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGeneralError("");

    try {
      const credentials = {
        username,
        [usePIN ? "pin" : "password"]: usePIN ? pin : password,
      };

      await login(credentials);
      navigate("/dashboard");
    } catch (err) {
      setGeneralError(err.message || "Login failed. Please try again.");
    }
  };

  const handleDemo = (role) => {
    const demoCredentials = {
      superadmin: { username: "Admin", password: "Admin@123" },
      manager: { username: "Manager One", password: "user123" },
      cashier: { username: "Cashier Sarah", password: "user123" },
      waiter: { username: "Waiter John", password: "user123" },
      kitchen: { username: "Kitchen Chef", password: "user123" },
    };

    const creds = demoCredentials[role];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password);
      setUsePIN(false);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🏨</h1>
          <h2 className="text-3xl font-bold text-white">{t("login.title")}</h2>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Error Alert */}
          {generalError && (
            <Alert
              type="error"
              message={generalError}
              onClose={() => setGeneralError("")}
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("login.username")}
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              required
              disabled={loading}
            />

            {usePIN ? (
              <Input
                label={t("login.pin")}
                type="password"
                placeholder="0000"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                error={errors.pin}
                required
                disabled={loading}
              />
            ) : (
              <Input
                label={t("login.password")}
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                disabled={loading}
              />
            )}

            {/* Toggle PIN/Password */}
            <button
              type="button"
              onClick={() => {
                setUsePIN(!usePIN);
                setErrors({});
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              {usePIN ? t("login.toggle_password") : t("login.toggle_pin")}
            </button>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {t("login.submit")}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["superadmin", "manager", "cashier", "waiter"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemo(role)}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded font-medium text-gray-700 transition-colors capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Demo Super Admin: Admin/Admin@123<br/>
              Demo Others: user123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white text-sm">
          <p>Smart Hotel Management System v1.0</p>
          <p className="text-blue-200 mt-1">
            Developed by iLink Software Solutions PLC
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

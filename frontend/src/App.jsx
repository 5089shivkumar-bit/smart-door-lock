
import React, { useEffect } from 'react';
import { supabase } from './supabase';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Terminal from './pages/Terminal';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UsersPage from './pages/admin/Users';
import LogsPage from './pages/admin/Logs';
import DevicesPage from './pages/admin/Devices';

// Guard Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    const verifyConnection = async () => {
      console.log("🛠️ Verifying Supabase connection...");
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .limit(1);

      if (error) {
        console.error("❌ Supabase Connection Error:", error);
      } else {
        console.log("✅ Supabase Connection Successful! Data:", data);
      }
    };
    verifyConnection();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Terminal />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="devices" element={<DevicesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

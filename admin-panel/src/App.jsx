import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FaceRegister from './pages/FaceRegister';
import Users from './pages/Users';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('aura_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="register" element={<FaceRegister />} />
        <Route path="users" element={<Users />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

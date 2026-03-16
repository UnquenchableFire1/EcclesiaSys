import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MemberDashboard from "./pages/MemberDashboard";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Sermons from "./pages/Sermons";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./layouts/Layout";
import SessionTimer from "./components/SessionTimer";

function ProtectedRoute({ requiredRole, children }) {
  const userType = localStorage.getItem('userType');
  const location = useLocation();

  if (!userType) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/home" />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <SessionTimer />
      <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/member-dashboard"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Layout><Announcements /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Layout><Events /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sermons"
        element={
          <ProtectedRoute>
            <Layout><Sermons /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

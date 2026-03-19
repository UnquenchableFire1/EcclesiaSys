import React, { Component } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Sermons from "./pages/Sermons";
import Layout from "./layouts/Layout";
import SessionTimer from "./components/SessionTimer";
import PrayerRequestPage from "./pages/PrayerRequestPage";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-mdSurface p-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-premium max-w-lg w-full text-center border border-mdError/20">
            <div className="w-20 h-20 bg-mdErrorContainer text-mdError rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-black text-mdOnSurface mb-4">Something went wrong</h1>
            <p className="text-mdOnSurfaceVariant mb-8 font-medium">
              The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="bg-mdSurfaceVariant/30 p-4 rounded-2xl text-left overflow-auto max-h-40 mb-8 border border-mdOutline/10">
              <code className="text-sm font-mono text-mdError block whitespace-pre-wrap">
                {this.state.error?.toString()}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-mdPrimary hover:bg-mdSecondary text-mdOnPrimary font-black py-4 rounded-2xl shadow-md2 transition-all active:scale-95"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({ requiredRole, children }) {
  const userType = sessionStorage.getItem('userType');
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
    <ErrorBoundary>
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
          path="/prayer-request"
          element={
            <ProtectedRoute requiredRole="member">
              <PrayerRequestPage />
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
    </ErrorBoundary>
  );
}

import React, { Component, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./layouts/Layout";
import SessionTimer from "./components/SessionTimer";
import { ToastProvider } from "./context/ToastContext";

// Lazy-loaded pages for performance (Code Splitting)
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PrayerRequestPage = lazy(() => import("./pages/PrayerRequestPage"));
const Events = lazy(() => import("./pages/Events"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Sermons = lazy(() => import("./pages/Sermons"));

// Premium Loading Spinner for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-mdSurface relative overflow-hidden">
    <div className="absolute inset-0 bg-mdPrimary/5 animate-pulse"></div>
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-mdPrimary/10 border-t-mdPrimary rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-mdPrimary animate-pulse">
        Entering Assembly...
      </p>
    </div>
  </div>
);

class ErrorBoundary extends Component {
  // ... (keep ErrorBoundary exactly as it is)
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
    return userType === 'admin'
      ? <Navigate to="/admin" replace />
      : <Navigate to="/member-dashboard" replace />;
  }
  return children;
}

// Redirects already-logged-in users away from public pages
function PublicOnlyRoute({ children }) {
  const userType = sessionStorage.getItem('userType');
  if (userType === 'admin') return <Navigate to="/admin" replace />;
  if (userType === 'member') return <Navigate to="/member-dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <SessionTimer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<PublicOnlyRoute><Layout><Home /></Layout></PublicOnlyRoute>} />
            <Route path="/home" element={<PublicOnlyRoute><Layout><Home /></Layout></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/admin-login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/verify-email" element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/prayer-request" element={<Layout><PrayerRequestPage /></Layout>} />
            <Route path="/events" element={<Layout><Events /></Layout>} />
            <Route path="/announcements" element={<Layout><Announcements /></Layout>} />
            <Route path="/sermons" element={<Layout><Sermons /></Layout>} />
            <Route
              path="/member-dashboard"
              element={
                <ProtectedRoute requiredRole="member">
                  <Layout><MemberDashboard /></Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}

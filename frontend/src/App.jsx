import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Sermons from "./pages/Sermons";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./layouts/Layout";

function ProtectedRoute({ requiredRole, children }) {
  const userType = localStorage.getItem('userType');
  if (!userType) {
    return <Navigate to="/login" />;
  }
  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/home" />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

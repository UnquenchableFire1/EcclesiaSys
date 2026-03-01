import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Sermons from './pages/Sermons';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ role, requiredRole, children }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token) return <Navigate to="/login" />;
    if (requiredRole && userRole !== requiredRole) return <Navigate to="/home" />;
    
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route 
                    path="/home" 
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/announcements" 
                    element={
                        <ProtectedRoute>
                            <Announcements />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/events" 
                    element={
                        <ProtectedRoute>
                            <Events />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/sermons" 
                    element={
                        <ProtectedRoute>
                            <Sermons />
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
        </BrowserRouter>
    );
}

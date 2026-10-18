import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';

import StudentDashboard from './pages/student/StudentDashboard';
import BrowseRooms from './pages/student/BrowseRooms';
import PaymentPage from './pages/student/PaymentPage';
import MyComplaints from './pages/student/MyComplaints';

import WardenDashboard from './pages/warden/WardenDashboard';
import ApplicationsQueue from './pages/warden/ApplicationsQueue';
import PaymentVerificationQueue from './pages/warden/PaymentVerificationQueue';
import ComplaintsManagement from './pages/warden/ComplaintsManagement';
import Analytics from './pages/warden/Analytics';

function RootRedirect() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'warden' || user.role === 'super_admin') {
    return <Navigate to="/warden" replace />;
  }
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px',
            fontWeight: 500,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/rooms"
            element={
              <ProtectedRoute allowedRole="student">
                <BrowseRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payment"
            element={
              <ProtectedRoute allowedRole="student">
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute allowedRole="student">
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          {/* Warden Routes */}
          <Route
            path="/warden"
            element={
              <ProtectedRoute allowedRole="warden">
                <WardenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden/applications"
            element={
              <ProtectedRoute allowedRole="warden">
                <ApplicationsQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden/payments"
            element={
              <ProtectedRoute allowedRole="warden">
                <PaymentVerificationQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden/complaints"
            element={
              <ProtectedRoute allowedRole="warden">
                <ComplaintsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden/analytics"
            element={
              <ProtectedRoute allowedRole="warden">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

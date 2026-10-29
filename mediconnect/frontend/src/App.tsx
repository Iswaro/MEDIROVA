import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { UserRole } from './types';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// ─── Patient Pages ────────────────────────────────────────────────────────────
import PatientDashboard from './pages/patient/PatientDashboard';
import ServiceCategoriesPage from './pages/patient/ServiceCategoriesPage';
import ProviderSearchPage from './pages/patient/ProviderSearchPage';
import ProviderProfilePage from './pages/patient/ProviderProfilePage';
import BookingFormPage from './pages/patient/BookingFormPage';
import BookingTrackingPage from './pages/patient/BookingTrackingPage';
import PaymentPage from './pages/patient/PaymentPage';
import ReceiptPage from './pages/patient/ReceiptPage';
import BookingHistoryPage from './pages/patient/BookingHistoryPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// ─── Provider Pages ───────────────────────────────────────────────────────────
import ProviderDashboard from './pages/provider/ProviderDashboard';
import CredentialSubmissionPage from './pages/provider/CredentialSubmissionPage';
import VerificationStatusPage from './pages/provider/VerificationStatusPage';
import AvailabilityPage from './pages/provider/AvailabilityPage';
import IncomingRequestsPage from './pages/provider/IncomingRequestsPage';
import ProviderBookingDetailPage from './pages/provider/ProviderBookingDetailPage';
import AppointmentsPage from './pages/provider/AppointmentsPage';
import EarningsPage from './pages/provider/EarningsPage';

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProviderVerificationPage from './pages/admin/ProviderVerificationPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import PlatformSettingsPage from './pages/admin/PlatformSettingsPage';

// ─── Shared Pages ─────────────────────────────────────────────────────────────
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// ─── Query Client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                }}
              />
              <Routes>
                {/* ── Public Routes ─────────────────────────────── */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* ── Patient Routes ────────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<PatientDashboard />} />
                  <Route path="/services" element={<ServiceCategoriesPage />} />
                  <Route path="/providers" element={<ProviderSearchPage />} />
                  <Route path="/providers/:id" element={<ProviderProfilePage />} />
                  <Route path="/book" element={<BookingFormPage />} />
                  <Route path="/bookings" element={<BookingHistoryPage />} />
                  <Route path="/bookings/:id" element={<BookingTrackingPage />} />
                  <Route path="/bookings/:id/pay" element={<PaymentPage />} />
                  <Route path="/bookings/:id/receipt" element={<ReceiptPage />} />
                  <Route path="/profile" element={<PatientProfilePage />} />
                </Route>

                {/* ── Provider Routes ───────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.PROVIDER]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                  <Route path="/provider/credentials" element={<CredentialSubmissionPage />} />
                  <Route path="/provider/verification" element={<VerificationStatusPage />} />
                  <Route path="/provider/availability" element={<AvailabilityPage />} />
                  <Route path="/provider/requests" element={<IncomingRequestsPage />} />
                  <Route path="/provider/bookings/:id" element={<ProviderBookingDetailPage />} />
                  <Route path="/provider/appointments" element={<AppointmentsPage />} />
                  <Route path="/provider/earnings" element={<EarningsPage />} />
                </Route>

                {/* ── Admin Routes ──────────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/verifications" element={<ProviderVerificationPage />} />
                  <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                  <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/admin/settings" element={<PlatformSettingsPage />} />
                </Route>

                {/* ── Fallback ─────────────────────────────────── */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;

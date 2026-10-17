import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import AuthGuard from './components/AuthGuard';
import OnboardingPage from './pages/OnboardingPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GroupsDashboardPage from './pages/GroupsDashboardPage';
import JoinGroupPage from './pages/JoinGroupPage';
import KycCallbackPage from './pages/KycCallbackPage';
import ProfilePage from './pages/ProfilePage';
import CreditDashboardPage from './pages/CreditDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] selection:bg-[#0c0a09] selection:text-white antialiased font-sans">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<OnboardingPage />} />
              <Route path="/register" element={<OnboardingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/kyc/callback" element={<KycCallbackPage />} />

              {/* Profile and Credit Dashboard Routes */}
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <ProfilePage />
                  </AuthGuard>
                }
              />
              <Route
                path="/credit"
                element={
                  <AuthGuard>
                    <CreditDashboardPage />
                  </AuthGuard>
                }
              />

              {/* Group Dashboard Routes */}
              <Route
                path="/groups"
                element={
                  <AuthGuard>
                    <GroupsDashboardPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <AuthGuard>
                    <GroupsDashboardPage />
                  </AuthGuard>
                }
              />

              {/* Invitation / Join Routes */}
              <Route path="/join/:token" element={<JoinGroupPage />} />
              <Route path="/invite/:token" element={<JoinGroupPage />} />

              {/* Redirect Defaults */}
              <Route path="/" element={<Navigate to="/groups" replace />} />
              <Route path="*" element={<Navigate to="/groups" replace />} />
            </Routes>
            <ToastContainer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

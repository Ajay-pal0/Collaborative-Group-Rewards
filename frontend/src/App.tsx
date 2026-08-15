import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import AuthGuard from './components/AuthGuard';
import OnboardingPage from './pages/OnboardingPage';
import GroupsDashboardPage from './pages/GroupsDashboardPage';
import JoinGroupPage from './pages/JoinGroupPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-[#F8F9FC] text-[#171923] selection:bg-[#635BFF] selection:text-white">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<OnboardingPage />} />
              <Route path="/register" element={<OnboardingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

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

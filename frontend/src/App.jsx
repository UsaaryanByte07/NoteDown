import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SuperuserRoute from './components/superuser/ProtectedSuperuserRoute';
import PublicSuperuserRoute from './components/superuser/PublicSuperuserRoute';
import { SuperuserProvider } from './context/superuser/superuserContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

import SuperuserLoginPage from './pages/superuser/SuperuserLoginPage';
import SuperuserHomePage from './pages/superuser/SuperuserHomePage';
import SuperuserAddAdminPage from './pages/superuser/SuperuserAddAdminPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Main Website (with Navbar) ────────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />
        </Route>

        {/* ── Superuser Section (no Navbar, own auth) ──────────── */}
        <Route path="/superuser/*" element={
          <SuperuserProvider>
            <Routes>
              <Route path="login" element={
                <PublicSuperuserRoute><SuperuserLoginPage /></PublicSuperuserRoute>
              } />
              <Route path="" element={
                <SuperuserRoute><SuperuserHomePage /></SuperuserRoute>
              } />
              <Route path="add-admin" element={
                <SuperuserRoute><SuperuserAddAdminPage /></SuperuserRoute>
              } />
            </Routes>
          </SuperuserProvider>
        } />

        {/* ── Fallback ─────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

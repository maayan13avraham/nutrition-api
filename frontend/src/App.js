import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NutritionistDashboard from './pages/NutritionistDashboard';
import RecipeManagement from './pages/RecipeManagement';
import SettingsPage from './pages/SettingsPage';
import SupportChat from './components/SupportChat';
import './App.css';

const ROLE_ROUTES = { admin: '/admin', nutritionist: '/nutritionist', user: '/dashboard' };

// Guard component: redirects unauthenticated users to /login, wrong-role users to their home.
function ProtectedRoute({ children, allowedRoles }) {
  const raw = localStorage.getItem('user');
  if (!raw) return <Navigate to="/login" replace />;
  const user = JSON.parse(raw);
  if (allowedRoles && !allowedRoles.includes(user.userRole)) {
    return <Navigate to={ROLE_ROUTES[user.userRole] || '/login'} replace />;
  }
  return children;
}

// Renders SupportChat only when a session exists. Lives inside BrowserRouter so it
// re-evaluates on every navigation (BrowserRouter re-renders its children on location change).
function ConditionalSupportChat() {
  return localStorage.getItem('user') ? <SupportChat /> : null;
}

// Root component that wraps the app in language support and defines all client-side routes
export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/nutritionist"
            element={<ProtectedRoute allowedRoles={['nutritionist']}><NutritionistDashboard /></ProtectedRoute>}
          />
          <Route
            path="/recipes"
            element={<ProtectedRoute allowedRoles={['admin', 'nutritionist']}><RecipeManagement /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedRoles={['user']}><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
          />
          {/* Redirect any unknown path to the dashboard (ProtectedRoute will forward by role) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        {/* Floating support chat — ConditionalSupportChat re-checks auth on every navigation */}
        <ConditionalSupportChat />
      </BrowserRouter>
    </LanguageProvider>
  );
}

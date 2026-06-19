import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import SupportChat from './components/SupportChat';
import './App.css';

// Guard component that redirects unauthenticated users to the login page
function PrivateRoute({ children }) {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" replace />;
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
          {/* Protected routes require a stored user session to access */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          {/* Redirect any unknown path to the dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        {/* Floating support chat — ConditionalSupportChat re-checks auth on every navigation */}
        <ConditionalSupportChat />
      </BrowserRouter>
    </LanguageProvider>
  );
}

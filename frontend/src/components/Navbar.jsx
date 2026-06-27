import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMe } from '../services/usersService';
import { logout } from '../services/authService';
import { connect, disconnect as disconnectSocket, notifyNutritionistOffline, registerBadgeHandler, unregisterBadgeHandler } from '../services/socketService';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const [userName, setUserName] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = currentUser.userRole;

  // Fetch the current user's first name on mount to display in the greeting
  useEffect(() => {
    getMe()
      .then((res) => setUserName(res.data.firstName))
      .catch(() => {});
  }, []);

  // For nutritionists: register badge handler to count messages arriving on any page
  useEffect(() => {
    if (userRole !== 'nutritionist') return;
    connect();
    registerBadgeHandler(() => {
      if (location.pathname !== '/nutritionist') {
        setUnreadMessages((prev) => prev + 1);
      }
    });
    return () => unregisterBadgeHandler();
  }, [userRole, location.pathname]);

  // Clear badge when nutritionist returns to their dashboard
  useEffect(() => {
    if (location.pathname === '/nutritionist') {
      setUnreadMessages(0);
    }
  }, [location.pathname]);

  // Call the logout endpoint, clear the local session, and redirect to login
  async function handleLogout() {
    await logout();
    if (userRole === 'nutritionist') notifyNutritionistOffline();
    disconnectSocket();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('nutritionist_unread');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">{t.navbar.brand}</div>
      <div className="navbar-links">
        {userRole === 'nutritionist' && location.pathname !== '/nutritionist' && (
          <Link to="/nutritionist" style={{ position: 'relative' }}>
            {t.navbar.dashboard}
            {unreadMessages > 0 && (
              <span className="nav-badge">{unreadMessages}</span>
            )}
          </Link>
        )}
        {userRole !== 'nutritionist' && location.pathname !== '/dashboard' && (
          <Link to="/dashboard">{t.navbar.dashboard}</Link>
        )}
        {['admin', 'nutritionist'].includes(userRole) && (
          <Link to="/recipes">{t.navbar.recipeManagement}</Link>
        )}
        <Link to="/settings">{t.navbar.settings}</Link>
      </div>
      <div className="navbar-user">
        {userName && <span>{t.navbar.hello}, {userName}</span>}
        <button onClick={handleLogout}>{t.navbar.logout}</button>
      </div>
    </nav>
  );
}

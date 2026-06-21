import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../services/usersService';
import { logout } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = currentUser.userRole;

  // Fetch the current user's first name on mount to display in the greeting
  useEffect(() => {
    getMe()
      .then((res) => setUserName(res.data.firstName))
      .catch(() => {});
  }, []);

  // Call the logout endpoint, clear the local session, and redirect to login
  async function handleLogout() {
    await logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">{t.navbar.brand}</div>
      <div className="navbar-links">
        <Link to="/dashboard">{t.navbar.dashboard}</Link>
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

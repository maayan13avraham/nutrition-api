import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import './LoginPage.css';

// Check that the email contains a local part, an @ symbol, a domain, and a TLD
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Validate email format and minimum password length before sending to the server
  function validate() {
    const errs = {};
    if (!email || !validateEmail(email)) errs.email = t.login.errEmail;
    if (!password || password.length < 6) errs.password = t.login.errPassword;
    return errs;
  }

  // Submit credentials. Existing users are logged in; new emails are treated as registration —
  // a guest session is created so the Dashboard questionnaire handles profile setup.
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await login(email, password);
      const { token, ...userFields } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userFields));
      const roleRoutes = { admin: '/admin', nutritionist: '/nutritionist', user: '/dashboard' };
      navigate(roleRoutes[userFields.userRole] || '/dashboard');
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === 'USER_NOT_FOUND') {
        const regRes = await register(email, password);
        const { token: regToken, ...regFields } = regRes.data;
        localStorage.setItem('token', regToken);
        localStorage.setItem('user', JSON.stringify({ ...regFields, email }));
        navigate('/dashboard');
      } else if (code === 'INVALID_PASSWORD') {
        setServerError(t.login.errWrongPassword);
      } else {
        setServerError(err?.response?.data?.error?.message || t.login.errEmail);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🥗</div>
        <h1>{t.login.title}</h1>
        <p className="login-subtitle">{t.login.subtitle}</p>
        <p className="login-register-note">{t.login.registerNote}</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label>{t.login.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.login.emailPlaceholder}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="field-group">
            <label>{t.login.passwordLabel}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordPlaceholder}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>
          {serverError && <div className="server-error">{serverError}</div>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? t.login.loading : t.login.submit}
          </button>
        </form>
        <p className="login-hint">{t.login.hint}</p>
      </div>
    </div>
  );
}

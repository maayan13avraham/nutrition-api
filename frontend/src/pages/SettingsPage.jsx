import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import { getMe, updateMe } from '../services/usersService';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SettingsPage.css';

// Regex for basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsPage() {
  const { t, switchLanguage } = useLanguage();

  // Profile settings state (display name, language, email notifications)
  const [form, setForm] = useState({ displayName: '', language: 'he', emailNotifications: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileValidationErr, setProfileValidationErr] = useState('');

  // Account settings state (email and password change)
  const [accountForm, setAccountForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountErrs, setAccountErrs] = useState({});

  // Load both the profile settings and the current user email in a single parallel request
  useEffect(() => {
    Promise.all([getSettings(), getMe()])
      .then(([settingsRes, meRes]) => {
        setForm(settingsRes.data);
        setAccountForm((prev) => ({ ...prev, email: meRes.data.email || '' }));
        setLoading(false);
      })
      .catch(() => {
        setProfileError(t.settings.errLoad);
        setLoading(false);
      });
  }, []);

  // Update a single profile form field, handling both text inputs and checkboxes
  function handleProfileChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  // Validate, save profile settings, and apply the selected language immediately
  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    if (!form.displayName.trim()) { setProfileValidationErr(t.settings.errDisplayName); return; }
    setProfileValidationErr('');
    setSaving(true);
    try {
      await updateSettings(form);
      switchLanguage(form.language);
      setProfileSuccess(t.settings.success);
    } catch {
      setProfileError(t.settings.errSave);
    } finally {
      setSaving(false);
    }
  }

  // Update a single account form field by its input name attribute
  function handleAccountChange(e) {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  }

  // Validate email format and optional new password constraints before saving
  function validateAccount() {
    const errs = {};
    if (!accountForm.email || !EMAIL_REGEX.test(accountForm.email))
      errs.email = t.settings.errEmail;
    if (accountForm.newPassword && accountForm.newPassword.length < 6)
      errs.newPassword = t.settings.errPassword;
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword)
      errs.confirmPassword = t.settings.errPasswordMatch;
    return errs;
  }

  // Save the updated email and/or password and clear the password fields on success
  async function handleAccountSubmit(e) {
    e.preventDefault();
    setAccountSuccess('');
    setAccountError('');
    const errs = validateAccount();
    if (Object.keys(errs).length > 0) { setAccountErrs(errs); return; }
    setAccountErrs({});
    setSavingAccount(true);
    try {
      await updateMe({ email: accountForm.email, password: accountForm.newPassword || undefined });
      setAccountSuccess(t.settings.accountSuccess);
      setAccountForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch {
      setAccountError(t.settings.errAccountSave);
    } finally {
      setSavingAccount(false);
    }
  }

  return (
    <div className="page-layout">
      <Navbar />
      <main className="settings-main">
        <h2>{t.settings.title}</h2>
        {loading ? (
          <p className="loading-text">{t.settings.loading}</p>
        ) : (
          <>
            {/* Section 1: profile preferences (display name, language, notifications) */}
            <form onSubmit={handleProfileSubmit} className="settings-form" noValidate>
              <div className="field-group">
                <label>{t.settings.displayNameLabel}</label>
                <input name="displayName" value={form.displayName} onChange={handleProfileChange} />
                {profileValidationErr && <span className="error-msg">{profileValidationErr}</span>}
              </div>
              <div className="field-group">
                <label>{t.settings.languageLabel}</label>
                <select name="language" value={form.language} onChange={handleProfileChange}>
                  <option value="he">{t.settings.langHe}</option>
                  <option value="en">{t.settings.langEn}</option>
                </select>
              </div>
              <div className="field-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={form.emailNotifications}
                    onChange={handleProfileChange}
                  />
                  {t.settings.notificationsLabel}
                </label>
              </div>
              {profileSuccess && <div className="success-msg">{profileSuccess}</div>}
              {profileError && <div className="error-banner">{profileError}</div>}
              <button type="submit" disabled={saving} className="save-btn">
                {saving ? t.settings.saving : t.settings.save}
              </button>
            </form>

            <hr className="settings-divider" />

            {/* Section 2: account credentials (email and optional password change) */}
            <form onSubmit={handleAccountSubmit} className="settings-form" noValidate>
              <h3 className="settings-section-title">{t.settings.accountTitle}</h3>
              <div className="field-group">
                <label>{t.settings.emailLabel}</label>
                <input
                  type="email"
                  name="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  className={accountErrs.email ? 'input-error' : ''}
                  dir="ltr"
                />
                {accountErrs.email && <span className="error-msg">{accountErrs.email}</span>}
              </div>
              <div className="field-group">
                <label>{t.settings.newPasswordLabel}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={accountForm.newPassword}
                  onChange={handleAccountChange}
                  placeholder={t.settings.newPasswordPlaceholder}
                  className={accountErrs.newPassword ? 'input-error' : ''}
                />
                {accountErrs.newPassword && <span className="error-msg">{accountErrs.newPassword}</span>}
              </div>
              <div className="field-group">
                <label>{t.settings.confirmPasswordLabel}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={accountForm.confirmPassword}
                  onChange={handleAccountChange}
                  className={accountErrs.confirmPassword ? 'input-error' : ''}
                />
                {accountErrs.confirmPassword && <span className="error-msg">{accountErrs.confirmPassword}</span>}
              </div>
              {accountSuccess && <div className="success-msg">{accountSuccess}</div>}
              {accountError && <div className="error-banner">{accountError}</div>}
              <button type="submit" disabled={savingAccount} className="save-btn">
                {savingAccount ? t.settings.savingAccount : t.settings.saveAccount}
              </button>
            </form>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

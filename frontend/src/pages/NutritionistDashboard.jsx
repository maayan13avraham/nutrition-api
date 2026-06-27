import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createRecipe } from '../services/recipesService';
import { connect, sendNutritionistReply, registerDashboardHandler, unregisterDashboardHandler, threadCache, unreadCache, loadedThreadsCache } from '../services/socketService';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './NutritionistDashboard.css';

const MEAL_TYPE_KEYS = ['breakfast', 'lunch', 'dinner'];

const EMPTY_FORM = { name: '', description: '', mealType: '', calories: '', protein: '', carbs: '', fat: '', isVegetarian: false, allergens: [], ingredients: '', instructions: '' };

const ALLERGEN_KEYS = ['eggs', 'dairy', 'gluten', 'nuts', 'fish', 'soy'];

export default function NutritionistDashboard() {
  const { t } = useLanguage();
  const tn = t.nutritionist;

  // ── Recipe form state ──────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  // ── Support panel state ────────────────────────────────────
  // threads: { [userId]: { username, messages: [{ self, from?, content, timestamp }] } }
  const [threads, setThreadsState] = useState(() => threadCache);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [unread, setUnreadState] = useState(() => unreadCache);
  const [replyInput, setReplyInput] = useState('');
  const [loadedThreads, setLoadedThreadsState] = useState(() => loadedThreadsCache);

  function setThreads(updater) {
    setThreadsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      threadCache = next;
      return next;
    });
  }
  function setUnread(updater) {
    setUnreadState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      unreadCache = next;
      return next;
    });
  }
  function setLoadedThreads(updater) {
    setLoadedThreadsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      loadedThreadsCache = next;
      return next;
    });
  }
  const chatBottomRef = useRef(null);
  const selectedUserIdRef = useRef(null);

  // Auto-scroll the chat area when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, selectedUserId]);

  // Connect to socket and register dashboard handler (also flushes buffered messages)
  useEffect(() => {
    connect();
    registerDashboardHandler(({ userId, username, content, timestamp }) => {
      setThreads((prev) => {
        const thread = prev[userId] || { username, messages: [] };
        return {
          ...prev,
          [userId]: { ...thread, messages: [...thread.messages, { self: false, from: username, content, timestamp }] },
        };
      });
      if (selectedUserIdRef.current !== String(userId)) {
        setUnread((prev) => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }));
      }
    });
    return () => unregisterDashboardHandler();
  }, []);

  function selectUser(userId) {
    setSelectedUserId(userId);
    selectedUserIdRef.current = String(userId);
    setUnread((prev) => ({ ...prev, [userId]: 0 }));

    if (loadedThreads.has(userId)) return;

    api.get(`/api/chat/history/${userId}`)
      .then(({ data }) => {
        if (!data.success) return;
        const history = data.data.map((m) => ({
          self:      m.senderRole === 'nutritionist',
          from:      m.senderRole === 'user' ? (m.senderName || undefined) : undefined,
          content:   m.content,
          timestamp: m.createdAt,
        }));
        setThreads((prev) => ({
          ...prev,
          [userId]: {
            username: prev[userId]?.username || `User ${userId}`,
            messages: history,
          },
        }));
        setLoadedThreads((prev) => new Set([...prev, userId]));
      })
      .catch(() => {});
  }

  function handleReply(e) {
    e.preventDefault();
    const content = replyInput.trim();
    if (!content || !selectedUserId) return;
    sendNutritionistReply(selectedUserId, content);
    setThreads((prev) => {
      const thread = prev[selectedUserId] || { username: '', messages: [] };
      return {
        ...prev,
        [selectedUserId]: {
          ...thread,
          messages: [...thread.messages, { self: true, content, timestamp: new Date().toISOString() }],
        },
      };
    });
    setReplyInput('');
  }

  // ── Recipe form logic ──────────────────────────────────────
  function validate(f) {
    const errs = {};
    if (!f.name.trim()) errs.name = tn.errName;
    if (!MEAL_TYPE_KEYS.includes(f.mealType)) errs.mealType = tn.errMealType;
    if (!f.calories || Number(f.calories) <= 0) errs.calories = tn.errCalories;
    if (f.protein === '' || Number(f.protein) < 0) errs.protein = tn.errProtein;
    if (f.carbs === '' || Number(f.carbs) < 0) errs.carbs = tn.errCarbs;
    if (f.fat === '' || Number(f.fat) < 0) errs.fat = tn.errFat;
    return errs;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSuccess('');
    setServerError('');
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function toggleAllergen(key) {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(key)
        ? prev.allergens.filter((a) => a !== key)
        : [...prev.allergens, key],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const ingredientsList = form.ingredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ name: s, amount: '' }));

      const instructionsList = form.instructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await createRecipe({
        name: form.name.trim(),
        description: form.description.trim(),
        mealType: form.mealType,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        isVegetarian: form.isVegetarian,
        allergens: form.allergens,
        ingredients: ingredientsList,
        instructions: instructionsList,
      });
      setSuccess(tn.success);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err?.response?.data?.error?.message || tn.errServer);
    } finally {
      setSaving(false);
    }
  }

  const selectedThread = selectedUserId ? threads[selectedUserId] : null;

  return (
    <div className="page-layout">
      <Navbar />

      <div className="nutritionist-page-wrapper">

        {/* ── Recipe creation form ── */}
        <section className="nutritionist-main">
          <h1>{tn.title}</h1>
          {success && <div className="success-msg">{success}</div>}
          {serverError && <div className="error-banner">{serverError}</div>}
          <form className="nutritionist-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="name">{tn.nameLabel}</label>
              <input
                id="name" name="name" type="text"
                value={form.name} onChange={handleChange}
                placeholder={tn.namePlaceholder}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="mealType">{tn.mealTypeLabel}</label>
              <select
                id="mealType" name="mealType"
                value={form.mealType} onChange={handleChange}
                className={errors.mealType ? 'input-error' : ''}
              >
                <option value="">{tn.mealTypePlaceholder}</option>
                {MEAL_TYPE_KEYS.map((key) => (
                  <option key={key} value={key}>{tn.mealTypes[key]}</option>
                ))}
              </select>
              {errors.mealType && <span className="error-msg">{errors.mealType}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="description">{tn.descriptionLabel}</label>
              <textarea
                id="description" name="description" rows={3}
                value={form.description} onChange={handleChange}
                placeholder={tn.descriptionPlaceholder}
              />
            </div>

            <div className="field-group">
              <label htmlFor="calories">{tn.caloriesLabel}</label>
              <input
                id="calories" name="calories" type="number" min="1" step="any"
                value={form.calories} onChange={handleChange}
                placeholder={tn.caloriesPlaceholder}
                className={errors.calories ? 'input-error' : ''}
              />
              {errors.calories && <span className="error-msg">{errors.calories}</span>}
            </div>

            <div className="number-row">
              <div className="field-group">
                <label htmlFor="protein">{tn.proteinLabel}</label>
                <input
                  id="protein" name="protein" type="number" min="0" step="any"
                  value={form.protein} onChange={handleChange}
                  placeholder={tn.proteinPlaceholder}
                  className={errors.protein ? 'input-error' : ''}
                />
                {errors.protein && <span className="error-msg">{errors.protein}</span>}
              </div>
              <div className="field-group">
                <label htmlFor="carbs">{tn.carbsLabel}</label>
                <input
                  id="carbs" name="carbs" type="number" min="0" step="any"
                  value={form.carbs} onChange={handleChange}
                  placeholder={tn.carbsPlaceholder}
                  className={errors.carbs ? 'input-error' : ''}
                />
                {errors.carbs && <span className="error-msg">{errors.carbs}</span>}
              </div>
              <div className="field-group">
                <label htmlFor="fat">{tn.fatLabel}</label>
                <input
                  id="fat" name="fat" type="number" min="0" step="any"
                  value={form.fat} onChange={handleChange}
                  placeholder={tn.fatPlaceholder}
                  className={errors.fat ? 'input-error' : ''}
                />
                {errors.fat && <span className="error-msg">{errors.fat}</span>}
              </div>
            </div>

            <div className="field-group">
              <label>{tn.allergensLabel}</label>
              <div className="allergens-grid">
                {ALLERGEN_KEYS.map((key) => (
                  <label key={key} className="allergen-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.allergens.includes(key)}
                      onChange={() => toggleAllergen(key)}
                    />
                    {t.dashboard.allergens[key]}
                  </label>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="allergen-checkbox-label">
                <input
                  type="checkbox"
                  name="isVegetarian"
                  checked={form.isVegetarian}
                  onChange={handleChange}
                />
                {tn.isVegetarianLabel}
              </label>
            </div>

            <div className="field-group">
              <label htmlFor="ingredients">{tn.ingredientsLabel}</label>
              <textarea
                id="ingredients" name="ingredients" rows={3}
                value={form.ingredients} onChange={handleChange}
                placeholder={tn.ingredientsPlaceholder}
              />
              <span className="field-hint">{tn.ingredientsHint}</span>
            </div>

            <div className="field-group">
              <label htmlFor="instructions">{tn.instructionsLabel}</label>
              <textarea
                id="instructions" name="instructions" rows={4}
                value={form.instructions} onChange={handleChange}
                placeholder={tn.instructionsPlaceholder}
              />
              <span className="field-hint">{tn.instructionsHint}</span>
            </div>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? tn.submitting : tn.submit}
            </button>
          </form>
        </section>

        {/* ── Live support panel ── */}
        <section className="support-section">
          <h2 className="support-section-title">📡 תמיכה בזמן אמת</h2>
          <div className="support-panel">

            {/* Sidebar: user list */}
            <aside className="support-sidebar">
              <div className="support-sidebar-header">משתמשים</div>
              {Object.keys(threads).length === 0 ? (
                <p className="support-sidebar-empty">ממתין להודעות...</p>
              ) : (
                Object.entries(threads).map(([uid, thread]) => (
                  <div
                    key={uid}
                    className={`support-user-item${selectedUserId === uid ? ' active' : ''}`}
                    onClick={() => selectUser(uid)}
                  >
                    <span className="support-user-name">{thread.username}</span>
                    {unread[uid] > 0 && (
                      <span className="support-unread-badge">{unread[uid]}</span>
                    )}
                  </div>
                ))
              )}
            </aside>

            {/* Main chat area */}
            <div className="support-chat-main">
              {!selectedUserId ? (
                <div className="support-chat-placeholder">
                  בחר משתמש מהרשימה כדי להתחיל שיחה
                </div>
              ) : (
                <>
                  <div className="support-chat-messages">
                    {(selectedThread?.messages || []).map((m, i) => (
                      <div key={i} className={`support-msg${m.self ? ' support-msg-me' : ' support-msg-user'}`}>
                        {!m.self && <span className="support-msg-from">{m.from}</span>}
                        <div className="support-msg-bubble">{m.content}</div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>
                  <form className="support-reply-form" onSubmit={handleReply} dir="rtl">
                    <input
                      className="support-reply-input"
                      placeholder={`השב ל-${selectedThread?.username || ''}...`}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                    />
                    <button
                      className="support-reply-btn"
                      type="submit"
                      disabled={!replyInput.trim()}
                    >
                      שלח
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

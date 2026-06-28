import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getRecipes, generateMenu } from '../services/recipesService';
import { getProfile, updateProfile, saveDailyMenu } from '../services/settingsService';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import Table from '../components/Table';
import RecipeModal from '../components/RecipeModal';
import AiChat from '../components/AiChat';
import './Dashboard.css';

// Allowed goal keys used in the questionnaire goal dropdown
const GOAL_VALUES = ['loss', 'gain', 'health'];
// Allergen keys that map to translated labels in LanguageContext
const ALLERGEN_KEYS = ['eggs', 'dairy', 'gluten', 'fish', 'nuts', 'soy'];

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

// Calculate daily calorie target using Mifflin-St Jeor BMR with user-supplied activity factor
function calcCalories(age, weight, height, goal, activityLevel) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
  const adjustments = { loss: -500, gain: 300, health: 0 };
  return tdee + (adjustments[goal] || 0);
}

// Filter out recipes that conflict with the user's allergens or vegetarian preference
function applyPreferences(recipes, profile) {
  const allergies = profile.allergies || [];
  return recipes.filter((r) => {
    if (profile.vegetarianOnly && !r.isVegetarian) return false;
    if (r.allergens && r.allergens.some((a) => allergies.includes(a))) return false;
    return true;
  });
}


export default function Dashboard() {
  const { t } = useLanguage();
  // Key the stored profile by userId so each user has their own independent profile
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const profileKey = `nutritionProfile_${currentUser.userId ?? 'guest'}`;
  // Restore a previously saved profile so the user does not need to refill the questionnaire
  const savedProfile = JSON.parse(localStorage.getItem(profileKey) || 'null');
  const [profile, setProfile] = useState(savedProfile);
  const [form, setForm] = useState({
    age: '', weight: '', height: '', goal: 'health',
    activityLevel: 'moderate',
    allergies: [], vegetarianOnly: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // Stores user-chosen meal overrides; takes priority over the auto-picked default recipes
  const [overrides, setOverrides] = useState({});
  const [menuSaved, setMenuSaved] = useState(false);
  // Holds the savedMenu from DB so the generate effect can use it instead of calling the API
  const savedMenuRef = useRef(null);

  // On mount: load profile from DB; if found, skip questionnaire. Capture savedMenu for use in generate effect.
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.userRole !== 'user') return;
    getProfile()
      .then(({ data }) => {
        if (data) {
          const calories = calcCalories(Number(data.age), Number(data.weight), Number(data.height), data.goal, data.activityLevel);
          if (data.savedMenu) savedMenuRef.current = data.savedMenu;
          setProfile({ ...data, calories });
        }
      })
      .catch(() => {});
  }, []);

  // Generate the primary menu via the backend whenever a profile is set or updated
  useEffect(() => {
    if (!profile) return;
    if (savedMenuRef.current) {
      setGeneratedMenu(savedMenuRef.current);
      setOverrides({});
      savedMenuRef.current = null;
      return;
    }
    setLoading(true);
    setFetchError('');
    setGeneratedMenu(null);
    setOverrides({});
    generateMenu(profile)
      .then((res) => {
        if (res.success) setGeneratedMenu(res.data);
        else setFetchError(t.dashboard.menuError);
      })
      .catch(() => setFetchError(t.dashboard.menuError))
      .finally(() => setLoading(false));
  }, [profile]);

  // Fetch all recipes for the swap table (runs in parallel; silent failure is acceptable)
  useEffect(() => {
    if (!profile) return;
    getRecipes().then((res) => setRecipes(res.data || [])).catch(() => {});
  }, [profile]);

  // Validate age, weight, and height ranges before calculating the calorie target
  function validateForm() {
    const errs = {};
    if (!form.age || isNaN(form.age) || form.age < 10 || form.age > 120) errs.age = t.dashboard.errAge;
    if (!form.weight || isNaN(form.weight) || form.weight < 20 || form.weight > 300) errs.weight = t.dashboard.errWeight;
    if (!form.height || isNaN(form.height) || form.height < 100 || form.height > 250) errs.height = t.dashboard.errHeight;
    return errs;
  }

  // Update a single form field by its input name attribute
  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Toggle an allergen key in the allergies array on or off
  function handleAllergyToggle(key) {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(key)
        ? prev.allergies.filter((a) => a !== key)
        : [...prev.allergies, key],
    }));
  }

  // Sync the vegetarianOnly checkbox state with the form
  function handleVegetarianToggle(e) {
    setForm((prev) => ({ ...prev, vegetarianOnly: e.target.checked }));
  }

  // Calculate calorie target, persist the profile to localStorage, and trigger recipe loading
  function handleFormSubmit(e) {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    const calories = calcCalories(Number(form.age), Number(form.weight), Number(form.height), form.goal, form.activityLevel);
    const newProfile = { ...form, calories };
    localStorage.setItem(profileKey, JSON.stringify(newProfile));
    setProfile(newProfile);
    updateProfile(form).catch(() => {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Derive compatible recipes for the swap table; meals come from backend-generated menu
  const compatibleRecipes = profile ? applyPreferences(recipes, profile) : [];

  // Map recipeId → fresh imageUrl so saved menus get the current Cloudinary URL
  const freshImageMap = useMemo(() => {
    const map = {};
    recipes.forEach(r => { map[r.recipeId] = r.imageUrl; });
    return map;
  }, [recipes]);

  const withFreshImage = (recipe) =>
    recipe ? { ...recipe, imageUrl: freshImageMap[recipe.recipeId] ?? recipe.imageUrl } : null;

  const breakfast = generatedMenu?.breakfast || null;
  const lunch     = generatedMenu?.lunch     || null;
  const dinner    = generatedMenu?.dinner    || null;

  // Apply any user-selected overrides on top of the auto-picked default meals
  const displayedBreakfast = overrides.breakfast || breakfast;
  const displayedLunch = overrides.lunch || lunch;
  const displayedDinner = overrides.dinner || dinner;

  // Stable object reference so AiChat's useEffect([menu]) doesn't fire on every render
  const menu = useMemo(() => ({
    breakfast: displayedBreakfast,
    lunch:     displayedLunch,
    dinner:    displayedDinner,
  }), [displayedBreakfast, displayedLunch, displayedDinner]);

  // Scale factor + label to apply when the backend returned a scaled (high-calorie) menu
  const scaleInfo = generatedMenu?.scaled
    ? { factor: generatedMenu.scaleFactor }
    : null;

  // Map of meal slot to the recipeId of the currently displayed recipe, used to mark table rows
  const currentIds = {
    breakfast: displayedBreakfast?.recipeId,
    lunch:     displayedLunch?.recipeId,
    dinner:    displayedDinner?.recipeId,
  };

  function handleSaveMenu() {
    const menuToSave = {
      breakfast: displayedBreakfast || null,
      lunch:     displayedLunch     || null,
      dinner:    displayedDinner    || null,
    };
    saveDailyMenu(menuToSave)
      .then(() => {
        setMenuSaved(true);
        setTimeout(() => setMenuSaved(false), 2000);
      })
      .catch(() => {});
  }

  // Replace the auto-selected recipe for a meal slot with the user's chosen recipe.
  // When in scaled mode, apply the same multiplier so the daily total stays correct.
  function handleSwap(recipe) {
    const final = scaleInfo ? {
      ...recipe,
      calories: Math.round(recipe.calories * scaleInfo.factor),
      protein:  Math.round(recipe.protein  * scaleInfo.factor * 10) / 10,
      carbs:    Math.round(recipe.carbs    * scaleInfo.factor * 10) / 10,
      fat:      Math.round(recipe.fat      * scaleInfo.factor * 10) / 10,
    } : recipe;
    setOverrides((prev) => ({ ...prev, [recipe.mealType]: final }));
  }

  // Column definitions for the compatible recipes table including the swap action column
  const tableColumns = [
    { key: 'name', label: t.table.name },
    { key: 'mealType', label: t.table.mealType, render: (v) => t.table.mealTypes[v] || v },
    { key: 'calories', label: t.table.calories },
    { key: 'protein', label: t.table.protein },
    { key: 'carbs', label: t.table.carbs },
    { key: 'fat', label: t.table.fat },
    { key: 'isVegetarian', label: t.table.vegetarian, render: (v) => (v ? '✅' : '❌') },
    {
      key: '_action',
      label: t.table.swapLabel,
      // Show a "current" badge for the active recipe or a swap button for all other compatible options
      render: (_, row) => {
        const isCurrent = currentIds[row.mealType] === row.recipeId;
        return isCurrent
          ? <span className="current-meal-chip">{t.table.currentMeal}</span>
          : <button className="swap-row-btn" onClick={() => handleSwap(row)}>{t.table.swapTo[row.mealType]}</button>;
      },
    },
  ];

  return (
    <div className="page-layout">
      <Navbar />
      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      <main className="dashboard-main">
        {!profile ? (
          // Phase 1: show the questionnaire if no profile exists yet
          <section className="questionnaire">
            <h2>{t.dashboard.qTitle}</h2>
            <p className="q-subtitle">{t.dashboard.qSubtitle}</p>
            <form onSubmit={handleFormSubmit} className="q-form" noValidate>

              {/* Basic info */}
              <div className="q-section-title">📋 {t.dashboard.ageLabel} / {t.dashboard.weightLabel} / {t.dashboard.heightLabel}</div>
              <div className="q-row">
                <div className="field-group">
                  <label>{t.dashboard.ageLabel}</label>
                  <input name="age" type="number" value={form.age} onChange={handleFormChange} placeholder="25" />
                  {formErrors.age && <span className="error-msg">{formErrors.age}</span>}
                </div>
                <div className="field-group">
                  <label>{t.dashboard.weightLabel}</label>
                  <input name="weight" type="number" value={form.weight} onChange={handleFormChange} placeholder="70" />
                  {formErrors.weight && <span className="error-msg">{formErrors.weight}</span>}
                </div>
                <div className="field-group">
                  <label>{t.dashboard.heightLabel}</label>
                  <input name="height" type="number" value={form.height} onChange={handleFormChange} placeholder="170" />
                  {formErrors.height && <span className="error-msg">{formErrors.height}</span>}
                </div>
              </div>
              <div className="field-group">
                <label>{t.dashboard.goalLabel}</label>
                <select name="goal" value={form.goal} onChange={handleFormChange}>
                  {GOAL_VALUES.map((g) => (
                    <option key={g} value={g}>{t.dashboard.goals[g]}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>{t.dashboard.activityLabel}</label>
                <select name="activityLevel" value={form.activityLevel} onChange={handleFormChange}>
                  {ACTIVITY_LEVELS.map((level) => (
                    <option key={level} value={level}>{t.dashboard.activityLevels[level]}</option>
                  ))}
                </select>
              </div>

              {/* Allergies */}
              <div className="q-section-title">⚠️ {t.dashboard.allergiesTitle}</div>
              <p className="q-section-subtitle">{t.dashboard.allergiesSubtitle}</p>
              <div className="allergens-grid">
                {ALLERGEN_KEYS.map((key) => (
                  <label key={key} className={`allergen-chip ${form.allergies.includes(key) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.allergies.includes(key)}
                      onChange={() => handleAllergyToggle(key)}
                    />
                    {t.dashboard.allergens[key]}
                  </label>
                ))}
              </div>

              {/* Dietary preferences */}
              <div className="q-section-title">🥗 {t.dashboard.preferencesTitle}</div>
              <label className="pref-toggle">
                <input type="checkbox" checked={form.vegetarianOnly} onChange={handleVegetarianToggle} />
                <span>{t.dashboard.vegetarianOnly}</span>
              </label>

              <button type="submit" className="submit-btn">{t.dashboard.submit}</button>
            </form>
          </section>
        ) : (
          // Phase 2: show the personalized menu once the profile is set
          <>
            <section className="menu-section">
              <div className="menu-header">
                <div>
                  <h2>{t.dashboard.menuTitle}</h2>
                  <p className="calories-info">
                    {t.dashboard.caloriesInfo}: <strong>{profile.calories}</strong> {t.dashboard.calories}
                    {' '}({t.dashboard.goals[profile.goal]})
                  </p>
                  {/* Summary chips showing active vegetarian and allergen filters */}
                  <div className="profile-chips">
                    {profile.vegetarianOnly && (
                      <span className="chip chip-green">🌱 {t.dashboard.vegetarianOnly}</span>
                    )}
                    {profile.allergies && profile.allergies.length > 0 && (
                      <span className="chip chip-orange">
                        ⚠️ {t.dashboard.profileAllergies}: {profile.allergies.map((a) => t.dashboard.allergens[a]).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="menu-actions">
                  {/* Save current displayed menu (including any swaps) to DB */}
                  {!loading && !fetchError && (displayedBreakfast || displayedLunch || displayedDinner) && (
                    <button className="save-menu-btn" onClick={handleSaveMenu}>
                      {menuSaved ? t.dashboard.menuSaved : t.dashboard.saveMenu}
                    </button>
                  )}
                  {/* Clear the profile and overrides so the user can fill the questionnaire again */}
                  <button className="recalc-btn" onClick={() => {
                    localStorage.removeItem(profileKey);
                    setProfile(null);
                    setRecipes([]);
                    setGeneratedMenu(null);
                    setOverrides({});
                    saveDailyMenu(null).catch(() => {});
                  }}>
                    {t.dashboard.recalc}
                  </button>
                </div>
              </div>

              {loading && <p className="loading-text">{t.dashboard.loading}</p>}
              {fetchError && <p className="error-text">{fetchError}</p>}
              {/* Render one Card per meal slot, falling back to a placeholder if no recipe matches */}
              {!loading && !fetchError && (
                <div className="cards-row">
                  {displayedBreakfast
                    ? <Card {...withFreshImage(displayedBreakfast)} onClick={() => setSelectedRecipe(displayedBreakfast)} />
                    : <NoMealCard label={t.table.mealTypes.breakfast} msg={t.dashboard.noRecipeForMeal} />}
                  {displayedLunch
                    ? <Card {...withFreshImage(displayedLunch)} onClick={() => setSelectedRecipe(displayedLunch)} />
                    : <NoMealCard label={t.table.mealTypes.lunch} msg={t.dashboard.noRecipeForMeal} />}
                  {displayedDinner
                    ? <Card {...withFreshImage(displayedDinner)} onClick={() => setSelectedRecipe(displayedDinner)} />
                    : <NoMealCard label={t.table.mealTypes.dinner} msg={t.dashboard.noRecipeForMeal} />}
                </div>
              )}
            </section>

            {/* Table listing all compatible recipes with nutritional data and swap controls */}
            <section className="table-section">
              <h3>{t.dashboard.tableTitle}</h3>
              {loading
                ? <p className="loading-text">{t.dashboard.loading}</p>
                : <Table
                    columns={tableColumns}
                    rows={compatibleRecipes}
                    getRowClass={(row) => currentIds[row.mealType] === row.recipeId ? 'row-highlighted' : ''}
                  />}
            </section>

            {/* AI chat assistant — only shown after at least one meal card is available */}
            {!loading && !fetchError && (displayedBreakfast || displayedLunch || displayedDinner) && (
              <AiChat
                profile={profile}
                menu={menu}
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Placeholder card displayed when no compatible recipe exists for a given meal slot
function NoMealCard({ label, msg }) {
  return (
    <div className="no-meal-card">
      <div className="no-meal-label">{label}</div>
      <p>{msg}</p>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Table from '../components/Table';
import { getRecipes, updateRecipe, deleteRecipe } from '../services/recipesService';
import { useLanguage } from '../context/LanguageContext';
import './RecipeManagement.css';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const EMPTY_EDIT_FORM = {
  name: '', mealType: '', calories: '', protein: '', carbs: '', fat: '',
  isVegetarian: false, allergens: [], prepTime: '', ingredients: '', instructions: '',
};

function validateEditForm(f, tn) {
  const errs = {};
  if (!f.name.trim()) errs.name = tn.errName;
  if (!VALID_MEAL_TYPES.includes(f.mealType)) errs.mealType = tn.errMealType;
  if (!f.calories || Number(f.calories) <= 0) errs.calories = tn.errCalories;
  if (f.protein === '' || Number(f.protein) < 0) errs.protein = tn.errProtein;
  if (f.carbs === '' || Number(f.carbs) < 0) errs.carbs = tn.errCarbs;
  if (f.fat === '' || Number(f.fat) < 0) errs.fat = tn.errFat;
  return errs;
}

export default function RecipeManagement() {
  const { t } = useLanguage();
  const tn = t.nutritionist;
  const tr = t.recipeManagement;

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editServerError, setEditServerError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    getRecipes()
      .then((res) => setRecipes(res.data || []))
      .catch(() => setFetchError(tr.fetchError))
      .finally(() => setLoading(false));
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!editTarget) return;
    function onKey(e) { if (e.key === 'Escape') setEditTarget(null); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editTarget]);

  async function handleDelete(recipeId) {
    if (!window.confirm(tr.deleteConfirm)) return;
    setDeleteError('');
    try {
      await deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
    } catch {
      setDeleteError(tr.deleteError);
    }
  }

  function openEdit(recipe) {
    setEditTarget(recipe);
    setEditForm({
      name: recipe.name,
      mealType: recipe.mealType,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      isVegetarian: !!recipe.isVegetarian,
      allergens: recipe.allergens || [],
      prepTime: recipe.prepTime || 0,
      ingredients: (recipe.ingredients || []).map((i) => i.name).join(', '),
      instructions: (recipe.instructions || []).join('\n'),
    });
    setEditErrors({});
    setEditServerError('');
    setEditSuccess('');
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: '' }));
    setEditServerError('');
    setEditSuccess('');
  }

  async function handleEditSave(e) {
    e.preventDefault();
    const errs = validateEditForm(editForm, tn);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        mealType: editForm.mealType,
        calories: Number(editForm.calories),
        protein: Number(editForm.protein),
        carbs: Number(editForm.carbs),
        fat: Number(editForm.fat),
        isVegetarian: !!editForm.isVegetarian,
        allergens: editForm.allergens,
        prepTime: Number(editForm.prepTime) || 0,
        ingredients: editForm.ingredients
          .split(',').map((s) => ({ name: s.trim(), amount: '' })).filter((i) => i.name),
        instructions: editForm.instructions
          .split('\n').map((s) => s.trim()).filter(Boolean),
      };
      await updateRecipe(editTarget.recipeId, payload);
      setRecipes((prev) =>
        prev.map((r) =>
          r.recipeId === editTarget.recipeId ? { ...r, ...payload, recipeId: r.recipeId } : r
        )
      );
      setEditSuccess(tr.updateSuccess);
      setTimeout(() => setEditTarget(null), 800);
    } catch {
      setEditServerError(tr.updateError);
    } finally {
      setEditSaving(false);
    }
  }

  const columns = [
    { key: 'name',      label: tr.colName },
    { key: 'mealType',  label: tr.colMealType, render: (v) => t.table.mealTypes[v] || v },
    { key: 'calories',  label: tr.colCalories },
    { key: 'protein',   label: tr.colProtein },
    { key: 'carbs',     label: tr.colCarbs },
    { key: 'fat',       label: tr.colFat },
    {
      key: '_actions',
      label: tr.colActions,
      render: (_, row) => (
        <span className="rm-action-cell">
          <button className="rm-edit-btn" onClick={() => openEdit(row)}>{tr.editBtn}</button>
          <button className="rm-delete-btn" onClick={() => handleDelete(row.recipeId)}>{tr.deleteBtn}</button>
        </span>
      ),
    },
  ];

  return (
    <div className="page-layout">
      <Navbar />
      <main className="rm-main">
        <h1>{tr.title}</h1>

        {fetchError && <p className="rm-error">{fetchError}</p>}
        {deleteError && <p className="rm-error">{deleteError}</p>}

        {loading
          ? <p className="rm-loading">{tr.loading}</p>
          : <Table columns={columns} rows={recipes} />}

        {editTarget && (
          <div className="rm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditTarget(null); }}>
            <div className="rm-modal">
              <h2 className="rm-modal-title">{tr.editModalTitle}</h2>

              {editServerError && <div className="rm-modal-error">{editServerError}</div>}
              {editSuccess && <div className="rm-modal-success">{editSuccess}</div>}

              <form onSubmit={handleEditSave} noValidate>
                <div className="rm-field-group">
                  <label>{tn.nameLabel}</label>
                  <input name="name" value={editForm.name} onChange={handleEditChange} />
                  {editErrors.name && <span className="rm-field-error">{editErrors.name}</span>}
                </div>

                <div className="rm-field-group">
                  <label>{tn.mealTypeLabel}</label>
                  <select name="mealType" value={editForm.mealType} onChange={handleEditChange}>
                    <option value="">{tn.mealTypePlaceholder}</option>
                    {VALID_MEAL_TYPES.map((mt) => (
                      <option key={mt} value={mt}>{tn.mealTypes[mt]}</option>
                    ))}
                  </select>
                  {editErrors.mealType && <span className="rm-field-error">{editErrors.mealType}</span>}
                </div>

                <div className="rm-number-row">
                  <div className="rm-field-group">
                    <label>{tn.caloriesLabel}</label>
                    <input name="calories" type="number" value={editForm.calories} onChange={handleEditChange} />
                    {editErrors.calories && <span className="rm-field-error">{editErrors.calories}</span>}
                  </div>
                  <div className="rm-field-group">
                    <label>{tn.proteinLabel}</label>
                    <input name="protein" type="number" value={editForm.protein} onChange={handleEditChange} />
                    {editErrors.protein && <span className="rm-field-error">{editErrors.protein}</span>}
                  </div>
                  <div className="rm-field-group">
                    <label>{tn.carbsLabel}</label>
                    <input name="carbs" type="number" value={editForm.carbs} onChange={handleEditChange} />
                    {editErrors.carbs && <span className="rm-field-error">{editErrors.carbs}</span>}
                  </div>
                  <div className="rm-field-group">
                    <label>{tn.fatLabel}</label>
                    <input name="fat" type="number" value={editForm.fat} onChange={handleEditChange} />
                    {editErrors.fat && <span className="rm-field-error">{editErrors.fat}</span>}
                  </div>
                </div>

                <div className="rm-field-group">
                  <label>{tn.ingredientsLabel}</label>
                  <textarea name="ingredients" rows={3} value={editForm.ingredients} onChange={handleEditChange} />
                  <span className="rm-field-hint">{tn.ingredientsHint}</span>
                </div>

                <div className="rm-field-group">
                  <label>{tn.instructionsLabel}</label>
                  <textarea name="instructions" rows={4} value={editForm.instructions} onChange={handleEditChange} />
                  <span className="rm-field-hint">{tn.instructionsHint}</span>
                </div>

                <div className="rm-modal-actions">
                  <button type="submit" className="rm-save-btn" disabled={editSaving}>
                    {editSaving ? tr.saving : tr.saveBtn}
                  </button>
                  <button type="button" className="rm-cancel-btn" onClick={() => setEditTarget(null)}>
                    {tr.cancelBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

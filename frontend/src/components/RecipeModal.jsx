import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './RecipeModal.css';

const currentUser = () => JSON.parse(localStorage.getItem('user') || '{}');

// Full-screen overlay modal showing complete recipe details including ingredients and instructions
export default function RecipeModal({ recipe, onClose, isFavorited = false, onToggleFavorite }) {
  const { t } = useLanguage();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isUser = currentUser().userRole === 'user';

  // Allow the user to close the modal by pressing the Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Render nothing when no recipe is selected
  if (!recipe) return null;

  const mealLabel = t.card.mealTypes[recipe.mealType] || recipe.mealType;

  return (
    // Clicking the backdrop overlay also closes the modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop click propagation so clicks inside the box do not close the modal */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header header-${recipe.mealType}`}>
          <div>
            <span className="modal-meal-type">{mealLabel}</span>
            <h2 className="modal-title">{recipe.name}</h2>
          </div>
          <div className="modal-header-actions">
            {isUser && onToggleFavorite && (
              <button
                className={`modal-fav-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={() => onToggleFavorite(recipe.recipeId)}
                title={isFavorited ? 'הסר ממועדפים' : 'הוסף למועדפים'}
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
            )}
            <button className="modal-close" onClick={onClose}>{t.modal.close} ✕</button>
          </div>
        </div>

        {recipe.imageUrl && !imgError && (
          <div className={`modal-image ${imgLoaded ? 'loaded' : 'loading'}`}>
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className="modal-body">
          <p className="modal-description">{recipe.description}</p>

          {/* Nutritional summary bar */}
          <div className="modal-stats">
            <div><strong>{recipe.calories}</strong><br />{t.modal.calories}</div>
            <div><strong>{recipe.protein}g</strong><br />{t.modal.protein}</div>
            <div><strong>{recipe.carbs}g</strong><br />{t.modal.carbs}</div>
            <div><strong>{recipe.fat}g</strong><br />{t.modal.fat}</div>
            <div><strong>{recipe.prepTime}</strong><br />{t.modal.prepTime} ({t.modal.prepUnit})</div>
          </div>

          {/* Vegetarian badge and allergen warning badges */}
          <div className="modal-badges">
            {recipe.isVegetarian && <span className="badge veg">{t.modal.veg}</span>}
            {recipe.allergens && recipe.allergens.length > 0 && (
              <span className="badge allergen">⚠️ {t.modal.allergens}: {recipe.allergens.join(', ')}</span>
            )}
          </div>

          <div className="modal-section">
            <h3>🧅 {t.modal.ingredients}</h3>
            <ul className="ingredients-list">
              {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                <li key={i}>
                  <span className="ing-name">{ing.name}</span>
                  <span className="ing-amount">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-section">
            <h3>👨‍🍳 {t.modal.instructions}</h3>
            <ol className="instructions-list">
              {recipe.instructions && recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

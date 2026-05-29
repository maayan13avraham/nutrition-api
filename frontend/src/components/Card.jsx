import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Card.css';

// Header color per meal type to visually distinguish breakfast, lunch, and dinner cards
const MEAL_COLORS = {
  breakfast: '#f9a825',
  lunch: '#388e3c',
  dinner: '#1565c0',
};

// Meal summary card showing nutritional values; clicking opens the full recipe modal
export default function Card({ mealType, name, calories, protein, carbs, fat, prepTime, isVegetarian, onClick }) {
  const { t } = useLanguage();
  const color = MEAL_COLORS[mealType] || '#555';
  const label = t.card.mealTypes[mealType] || mealType;

  return (
    <div className="meal-card clickable" onClick={onClick}>
      <div className="meal-card-header" style={{ background: color }}>
        <span>{label}</span>
        {isVegetarian && <span className="veg-badge">{t.card.veg}</span>}
      </div>
      <div className="meal-card-body">
        <h3>{name}</h3>
        <div className="meal-card-stats">
          <div><strong>{calories}</strong><br />{t.card.calories}</div>
          <div><strong>{protein}g</strong><br />{t.card.protein}</div>
          <div><strong>{carbs}g</strong><br />{t.card.carbs}</div>
          <div><strong>{fat}g</strong><br />{t.card.fat}</div>
        </div>
        {prepTime > 0 && <p className="prep-time">⏱ {t.card.prepTime}: {prepTime} {t.card.prepUnit}</p>}
        <p className="card-click-hint">לחץ לפרטים ›</p>
      </div>
    </div>
  );
}

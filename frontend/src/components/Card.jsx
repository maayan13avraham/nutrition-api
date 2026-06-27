import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Card.css';

export default function Card({ mealType, name, calories, protein, carbs, fat, prepTime, isVegetarian, imageUrl, onClick }) {
  const { t } = useLanguage();
  const label = t.card.mealTypes[mealType] || mealType;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="meal-card clickable" onClick={onClick}>
      <div className={`meal-card-header header-${mealType}`}>
        <span>{label}</span>
        {isVegetarian && <span className="veg-badge">🌱 {t.card.veg}</span>}
      </div>
      {imageUrl && !imgError && (
        <div className={`card-image ${imgLoaded ? 'loaded' : 'loading'}`}>
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <div className="meal-card-body">
        <h3>{name}</h3>
        <div className="meal-card-stats">
          <div className="stat-chip">
            <strong>{calories}</strong>
            <span>{t.card.calories}</span>
          </div>
          <div className="stat-chip">
            <strong>{protein}g</strong>
            <span>{t.card.protein}</span>
          </div>
          <div className="stat-chip">
            <strong>{carbs}g</strong>
            <span>{t.card.carbs}</span>
          </div>
          <div className="stat-chip">
            <strong>{fat}g</strong>
            <span>{t.card.fat}</span>
          </div>
        </div>
        {prepTime > 0 && <p className="prep-time">⏱ {t.card.prepTime}: {prepTime} {t.card.prepUnit}</p>}
        <p className="card-click-hint">{t.card.clickHint || 'לחץ לפרטים ›'}</p>
      </div>
    </div>
  );
}

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

// Static footer displaying the project name, year, and slogan from the language context
export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <span>{t.footer.name}</span>
      <span>·</span>
      <span>{t.footer.year}</span>
      <span>·</span>
      <span>{t.footer.slogan}</span>
    </footer>
  );
}

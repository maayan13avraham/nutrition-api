import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Table.css';

// Generic data table that renders any columns and rows passed as props
// getRowClass is an optional function(row) => className for conditional row styling
export default function Table({ columns, rows, getRowClass }) {
  const { t } = useLanguage();

  if (!rows || rows.length === 0) {
    return <p className="table-empty">{t.table.empty}</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // Apply optional row class for visual highlighting (e.g. currently selected meal)
            <tr key={i} className={getRowClass ? getRowClass(row) : ''}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

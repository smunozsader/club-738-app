/**
 * AdminHeader - Unified header for entire admin section
 * 
 * Features:
 * - Consistent navigation across all admin pages
 * - Dark mode toggle available everywhere
 * - Back button for sub-sections
 * - Dynamic title based on current section
 */
import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import './AdminHeader.css';

export default function AdminHeader({
  title = 'Administración',
  subtitle = '',
  onBack = null,
  showBackButton = false
}) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="admin-header-container">
      <div className="admin-header-content">
        <div className="admin-header-title-section">
          {showBackButton && onBack && (
            <button
              className="btn-back-header"
              onClick={onBack}
              aria-label="Volver atrás"
              title="Volver"
            >
              ← Volver
            </button>
          )}
          <div className="title-content">
            <h1 className="admin-header-title">{title}</h1>
            {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
          </div>
        </div>
        
        <button
          className="btn-dark-mode-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}

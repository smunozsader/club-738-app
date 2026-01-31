/**
 * AdminHeader - Unified professional header for entire admin section
 * 
 * Matches LandingPage header style:
 * - Gradient background (professional blue)
 * - Clean layout with logo, title, and theme toggle
 * - Consistent across all admin pages
 */
import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import './AdminHeader.css';

export default function AdminHeader({
  title = '🛠️ Administración',
  subtitle = 'Gestiona socios, documentos y PETAs',
  onBack = null,
  showBackButton = false
}) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        {/* Left Section: Back Button + Title */}
        <div className="admin-header-left">
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
          <div className="admin-title-section">
            <h1 className="admin-header-title">{title}</h1>
            {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Right Section: Theme Toggle */}
        <button
          className="btn-dark-mode-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

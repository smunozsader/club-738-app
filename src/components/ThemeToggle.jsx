import React from 'react';
import './ThemeToggle.css';

/**
 * Componente toggle para cambiar entre modo claro y oscuro
 */
const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {isDarkMode ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;

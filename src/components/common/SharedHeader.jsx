/**
 * SharedHeader - Header compartido para toda la aplicación
 * Mismo diseño que LandingPage con logo, título y botón de salir
 */
import React from 'react';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import ThemeToggle from '../ThemeToggle';
import './SharedHeader.css';

export default function SharedHeader({ userEmail, onLogout }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <header className="shared-header">
      <div className="shared-header-content">
        <div className="shared-logo-section">
          <img 
            src="/assets/logo-club-738.jpg" 
            alt="Club 738" 
            className="shared-logo-img" 
          />
          <div className="shared-header-text">
            <h1>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
            {userEmail && (
              <p className="shared-user-email">{userEmail}</p>
            )}
          </div>
        </div>
        <div className="shared-header-actions">
          <ThemeToggle />
          {userEmail && (
            <button 
              type="button" 
              onClick={handleLogout} 
              className="shared-logout-btn"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

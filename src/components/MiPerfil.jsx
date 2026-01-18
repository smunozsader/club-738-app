import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import './MiPerfil.css';

/**
 * MiPerfil - Componente para gestión de perfil del usuario
 * Permite cambiar contraseña de forma segura con re-autenticación
 */
export default function MiPerfil({ user, onBack }) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);

  const validarPassword = () => {
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      setError('❌ Todos los campos son obligatorios');
      return false;
    }

    if (passwordNueva.length < 8) {
      setError('❌ La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (passwordNueva !== passwordConfirmar) {
      setError('❌ Las contraseñas no coinciden');
      return false;
    }

    if (passwordNueva === passwordActual) {
      setError('❌ La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarPassword()) return;

    setLoading(true);

    try {
      // 1. Re-autenticar al usuario (Firebase requiere esto para cambio de contraseña)
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordActual
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // 2. Actualizar contraseña
      await updatePassword(auth.currentUser, passwordNueva);

      // 3. Éxito
      setSuccess('✅ Contraseña actualizada correctamente');
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');

      // Auto-cerrar después de 3 segundos
      setTimeout(() => {
        if (onBack) onBack();
      }, 3000);

    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      
      if (err.code === 'auth/wrong-password') {
        setError('❌ La contraseña actual es incorrecta');
      } else if (err.code === 'auth/weak-password') {
        setError('❌ La contraseña es muy débil. Usa al menos 8 caracteres');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('❌ Por seguridad, cierra sesión y vuelve a iniciar sesión antes de cambiar tu contraseña');
      } else {
        setError('❌ Error al cambiar contraseña. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mi-perfil-container">
      <div className="perfil-header">
        <button className="back-button" onClick={onBack}>
          ← Regresar
        </button>
        <h2>⚙️ Mi Perfil</h2>
      </div>

      <div className="perfil-content">
        <div className="perfil-info-section">
          <h3>📧 Información de Cuenta</h3>
          <div className="info-field">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-field">
            <label>Usuario desde:</label>
            <span>
              {user.metadata?.creationTime 
                ? new Date(user.metadata.creationTime).toLocaleDateString('es-MX')
                : 'N/A'}
            </span>
          </div>
          <div className="info-field">
            <label>Último acceso:</label>
            <span>
              {user.metadata?.lastSignInTime 
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString('es-MX')
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="perfil-password-section">
          <h3>🔒 Cambiar Contraseña</h3>
          
          <div className="security-notice">
            <strong>⚠️ Importante:</strong> Por tu seguridad, te recomendamos cambiar la contraseña temporal 
            asignada por el club. Usa una contraseña única de al menos 8 caracteres.
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleCambiarPassword} className="password-form">
            <div className="form-group">
              <label htmlFor="passwordActual">Contraseña Actual *</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPasswordActual ? 'text' : 'password'}
                  id="passwordActual"
                  name="passwordActual"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="Ej: Club738-XXXX"
                  disabled={loading}
                  autoComplete="current-password"
                  aria-label="Contraseña actual para verificación"
                  aria-required="true"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarPasswordActual(!mostrarPasswordActual)}
                  tabIndex="-1"
                  aria-label={mostrarPasswordActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                >
                  {mostrarPasswordActual ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordNueva">Nueva Contraseña *</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarPasswordNueva ? 'text' : 'password'}
                  id="passwordNueva"
                  name="passwordNueva"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={loading}
                  autoComplete="new-password"
                  aria-label="Nueva contraseña (mínimo 8 caracteres)"
                  aria-required="true"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarPasswordNueva(!mostrarPasswordNueva)}
                  tabIndex="-1"
                  aria-label={mostrarPasswordNueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                >
                  {mostrarPasswordNueva ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <small className="password-hint">
                Usa al menos 8 caracteres. Combina letras, números y símbolos para mayor seguridad.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirmar">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                id="passwordConfirmar"
                name="passwordConfirmar"
                value={passwordConfirmar}
                onChange={(e) => setPasswordConfirmar(e.target.value)}
                placeholder="Repite la nueva contraseña"
                disabled={loading}
                autoComplete="new-password"
                aria-label="Confirmar nueva contraseña"
                aria-required="true"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onBack}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

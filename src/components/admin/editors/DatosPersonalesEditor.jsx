/**
 * DatosPersonalesEditor - Modal para editar nombre del socio
 * 
 * Features:
 * - Validación de nombre no vacío
 * - Confirmación de cambio
 * - Actualización de Firestore
 * - Audit trail automático
 */
import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig';
import './DatosPersonalesEditor.css';

export default function DatosPersonalesEditor({ socioEmail, nombreActual, onClose, onSave }) {
  const [nuevoNombre, setNuevoNombre] = useState(nombreActual || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const validarNombre = () => {
    if (!nuevoNombre.trim()) {
      setError('El nombre no puede estar vacío');
      return false;
    }

    if (nuevoNombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }

    if (!/^[a-záéíóúñü\s]+$/i.test(nuevoNombre.trim())) {
      setError('El nombre solo puede contener letras y espacios');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarNombre()) {
      return;
    }

    // Verificar si hay cambio
    if (nuevoNombre.trim() === nombreActual) {
      setError('No se detectaron cambios en el nombre');
      return;
    }

    setConfirmando(true);
  };

  const confirmarCambio = async () => {
    try {
      setSaving(true);
      setError(null);

      const socioRef = doc(db, 'socios', socioEmail);
      
      // Actualizar nombre
      await updateDoc(socioRef, {
        nombre: nuevoNombre.trim()
      });

      // Crear registro de auditoría
      const auditoriaRef = collection(db, 'socios', socioEmail, 'auditoria');
      await addDoc(auditoriaRef, {
        campo: 'nombre',
        valorAnterior: nombreActual,
        valorNuevo: nuevoNombre.trim(),
        modificadoPor: auth.currentUser?.email || 'admin@club738.com',
        fecha: serverTimestamp(),
        tipo: 'edicion_datos_personales'
      });

      console.log('✅ Nombre actualizado:', nuevoNombre.trim());
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Error actualizando nombre:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setConfirmando(false);
    }
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content datos-editor" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Nombre del Socio</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!confirmando ? (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                value={nuevoNombre}
                onChange={(e) => {
                  setNuevoNombre(e.target.value);
                  setError(null);
                }}
                placeholder="Nombre completo del socio"
                disabled={saving}
                autoFocus
              />
              {error && <p className="error-message">{error}</p>}
            </div>

            <div className="comparacion-valores">
              <div className="valor-anterior">
                <label>Valor Actual:</label>
                <div className="valor">{nombreActual || '(Sin nombre)'}</div>
              </div>
              <div className="valor-nuevo">
                <label>Nuevo Valor:</label>
                <div className="valor">{nuevoNombre.trim() || '(Vacío)'}</div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={saving || !nuevoNombre.trim()}
              >
                {saving ? 'Guardando...' : 'Continuar →'}
              </button>
            </div>
          </form>
        ) : (
          <div className="confirmacion-cambio">
            <div className="confirmacion-icono">⚠️</div>
            <h3>Confirmar Cambio de Nombre</h3>
            
            <div className="confirmacion-detalles">
              <div className="detalle-cambio">
                <span className="label-anterior">Nombre Actual:</span>
                <span className="valor-anterior-conf">{nombreActual}</span>
              </div>
              <div className="flecha-cambio">↓</div>
              <div className="detalle-cambio">
                <span className="label-nuevo">Nombre Nuevo:</span>
                <span className="valor-nuevo-conf">{nuevoNombre.trim()}</span>
              </div>
            </div>

            <p className="confirmacion-advertencia">
              Este cambio quedará registrado en el historial de auditoría del socio.
            </p>

            {error && <p className="error-message">{error}</p>}

            <div className="modal-actions">
              <button
                onClick={cancelarConfirmacion}
                className="btn-cancel"
                disabled={saving}
              >
                ← Volver
              </button>
              <button
                onClick={confirmarCambio}
                className="btn-confirm"
                disabled={saving}
              >
                {saving ? 'Guardando...' : '✅ Confirmar Cambio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

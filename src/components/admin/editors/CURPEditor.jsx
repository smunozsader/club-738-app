/**
 * CURPEditor - Modal para editar CURP del socio
 * 
 * Features:
 * - Validación de 18 caracteres
 * - Validación de formato CURP
 * - Verificación de duplicados
 * - Confirmación de cambio
 * - Audit trail automático
 */
import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig';
import { useToastContext } from '../../../contexts/ToastContext';
import './CURPEditor.css';

export default function CURPEditor({ socioEmail, curpActual, onClose, onSave }) {
  const [nuevoCURP, setNuevoCURP] = useState(curpActual || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const validarFormatoCURP = (curp) => {
    // CURP debe tener 18 caracteres
    if (curp.length !== 18) {
      return 'El CURP debe tener exactamente 18 caracteres';
    }

    // Formato básico: 4 letras + 6 números + 6 alfanuméricos + 2 dígitos
    const regexCURP = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    if (!regexCURP.test(curp)) {
      return 'Formato de CURP inválido';
    }

    // Validar que los dígitos de fecha sean válidos
    const año = parseInt(curp.substring(4, 6));
    const mes = parseInt(curp.substring(6, 8));
    const dia = parseInt(curp.substring(8, 10));

    if (mes < 1 || mes > 12) {
      return 'El mes en el CURP no es válido (debe ser 01-12)';
    }

    if (dia < 1 || dia > 31) {
      return 'El día en el CURP no es válido (debe ser 01-31)';
    }

    return null; // Válido
  };

  const verificarDuplicados = async (curp) => {
    try {
      const sociosRef = collection(db, 'socios');
      const q = query(sociosRef, where('curp', '==', curp));
      const querySnapshot = await getDocs(q);

      // Verificar si existe otro socio con el mismo CURP
      const duplicados = querySnapshot.docs.filter(doc => doc.id !== socioEmail);
      
      if (duplicados.length > 0) {
        const nombreDuplicado = duplicados[0].data().nombre;
        return `Este CURP ya está registrado para ${nombreDuplicado}`;
      }

      return null; // No hay duplicados
    } catch (err) {
      console.error('Error verificando duplicados:', err);
      return 'Error verificando duplicados en la base de datos';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const curpNormalizado = nuevoCURP.toUpperCase().trim();

    // Validar que no esté vacío
    if (!curpNormalizado) {
      setError('El CURP no puede estar vacío');
      return;
    }

    // Validar formato
    const errorFormato = validarFormatoCURP(curpNormalizado);
    if (errorFormato) {
      setError(errorFormato);
      return;
    }

    // Verificar si hay cambio
    if (curpNormalizado === curpActual) {
      setError('No se detectaron cambios en el CURP');
      return;
    }

    // Verificar duplicados
    setSaving(true);
    const errorDuplicado = await verificarDuplicados(curpNormalizado);
    setSaving(false);

    if (errorDuplicado) {
      setError(errorDuplicado);
      return;
    }

    setNuevoCURP(curpNormalizado);
    setConfirmando(true);
  };

  const confirmarCambio = async () => {
    try {
      setSaving(true);
      setError(null);

      const curpNormalizado = nuevoCURP.toUpperCase().trim();
      const socioRef = doc(db, 'socios', socioEmail);
      
      // Actualizar CURP
      await updateDoc(socioRef, {
        curp: curpNormalizado
      });

      // Crear registro de auditoría
      const auditoriaRef = collection(db, 'socios', socioEmail, 'auditoria');
      await addDoc(auditoriaRef, {
        campo: 'curp',
        valorAnterior: curpActual || 'Sin CURP',
        valorNuevo: curpNormalizado,
        modificadoPor: auth.currentUser?.email || 'admin@club738.com',
        fecha: serverTimestamp(),
        tipo: 'edicion_curp'
      });

      console.log('✅ CURP actualizado:', curpNormalizado);
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Error actualizando CURP:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setConfirmando(false);
    }
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
  };

  const handleCURPChange = (e) => {
    const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setNuevoCURP(valor);
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content curp-editor" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🆔 Editar CURP del Socio</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!confirmando ? (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="curp-info-box">
              <p>
                <strong>Formato válido:</strong> 18 caracteres alfanuméricos<br />
                <strong>Ejemplo:</strong> MOJS850315HYNXRG02
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="curp">CURP (18 caracteres) *</label>
              <input
                type="text"
                id="curp"
                value={nuevoCURP}
                onChange={handleCURPChange}
                placeholder="CURP de 18 caracteres"
                maxLength={18}
                disabled={saving}
                autoFocus
                className="curp-input"
              />
              <div className="char-counter">
                {nuevoCURP.length}/18 caracteres
                {nuevoCURP.length === 18 && <span className="check-icon">✓</span>}
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>

            <div className="comparacion-valores">
              <div className="valor-anterior">
                <label>CURP Actual:</label>
                <div className="valor">{curpActual || '(Sin CURP)'}</div>
              </div>
              <div className="valor-nuevo">
                <label>Nuevo CURP:</label>
                <div className="valor">{nuevoCURP || '(Vacío)'}</div>
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
                disabled={saving || nuevoCURP.length !== 18}
              >
                {saving ? 'Verificando...' : 'Continuar →'}
              </button>
            </div>
          </form>
        ) : (
          <div className="confirmacion-cambio">
            <div className="confirmacion-icono">⚠️</div>
            <h3>Confirmar Cambio de CURP</h3>
            
            <div className="confirmacion-detalles">
              <div className="detalle-cambio">
                <span className="label-anterior">CURP Actual:</span>
                <span className="valor-anterior-conf">{curpActual || 'Sin CURP'}</span>
              </div>
              <div className="flecha-cambio">↓</div>
              <div className="detalle-cambio">
                <span className="label-nuevo">Nuevo CURP:</span>
                <span className="valor-nuevo-conf">{nuevoCURP}</span>
              </div>
            </div>

            <div className="curp-validaciones">
              <div className="validacion-item">
                <span className="check-green">✓</span> Formato válido (18 caracteres)
              </div>
              <div className="validacion-item">
                <span className="check-green">✓</span> Sin duplicados en la base de datos
              </div>
            </div>

            <p className="confirmacion-advertencia">
              ⚠️ El CURP es un identificador oficial. Verifica que sea correcto antes de confirmar.
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

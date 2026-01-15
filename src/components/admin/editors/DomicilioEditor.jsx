/**
 * DomicilioEditor - Modal para editar domicilio estructurado del socio
 * 
 * Features:
 * - Campos estructurados: calle, colonia, municipio, estado, CP
 * - Validación de campos requeridos
 * - Validación de código postal (5 dígitos)
 * - Confirmación de cambio
 * - Audit trail automático
 */
import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig';
import { useToastContext } from '../../../contexts/ToastContext';
import './DomicilioEditor.css';

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
  'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
  'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
  'Veracruz', 'Yucatán', 'Zacatecas'
];

export default function DomicilioEditor({ socioEmail, domicilioActual, onClose, onSave }) {
  const [domicilio, setDomicilio] = useState({
    calle: domicilioActual?.calle || '',
    colonia: domicilioActual?.colonia || '',
    municipio: domicilioActual?.municipio || '',
    estado: domicilioActual?.estado || 'Yucatán',
    cp: domicilioActual?.cp || ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const validarDomicilio = () => {
    if (!domicilio.calle.trim()) {
      setError('La calle es requerida');
      return false;
    }

    if (!domicilio.colonia.trim()) {
      setError('La colonia es requerida');
      return false;
    }

    if (!domicilio.municipio.trim()) {
      setError('El municipio es requerido');
      return false;
    }

    if (!domicilio.estado) {
      setError('El estado es requerido');
      return false;
    }

    if (!domicilio.cp.trim()) {
      setError('El código postal es requerido');
      return false;
    }

    // Validar formato de CP (5 dígitos)
    if (!/^\d{5}$/.test(domicilio.cp.trim())) {
      setError('El código postal debe tener 5 dígitos');
      return false;
    }

    return true;
  };

  const handleChange = (campo, valor) => {
    setDomicilio(prev => ({
      ...prev,
      [campo]: valor
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarDomicilio()) {
      return;
    }

    // Verificar si hay cambios
    const hayCambios = Object.keys(domicilio).some(key => 
      domicilio[key] !== (domicilioActual?.[key] || '')
    );

    if (!hayCambios) {
      setError('No se detectaron cambios en el domicilio');
      return;
    }

    setConfirmando(true);
  };

  const confirmarCambio = async () => {
    try {
      setSaving(true);
      setError(null);

      const socioRef = doc(db, 'socios', socioEmail);
      
      // Actualizar domicilio
      await updateDoc(socioRef, {
        domicilio: {
          calle: domicilio.calle.trim(),
          colonia: domicilio.colonia.trim(),
          municipio: domicilio.municipio.trim(),
          estado: domicilio.estado,
          cp: domicilio.cp.trim()
        }
      });

      // Crear registro de auditoría
      const auditoriaRef = collection(db, 'socios', socioEmail, 'auditoria');
      await addDoc(auditoriaRef, {
        campo: 'domicilio',
        valorAnterior: domicilioActual ? JSON.stringify(domicilioActual) : 'Sin domicilio',
        valorNuevo: JSON.stringify(domicilio),
        modificadoPor: auth.currentUser?.email || 'admin@club738.com',
        fecha: serverTimestamp(),
        tipo: 'edicion_domicilio'
      });

      console.log('✅ Domicilio actualizado');
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Error actualizando domicilio:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setConfirmando(false);
    }
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
  };

  const formatearDomicilio = (dom) => {
    if (!dom || !dom.calle) return 'Sin domicilio';
    return `${dom.calle}, ${dom.colonia}, ${dom.municipio}, ${dom.estado}, C.P. ${dom.cp}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content domicilio-editor" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📍 Editar Domicilio del Socio</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!confirmando ? (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label htmlFor="calle">Calle y Número *</label>
              <input
                type="text"
                id="calle"
                value={domicilio.calle}
                onChange={(e) => handleChange('calle', e.target.value)}
                placeholder="Ej: Calle 50 No. 531-E x 69 y 71"
                disabled={saving}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="colonia">Colonia *</label>
                <input
                  type="text"
                  id="colonia"
                  value={domicilio.colonia}
                  onChange={(e) => handleChange('colonia', e.target.value)}
                  placeholder="Ej: Centro"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cp">Código Postal *</label>
                <input
                  type="text"
                  id="cp"
                  value={domicilio.cp}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 5);
                    handleChange('cp', valor);
                  }}
                  placeholder="97000"
                  maxLength={5}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="municipio">Municipio *</label>
                <input
                  type="text"
                  id="municipio"
                  value={domicilio.municipio}
                  onChange={(e) => handleChange('municipio', e.target.value)}
                  placeholder="Ej: Mérida"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado *</label>
                <select
                  id="estado"
                  value={domicilio.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                  disabled={saving}
                >
                  {ESTADOS_MEXICO.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="domicilio-preview">
              <label>Vista Previa:</label>
              <div className="preview-text">{formatearDomicilio(domicilio)}</div>
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
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Continuar →'}
              </button>
            </div>
          </form>
        ) : (
          <div className="confirmacion-cambio">
            <div className="confirmacion-icono">⚠️</div>
            <h3>Confirmar Cambio de Domicilio</h3>
            
            <div className="confirmacion-detalles">
              <div className="domicilio-comparacion">
                <div className="domicilio-anterior">
                  <label>Domicilio Actual:</label>
                  <div className="domicilio-texto">{formatearDomicilio(domicilioActual)}</div>
                </div>
                <div className="flecha-cambio">↓</div>
                <div className="domicilio-nuevo">
                  <label>Nuevo Domicilio:</label>
                  <div className="domicilio-texto">{formatearDomicilio(domicilio)}</div>
                </div>
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

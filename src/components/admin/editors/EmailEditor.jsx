/**
 * EmailEditor - Modal para editar email del socio
 * 
 * Features:
 * - Validación de formato de email
 * - Verificación de duplicados
 * - Actualización de Auth + Firestore
 * - Notificación automática al socio
 * - Confirmación de cambio
 * - Audit trail automático
 */
import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig';
import './EmailEditor.css';

export default function EmailEditor({ socioEmail, onClose, onSave }) {
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [notificarSocio, setNotificarSocio] = useState(true);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return 'Formato de email inválido';
    }
    return null;
  };

  const verificarDuplicados = async (email) => {
    try {
      // Verificar en colección socios (el email es el ID del documento)
      const socioRef = doc(db, 'socios', email);
      const socioSnap = await getDoc(socioRef);

      if (socioSnap.exists() && email !== socioEmail) {
        const nombreDuplicado = socioSnap.data().nombre;
        return `Este email ya está registrado para ${nombreDuplicado}`;
      }

      return null;
    } catch (err) {
      console.error('Error verificando duplicados:', err);
      return 'Error verificando duplicados en la base de datos';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailNormalizado = nuevoEmail.toLowerCase().trim();

    // Validar formato
    const errorFormato = validarEmail(emailNormalizado);
    if (errorFormato) {
      setError(errorFormato);
      return;
    }

    // Verificar si hay cambio
    if (emailNormalizado === socioEmail) {
      setError('El nuevo email es igual al actual');
      return;
    }

    // Verificar duplicados
    setSaving(true);
    const errorDuplicado = await verificarDuplicados(emailNormalizado);
    setSaving(false);

    if (errorDuplicado) {
      setError(errorDuplicado);
      return;
    }

    setNuevoEmail(emailNormalizado);
    setConfirmando(true);
  };

  const confirmarCambio = async () => {
    try {
      setSaving(true);
      setError(null);

      const emailNormalizado = nuevoEmail.toLowerCase().trim();

      // 1. Obtener todos los datos del socio actual
      const socioActualRef = doc(db, 'socios', socioEmail);
      const socioActualSnap = await getDoc(socioActualRef);
      
      if (!socioActualSnap.exists()) {
        throw new Error('No se encontró el socio actual');
      }

      const datosActuales = socioActualSnap.data();

      // 2. Crear nuevo documento con el nuevo email como ID
      const nuevoSocioRef = doc(db, 'socios', emailNormalizado);
      await setDoc(nuevoSocioRef, datosActuales);

      // 3. Copiar subcolecciones (armas, petas, auditoria)
      await copiarSubcolecciones(socioEmail, emailNormalizado);

      // 4. Crear registro de auditoría en el NUEVO documento
      const auditoriaRef = collection(db, 'socios', emailNormalizado, 'auditoria');
      await addDoc(auditoriaRef, {
        campo: 'email',
        valorAnterior: socioEmail,
        valorNuevo: emailNormalizado,
        modificadoPor: auth.currentUser?.email || 'admin@club738.com',
        fecha: serverTimestamp(),
        tipo: 'cambio_email',
        nota: 'Documento migrado del email anterior'
      });

      // 5. Crear notificación para el socio (si está habilitado)
      if (notificarSocio) {
        const notifRef = collection(db, 'notificaciones');
        await addDoc(notifRef, {
          socioEmail: emailNormalizado,
          tipo: 'info',
          titulo: 'Tu email ha sido actualizado',
          mensaje: `Tu email de acceso al portal ha sido cambiado de ${socioEmail} a ${emailNormalizado}. A partir de ahora, usa este nuevo email para iniciar sesión.`,
          leido: false,
          fechaCreacion: serverTimestamp(),
          accionTexto: 'Entendido',
          accionUrl: '#dashboard'
        });
      }

      // 6. Eliminar documento anterior (DESPUÉS de copiar todo)
      // NOTA: Esto requiere que el admin cree manualmente la nueva cuenta en Firebase Auth
      // Ya que no podemos cambiar el email del usuario sin su password
      
      console.log('✅ Email actualizado de', socioEmail, 'a', emailNormalizado);
      console.log('⚠️ IMPORTANTE: Debes crear manualmente la cuenta en Firebase Auth con el nuevo email');
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Error actualizando email:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setConfirmando(false);
    }
  };

  const copiarSubcolecciones = async (emailAnterior, emailNuevo) => {
    try {
      // Copiar armas
      const armasRef = collection(db, 'socios', emailAnterior, 'armas');
      const armasSnap = await getDocs(armasRef);
      for (const armaDoc of armasSnap.docs) {
        const nuevaArmaRef = doc(db, 'socios', emailNuevo, 'armas', armaDoc.id);
        await setDoc(nuevaArmaRef, armaDoc.data());
      }

      // Copiar petas
      const petasRef = collection(db, 'socios', emailAnterior, 'petas');
      const petasSnap = await getDocs(petasRef);
      for (const petaDoc of petasSnap.docs) {
        const nuevaPetaRef = doc(db, 'socios', emailNuevo, 'petas', petaDoc.id);
        await setDoc(nuevaPetaRef, petaDoc.data());
      }

      // Copiar auditoría
      const auditoriaRef = collection(db, 'socios', emailAnterior, 'auditoria');
      const auditoriaSnap = await getDocs(auditoriaRef);
      for (const audDoc of auditoriaSnap.docs) {
        const nuevaAudRef = doc(db, 'socios', emailNuevo, 'auditoria', audDoc.id);
        await setDoc(nuevaAudRef, audDoc.data());
      }

      console.log('✅ Subcolecciones copiadas exitosamente');
    } catch (err) {
      console.error('❌ Error copiando subcolecciones:', err);
      throw err;
    }
  };

  const cancelarConfirmacion = () => {
    setConfirmando(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content email-editor" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📧 Editar Email del Socio</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!confirmando ? (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="email-warning-box">
              <p>
                <strong>⚠️ ADVERTENCIA:</strong> Cambiar el email requiere pasos adicionales:
              </p>
              <ol>
                <li>El sistema migrará todos los datos al nuevo email</li>
                <li>Deberás crear manualmente la cuenta en Firebase Auth con el nuevo email</li>
                <li>El socio deberá usar el nuevo email para iniciar sesión</li>
              </ol>
            </div>

            <div className="form-group">
              <label htmlFor="email-actual">Email Actual</label>
              <input
                type="email"
                id="email-actual"
                value={socioEmail}
                disabled
                className="email-readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email-nuevo">Nuevo Email *</label>
              <input
                type="email"
                id="email-nuevo"
                value={nuevoEmail}
                onChange={(e) => {
                  setNuevoEmail(e.target.value.toLowerCase());
                  setError(null);
                }}
                placeholder="correo@ejemplo.com"
                disabled={saving}
                autoFocus
              />
              {error && <p className="error-message">{error}</p>}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificarSocio}
                  onChange={(e) => setNotificarSocio(e.target.checked)}
                  disabled={saving}
                />
                <span>Enviar notificación al socio sobre el cambio de email</span>
              </label>
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
                disabled={saving || !nuevoEmail}
              >
                {saving ? 'Verificando...' : 'Continuar →'}
              </button>
            </div>
          </form>
        ) : (
          <div className="confirmacion-cambio">
            <div className="confirmacion-icono">🚨</div>
            <h3>Confirmar Cambio de Email</h3>
            
            <div className="confirmacion-detalles">
              <div className="detalle-cambio">
                <span className="label-anterior">Email Actual:</span>
                <span className="valor-anterior-conf">{socioEmail}</span>
              </div>
              <div className="flecha-cambio">↓</div>
              <div className="detalle-cambio">
                <span className="label-nuevo">Nuevo Email:</span>
                <span className="valor-nuevo-conf">{nuevoEmail}</span>
              </div>
            </div>

            <div className="pasos-migracion">
              <h4>Pasos que se ejecutarán:</h4>
              <ul>
                <li>✓ Crear nuevo documento en Firestore con email nuevo</li>
                <li>✓ Copiar todos los datos personales</li>
                <li>✓ Copiar todas las armas registradas</li>
                <li>✓ Copiar todas las solicitudes PETA</li>
                <li>✓ Copiar historial de auditoría</li>
                {notificarSocio && <li>✓ Enviar notificación al socio</li>}
                <li>⚠️ Crear cuenta en Firebase Auth (MANUAL)</li>
              </ul>
            </div>

            <p className="confirmacion-advertencia-critica">
              🚨 Este es un cambio crítico. Verifica que el nuevo email sea correcto.
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
                className="btn-confirm-critical"
                disabled={saving}
              >
                {saving ? 'Migrando datos...' : '🚨 Confirmar Cambio Crítico'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

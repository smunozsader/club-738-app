import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useToastContext } from '../../contexts/ToastContext';
import './NotificacionesCitas.css';

/**
 * Componente de Notificaciones de Citas
 * Muestra alertas cuando hay citas pendientes de confirmación
 */
function NotificacionesCitas() {
  const { showToast } = useToastContext();
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [mostrarBandera, setMostrarBandera] = useState(true);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    // Suscribirse a citas pendientes
    const citasRef = collection(db, 'citas');
    const q = query(citasRef, where('estado', '==', 'pendiente'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const citas = [];
      snap.forEach((doc) => {
        citas.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar por fecha más reciente
      citas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA - fechaB;
      });

      setCitasPendientes(citas);

      // Si hay nuevas citas pendientes, mostrar notificación
      if (citas.length > 0) {
        setMostrarBandera(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const getPropositoNombre = (proposito) => {
    const nombres = {
      'peta': 'Trámite PETA',
      'pago': 'Pago membresía',
      'documentos': 'Entrega documentos',
      'consulta': 'Consulta general',
      'otro': 'Otro'
    };
    return nombres[proposito] || 'Otro';
  };

  const getPropositoIcon = (proposito) => {
    const iconos = {
      'peta': '🎯',
      'pago': '💰',
      'documentos': '📄',
      'consulta': '💬',
      'otro': '📌'
    };
    return iconos[proposito] || '📌';
  };

  const confirmarRapido = async (citaId) => {
    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, {
        estado: 'confirmada',
        fechaConfirmacion: new Date().toISOString()
      });
      showToast('✅ Cita confirmada rápidamente', 'success', 2000);
    } catch (error) {
      console.error('Error confirmando cita:', error);
      showToast('❌ Error al confirmar', 'error', 2000);
    }
  };

  if (citasPendientes.length === 0 || !mostrarBandera) {
    return null;
  }

  return (
    <div className="notificaciones-citas-container">
      <div className="citas-alert-banner" role="alert" aria-live="polite">
        <div className="banner-header">
          <div className="alert-info">
            <span className="alert-icon">🔔</span>
            <span className="alert-text">
              <strong>{citasPendientes.length}</strong> cita{citasPendientes.length > 1 ? 's' : ''} pendiente{citasPendientes.length > 1 ? 's' : ''} de confirmación
            </span>
          </div>
          <button
            className="btn-toggle-alert"
            onClick={() => setExpandido(!expandido)}
            aria-expanded={expandido}
            aria-label={expandido ? 'Colapsar alertas de citas' : 'Expandir alertas de citas'}
            title={expandido ? 'Colapsar' : 'Expandir'}
          >
            {expandido ? '▼' : '▶'}
          </button>
          <button
            className="btn-close-alert"
            onClick={() => setMostrarBandera(false)}
            aria-label="Cerrar notificaciones de citas"
            title="Cerrar notificación"
          >
            ✕
          </button>
        </div>

        {expandido && (
          <div className="citas-list-alert">
            {citasPendientes.map((cita) => (
              <div key={cita.id} className="cita-item-alert">
                <div className="cita-info-alert">
                  <div className="cita-header-alert">
                    <span className="cita-socio-alert">
                      👤 <strong>{cita.socioNombre}</strong>
                    </span>
                    <span className="cita-proposito-alert">
                      {getPropositoIcon(cita.proposito)} {getPropositoNombre(cita.proposito)}
                    </span>
                  </div>
                  <div className="cita-footer-alert">
                    <span className="cita-fecha-alert">
                      📅 {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="cita-hora-alert">
                      🕐 {cita.hora} hrs
                    </span>
                  </div>
                </div>
                <button
                  className="btn-confirmar-rapido"
                  onClick={() => confirmarRapido(cita.id)}
                  aria-label={`Confirmar cita de ${cita.socioNombre}`}
                  title="Confirmar esta cita"
                >
                  ✅ Confirmar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificacionesCitas;

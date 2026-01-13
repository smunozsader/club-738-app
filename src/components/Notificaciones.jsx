/**
 * Notificaciones - Banner flotante para mostrar notificaciones importantes a socios
 * 
 * Características:
 * - Banner flotante en parte superior del dashboard
 * - Listener real-time de notificaciones no leídas
 * - Marca notificaciones como leídas con un click
 * - Tipos de notificación: info, warning, success, error
 * - Botón de acción opcional
 * - Auto-desaparece al marcar como leído
 */
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import './Notificaciones.css';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const socioEmail = auth.currentUser.email;

    // Query de notificaciones no leídas del socio actual
    const q = query(
      collection(db, 'notificaciones'),
      where('socioEmail', '==', socioEmail),
      where('leido', '==', false)
    );

    // Listener en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Ordenar por fecha (más recientes primero)
      notifs.sort((a, b) => {
        const fechaA = a.fechaCreacion?.toMillis() || 0;
        const fechaB = b.fechaCreacion?.toMillis() || 0;
        return fechaB - fechaA;
      });

      setNotificaciones(notifs);
      setLoading(false);
    }, (error) => {
      console.error('Error al escuchar notificaciones:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const marcarComoLeido = async (notificacionId) => {
    try {
      const notifRef = doc(db, 'notificaciones', notificacionId);
      await updateDoc(notifRef, {
        leido: true,
        fechaLeido: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const ejecutarAccion = (notificacion) => {
    if (notificacion.accionUrl) {
      window.location.href = notificacion.accionUrl;
    } else if (notificacion.accionCallback) {
      // Para acciones personalizadas en el futuro
      console.log('Acción ejecutada:', notificacion.accionCallback);
    }
    marcarComoLeido(notificacion.id);
  };

  if (loading) {
    return null; // No mostrar nada mientras carga
  }

  if (notificaciones.length === 0) {
    return null; // No mostrar banner si no hay notificaciones
  }

  return (
    <div className="notificaciones-container">
      {notificaciones.map((notif) => (
        <div 
          key={notif.id} 
          className={`notificacion-banner ${notif.tipo || 'info'}`}
        >
          <div className="notificacion-icono">
            {getIcono(notif.tipo)}
          </div>

          <div className="notificacion-contenido">
            <h3 className="notificacion-titulo">{notif.titulo}</h3>
            <p className="notificacion-mensaje">{notif.mensaje}</p>
          </div>

          <div className="notificacion-acciones">
            {notif.accionTexto && notif.accionUrl && (
              <button
                className="btn-accion"
                onClick={() => ejecutarAccion(notif)}
              >
                {notif.accionTexto}
              </button>
            )}
            <button
              className="btn-cerrar"
              onClick={() => marcarComoLeido(notif.id)}
              title="Marcar como leído"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getIcono(tipo) {
  switch (tipo) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'info':
    default:
      return 'ℹ️';
  }
}

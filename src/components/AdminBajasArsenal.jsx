import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, getDocs, doc, updateDoc, getDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import './AdminBajasArsenal.css';

/**
 * Panel administrativo para gestionar solicitudes de baja de armas
 * Solo accesible por el secretario
 */
function AdminBajasArsenal() {
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [vistaModal, setVistaModal] = useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const allSolicitudes = [];

      // Obtener todos los socios
      const sociosRef = collection(db, 'socios');
      const sociosSnap = await getDocs(sociosRef);

      // Para cada socio, obtener sus solicitudes de baja
      for (const socioDoc of sociosSnap.docs) {
        const solicitudesRef = collection(db, 'socios', socioDoc.id, 'solicitudesBaja');
        const solicitudesSnap = await getDocs(solicitudesRef);

        solicitudesSnap.forEach((solDoc) => {
          allSolicitudes.push({
            id: solDoc.id,
            socioEmail: socioDoc.id,
            ...solDoc.data()
          });
        });
      }

      // Ordenar por fecha (más recientes primero)
      allSolicitudes.sort((a, b) => {
        const fechaA = a.fechaSolicitud?.toMillis?.() || 0;
        const fechaB = b.fechaSolicitud?.toMillis?.() || 0;
        return fechaB - fechaA;
      });

      setSolicitudes(allSolicitudes);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      alert('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (solicitud) => {
    if (!window.confirm(`¿Aprobar la baja de ${solicitud.armaDetalles.marca} ${solicitud.armaDetalles.modelo}?`)) {
      return;
    }

    try {
      setLoading(true);
      const solicitudRef = doc(db, 'socios', solicitud.socioEmail, 'solicitudesBaja', solicitud.id);
      
      await updateDoc(solicitudRef, {
        estado: 'aprobada',
        fechaAprobacion: serverTimestamp(),
        aprobadoPor: auth.currentUser.email
      });

      alert('✅ Solicitud aprobada. Ahora puedes generar los oficios para 32 ZM y DN27.');
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      alert('Error al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarProcesada = async (solicitud) => {
    if (!window.confirm(`¿Marcar como procesada? (Ya se tramitó ante autoridades)`)) {
      return;
    }

    try {
      setLoading(true);
      const solicitudRef = doc(db, 'socios', solicitud.socioEmail, 'solicitudesBaja', solicitud.id);
      
      await updateDoc(solicitudRef, {
        estado: 'procesada',
        fechaProcesamiento: serverTimestamp(),
        procesadoPor: auth.currentUser.email
      });

      // Si el receptor es socio del club, crear una nota para dar de alta en su arsenal
      if (solicitud.receptor?.esSocioClub && solicitud.receptor?.email) {
        // Crear notificación para el socio receptor
        const notificacionRef = collection(db, 'socios', solicitud.receptor.email, 'notificaciones');
        await addDoc(notificacionRef, {
          tipo: 'transferencia_arma',
          mensaje: `El socio ${solicitud.nombreSolicitante} transfirió un arma a tu nombre. Por favor contacta al secretario para actualizar tu arsenal.`,
          armaDetalles: solicitud.armaDetalles,
          vendedorEmail: solicitud.socioEmail,
          fechaCreacion: serverTimestamp(),
          leida: false
        });
      }

      alert('✅ Solicitud marcada como procesada.');
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error al marcar como procesada:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const generarOficioZM = (solicitud) => {
    // TODO: Implementar generación de oficio para 32 ZM
    alert(`🚧 En desarrollo: Generador de oficio para 32 ZM\n\nArma: ${solicitud.armaDetalles.marca} ${solicitud.armaDetalles.modelo}\nMatrícula: ${solicitud.armaDetalles.matricula}\nFolio: ${solicitud.armaDetalles.folio}`);
  };

  const generarOficioDN27 = (solicitud) => {
    // TODO: Implementar generación de oficio para DN27
    alert(`🚧 En desarrollo: Generador de oficio para DN27\n\nArma: ${solicitud.armaDetalles.marca} ${solicitud.armaDetalles.modelo}\nMatrícula: ${solicitud.armaDetalles.matricula}\nFolio: ${solicitud.armaDetalles.folio}`);
  };

  const abrirDetalles = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setVistaModal(true);
  };

  const cerrarModal = () => {
    setSolicitudSeleccionada(null);
    setVistaModal(false);
  };

  const solicitudesFiltradas = solicitudes.filter(s => s.estado === filtroEstado);

  const contadores = {
    pendiente: solicitudes.filter(s => s.estado === 'pendiente').length,
    aprobada: solicitudes.filter(s => s.estado === 'aprobada').length,
    procesada: solicitudes.filter(s => s.estado === 'procesada').length
  };

  if (loading) {
    return (
      <div className="admin-bajas-container">
        <div className="loading-spinner">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="admin-bajas-container">
      <header className="admin-header">
        <h1>🗂️ Gestión de Bajas de Arsenal</h1>
        <p className="subtitle">Administración de solicitudes de baja de armas</p>
      </header>

      {/* CONTADORES */}
      <div className="contadores-grid">
        <div className="contador-card pendiente">
          <div className="contador-num">{contadores.pendiente}</div>
          <div className="contador-label">Pendientes</div>
        </div>
        <div className="contador-card aprobada">
          <div className="contador-num">{contadores.aprobada}</div>
          <div className="contador-label">Aprobadas</div>
        </div>
        <div className="contador-card procesada">
          <div className="contador-num">{contadores.procesada}</div>
          <div className="contador-label">Procesadas</div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filtros-bar">
        <button
          className={filtroEstado === 'pendiente' ? 'filtro-active' : 'filtro-inactive'}
          onClick={() => setFiltroEstado('pendiente')}
        >
          ⏳ Pendientes ({contadores.pendiente})
        </button>
        <button
          className={filtroEstado === 'aprobada' ? 'filtro-active' : 'filtro-inactive'}
          onClick={() => setFiltroEstado('aprobada')}
        >
          ✅ Aprobadas ({contadores.aprobada})
        </button>
        <button
          className={filtroEstado === 'procesada' ? 'filtro-active' : 'filtro-inactive'}
          onClick={() => setFiltroEstado('procesada')}
        >
          📋 Procesadas ({contadores.procesada})
        </button>
      </div>

      {/* LISTA DE SOLICITUDES */}
      <div className="solicitudes-admin-list">
        {solicitudesFiltradas.length === 0 ? (
          <div className="empty-state">
            No hay solicitudes con estado: <strong>{filtroEstado}</strong>
          </div>
        ) : (
          solicitudesFiltradas.map((solicitud) => (
            <div key={`${solicitud.socioEmail}-${solicitud.id}`} className="solicitud-admin-card">
              <div className="solicitud-main">
                <div className="solicitud-info">
                  <h3>
                    {solicitud.armaDetalles.marca} {solicitud.armaDetalles.modelo}
                  </h3>
                  <p className="socio-name">👤 {solicitud.nombreSolicitante}</p>
                  <div className="arma-details-compact">
                    <span>Matrícula: {solicitud.armaDetalles.matricula}</span>
                    <span>•</span>
                    <span>Folio: {solicitud.armaDetalles.folio}</span>
                    <span>•</span>
                    <span className="motivo-compact">{getMotivoBadge(solicitud.motivo)}</span>
                  </div>
                  {solicitud.receptor && (
                    <div className="receptor-info-compact">
                      📤 → {solicitud.receptor.nombre}
                      {solicitud.receptor.esSocioClub && <span className="socio-tag-small">Socio</span>}
                    </div>
                  )}
                </div>
                <div className="solicitud-actions-compact">
                  <button className="btn-ver-detalles" onClick={() => abrirDetalles(solicitud)}>
                    👁️ Ver detalles
                  </button>
                  {solicitud.estado === 'pendiente' && (
                    <button className="btn-aprobar" onClick={() => handleAprobar(solicitud)}>
                      ✅ Aprobar
                    </button>
                  )}
                  {solicitud.estado === 'aprobada' && (
                    <>
                      <button className="btn-oficio" onClick={() => generarOficioZM(solicitud)}>
                        📄 Oficio 32 ZM
                      </button>
                      <button className="btn-oficio" onClick={() => generarOficioDN27(solicitud)}>
                        📄 Oficio DN27
                      </button>
                      <button className="btn-procesar" onClick={() => handleMarcarProcesada(solicitud)}>
                        ✔️ Marcar Procesada
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="fecha-solicitud-admin">
                Solicitado: {solicitud.fechaSolicitud?.toDate?.()?.toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE DETALLES */}
      {vistaModal && solicitudSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de Solicitud de Baja</h2>
              <button className="btn-close-modal" onClick={cerrarModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* SOCIO */}
              <div className="detail-section">
                <h3>👤 Socio Solicitante</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{solicitudSeleccionada.nombreSolicitante}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{solicitudSeleccionada.socioEmail}</span>
                  </div>
                </div>
              </div>

              {/* ARMA */}
              <div className="detail-section">
                <h3>🔫 Datos del Arma</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Clase:</span>
                    <span className="detail-value">{solicitudSeleccionada.armaDetalles.clase}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Calibre:</span>
                    <span className="detail-value">{solicitudSeleccionada.armaDetalles.calibre}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Marca:</span>
                    <span className="detail-value">{solicitudSeleccionada.armaDetalles.marca}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Modelo:</span>
                    <span className="detail-value">{solicitudSeleccionada.armaDetalles.modelo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Matrícula:</span>
                    <span className="detail-value">{solicitudSeleccionada.armaDetalles.matricula}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Folio SEDENA:</span>
                    <span className="detail-value">{solicitudSeleccionada.armaDetalles.folio}</span>
                  </div>
                </div>
              </div>

              {/* BAJA */}
              <div className="detail-section">
                <h3>📋 Datos de la Baja</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Motivo:</span>
                    {getMotivoBadge(solicitudSeleccionada.motivo)}
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de baja:</span>
                    <span className="detail-value">{solicitudSeleccionada.fechaBaja}</span>
                  </div>
                </div>
                {solicitudSeleccionada.observaciones && (
                  <div className="observaciones-modal">
                    <span className="detail-label">Observaciones:</span>
                    <p>{solicitudSeleccionada.observaciones}</p>
                  </div>
                )}
              </div>

              {/* RECEPTOR */}
              {solicitudSeleccionada.receptor && (
                <div className="detail-section">
                  <h3>📤 Comprador/Receptor</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Nombre:</span>
                      <span className="detail-value">{solicitudSeleccionada.receptor.nombre}</span>
                    </div>
                    {solicitudSeleccionada.receptor.curp && (
                      <div className="detail-item">
                        <span className="detail-label">CURP:</span>
                        <span className="detail-value">{solicitudSeleccionada.receptor.curp}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">¿Es socio del club?</span>
                      <span className="detail-value">
                        {solicitudSeleccionada.receptor.esSocioClub ? '✅ Sí' : '❌ No'}
                      </span>
                    </div>
                    {solicitudSeleccionada.receptor.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{solicitudSeleccionada.receptor.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TRANSFERENCIA OFICIAL */}
              {solicitudSeleccionada.transferencia && (
                <div className="detail-section">
                  <h3>📄 Registro de Transferencia SEDENA</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Folio:</span>
                      <span className="detail-value">{solicitudSeleccionada.transferencia.folio}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Zona Militar:</span>
                      <span className="detail-value">{solicitudSeleccionada.transferencia.zonaMilitar}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fecha:</span>
                      <span className="detail-value">{solicitudSeleccionada.transferencia.fecha}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={cerrarModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMotivoBadge(motivo) {
  const motivos = {
    'venta': { text: '💰 Venta', class: 'motivo-venta' },
    'transferencia': { text: '👥 Transferencia', class: 'motivo-transferencia' },
    'perdida': { text: '❓ Extravío', class: 'motivo-perdida' },
    'robo': { text: '⚠️ Robo', class: 'motivo-robo' },
    'destruccion': { text: '🔨 Destrucción', class: 'motivo-destruccion' }
  };
  const m = motivos[motivo] || { text: motivo, class: '' };
  return <span className={`motivo-badge ${m.class}`}>{m.text}</span>;
}

export default AdminBajasArsenal;

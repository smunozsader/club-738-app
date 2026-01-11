import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, getDocs, doc, updateDoc, getDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import './AdminAltasArsenal.css';

/**
 * Panel administrativo para gestionar solicitudes de alta de armas
 * Solo accesible por el secretario
 */
function AdminAltasArsenal() {
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

      // Para cada socio, obtener sus solicitudes de alta
      for (const socioDoc of sociosSnap.docs) {
        const solicitudesRef = collection(db, 'socios', socioDoc.id, 'solicitudesAlta');
        const solicitudesSnap = await getDocs(solicitudesRef);

        solicitudesSnap.forEach((solDoc) => {
          const data = solDoc.data();
          allSolicitudes.push({
            id: solDoc.id,
            socioEmail: socioDoc.id,
            nombreSolicitante: socioDoc.data().nombre || 'Sin nombre',
            // Si está guardado en armaDetalles, lo copian al nivel superior
            clase: data.armaDetalles?.clase || data.clase || '',
            calibre: data.armaDetalles?.calibre || data.calibre || '',
            marca: data.armaDetalles?.marca || data.marca || '',
            modelo: data.armaDetalles?.modelo || data.modelo || '',
            matricula: data.armaDetalles?.matricula || data.matricula || '',
            folio: data.armaDetalles?.folio || data.folio || '',
            modalidad: data.armaDetalles?.modalidad || data.modalidad || 'tiro',
            ...data
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
    if (!window.confirm(`¿Aprobar el alta de arma para ${solicitud.nombreSolicitante}?`)) {
      return;
    }

    try {
      setLoading(true);
      const solicitudRef = doc(db, 'socios', solicitud.socioEmail, 'solicitudesAlta', solicitud.id);
      
      // Actualizar estado de la solicitud
      await updateDoc(solicitudRef, {
        estado: 'aprobada',
        fechaAprobacion: serverTimestamp(),
        aprobadoPor: auth.currentUser.email
      });

      alert('✅ Solicitud de alta aprobada. Ahora procesa el registro del arma en SEDENA.');
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      alert('Error al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarRegistrada = async (solicitud) => {
    if (!window.confirm(`¿Marcar como registrada? (Arma ya tramitada ante SEDENA)`)) {
      return;
    }

    try {
      setLoading(true);
      const solicitudRef = doc(db, 'socios', solicitud.socioEmail, 'solicitudesAlta', solicitud.id);
      
      // Actualizar estado de la solicitud
      await updateDoc(solicitudRef, {
        estado: 'registrada',
        fechaRegistro: serverTimestamp(),
        registradoPor: auth.currentUser.email
      });

      // Ahora agregar el arma al arsenal del socio (subcolección armas)
      // Para esto necesitamos los datos del arma
      if (solicitud.clase && solicitud.marca && solicitud.modelo) {
        const armasRef = collection(db, 'socios', solicitud.socioEmail, 'armas');
        const nuevoArmaId = doc(armasRef).id;

        await addDoc(armasRef, {
          clase: solicitud.clase,
          calibre: solicitud.calibre || '',
          marca: solicitud.marca,
          modelo: solicitud.modelo,
          matricula: solicitud.matricula || '',
          folio: solicitud.folio || '',
          modalidad: solicitud.modalidad || 'tiro',
          fechaAlta: serverTimestamp(),
          altaPor: auth.currentUser.email
        });

        // Actualizar totalArmas del socio
        const socioRef = doc(db, 'socios', solicitud.socioEmail);
        const socioDoc = await getDoc(socioRef);
        const totalArmasActual = socioDoc.data().totalArmas || 0;
        
        await updateDoc(socioRef, {
          totalArmas: totalArmasActual + 1
        });
      }

      alert('✅ Solicitud registrada y arma agregada al arsenal del socio.');
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error al registrar solicitud:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async (solicitud) => {
    const razonRechazo = window.prompt('¿Motivo del rechazo?');
    if (!razonRechazo) return;

    try {
      setLoading(true);
      const solicitudRef = doc(db, 'socios', solicitud.socioEmail, 'solicitudesAlta', solicitud.id);
      
      await updateDoc(solicitudRef, {
        estado: 'rechazada',
        fechaRechazo: serverTimestamp(),
        rechazadaPor: auth.currentUser.email,
        razonRechazo: razonRechazo
      });

      alert('❌ Solicitud rechazada.');
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
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
    registrada: solicitudes.filter(s => s.estado === 'registrada').length,
    rechazada: solicitudes.filter(s => s.estado === 'rechazada').length
  };

  if (loading) {
    return (
      <div className="admin-altas-container">
        <div className="loading-spinner">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="admin-altas-container">
      <header className="admin-header">
        <h1>📝 Gestión de Altas de Arsenal</h1>
        <p className="subtitle">Administración de solicitudes de alta de armas nuevas</p>
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
        <div className="contador-card registrada">
          <div className="contador-num">{contadores.registrada}</div>
          <div className="contador-label">Registradas</div>
        </div>
        <div className="contador-card rechazada">
          <div className="contador-num">{contadores.rechazada}</div>
          <div className="contador-label">Rechazadas</div>
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
          className={filtroEstado === 'registrada' ? 'filtro-active' : 'filtro-inactive'}
          onClick={() => setFiltroEstado('registrada')}
        >
          📋 Registradas ({contadores.registrada})
        </button>
        <button
          className={filtroEstado === 'rechazada' ? 'filtro-active' : 'filtro-inactive'}
          onClick={() => setFiltroEstado('rechazada')}
        >
          ❌ Rechazadas ({contadores.rechazada})
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
                    {solicitud.marca || 'Sin datos'} {solicitud.modelo || ''}
                  </h3>
                  <p className="socio-name">👤 {solicitud.nombreSolicitante}</p>
                  <div className="arma-details-compact">
                    <span>Clase: {solicitud.clase || 'N/A'}</span>
                    <span>•</span>
                    <span>Calibre: {solicitud.calibre || 'N/A'}</span>
                    {solicitud.matricula && (
                      <>
                        <span>•</span>
                        <span>Matrícula: {solicitud.matricula}</span>
                      </>
                    )}
                  </div>
                  {solicitud.modalidad && (
                    <div className="modalidad-badge">
                      📌 Modalidad: {solicitud.modalidad === 'ambas' ? 'Caza y Tiro' : solicitud.modalidad === 'caza' ? 'Caza' : 'Tiro'}
                    </div>
                  )}
                </div>
                <div className="solicitud-actions-compact">
                  <button className="btn-ver-detalles" onClick={() => abrirDetalles(solicitud)}>
                    👁️ Ver detalles
                  </button>
                  {solicitud.estado === 'pendiente' && (
                    <>
                      <button className="btn-aprobar" onClick={() => handleAprobar(solicitud)}>
                        ✅ Aprobar
                      </button>
                      <button className="btn-rechazar" onClick={() => handleRechazar(solicitud)}>
                        ❌ Rechazar
                      </button>
                    </>
                  )}
                  {solicitud.estado === 'aprobada' && (
                    <button className="btn-registrar" onClick={() => handleMarcarRegistrada(solicitud)}>
                      📋 Marcar Registrada
                    </button>
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
              <h2>Detalles de Solicitud de Alta</h2>
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
                    <span className="detail-value">{solicitudSeleccionada.clase || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Calibre:</span>
                    <span className="detail-value">{solicitudSeleccionada.calibre || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Marca:</span>
                    <span className="detail-value">{solicitudSeleccionada.marca || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Modelo:</span>
                    <span className="detail-value">{solicitudSeleccionada.modelo || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Matrícula:</span>
                    <span className="detail-value">{solicitudSeleccionada.matricula || 'Pendiente de registrar'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Folio SEDENA:</span>
                    <span className="detail-value">{solicitudSeleccionada.folio || 'Pendiente de registrar'}</span>
                  </div>
                </div>
              </div>

              {/* MODALIDAD */}
              <div className="detail-section">
                <h3>📌 Modalidad de Uso</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Uso permitido:</span>
                    <span className="detail-value">
                      {solicitudSeleccionada.modalidad === 'caza' ? '🦆 Caza' : solicitudSeleccionada.modalidad === 'tiro' ? '🎯 Tiro Práctico' : '🦆 Caza y 🎯 Tiro'}
                    </span>
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES */}
              {solicitudSeleccionada.observaciones && (
                <div className="detail-section">
                  <h3>📝 Observaciones</h3>
                  <div className="observaciones-modal">
                    <p>{solicitudSeleccionada.observaciones}</p>
                  </div>
                </div>
              )}

              {/* ESTADO ACTUAL */}
              <div className="detail-section">
                <h3>📊 Estado de la Solicitud</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Estado actual:</span>
                    <span className="detail-value">
                      {solicitudSeleccionada.estado === 'pendiente' && '⏳ Pendiente'}
                      {solicitudSeleccionada.estado === 'aprobada' && '✅ Aprobada'}
                      {solicitudSeleccionada.estado === 'registrada' && '📋 Registrada'}
                      {solicitudSeleccionada.estado === 'rechazada' && '❌ Rechazada'}
                    </span>
                  </div>
                  {solicitudSeleccionada.fechaAprobacion && (
                    <div className="detail-item">
                      <span className="detail-label">Aprobada el:</span>
                      <span className="detail-value">{solicitudSeleccionada.fechaAprobacion?.toDate?.()?.toLocaleDateString('es-MX')}</span>
                    </div>
                  )}
                  {solicitudSeleccionada.fechaRegistro && (
                    <div className="detail-item">
                      <span className="detail-label">Registrada el:</span>
                      <span className="detail-value">{solicitudSeleccionada.fechaRegistro?.toDate?.()?.toLocaleDateString('es-MX')}</span>
                    </div>
                  )}
                  {solicitudSeleccionada.razonRechazo && (
                    <div className="detail-item">
                      <span className="detail-label">Razón del rechazo:</span>
                      <span className="detail-value">{solicitudSeleccionada.razonRechazo}</span>
                    </div>
                  )}
                </div>
              </div>
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

export default AdminAltasArsenal;

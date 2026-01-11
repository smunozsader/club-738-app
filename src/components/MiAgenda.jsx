import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import './MiAgenda.css';

/**
 * Panel del Secretario - Gestión de Citas
 * Ver todas las citas, confirmar, cancelar, marcar como completadas
 * Gestionar bloques de disponibilidad
 */
function MiAgenda({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [citas, setCitas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas'); // todas, pendiente, confirmada, completada
  const [filtroFecha, setFiltroFecha] = useState('proximas'); // proximas, pasadas, hoy
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Contadores
  const [contadores, setContadores] = useState({
    pendientes: 0,
    confirmadas: 0,
    hoy: 0,
    totales: 0
  });

  useEffect(() => {
    cargarCitas();
  }, []);

  useEffect(() => {
    calcularContadores();
  }, [citas]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const citasRef = collection(db, 'citas');
      const citasSnap = await getDocs(citasRef);
      
      const citasData = [];
      citasSnap.forEach((doc) => {
        citasData.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar por fecha y hora
      citasData.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaB - fechaA; // Más recientes primero
      });

      setCitas(citasData);
    } catch (error) {
      console.error('Error cargando citas:', error);
      alert('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const calcularContadores = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];

    setContadores({
      pendientes: citas.filter(c => c.estado === 'pendiente').length,
      confirmadas: citas.filter(c => c.estado === 'confirmada').length,
      hoy: citas.filter(c => c.fecha === hoyStr && c.estado !== 'cancelada').length,
      totales: citas.length
    });
  };

  const confirmarCita = async (citaId) => {
    if (!window.confirm('¿Confirmar esta cita?')) return;

    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, {
        estado: 'confirmada'
      });
      
      alert('✅ Cita confirmada. El socio recibirá una notificación.');
      await cargarCitas();
      setMostrarModal(false);
    } catch (error) {
      console.error('Error confirmando cita:', error);
      alert('Error al confirmar la cita');
    }
  };

  const cancelarCita = async (citaId) => {
    const motivo = prompt('Motivo de cancelación (opcional):');
    
    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, {
        estado: 'cancelada',
        motivoCancelacion: motivo || 'Sin especificar'
      });
      
      alert('❌ Cita cancelada. El socio recibirá una notificación.');
      await cargarCitas();
      setMostrarModal(false);
    } catch (error) {
      console.error('Error cancelando cita:', error);
      alert('Error al cancelar la cita');
    }
  };

  const marcarCompletada = async (citaId) => {
    if (!window.confirm('¿Marcar esta cita como completada?')) return;

    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, {
        estado: 'completada',
        fechaCompletada: new Date().toISOString()
      });
      
      alert('✔️ Cita marcada como completada.');
      await cargarCitas();
      setMostrarModal(false);
    } catch (error) {
      console.error('Error marcando cita:', error);
      alert('Error al marcar la cita como completada');
    }
  };

  const filtrarCitas = () => {
    let citasFiltradas = [...citas];

    // Filtro por estado
    if (filtroEstado !== 'todas') {
      citasFiltradas = citasFiltradas.filter(c => c.estado === filtroEstado);
    }

    // Filtro por fecha
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];

    if (filtroFecha === 'hoy') {
      citasFiltradas = citasFiltradas.filter(c => c.fecha === hoyStr);
    } else if (filtroFecha === 'proximas') {
      citasFiltradas = citasFiltradas.filter(c => c.fecha >= hoyStr);
    } else if (filtroFecha === 'pasadas') {
      citasFiltradas = citasFiltradas.filter(c => c.fecha < hoyStr);
    }

    return citasFiltradas;
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { text: '⏳ Pendiente', class: 'badge-pendiente' },
      'confirmada': { text: '✅ Confirmada', class: 'badge-confirmada' },
      'cancelada': { text: '❌ Cancelada', class: 'badge-cancelada' },
      'completada': { text: '✔️ Completada', class: 'badge-completada' }
    };
    const badge = badges[estado] || badges['pendiente'];
    return <span className={`estado-badge ${badge.class}`}>{badge.text}</span>;
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

  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setCitaSeleccionada(null);
  };

  const citasFiltradas = filtrarCitas();

  return (
    <div className="mi-agenda-container">
      <header className="agenda-header">
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Volver
          </button>
        )}
        <h1>📅 Mi Agenda - Gestión de Citas</h1>
        <p className="subtitle">Panel de administración de citas de socios</p>
      </header>

      {/* CONTADORES */}
      <div className="contadores-grid">
        <div className="contador-card pendientes">
          <div className="contador-numero">{contadores.pendientes}</div>
          <div className="contador-label">⏳ Pendientes</div>
        </div>
        <div className="contador-card confirmadas">
          <div className="contador-numero">{contadores.confirmadas}</div>
          <div className="contador-label">✅ Confirmadas</div>
        </div>
        <div className="contador-card hoy">
          <div className="contador-numero">{contadores.hoy}</div>
          <div className="contador-label">📆 Hoy</div>
        </div>
        <div className="contador-card totales">
          <div className="contador-numero">{contadores.totales}</div>
          <div className="contador-label">📊 Total</div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Estado:</label>
          <div className="filtro-tabs">
            <button
              className={`tab-btn ${filtroEstado === 'todas' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('todas')}
            >
              Todas
            </button>
            <button
              className={`tab-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('pendiente')}
            >
              Pendientes
            </button>
            <button
              className={`tab-btn ${filtroEstado === 'confirmada' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('confirmada')}
            >
              Confirmadas
            </button>
            <button
              className={`tab-btn ${filtroEstado === 'completada' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('completada')}
            >
              Completadas
            </button>
          </div>
        </div>

        <div className="filtro-grupo">
          <label>Período:</label>
          <div className="filtro-tabs">
            <button
              className={`tab-btn ${filtroFecha === 'hoy' ? 'active' : ''}`}
              onClick={() => setFiltroFecha('hoy')}
            >
              Hoy
            </button>
            <button
              className={`tab-btn ${filtroFecha === 'proximas' ? 'active' : ''}`}
              onClick={() => setFiltroFecha('proximas')}
            >
              Próximas
            </button>
            <button
              className={`tab-btn ${filtroFecha === 'pasadas' ? 'active' : ''}`}
              onClick={() => setFiltroFecha('pasadas')}
            >
              Pasadas
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE CITAS */}
      <div className="citas-section">
        <div className="section-header">
          <h2>Citas ({citasFiltradas.length})</h2>
          <button className="btn-refresh" onClick={cargarCitas} disabled={loading}>
            {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
          </button>
        </div>

        {citasFiltradas.length === 0 ? (
          <div className="empty-state">
            <p>No hay citas con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="citas-table">
            <div className="table-header">
              <div className="th fecha">Fecha</div>
              <div className="th hora">Hora</div>
              <div className="th socio">Socio</div>
              <div className="th proposito">Propósito</div>
              <div className="th estado">Estado</div>
              <div className="th acciones">Acciones</div>
            </div>
            {citasFiltradas.map((cita) => {
              const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
              const esPasada = fechaCita < new Date();
              
              return (
                <div key={cita.id} className={`table-row ${esPasada ? 'row-pasada' : ''}`}>
                  <div className="td fecha">
                    {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="td hora">🕐 {cita.hora}</div>
                  <div className="td socio">
                    <div className="socio-nombre">{cita.socioNombre}</div>
                    <div className="socio-email">{cita.socioEmail}</div>
                  </div>
                  <div className="td proposito">
                    {getPropositoIcon(cita.proposito)} {getPropositoNombre(cita.proposito)}
                  </div>
                  <div className="td estado">
                    {getEstadoBadge(cita.estado)}
                  </div>
                  <div className="td acciones">
                    <button
                      className="btn-ver"
                      onClick={() => abrirModal(cita)}
                    >
                      👁️ Ver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      {mostrarModal && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Cita</h2>
              <button className="btn-close" onClick={cerrarModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Información del socio */}
              <div className="info-section">
                <h3>👤 Socio</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nombre:</label>
                    <span>{citaSeleccionada.socioNombre}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{citaSeleccionada.socioEmail}</span>
                  </div>
                </div>
              </div>

              {/* Información de la cita */}
              <div className="info-section">
                <h3>📅 Cita</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Fecha:</label>
                    <span>
                      {new Date(citaSeleccionada.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Hora:</label>
                    <span>🕐 {citaSeleccionada.hora} hrs</span>
                  </div>
                  <div className="info-item">
                    <label>Propósito:</label>
                    <span>
                      {getPropositoIcon(citaSeleccionada.proposito)} {getPropositoNombre(citaSeleccionada.proposito)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span>{getEstadoBadge(citaSeleccionada.estado)}</span>
                  </div>
                </div>

                {citaSeleccionada.notas && (
                  <div className="info-item full-width">
                    <label>Notas:</label>
                    <div className="notas-box">
                      {citaSeleccionada.notas}
                    </div>
                  </div>
                )}

                {citaSeleccionada.motivoCancelacion && (
                  <div className="info-item full-width">
                    <label>Motivo de cancelación:</label>
                    <div className="notas-box cancelacion">
                      {citaSeleccionada.motivoCancelacion}
                    </div>
                  </div>
                )}
              </div>

              {/* Google Calendar */}
              {citaSeleccionada.calendarEventId && (
                <div className="info-section">
                  <h3>🗓️ Google Calendar</h3>
                  <div className="info-item">
                    <label>Event ID:</label>
                    <span className="code">{citaSeleccionada.calendarEventId}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="modal-footer">
              {citaSeleccionada.estado === 'pendiente' && (
                <>
                  <button
                    className="btn-confirmar"
                    onClick={() => confirmarCita(citaSeleccionada.id)}
                  >
                    ✅ Confirmar Cita
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={() => cancelarCita(citaSeleccionada.id)}
                  >
                    ❌ Cancelar Cita
                  </button>
                </>
              )}

              {citaSeleccionada.estado === 'confirmada' && (
                <>
                  <button
                    className="btn-completar"
                    onClick={() => marcarCompletada(citaSeleccionada.id)}
                  >
                    ✔️ Marcar Completada
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={() => cancelarCita(citaSeleccionada.id)}
                  >
                    ❌ Cancelar Cita
                  </button>
                </>
              )}

              <button className="btn-cerrar" onClick={cerrarModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiAgenda;

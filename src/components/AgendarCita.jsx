import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useToastContext } from '../contexts/ToastContext';
import './AgendarCita.css';

/**
 * Módulo de Agendamiento de Citas
 * Permite a los socios agendar citas con el secretario
 * Se integra con Google Calendar del secretario
 */
function AgendarCita({ onBack }) {
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [socioData, setSocioData] = useState(null);
  const [misCitas, setMisCitas] = useState([]);
  
  // Formulario
  const [formCita, setFormCita] = useState({
    fecha: '',
    hora: '',
    proposito: '',
    notas: ''
  });

  // Slots disponibles
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Cargar datos del socio
      const socioRef = doc(db, 'socios', user.email);
      const socioSnap = await getDoc(socioRef);
      if (socioSnap.exists()) {
        setSocioData(socioSnap.data());
      }

      // Cargar citas del socio
      const citasRef = collection(db, 'citas');
      const q = query(citasRef, where('socioEmail', '==', user.email));
      const citasSnap = await getDocs(q);
      
      const citasData = [];
      citasSnap.forEach((doc) => {
        citasData.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar por fecha descendente
      citasData.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaB - fechaA;
      });
      
      setMisCitas(citasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const generarSlotsDisponibles = async (fecha) => {
    // Horario de atención: Lunes a Viernes, 17:00 - 20:00 (5 PM - 8 PM)
    // Citas de 45 minutos + 15 minutos de descanso = slots cada 60 minutos
    const slots = [];
    const dia = new Date(fecha + 'T00:00:00');
    const diaSemana = dia.getDay(); // 0=Domingo, 6=Sábado
    
    // Solo días laborables
    if (diaSemana === 0 || diaSemana === 6) {
      return [];
    }

    // Horarios base posibles: 17:00, 18:00, 19:00
    const horasBase = ['17:00', '18:00', '19:00'];

    // Verificar cuáles están ocupados
    try {
      const citasRef = collection(db, 'citas');
      const citasOcupadas = [];

      // Verificar cada hora
      for (const hora of horasBase) {
        const q = query(
          citasRef,
          where('fecha', '==', fecha),
          where('hora', '==', hora),
          where('estado', '!=', 'cancelada')
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Slot disponible
          slots.push(hora);
        }
      }
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      // Si hay error, mostrar todos los slots (mejor no dejar vacío)
      return horasBase;
    }

    return slots;
  };

  const handleFechaChange = async (fecha) => {
    setFormCita({ ...formCita, fecha, hora: '' });
    setLoading(true);
    const slots = await generarSlotsDisponibles(fecha);
    setSlotsDisponibles(slots);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formCita.fecha || !formCita.hora || !formCita.proposito) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar que la fecha no sea pasada
    const fechaCita = new Date(`${formCita.fecha}T${formCita.hora}`);
    const ahora = new Date();
    if (fechaCita < ahora) {
      alert('No puedes agendar citas en el pasado');
      return;
    }

    // Validar que sea día laborable
    const dia = fechaCita.getDay();
    if (dia === 0 || dia === 6) {
      alert('Solo se pueden agendar citas de lunes a viernes');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      // Verificar que no haya otra cita en ese horario
      const citasRef = collection(db, 'citas');
      const q = query(
        citasRef,
        where('fecha', '==', formCita.fecha),
        where('hora', '==', formCita.hora),
        where('estado', '!=', 'cancelada')
      );
      const citasExistentes = await getDocs(q);

      if (!citasExistentes.empty) {
        alert('Ese horario ya está ocupado. Por favor selecciona otro.');
        setLoading(false);
        return;
      }

      // Crear cita en Firestore
      await addDoc(collection(db, 'citas'), {
        socioEmail: user.email,
        socioNombre: socioData?.nombre || user.email,
        fecha: formCita.fecha,
        hora: formCita.hora,
        proposito: formCita.proposito,
        notas: formCita.notas,
        estado: 'pendiente', // pendiente, confirmada, cancelada, completada
        fechaCreacion: serverTimestamp(),
        // La Firebase Function creará el evento en Google Calendar
        calendarEventId: null // Se llenará por la Function
      });

      showToast('✅ Cita agendada exitosamente. Recibirás invitación de Google Calendar.', 'success', 5000);

      // Resetear formulario
      setFormCita({
        fecha: '',
        hora: '',
        proposito: '',
        notas: ''
      });
      setSlotsDisponibles([]);

      // Recargar citas
      await cargarDatos();

    } catch (error) {
      console.error('Error agendando cita:', error);
      showToast('❌ Error al agendar la cita. Intenta nuevamente.', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { text: '⏳ Pendiente confirmación', class: 'badge-pendiente' },
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

  // Obtener fecha mínima (hoy + 1 día)
  const getFechaMinima = () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  };

  // Obtener fecha máxima (3 meses adelante)
  const getFechaMaxima = () => {
    const tresMeses = new Date();
    tresMeses.setMonth(tresMeses.getMonth() + 3);
    return tresMeses.toISOString().split('T')[0];
  };

  return (
    <div className="agendar-cita-container">
      <header className="cita-header">
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Volver
          </button>
        )}
        <h1>📅 Agendar Cita con el Secretario</h1>
        <p className="subtitle">Agenda tu cita para entrega de documentos, pagos o consultas</p>
      </header>

      <div className="cita-content">
        {/* FORMULARIO DE AGENDAMIENTO */}
        <div className="form-section">
          <h2>Nueva Cita</h2>
          <form onSubmit={handleSubmit} className="form-cita">
            {/* FECHA */}
            <div className="form-group">
              <label htmlFor="fecha">
                📆 Fecha <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                value={formCita.fecha}
                onChange={(e) => handleFechaChange(e.target.value)}
                min={getFechaMinima()}
                max={getFechaMaxima()}
                required
              />
              <small className="help-text">
                Solo días laborables (lunes a viernes)
              </small>
            </div>

            {/* HORA */}
            {formCita.fecha && (
              <div className="form-group">
                <label htmlFor="hora">
                  🕐 Horario <span className="required">*</span>
                </label>
                {loading ? (
                  <p className="loading-slots">⏳ Verificando disponibilidad...</p>
                ) : slotsDisponibles.length > 0 ? (
                  <div className="slots-grid">
                    {slotsDisponibles.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`slot-btn ${formCita.hora === slot ? 'slot-selected' : ''}`}
                        onClick={() => setFormCita({ ...formCita, hora: slot })}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots">
                    {new Date(formCita.fecha + 'T00:00:00').getDay() === 0 || 
                     new Date(formCita.fecha + 'T00:00:00').getDay() === 6
                      ? '❌ No hay horarios disponibles en fines de semana'
                      : '❌ Todos los horarios están ocupados en esta fecha. Selecciona otra fecha.'}
                  </p>
                )}
                <small className="help-text">
                  Horario de atención: 17:00 - 20:00 hrs (5 PM - 8 PM)
                </small>
              </div>
            )}

            {/* PROPÓSITO */}
            <div className="form-group">
              <label htmlFor="proposito">
                🎯 Propósito de la Cita <span className="required">*</span>
              </label>
              <select
                id="proposito"
                value={formCita.proposito}
                onChange={(e) => setFormCita({ ...formCita, proposito: e.target.value })}
                required
              >
                <option value="">-- Selecciona --</option>
                <option value="peta">🎯 Trámite PETA (entrega documentos)</option>
                <option value="pago">💰 Pago de membresía/cuotas</option>
                <option value="documentos">📄 Entrega de documentos</option>
                <option value="consulta">💬 Consulta general</option>
                <option value="otro">📌 Otro</option>
              </select>
            </div>

            {/* NOTAS */}
            <div className="form-group">
              <label htmlFor="notas">
                📝 Notas adicionales (opcional)
              </label>
              <textarea
                id="notas"
                value={formCita.notas}
                onChange={(e) => setFormCita({ ...formCita, notas: e.target.value })}
                rows="3"
                placeholder="Ej: Llevaré documentos originales de PETA, necesito factura, etc."
              />
            </div>

            {/* INFO BOX */}
            <div className="info-box">
              <h4>📌 Importante:</h4>
              <ul>
                <li>Las citas deben agendarse con al menos <strong>24 horas de anticipación</strong></li>
                <li>Horario de atención: <strong>Lunes a Viernes, 17:00 - 20:00 hrs (5 PM - 8 PM)</strong></li>
                <li>Duración de la cita: <strong>45 minutos</strong> (+ 15 min para descanso)</li>
                <li>Recibirás una <strong>invitación de Google Calendar</strong> al confirmar</li>
                <li>Si necesitas cancelar, hazlo con al menos <strong>2 horas de anticipación</strong></li>
              </ul>
            </div>

            {/* SUBMIT */}
            <button type="submit" className="btn-agendar" disabled={loading}>
              {loading ? 'Agendando...' : '📅 Agendar Cita'}
            </button>
          </form>
        </div>

        {/* MIS CITAS */}
        <div className="mis-citas-section">
          <h2>Mis Citas</h2>
          {misCitas.length === 0 ? (
            <div className="empty-citas">
              <p>No tienes citas agendadas</p>
            </div>
          ) : (
            <div className="citas-list">
              {misCitas.map((cita) => {
                const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
                const esFutura = fechaCita > new Date();
                
                return (
                  <div key={cita.id} className={`cita-card ${!esFutura ? 'cita-pasada' : ''}`}>
                    <div className="cita-header-card">
                      <div className="cita-fecha">
                        <div className="fecha-dia">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', { 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="fecha-mes">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', { 
                            month: 'short' 
                          }).toUpperCase()}
                        </div>
                      </div>
                      <div className="cita-info">
                        <div className="cita-hora">🕐 {cita.hora} hrs</div>
                        <div className="cita-proposito">
                          {getPropositoIcon(cita.proposito)} {cita.proposito === 'peta' ? 'Trámite PETA' :
                           cita.proposito === 'pago' ? 'Pago de membresía' :
                           cita.proposito === 'documentos' ? 'Entrega documentos' :
                           cita.proposito === 'consulta' ? 'Consulta general' : 'Otro'}
                        </div>
                        {cita.notas && (
                          <div className="cita-notas">
                            <small>📝 {cita.notas}</small>
                          </div>
                        )}
                      </div>
                      <div className="cita-estado">
                        {getEstadoBadge(cita.estado)}
                      </div>
                    </div>
                    {esFutura && cita.estado === 'pendiente' && (
                      <div className="cita-footer">
                        <small className="cita-aviso">
                          ⏳ Esperando confirmación del secretario
                        </small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgendarCita;

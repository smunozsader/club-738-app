/**
 * MisPETAs - Vista de solicitudes PETA del socio
 * 
 * Muestra:
 * - Lista de PETAs solicitados
 * - Estado de cada solicitud
 * - Historial de cambios
 * - Descargar oficio PDF (cuando esté generado)
 */
import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './MisPETAs.css';

const ESTADOS_LABELS = {
  'documentacion_proceso': { label: 'Documentación en proceso', icon: '🟡', color: 'warning' },
  'documentacion_completa': { label: 'Documentación completa', icon: '🟢', color: 'success' },
  'enviado_32zm': { label: 'Enviado a 32 ZM', icon: '📤', color: 'info' },
  'revision_sedena': { label: 'En revisión SEDENA', icon: '⏳', color: 'info' },
  'aprobado': { label: 'PETA aprobado', icon: '✅', color: 'success' },
  'rechazado': { label: 'Rechazado', icon: '❌', color: 'danger' }
};

const TIPO_LABELS = {
  'tiro': 'Práctica de Tiro',
  'competencia': 'Competencia Nacional',
  'caza': 'Caza'
};

export default function MisPETAs({ userEmail, onNuevoPETA, onBack }) {
  const [petas, setPetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [petaExpandido, setPetaExpandido] = useState(null);

  useEffect(() => {
    cargarPETAs();
  }, [userEmail]);

  const cargarPETAs = async () => {
    try {
      setLoading(true);
      const petasRef = collection(db, 'socios', userEmail.toLowerCase(), 'petas');
      const q = query(petasRef, orderBy('fechaCreacion', 'desc'));
      const snapshot = await getDocs(q);
      
      const petasList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPetas(petasList);
    } catch (error) {
      console.error('Error cargando PETAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearFechaCorta = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleExpandir = (petaId) => {
    setPetaExpandido(petaExpandido === petaId ? null : petaId);
  };

  if (loading) {
    return <div className="loading">Cargando tus solicitudes PETA...</div>;
  }

  return (
    <div className="mis-petas-container">
      <div className="mis-petas-header">
        <h2>🎯 Mis Solicitudes PETA</h2>
        <button className="btn-nuevo-peta" onClick={onNuevoPETA}>
          + Solicitar Nuevo PETA
        </button>
      </div>

      {petas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tienes solicitudes PETA</h3>
          <p>Comienza solicitando tu primer Permiso Extraordinario de Transporte de Armas</p>
          <button className="btn-primary" onClick={onNuevoPETA}>
            Solicitar mi primer PETA
          </button>
        </div>
      ) : (
        <div className="petas-list">
          {petas.map(peta => {
            const estadoInfo = ESTADOS_LABELS[peta.estado] || ESTADOS_LABELS['documentacion_proceso'];
            const expandido = petaExpandido === peta.id;
            
            return (
              <div key={peta.id} className={`peta-card estado-${estadoInfo.color}`}>
                {/* Header */}
                <div className="peta-card-header" onClick={() => toggleExpandir(peta.id)}>
                  <div className="peta-titulo">
                    <span className="peta-icono">{estadoInfo.icon}</span>
                    <div>
                      <h3>PETA {TIPO_LABELS[peta.tipo]} - {peta.vigenciaInicio?.toDate().getFullYear()}</h3>
                      <p className="peta-estado">{estadoInfo.label}</p>
                    </div>
                  </div>
                  <button className="btn-expandir">
                    {expandido ? '▲' : '▼'}
                  </button>
                </div>

                {/* Resumen rápido */}
                <div className="peta-card-summary">
                  <div className="summary-item">
                    <span className="summary-label">Solicitado:</span>
                    <span className="summary-value">{formatearFechaCorta(peta.fechaSolicitud)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Armas:</span>
                    <span className="summary-value">{peta.armasIncluidas?.length || 0}</span>
                  </div>
                  {peta.estadosAutorizados?.length > 0 && (
                    <div className="summary-item">
                      <span className="summary-label">Estados:</span>
                      <span className="summary-value">{peta.estadosAutorizados.length}</span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="summary-label">Vigencia:</span>
                    <span className="summary-value">
                      {formatearFechaCorta(peta.vigenciaInicio)} → {formatearFechaCorta(peta.vigenciaFin)}
                    </span>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandido && (
                  <div className="peta-card-details">
                    {/* Armas incluidas */}
                    <div className="detail-section">
                      <h4>🔫 Armas incluidas ({peta.armasIncluidas?.length || 0})</h4>
                      <div className="armas-detail-list">
                        {peta.armasIncluidas?.map((arma, idx) => (
                          <div key={idx} className="arma-detail-item">
                            <span className="arma-numero">{idx + 1}.</span>
                            <span className="arma-descripcion">
                              {arma.clase} {arma.marca} {arma.calibre} - Mat: {arma.matricula}
                            </span>
                            <span className="arma-cartuchos">{arma.cartuchos} cartuchos</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estados (si aplica) */}
                    {peta.estadosAutorizados?.length > 0 && (
                      <div className="detail-section">
                        <h4>📍 Estados autorizados ({peta.estadosAutorizados.length})</h4>
                        <div className="estados-chips">
                          {peta.estadosAutorizados.map(estado => (
                            <span key={estado} className="estado-chip">{estado}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Historial */}
                    {peta.historial && peta.historial.length > 0 && (
                      <div className="detail-section">
                        <h4>📜 Historial de cambios</h4>
                        <div className="historial-timeline">
                          {peta.historial.map((evento, idx) => {
                            const eventoInfo = ESTADOS_LABELS[evento.estado] || {};
                            return (
                              <div key={idx} className="timeline-item">
                                <div className="timeline-dot">{eventoInfo.icon || '•'}</div>
                                <div className="timeline-content">
                                  <div className="timeline-title">{eventoInfo.label || evento.estado}</div>
                                  <div className="timeline-fecha">{formatearFecha(evento.fecha)}</div>
                                  {evento.notas && <div className="timeline-notas">{evento.notas}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Información adicional */}
                    {peta.esRenovacion && (
                      <div className="detail-section">
                        <div className="info-box">
                          <strong>🔄 Renovación de PETA anterior:</strong> {peta.petaAnteriorNumero}
                        </div>
                      </div>
                    )}

                    {peta.numeroPeta && (
                      <div className="detail-section">
                        <div className="info-box success">
                          <strong>✅ Número de PETA asignado:</strong> {peta.numeroPeta}
                        </div>
                      </div>
                    )}

                    {peta.motivoRechazo && (
                      <div className="detail-section">
                        <div className="info-box danger">
                          <strong>❌ Motivo de rechazo:</strong> {peta.motivoRechazo}
                        </div>
                      </div>
                    )}

                    {/* Próximos pasos */}
                    {peta.estado === 'documentacion_proceso' && (
                      <div className="detail-section">
                        <div className="info-box warning">
                          <h4>📋 Próximos pasos:</h4>
                          <ol>
                            <li>Verifica que todos tus documentos estén subidos</li>
                            <li>Agenda cita con el Secretario</li>
                            <li>Lleva físicamente: foto infantil y recibo e5cinco</li>
                            <li>Entrega originales de certificados médicos</li>
                            <li>Realiza el pago de tu cuota anual</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

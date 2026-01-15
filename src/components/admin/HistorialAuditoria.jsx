/**
 * HistorialAuditoria - Componente para visualizar historial de cambios
 * 
 * Features:
 * - Timeline de todos los cambios del socio
 * - Filtros por tipo de cambio
 * - Detalles de before/after
 * - Información del admin que hizo el cambio
 * - Timestamps formateados
 */
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './HistorialAuditoria.css';

const TIPOS_CAMBIO = {
  edicion_datos_personales: { label: 'Datos Personales', icon: '✏️', color: '#2196f3' },
  edicion_curp: { label: 'CURP', icon: '🆔', color: '#9c27b0' },
  edicion_domicilio: { label: 'Domicilio', icon: '📍', color: '#ff9800' },
  cambio_email: { label: 'Email', icon: '📧', color: '#f44336' },
  eliminacion_documento: { label: 'Eliminación Documento', icon: '🗑️', color: '#d32f2f' },
  edicion_arma: { label: 'Arma Editada', icon: '🔫', color: '#4caf50' },
  nueva_arma: { label: 'Arma Agregada', icon: '➕', color: '#4caf50' },
  eliminacion_arma: { label: 'Arma Eliminada', icon: '🗑️', color: '#d32f2f' },
  otro: { label: 'Otro', icon: '📋', color: '#666' }
};

export default function HistorialAuditoria({ socioEmail, onClose }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    cargarHistorial();
  }, [socioEmail]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const auditoriaRef = collection(db, 'socios', socioEmail, 'auditoria');
      const q = query(auditoriaRef, orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);

      const registros = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistorial(registros);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoInfo = (tipo) => {
    return TIPOS_CAMBIO[tipo] || TIPOS_CAMBIO.otro;
  };

  const historialFiltrado = filtroTipo === 'todos' 
    ? historial 
    : historial.filter(r => r.tipo === filtroTipo);

  const tiposUnicos = [...new Set(historial.map(r => r.tipo))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content historial-auditoria" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Historial de Auditoría</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="historial-body">
          {/* Filtros */}
          <div className="filtros-section">
            <label>Filtrar por tipo:</label>
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos ({historial.length})</option>
              {tiposUnicos.map(tipo => {
                const count = historial.filter(r => r.tipo === tipo).length;
                const info = getTipoInfo(tipo);
                return (
                  <option key={tipo} value={tipo}>
                    {info.icon} {info.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner">⏳</div>
              <p>Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ Error: {error}</p>
            </div>
          )}

          {!loading && !error && historialFiltrado.length === 0 && (
            <div className="empty-state">
              <p>No hay registros en el historial</p>
            </div>
          )}

          {!loading && !error && historialFiltrado.length > 0 && (
            <div className="timeline">
              {historialFiltrado.map((registro) => {
                const tipoInfo = getTipoInfo(registro.tipo);
                
                return (
                  <div key={registro.id} className="timeline-item">
                    <div 
                      className="timeline-icon" 
                      style={{ backgroundColor: tipoInfo.color }}
                    >
                      {tipoInfo.icon}
                    </div>
                    
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{tipoInfo.label}</h4>
                        <span className="timeline-date">{formatDate(registro.fecha)}</span>
                      </div>
                      
                      <div className="timeline-details">
                        <div className="detalle-campo">
                          <strong>Campo modificado:</strong> {registro.campo}
                        </div>
                        
                        {registro.tipo !== 'eliminacion_documento' && (
                          <div className="cambio-valores">
                            <div className="valor-anterior-audit">
                              <span className="label">Anterior:</span>
                              <code>{registro.valorAnterior}</code>
                            </div>
                            <span className="flecha">→</span>
                            <div className="valor-nuevo-audit">
                              <span className="label">Nuevo:</span>
                              <code>{registro.valorNuevo}</code>
                            </div>
                          </div>
                        )}
                        
                        {registro.tipo === 'eliminacion_documento' && (
                          <div className="eliminacion-info">
                            <p><strong>Documento eliminado:</strong> {registro.documentoLabel}</p>
                            <p><strong>Detalles:</strong> {registro.valorAnterior}</p>
                          </div>
                        )}
                        
                        <div className="modificado-por">
                          <strong>Modificado por:</strong> {registro.modificadoPor}
                        </div>
                        
                        {registro.nota && (
                          <div className="nota-adicional">
                            <strong>Nota:</strong> {registro.nota}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-close-modal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

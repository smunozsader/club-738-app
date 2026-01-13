/**
 * AdminDashboard - Panel de administración para ver todos los socios
 * 
 * Funcionalidades:
 * - Lista completa de socios con búsqueda
 * - Filtros por estado de documentos
 * - Acceso rápido a expediente de cada socio
 * - Indicadores de progreso de documentación
 */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './AdminDashboard.css';

export default function AdminDashboard({ onVerExpediente }) {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, completos, pendientes

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const sociosRef = collection(db, 'socios');
      const q = query(sociosRef, orderBy('nombre'));
      const snapshot = await getDocs(q);

      const sociosData = [];
      for (const docSnap of snapshot.docs) {
        const socioData = {
          email: docSnap.id,
          ...docSnap.data()
        };

        // Calcular progreso de documentos
        const docs = socioData.documentosPETA || {};
        const totalDocs = 16; // Total de documentos PETA
        const docsSubidos = Object.keys(docs).filter(key => docs[key]?.url).length;
        socioData.progresoDocumentos = Math.round((docsSubidos / totalDocs) * 100);
        socioData.docsSubidos = docsSubidos;

        sociosData.push(socioData);
      }

      setSocios(sociosData);
    } catch (err) {
      console.error('Error cargando socios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar socios según búsqueda y filtros
  const sociosFiltrados = socios.filter(socio => {
    // Filtro de búsqueda
    const matchSearch = 
      socio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.curp?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // Filtro de estado
    if (filtroEstado === 'completos') {
      return socio.progresoDocumentos === 100;
    } else if (filtroEstado === 'pendientes') {
      return socio.progresoDocumentos < 100;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner">⏳</div>
        <p>Cargando socios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <p>❌ Error al cargar socios: {error}</p>
        <button onClick={cargarSocios}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1>🔧 Panel de Administración</h1>
        <p className="admin-subtitle">
          Gestión de expedientes de socios - Club de Caza, Tiro y Pesca de Yucatán, A.C.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{socios.length}</div>
          <div className="stat-label">Total Socios</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {socios.filter(s => s.progresoDocumentos === 100).length}
          </div>
          <div className="stat-label">Expedientes Completos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {socios.filter(s => s.progresoDocumentos < 100).length}
          </div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(socios.reduce((sum, s) => sum + s.progresoDocumentos, 0) / socios.length)}%
          </div>
          <div className="stat-label">Progreso Promedio</div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, email o CURP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos ({socios.length})
          </button>
          <button
            className={`filter-tab ${filtroEstado === 'completos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('completos')}
          >
            ✅ Completos ({socios.filter(s => s.progresoDocumentos === 100).length})
          </button>
          <button
            className={`filter-tab ${filtroEstado === 'pendientes' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('pendientes')}
          >
            ⏳ Pendientes ({socios.filter(s => s.progresoDocumentos < 100).length})
          </button>
        </div>
      </div>

      {/* Tabla de socios */}
      <div className="admin-table-container">
        {sociosFiltrados.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron socios con los filtros aplicados.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Email</th>
                <th>CURP</th>
                <th>Armas</th>
                <th>Progreso Documentos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.map(socio => (
                <tr key={socio.email}>
                  <td className="socio-nombre">{socio.nombre}</td>
                  <td className="socio-email">{socio.email}</td>
                  <td className="socio-curp">{socio.curp || '-'}</td>
                  <td className="socio-armas">
                    <span className="badge">{socio.totalArmas || 0} armas</span>
                  </td>
                  <td className="socio-progreso">
                    <div className="progress-container">
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill-mini" 
                          style={{ width: `${socio.progresoDocumentos}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {socio.progresoDocumentos}% ({socio.docsSubidos}/16)
                      </span>
                    </div>
                  </td>
                  <td className="socio-acciones">
                    <button
                      className="btn-ver-expediente"
                      onClick={() => onVerExpediente && onVerExpediente(socio.email)}
                    >
                      📋 Ver Expediente
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer con información */}
      <div className="admin-footer">
        <p>
          Mostrando {sociosFiltrados.length} de {socios.length} socios
        </p>
      </div>
    </div>
  );
}

/**
 * AdminDashboard - Panel de administración para ver todos los socios
 * 
 * REDISEÑO 2026: Mobile-first con grid de tarjetas accionables
 * 
 * Funcionalidades:
 * - Grid de herramientas (AdminToolsNavigation)
 * - Lista completa de socios con búsqueda
 * - Filtros por estado de documentos
 * - Acceso rápido a expediente de cada socio
 * - Indicadores de progreso de documentación
 */
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { DashboardSkeleton } from '../common/LoadingSkeleton';
import { useToastContext } from '../../contexts/ToastContext';
import AdminHeader from './AdminHeader';
import AdminToolsNavigation from './AdminToolsNavigation';
import NotificacionesCitas from './NotificacionesCitas';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

export default function AdminDashboard({ 
  onAdminSocios,
  onVerExpediente, 
  onSolicitarPETA,
  onVerificadorPETA,
  onGeneradorPETA,
  onExpedienteImpresor,
  onRegistroPagos,
  onReporteCaja,
  onCobranza,
  onDashboardRenovaciones,
  onDashboardCumpleanos,
  onAdminBajas,
  onAdminAltas,
  onMiAgenda,
  onReportadorExpedientes,
  onGeneradorDocumentos,
  onReporteContable,
  onRecibosEntrega,
  activeSection = 'admin-dashboard',
  onBackToTools
}) {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Para debouncing
  const [filtroEstado, setFiltroEstado] = useState('todos'); // todos, completos, pendientes
  const [filtroModalidad, setFiltroModalidad] = useState('todos'); // todos, caza, tiro, ambas
  const [ordenarPor, setOrdenarPor] = useState('nombre'); // nombre, progreso, armas
  const [exportando, setExportando] = useState(false);
  const toast = useToastContext();

  // Callback para cambiar sección activa
  const handleSelectTool = (toolId) => {
    console.log(`Tool selected: ${toolId}`);
    // Mapeo simple de herramientas a callbacks
    switch(toolId) {
      case 'reportador-expedientes':
        if (onReportadorExpedientes) onReportadorExpedientes();
        break;
      case 'verificador-peta':
        if (onVerificadorPETA) onVerificadorPETA();
        break;
      case 'generador-peta':
        if (onGeneradorPETA) onGeneradorPETA();
        break;
      case 'expediente-impresor':
        if (onExpedienteImpresor) onExpedienteImpresor();
        break;
      case 'registro-pagos':
        if (onRegistroPagos) onRegistroPagos();
        break;
      case 'reporte-caja':
        if (onReporteCaja) onReporteCaja();
        break;
      case 'cobranza-unificada':
        if (onCobranza) onCobranza();
        break;
      case 'renovaciones-2026':
        if (onDashboardRenovaciones) onDashboardRenovaciones();
        break;
      case 'cumpleanos':
        if (onDashboardCumpleanos) onDashboardCumpleanos();
        break;
      case 'altas-arsenal':
        if (onAdminAltas) onAdminAltas();
        break;
      case 'bajas-arsenal':
        if (onAdminBajas) onAdminBajas();
        break;
      case 'mi-agenda':
        if (onMiAgenda) onMiAgenda();
        break;
      case 'generador-documentos':
        if (onGeneradorDocumentos) onGeneradorDocumentos();
        break;
      case 'admin-socios':
        if (onAdminSocios) onAdminSocios();
        break;
      case 'reporte-contable':
        if (onReporteContable) onReporteContable();
        break;
      case 'recibos-entrega':
        if (onRecibosEntrega) onRecibosEntrega();
        break;
      default:
        console.log(`Unknown tool: ${toolId}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

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

  // Filtrar y ordenar socios (usando useMemo para optimizar)
  const sociosFiltrados = useMemo(() => {
    let filtered = socios.filter(socio => {
      // Filtro de búsqueda
      const matchSearch = 
        socio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        socio.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        socio.curp?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      // Filtro de estado de documentos
      if (filtroEstado === 'completos') {
        if (socio.progresoDocumentos !== 100) return false;
      } else if (filtroEstado === 'pendientes') {
        if (socio.progresoDocumentos >= 100) return false;
      }

      // Filtro de modalidad (basado en armas del socio)
      if (filtroModalidad !== 'todos' && socio.totalArmas > 0) {
        // Aquí necesitaríamos cargar las armas del socio
        // Por ahora lo dejamos para implementar con datos de armas
      }

      return true;
    });

    // Ordenar resultados
    filtered.sort((a, b) => {
      if (ordenarPor === 'progreso') {
        return b.progresoDocumentos - a.progresoDocumentos;
      } else if (ordenarPor === 'armas') {
        return (b.totalArmas || 0) - (a.totalArmas || 0);
      } else {
        // Por defecto: nombre
        return (a.nombre || '').localeCompare(b.nombre || '');
      }
    });

    return filtered;
  }, [socios, searchTerm, filtroEstado, filtroModalidad, ordenarPor]);

  const exportarAExcel = () => {
    try {
      setExportando(true);
      
      // Preparar datos para Excel
      const datosExport = sociosFiltrados.map(socio => ({
        'Nombre': socio.nombre || 'N/A',
        'Email': socio.email || 'N/A',
        'CURP': socio.curp || 'N/A',
        'Total Armas': socio.totalArmas || 0,
        'Progreso Documentos': `${socio.progresoDocumentos}%`,
        'Docs Subidos': `${socio.docsSubidos}/16`,
        'Estado': socio.progresoDocumentos === 100 ? 'Completo' : 'Pendiente',
        'Domicilio': socio.domicilio ? 
          `${socio.domicilio.calle}, ${socio.domicilio.colonia}, ${socio.domicilio.municipio}, ${socio.domicilio.estado}` : 
          'N/A'
      }));

      // Crear workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExport);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 30 }, // Nombre
        { wch: 35 }, // Email
        { wch: 20 }, // CURP
        { wch: 12 }, // Total Armas
        { wch: 18 }, // Progreso
        { wch: 15 }, // Docs Subidos
        { wch: 12 }, // Estado
        { wch: 60 }  // Domicilio
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Socios');

      // Generar fecha para nombre de archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Socios_Club738_${fecha}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, filename);

      toast.success(`Exportados ${sociosFiltrados.length} socios a Excel`);
    } catch (err) {
      console.error('Error exportando a Excel:', err);
      toast.error('Error al exportar a Excel');
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
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
      {/* Notificaciones de Citas Pendientes */}
      <NotificacionesCitas />

      {/* Encabezado Unificado */}
      <AdminHeader 
        title="🛠️ Panel de Administración"
        subtitle="Gestiona socios, documentos, PETAs y más"
      />

      {/* Componente de navegación de herramientas (Grid de tarjetas) */}
      <AdminToolsNavigation 
        onSelectTool={handleSelectTool}
        activeSection={activeSection}
      />

      {/* Contenido principal (tabla de socios) - Solo si activeSection === 'admin-socios' */}
      {activeSection === 'admin-socios' && (
        <div className="admin-main-content">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">
            <button
              className="btn-back-to-tools"
              onClick={onBackToTools}
              title="Volver a herramientas"
              aria-label="Back to tools"
            >
              ← Atrás
            </button>
            <h1>🔧 Panel de Administración</h1>
            <p className="admin-subtitle">
              Gestión de expedientes de socios - Club de Caza, Tiro y Pesca de Yucatán, A.C.
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-export-excel"
              onClick={exportarAExcel}
              disabled={exportando || sociosFiltrados.length === 0}
            >
              {exportando ? '⏳ Exportando...' : '📊 Exportar a Excel'}
            </button>
          </div>
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          {searchInput && (
            <button 
              className="clear-search"
              onClick={() => setSearchInput('')}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Estado:</label>
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
                Completos ({socios.filter(s => s.progresoDocumentos === 100).length})
              </button>
              <button
                className={`filter-tab ${filtroEstado === 'pendientes' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('pendientes')}
              >
                Pendientes ({socios.filter(s => s.progresoDocumentos < 100).length})
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ordenar por:</label>
            <select 
              className="filter-select"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="progreso">Progreso (mayor primero)</option>
              <option value="armas">Cantidad de armas</option>
            </select>
          </div>
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
                    <button
                      className="btn-solicitar-peta"
                      onClick={() => onSolicitarPETA && onSolicitarPETA(socio.email)}
                      title="Solicitar PETA para este socio"
                    >
                      🎯 Solicitar PETA
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
      )}
    </div>
  );
}

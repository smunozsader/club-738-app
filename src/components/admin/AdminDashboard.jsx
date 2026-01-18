/**
 * AdminDashboard - Panel de administración para ver todos los socios
 * 
 * Funcionalidades:
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
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

export default function AdminDashboard({ 
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
  onReportadorExpedientes
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

  // DEBUG: Verificar que los props se reciben correctamente
  useEffect(() => {
    console.log('🔍 AdminDashboard Props Debug:');
    console.log('  ✓ onVerificadorPETA:', typeof onVerificadorPETA === 'function' ? '✅ Function' : '❌ ' + typeof onVerificadorPETA);
    console.log('  ✓ onGeneradorPETA:', typeof onGeneradorPETA === 'function' ? '✅ Function' : '❌ ' + typeof onGeneradorPETA);
    console.log('  ✓ onRegistroPagos:', typeof onRegistroPagos === 'function' ? '✅ Function' : '❌ ' + typeof onRegistroPagos);
    console.log('  ✓ onCobranza:', typeof onCobranza === 'function' ? '✅ Function' : '❌ ' + typeof onCobranza);
  }, [onVerificadorPETA, onGeneradorPETA, onRegistroPagos, onCobranza]);
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
      {/* Sidebar con herramientas admin */}
      <aside className="admin-tools-sidebar">
        <h3 className="sidebar-title">🛠️ Herramientas Administrativas</h3>
        
        {/* MÓDULO: GESTIÓN DE SOCIOS */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">👥 Gestión de Socios</h4>
          <nav className="admin-tools-nav">
            <button 
              className="admin-tool-btn socios active"
              title="Vista activa: Tabla de socios"
            >
              <span className="tool-icon">📋</span>
              <span className="tool-text">Gestión de Socios</span>
            </button>
            
            <button 
              className="admin-tool-btn socios"
              onClick={() => {
                console.log('📊 Reportador Expedientes clicked!');
                if (typeof onReportadorExpedientes === 'function') {
                  onReportadorExpedientes();
                } else {
                  console.error('❌ onReportadorExpedientes is not a function:', typeof onReportadorExpedientes);
                }
              }}
              title="Reportador de expedientes"
            >
              <span className="tool-icon">📊</span>
              <span className="tool-text">Reportador Expedientes</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO: PETA */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">🎯 Módulo PETA</h4>
          <nav className="admin-tools-nav">
            <button 
              className="admin-tool-btn peta"
              onClick={() => {
                console.log('🔍 Verificador PETA clicked!');
                console.log('  onVerificadorPETA exists:', !!onVerificadorPETA);
                console.log('  onVerificadorPETA type:', typeof onVerificadorPETA);
                if (onVerificadorPETA) {
                  console.log('  Calling onVerificadorPETA...');
                  onVerificadorPETA();
                } else {
                  console.error('  ❌ onVerificadorPETA is undefined!');
                }
              }}
              title="Verificar documentos de PETAs solicitadas"
            >
              <span className="tool-icon">✅</span>
              <span className="tool-text">Verificador PETA</span>
            </button>
            
            <button 
              className="admin-tool-btn peta"
              onClick={() => {
                console.log('📄 Generador PETA clicked!');
                if (typeof onGeneradorPETA === 'function') {
                  onGeneradorPETA();
                } else {
                  console.error('❌ onGeneradorPETA is not a function:', typeof onGeneradorPETA);
                }
              }}
              title="Generar oficios PETA en PDF"
            >
              <span className="tool-icon">📄</span>
              <span className="tool-text">Generador PETA</span>
            </button>
            
            <button 
              className="admin-tool-btn peta"
              onClick={() => {
                console.log('🖨️ Expediente Impresor clicked!');
                if (typeof onExpedienteImpresor === 'function') {
                  onExpedienteImpresor();
                } else {
                  console.error('❌ onExpedienteImpresor is not a function:', typeof onExpedienteImpresor);
                }
              }}
              title="Preparar expedientes para impresión"
            >
              <span className="tool-icon">🖨️</span>
              <span className="tool-text">Expediente Impresor</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO: COBRANZA */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">💰 Módulo Cobranza</h4>
          <nav className="admin-tools-nav">
            <button 
              className="admin-tool-btn pagos"
              onClick={() => {
                console.log('💵 Panel Cobranza clicked!');
                if (typeof onCobranza === 'function') {
                  onCobranza();
                } else {
                  console.error('❌ onCobranza is not a function:', typeof onCobranza);
                }
              }}
              title="Panel de cobranza unificado"
            >
              <span className="tool-icon">💵</span>
              <span className="tool-text">Panel Cobranza</span>
            </button>
            
            <button 
              className="admin-tool-btn pagos"
              onClick={() => {
                console.log('💳 Registro de Pagos clicked!');
                if (typeof onRegistroPagos === 'function') {
                  onRegistroPagos();
                } else {
                  console.error('❌ onRegistroPagos is not a function:', typeof onRegistroPagos);
                }
              }}
              title="Registrar pagos de membresías"
            >
              <span className="tool-icon">💳</span>
              <span className="tool-text">Registro de Pagos</span>
            </button>
            
            <button 
              className="admin-tool-btn pagos"
              onClick={() => {
                console.log('📊 Reporte de Caja clicked!');
                if (typeof onReporteCaja === 'function') {
                  onReporteCaja();
                } else {
                  console.error('❌ onReporteCaja is not a function:', typeof onReporteCaja);
                }
              }}
              title="Reporte de caja y corte"
            >
              <span className="tool-icon">📊</span>
              <span className="tool-text">Reporte de Caja</span>
            </button>

            <button 
              className="admin-tool-btn pagos"
              onClick={() => {
                console.log('📈 Renovaciones 2026 clicked!');
                if (typeof onDashboardRenovaciones === 'function') {
                  onDashboardRenovaciones();
                } else {
                  console.error('❌ onDashboardRenovaciones is not a function:', typeof onDashboardRenovaciones);
                }
              }}
              title="Dashboard de renovaciones 2026"
            >
              <span className="tool-icon">📈</span>
              <span className="tool-text">Renovaciones 2026</span>
            </button>
            
            <button 
              className="admin-tool-btn pagos"
              onClick={() => {
                console.log('🎂 Cumpleaños clicked!');
                if (typeof onDashboardCumpleanos === 'function') {
                  onDashboardCumpleanos();
                } else {
                  console.error('❌ onDashboardCumpleanos is not a function:', typeof onDashboardCumpleanos);
                }
              }}
              title="Cumpleaños y demografía de socios"
            >
              <span className="tool-icon">🎂</span>
              <span className="tool-text">Cumpleaños</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO: ARSENAL */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">🔫 Gestión de Arsenal</h4>
          <nav className="admin-tools-nav">
            <button 
              className="admin-tool-btn arsenal"
              onClick={() => {
                console.log('📦 Bajas de Arsenal clicked!');
                if (typeof onAdminBajas === 'function') {
                  onAdminBajas();
                } else {
                  console.error('❌ onAdminBajas is not a function:', typeof onAdminBajas);
                }
              }}
              title="Administrar solicitudes de baja de armas"
            >
              <span className="tool-icon">📦</span>
              <span className="tool-text">Bajas de Arsenal</span>
            </button>
            
            <button 
              className="admin-tool-btn arsenal"
              onClick={() => {
                console.log('📝 Altas de Arsenal clicked!');
                if (typeof onAdminAltas === 'function') {
                  onAdminAltas();
                } else {
                  console.error('❌ onAdminAltas is not a function:', typeof onAdminAltas);
                }
              }}
              title="Administrar solicitudes de alta de armas"
            >
              <span className="tool-icon">📝</span>
              <span className="tool-text">Altas de Arsenal</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO: AGENDA */}
        <div className="sidebar-section">
          <h4 className="sidebar-section-title">📅 Agenda & Citas</h4>
          <nav className="admin-tools-nav">
            <button 
              className="admin-tool-btn agenda"
              onClick={() => {
                console.log('📅 Mi Agenda clicked!');
                if (typeof onMiAgenda === 'function') {
                  onMiAgenda();
                } else {
                  console.error('❌ onMiAgenda is not a function:', typeof onMiAgenda);
                }
              }}
              title="Gestionar citas de socios"
            >
              <span className="tool-icon">📅</span>
              <span className="tool-text">Mi Agenda</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Contenido principal con grid layout */}
      <div className="admin-main-content">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">
            <h1>🔧 Panel de Administración</h1>
            <p className="admin-subtitle">
              Gestión de expedientes de socios - Club de Caza, Tiro y Pesca de Yucatán, A.C.
            </p>
          </div>
          <button 
            className="btn-export-excel"
            onClick={exportarAExcel}
            disabled={exportando || sociosFiltrados.length === 0}
          >
            {exportando ? '⏳ Exportando...' : '📊 Exportar a Excel'}
          </button>
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
      </div> {/* Cierre de admin-main-content */}
    </div>
  );
}

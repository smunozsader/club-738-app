/**
 * ReporteCaja - Corte de Caja / Reporte de Pagos
 * 
 * Muestra:
 * - Resumen de pagados vs pendientes
 * - Total recaudado por concepto
 * - Lista detallada de pagos
 * - Exportar a Excel/PDF
 */
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './ReporteCaja.css';

// Configuración de cuotas (igual que otros módulos)
const CUOTA_CLUB = 6000;
const CUOTA_FEMETI = 350;
const INSCRIPCION = 2000; // Solo socios nuevos
const FEMETI_NUEVO = 700; // FEMETI para socios nuevos

export default function ReporteCaja({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [socios, setSocios] = useState([]);
  const [filtro, setFiltro] = useState('todos'); // todos, pagados, pendientes
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [busqueda, setBusqueda] = useState('');
  const [rangoFechas, setRangoFechas] = useState({
    desde: '2026-01-01',
    hasta: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const sociosRef = collection(db, 'socios');
      const snapshot = await getDocs(sociosRef);
      
      const sociosData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Determinar estado de pago
        const pagado = data.renovacion2026?.estado === 'pagado' || 
                      data.membresia2026?.activa === true;
        
        // Limpiar nombre
        let nombreLimpio = data.nombre || doc.id;
        nombreLimpio = nombreLimpio.replace(/^\d+\.\s*/, '');
        
        // Obtener datos de pago
        const fechaPago = data.renovacion2026?.fechaPago?.toDate() || 
                         data.membresia2026?.fechaPago?.toDate() || null;
        
        // Priorizar membresia2026 sobre renovacion2026 (membresia2026 es más confiable)
        const cuotaClub = data.membresia2026?.cuotaClub !== undefined ? data.membresia2026.cuotaClub :
                         (data.renovacion2026?.cuotaClub || 
                         (data.membresia2026?.activa ? CUOTA_CLUB : 0));
        const cuotaFemeti = data.membresia2026?.cuotaFemeti !== undefined ? data.membresia2026.cuotaFemeti :
                          (data.renovacion2026?.cuotaFemeti || 
                          (data.membresia2026?.activa ? CUOTA_FEMETI : 0));
        const inscripcion = data.membresia2026?.inscripcion !== undefined ? data.membresia2026.inscripcion :
                           (data.membresia2026?.esNuevo ? INSCRIPCION : 0);
        const montoTotal = data.membresia2026?.monto !== undefined ? data.membresia2026.monto :
                          (data.renovacion2026?.montoTotal || 0);
        
        sociosData.push({
          email: doc.id,
          nombre: nombreLimpio,
          noSocio: data.noSocio || '-',
          pagado,
          fechaPago,
          inscripcion,
          cuotaClub,
          cuotaFemeti,
          montoTotal: pagado ? montoTotal : 0,
          metodoPago: data.renovacion2026?.metodoPago || 
                     data.membresia2026?.metodoPago || '-',
          comprobante: data.renovacion2026?.comprobante || 
                      data.membresia2026?.numeroRecibo || '-',
          esNuevo: data.membresia2026?.esNuevo || false,
          exento: data.renovacion2026?.exento || false,
          motivoExencion: data.renovacion2026?.motivoExencion || null
        });
      });
      
      setSocios(sociosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar socios
  const sociosFiltrados = socios
    .filter(s => {
      // Filtro por estado
      if (filtro === 'pagados' && !s.pagado) return false;
      if (filtro === 'pendientes' && s.pagado) return false;
      if (filtro === 'exentos' && !s.exento) return false;
      
      // Filtro por búsqueda
      if (busqueda) {
        const term = busqueda.toLowerCase();
        return s.nombre.toLowerCase().includes(term) || 
               s.email.toLowerCase().includes(term);
      }
      
      // Filtro por rango de fechas (solo pagados)
      if (s.pagado && s.fechaPago) {
        const fecha = s.fechaPago;
        const desde = new Date(rangoFechas.desde);
        const hasta = new Date(rangoFechas.hasta);
        hasta.setHours(23, 59, 59); // Incluir todo el día
        
        if (fecha < desde || fecha > hasta) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (ordenarPor) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'fecha':
          if (!a.fechaPago && !b.fechaPago) return 0;
          if (!a.fechaPago) return 1;
          if (!b.fechaPago) return -1;
          return b.fechaPago - a.fechaPago;
        case 'monto':
          return b.montoTotal - a.montoTotal;
        default:
          return 0;
      }
    });

  // Calcular totales (basado en sociosFiltrados para que sean subtotales)
  const calcularTotales = () => {
    // Usar sociosFiltrados para que los totales sean subtotales de lo mostrado
    const pagados = sociosFiltrados.filter(s => s.pagado);
    const pendientes = sociosFiltrados.filter(s => !s.pagado && !s.exento);
    const exentos = sociosFiltrados.filter(s => s.exento);
    
    const totalRecaudado = pagados.reduce((sum, s) => sum + (s.montoTotal || 0), 0);
    const totalInscripcion = pagados.reduce((sum, s) => sum + (s.inscripcion || 0), 0);
    const totalCuotaClub = pagados.reduce((sum, s) => sum + (s.cuotaClub || 0), 0);
    const totalFemeti = pagados.reduce((sum, s) => sum + (s.cuotaFemeti || 0), 0);
    
    const porRecaudar = pendientes.length * (CUOTA_CLUB + CUOTA_FEMETI);
    
    // Agrupar por método de pago (usando datos filtrados)
    const porMetodo = {};
    pagados.forEach(s => {
      const metodo = s.metodoPago || 'sin especificar';
      if (!porMetodo[metodo]) {
        porMetodo[metodo] = { cantidad: 0, monto: 0 };
      }
      porMetodo[metodo].cantidad++;
      porMetodo[metodo].monto += s.montoTotal || 0;
    });
    
    return {
      totalSocios: sociosFiltrados.length,
      pagados: pagados.length,
      pendientes: pendientes.length,
      exentos: exentos.length,
      totalRecaudado,
      totalInscripcion,
      totalCuotaClub,
      totalFemeti,
      porRecaudar,
      porMetodo
    };
  };

  const totales = calcularTotales();

  // Exportar a CSV
  const exportarCSV = () => {
    const headers = ['Socio', 'Email', 'Estado', 'Fecha Pago', 'Inscripción', 'Cuota Club', 'FEMETI', 'Total', 'Método', 'Comprobante'];
    
    const rows = sociosFiltrados.map(s => [
      s.nombre,
      s.email,
      s.pagado ? 'PAGADO' : (s.exento ? 'EXENTO' : 'PENDIENTE'),
      s.fechaPago ? s.fechaPago.toLocaleDateString('es-MX') : '-',
      s.inscripcion || 0,
      s.cuotaClub || 0,
      s.cuotaFemeti || 0,
      s.montoTotal || 0,
      s.metodoPago,
      s.comprobante
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corte_caja_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Imprimir reporte
  const imprimirReporte = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Cargando datos de pagos...</div>;
  }

  return (
    <div className="reporte-caja-container">
      {/* Header */}
      <div className="reporte-header">
        <div className="header-title">
          <button className="btn-back" onClick={onBack}>← Volver</button>
          <h2>📊 Corte de Caja</h2>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={exportarCSV}>
            📥 Exportar CSV
          </button>
          <button className="btn-secondary" onClick={imprimirReporte}>
            🖨️ Imprimir
          </button>
          <button className="btn-primary" onClick={cargarDatos}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="resumen-cards">
        <div className="card card-total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Recaudado</div>
            <div className="card-value">${totales.totalRecaudado.toLocaleString('es-MX')}</div>
          </div>
        </div>
        
        <div className="card card-pagados">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-label">Socios Pagados</div>
            <div className="card-value">{totales.pagados} / {totales.totalSocios}</div>
            <div className="card-percent">{Math.round(totales.pagados / totales.totalSocios * 100)}%</div>
          </div>
        </div>
        
        <div className="card card-pendientes">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <div className="card-label">Pendientes</div>
            <div className="card-value">{totales.pendientes}</div>
            <div className="card-subtext">Por cobrar: ${totales.porRecaudar.toLocaleString('es-MX')}</div>
          </div>
        </div>
        
        <div className="card card-desglose">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <div className="card-label">Desglose</div>
            {totales.totalInscripcion > 0 && <div className="card-detail">Inscripciones: ${totales.totalInscripcion.toLocaleString('es-MX')}</div>}
            <div className="card-detail">Cuota Club: ${totales.totalCuotaClub.toLocaleString('es-MX')}</div>
            <div className="card-detail">FEMETI: ${totales.totalFemeti.toLocaleString('es-MX')}</div>
          </div>
        </div>
      </div>

      {/* Resumen por método de pago */}
      <div className="metodos-pago-section">
        <h3>Por Método de Pago</h3>
        <div className="metodos-grid">
          {Object.entries(totales.porMetodo).map(([metodo, data]) => (
            <div key={metodo} className="metodo-card">
              <div className="metodo-nombre">{metodo.charAt(0).toUpperCase() + metodo.slice(1)}</div>
              <div className="metodo-cantidad">{data.cantidad} pago{data.cantidad !== 1 ? 's' : ''}</div>
              <div className="metodo-monto">${data.monto.toLocaleString('es-MX')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-row">
          <div className="filtro-group">
            <label>Estado:</label>
            <select value={filtro} onChange={e => setFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="pagados">Pagados</option>
              <option value="pendientes">Pendientes</option>
              <option value="exentos">Exentos</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Ordenar por:</label>
            <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
              <option value="nombre">Nombre</option>
              <option value="fecha">Fecha de pago</option>
              <option value="monto">Monto</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Buscar:</label>
            <input 
              type="text" 
              placeholder="Nombre o email..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filtros-row">
          <div className="filtro-group">
            <label>Desde:</label>
            <input 
              type="date" 
              value={rangoFechas.desde}
              onChange={e => setRangoFechas({...rangoFechas, desde: e.target.value})}
            />
          </div>
          
          <div className="filtro-group">
            <label>Hasta:</label>
            <input 
              type="date" 
              value={rangoFechas.hasta}
              onChange={e => setRangoFechas({...rangoFechas, hasta: e.target.value})}
            />
          </div>
          
          <div className="filtro-result">
            Mostrando: <strong>{sociosFiltrados.length}</strong> registros
          </div>
        </div>
      </div>

      {/* Tabla de detalle */}
      <div className="tabla-container">
        <table className="tabla-pagos">
          <thead>
            <tr>
              <th>Socio</th>
              <th>Estado</th>
              <th>Fecha Pago</th>
              <th className="text-right">Inscripción</th>
              <th className="text-right">Cuota Club</th>
              <th className="text-right">FEMETI</th>
              <th className="text-right">Total</th>
              <th>Método</th>
              <th>Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {sociosFiltrados.map(socio => (
              <tr key={socio.email} className={socio.pagado ? 'row-pagado' : 'row-pendiente'}>
                <td>
                  <div className="socio-cell">
                    <div className="socio-nombre">{socio.nombre}</div>
                    <div className="socio-email">{socio.email}</div>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${socio.pagado ? 'pagado' : (socio.exento ? 'exento' : 'pendiente')}`}>
                    {socio.pagado ? '✅ Pagado' : (socio.exento ? '⚪ Exento' : '⏳ Pendiente')}
                  </span>
                </td>
                <td>{socio.fechaPago ? socio.fechaPago.toLocaleDateString('es-MX') : '-'}</td>
                <td className="text-right">{socio.inscripcion ? `$${socio.inscripcion.toLocaleString('es-MX')}` : '-'}</td>
                <td className="text-right">{socio.cuotaClub ? `$${socio.cuotaClub.toLocaleString('es-MX')}` : '-'}</td>
                <td className="text-right">{socio.cuotaFemeti ? `$${socio.cuotaFemeti.toLocaleString('es-MX')}` : '-'}</td>
                <td className="text-right font-bold">{socio.montoTotal ? `$${socio.montoTotal.toLocaleString('es-MX')}` : '-'}</td>
                <td>{socio.metodoPago !== '-' ? socio.metodoPago : '-'}</td>
                <td className="comprobante-cell">{socio.comprobante}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totales-row">
              <td colSpan="3"><strong>TOTALES</strong></td>
              <td className="text-right"><strong>${totales.totalInscripcion.toLocaleString('es-MX')}</strong></td>
              <td className="text-right"><strong>${totales.totalCuotaClub.toLocaleString('es-MX')}</strong></td>
              <td className="text-right"><strong>${totales.totalFemeti.toLocaleString('es-MX')}</strong></td>
              <td className="text-right"><strong>${totales.totalRecaudado.toLocaleString('es-MX')}</strong></td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer para impresión */}
      <div className="print-footer">
        <p>Club de Caza, Tiro y Pesca de Yucatán, A.C. - Corte de Caja</p>
        <p>Generado: {new Date().toLocaleString('es-MX')}</p>
      </div>
    </div>
  );
}

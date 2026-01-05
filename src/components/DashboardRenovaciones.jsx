/**
 * DashboardRenovaciones - Panel de control de cobranza para el Secretario
 * 
 * Muestra estado de renovaciones 2026 con semáforo:
 * 🟢 Pagado | 🟡 Pendiente | 🔴 Vencido | ⚪ Exento
 */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './DashboardRenovaciones.css';

// Configuración de cuotas
const CUOTA_CLUB = 6000;
const CUOTA_FEMETI_SOCIO = 350;
const CUOTA_FEMETI_NUEVO = 700;
const FECHA_LIMITE = new Date('2026-02-28');

// Función para determinar si es socio nuevo (alta en 2025 o posterior)
const esSocioNuevo = (fechaAlta) => {
  if (!fechaAlta) return false;
  return fechaAlta >= new Date('2025-01-01');
};

export default function DashboardRenovaciones({ userEmail, onVerDocumentos }) {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, pendiente, pagado, vencido, exento
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('noSocio'); // Por defecto: número de credencial
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [registrandoPago, setRegistrandoPago] = useState(false);

  // Solo el secretario puede ver este dashboard
  const esSecretario = userEmail === 'smunozam@gmail.com';

  useEffect(() => {
    if (esSecretario) {
      cargarSocios();
    }
  }, [esSecretario]);

  const cargarSocios = async () => {
    try {
      const sociosRef = collection(db, 'socios');
      const snapshot = await getDocs(sociosRef);
      
      const sociosData = [];
      const hoy = new Date();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const renovacion = data.renovacion2026 || {};
        
        // Calcular estado actual
        let estado = renovacion.estado || 'pendiente';
        
        // Si no está pagado ni exento, verificar si está vencido
        if (estado === 'pendiente' && hoy > FECHA_LIMITE) {
          estado = 'vencido';
        }
        
        // Limpiar nombre: quitar prefijo "XXX. " si existe (ej: "157. NOMBRE" -> "NOMBRE")
        let nombreLimpio = data.nombre || doc.id;
        nombreLimpio = nombreLimpio.replace(/^\d+\.\s*/, '');
        
        sociosData.push({
          id: doc.id,
          email: doc.id,
          nombre: nombreLimpio,
          fechaAlta: data.fechaAlta?.toDate() || null,
          noSocio: data.noSocio || '-',
          telefono: data.telefono || '-',
          moroso2025: data.moroso2025 || false,
          renovacion: {
            ...renovacion,
            estado,
            prioridad: renovacion.prioridad || 'normal',
            fechaLimite: renovacion.fechaLimite?.toDate() || FECHA_LIMITE,
            fechaPago: renovacion.fechaPago?.toDate() || null
          }
        });
      });
      
      setSocios(sociosData);
    } catch (error) {
      console.error('Error cargando socios:', error);
    } finally {
      setLoading(false);
    }
  };

  const registrarPago = async (socioEmail, datosPago) => {
    setRegistrandoPago(true);
    try {
      const socioRef = doc(db, 'socios', socioEmail);
      await updateDoc(socioRef, {
        'renovacion2026.estado': 'pagado',
        'renovacion2026.fechaPago': Timestamp.fromDate(datosPago.fechaPago),
        'renovacion2026.cuotaClub': datosPago.cuotaClub,
        'renovacion2026.cuotaFemeti': datosPago.cuotaFemeti,
        'renovacion2026.montoTotal': datosPago.cuotaClub + datosPago.cuotaFemeti,
        'renovacion2026.metodoPago': datosPago.metodoPago,
        'renovacion2026.comprobante': datosPago.comprobante,
        'renovacion2026.registradoPor': userEmail
      });
      
      // Actualizar estado local
      setSocios(prev => prev.map(s => 
        s.email === socioEmail 
          ? { 
              ...s, 
              renovacion: { 
                ...s.renovacion, 
                estado: 'pagado',
                fechaPago: datosPago.fechaPago,
                montoTotal: datosPago.cuotaClub + datosPago.cuotaFemeti
              }
            }
          : s
      ));
      
      setSocioSeleccionado(null);
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error al registrar pago: ' + error.message);
    } finally {
      setRegistrandoPago(false);
    }
  };

  // Filtrar y ordenar socios
  const sociosFiltrados = socios
    .filter(s => {
      // Filtro especial para morosos 2025
      if (filtro === 'moroso2025') {
        return s.moroso2025 === true;
      }
      if (filtro !== 'todos' && s.renovacion.estado !== filtro) return false;
      if (busqueda) {
        const busq = busqueda.toLowerCase();
        return s.nombre.toLowerCase().includes(busq) || 
               s.email.toLowerCase().includes(busq);
      }
      return true;
    })
    .sort((a, b) => {
      switch (ordenarPor) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'estado':
          const orden = { vencido: 0, pendiente: 1, pagado: 2, exento: 3 };
          return orden[a.renovacion.estado] - orden[b.renovacion.estado];
        case 'fechaAlta':
          return (a.fechaAlta || 0) - (b.fechaAlta || 0);
        case 'noSocio':
          return (parseInt(a.noSocio) || 999) - (parseInt(b.noSocio) || 999);
        case 'prioridad':
          // Morosos primero, luego por número de socio
          if (a.moroso2025 && !b.moroso2025) return -1;
          if (!a.moroso2025 && b.moroso2025) return 1;
          return (parseInt(a.noSocio) || 999) - (parseInt(b.noSocio) || 999);
        default:
          return 0;
      }
    });

  // Estadísticas
  const stats = {
    total: socios.length,
    pagados: socios.filter(s => s.renovacion.estado === 'pagado').length,
    pendientes: socios.filter(s => s.renovacion.estado === 'pendiente').length,
    vencidos: socios.filter(s => s.renovacion.estado === 'vencido').length,
    exentos: socios.filter(s => s.renovacion.estado === 'exento').length,
    morosos2025: socios.filter(s => s.moroso2025 === true).length,
  };
  
  stats.debenPagar = stats.total - stats.exentos;
  // Solo cuota Club para finanzas (FEMETI se transfiere a la Federación)
  stats.ingresoEstimado = stats.debenPagar * CUOTA_CLUB;
  stats.ingresoActual = socios
    .filter(s => s.renovacion.estado === 'pagado')
    .reduce((sum, s) => sum + (s.renovacion.cuotaClub || CUOTA_CLUB), 0);
  stats.porcentajeCobrado = stats.debenPagar > 0 
    ? Math.round((stats.pagados / stats.debenPagar) * 100) 
    : 0;
  
  // Fondo FEMETI (apartado para pago a la Federación)
  stats.femetiRecaudado = socios
    .filter(s => s.renovacion.estado === 'pagado')
    .reduce((sum, s) => sum + (s.renovacion.cuotaFemeti || CUOTA_FEMETI_SOCIO), 0);
  // Estimado FEMETI: contar nuevos vs existentes
  const sociosNuevos = socios.filter(s => s.renovacion.estado !== 'exento' && esSocioNuevo(s.fechaAlta)).length;
  const sociosExistentes = stats.debenPagar - sociosNuevos;
  stats.femetiEstimado = (sociosNuevos * CUOTA_FEMETI_NUEVO) + (sociosExistentes * CUOTA_FEMETI_SOCIO);

  // Días restantes
  const hoy = new Date();
  const diasRestantes = Math.ceil((FECHA_LIMITE - hoy) / (1000 * 60 * 60 * 24));

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pagado': return '🟢';
      case 'pendiente': return '🟡';
      case 'vencido': return '🔴';
      case 'exento': return '⚪';
      default: return '❓';
    }
  };

  const getEstadoClass = (estado) => {
    return `estado-${estado}`;
  };

  if (!esSecretario) {
    return (
      <div className="dashboard-renovaciones acceso-denegado">
        <h2>Acceso Restringido</h2>
        <p>Este panel es exclusivo para el Secretario del Club.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-renovaciones loading">
        <p>Cargando datos de renovaciones...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-renovaciones">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Dashboard de Renovaciones 2026</h2>
        <div className="countdown">
          <span className={`dias ${diasRestantes <= 7 ? 'urgente' : diasRestantes <= 30 ? 'pronto' : ''}`}>
            {diasRestantes > 0 ? `${diasRestantes} días restantes` : '¡Plazo vencido!'}
          </span>
          <span className="fecha-limite">Límite: 28 de febrero 2026</span>
        </div>
      </div>

      {/* Resumen estadístico */}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Socios</span>
        </div>
        <div className="stat-card pagados" onClick={() => setFiltro('pagado')}>
          <span className="stat-number">{stats.pagados}</span>
          <span className="stat-label">🟢 Pagados</span>
        </div>
        <div className="stat-card pendientes" onClick={() => setFiltro('pendiente')}>
          <span className="stat-number">{stats.pendientes}</span>
          <span className="stat-label">🟡 Pendientes</span>
        </div>
        <div className="stat-card vencidos" onClick={() => setFiltro('vencido')}>
          <span className="stat-number">{stats.vencidos}</span>
          <span className="stat-label">🔴 Vencidos</span>
        </div>
        <div className="stat-card exentos" onClick={() => setFiltro('exento')}>
          <span className="stat-number">{stats.exentos}</span>
          <span className="stat-label">⚪ Exentos</span>
        </div>
      </div>

      {/* Barra de progreso de cobranza */}
      <div className="progreso-cobranza">
        <div className="progreso-header">
          <span>Progreso de Cobranza (Cuota Club)</span>
          <span className="progreso-monto">
            ${stats.ingresoActual.toLocaleString()} / ${stats.ingresoEstimado.toLocaleString()} MXN
          </span>
        </div>
        <div className="progreso-bar">
          <div 
            className="progreso-fill" 
            style={{ width: `${stats.porcentajeCobrado}%` }}
          />
        </div>
        <div className="progreso-footer">
          <span>{stats.pagados} de {stats.debenPagar} socios han pagado</span>
          <span className="progreso-porcentaje">{stats.porcentajeCobrado}%</span>
        </div>
      </div>

      {/* Apartado FEMETI */}
      <div className="apartado-femeti">
        <div className="femeti-header">
          <span>🏆 Fondo FEMETI</span>
          <a href="https://www.femeti.org.mx/" target="_blank" rel="noopener noreferrer" className="femeti-link">
            Federación Mexicana de Tiro y Caza ↗
          </a>
        </div>
        <div className="femeti-content">
          <div className="femeti-stat">
            <span className="femeti-label">Recaudado:</span>
            <span className="femeti-valor recaudado">${stats.femetiRecaudado.toLocaleString()} MXN</span>
          </div>
          <div className="femeti-stat">
            <span className="femeti-label">Estimado total:</span>
            <span className="femeti-valor">${stats.femetiEstimado.toLocaleString()} MXN</span>
          </div>
          <div className="femeti-stat">
            <span className="femeti-label">Pendiente:</span>
            <span className="femeti-valor pendiente">${(stats.femetiEstimado - stats.femetiRecaudado).toLocaleString()} MXN</span>
          </div>
        </div>
        <p className="femeti-nota">
          ℹ️ Este fondo se destina al pago de membresía anual del Club a FEMETI. 
          Socios: $350 | Nuevos: $700
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filtros-bar">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
        
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">🟡 Pendientes</option>
          <option value="pagado">🟢 Pagados</option>
          <option value="vencido">🔴 Vencidos</option>
          <option value="exento">⚪ Exentos</option>
          <option value="moroso2025">⚠️ Morosos 2025</option>
        </select>

        <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
          <option value="nombre">Ordenar por Nombre</option>
          <option value="estado">Ordenar por Estado</option>
          <option value="noSocio">Ordenar por No. Socio</option>
          <option value="fechaAlta">Ordenar por Antigüedad</option>
          <option value="prioridad">Ordenar por Prioridad</option>
        </select>
      </div>

      {/* Tabla de socios */}
      <div className="tabla-container">
        <table className="tabla-socios">
          <thead>
            <tr>
              <th>Estado</th>
              <th>No.</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Fecha Alta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sociosFiltrados.map(socio => (
              <tr key={socio.id} className={getEstadoClass(socio.renovacion.estado)}>
                <td className="col-estado">
                  <span className="estado-badge">
                    {getEstadoIcon(socio.renovacion.estado)}
                  </span>
                </td>
                <td className="col-nosocio">{socio.noSocio}</td>
                <td className="col-nombre">
                  <button 
                    className="link-nombre"
                    onClick={() => onVerDocumentos && onVerDocumentos(socio.email, socio.nombre)}
                    title="Ver documentos de este socio"
                  >
                    {socio.nombre}
                  </button>
                  {socio.moroso2025 && (
                    <span className="badge-moroso" title="No pagó anualidad 2025">⚠️ Moroso 2025</span>
                  )}
                </td>
                <td className="col-email">{socio.email}</td>
                <td className="col-fecha">
                  {socio.fechaAlta?.toLocaleDateString('es-MX') || '-'}
                </td>
                <td className="col-acciones">
                  {socio.renovacion.estado === 'pendiente' || socio.renovacion.estado === 'vencido' ? (
                    <button 
                      className="btn-registrar-pago"
                      onClick={() => setSocioSeleccionado(socio)}
                    >
                      Registrar Pago
                    </button>
                  ) : socio.renovacion.estado === 'pagado' ? (
                    <span className="fecha-pago">
                      Pagó: {socio.renovacion.fechaPago?.toLocaleDateString('es-MX')}
                    </span>
                  ) : socio.renovacion.estado === 'exento' ? (
                    <span className="motivo-exento" title={socio.renovacion.motivoExencion}>
                      {socio.renovacion.motivoExencion}
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de registro de pago */}
      {socioSeleccionado && (
        <div className="modal-overlay" onClick={() => setSocioSeleccionado(null)}>
          <div className="modal-pago" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSocioSeleccionado(null)}>×</button>
            
            <h3>Registrar Pago</h3>
            
            <div className="pago-info">
              <p><strong>Socio:</strong> {socioSeleccionado.nombre}</p>
              <p><strong>Email:</strong> {socioSeleccionado.email}</p>
              <p><strong>Cuota:</strong> $6,000 MXN</p>
            </div>

            <div className="pago-form">
              <label>
                Fecha de pago:
                <input 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  id="fechaPago"
                />
              </label>

              <div className="cuotas-desglose">
                <h4>Desglose de cuotas:</h4>
                
                <div className="cuota-item">
                  <label>
                    <span>Cuota Club 738:</span>
                    <input 
                      type="number" 
                      defaultValue={CUOTA_CLUB}
                      id="cuotaClub"
                    />
                  </label>
                </div>

                <div className="cuota-item">
                  <label>
                    <span>Cuota FEMETI {esSocioNuevo(socioSeleccionado.fechaAlta) ? '(Nuevo)' : '(Socio)'}:</span>
                    <input 
                      type="number" 
                      defaultValue={esSocioNuevo(socioSeleccionado.fechaAlta) ? CUOTA_FEMETI_NUEVO : CUOTA_FEMETI_SOCIO}
                      id="cuotaFemeti"
                    />
                  </label>
                  <span className="cuota-hint">
                    {esSocioNuevo(socioSeleccionado.fechaAlta) 
                      ? `Alta: ${socioSeleccionado.fechaAlta?.toLocaleDateString('es-MX')} - Socio nuevo ($700)`
                      : `Socio existente ($350)`
                    }
                  </span>
                </div>

                <div className="cuota-total">
                  <strong>Total a cobrar:</strong>
                  <span id="totalCuotas">
                    ${(esSocioNuevo(socioSeleccionado.fechaAlta) ? CUOTA_CLUB + CUOTA_FEMETI_NUEVO : CUOTA_CLUB + CUOTA_FEMETI_SOCIO).toLocaleString('es-MX')} MXN
                  </span>
                </div>
              </div>

              <div className="metodo-pago">
                <span>Método de pago:</span>
                <div className="metodo-opciones">
                  <label className="metodo-option">
                    <input 
                      type="radio" 
                      name="metodoPago" 
                      value="efectivo" 
                      defaultChecked 
                    />
                    <span>💵 Efectivo</span>
                  </label>
                  <label className="metodo-option">
                    <input 
                      type="radio" 
                      name="metodoPago" 
                      value="transferencia" 
                    />
                    <span>🏦 Transferencia</span>
                  </label>
                </div>
              </div>
              
              <label>
                Referencia/Comprobante (opcional):
                <input 
                  type="text" 
                  placeholder="Ej: Folio #12345"
                  id="comprobantePago"
                />
              </label>
            </div>

            <div className="pago-actions">
              <button 
                className="btn-cancelar"
                onClick={() => setSocioSeleccionado(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar"
                disabled={registrandoPago}
                onClick={() => {
                  const fechaStr = document.getElementById('fechaPago').value;
                  const datosPago = {
                    fechaPago: new Date(fechaStr + 'T12:00:00'),
                    cuotaClub: parseFloat(document.getElementById('cuotaClub').value),
                    cuotaFemeti: parseFloat(document.getElementById('cuotaFemeti').value),
                    metodoPago: document.querySelector('input[name="metodoPago"]:checked').value,
                    comprobante: document.getElementById('comprobantePago').value
                  };
                  registrarPago(socioSeleccionado.email, datosPago);
                }}
              >
                {registrandoPago ? 'Registrando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info de resultados */}
      <div className="resultados-info">
        Mostrando {sociosFiltrados.length} de {socios.length} socios
      </div>
    </div>
  );
}

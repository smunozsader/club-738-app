import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp, query, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './CobranzaUnificada.css';

/**
 * CobranzaUnificada - Panel único de cobranza para el Secretario
 * 
 * Integra las funciones de:
 * - RegistroPagos (registrar pagos)
 * - ReporteCaja (ver estado de cobranzas)
 * - DashboardRenovaciones (seguimiento)
 * 
 * FUENTE DE VERDAD: renovacion2026 en Firestore
 */

const CONCEPTO_PAGO = {
  cuota_anual: 6000,
  femeti_socio: 350,
  femeti_nuevo: 700,
  inscripcion: 2000
};

const METODOS_PAGO = [
  { id: 'efectivo', nombre: '💵 Efectivo' },
  { id: 'transferencia', nombre: '🏦 Transferencia Bancaria' },
  { id: 'tarjeta', nombre: '💳 Tarjeta' },
  { id: 'cheque', nombre: '📝 Cheque' }
];

export default function CobranzaUnificada({ onBack }) {
  const [vistaActual, setVistaActual] = useState('estado'); // estado, registrar, reportes, detalles
  const [loading, setLoading] = useState(true);
  const [socios, setSocios] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre');

  // Form registrar pago
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [formPago, setFormPago] = useState({
    cuota_anual: false,
    femeti_socio: false,
    femeti_nuevo: false,
    inscripcion: false,
    metodoPago: 'efectivo',
    fechaPago: new Date().toISOString().split('T')[0],
    comprobante: '',
    notas: ''
  });

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const sociosRef = collection(db, 'socios');
      const snapshot = await getDocs(sociosRef);

      const sociosList = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const renovacion = data.renovacion2026 || {};

        // ========================================
        // SOPORTAR 2 ESTRUCTURAS DE DATOS
        // ========================================
        
        let pagos = [];
        let montoPagado = 0;
        let estado = 'pendiente';

        // ESTRUCTURA NUEVA: array de pagos individuales
        if (renovacion.pagos && Array.isArray(renovacion.pagos) && renovacion.pagos.length > 0) {
          pagos = renovacion.pagos;
          montoPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
          
          // Estado: pagado si cumple una de estas condiciones:
          // 1. Está marcado explícitamente como pagado EN renovacion2026.estado
          // 2. Es socio nuevo: tiene inscripción + anualidad + FEMETI
          // 3. Es socio antiguo: tiene anualidad + FEMETI (sin necesidad de inscripción)
          const conceptosPagados = pagos.map(p => p.concepto);
          const tieneCuota = conceptosPagados.includes('cuota_anual');
          const tieneFemeti = conceptosPagados.includes('femeti_socio') || conceptosPagados.includes('femeti_nuevo');
          const tieneInscripcion = conceptosPagados.includes('inscripcion');
          
          // Pagado si: (cuota + FEMETI) OR (cuota + FEMETI + inscripción)
          const pagoCopleto = tieneCuota && tieneFemeti;
          
          // Si renovacion.estado está explícitamente set, respetarlo
          if (renovacion.estado === 'pagado') {
            estado = 'pagado';
          } else {
            estado = renovacion.exento ? 'exento' : (pagoCopleto ? 'pagado' : 'pendiente');
          }
        } 
        // ESTRUCTURA VIEJA: campo montoPagado único (compatibilidad hacia atrás)
        else if (renovacion.estado === 'pagado' || renovacion.montoPagado) {
          montoPagado = renovacion.montoPagado || 0;
          estado = renovacion.estado || 'pagado';
          
          // Convertir estructura vieja a array de pagos para mostrar
          if (montoPagado > 0) {
            pagos = [{
              concepto: 'desglose',
              monto: montoPagado,
              desglose: renovacion.desglose || null,
              metodoPago: renovacion.metodoPago || null,
              fechaPago: renovacion.fechaPago || null,
              comprobante: renovacion.comprobante || null,
              notas: renovacion.notas || null,
              registradoPor: renovacion.registradoPor || 'sistema',
              fechaRegistro: renovacion.fecha || null
            }];
          }
        }
        // Exento
        else if (renovacion.exento) {
          estado = 'exento';
        }
        
        sociosList.push({
          email: doc.id,
          nombre: data.nombre || doc.id,
          noSocio: data.noSocio || '-',
          telefono: data.telefono || '-',
          estado: estado,
          exento: renovacion.exento || false,
          motivoExencion: renovacion.motivoExencion || null,
          montoPagado: montoPagado,
          pagos: pagos,
          fechaLimite: renovacion.fechaLimite?.toDate() || new Date('2026-02-28'),
          cuotaClub: CONCEPTO_PAGO.cuota_anual,
          cuotaFemeti: CONCEPTO_PAGO.femeti_socio
        });
      });

      // Ordenar por nombre
      sociosList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setSocios(sociosList);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const sociosFiltrados = socios
    .filter(s => {
      if (filtroEstado === 'pagados' && s.estado !== 'pagado') return false;
      if (filtroEstado === 'pendientes' && s.estado !== 'pendiente') return false;
      if (filtroEstado === 'exentos' && !s.exento) return false;
      if (busqueda && !s.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (ordenarPor === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (ordenarPor === 'noSocio') return a.noSocio.localeCompare(b.noSocio);
      if (ordenarPor === 'estado') {
        const orden = { pagado: 0, pendiente: 1, exento: 2, vencido: 3 };
        return (orden[a.estado] || 999) - (orden[b.estado] || 999);
      }
      return 0;
    });

  const handleRegistrarPago = async () => {
    if (!socioSeleccionado) {
      alert('Selecciona un socio');
      return;
    }

    const conceptosSeleccionados = Object.keys(formPago).filter(
      key => key !== 'metodoPago' && key !== 'fechaPago' && key !== 'comprobante' && key !== 'notas' && formPago[key]
    );

    if (conceptosSeleccionados.length === 0) {
      alert('Selecciona al menos un concepto de pago');
      return;
    }

    try {
      setGuardando(true);

      // Crear array de pagos individuales (uno por cada concepto)
      const nuevosPagos = conceptosSeleccionados.map(concepto => ({
        concepto: concepto,
        monto: CONCEPTO_PAGO[concepto] || 0,
        metodoPago: formPago.metodoPago,
        fechaPago: Timestamp.fromDate(new Date(formPago.fechaPago)),
        comprobante: formPago.comprobante,
        notas: formPago.notas,
        registradoPor: 'secretario', // TODO: obtener usuario actual
        fechaRegistro: Timestamp.now()
      }));

      // Obtener pagos existentes
      const socioRef = doc(db, 'socios', socioSeleccionado.email);
      const socioSnap = await getDoc(socioRef);
      const pagosExistentes = socioSnap.data()?.renovacion2026?.pagos || [];

      // Fusionar pagos (evitar duplicados por concepto)
      const pagosFiltrados = pagosExistentes.filter(
        p => !conceptosSeleccionados.includes(p.concepto)
      );
      const todosPagos = [...pagosFiltrados, ...nuevosPagos];

      // Guardar array completo de pagos
      await updateDoc(socioRef, {
        'renovacion2026.pagos': todosPagos
      });

      alert('✅ Pago registrado correctamente');
      await cargarSocios();
      setSocioSeleccionado(null);
      setFormPago({
        cuota_anual: false,
        femeti_socio: false,
        femeti_nuevo: false,
        inscripcion: false,
        metodoPago: 'efectivo',
        fechaPago: new Date().toISOString().split('T')[0],
        comprobante: '',
        notas: ''
      });
      setVistaActual('estado');
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error al registrar pago');
    } finally {
      setGuardando(false);
    }
  };

  const calcularResumen = () => {
    const pagados = socios.filter(s => s.estado === 'pagado').length;
    const pendientes = socios.filter(s => s.estado === 'pendiente').length;
    const exentos = socios.filter(s => s.exento).length;
    const recaudado = socios
      .filter(s => s.estado === 'pagado')
      .reduce((sum, s) => sum + (s.montoPagado || 0), 0);

    return { pagados, pendientes, exentos, recaudado };
  };

  const exportarExcel = () => {
    const headers = ['Email', 'Nombre', 'No. Socio', 'Estado', 'Monto', 'Fecha Pago', 'Método', 'Comprobante'];
    const rows = sociosFiltrados.map(s => [
      s.email,
      s.nombre,
      s.noSocio,
      s.estado.toUpperCase(),
      s.montoPagado || '0',
      s.fechaPago ? s.fechaPago.toLocaleDateString('es-MX') : '-',
      s.metodoPago || '-',
      s.comprobante || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cobranzas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resumen = calcularResumen();

  if (loading) {
    return <div className="cobranza-loading">Cargando datos de cobranza...</div>;
  }

  return (
    <div className="cobranza-container">
      <header className="cobranza-header">
        <h1>💰 Panel de Cobranza 2026</h1>
        <p>Gestión centralizada de pagos y renovaciones</p>
        <button className="btn-back" onClick={onBack}>← Volver</button>
      </header>

      {/* TABS */}
      <div className="cobranza-tabs">
        <button
          className={`tab ${vistaActual === 'estado' ? 'active' : ''}`}
          onClick={() => setVistaActual('estado')}
        >
          📊 Estado de Cobranzas ({sociosFiltrados.length})
        </button>
        <button
          className={`tab ${vistaActual === 'registrar' ? 'active' : ''}`}
          onClick={() => setVistaActual('registrar')}
        >
          ➕ Registrar Pago
        </button>
        <button
          className={`tab ${vistaActual === 'reportes' ? 'active' : ''}`}
          onClick={() => setVistaActual('reportes')}
        >
          📈 Reportes
        </button>
      </div>

      {/* VISTA: ESTADO DE COBRANZAS */}
      {vistaActual === 'estado' && (
        <div className="vista-estado">
          {/* CONTADORES */}
          <div className="contadores-grid">
            <div className="contador pagados">
              <div className="contador-num">{resumen.pagados}</div>
              <div className="contador-label">Pagados</div>
            </div>
            <div className="contador pendientes">
              <div className="contador-num">{resumen.pendientes}</div>
              <div className="contador-label">Pendientes</div>
            </div>
            <div className="contador exentos">
              <div className="contador-num">{resumen.exentos}</div>
              <div className="contador-label">Exentos</div>
            </div>
            <div className="contador recaudado">
              <div className="contador-num">${resumen.recaudado.toLocaleString('es-MX')}</div>
              <div className="contador-label">Recaudado</div>
            </div>
          </div>

          {/* CONTROLES */}
          <div className="controles-cobranza">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o email"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />

            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="select-filtro">
              <option value="todos">Todos los socios</option>
              <option value="pagados">✅ Pagados</option>
              <option value="pendientes">⏳ Pendientes</option>
              <option value="exentos">⚪ Exentos</option>
            </select>

            <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="select-orden">
              <option value="nombre">Ordenar: Nombre</option>
              <option value="noSocio">Ordenar: No. Socio</option>
              <option value="estado">Ordenar: Estado</option>
            </select>

            <button className="btn-exportar" onClick={exportarExcel}>
              📥 Exportar Excel
            </button>
          </div>

          {/* TABLA DE SOCIOS */}
          <div className="tabla-cobranza">
            <table>
              <thead>
                <tr>
                  <th>No. Socio</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Monto</th>
                  <th>Fecha Pago</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sociosFiltrados.map(socio => (
                  <tr key={socio.email} className={`estado-${socio.estado}`}>
                    <td>{socio.noSocio}</td>
                    <td>
                      <span className="socio-nombre">{socio.nombre}</span>
                      <span className="socio-email">{socio.email}</span>
                    </td>
                    <td>
                      <span className={`badge estado-${socio.estado}`}>
                        {socio.estado === 'pagado' && '✅ Pagado'}
                        {socio.estado === 'pendiente' && '⏳ Pendiente'}
                        {socio.exento && '⚪ Exento'}
                      </span>
                      {socio.exento && socio.motivoExencion && (
                        <div className="motivo-exencion">{socio.motivoExencion}</div>
                      )}
                    </td>
                    <td className="monto">${socio.montoPagado?.toLocaleString('es-MX') || '-'}</td>
                    <td className="fecha">
                      {socio.pagos?.length > 0 
                        ? socio.pagos[0].fechaPago?.toDate?.().toLocaleDateString('es-MX') 
                        : '-'
                      }
                    </td>
                    <td>{socio.pagos?.[0]?.metodoPago || '-'}</td>
                    <td>
                      <button
                        className="btn-detalles"
                        onClick={() => {
                          setSocioSeleccionado(socio);
                          setVistaActual('detalles');
                        }}
                      >
                        📋 Ver pagos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA: REGISTRAR PAGO */}
      {vistaActual === 'registrar' && (
        <div className="vista-registrar">
          <div className="panel-registrar">
            {!socioSeleccionado ? (
              <div className="seleccionar-socio">
                <h2>Selecciona un socio</h2>
                <div className="lista-socios-compact">
                  <input
                    type="text"
                    placeholder="🔍 Buscar socio"
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="input-busqueda"
                  />
                  {socios
                    .filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                    .map(s => (
                      <button
                        key={s.email}
                        className="btn-socio"
                        onClick={() => {
                          setSocioSeleccionado(s);
                          setBusqueda('');
                        }}
                      >
                        <div className="socio-nombre">{s.nombre}</div>
                        <div className="socio-meta">{s.email} • {s.noSocio}</div>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <form className="form-pago">
                <div className="socio-selected">
                  <h2>{socioSeleccionado.nombre}</h2>
                  <p>{socioSeleccionado.email}</p>
                  <button
                    type="button"
                    className="btn-cambiar-socio"
                    onClick={() => setSocioSeleccionado(null)}
                  >
                    Cambiar socio
                  </button>
                </div>

                {/* PAGOS YA REGISTRADOS */}
                {socioSeleccionado.pagos && socioSeleccionado.pagos.length > 0 && (
                  <div className="pagos-registrados">
                    <h3>✅ Pagos ya registrados</h3>
                    <div className="pagos-list">
                      {socioSeleccionado.pagos.map((pago, idx) => (
                        <div key={idx} className="pago-item">
                          <span className="pago-concepto">
                            {pago.concepto === 'cuota_anual' && '📅 Cuota Anual'}
                            {pago.concepto === 'femeti_socio' && '🏆 FEMETI Socio'}
                            {pago.concepto === 'femeti_nuevo' && '🆕 FEMETI Nuevo'}
                            {pago.concepto === 'inscripcion' && '📝 Inscripción'}
                            {pago.concepto === 'otros' && '📌 Otros'}
                          </span>
                          <span className="pago-monto">${pago.monto?.toLocaleString('es-MX')}</span>
                          <span className="pago-fecha">
                            {pago.fechaPago?.toDate?.().toLocaleDateString('es-MX') || '-'}
                          </span>
                        </div>
                      ))}
                      <div className="pago-total">
                        <strong>Total pagado: ${socioSeleccionado.montoPagado?.toLocaleString('es-MX')}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <h3>Conceptos de Pago</h3>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={formPago.cuota_anual}
                      onChange={(e) => setFormPago({ ...formPago, cuota_anual: e.target.checked })}
                    />
                    <span>Cuota Anual 2026: ${CONCEPTO_PAGO.cuota_anual.toLocaleString()}</span>
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={formPago.femeti_socio}
                      onChange={(e) => setFormPago({ ...formPago, femeti_socio: e.target.checked })}
                    />
                    <span>FEMETI Socio: ${CONCEPTO_PAGO.femeti_socio.toLocaleString()}</span>
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={formPago.inscripcion}
                      onChange={(e) => setFormPago({ ...formPago, inscripcion: e.target.checked })}
                    />
                    <span>Inscripción (nuevo): ${CONCEPTO_PAGO.inscripcion.toLocaleString()}</span>
                  </label>
                </div>

                <div className="form-section">
                  <h3>Datos del Pago</h3>
                  <label>
                    Fecha de pago:
                    <input
                      type="date"
                      value={formPago.fechaPago}
                      onChange={(e) => setFormPago({ ...formPago, fechaPago: e.target.value })}
                    />
                  </label>

                  <label>
                    Método de pago:
                    <select
                      value={formPago.metodoPago}
                      onChange={(e) => setFormPago({ ...formPago, metodoPago: e.target.value })}
                    >
                      {METODOS_PAGO.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Comprobante/Recibo:
                    <input
                      type="text"
                      value={formPago.comprobante}
                      onChange={(e) => setFormPago({ ...formPago, comprobante: e.target.value })}
                      placeholder="Ej: REC-2026-001"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-registrar-pago"
                    onClick={handleRegistrarPago}
                    disabled={guardando}
                  >
                    {guardando ? '⏳ Registrando...' : '✅ Registrar Pago'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => {
                      setSocioSeleccionado(null);
                      setFormPago({
                        cuota_anual: false,
                        femeti_socio: false,
                        femeti_nuevo: false,
                        inscripcion: false,
                        metodoPago: 'efectivo',
                        fechaPago: new Date().toISOString().split('T')[0],
                        comprobante: '',
                        notas: ''
                      });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VISTA: DETALLES DE PAGOS */}
      {vistaActual === 'detalles' && socioSeleccionado && (
        <div className="vista-detalles">
          <div className="panel-detalles">
            <div className="detalles-header">
              <button className="btn-volver" onClick={() => {
                setVistaActual('estado');
                setSocioSeleccionado(null);
              }}>← Volver</button>
              <h2>{socioSeleccionado.nombre}</h2>
              <p>{socioSeleccionado.email}</p>
            </div>

            <div className="detalles-content">
              {socioSeleccionado.pagos && socioSeleccionado.pagos.length > 0 ? (
                <div className="tabla-pagos">
                  <table>
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Método</th>
                        <th>Comprobante</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socioSeleccionado.pagos.map((pago, idx) => (
                        <tr key={idx}>
                          <td className="concepto">
                            {pago.concepto === 'cuota_anual' && '📅 Cuota Anual'}
                            {pago.concepto === 'femeti_socio' && '🏆 FEMETI Socio'}
                            {pago.concepto === 'femeti_nuevo' && '🆕 FEMETI Nuevo'}
                            {pago.concepto === 'inscripcion' && '📝 Inscripción'}
                            {pago.concepto === 'otros' && '📌 Otros'}
                            {pago.concepto === 'desglose' && '💰 Pago Completo'}
                          </td>
                          <td className="monto">
                            ${pago.monto?.toLocaleString('es-MX') || 0}
                            {pago.desglose && (
                              <div className="desglose-info">
                                {pago.desglose.inscripcion && <span>Insc: ${pago.desglose.inscripcion}</span>}
                                {pago.desglose.anualidad && <span>Anu: ${pago.desglose.anualidad}</span>}
                                {pago.desglose.femeti && <span>FEMETI: ${pago.desglose.femeti}</span>}
                              </div>
                            )}
                          </td>
                          <td className="fecha">
                            {pago.fechaPago?.toDate?.().toLocaleDateString('es-MX') || 
                             (pago.fecha?._seconds ? new Date(pago.fecha._seconds * 1000).toLocaleDateString('es-MX') : '-')}
                          </td>
                          <td>{pago.metodoPago || '-'}</td>
                          <td>{pago.comprobante || '-'}</td>
                          <td className="notas">{pago.notas || '-'}</td>
                        </tr>
                      ))}
                      <tr className="fila-total">
                        <td><strong>TOTAL PAGADO</strong></td>
                        <td colSpan="5"><strong>${socioSeleccionado.montoPagado?.toLocaleString('es-MX') || 0}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="sin-pagos">
                  <p>📭 Este socio no tiene pagos registrados</p>
                  <button className="btn-registrar" onClick={() => setVistaActual('registrar')}>
                    ➕ Registrar pago
                  </button>
                </div>
              )}

              <div className="detalles-acciones">
                <button className="btn-registrar-mas" onClick={() => setVistaActual('registrar')}>
                  ➕ Agregar otro pago
                </button>
                <button className="btn-volver-lista" onClick={() => {
                  setVistaActual('estado');
                  setSocioSeleccionado(null);
                }}>
                  ← Volver a lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: REPORTES */}
      {vistaActual === 'reportes' && (
        <div className="vista-reportes">
          <div className="reporte-seccion">
            <h2>📈 Resumen de Cobranzas 2026</h2>

            <div className="reporte-grid">
              <div className="reporte-card">
                <h3>Total de Socios</h3>
                <div className="reporte-valor">{socios.length}</div>
              </div>

              <div className="reporte-card">
                <h3>Socios Pagados</h3>
                <div className="reporte-valor">
                  {resumen.pagados} <span className="reporte-pct">({((resumen.pagados / socios.length) * 100).toFixed(1)}%)</span>
                </div>
              </div>

              <div className="reporte-card">
                <h3>Socios Pendientes</h3>
                <div className="reporte-valor">
                  {resumen.pendientes} <span className="reporte-pct">({((resumen.pendientes / socios.length) * 100).toFixed(1)}%)</span>
                </div>
              </div>

              <div className="reporte-card">
                <h3>Socios Exentos</h3>
                <div className="reporte-valor">{resumen.exentos}</div>
              </div>

              <div className="reporte-card total">
                <h3>Total Recaudado</h3>
                <div className="reporte-valor">${resumen.recaudado.toLocaleString('es-MX')}</div>
              </div>

              <div className="reporte-card meta">
                <h3>Meta 2026</h3>
                <div className="reporte-valor">${(socios.length * CONCEPTO_PAGO.cuota_anual).toLocaleString('es-MX')}</div>
                <div className="reporte-progress">
                  <div className="progress-bar" style={{ width: `${(resumen.recaudado / (socios.length * CONCEPTO_PAGO.cuota_anual)) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="metodos-pago">
              <h3>Pagos por Método</h3>
              <div className="metodos-list">
                {Object.entries(
                  socios
                    .filter(s => s.estado === 'pagado')
                    .reduce((acc, s) => {
                      acc[s.metodoPago] = (acc[s.metodoPago] || 0) + 1;
                      return acc;
                    }, {})
                ).map(([metodo, cantidad]) => (
                  <div key={metodo} className="metodo-item">
                    <span>{metodo || 'Sin especificar'}</span>
                    <span className="cantidad">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

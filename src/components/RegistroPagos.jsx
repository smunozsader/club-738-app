/**
 * RegistroPagos - Módulo de cobranza para el Secretario
 * 
 * Permite:
 * - Registrar pagos de cuota anual
 * - Registrar pagos de FEMETI
 * - Vincular pagos con solicitudes PETA
 * - Ver historial de pagos por socio
 * - Activar membresía 2026
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CONCEPTOS_PAGO_2026, METODOS_PAGO, COMBOS_PAGO, calcularTotalPago } from '../utils/conceptosPago';
import './RegistroPagos.css';

// Usar la configuración centralizada
const CONCEPTOS_PAGO = CONCEPTOS_PAGO_2026;

export default function RegistroPagos({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Form data
  const [conceptosSeleccionados, setConceptosSeleccionados] = useState({
    cuota_anual: true,
    femeti: true,
    inscripcion: false,
    femeti_nuevo: false
  });
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [numeroRecibo, setNumeroRecibo] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const sociosRef = collection(db, 'socios');
      const sociosSnap = await getDocs(sociosRef);
      
      const sociosList = sociosSnap.docs.map(doc => ({
        email: doc.id,
        nombre: doc.data().nombre || doc.id,
        curp: doc.data().curp,
        fechaAlta: doc.data().fechaAlta,
        totalArmas: doc.data().totalArmas || 0,
        pagos: doc.data().pagos || [],
        membresia2026: doc.data().membresia2026 || null
      }));
      
      // Ordenar por nombre
      sociosList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      setSocios(sociosList);
    } catch (error) {
      console.error('Error cargando socios:', error);
      alert('Error al cargar datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarSocio = (socio) => {
    setSocioSeleccionado(socio);
    
    // Auto-detectar si es socio nuevo (inscripción reciente)
    const esSocioNuevo = socio.fechaAlta && 
      (new Date().getTime() - socio.fechaAlta.toDate().getTime()) < 90 * 24 * 60 * 60 * 1000; // Menos de 90 días
    
    setConceptosSeleccionados({
      cuota_anual: true,
      femeti: !esSocioNuevo,
      inscripcion: esSocioNuevo,
      femeti_nuevo: esSocioNuevo
    });
    
    // Generar número de recibo sugerido
    const fecha = new Date();
    const sugerencia = `REC-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    setNumeroRecibo(sugerencia);
  };

  const toggleConcepto = (concepto) => {
    setConceptosSeleccionados({
      ...conceptosSeleccionados,
      [concepto]: !conceptosSeleccionados[concepto]
    });
  };

  const calcularTotal = () => {
    return calcularTotalPago(conceptosSeleccionados);
  };

  const registrarPago = async () => {
    if (!socioSeleccionado) {
      alert('Por favor selecciona un socio');
      return;
    }
    
    if (!numeroRecibo.trim()) {
      alert('Por favor ingresa el número de recibo');
      return;
    }
    
    const total = calcularTotal();
    if (total === 0) {
      alert('Por favor selecciona al menos un concepto de pago');
      return;
    }
    
    try {
      setGuardando(true);
      
      const conceptosPagados = Object.keys(conceptosSeleccionados)
        .filter(c => conceptosSeleccionados[c])
        .map(c => ({
          concepto: c,
          nombre: CONCEPTOS_PAGO[c].nombre,
          monto: CONCEPTOS_PAGO[c].monto
        }));
      
      const registroPago = {
        fecha: Timestamp.fromDate(new Date(fechaPago)),
        conceptos: conceptosPagados,
        total: total,
        metodoPago: metodoPago,
        numeroRecibo: numeroRecibo,
        notas: notas,
        registradoPor: userEmail,
        fechaRegistro: Timestamp.now()
      };
      
      const socioRef = doc(db, 'socios', socioSeleccionado.email);
      
      // Calcular cuotas separadas para sincronizar con DashboardRenovaciones
      const cuotaClub = conceptosSeleccionados.cuota_anual ? CONCEPTOS_PAGO.cuota_anual.monto : 0;
      const cuotaFemeti = (conceptosSeleccionados.femeti ? CONCEPTOS_PAGO.femeti.monto : 0) +
                         (conceptosSeleccionados.femeti_nuevo ? CONCEPTOS_PAGO.femeti_nuevo.monto : 0);
      
      // Actualizar documento del socio
      // Sincronizar con renovacion2026 para que DashboardRenovaciones lo reconozca
      await updateDoc(socioRef, {
        pagos: arrayUnion(registroPago),
        membresia2026: {
          activa: true,
          fechaPago: Timestamp.fromDate(new Date(fechaPago)),
          monto: total,
          metodoPago: metodoPago,
          numeroRecibo: numeroRecibo
        },
        // Sincronizar con renovacion2026 para el panel de cobranza
        'renovacion2026.estado': 'pagado',
        'renovacion2026.fechaPago': Timestamp.fromDate(new Date(fechaPago)),
        'renovacion2026.cuotaClub': cuotaClub,
        'renovacion2026.cuotaFemeti': cuotaFemeti,
        'renovacion2026.montoTotal': total,
        'renovacion2026.metodoPago': metodoPago,
        'renovacion2026.comprobante': numeroRecibo,
        'renovacion2026.registradoPor': userEmail,
        ultimaActualizacion: Timestamp.now()
      });
      
      alert(`✅ Pago registrado exitosamente\n\nTotal: $${total.toLocaleString('es-MX')}\nRecibo: ${numeroRecibo}`);
      
      // Limpiar form
      setSocioSeleccionado(null);
      setNumeroRecibo('');
      setNotas('');
      setFechaPago(new Date().toISOString().split('T')[0]);
      
      // Recargar datos
      await cargarSocios();
      
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error al registrar pago. Por favor intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando datos de socios...</div>;
  }

  const sociosFiltrados = socios.filter(s => 
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const total = calcularTotal();

  return (
    <div className="registro-pagos-container">
      <div className="registro-pagos-header">
        <h2>💰 Registro de Pagos</h2>
        <p className="subtitle">Módulo de cobranza y activación de membresías</p>
      </div>

      <div className="pagos-layout">
        {/* Lista de socios */}
        <div className="socios-panel">
          <div className="panel-header">
            <h3>Seleccionar Socio</h3>
            <input
              id="pagos-busqueda"
              type="text"
              name="busqueda"
              placeholder="Buscar socio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
              aria-label="Buscar socio por nombre o email"
            />
          </div>
          
          <div className="socios-list">
            {sociosFiltrados.map(socio => (
              <div 
                key={socio.email} 
                className={`socio-item ${socioSeleccionado?.email === socio.email ? 'selected' : ''}`}
                onClick={() => seleccionarSocio(socio)}
              >
                <div className="socio-info">
                  <div className="socio-nombre">{socio.nombre}</div>
                  <div className="socio-email">{socio.email}</div>
                </div>
                {socio.membresia2026?.activa && (
                  <span className="badge-pagado">✅ Pagado 2026</span>
                )}
                {!socio.membresia2026?.activa && (
                  <span className="badge-pendiente">⏳ Pendiente</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form de registro */}
        <div className="pago-form-panel">
          {!socioSeleccionado ? (
            <div className="empty-selection">
              <div className="empty-icon">💳</div>
              <p>Selecciona un socio para registrar su pago</p>
            </div>
          ) : (
            <>
              <div className="form-header">
                <div>
                  <h3>{socioSeleccionado.nombre}</h3>
                  <p className="socio-email">{socioSeleccionado.email}</p>
                </div>
                {socioSeleccionado.membresia2026?.activa && (
                  <div className="membresia-activa-badge">
                    <span className="badge-icono">✅</span>
                    <div>
                      <div className="badge-titulo">Membresía 2026 Activa</div>
                      <div className="badge-detalle">
                        Pagado: {socioSeleccionado.membresia2026.fechaPago?.toDate().toLocaleDateString('es-MX')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-content">
                {/* Conceptos */}
                <div className="form-section">
                  <h4>Conceptos a pagar</h4>
                  <div className="conceptos-list">
                    {Object.keys(CONCEPTOS_PAGO).map(concepto => (
                      <label key={concepto} htmlFor={`concepto-${concepto}`} className="concepto-item">
                        <input
                          id={`concepto-${concepto}`}
                          type="checkbox"
                          name={`concepto-${concepto}`}
                          checked={conceptosSeleccionados[concepto]}
                          onChange={() => toggleConcepto(concepto)}
                          aria-label={`${CONCEPTOS_PAGO[concepto].nombre} - $${CONCEPTOS_PAGO[concepto].monto}`}
                        />
                        <span className="concepto-nombre">{CONCEPTOS_PAGO[concepto].nombre}</span>
                        <span className="concepto-monto">
                          ${CONCEPTOS_PAGO[concepto].monto.toLocaleString('es-MX')}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="total-box">
                    <span className="total-label">TOTAL:</span>
                    <span className="total-monto">${total.toLocaleString('es-MX')} MXN</span>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="form-section">
                  <h4>Método de pago</h4>
                  <div className="metodos-grid">
                    {METODOS_PAGO.map(metodo => (
                      <label key={metodo.id} htmlFor={`metodo-${metodo.id}`} className={`metodo-option ${metodoPago === metodo.id ? 'active' : ''}`}>
                        <input
                          id={`metodo-${metodo.id}`}
                          type="radio"
                          name="metodoPago"
                          value={metodo.id}
                          checked={metodoPago === metodo.id}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          aria-label={`Método de pago: ${metodo.nombre}`}
                        />
                        <span>{metodo.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fecha y recibo */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="pagos-fecha">Fecha de pago:</label>
                      <input
                        id="pagos-fecha"
                        type="date"
                        name="fechaPago"
                        value={fechaPago}
                        onChange={(e) => setFechaPago(e.target.value)}
                        aria-label="Fecha del pago"
                        aria-required="true"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="pagos-recibo">Número de recibo:</label>
                      <input
                        id="pagos-recibo"
                        type="text"
                        name="numeroRecibo"
                        value={numeroRecibo}
                        onChange={(e) => setNumeroRecibo(e.target.value)}
                        placeholder="REC-2026-01-0001"
                        aria-label="Número de recibo del pago"
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="form-section">
                  <h4>Notas adicionales (opcional)</h4>
                  <textarea
                    id="pagos-notas"
                    name="notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Observaciones, detalles de la transacción, etc."
                    rows="3"
                    className="notas-textarea"
                    aria-label="Notas adicionales sobre el pago"
                  />
                </div>

                {/* Historial de pagos */}
                {socioSeleccionado.pagos && socioSeleccionado.pagos.length > 0 && (
                  <div className="form-section">
                    <h4>📜 Historial de pagos</h4>
                    <div className="historial-pagos">
                      {socioSeleccionado.pagos.slice().reverse().map((pago, idx) => (
                        <div key={idx} className="pago-historial-item">
                          <div className="pago-fecha">
                            {pago.fecha?.toDate().toLocaleDateString('es-MX', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="pago-detalles">
                            {pago.conceptos.map((c, i) => (
                              <span key={i} className="concepto-tag">{c.nombre}</span>
                            ))}
                          </div>
                          <div className="pago-total-hist">${pago.total.toLocaleString('es-MX')}</div>
                          <div className="pago-metodo">{pago.metodoPago}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="form-actions">
                  <button 
                    className="btn-cancelar"
                    onClick={() => setSocioSeleccionado(null)}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  
                  <button 
                    className="btn-registrar"
                    onClick={registrarPago}
                    disabled={guardando || total === 0}
                  >
                    {guardando ? 'Registrando...' : '💰 Registrar Pago y Activar Membresía'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

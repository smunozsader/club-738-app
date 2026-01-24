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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
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
  
  // Montos editables - permiten personalizar por concepto
  const [montosPersonalizados, setMontosPersonalizados] = useState({
    cuota_anual: CONCEPTOS_PAGO.cuota_anual.monto,
    femeti: CONCEPTOS_PAGO.femeti.monto,
    inscripcion: CONCEPTOS_PAGO.inscripcion.monto,
    femeti_nuevo: CONCEPTOS_PAGO.femeti_nuevo.monto
  });
  
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [numeroRecibo, setNumeroRecibo] = useState('');
  const [notas, setNotas] = useState('');
  const [recibidoPor, setRecibidoPor] = useState('secretario'); // secretario, presidente, elena_torres, otro
  const [recibidoPorOtro, setRecibidoPorOtro] = useState('');
  
  // Manejo de comprobantes de transferencia (hasta 3 archivos)
  const [comprobanteFiles, setComprobanteFiles] = useState([]);
  const [comprobantePreviews, setComprobantePreviews] = useState([]);
  const [subiendoComprobantes, setSubiendoComprobantes] = useState(false);

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

  const manejarComprobanteChange = (e) => {
    const files = e.target.files;
    if (!files) return;

    // Permitir hasta 3 archivos
    const nuevosArchivos = Array.from(files).slice(0, 3 - comprobanteFiles.length);
    
    if (comprobanteFiles.length + nuevosArchivos.length > 3) {
      alert('Máximo 3 archivos permitidos');
      return;
    }

    const archivosValidos = [];
    const nuevosPreviews = [];

    nuevosArchivos.forEach(file => {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!tiposPermitidos.includes(file.type)) {
        alert(`"${file.name}" no es un formato válido. Solo JPG, PNG, GIF, WebP o PDF`);
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" supera 5MB`);
        return;
      }

      archivosValidos.push(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        nuevosPreviews.push({
          url: evt.target?.result,
          tipo: file.type,
          nombre: file.name
        });

        if (nuevosPreviews.length === archivosValidos.length) {
          setComprobanteFiles([...comprobanteFiles, ...archivosValidos]);
          setComprobantePreviews([...comprobantePreviews, ...nuevosPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removerComprobante = (index) => {
    setComprobanteFiles(comprobanteFiles.filter((_, i) => i !== index));
    setComprobantePreviews(comprobantePreviews.filter((_, i) => i !== index));
  };

  const subirComprobantes = async () => {
    if (comprobanteFiles.length === 0) return [];

    // Validación previo a subir
    if (!socioSeleccionado?.email) {
      alert('Error: No hay socio seleccionado');
      return [];
    }

    try {
      setSubiendoComprobantes(true);
      const urls = [];
      const email = socioSeleccionado.email.toLowerCase();

      for (let i = 0; i < comprobanteFiles.length; i++) {
        const file = comprobanteFiles[i];
        
        // Validar que es un File válido
        if (!file || !(file instanceof File)) {
          console.error(`Archivo ${i} no es válido:`, file);
          alert(`Archivo ${i + 1} no es válido. Por favor recarga.`);
          return [];
        }

        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const nombreArchivo = `transferencia-${timestamp}-${i}.${extension}`;

        console.log(`Subiendo archivo ${i + 1}/${comprobanteFiles.length}: ${nombreArchivo}`);

        const storageRef = ref(storage, `documentos/${email}/transferencias/${nombreArchivo}`);
        
        // Subir con reintento
        let intento = 0;
        let uploadExitoso = false;
        let urlDescarga = null;

        while (intento < 3 && !uploadExitoso) {
          try {
            intento++;
            console.log(`Intento ${intento}/3 para ${nombreArchivo}`);
            
            await uploadBytes(storageRef, file);
            urlDescarga = await getDownloadURL(storageRef);
            uploadExitoso = true;
            
            console.log(`✅ Subido exitosamente: ${nombreArchivo}`);
            urls.push(urlDescarga);
          } catch (uploadError) {
            console.error(`Intento ${intento} fallido:`, uploadError);
            if (intento === 3) {
              throw new Error(`No se pudo subir ${file.name} después de 3 intentos: ${uploadError.message}`);
            }
            // Esperar 1 segundo antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (urls.length !== comprobanteFiles.length) {
        throw new Error(`Solo se subieron ${urls.length}/${comprobanteFiles.length} archivos`);
      }

      console.log(`✅ Todos los archivos subidos exitosamente:`, urls);
      return urls;
    } catch (error) {
      console.error('Error completo al subir comprobantes:', error);
      alert(`Error al subir comprobantes: ${error.message}\n\nIntenta de nuevo o contacta soporte.`);
      return [];
    } finally {
      setSubiendoComprobantes(false);
    }
  };

  const calcularTotal = () => {
    let total = 0;
    Object.keys(conceptosSeleccionados).forEach(concepto => {
      if (conceptosSeleccionados[concepto]) {
        total += montosPersonalizados[concepto] || 0;
      }
    });
    return total;
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

    // Validar que si es transferencia, debe haber comprobante(s)
    if (metodoPago === 'transferencia' && comprobanteFiles.length === 0) {
      alert('Por favor carga al menos un comprobante de transferencia');
      return;
    }
    
    const total = calcularTotal();
    if (total === 0) {
      alert('Por favor selecciona al menos un concepto de pago');
      return;
    }
    
    try {
      setGuardando(true);
      
      // Subir comprobantes si es transferencia
      let comprobantesURLs = [];
      if (metodoPago === 'transferencia') {
        console.log(`Iniciando subida de ${comprobanteFiles.length} comprobante(s)...`);
        comprobantesURLs = await subirComprobantes();
        
        if (comprobantesURLs.length === 0) {
          console.error('Error: No se subieron comprobantes');
          setGuardando(false);
          return;
        }
        
        console.log(`✅ Subidos ${comprobantesURLs.length} comprobante(s)`);
      }
      
      const conceptosPagados = Object.keys(conceptosSeleccionados)
        .filter(c => conceptosSeleccionados[c])
        .map(c => ({
          concepto: c,
          nombre: CONCEPTOS_PAGO[c].nombre,
          monto: montosPersonalizados[c]  // Usar monto personalizado, no el por defecto
        }));
      
      const nombreRecibidoPor = recibidoPor === 'otro' ? recibidoPorOtro : {
        'secretario': 'Secretario (Admin)',
        'presidente': 'Presidente del Club',
        'elena_torres': 'Lic. Elena Torres',
      }[recibidoPor] || recibidoPorOtro;

      const registroPago = {
        fecha: Timestamp.fromDate(new Date(fechaPago)),
        conceptos: conceptosPagados,
        total: total,
        metodoPago: metodoPago,
        numeroRecibo: numeroRecibo,
        notas: notas,
        registradoPor: userEmail,
        recibidoPor: recibidoPor,
        recibidoPorNombre: nombreRecibidoPor,
        fechaRegistro: Timestamp.now(),
        comprobantesTransferencia: comprobantesURLs.length > 0 ? comprobantesURLs : null
      };
      
      const socioRef = doc(db, 'socios', socioSeleccionado.email);
      
      // Calcular cuotas separadas para sincronizar con DashboardRenovaciones
      const cuotaClub = conceptosSeleccionados.cuota_anual ? montosPersonalizados.cuota_anual : 0;
      const cuotaFemeti = (conceptosSeleccionados.femeti ? montosPersonalizados.femeti : 0) +
                         (conceptosSeleccionados.femeti_nuevo ? montosPersonalizados.femeti_nuevo : 0);
      const inscripcionMonto = conceptosSeleccionados.inscripcion ? montosPersonalizados.inscripcion : 0;
      
      // Determinar si es socio nuevo
      const esNuevo = conceptosSeleccionados.inscripcion || conceptosSeleccionados.femeti_nuevo;
      
      // Actualizar documento del socio
      // Sincronizar con renovacion2026 para que DashboardRenovaciones lo reconozca
      await updateDoc(socioRef, {
        pagos: arrayUnion(registroPago),
        membresia2026: {
          activa: true,
          fechaPago: Timestamp.fromDate(new Date(fechaPago)),
          monto: total,
          metodoPago: metodoPago,
          numeroRecibo: numeroRecibo,
          comprobantesTransferencia: comprobantesURLs.length > 0 ? comprobantesURLs : null,
          // Agregar desglose para que ReporteCaja pueda leer correctamente
          inscripcion: inscripcionMonto,
          cuotaClub: cuotaClub,
          cuotaFemeti: cuotaFemeti,
          esNuevo: esNuevo,
          desglose: {
            inscripcion: inscripcionMonto,
            anualidad: cuotaClub,
            femeti: cuotaFemeti
          }
        },
        // Sincronizar con renovacion2026 para el panel de cobranza
        'renovacion2026.estado': 'pagado',
        'renovacion2026.fechaPago': Timestamp.fromDate(new Date(fechaPago)),
        'renovacion2026.cuotaClub': cuotaClub,
        'renovacion2026.cuotaFemeti': cuotaFemeti,
        'renovacion2026.montoTotal': total,
        'renovacion2026.metodoPago': metodoPago,
        'renovacion2026.comprobante': numeroRecibo,
        'renovacion2026.comprobantesTransferencia': comprobantesURLs.length > 0 ? comprobantesURLs : null,
        'renovacion2026.registradoPor': userEmail,
        'renovacion2026.recibidoPor': recibidoPor,
        'renovacion2026.recibidoPorNombre': nombreRecibidoPor,
        ultimaActualizacion: Timestamp.now()
      });
      
      alert(`✅ Pago registrado exitosamente\n\nTotal: $${total.toLocaleString('es-MX')}\nRecibo: ${numeroRecibo}`);
      
      // Limpiar form
      setSocioSeleccionado(null);
      setNumeroRecibo('');
      setNotas('');
      setFechaPago(new Date().toISOString().split('T')[0]);
      setRecibidoPor('secretario');
      setRecibidoPorOtro('');
      setComprobanteFiles([]);
      setComprobantePreviews([]);
      
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
                      <div key={concepto} className="concepto-row">
                        <label htmlFor={`concepto-${concepto}`} className="concepto-item">
                          <input
                            id={`concepto-${concepto}`}
                            type="checkbox"
                            name={`concepto-${concepto}`}
                            checked={conceptosSeleccionados[concepto]}
                            onChange={() => toggleConcepto(concepto)}
                            aria-label={`${CONCEPTOS_PAGO[concepto].nombre} - $${montosPersonalizados[concepto]}`}
                          />
                          <span className="concepto-nombre">{CONCEPTOS_PAGO[concepto].nombre}</span>
                        </label>
                        <div className="concepto-monto-editable">
                          <span className="moneda">$</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={montosPersonalizados[concepto]}
                            onChange={(e) => setMontosPersonalizados({
                              ...montosPersonalizados,
                              [concepto]: parseFloat(e.target.value) || 0
                            })}
                            className="monto-input"
                            placeholder="0"
                            aria-label={`Monto para ${CONCEPTOS_PAGO[concepto].nombre}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="total-box">
                    <span className="total-label">TOTAL:</span>
                    <span className="total-monto">${total.toLocaleString('es-MX')} MXN</span>
                  </div>
                </div>

                {/* Recibido por */}
                <div className="form-section">
                  <h4>¿Quién recibió el pago?</h4>
                  <div className="recibido-por-grid">
                    <label htmlFor="recibido-secretario" className={`recibido-option ${recibidoPor === 'secretario' ? 'active' : ''}`}>
                      <input
                        id="recibido-secretario"
                        type="radio"
                        name="recibidoPor"
                        value="secretario"
                        checked={recibidoPor === 'secretario'}
                        onChange={(e) => setRecibidoPor(e.target.value)}
                      />
                      <span>🔐 Secretario (Admin)</span>
                    </label>
                    <label htmlFor="recibido-presidente" className={`recibido-option ${recibidoPor === 'presidente' ? 'active' : ''}`}>
                      <input
                        id="recibido-presidente"
                        type="radio"
                        name="recibidoPor"
                        value="presidente"
                        checked={recibidoPor === 'presidente'}
                        onChange={(e) => setRecibidoPor(e.target.value)}
                      />
                      <span>👔 Presidente</span>
                    </label>
                    <label htmlFor="recibido-elena" className={`recibido-option ${recibidoPor === 'elena_torres' ? 'active' : ''}`}>
                      <input
                        id="recibido-elena"
                        type="radio"
                        name="recibidoPor"
                        value="elena_torres"
                        checked={recibidoPor === 'elena_torres'}
                        onChange={(e) => setRecibidoPor(e.target.value)}
                      />
                      <span>👩 Lic. Elena Torres</span>
                    </label>
                    <label htmlFor="recibido-otro" className={`recibido-option ${recibidoPor === 'otro' ? 'active' : ''}`}>
                      <input
                        id="recibido-otro"
                        type="radio"
                        name="recibidoPor"
                        value="otro"
                        checked={recibidoPor === 'otro'}
                        onChange={(e) => setRecibidoPor(e.target.value)}
                      />
                      <span>❓ Otro</span>
                    </label>
                  </div>
                  {recibidoPor === 'otro' && (
                    <input
                      type="text"
                      placeholder="Especificar nombre de quién recibió"
                      value={recibidoPorOtro}
                      onChange={(e) => setRecibidoPorOtro(e.target.value)}
                      className="otra-persona-input"
                    />
                  )}
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

                {/* Comprobante de transferencia */}
                {metodoPago === 'transferencia' && (
                  <div className="form-section comprobante-section">
                    <h4>📸 Comprobantes de transferencia (hasta 3)</h4>
                    <p className="comprobante-help">Carga screenshots de WhatsApp, confirmación bancaria o PDFs de transferencia</p>
                    
                    {comprobantePreviews.length < 3 && (
                      <label htmlFor="comprobante-input" className="comprobante-upload">
                        <input
                          id="comprobante-input"
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                          onChange={manejarComprobanteChange}
                          className="file-input-hidden"
                          aria-label="Cargar comprobante de transferencia"
                        />
                        <div className="upload-area">
                          <span className="upload-icon">📤</span>
                          <span className="upload-text">
                            Haz clic para cargar o arrastra los archivos
                          </span>
                          <span className="upload-hint">JPG, PNG, GIF, WebP o PDF (máx. 5MB c/u)</span>
                          <span className="upload-count">
                            {comprobantePreviews.length}/3 archivos
                          </span>
                        </div>
                      </label>
                    )}

                    {comprobantePreviews.length > 0 && (
                      <div className="comprobantes-list">
                        <div className="comprobantes-grid">
                          {comprobantePreviews.map((preview, idx) => (
                            <div key={idx} className="comprobante-item">
                              <div className="preview-container-mini">
                                {preview.tipo.startsWith('image/') ? (
                                  <img src={preview.url} alt={`Comprobante ${idx + 1}`} className="preview-image-mini" />
                                ) : (
                                  <div className="preview-pdf-mini">
                                    <span className="pdf-icon-mini">📄</span>
                                  </div>
                                )}
                              </div>
                              <div className="comprobante-info">
                                <span className="comprobante-nombre">{preview.nombre}</span>
                                <button
                                  type="button"
                                  className="btn-remove-individual"
                                  onClick={() => removerComprobante(idx)}
                                  title="Remover archivo"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {comprobantePreviews.length < 3 && (
                          <label htmlFor="comprobante-input-adicional" className="comprobante-upload-adicional">
                            <input
                              id="comprobante-input-adicional"
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                              onChange={manejarComprobanteChange}
                              className="file-input-hidden"
                              aria-label="Cargar más comprobantes"
                            />
                            <span className="add-more-text">+ Agregar más</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

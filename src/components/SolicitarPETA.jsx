/**
 * SolicitarPETA - Formulario para que el socio solicite un PETA
 * 
 * Tipos:
 * - Práctica de Tiro: Solo campo de tiro del club (vigencia 1 año)
 * - Competencia Nacional: Hasta 10 estados (vigencia 1 año)
 * - Caza: Hasta 10 estados + licencia SEMARNAT (vigencia 1 año, Jul-Jun)
 */
import { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useToastContext } from '../contexts/ToastContext';
import { calcularMontoE5cinco, obtenerInfoPagoCompleta } from '../utils/pagosE5cinco';
import { getCartuchosPorDefecto } from '../utils/limitesCartuchos';
import SelectorEstadosFEMETI from './SelectorEstadosFEMETI';
import './SolicitarPETA.css';

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas'
];

// Estados sugeridos para Tiro Práctico/Competencia Nacional FEMETI 2026
// Basado en sedes de competencias nacionales registradas
const ESTADOS_SUGERIDOS_TIRO = [
  'Yucatán',           // Base del club
  'Baja California',   // Sede FEMETI
  'Coahuila',          // Sede FEMETI
  'Estado de México',  // Sede FEMETI
  'Guanajuato',        // Sede FEMETI
  'Hidalgo',           // Sede FEMETI
  'Jalisco',           // Sede FEMETI
  'Michoacán',         // Sede FEMETI
  'San Luis Potosí',   // Sede FEMETI
  'Tabasco'            // Sede FEMETI (región Sureste)
];

// Estados sugeridos para Caza (región Sureste y zonas cinégeticas populares)
const ESTADOS_SUGERIDOS_CAZA = [
  'Yucatán',           // Base del club
  'Campeche',          // Región Sureste - UMAs
  'Quintana Roo',      // Región Sureste - UMAs
  'Tabasco',           // Región Sureste
  'Chiapas',           // Región Sureste
  'Veracruz',          // Región Sureste
  'Tamaulipas',        // Zona cinégetica popular
  'Sonora'             // Zona cinégetica popular
];

export default function SolicitarPETA({ userEmail, targetEmail, onBack }) {
  // targetEmail: email del socio para quien se solicita (admin puede solicitarlo para otros)
  // userEmail: email del usuario autenticado (quien hace la solicitud)
  const emailSocio = targetEmail || userEmail; // Si es admin solicitando para otro, usa targetEmail
  const { showToast } = useToastContext();
  
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [socioData, setSocioData] = useState(null);
  const [armas, setArmas] = useState([]);
  const [esAdminSolicitando, setEsAdminSolicitando] = useState(false);
  
  // Formulario
  const [tipoPETA, setTipoPETA] = useState('tiro'); // tiro, competencia, caza
  const [esRenovacion, setEsRenovacion] = useState(false);
  const [petaAnterior, setPetaAnterior] = useState('');
  
  // Armas seleccionadas (máx 10)
  const [armasSeleccionadas, setArmasSeleccionadas] = useState([]);
  
  // Estados seleccionados (máx 10, solo para competencia/caza)
  // NOTA: Yucatán NO es obligatorio para PETAs nacionales
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
  
  // Modalidad FEMETI (solo para competencia)
  const [modalidadFEMETI, setModalidadFEMETI] = useState(null);
  
  // Dirección (pre-llenada desde Firestore)
  const [domicilio, setDomicilio] = useState({
    calle: '',
    colonia: '',
    cp: '',
    municipio: '',
    estado: ''
  });

  useEffect(() => {
    setEsAdminSolicitando(targetEmail && targetEmail !== userEmail);
    cargarDatosSocio();
  }, [userEmail, targetEmail, emailSocio]);

  // Resetear selecciones cuando cambia el tipo de PETA
  useEffect(() => {
    setModalidadFEMETI(null);
    setEstadosSeleccionados([]);
  }, [tipoPETA]);

  const cargarDatosSocio = async () => {
    try {
      setLoading(true);
      const socioRef = doc(db, 'socios', emailSocio.toLowerCase());
      const socioSnap = await getDoc(socioRef);
      
      if (socioSnap.exists()) {
        const data = socioSnap.data();
        setSocioData(data);
        
        // Pre-llenar domicilio si existe
        if (data.domicilio) {
          setDomicilio(data.domicilio);
        }
        
        // Cargar armas
        const armasRef = collection(db, 'socios', emailSocio.toLowerCase(), 'armas');
        const armasSnap = await getDocs(armasRef);
        const armasList = armasSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArmas(armasList);
      }
    } catch (error) {
      console.error('Error cargando datos del socio:', error);
      showToast('Error al cargar datos. Por favor intenta de nuevo.', 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  const toggleArma = (armaId) => {
    if (armasSeleccionadas.includes(armaId)) {
      setArmasSeleccionadas(armasSeleccionadas.filter(id => id !== armaId));
    } else {
      if (armasSeleccionadas.length >= 10) {
        showToast('Máximo 10 armas por PETA', 'warning', 3000);
        return;
      }
      setArmasSeleccionadas([...armasSeleccionadas, armaId]);
    }
  };

  const toggleEstado = (estado) => {
    if (estadosSeleccionados.includes(estado)) {
      setEstadosSeleccionados(estadosSeleccionados.filter(e => e !== estado));
    } else {
      if (estadosSeleccionados.length >= 10) {
        showToast('Máximo 10 estados por PETA', 'warning', 3000);
        return;
      }
      setEstadosSeleccionados([...estadosSeleccionados, estado]);
    }
  };

  const calcularVigencia = () => {
    const hoy = new Date();
    let inicio, fin;
    
    // DN27: Inicio mínimo 15 días después de la solicitud
    inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() + 15);
    
    if (tipoPETA === 'caza') {
      // DN27: Temporada de caza es 1 julio - 30 junio
      // Si inicio es julio-dic (mes 6-11) → fin = 30 jun año siguiente
      // Si inicio es ene-jun (mes 0-5) → fin = 30 jun mismo año
      const mesInicio = inicio.getMonth();
      const añoFin = mesInicio >= 6 ? inicio.getFullYear() + 1 : inicio.getFullYear();
      fin = new Date(añoFin, 5, 30); // 30 Jun
    } else {
      // Tiro/Competencia: hasta 31 Dic del mismo año
      fin = new Date(inicio.getFullYear(), 11, 31); // 31 Dic
    }
    
    return { inicio, fin };
  };

  const validarFormulario = () => {
    // Validar armas seleccionadas
    if (armasSeleccionadas.length === 0) {
      showToast('Debes seleccionar al menos 1 arma', 'warning', 3000);
      return false;
    }
    
    // ⚠️ ADVERTENCIA (no bloqueo) si la modalidad sugerida no coincide
    const armasConAdvertencia = armasSeleccionadas.map(armaId => {
      const arma = armas.find(a => a.id === armaId);
      if (!arma.modalidad) {
        return { arma, razon: 'sin modalidad sugerida' };
      }
      // Si es PETA de caza, arma tiene modalidad sugerida 'tiro'
      if (tipoPETA === 'caza' && arma.modalidad === 'tiro') {
        return { arma, razon: 'modalidad sugerida: TIRO' };
      }
      // Si es PETA de tiro/competencia, arma tiene modalidad sugerida 'caza'
      if ((tipoPETA === 'tiro' || tipoPETA === 'competencia') && arma.modalidad === 'caza') {
        return { arma, razon: 'modalidad sugerida: CAZA' };
      }
      return null;
    }).filter(Boolean);
    
    // Mostrar advertencia pero permitir continuar
    if (armasConAdvertencia.length > 0) {
      const lista = armasConAdvertencia.map(({ arma, razon }) => 
        `• ${arma.marca} ${arma.modelo} (${arma.matricula}): ${razon}`
      ).join('\n');
      const continuar = confirm(
        `⚠️ ADVERTENCIA: Las siguientes armas tienen una modalidad sugerida diferente a "${tipoPETA.toUpperCase()}":\n\n${lista}\n\n` +
        `La modalidad real depende de tu Registro Federal de Armas (RFA).\n\n` +
        `¿Deseas continuar con la solicitud?`
      );
      if (!continuar) return false;
    }
    
    // Validar modalidad FEMETI y estados (solo para competencia)
    if (tipoPETA === 'competencia') {
      if (!modalidadFEMETI || !modalidadFEMETI.modalidad) {
        showToast('Debes seleccionar una modalidad FEMETI', 'warning', 3000);
        return false;
      }
      if (!modalidadFEMETI.estadosSeleccionados || modalidadFEMETI.estadosSeleccionados.length === 0) {
        showToast('Debes seleccionar al menos 1 estado donde competirás', 'warning', 3000);
        return false;
      }
    }
    
    // Validar estados (solo para caza)
    if (tipoPETA === 'caza' && estadosSeleccionados.length === 0) {
      showToast('Debes seleccionar al menos 1 estado', 'warning', 3000);
      return false;
    }
    
    // Validar domicilio
    if (!domicilio.calle || !domicilio.colonia || !domicilio.municipio || !domicilio.estado || !domicilio.cp) {
      showToast('Por favor completa todos los campos de tu domicilio', 'warning', 3000);
      return false;
    }
    
    // Validar PETA anterior si es renovación
    if (esRenovacion && !petaAnterior.trim()) {
      showToast('Por favor ingresa el número de tu PETA anterior', 'warning', 3000);
      return false;
    }
    
    return true;
  };

  const handleEnviarSolicitud = async () => {
    if (!validarFormulario()) return;
    
    try {
      setEnviando(true);
      
      console.log('📝 Datos de la solicitud:', {
        emailSocio,
        userEmail,
        esAdminSolicitando,
        tipoPETA,
        armasSeleccionadas: armasSeleccionadas.length,
        estadosSeleccionados: estadosSeleccionados.length,
        domicilio,
        esRenovacion,
        petaAnterior
      });
      
      const { inicio, fin } = calcularVigencia();
      
      // Preparar datos de armas incluidas
      const armasIncluidas = armasSeleccionadas.map(armaId => {
        const arma = armas.find(a => a.id === armaId);
        return {
          id: armaId,
          clase: arma.clase,
          calibre: arma.calibre,
          marca: arma.marca,
          modelo: arma.modelo || '',
          matricula: arma.matricula,
          cartuchos: getCartuchosPorDefecto(arma.calibre, arma.clase, tipoPETA)
        };
      });
      
      console.log('🔫 Armas incluidas:', armasIncluidas);
      
      // Calcular información de pago e5cinco
      const infoPago = calcularMontoE5cinco(armasSeleccionadas.length);
      console.log('💳 Info pago e5cinco:', infoPago);
      
      // Crear documento en Firestore
      const petasRef = collection(db, 'socios', emailSocio.toLowerCase(), 'petas');
      
      const petaData = {
        tipo: tipoPETA,
        estado: 'documentacion_proceso',
        
        // Vigencia
        fechaSolicitud: Timestamp.now(),
        vigenciaInicio: Timestamp.fromDate(inicio),
        vigenciaFin: Timestamp.fromDate(fin),
        
        // Datos del solicitante
        nombre: socioData.nombre,
        email: emailSocio.toLowerCase(),
        domicilio: domicilio,
        
        // Armas y estados
        armasIncluidas: armasIncluidas,
        estadosAutorizados: tipoPETA === 'competencia' 
          ? (modalidadFEMETI?.estadosSeleccionados || [])
          : tipoPETA === 'caza' 
            ? estadosSeleccionados 
            : [],
        
        // Modalidad FEMETI con clubes por estado (nuevo formato simplificado)
        // El socio selecciona MODALIDAD + ESTADOS y el sistema incluye TODOS los clubes
        modalidadFEMETI: tipoPETA === 'competencia' && modalidadFEMETI ? {
          nombre: modalidadFEMETI.modalidad,
          tipoArma: modalidadFEMETI.tipoArma,
          calibres: modalidadFEMETI.calibres,
          estadosSeleccionados: modalidadFEMETI.estadosSeleccionados || [],
          totalClubes: modalidadFEMETI.totalClubes || 0,
          temporalidad: modalidadFEMETI.temporalidad || null,
          // Clubes agrupados por estado (para referencia)
          clubesPorEstado: (modalidadFEMETI.clubesPreview || []).map(e => ({
            estado: e.estado,
            clubes: e.clubes.map(c => ({ club: c.club, domicilio: c.domicilio }))
          }))
        } : null,
        
        // Información de pago e5cinco esperado
        pagoE5cinco: {
          montoEsperado: infoPago.monto,
          claveReferencia: infoPago.claveReferencia,
          cadenaDependencia: infoPago.cadena,
          numArmas: infoPago.numArmas,
          verificado: false // El secretario lo marcará cuando verifique el recibo
        },
        
        // Renovación
        esRenovacion: esRenovacion,
        petaAnteriorNumero: esRenovacion ? petaAnterior : '',
        
        // Tracking
        historial: [{
          estado: 'documentacion_proceso',
          fecha: Timestamp.now(),
          usuario: userEmail.toLowerCase(), // Quien creó la solicitud (puede ser admin)
          notas: esAdminSolicitando ? 
            `Solicitud creada por administrador (${userEmail}) para el socio` : 
            'Solicitud creada por el socio'
        }],
        
        // Metadata
        creadoPor: userEmail.toLowerCase(), // Quien la creó (admin o socio)
        solicitadoPara: emailSocio.toLowerCase(), // Para quién es la solicitud
        fechaCreacion: Timestamp.now(),
        ultimaActualizacion: Timestamp.now()
      };
      
      console.log('💾 Guardando PETA en Firestore:', petaData);
      
      await addDoc(petasRef, petaData);
      
      console.log('💾 Guardando PETA en Firestore:', petaData);
      
      await addDoc(petasRef, petaData);
      
      console.log('✅ PETA creada exitosamente');
      
      showToast('✅ ¡Solicitud de PETA enviada exitosamente! Próximos pasos: 1) Verifica documentos, 2) Agenda cita, 3) Lleva foto e5cinco, 4) Realiza pago anual', 'success', 5000);
      
      onBack();
      
    } catch (error) {
      console.error('❌ Error enviando solicitud:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      showToast(`Error al enviar: ${error.message}. Intenta de nuevo o contacta al administrador.`, 'error', 5000);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando datos del socio...</div>;
  }

  const vigencia = calcularVigencia();

  return (
    <div className="solicitar-peta-container">
      {/* Banner si es admin solicitando para otro socio */}
      {esAdminSolicitando && (
        <div className="admin-solicitud-banner">
          <span className="admin-icon">👤</span>
          <div className="admin-info">
            <strong>Solicitando PETA como Administrador</strong>
            <p>Creando solicitud para: <strong>{socioData?.nombre || emailSocio}</strong> ({emailSocio})</p>
          </div>
        </div>
      )}
      
      <div className="solicitar-peta-header">
        <h2>🎯 Solicitar Nuevo PETA</h2>
        <p className="subtitle">Permiso Extraordinario de Transporte de Armas</p>
        {esAdminSolicitando && (
          <p className="socio-target">Para: {socioData?.nombre || emailSocio}</p>
        )}
      </div>

      <div className="solicitar-peta-form">
        {/* Tipo de PETA */}
        <div className="form-section">
          <h3>Tipo de PETA</h3>
          <div className="tipo-peta-options">
            <label className={`tipo-option ${tipoPETA === 'tiro' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipoPETA"
                value="tiro"
                checked={tipoPETA === 'tiro'}
                onChange={(e) => setTipoPETA(e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">Práctica de Tiro</div>
                <div className="option-desc">Solo para campo de tiro del club</div>
                <div className="option-vigencia">
                  Vigencia: {vigencia.inicio.toLocaleDateString('es-MX')} → 31 Dic {new Date().getFullYear()}
                </div>
              </div>
            </label>
            
            <label className={`tipo-option ${tipoPETA === 'competencia' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipoPETA"
                value="competencia"
                checked={tipoPETA === 'competencia'}
                onChange={(e) => setTipoPETA(e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">Competencia Nacional</div>
                <div className="option-desc">Eventos FEMETI autorizados por DN27</div>
                <div className="option-vigencia">
                  Vigencia: {vigencia.inicio.toLocaleDateString('es-MX')} → 31 Dic {new Date().getFullYear()}
                </div>
              </div>
            </label>
            
            <label className={`tipo-option ${tipoPETA === 'caza' ? 'active' : ''}`}>
              <input
                type="radio"
                name="tipoPETA"
                value="caza"
                checked={tipoPETA === 'caza'}
                onChange={(e) => setTipoPETA(e.target.value)}
              />
              <div className="option-content">
                <div className="option-title">Caza</div>
                <div className="option-desc">Transportar armas a cotos/UMAs SEMARNAT</div>
                <div className="option-vigencia">
                  Vigencia: 1 Jul {vigencia.inicio.getFullYear()} → 30 Jun {vigencia.fin.getFullYear()}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Renovación */}
        <div className="form-section">
          <label className="checkbox-label">
            <input
              id="peta-renovacion"
              type="checkbox"
              name="esRenovacion"
              checked={esRenovacion}
              onChange={(e) => setEsRenovacion(e.target.checked)}
              aria-label="Indicar si es renovación de PETA anterior"
            />
            <span>¿Es renovación de PETA anterior?</span>
          </label>
          
          {esRenovacion && (
            <div className="form-group">
              <label htmlFor="peta-anterior">Número de PETA anterior (ej: S-1/M-4/86):</label>
              <input
                id="peta-anterior"
                type="text"
                name="petaAnterior"
                value={petaAnterior}
                onChange={(e) => setPetaAnterior(e.target.value)}
                placeholder="S-1/M-4/86"
                aria-label="Número del PETA anterior"
                aria-required="true"
              />
            </div>
          )}
        </div>

        {/* Selección de Armas */}
        <div className="form-section">
          <h3>Selecciona tus armas (máximo 10)</h3>
          <p className="help-text">Seleccionaste: {armasSeleccionadas.length}/10</p>
          
          {armas.length === 0 ? (
            <div className="alert alert-warning">
              ⚠️ No tienes armas registradas. Contacta al Secretario para registrar tus armas.
            </div>
          ) : (
            <div className="armas-list">
              {armas.map(arma => {
                // Verificar si la modalidad SUGERIDA coincide con tipo de PETA
                const modalidadCoincide = arma.modalidad === 'ambas' || 
                  (tipoPETA === 'caza' && arma.modalidad === 'caza') ||
                  ((tipoPETA === 'tiro' || tipoPETA === 'competencia') && arma.modalidad === 'tiro');
                const sinModalidad = !arma.modalidad;
                
                return (
                  <label 
                    key={arma.id} 
                    htmlFor={`arma-${arma.id}`}
                    className={`arma-checkbox ${armasSeleccionadas.includes(arma.id) ? 'selected' : ''} ${!modalidadCoincide && !sinModalidad ? 'advertencia' : ''} ${sinModalidad ? 'sin-modalidad' : ''}`}
                    title={!modalidadCoincide && !sinModalidad ? `Modalidad sugerida: ${arma.modalidad.toUpperCase()} (verifica tu RFA)` : ''}
                  >
                    <input
                      id={`arma-${arma.id}`}
                      type="checkbox"
                      name={`arma-${arma.id}`}
                      checked={armasSeleccionadas.includes(arma.id)}
                      onChange={() => toggleArma(arma.id)}
                      aria-label={`${arma.marca} ${arma.modelo} (${arma.calibre}) - Matrícula: ${arma.matricula}`}
                    />
                    <div className="arma-info">
                      <div className="arma-clase">{arma.clase} {arma.marca} {arma.calibre}</div>
                      <div className="arma-details">
                        Modelo: {arma.modelo || 'N/A'} | Matrícula: {arma.matricula}
                        <span className={`modalidad-tag ${arma.modalidad || 'pendiente'}`}>
                          {arma.modalidad === 'caza' && '🦌 Caza'}
                          {arma.modalidad === 'tiro' && '🎯 Tiro'}
                          {arma.modalidad === 'ambas' && '✅ Ambas'}
                          {!arma.modalidad && '⏳ Pendiente'}
                        </span>
                      </div>
                      {!modalidadCoincide && !sinModalidad && (
                        <div className="modalidad-advertencia">
                          💡 Modalidad sugerida: {arma.modalidad} — Verifica tu RFA
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Información de Pago e5cinco */}
        {armasSeleccionadas.length > 0 && (
          <div className="form-section info-pago-section">
            <h3>💳 Información de Pago e5cinco</h3>
            {(() => {
              const infoPago = calcularMontoE5cinco(armasSeleccionadas.length);
              return (
                <div className="info-pago-box">
                  <div className="monto-destacado">
                    <span className="label">Monto del derecho:</span>
                    <span className="monto">{infoPago.montoFormateado}</span>
                  </div>
                  
                  <div className="datos-pago">
                    <div className="dato-item">
                      <strong>Clave de referencia:</strong>
                      <code>{infoPago.claveReferencia}</code>
                    </div>
                    <div className="dato-item">
                      <strong>Cadena de dependencia:</strong>
                      <code>{infoPago.cadena}</code>
                    </div>
                    <div className="dato-item">
                      <strong>Armas en esta PETA:</strong>
                      <span>{infoPago.numArmas} arma{infoPago.numArmas > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="alert alert-warning" style={{marginTop: '15px'}}>
                    <strong>⚠️ IMPORTANTE:</strong>
                    <ul style={{marginTop: '10px', marginBottom: '0'}}>
                      <li>El pago debe realizarse ANTES de presentar tu solicitud</li>
                      <li>El recibo e5cinco es un documento OBLIGATORIO</li>
                      <li>Verifica que el monto y la cadena de dependencia sean correctos</li>
                      <li>Guarda el recibo original para entregarlo en 32 Zona Militar</li>
                    </ul>
                  </div>
                  
                  <a 
                    href="https://www.gob.mx/defensa/acciones-y-programas/formatos-de-pagos-e5-del-2023" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="link-oficial"
                  >
                    📄 Ver información oficial de pagos SEDENA
                  </a>
                </div>
              );
            })()}
          </div>
        )}

        {/* Selector de Modalidad y Estados FEMETI (solo para competencia) */}
        {tipoPETA === 'competencia' && (
          <div className="form-section">
            <SelectorEstadosFEMETI
              onChange={setModalidadFEMETI}
              fechaSolicitud={new Date().toISOString().split('T')[0]}
              maxEstados={10}
            />
          </div>
        )}
        
        {tipoPETA === 'caza' && (
          <div className="form-section">
            <h3>Selecciona estados (máximo 10)</h3>
            <p className="help-text">Seleccionaste: {estadosSeleccionados.length}/10</p>
            
            <div className="estados-sugeridos">
              <button 
                type="button"
                className="btn-sugerir"
                onClick={() => {
                  const sugeridos = ESTADOS_SUGERIDOS_CAZA;
                  setEstadosSeleccionados(sugeridos);
                }}
              >
                ✨ Usar estados sugeridos para Caza (Sureste + UMAs)
              </button>
              <p className="sugeridos-info">
                🦌 Incluye: Yucatán, Campeche, Q. Roo, Tabasco, Chiapas, Veracruz, Tamaulipas, Sonora
              </p>
            </div>
            
            <div className="estados-grid">
              {ESTADOS_MEXICO.map(estado => (
                <label 
                  key={estado} 
                  htmlFor={`estado-${estado.replace(/\s+/g, '-')}`}
                  className={`estado-checkbox ${estadosSeleccionados.includes(estado) ? 'selected' : ''}`}
                >
                  <input
                    id={`estado-${estado.replace(/\s+/g, '-')}`}
                    type="checkbox"
                    name={`estado-${estado}`}
                    checked={estadosSeleccionados.includes(estado)}
                    onChange={() => toggleEstado(estado)}
                    aria-label={`Autorizar transporte en ${estado}`}
                  />
                  <span>{estado}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Domicilio */}
        <div className="form-section">
          <h3>Verifica tu domicilio</h3>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="peta-calle">Calle y Número:</label>
              <input
                id="peta-calle"
                type="text"
                name="calle"
                value={domicilio.calle}
                onChange={(e) => setDomicilio({...domicilio, calle: e.target.value})}
                placeholder="Calle 50 No. 531-E x 69 y 71"
                aria-label="Calle y número del domicilio"
                aria-required="true"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="peta-colonia">Colonia:</label>
              <input
                id="peta-colonia"
                type="text"
                name="colonia"
                value={domicilio.colonia}
                onChange={(e) => setDomicilio({...domicilio, colonia: e.target.value})}
                placeholder="Centro"
                aria-label="Colonia del domicilio"
                aria-required="true"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="peta-cp">C.P.:</label>
              <input
                id="peta-cp"
                type="text"
                name="cp"
                value={domicilio.cp}
                onChange={(e) => setDomicilio({...domicilio, cp: e.target.value})}
                placeholder="97000"
                maxLength="5"
                aria-label="Código postal del domicilio"
                aria-required="true"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="peta-municipio">Municipio:</label>
              <input
                id="peta-municipio"
                type="text"
                name="municipio"
                value={domicilio.municipio}
                onChange={(e) => setDomicilio({...domicilio, municipio: e.target.value})}
                placeholder="Mérida"
                aria-label="Municipio del domicilio"
                aria-required="true"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="peta-estado">Estado:</label>
              <select
                id="peta-estado"
                name="estado"
                value={domicilio.estado}
                onChange={(e) => setDomicilio({...domicilio, estado: e.target.value})}
                aria-label="Estado del domicilio"
                aria-required="true"
              >
                <option value="">Selecciona...</option>
                {ESTADOS_MEXICO.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recordatorio de documentos físicos */}
        <div className="form-section">
          <div className="alert alert-info">
            <h4>⚠️ RECUERDA TRAER FÍSICAMENTE:</h4>
            <ul>
              <li>✅ 1 foto infantil fondo blanco (por cada PETA)</li>
              <li>✅ Recibo e5cinco (original)</li>
              <li>✅ Originales de certificados médicos</li>
              <li>✅ Constancia de antecedentes penales (original)</li>
              <li>✅ Comprobante de domicilio (original)</li>
              <li>✅ Credencial del Club 2026 (copia)</li>
              {tipoPETA === 'caza' && <li>✅ Licencia de caza SEMARNAT vigente (copia)</li>}
              {esRenovacion && <li>✅ PETA anterior (original)</li>}
            </ul>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button className="btn-secondary" onClick={onBack} disabled={enviando}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleEnviarSolicitud}
            disabled={enviando || armas.length === 0}
          >
            {enviando ? 'Enviando...' : '📤 Enviar Solicitud'}
          </button>
        </div>
      </div>
    </div>
  );
}

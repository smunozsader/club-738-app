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
      alert('Error al cargar tus datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleArma = (armaId) => {
    if (armasSeleccionadas.includes(armaId)) {
      setArmasSeleccionadas(armasSeleccionadas.filter(id => id !== armaId));
    } else {
      if (armasSeleccionadas.length >= 10) {
        alert('Máximo 10 armas por PETA');
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
        alert('Máximo 10 estados por PETA');
        return;
      }
      setEstadosSeleccionados([...estadosSeleccionados, estado]);
    }
  };

  const calcularVigencia = () => {
    const hoy = new Date();
    let inicio, fin;
    
    if (tipoPETA === 'caza') {
      // Caza: 1 Julio → 30 Junio del siguiente año
      const año = hoy.getMonth() >= 6 ? hoy.getFullYear() : hoy.getFullYear() - 1;
      inicio = new Date(año, 6, 1); // 1 Jul
      fin = new Date(año + 1, 5, 30); // 30 Jun siguiente
    } else {
      // Tiro/Competencia: Fecha solicitud → 31 Dic mismo año
      inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() + 15); // 15 días después (mínimo trámite)
      fin = new Date(hoy.getFullYear(), 11, 31); // 31 Dic
    }
    
    return { inicio, fin };
  };

  const validarFormulario = () => {
    // Validar armas seleccionadas
    if (armasSeleccionadas.length === 0) {
      alert('Debes seleccionar al menos 1 arma');
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
    
    // Validar estados (solo para competencia/caza)
    if ((tipoPETA === 'competencia' || tipoPETA === 'caza') && estadosSeleccionados.length === 0) {
      alert('Debes seleccionar al menos 1 estado');
      return false;
    }
    
    // Validar domicilio
    if (!domicilio.calle || !domicilio.colonia || !domicilio.municipio || !domicilio.estado || !domicilio.cp) {
      alert('Por favor completa todos los campos de tu domicilio');
      return false;
    }
    
    // Validar PETA anterior si es renovación
    if (esRenovacion && !petaAnterior.trim()) {
      alert('Por favor ingresa el número de tu PETA anterior');
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
          cartuchos: tipoPETA === 'tiro' ? 200 : 1000 // Default según tipo
        };
      });
      
      console.log('🔫 Armas incluidas:', armasIncluidas);
      
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
        estadosAutorizados: (tipoPETA === 'competencia' || tipoPETA === 'caza') ? estadosSeleccionados : [],
        
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
      
      alert('✅ Solicitud de PETA enviada exitosamente.\n\n' +
            '📋 Próximos pasos:\n' +
            '1. Verifica que todos tus documentos estén subidos\n' +
            '2. Agenda cita con el Secretario para entregar originales\n' +
            '3. Lleva físicamente: foto infantil y recibo e5cinco\n' +
            '4. Realiza el pago de tu cuota anual');
      
      onBack();
      
    } catch (error) {
      console.error('❌ Error enviando solicitud:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error al enviar la solicitud: ${error.message}\n\nPor favor intenta de nuevo o contacta al administrador.`);
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
              type="checkbox"
              checked={esRenovacion}
              onChange={(e) => setEsRenovacion(e.target.checked)}
            />
            <span>¿Es renovación de PETA anterior?</span>
          </label>
          
          {esRenovacion && (
            <div className="form-group">
              <label>Número de PETA anterior (ej: S-1/M-4/86):</label>
              <input
                type="text"
                value={petaAnterior}
                onChange={(e) => setPetaAnterior(e.target.value)}
                placeholder="S-1/M-4/86"
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
                    className={`arma-checkbox ${armasSeleccionadas.includes(arma.id) ? 'selected' : ''} ${!modalidadCoincide && !sinModalidad ? 'advertencia' : ''} ${sinModalidad ? 'sin-modalidad' : ''}`}
                    title={!modalidadCoincide && !sinModalidad ? `Modalidad sugerida: ${arma.modalidad.toUpperCase()} (verifica tu RFA)` : ''}
                  >
                    <input
                      type="checkbox"
                      checked={armasSeleccionadas.includes(arma.id)}
                      onChange={() => toggleArma(arma.id)}
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

        {/* Estados (solo para competencia/caza) */}
        {(tipoPETA === 'competencia' || tipoPETA === 'caza') && (
          <div className="form-section">
            <h3>Selecciona estados (máximo 10)</h3>
            <p className="help-text">Seleccionaste: {estadosSeleccionados.length}/10</p>
            
            {/* Botón de estados sugeridos */}
            <div className="estados-sugeridos">
              <button 
                type="button"
                className="btn-sugerir"
                onClick={() => {
                  const sugeridos = tipoPETA === 'caza' ? ESTADOS_SUGERIDOS_CAZA : ESTADOS_SUGERIDOS_TIRO;
                  setEstadosSeleccionados(sugeridos);
                }}
              >
                ✨ Usar estados sugeridos para {tipoPETA === 'caza' ? 'Caza (Sureste + UMAs)' : 'Tiro Práctico (FEMETI 2026)'}
              </button>
              <p className="sugeridos-info">
                {tipoPETA === 'caza' 
                  ? '🦌 Incluye: Yucatán, Campeche, Q. Roo, Tabasco, Chiapas, Veracruz, Tamaulipas, Sonora'
                  : '🎯 Incluye: Yucatán, Baja California, Coahuila, Edo. Méx, Guanajuato, Hidalgo, Jalisco, Michoacán, SLP, Tabasco'
                }
              </p>
            </div>
            
            <div className="estados-grid">
              {ESTADOS_MEXICO.map(estado => (
                <label key={estado} className={`estado-checkbox ${estadosSeleccionados.includes(estado) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={estadosSeleccionados.includes(estado)}
                    onChange={() => toggleEstado(estado)}
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
              <label>Calle y Número:</label>
              <input
                type="text"
                value={domicilio.calle}
                onChange={(e) => setDomicilio({...domicilio, calle: e.target.value})}
                placeholder="Calle 50 No. 531-E x 69 y 71"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Colonia:</label>
              <input
                type="text"
                value={domicilio.colonia}
                onChange={(e) => setDomicilio({...domicilio, colonia: e.target.value})}
                placeholder="Centro"
              />
            </div>
            
            <div className="form-group">
              <label>C.P.:</label>
              <input
                type="text"
                value={domicilio.cp}
                onChange={(e) => setDomicilio({...domicilio, cp: e.target.value})}
                placeholder="97000"
                maxLength="5"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Municipio:</label>
              <input
                type="text"
                value={domicilio.municipio}
                onChange={(e) => setDomicilio({...domicilio, municipio: e.target.value})}
                placeholder="Mérida"
              />
            </div>
            
            <div className="form-group">
              <label>Estado:</label>
              <select
                value={domicilio.estado}
                onChange={(e) => setDomicilio({...domicilio, estado: e.target.value})}
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

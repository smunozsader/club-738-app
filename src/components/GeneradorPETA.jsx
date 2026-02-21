/**
 * GeneradorPETA - Genera oficios de solicitud PETA en PDF
 * 
 * Tipos de PETA:
 * - Práctica de Tiro: Solo campo de tiro del club
 * - Competencia Nacional: Lista de hasta 10 estados (calendario FEMETI)
 * - Caza: Lista de hasta 10 estados (UMAs/cotos SEMARNAT)
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useToastContext } from '../contexts/ToastContext';
import { jsPDF } from 'jspdf';
import { getLimitesCartuchos, ajustarCartuchos, getCartuchosPorDefecto } from '../utils/limitesCartuchos';
import { generarMatrizClubesPDF, calcularTemporalidad, MODALIDADES_FEMETI_2026 } from '../data/modalidadesFEMETI2026';
import SelectorEstadosFEMETI from './SelectorEstadosFEMETI';
import './GeneradorPETA.css';

// Datos constantes del Club
const DATOS_CLUB = {
  nombre: 'CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.',
  registroSEDENA: '738',
  presidente: 'GRAL. BGDA. E.M. RICARDO JESÚS FERNÁNDEZ Y GASQUE',
  campoTiro: {
    texto: 'PARA EL CAMPO DE TIRO DEL CLUB DE CAZA TIRO Y PESCA DE YUCATÁN AC, SITO EN EL KM 7.5 DE LA CARRETERA FEDERAL 281, TRAMO HUNUCMÁ - SISAL, MUNICIPIO HUNUCMÁ, YUCATÁN.'
  }
};

// Estados de México
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
const ESTADOS_SUGERIDOS_TIRO = [
  'Yucatán',           // Base del club
  'Baja California',   // Sede FEMETI
  'Coahuila',          // Sede FEMETI
  'Estado de México',  // Sede FEMETI
  'Hidalgo',           // Sede FEMETI
  'Jalisco',           // Sede FEMETI
  'Michoacán',         // Sede FEMETI
  'Quintana Roo',      // Región Sureste
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

// Meses en español
const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
               'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

// NOTA: Las funciones de límites de cartuchos se importan desde /utils/limitesCartuchos.js
// Ver Artículo 50 de la Ley Federal de Armas de Fuego y Explosivos (LFAFE)
// - Calibre .22": máximo 500 cartuchos
// - Escopetas: máximo 1,000 cartuchos
// - Otras armas: máximo 200 cartuchos

export default function GeneradorPETA({ userEmail, onBack }) {
  const { showToast } = useToastContext();
  
  // Estados del formulario
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [armasSocio, setArmasSocio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  
  // Solicitudes PETA existentes
  const [solicitudesPETA, setSolicitudesPETA] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modoManual, setModoManual] = useState(false);
  
  // Datos del formulario PETA
  const [tipoPETA, setTipoPETA] = useState('tiro'); // tiro, competencia, caza
  const [petaAnterior, setPetaAnterior] = useState('');
  const [esRenovacion, setEsRenovacion] = useState(false);
  
  // Dirección del solicitante (formato DN27 SEDENA-02-045)
  const [calle, setCalle] = useState('');
  const [numeroExterior, setNumeroExterior] = useState('');
  const [numeroInterior, setNumeroInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [cp, setCp] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estadoDomicilio, setEstadoDomicilio] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  
  // Datos administrativos DN27
  const [noExpediente, setNoExpediente] = useState('');
  
  // Fechas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaOficio, setFechaOficio] = useState(new Date().toISOString().split('T')[0]); // Fecha del oficio (post/pre fecha)
  
  // Armas seleccionadas (máx 10)
  const [armasSeleccionadas, setArmasSeleccionadas] = useState([]);
  const [cartuchosPorArma, setCartuchosPorArma] = useState({});
  
  // Estados seleccionados (máx 10, solo para competencia/caza)
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(['Yucatán']);
  
  // Club invitado (solo para TIRO - sección G DN27)
  const [tieneClubInvitado, setTieneClubInvitado] = useState(false);
  const [clubInvitado, setClubInvitado] = useState('');
  const [domicilioClubInvitado, setDomicilioClubInvitado] = useState('');
  
  // Modalidad y competencias FEMETI (solo para competencia nacional - requerido DN27)
  // Nuevo formato: { modalidad, tipoArma, calibres, estadosSeleccionados, clubesPreview, totalClubes, temporalidad }
  const [modalidadFEMETI, setModalidadFEMETI] = useState(null);
  
  // Buscar socio
  const [busqueda, setBusqueda] = useState('');

  // Solo el secretario puede usar este módulo
  const esSecretario = userEmail === 'admin@club738.com';
  
  console.log('🔐 [GeneradorPETA] userEmail:', userEmail);
  console.log('🔐 [GeneradorPETA] esSecretario:', esSecretario);

  // En revisión desde solicitud (no manual): bloquear edición de armas/cartuchos
  const revisionBloqueada = esSecretario && solicitudSeleccionada && !modoManual;

  useEffect(() => {
    console.log('🚀 [GeneradorPETA] useEffect disparado, esSecretario:', esSecretario);
    if (esSecretario) {
      console.log('✅ [GeneradorPETA] Cargando socios y solicitudes...');
      cargarSocios();
      cargarSolicitudesPETA();
    } else {
      console.log('⚠️ [GeneradorPETA] NO es secretario, no se cargan solicitudes');
    }
  }, [esSecretario]);

  useEffect(() => {
    if (socioSeleccionado) {
      cargarArmasSocio(socioSeleccionado.email);
      // Pre-llenar dirección si existe (formato DN27 SEDENA-02-045)
      if (socioSeleccionado.domicilio) {
        setCalle(socioSeleccionado.domicilio.calle || '');
        setNumeroExterior(socioSeleccionado.domicilio.numeroExterior || socioSeleccionado.domicilio.numero || '');
        setNumeroInterior(socioSeleccionado.domicilio.numeroInterior || '');
        setColonia(socioSeleccionado.domicilio.colonia || '');
        setCp(socioSeleccionado.domicilio.cp || '');
        setMunicipio(socioSeleccionado.domicilio.municipio || socioSeleccionado.domicilio.ciudad || '');
        setEstadoDomicilio(socioSeleccionado.domicilio.estado || '');
      } else {
        // Limpiar campos si no hay domicilio
        setCalle('');
        setNumeroExterior('');
        setNumeroInterior('');
        setColonia('');
        setCp('');
        setMunicipio('');
        setEstadoDomicilio('');
      }
      // Correo electrónico desde el email del socio
      setCorreoElectronico(socioSeleccionado.email || '');
    }
  }, [socioSeleccionado]);

  // Calcular fecha mínima de inicio: 15 días después de fecha del oficio (DN27)
  const getFechaMinInicio = () => {
    const oficio = fechaOficio ? new Date(fechaOficio + 'T12:00:00') : new Date();
    oficio.setDate(oficio.getDate() + 15); // Mínimo 15 días después del oficio
    return oficio.toISOString().split('T')[0];
  };

  // Calcular fecha fin automáticamente según tipo (DN27)
  useEffect(() => {
    if (fechaInicio) {
      const inicio = new Date(fechaInicio + 'T12:00:00');
      if (tipoPETA === 'caza') {
        // DN27: Temporada de caza es 1 julio - 30 junio
        // Si inicio es julio-diciembre (mes 6-11) → fin = 30 junio año siguiente
        // Si inicio es enero-junio (mes 0-5) → fin = 30 junio mismo año
        const mes = inicio.getMonth(); // 0-11
        const añoFin = mes >= 6 ? inicio.getFullYear() + 1 : inicio.getFullYear();
        setFechaFin(`${añoFin}-06-30`);
      } else {
        // DN27: Tiro y Competencia hasta 31 de diciembre del mismo año
        setFechaFin(`${inicio.getFullYear()}-12-31`);
      }
    }
  }, [fechaInicio, tipoPETA]);

  // Auto-setear fecha inicio cuando cambia fecha oficio (si no hay fecha inicio)
  useEffect(() => {
    if (fechaOficio && !fechaInicio) {
      setFechaInicio(getFechaMinInicio());
    }
  }, [fechaOficio]);

  const cargarSocios = async () => {
    try {
      const sociosRef = collection(db, 'socios');
      const snapshot = await getDocs(sociosRef);
      
      const sociosData = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Limpiar nombre
        let nombreLimpio = data.nombre || docSnap.id;
        nombreLimpio = nombreLimpio.replace(/^\d+\.\s*/, '');
        
        sociosData.push({
          id: docSnap.id,
          email: docSnap.id,
          nombre: nombreLimpio,
          noSocio: data.noSocio || '-',
          curp: data.curp || '',
          domicilio: data.domicilio || null  // Usar 'domicilio' que es el campo correcto
        });
      });
      
      // Ordenar por número de socio
      sociosData.sort((a, b) => (parseInt(a.noSocio) || 999) - (parseInt(b.noSocio) || 999));
      setSocios(sociosData);
    } catch (error) {
      console.error('Error cargando socios:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudesPETA = async () => {
    try {
      console.log('🔍 Iniciando carga de solicitudes PETA...');
      const sociosRef = collection(db, 'socios');
      const sociosSnap = await getDocs(sociosRef);
      
      console.log(`📊 Total socios encontrados: ${sociosSnap.size}`);
      
      const todasSolicitudes = [];
      
      for (const socioDoc of sociosSnap.docs) {
        const socioData = socioDoc.data();
        const petasRef = collection(db, 'socios', socioDoc.id, 'petas');
        const petasSnap = await getDocs(petasRef);
        
        if (!petasSnap.empty) {
          console.log(`✅ ${socioDoc.id} tiene ${petasSnap.size} PETA(s)`);
        }
        
        petasSnap.forEach(petaDoc => {
          const petaData = petaDoc.data();
          console.log(`  └─ PETA ${petaDoc.id}:`, {
            tipo: petaData.tipo,
            estado: petaData.estado,
            armas: petaData.armasIncluidas?.length
          });
          todasSolicitudes.push({
            id: petaDoc.id,
            socioEmail: socioDoc.id,
            socioNombre: socioData.nombre || socioDoc.id,
            ...petaData
          });
        });
      }
      
      console.log(`📋 Total solicitudes PETA encontradas: ${todasSolicitudes.length}`);
      
      // Ordenar por fecha de solicitud (más recientes primero)
      todasSolicitudes.sort((a, b) => {
        const fechaA = a.fechaSolicitud?.toMillis() || 0;
        const fechaB = b.fechaSolicitud?.toMillis() || 0;
        return fechaB - fechaA;
      });
      
      setSolicitudesPETA(todasSolicitudes);
      console.log('✅ Solicitudes cargadas en estado:', todasSolicitudes);
    } catch (error) {
      console.error('❌ Error cargando solicitudes PETA:', error);
    }
  };

  const cargarSolicitud = async (solicitud) => {
    try {
      console.log('📝 Cargando solicitud:', solicitud);
      setSolicitudSeleccionada(solicitud);
      
      // Buscar y seleccionar el socio
      const socio = socios.find(s => s.email === solicitud.socioEmail);
      if (!socio) {
        console.error('❌ Socio no encontrado:', solicitud.socioEmail);
        showToast('Error: Socio no encontrado en la base de datos', 'error', 4000);
        return;
      }
      
      console.log('✅ Socio encontrado:', socio.nombre);
      setSocioSeleccionado(socio);
      
      // Cargar armas del socio y esperar a que termine
      console.log('🔄 Cargando armas del socio...');
      const armasList = await cargarArmasSocio(socio.email);
      
      // Pre-llenar formulario con datos de la solicitud
      setTipoPETA(solicitud.tipo || 'tiro');
      setEsRenovacion(solicitud.esRenovacion || false);
      setPetaAnterior(solicitud.petaAnteriorNumero || '');
      setNoExpediente(solicitud.noExpediente || '');
      
      // Domicilio (formato DN27)
      if (solicitud.domicilio) {
        setCalle(solicitud.domicilio.calle || '');
        setNumeroExterior(solicitud.domicilio.numeroExterior || solicitud.domicilio.numero || '');
        setNumeroInterior(solicitud.domicilio.numeroInterior || '');
        setColonia(solicitud.domicilio.colonia || '');
        setCp(solicitud.domicilio.cp || '');
        setMunicipio(solicitud.domicilio.municipio || solicitud.domicilio.ciudad || '');
        setEstadoDomicilio(solicitud.domicilio.estado || '');
      }
      // Correo electrónico
      setCorreoElectronico(solicitud.correoElectronico || solicitud.email || socio.email || '');
      
      // Fechas
      if (solicitud.vigenciaInicio) {
        const inicio = solicitud.vigenciaInicio.toDate();
        setFechaInicio(inicio.toISOString().split('T')[0]);
      }
      if (solicitud.vigenciaFin) {
        const fin = solicitud.vigenciaFin.toDate();
        setFechaFin(fin.toISOString().split('T')[0]);
      }
      
      // Armas incluidas
      if (solicitud.armasIncluidas && Array.isArray(solicitud.armasIncluidas)) {
        console.log('📋 Armas en solicitud:', solicitud.armasIncluidas);
        
        // Helper: normalizar matrícula para comparación (remover guiones, guiones bajos, espacios)
        const normalizarMatricula = (mat) => {
          return mat?.toString().toUpperCase().replace(/[-_\s]/g, '') || '';
        };
        
        // IMPORTANTE: Las armas en solicitud pueden tener IDs diferentes a Firestore
        // Hacer match por matrícula en lugar de por ID
        const armasASeleccionar = [];
        const cartuchos = {};
        
        solicitud.armasIncluidas.forEach(armaEnSolicitud => {
          const matriculaNormalizada = normalizarMatricula(armaEnSolicitud.matricula);
          
          console.log(`🔍 Buscando match para: "${armaEnSolicitud.matricula}" (normalizada: "${matriculaNormalizada}")`);
          
          // Buscar en lista de armas cargada por matrícula normalizada
          const armaEnFirestore = armasList.find(a => {
            const matFirestoreNorm = normalizarMatricula(a.matricula);
            console.log(`  Comparando con: "${a.matricula}" (normalizada: "${matFirestoreNorm}") → ${matFirestoreNorm === matriculaNormalizada ? '✓ MATCH' : '✗'}`);
            return matFirestoreNorm === matriculaNormalizada;
          });
          
          if (armaEnFirestore) {
            // Encontrada en Firestore - usar el ID de Firestore
            console.log(`✅ Match por matrícula: ${armaEnSolicitud.matricula} → ${armaEnFirestore.matricula} (ID: ${armaEnFirestore.id})`);
            armasASeleccionar.push(armaEnFirestore.id);
            {
              const limites = getLimitesCartuchos(armaEnFirestore.calibre, armaEnFirestore.clase);
              const val = armaEnSolicitud.cartuchos ?? limites.default;
              cartuchos[armaEnFirestore.id] = ajustarCartuchos(val, armaEnFirestore.calibre, armaEnFirestore.clase);
            }
          } else {
            // No encontrada en Firestore - agregar con datos de la solicitud
            console.log(`⚠️ Arma no encontrada en Firestore: ${armaEnSolicitud.matricula}, agregando desde solicitud`);
            const armaConDatosSolicitud = { id: armaEnSolicitud.id, ...armaEnSolicitud };
            setArmasSocio(prev => [...prev, armaConDatosSolicitud]);
            armasASeleccionar.push(armaEnSolicitud.id);
            {
              const limites = getLimitesCartuchos(armaEnSolicitud.calibre, armaEnSolicitud.clase);
              const val = armaEnSolicitud.cartuchos ?? limites.default;
              cartuchos[armaEnSolicitud.id] = ajustarCartuchos(val, armaEnSolicitud.calibre, armaEnSolicitud.clase);
            }
          }
        });
        
        console.log('🔑 IDs finales a seleccionar:', armasASeleccionar);
        setArmasSeleccionadas(armasASeleccionar);
        setCartuchosPorArma(cartuchos);
        
        console.log('✅ Armas seleccionadas establecidas:', armasASeleccionar);
        console.log('🔫 Cartuchos por arma:', cartuchos);
      }
      
      // Estados autorizados
      if (solicitud.estadosAutorizados && Array.isArray(solicitud.estadosAutorizados)) {
        setEstadosSeleccionados(solicitud.estadosAutorizados);
      }
      
      setModoManual(false);
      
    } catch (error) {
      console.error('❌ Error cargando solicitud:', error);
      showToast('Error al cargar la solicitud. Por favor intenta de nuevo.', 'error', 4000);
    }
  };

  const cargarArmasSocio = async (email) => {
    try {
      console.log('🔫 Cargando armas de:', email);
      const socioRef = doc(db, 'socios', email.toLowerCase());
      const armasRef = collection(socioRef, 'armas');
      const snapshot = await getDocs(armasRef);
      
      const armasData = [];
      snapshot.forEach(docSnap => {
        const arma = {
          id: docSnap.id,
          ...docSnap.data()
        };
        armasData.push(arma);
        console.log(`  └─ ${arma.marca} ${arma.modelo} - Mat: ${arma.matricula} (ID: ${docSnap.id})`);
      });
      
      console.log(`✅ Total armas cargadas: ${armasData.length}`);
      setArmasSocio(armasData);
      return armasData;
    } catch (error) {
      console.error('❌ Error cargando armas:', error);
      return [];
    }
  };

  const toggleArma = (armaId) => {
    if (revisionBloqueada) return; // No permitir cambios en modo revisión desde solicitud
    setArmasSeleccionadas(prev => {
      if (prev.includes(armaId)) {
        return prev.filter(id => id !== armaId);
      } else if (prev.length < 10) {
        // Establecer cartuchos por defecto según límites legales
        const arma = armasSocio.find(a => a.id === armaId);
        const limites = getLimitesCartuchos(arma?.calibre, arma?.clase);
        setCartuchosPorArma(c => ({ ...c, [armaId]: limites.default }));
        return [...prev, armaId];
      }
      return prev; // Ya tiene 10
    });
  };

  const toggleEstado = (estado) => {
    setEstadosSeleccionados(prev => {
      if (prev.includes(estado)) {
        return prev.filter(e => e !== estado);
      } else if (prev.length < 10) {
        return [...prev, estado];
      }
      return prev; // Ya tiene 10
    });
  };

  // Magic suggestion: Pre-select FEMETI-recommended states
  const aplicarEstadosSugeridos = () => {
    const sugeridos = tipoPETA === 'caza' ? ESTADOS_SUGERIDOS_CAZA : ESTADOS_SUGERIDOS_TIRO;
    setEstadosSeleccionados(sugeridos);
  };

  const formatearFechaPETA = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T12:00:00');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = MESES[fecha.getMonth()].substring(0, 3);
    const año = fecha.getFullYear();
    return `${dia}${mes}${año}`;
  };

  const formatearFechaLarga = (fecha) => {
    const dia = fecha.getDate();
    const mes = MESES[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} de ${mes} de ${año}`;
  };

  const generarPDF = () => {
    if (!socioSeleccionado || armasSeleccionadas.length === 0) {
      showToast('Selecciona un socio y al menos un arma', 'warning', 3000);
      return;
    }

    if (!fechaInicio || !fechaFin) {
      showToast('Especifica las fechas de vigencia', 'warning', 3000);
      return;
    }

    // DN27: Validar que fecha inicio sea mínimo 15 días después de fecha oficio
    const oficio = new Date(fechaOficio + 'T12:00:00');
    const inicio = new Date(fechaInicio + 'T12:00:00');
    const diferenciaDias = Math.floor((inicio - oficio) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 15) {
      showToast(`DN27: La vigencia debe iniciar mínimo 15 días después del oficio (${diferenciaDias} días actual)`, 'error', 5000);
      return;
    }

    // Para competencia, validar que tenga modalidad y estados seleccionados
    if (tipoPETA === 'competencia') {
      if (!modalidadFEMETI?.modalidad || !modalidadFEMETI?.estadosSeleccionados?.length) {
        showToast('Selecciona una modalidad FEMETI y al menos un estado', 'warning', 3000);
        return;
      }
    } else if (tipoPETA === 'caza' && estadosSeleccionados.length === 0) {
      showToast('Selecciona al menos un estado para caza', 'warning', 3000);
      return;
    }

    setGenerando(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 12;

      // Helper para centrar texto
      const centrarTexto = (texto, yPos) => {
        const textWidth = doc.getTextWidth(texto);
        doc.text(texto, (pageWidth - textWidth) / 2, yPos);
      };

      // ========== CÓDIGOS DE FORMATO DN27 ==========
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('SEDENA-02-045', pageWidth - margin - 25, y);
      y += 4;
      doc.text('RFA-LC-017', pageWidth - margin - 20, y);
      y += 6;

      // ========== ENCABEZADO OFICIAL ==========
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      centrarTexto('Secretaría de la Defensa Nacional', y);
      y += 5;
      doc.setFontSize(8);
      centrarTexto('Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos.', y);
      y += 5;
      doc.setFontSize(9);
      centrarTexto('Solicitud de permiso extraordinario para la práctica de caza, tiro y/o competencia.', y);
      y += 8;

      // ========== A. DATOS DEL CLUB ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('A. Datos del Club.', margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Nombre del Club: ${DATOS_CLUB.nombre}`, margin, y);
      doc.text(`No. Reg. Ante S.D.N.: ${DATOS_CLUB.registroSEDENA}`, pageWidth - margin - 45, y);
      y += 7;

      // ========== B. DATOS DE LA PERSONA SOLICITANTE ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('B. Datos de la persona solicitante:', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      // Fila 1: No. Expediente y No. Permiso anterior
      doc.text(`No. Expediente: ${noExpediente || '_____________'}`, margin, y);
      if (esRenovacion && petaAnterior) {
        doc.text(`No. Permiso anterior (Renovaciones): ${petaAnterior}`, pageWidth / 2, y);
      }
      y += 5;

      // Fila 2: Nombre
      doc.text(`Nombre: ${socioSeleccionado.nombre.toUpperCase()}`, margin, y);
      y += 5;

      // Fila 3: Dirección - Calle y Número
      doc.text('Dirección:', margin, y);
      y += 4;
      const numeroCompleto = numeroInterior ? `${numeroExterior} Int. ${numeroInterior}` : numeroExterior;
      doc.text(`Calle: ${calle.toUpperCase()}`, margin + 5, y);
      doc.text(`Número: ${numeroCompleto}`, pageWidth / 2, y);
      y += 4;

      // Fila 4: Colonia y CP
      doc.text(`Colonia: ${colonia.toUpperCase()}`, margin + 5, y);
      doc.text(`C.P.: ${cp}`, pageWidth / 2, y);
      y += 4;

      // Fila 5: Municipio y Estado
      doc.text(`Municipio o Delegación: ${municipio.toUpperCase()}`, margin + 5, y);
      doc.text(`Estado: ${estadoDomicilio.toUpperCase()}`, pageWidth / 2, y);
      y += 4;

      // Fila 6: Correo electrónico
      doc.text(`Correo electrónico: ${correoElectronico.toLowerCase()}`, margin + 5, y);
      y += 7;

      // ========== C. TIPO DE ACTIVIDAD ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('C. Tipo de actividad.', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const cazaX = tipoPETA === 'caza' ? 'X' : ' ';
      const tiroX = tipoPETA === 'tiro' ? 'X' : ' ';
      const compX = tipoPETA === 'competencia' ? 'X' : ' ';
      
      doc.text(`Caza ( ${cazaX} )`, margin + 20, y);
      doc.text(`Tiro ( ${tiroX} )`, margin + 60, y);
      doc.text(`Competencia ( ${compX} )`, margin + 100, y);
      y += 7;

      // ========== D. PERIODO ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('D. Periodo (mínimo a partir de 15 días de la fecha de su solicitud):', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('(12 meses como máximo)', pageWidth - margin - 35, y);
      y += 5;

      doc.setFontSize(8);
      const fechaInicioFmt = formatearFechaPETA(fechaInicio);
      const fechaFinFmt = formatearFechaPETA(fechaFin);
      
      // Formato: Día Mes Año al Día Mes Año
      doc.text(`${fechaInicioFmt}`, margin + 20, y);
      doc.text('al', margin + 55, y);
      doc.text(`${fechaFinFmt}`, margin + 65, y);
      y += 3;
      doc.setFontSize(6);
      doc.text('Día    Mes    Año', margin + 20, y);
      doc.text('Día    Mes    Año', margin + 65, y);
      y += 6;

      // ========== E. DATOS DE LAS ARMAS QUE EMPLEARÁ ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('E. Datos de las armas que empleará:', margin, y);
      y += 5;

      // Encabezados de tabla (orden DN27: Tipo, Marca, Calibre, Matrícula, Cartuchos)
      const colWidths = [8, 40, 35, 25, 35, 25];
      const headers = ['', 'Tipo', 'Marca', 'Calibre', 'Matrícula', 'Cartuchos'];
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      
      let xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 1, y);
        xPos += colWidths[i];
      });
      y += 4;

      // Línea separadora
      doc.setLineWidth(0.2);
      doc.line(margin, y - 1, pageWidth - margin, y - 1);

      // Filas de armas (5 filas en el formulario oficial, pero soportamos 10)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      for (let i = 0; i < 10; i++) {
        xPos = margin;
        const armaId = armasSeleccionadas[i];
        const arma = armaId ? armasSocio.find(a => a.id === armaId) : null;
        
        // Número de fila
        doc.text(`${i + 1}.`, xPos + 1, y + 2);
        xPos += colWidths[0];
        
        if (arma) {
          // Tipo (Clase)
          doc.text((arma.clase || '').substring(0, 22).toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[1];
          // Marca
          doc.text((arma.marca || '').substring(0, 18).toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[2];
          // Calibre
          doc.text((arma.calibre || '').toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[3];
          // Matrícula
          doc.text((arma.matricula || '').toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[4];
          // Cartuchos
          const limites = getLimitesCartuchos(arma.calibre, arma.clase);
          const val = cartuchosPorArma[armaId] ?? limites.default;
          const ajustado = ajustarCartuchos(val, arma.calibre, arma.clase);
          doc.text(String(ajustado), xPos + 1, y + 2);
        }
        y += 4;
      }
      
      y += 3;

      // ========== F. CACERÍA (solo si tipoPETA === 'caza') ==========
      if (tipoPETA === 'caza') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('F. Si la actividad es cacería especifique los estados donde la practicará (máximo 10)', margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        estadosSeleccionados.slice(0, 10).forEach((estado, idx) => {
          doc.text(`${idx + 1}. ${estado}`, margin + 5, y);
          y += 4;
        });
        y += 3;
      }

      // ========== G. TIRO (solo si tipoPETA === 'tiro') ==========
      if (tipoPETA === 'tiro') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('G. Si la actividad es de tiro deberá de ser el campo de tiro del club al que pertenece', margin, y);
        y += 4;
        doc.text('o en caso contrario deberá de anexar la invitación del club que lo invite a su campo de tiro.', margin, y);
        y += 6;
        
        // Campo de tiro del Club 738
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Campo de Tiro del Club:', margin + 5, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.text(DATOS_CLUB.nombre, margin + 10, y);
        y += 4;
        const lineasCampo = doc.splitTextToSize(DATOS_CLUB.campoTiro.texto, pageWidth - (margin * 2) - 15);
        lineasCampo.forEach(linea => {
          doc.text(linea, margin + 10, y);
          y += 4;
        });
        y += 3;
        
        // Club invitado (si aplica)
        if (tieneClubInvitado && clubInvitado) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('Club Invitado (con oficio de invitación anexo):', margin + 5, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.text(`Nombre: ${clubInvitado.toUpperCase()}`, margin + 10, y);
          y += 4;
          if (domicilioClubInvitado) {
            const lineasInvitado = doc.splitTextToSize(`Domicilio: ${domicilioClubInvitado}`, pageWidth - (margin * 2) - 15);
            lineasInvitado.forEach(linea => {
              doc.text(linea, margin + 10, y);
              y += 4;
            });
          }
          y += 2;
        }
      }

      // ========== H. COMPETENCIA NACIONAL (solo si tipoPETA === 'competencia') ==========
      if (tipoPETA === 'competencia') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('H. Si la actividad es de competencia nacional, especifique clubes, periodo y Estados', margin, y);
        y += 4;
        doc.text('donde participará (máximo 10).', margin, y);
        y += 5;

        if (modalidadFEMETI?.modalidad && modalidadFEMETI?.estadosSeleccionados?.length > 0) {
          // Generar matriz de clubes para la modalidad seleccionada
          const matrizResultado = generarMatrizClubesPDF(
            modalidadFEMETI.modalidad,
            modalidadFEMETI.estadosSeleccionados,
            fechaOficio || new Date().toISOString().split('T')[0]
          );
          
          if (matrizResultado && matrizResultado.filas.length > 0) {
            // Información de modalidad
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(`Modalidad: ${matrizResultado.modalidad}`, margin + 5, y);
            y += 4;
            doc.setFont('helvetica', 'normal');
            doc.text(`Tipo de arma: ${matrizResultado.tipoArma} | Calibres: ${matrizResultado.calibres}`, margin + 5, y);
            y += 4;
            doc.text(`Tiradas FEMETI período: ${matrizResultado.temporalidad.textoCompleto}`, margin + 5, y);
            y += 5;
            
            // Tabla de clubes
            const colWidthsH = [8, 30, 50, 30, 50];
            const headersH = ['#', 'Estado', 'Club', 'Temporalidad', 'Domicilio'];
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6);
            let xPosH = margin + 5;
            headersH.forEach((header, i) => {
              doc.text(header, xPosH, y);
              xPosH += colWidthsH[i];
            });
            y += 3;
            doc.setLineWidth(0.2);
            doc.line(margin + 5, y - 1, pageWidth - margin, y - 1);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(5.5);
            
            const margenInferior = 35;
            matrizResultado.filas.forEach((fila) => {
              // Nueva página si es necesario
              if (y > (pageHeight - margenInferior)) {
                doc.addPage();
                y = 15;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(`Continuación - ${matrizResultado.modalidad}`, margin, y);
                y += 6;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.5);
              }
              
              xPosH = margin + 5;
              doc.text(String(fila.numero), xPosH + 2, y);
              xPosH += colWidthsH[0];
              doc.text((fila.estado || '').substring(0, 15).toUpperCase(), xPosH, y);
              xPosH += colWidthsH[1];
              doc.text((fila.club || '').substring(0, 28), xPosH, y);
              xPosH += colWidthsH[2];
              doc.text((fila.temporalidad || '').substring(0, 15), xPosH, y);
              xPosH += colWidthsH[3];
              doc.text((fila.domicilio || '').substring(0, 28), xPosH, y);
              y += 3;
            });
            
            y += 2;
            doc.setFontSize(7);
            doc.text(`Total: ${matrizResultado.totalClubes} clubes en ${modalidadFEMETI.estadosSeleccionados.length} estados`, margin + 5, y);
            y += 5;
          }
        } else {
          // Fallback: solo estados sin matriz
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          estadosSeleccionados.slice(0, 10).forEach((estado, idx) => {
            doc.text(`${idx + 1}. ${estado}`, margin + 5, y);
            y += 4;
          });
        }
      }

      // ========== I. LUGAR Y FECHA DE LA SOLICITUD ==========
      y = Math.max(y + 10, pageHeight - 50);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('I. Lugar y fecha de la solicitud.', margin, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const fechaDelOficio = fechaOficio ? new Date(fechaOficio + 'T12:00:00') : new Date();
      doc.text(`Mérida, Yucatán a ${formatearFechaLarga(fechaDelOficio)}`, margin + 20, y);
      y += 15;

      // Firma
      doc.text('Respetuosamente.', pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.text('Sufragio Efectivo. No Reelección', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // Línea de firma
      doc.setLineWidth(0.3);
      doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
      y += 4;
      doc.setFontSize(7);
      doc.text('(Nombre y firma)', pageWidth / 2, y, { align: 'center' });

      // Guardar PDF
      const tipoLabel = tipoPETA === 'tiro' ? 'TIRO' : tipoPETA === 'competencia' ? 'COMPETENCIA' : 'CAZA';
      const nombreArchivo = `PETA_${tipoLabel}_${socioSeleccionado.nombre.replace(/\s+/g, '_').substring(0, 20)}_${new Date().getFullYear()}.pdf`;
      
      doc.save(nombreArchivo);
      showToast(`PDF generado: ${nombreArchivo}`, 'success', 3000);

    } catch (error) {
      console.error('Error generando PDF:', error);
      showToast('Error al generar PDF: ' + error.message, 'error', 5000);
    } finally {
      setGenerando(false);
    }
  };

  // Filtrar socios por búsqueda
  const sociosFiltrados = socios.filter(s => {
    if (!busqueda) return true;
    const busq = busqueda.toLowerCase();
    return s.nombre.toLowerCase().includes(busq) || 
           s.email.toLowerCase().includes(busq) ||
           String(s.noSocio).includes(busq);
  });

  if (!esSecretario) {
    return (
      <div className="generador-peta acceso-denegado">
        <h2>Acceso Restringido</h2>
        <p>Este módulo es exclusivo para el Secretario del Club.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="generador-peta loading">Cargando datos...</div>;
  }

  return (
    <div className="generador-peta">
      {/* Modo de Trabajo */}
      <div className="modo-trabajo">
        <button 
          className={!modoManual ? 'activo' : ''}
          onClick={() => setModoManual(false)}
        >
          📋 Desde Solicitud
        </button>
        <button 
          className={modoManual ? 'activo' : ''}
          onClick={() => setModoManual(true)}
        >
          ✍️ Manual
        </button>
      </div>

      {/* Paso 0: Solicitudes PETA Existentes (si no es modo manual) */}
      {!modoManual && (
        <div className="peta-section solicitudes-section">
          <h3>📋 Solicitudes PETA Pendientes</h3>
          <p className="seccion-ayuda">
            Selecciona una solicitud para pre-llenar el formulario automáticamente con los datos del socio.
          </p>

          {solicitudesPETA.length === 0 ? (
            <div className="no-solicitudes">
              <p>No hay solicitudes PETA pendientes</p>
              <button onClick={() => setModoManual(true)}>Crear PETA Manual</button>
            </div>
          ) : (
            <div className="solicitudes-lista">
              {solicitudesPETA.map(solicitud => (
                <div
                  key={solicitud.id}
                  className={`solicitud-item ${solicitudSeleccionada?.id === solicitud.id ? 'selected' : ''}`}
                  onClick={() => cargarSolicitud(solicitud)}
                >
                  <div className="solicitud-header">
                    <strong>{solicitud.socioNombre}</strong>
                    <span className={`estado-badge ${solicitud.estado}`}>
                      {solicitud.estado?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="solicitud-detalles">
                    <span>Tipo: <strong>{solicitud.tipo?.toUpperCase()}</strong></span>
                    <span>{solicitud.armasIncluidas?.length || 0} armas</span>
                    <span>
                      {solicitud.fechaSolicitud?.toDate().toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  {solicitud.estadosAutorizados && solicitud.estadosAutorizados.length > 0 && (
                    <div className="solicitud-estados">
                      Estados: {solicitud.estadosAutorizados.slice(0, 3).join(', ')}
                      {solicitud.estadosAutorizados.length > 3 && ` +${solicitud.estadosAutorizados.length - 3}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="peta-form">
        {/* Paso 1: Seleccionar Socio */}
        <div className="peta-section">
          <h3>1. Seleccionar Socio</h3>
          
          <input
            type="text"
            placeholder="Buscar por nombre, email o número de socio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="peta-busqueda"
          />

          <div className="socios-lista">
            {sociosFiltrados.slice(0, 20).map(socio => (
              <div
                key={socio.id}
                className={`socio-item ${socioSeleccionado?.id === socio.id ? 'selected' : ''}`}
                onClick={() => setSocioSeleccionado(socio)}
              >
                <span className="socio-num">{socio.noSocio}</span>
                <span className="socio-nombre">{socio.nombre}</span>
                <span className="socio-email">{socio.email}</span>
              </div>
            ))}
            {sociosFiltrados.length > 20 && (
              <div className="socios-mas">
                +{sociosFiltrados.length - 20} más. Usa el buscador para filtrar.
              </div>
            )}
          </div>
          
          <div className="socios-total">
            {socios.length} socios cargados | Mostrando {Math.min(sociosFiltrados.length, 20)} de {sociosFiltrados.length}
          </div>

          {socioSeleccionado && (
            <div className="socio-seleccionado">
              ✓ Seleccionado: <strong>{socioSeleccionado.nombre}</strong>
            </div>
          )}
        </div>

        {/* Paso 2: Tipo de PETA */}
        {socioSeleccionado && (
          <div className="peta-section">
            <h3>2. Tipo de PETA</h3>
            
            <div className="tipo-peta-opciones">
              <label className={`tipo-opcion ${tipoPETA === 'tiro' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="tipoPETA"
                  value="tiro"
                  checked={tipoPETA === 'tiro'}
                  onChange={(e) => setTipoPETA(e.target.value)}
                />
                <div className="tipo-info">
                  <strong>Práctica de Tiro</strong>
                  <span>Campo de tiro del club</span>
                  <span className="vigencia">Vigencia: Ene → Dic</span>
                </div>
              </label>

              <label className={`tipo-opcion ${tipoPETA === 'competencia' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="tipoPETA"
                  value="competencia"
                  checked={tipoPETA === 'competencia'}
                  onChange={(e) => setTipoPETA(e.target.value)}
                />
                <div className="tipo-info">
                  <strong>Competencia Nacional</strong>
                  <span>Eventos calendario FEMETI</span>
                  <span className="vigencia">Vigencia: Ene → Dic</span>
                </div>
              </label>

              <label className={`tipo-opcion ${tipoPETA === 'caza' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="tipoPETA"
                  value="caza"
                  checked={tipoPETA === 'caza'}
                  onChange={(e) => setTipoPETA(e.target.value)}
                />
                <div className="tipo-info">
                  <strong>Caza</strong>
                  <span>UMAs y cotos autorizados</span>
                  <span className="vigencia">Vigencia: Jul → Jun (+1)</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Paso 3: Datos del Solicitante (DN27 SEDENA-02-045) */}
        {socioSeleccionado && (
          <div className="peta-section">
            <h3>3. Datos del Solicitante</h3>
            
            {/* Fila: No. Expediente y Renovación */}
            <div className="form-row">
              <label htmlFor="gen-no-expediente">
                No. Expediente:
                <input
                  id="gen-no-expediente"
                  type="text"
                  name="noExpediente"
                  value={noExpediente}
                  onChange={(e) => setNoExpediente(e.target.value)}
                  placeholder="Número de expediente"
                  aria-label="Número de expediente SEDENA"
                />
              </label>
              <label className="renovacion-check">
                <input
                  type="checkbox"
                  checked={esRenovacion}
                  onChange={(e) => setEsRenovacion(e.target.checked)}
                />
                Es renovación
              </label>
            </div>

            {/* Fila: PETA Anterior (solo si es renovación) */}
            {esRenovacion && (
              <div className="form-row">
                <label htmlFor="gen-peta-anterior">
                  No. Permiso anterior:
                  <input
                    id="gen-peta-anterior"
                    type="text"
                    name="petaAnterior"
                    value={petaAnterior}
                    onChange={(e) => setPetaAnterior(e.target.value)}
                    placeholder="Número del PETA anterior"
                    aria-label="Número del PETA anterior"
                  />
                </label>
              </div>
            )}

            {/* Fila: Calle y Número */}
            <div className="form-row direccion">
              <label htmlFor="gen-calle" className="calle">
                Calle:
                <input
                  id="gen-calle"
                  type="text"
                  name="calle"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Nombre de la calle"
                  aria-label="Calle del domicilio"
                />
              </label>
              <label htmlFor="gen-num-ext" className="numero">
                No. Ext:
                <input
                  id="gen-num-ext"
                  type="text"
                  name="numeroExterior"
                  value={numeroExterior}
                  onChange={(e) => setNumeroExterior(e.target.value)}
                  placeholder="123"
                  aria-label="Número exterior"
                />
              </label>
              <label htmlFor="gen-num-int" className="numero">
                No. Int:
                <input
                  id="gen-num-int"
                  type="text"
                  name="numeroInterior"
                  value={numeroInterior}
                  onChange={(e) => setNumeroInterior(e.target.value)}
                  placeholder="A"
                  aria-label="Número interior (opcional)"
                />
              </label>
            </div>

            {/* Fila: Colonia y CP */}
            <div className="form-row direccion">
              <label htmlFor="gen-colonia" className="colonia">
                Colonia:
                <input
                  id="gen-colonia"
                  type="text"
                  name="colonia"
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  placeholder="Colonia"
                  aria-label="Colonia del domicilio"
                />
              </label>
              <label htmlFor="gen-cp" className="cp">
                C.P.:
                <input
                  id="gen-cp"
                  type="text"
                  name="cp"
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  placeholder="97000"
                  maxLength={5}
                  aria-label="Código postal del domicilio"
                />
              </label>
            </div>

            {/* Fila: Municipio y Estado */}
            <div className="form-row direccion2">
              <label htmlFor="gen-municipio" className="municipio">
                Municipio o Delegación:
                <input
                  id="gen-municipio"
                  type="text"
                  name="municipio"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  placeholder="Mérida"
                  aria-label="Municipio del domicilio"
                />
              </label>
              <label htmlFor="gen-estado-domicilio" className="estado-domicilio">
                Estado:
                <input
                  id="gen-estado-domicilio"
                  type="text"
                  name="estadoDomicilio"
                  value={estadoDomicilio}
                  onChange={(e) => setEstadoDomicilio(e.target.value)}
                  placeholder="Yucatán"
                  aria-label="Estado del domicilio"
                />
              </label>
            </div>

            {/* Fila: Correo electrónico */}
            <div className="form-row">
              <label htmlFor="gen-correo">
                Correo electrónico:
                <input
                  id="gen-correo"
                  type="email"
                  name="correoElectronico"
                  value={correoElectronico}
                  onChange={(e) => setCorreoElectronico(e.target.value)}
                  placeholder="ejemplo@email.com"
                  aria-label="Correo electrónico del solicitante"
                />
              </label>
            </div>
          </div>
        )}

        {/* Paso 4: Fechas */}
        {socioSeleccionado && (
          <div className="peta-section">
            <h3>4. Fechas del Oficio y Vigencia</h3>
            
            {/* Fecha del oficio (puede ser post/pre fecha) */}
            <div className="form-row fecha-oficio">
              <label htmlFor="gen-fecha-oficio">
                📅 Fecha del Oficio:
                <input
                  id="gen-fecha-oficio"
                  type="date"
                  name="fechaOficio"
                  value={fechaOficio}
                  onChange={(e) => setFechaOficio(e.target.value)}
                  aria-label="Fecha que aparecerá en el oficio PETA"
                />
                <span className="fecha-hint">Puede ser anterior o posterior a la fecha actual (post/pre fecha)</span>
              </label>
            </div>
            
            <p className="nota">Periodo de vigencia: Mínimo 15 días después de la fecha de solicitud</p>
            
            <div className="form-row fechas">
              <label htmlFor="gen-fecha-inicio">
                Fecha de inicio:
                <input
                  id="gen-fecha-inicio"
                  type="date"
                  name="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={getFechaMinInicio()}
                  aria-label="Fecha de inicio de vigencia del PETA"
                  aria-required="true"
                />
                <span className="fecha-hint">Mín. 15 días después del oficio: {getFechaMinInicio()}</span>
              </label>
              <label htmlFor="gen-fecha-fin">
                Fecha de fin:
                <input
                  id="gen-fecha-fin"
                  type="date"
                  name="fechaFin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  readOnly
                  aria-label="Fecha de fin de vigencia del PETA"
                />
                <span className="fecha-hint">
                  {tipoPETA === 'caza' ? '30 de junio del siguiente año' : '31 de diciembre del mismo año'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Paso 5: Armas */}
        {socioSeleccionado && (
          <div className="peta-section">
            <h3>5. Armas a Incluir (máximo 10)</h3>
            <p className="seleccion-info">
              Seleccionadas: {armasSeleccionadas.length}/10
            </p>

            {armasSocio.length === 0 ? (
              <p className="sin-armas">Este socio no tiene armas registradas.</p>
            ) : (
              <div className="armas-grid">
                {armasSocio.map(arma => (
                  <div
                    key={arma.id}
                    className={`arma-item ${armasSeleccionadas.includes(arma.id) ? 'selected' : ''} ${revisionBloqueada ? 'locked' : ''}`}
                    onClick={() => {
                      if (!revisionBloqueada) toggleArma(arma.id);
                    }}
                  >
                    <div className="arma-check">
                      {armasSeleccionadas.includes(arma.id) ? '✓' : '○'}
                    </div>
                    <div className="arma-info">
                      <span className="arma-clase">{arma.clase}</span>
                      <span className="arma-detalle">{arma.marca} - {arma.calibre}</span>
                      <span className="arma-matricula">Mat: {arma.matricula}</span>
                    </div>
                    {armasSeleccionadas.includes(arma.id) && (
                      <div className="arma-cartuchos" onClick={(e) => e.stopPropagation()}>
                        <label>
                          Cartuchos:
                          {(() => {
                            const limites = getLimitesCartuchos(arma.calibre, arma.clase);
                            const current = cartuchosPorArma[arma.id] ?? limites.default;
                            const safeVal = ajustarCartuchos(current, arma.calibre, arma.clase);
                            return (
                              <input
                                type="number"
                                value={safeVal}
                                onChange={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  setCartuchosPorArma(c => ({
                                    ...c,
                                    [arma.id]: ajustarCartuchos(raw, arma.calibre, arma.clase)
                                  }));
                                }}
                                min={limites.min}
                                max={limites.max}
                                step={limites.step}
                                disabled={revisionBloqueada}
                              />
                            );
                          })()}
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 6: Competencias FEMETI (solo para competencia nacional) */}
        {socioSeleccionado && tipoPETA === 'competencia' && (
          <div className="peta-section">
            <h3>6. Modalidad y Estados FEMETI 2026 (requerido DN27)</h3>
            <p className="seleccion-info" style={{ marginBottom: '15px', color: '#f59e0b' }}>
              ⚠️ Selecciona modalidad y estados. Se incluirán automáticamente TODOS los clubes de esa modalidad en cada estado.
            </p>
            
            <SelectorEstadosFEMETI
              onChange={(data) => {
                setModalidadFEMETI(data);
                // También actualizar estadosSeleccionados para compatibilidad
                if (data?.estadosSeleccionados) {
                  setEstadosSeleccionados(data.estadosSeleccionados);
                }
              }}
              fechaSolicitud={fechaOficio || new Date().toISOString().split('T')[0]}
              maxEstados={10}
            />
          </div>
        )}

        {/* Paso 6: Campo de Tiro (solo para tiro) */}
        {socioSeleccionado && tipoPETA === 'tiro' && (
          <div className="peta-section">
            <h3>6. Campo de Tiro (Sección G - DN27)</h3>
            
            <div className="campo-tiro-info" style={{ 
              background: 'var(--bg-secondary)', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                🏟️ Campo de Tiro del Club (siempre incluido):
              </p>
              <p style={{ marginLeft: '10px', fontSize: '14px' }}>
                {DATOS_CLUB.nombre}
              </p>
              <p style={{ marginLeft: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {DATOS_CLUB.campoTiro.texto}
              </p>
            </div>

            <div className="club-invitado-section">
              <label className="club-invitado-check" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '15px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={tieneClubInvitado}
                  onChange={(e) => setTieneClubInvitado(e.target.checked)}
                />
                <span style={{ fontWeight: '600' }}>
                  📩 Agregar club invitado (requiere oficio de invitación anexo)
                </span>
              </label>

              {tieneClubInvitado && (
                <div className="club-invitado-form" style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '15px', 
                  borderRadius: '8px',
                  marginTop: '10px'
                }}>
                  <div className="form-row" style={{ marginBottom: '12px' }}>
                    <label htmlFor="gen-club-invitado" style={{ display: 'block', marginBottom: '5px' }}>
                      Nombre del Club Invitado:
                    </label>
                    <input
                      id="gen-club-invitado"
                      type="text"
                      value={clubInvitado}
                      onChange={(e) => setClubInvitado(e.target.value)}
                      placeholder="Ej: Club de Tiro de Cancún"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="gen-domicilio-club-invitado" style={{ display: 'block', marginBottom: '5px' }}>
                      Domicilio del Campo de Tiro:
                    </label>
                    <textarea
                      id="gen-domicilio-club-invitado"
                      value={domicilioClubInvitado}
                      onChange={(e) => setDomicilioClubInvitado(e.target.value)}
                      placeholder="Dirección completa del campo de tiro del club invitado"
                      rows={2}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', resize: 'vertical' }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '10px' }}>
                    ⚠️ Recuerda anexar el oficio de invitación del club al expediente.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paso 6b: Estados para Caza (lista simple) */}
        {socioSeleccionado && tipoPETA === 'caza' && (
          <div className="peta-section">
            <h3>6. Estados Autorizados para Caza (máximo 10)</h3>
            <p className="seleccion-info">
              Seleccionados: {estadosSeleccionados.length}/10
            </p>

            <button
              className="btn-sugerir"
              onClick={aplicarEstadosSugeridos}
              style={{
                marginBottom: '12px',
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ✨ Sugerir estados para Caza (Sureste + UMAs)
            </button>

            <div className="estados-grid">
              {ESTADOS_MEXICO.map(estado => (
                <div
                  key={estado}
                  className={`estado-item ${estadosSeleccionados.includes(estado) ? 'selected' : ''}`}
                  onClick={() => toggleEstado(estado)}
                >
                  <span className="estado-check">
                    {estadosSeleccionados.includes(estado) ? '✓' : '○'}
                  </span>
                  <span className="estado-nombre">{estado}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Generar */}
        {socioSeleccionado && (
          <div className="peta-actions">
            <button
              className="btn-generar"
              onClick={generarPDF}
              disabled={generando || armasSeleccionadas.length === 0}
            >
              {generando ? 'Generando PDF...' : '📄 Generar Oficio PETA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  
  // Dirección del solicitante (6 campos)
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [cp, setCp] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estadoDomicilio, setEstadoDomicilio] = useState('');
  
  // Fechas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Armas seleccionadas (máx 10)
  const [armasSeleccionadas, setArmasSeleccionadas] = useState([]);
  const [cartuchosPorArma, setCartuchosPorArma] = useState({});
  
  // Estados seleccionados (máx 10, solo para competencia/caza)
  const [estadosSeleccionados, setEstadosSeleccionados] = useState(['Yucatán']);
  
  // Buscar socio
  const [busqueda, setBusqueda] = useState('');

  // Solo el secretario puede usar este módulo
  const esSecretario = userEmail === 'admin@club738.com';

  // En revisión desde solicitud (no manual): bloquear edición de armas/cartuchos
  const revisionBloqueada = esSecretario && solicitudSeleccionada && !modoManual;

  useEffect(() => {
    if (esSecretario) {
      cargarSocios();
      cargarSolicitudesPETA();
    }
  }, [esSecretario]);

  useEffect(() => {
    if (socioSeleccionado) {
      cargarArmasSocio(socioSeleccionado.email);
      // Pre-llenar dirección si existe (desde campo 'domicilio' en Firestore)
      // Estructura actualizada con 6 campos: calle, colonia, ciudad, municipio, estado, cp
      if (socioSeleccionado.domicilio) {
        setCalle(socioSeleccionado.domicilio.calle || '');
        setColonia(socioSeleccionado.domicilio.colonia || '');
        setCiudad(socioSeleccionado.domicilio.ciudad || '');
        setCp(socioSeleccionado.domicilio.cp || '');
        setMunicipio(socioSeleccionado.domicilio.municipio || '');
        setEstadoDomicilio(socioSeleccionado.domicilio.estado || '');
      } else {
        // Limpiar campos si no hay domicilio
        setCalle('');
        setColonia('');
        setCiudad('');
        setCp('');
        setMunicipio('');
        setEstadoDomicilio('');
      }
    }
  }, [socioSeleccionado]);

  // Calcular fecha fin automáticamente según tipo
  useEffect(() => {
    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      if (tipoPETA === 'caza') {
        // Caza: hasta 30 de junio del año siguiente
        const añoFin = inicio.getMonth() >= 6 ? inicio.getFullYear() + 1 : inicio.getFullYear();
        setFechaFin(`${añoFin}-06-30`);
      } else {
        // Tiro y Competencia: hasta 31 de diciembre del mismo año
        setFechaFin(`${inicio.getFullYear()}-12-31`);
      }
    }
  }, [fechaInicio, tipoPETA]);

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
      
      // Domicilio
      if (solicitud.domicilio) {
        setCalle(solicitud.domicilio.calle || '');
        setColonia(solicitud.domicilio.colonia || '');
        setCiudad(solicitud.domicilio.ciudad || '');
        setCp(solicitud.domicilio.cp || '');
        setMunicipio(solicitud.domicilio.municipio || '');
        setEstadoDomicilio(solicitud.domicilio.estado || '');
      }
      
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

    if ((tipoPETA === 'competencia' || tipoPETA === 'caza') && estadosSeleccionados.length === 0) {
      showToast('Selecciona al menos un estado', 'warning', 3000);
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
      const margin = 20;
      let y = 20;

      // ========== DECORATIVE BORDER ==========
      // Outer border (thick)
      doc.setLineWidth(0.8);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
      // Inner border (thin)
      doc.setLineWidth(0.3);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Helper para centrar texto
      const centrarTexto = (texto, yPos, fontSize = 10) => {
        const textWidth = doc.getTextWidth(texto);
        doc.text(texto, (pageWidth - textWidth) / 2, yPos);
      };

      // ========== ENCABEZADO ==========
      doc.setFont('helvetica', 'bold');
      centrarTexto('SECRETARIA DE LA DEFENSA NACIONAL', y, 11);
      y += 5;
      doc.setFontSize(9);
      centrarTexto('DIRECCIÓN GENERAL DEL REGISTRO FEDERAL DE ARMAS DE FUEGO Y CONTROL DE EXPLOSIVOS.', y);
      y += 5;
      doc.setFontSize(10);
      centrarTexto('SOLICITUD DE PERMISO EXTRAORDINARIO PARA LA PRÁCTICA DE CAZA, TIRO Y/O COMPETENCIA.', y);
      y += 10;

      // ========== DATOS DEL CLUB ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      centrarTexto('DATOS DEL CLUB.', y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`NOMBRE DEL CLUB: ${DATOS_CLUB.nombre}`, margin, y);
      doc.text(`No.REG.ANTE S.D.N.: ${DATOS_CLUB.registroSEDENA}`, pageWidth - margin - 50, y);
      y += 8;

      // ========== DATOS DEL SOLICITANTE ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      centrarTexto('DATOS DEL SOLICITANTE.', y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // NPS y PETA anterior
      doc.text(`N.P.S.: `, margin, y);
      // PETA anterior (solo si es renovación)
      if (esRenovacion) {
        const petaAnteriorTexto = petaAnterior ? `S-1/M-4/${petaAnterior}` : 'S-1/M-4/____';
        doc.text(`No.P. E.T.A. ANTERIOR: ${petaAnteriorTexto}`, margin + 60, y);
      }
      y += 5;

      doc.setFontSize(9);
      doc.text(`NOMBRE: ${socioSeleccionado.nombre.toUpperCase()}`, margin, y);
      y += 5;

      doc.text(`CALLE: ${calle.toUpperCase()}`, margin, y);
      doc.text(`COLONIA: ${colonia.toUpperCase()}`, margin + 90, y);
      y += 5;

      doc.text(`C.P.: ${cp}`, margin, y);
      // Mostrar ciudad y estado juntos: "MÉRIDA, YUCATÁN"
      const ciudadEstado = estadoDomicilio ? `${ciudad}, ${estadoDomicilio}`.toUpperCase() : ciudad.toUpperCase();
      doc.text(`CIUDAD Y ESTADO: ${ciudadEstado}`, margin + 40, y);
      y += 8;

      // ========== TIPO DE ACTIVIDAD ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      centrarTexto('TIPO DE ACTIVIDAD.', y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const cazaX = tipoPETA === 'caza' ? 'X' : ' ';
      const tiroX = tipoPETA === 'tiro' ? 'X' : ' ';
      const compX = tipoPETA === 'competencia' ? 'X' : ' ';
      
      // Distribuir las tres opciones uniformemente
      const activityWidth = pageWidth - (margin * 2);
      const cazaPos = margin;
      const tiroPos = margin + activityWidth / 3;
      const compPos = margin + (activityWidth * 2 / 3);
      
      doc.text(`CAZA(  ${cazaX}  )`, cazaPos, y);
      doc.text(`TIRO(  ${tiroX}  )`, tiroPos, y);
      doc.text(`COMPETENCIA NACIONAL(  ${compX}  )`, compPos, y);
      y += 8;

      // ========== PERIODO ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      centrarTexto('PERIODO (MÍNIMO A PARTIR DE 15 DÍAS DE LA FECHA DE LA SOLICITUD):', y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const fechaInicioFmt = formatearFechaPETA(fechaInicio);
      const fechaFinFmt = formatearFechaPETA(fechaFin);
      doc.text(`${fechaInicioFmt}  AL  ${fechaFinFmt}`, margin, y);
      y += 10;

      // ========== ARMAS ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATOS DE LAS ARMAS QUE EMPLEARÁ', margin, y);
      y += 8;  // Aumentado de 6 a 8 para espacio después del título

      // Encabezados de tabla
      const colWidths = [10, 45, 25, 35, 30, 20];
      const headers = ['ORD', 'CLASE', 'CALIBRE', 'MARCA', 'MATRÍCULA', 'CARTUCHOS'];
      const tableStartY = y;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setLineWidth(0.4);
      
      let xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 1, y + 4);
        xPos += colWidths[i];
      });
      y += 6;

      // Filas de armas
      console.log('📄 Generando PDF - Estado actual:');
      console.log('  armasSeleccionadas:', armasSeleccionadas);
      console.log('  armasSocio:', armasSocio);
      console.log('  cartuchosPorArma:', cartuchosPorArma);
      
      doc.setFont('helvetica', 'normal');
      for (let i = 0; i < 10; i++) {
        xPos = margin;
        const armaId = armasSeleccionadas[i];
        const arma = armaId ? armasSocio.find(a => a.id === armaId) : null;
        
        if (armaId && !arma) {
          console.warn(`⚠️ Arma con ID ${armaId} no encontrada en armasSocio`);
        }
        
        doc.text(`${i + 1}`, xPos + 1, y + 2);
        xPos += colWidths[0];
        
        if (arma) {
          doc.text((arma.clase || '').substring(0, 25).toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[1];
          doc.text((arma.calibre || '').toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[2];
          doc.text((arma.marca || '').substring(0, 18).toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[3];
          doc.text((arma.matricula || '').toUpperCase(), xPos + 1, y + 2);
          xPos += colWidths[4];
          {
            const limites = getLimitesCartuchos(arma.calibre, arma.clase);
            const val = cartuchosPorArma[armaId] ?? limites.default;
            const ajustado = ajustarCartuchos(val, arma.calibre, arma.clase);
            doc.text(String(ajustado), xPos + 1, y + 2);
          }
        }
        y += 5;
      }
      
      y += 3;

      // ========== DESTINO / ESTADOS ==========
      doc.setFontSize(9);
      if (tipoPETA === 'tiro') {
        // Práctica de tiro - Campo del club
        const lineas = doc.splitTextToSize(DATOS_CLUB.campoTiro.texto, pageWidth - (margin * 2));
        lineas.forEach(linea => {
          doc.text(linea, margin, y);
          y += 5;
        });
      } else if (tipoPETA === 'competencia') {
        doc.setFont('helvetica', 'bold');
        doc.text('POR SER DE PETA DE COMPETENCIA NACIONAL SE SOLICITAN LOS SIGUIENTES ESTADOS (MÁXIMO 10)', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const estadosLinea = estadosSeleccionados.join(', ');
        const lineasEstados = doc.splitTextToSize(estadosLinea, pageWidth - margin * 2);
        lineasEstados.forEach(linea => {
          doc.text(linea, margin, y);
          y += 4;
        });
      } else {
        // Caza
        doc.setFont('helvetica', 'bold');
        doc.text('SI LA ACTIVIDAD ES DE CACERÍA ESPECIFIQUE LOS ESTADOS DONDE LA PRACTICARÁ (MÁXIMO 10)', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const estadosLinea = estadosSeleccionados.join(', ');
        const lineasEstados = doc.splitTextToSize(estadosLinea, pageWidth - margin * 2);
        lineasEstados.forEach(linea => {
          doc.text(linea, margin, y);
          y += 4;
        });
      }

      // ========== FIRMA ==========
      y = Math.max(y + 15, 220); // Asegurar espacio para firma
      
      const hoy = new Date();
      const firmaLinea1 = `LUGAR Y FECHA DE LA SOLICITUD      Mérida, Yucatán a ${formatearFechaLarga(hoy)}`;
      doc.text(firmaLinea1, pageWidth / 2, y, { align: 'center' });
      y += 15;

      doc.text('ATENTAMENTE.', pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('SUFRAGIO EFECTIVO, NO REELECCIÓN', pageWidth / 2, y, { align: 'center' });
      y += 20;

      doc.setFont('helvetica', 'bold');
      doc.text(DATOS_CLUB.presidente, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text('PRESIDENTE DEL CLUB.', pageWidth / 2, y, { align: 'center' });

      // Guardar PDF
      const tipoLabel = tipoPETA === 'tiro' ? 'TIRO' : tipoPETA === 'competencia' ? 'COMPETENCIA' : 'CAZA';
      const nombreArchivo = `PETA_${tipoLabel}_${socioSeleccionado.nombre.replace(/\s+/g, '_').substring(0, 20)}_${new Date().getFullYear()}.pdf`;
      
      doc.save(nombreArchivo);

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar PDF: ' + error.message);
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

        {/* Paso 3: Datos del Solicitante */}
        {socioSeleccionado && (
          <div className="peta-section">
            <h3>3. Datos del Solicitante</h3>
            
            <div className="form-row">
              <label className="renovacion-check">
                <input
                  type="checkbox"
                  checked={esRenovacion}
                  onChange={(e) => setEsRenovacion(e.target.checked)}
                />
                Es renovación
              </label>
            </div>

            <div className="form-row">
              <label htmlFor="gen-peta-anterior">
                No. PETA Anterior (S-1/M-4/):
                <input
                  id="gen-peta-anterior"
                  type="text"
                  name="petaAnterior"
                  value={petaAnterior}
                  onChange={(e) => setPetaAnterior(e.target.value)}
                  placeholder="4 dígitos del PETA anterior"
                  aria-label="Número del PETA anterior"
                />
              </label>
            </div>

            <div className="form-row direccion">
              <label htmlFor="gen-calle" className="calle">
                Calle:
                <input
                  id="gen-calle"
                  type="text"
                  name="calle"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Calle y número"
                  aria-label="Calle del domicilio"
                />
              </label>
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
            </div>

            <div className="form-row direccion2">
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
              <label htmlFor="gen-municipio" className="municipio">
                Municipio:
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
                  placeholder="YUC."
                  aria-label="Estado del domicilio"
                />
              </label>
            </div>
          </div>
        )}

        {/* Paso 4: Fechas */}
        {socioSeleccionado && (
          <div className="peta-section">
            <h3>4. Periodo de Vigencia</h3>
            <p className="nota">Mínimo 15 días después de la fecha de solicitud</p>
            
            <div className="form-row fechas">
              <label htmlFor="gen-fecha-inicio">
                Fecha de inicio:
                <input
                  id="gen-fecha-inicio"
                  type="date"
                  name="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  aria-label="Fecha de inicio de vigencia del PETA"
                  aria-required="true"
                />
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

        {/* Paso 6: Estados (solo para competencia/caza) */}
        {socioSeleccionado && (tipoPETA === 'competencia' || tipoPETA === 'caza') && (
          <div className="peta-section">
            <h3>6. Estados Autorizados (máximo 10)</h3>
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
              ✨ Sugerir estados FEMETI {tipoPETA === 'caza' ? 'para Caza' : 'para Competencia'}
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

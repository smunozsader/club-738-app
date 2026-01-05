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
import { jsPDF } from 'jspdf';
import './GeneradorPETA.css';

// Datos constantes del Club
const DATOS_CLUB = {
  nombre: 'CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.',
  registroSEDENA: '738',
  presidente: 'LIC. RICARDO J. FERNÁNDEZ Y GASQUE',
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

// Meses en español
const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
               'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

export default function GeneradorPETA({ userEmail, onBack }) {
  // Estados del formulario
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [armasSocio, setArmasSocio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  
  // Datos del formulario PETA
  const [tipoPETA, setTipoPETA] = useState('tiro'); // tiro, competencia, caza
  const [nps, setNps] = useState('');
  const [petaAnterior, setPetaAnterior] = useState('');
  const [esRenovacion, setEsRenovacion] = useState(false);
  
  // Dirección del solicitante
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [cp, setCp] = useState('');
  const [municipio, setMunicipio] = useState('');
  
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
  const esSecretario = userEmail === 'smunozam@gmail.com';

  useEffect(() => {
    if (esSecretario) {
      cargarSocios();
    }
  }, [esSecretario]);

  useEffect(() => {
    if (socioSeleccionado) {
      cargarArmasSocio(socioSeleccionado.email);
      // Pre-llenar dirección si existe
      if (socioSeleccionado.direccion) {
        setCalle(socioSeleccionado.direccion.calle || '');
        setColonia(socioSeleccionado.direccion.colonia || '');
        setCp(socioSeleccionado.direccion.cp || '');
        setMunicipio(socioSeleccionado.direccion.municipio || '');
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
          direccion: data.direccion || null
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

  const cargarArmasSocio = async (email) => {
    try {
      const socioRef = doc(db, 'socios', email.toLowerCase());
      const armasRef = collection(socioRef, 'armas');
      const snapshot = await getDocs(armasRef);
      
      const armasData = [];
      snapshot.forEach(docSnap => {
        armasData.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      
      setArmasSocio(armasData);
      setArmasSeleccionadas([]);
      setCartuchosPorArma({});
    } catch (error) {
      console.error('Error cargando armas:', error);
    }
  };

  const toggleArma = (armaId) => {
    setArmasSeleccionadas(prev => {
      if (prev.includes(armaId)) {
        return prev.filter(id => id !== armaId);
      } else if (prev.length < 10) {
        // Establecer cartuchos por defecto según tipo de arma
        const arma = armasSocio.find(a => a.id === armaId);
        const calibre = arma?.calibre?.toUpperCase() || '';
        let cartuchosDefault = 200;
        if (calibre.includes('.22') || calibre.includes('22 L.R.')) {
          cartuchosDefault = 1000;
        } else if (calibre.includes('12') || calibre.includes('20') || calibre.includes('GA')) {
          cartuchosDefault = 500;
        }
        setCartuchosPorArma(c => ({ ...c, [armaId]: cartuchosDefault }));
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
      alert('Selecciona un socio y al menos un arma');
      return;
    }

    if (!fechaInicio || !fechaFin) {
      alert('Especifica las fechas de vigencia');
      return;
    }

    if ((tipoPETA === 'competencia' || tipoPETA === 'caza') && estadosSeleccionados.length === 0) {
      alert('Selecciona al menos un estado');
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
      const margin = 20;
      let y = 20;

      // Helper para centrar texto
      const centrarTexto = (texto, yPos, fontSize = 10) => {
        doc.setFontSize(fontSize);
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
      doc.text('DATOS DEL CLUB.', margin, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`NOMBRE DEL CLUB: ${DATOS_CLUB.nombre}`, margin, y);
      doc.text(`No.REG.ANTE S.D.N.: ${DATOS_CLUB.registroSEDENA}`, pageWidth - margin - 50, y);
      y += 8;

      // ========== DATOS DEL SOLICITANTE ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATOS DEL SOLICITANTE.', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // NPS y PETA anterior
      doc.text(`N.P.S.: ${nps}`, margin, y);
      const petaAnteriorTexto = esRenovacion ? petaAnterior : '';
      doc.text(`No.P. E.T.A. ANTERIOR: ${petaAnteriorTexto}`, margin + 60, y);
      doc.setFontSize(7);
      doc.text('(ÚNICAMENTE PARA RENOVACIONES)', margin + 115, y);
      y += 5;

      doc.setFontSize(9);
      doc.text(`NOMBRE: ${socioSeleccionado.nombre.toUpperCase()}`, margin, y);
      y += 5;

      doc.text(`CALLE: ${calle.toUpperCase()}`, margin, y);
      doc.text(`COLONIA: ${colonia.toUpperCase()}`, margin + 90, y);
      y += 5;

      doc.text(`C.P.: ${cp}`, margin, y);
      doc.text(`DELG. O MPIO.: ${municipio.toUpperCase()}`, margin + 40, y);
      y += 8;

      // ========== TIPO DE ACTIVIDAD ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TIPO DE ACTIVIDAD.', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const cazaX = tipoPETA === 'caza' ? 'X' : ' ';
      const tiroX = tipoPETA === 'tiro' ? 'X' : ' ';
      const compX = tipoPETA === 'competencia' ? 'X' : ' ';
      doc.text(`CAZA(  ${cazaX}  )          TIRO(  ${tiroX}  )          COMPETENCIA NACIONAL(  ${compX}  )`, margin, y);
      y += 8;

      // ========== PERIODO ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('PERIODO (MÍNIMO A PARTIR DE 15 DÍAS DE LA FECHA DE LA SOLICITUD):', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const fechaInicioFmt = formatearFechaPETA(fechaInicio);
      const fechaFinFmt = formatearFechaPETA(fechaFin);
      doc.text(`${fechaInicioFmt}  AL  ${fechaFinFmt}`, margin, y);
      doc.setFontSize(7);
      doc.text('DIA  MES  AÑO        DIA  MES  AÑO', margin + 50, y);
      y += 10;

      // ========== ARMAS ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATOS DE LAS ARMAS QUE EMPLEARÁ', margin, y);
      y += 6;

      // Encabezados de tabla
      const colWidths = [10, 45, 25, 35, 30, 20];
      const headers = ['ORD', 'CLASE', 'CALIBRE', 'MARCA', 'MATRÍCULA', 'CARTUCHOS'];
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      let xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos, y);
        xPos += colWidths[i];
      });
      y += 1;
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      // Filas de armas
      doc.setFont('helvetica', 'normal');
      for (let i = 0; i < 10; i++) {
        xPos = margin;
        const armaId = armasSeleccionadas[i];
        const arma = armaId ? armasSocio.find(a => a.id === armaId) : null;
        
        doc.text(`${i + 1}`, xPos, y);
        xPos += colWidths[0];
        
        if (arma) {
          doc.text((arma.clase || '').substring(0, 25).toUpperCase(), xPos, y);
          xPos += colWidths[1];
          doc.text((arma.calibre || '').toUpperCase(), xPos, y);
          xPos += colWidths[2];
          doc.text((arma.marca || '').substring(0, 18).toUpperCase(), xPos, y);
          xPos += colWidths[3];
          doc.text((arma.matricula || '').toUpperCase(), xPos, y);
          xPos += colWidths[4];
          doc.text(String(cartuchosPorArma[armaId] || 200), xPos, y);
        }
        y += 5;
      }
      y += 5;

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
        estadosSeleccionados.forEach(estado => {
          doc.text(estado, margin, y);
          y += 4;
        });
      } else {
        // Caza
        doc.setFont('helvetica', 'bold');
        doc.text('SI LA ACTIVIDAD ES DE CACERÍA ESPECIFIQUE LOS ESTADOS DONDE LA PRACTICARÁ (MÁXIMO 10)', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        estadosSeleccionados.forEach(estado => {
          doc.text(estado, margin, y);
          y += 4;
        });
      }

      // ========== FIRMA ==========
      y = Math.max(y + 15, 220); // Asegurar espacio para firma
      
      const hoy = new Date();
      doc.text(`LUGAR Y FECHA DE LA SOLICITUD      Mérida, Yucatán a ${formatearFechaLarga(hoy)}`, margin, y);
      y += 15;

      doc.text('ATENTAMENTE.', margin, y);
      y += 5;
      doc.text('SUFRAGIO EFECTIVO, NO REELECCIÓN', margin, y);
      y += 20;

      doc.setFont('helvetica', 'bold');
      doc.text(DATOS_CLUB.presidente, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text('PRESIDENTE DEL CLUB.', margin, y);

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
      <div className="peta-header">
        <h2>Generador de Oficios PETA</h2>
        <p>Permiso Extraordinario para la Transportación de Armas</p>
      </div>

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
              <label>
                N.P.S. (Número Personal de Socio):
                <input
                  type="text"
                  value={nps}
                  onChange={(e) => setNps(e.target.value)}
                  placeholder="Ej: S-1/M-4/86"
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

            {esRenovacion && (
              <div className="form-row">
                <label>
                  No. PETA Anterior:
                  <input
                    type="text"
                    value={petaAnterior}
                    onChange={(e) => setPetaAnterior(e.target.value)}
                    placeholder="Número del PETA anterior"
                  />
                </label>
              </div>
            )}

            <div className="form-row direccion">
              <label className="calle">
                Calle:
                <input
                  type="text"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Calle y número"
                />
              </label>
              <label className="colonia">
                Colonia:
                <input
                  type="text"
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  placeholder="Colonia"
                />
              </label>
            </div>

            <div className="form-row direccion2">
              <label className="cp">
                C.P.:
                <input
                  type="text"
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  placeholder="97000"
                  maxLength={5}
                />
              </label>
              <label className="municipio">
                Municipio, Estado:
                <input
                  type="text"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  placeholder="Mérida, Yucatán"
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
              <label>
                Fecha de inicio:
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </label>
              <label>
                Fecha de fin:
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  readOnly
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
                    className={`arma-item ${armasSeleccionadas.includes(arma.id) ? 'selected' : ''}`}
                    onClick={() => toggleArma(arma.id)}
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
                          <input
                            type="number"
                            value={cartuchosPorArma[arma.id] || 200}
                            onChange={(e) => setCartuchosPorArma(c => ({
                              ...c,
                              [arma.id]: parseInt(e.target.value) || 200
                            }))}
                            min={50}
                            max={2000}
                            step={50}
                          />
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

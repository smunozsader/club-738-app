/**
 * VerificadorPETA - Checklist de verificación para el Secretario
 * 
 * Permite al secretario:
 * - Ver solicitudes PETA de todos los socios
 * - Verificar documentos digitales vs físicos
 * - Marcar documentos como verificados
 * - Cambiar estado de la solicitud
 * - Agregar notas y observaciones
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './VerificadorPETA.css';

// Mapeo de documentos precargados (subidos via scripts a Storage)
// Estos archivos están en Storage pero pueden no estar registrados en Firestore
const PRELOADED_DOCS_MAP = {
  'curp': ['curp.pdf'],
  'constanciaAntecedentes': ['constancia_antecedentes.pdf', 'constancia.pdf', 'antecedentes.pdf']
};

// Documentos que se buscan por prefijo (tienen timestamp en el nombre)
const PREFIX_DOCS = ['fotoCredencial'];

const DOCUMENTOS_DIGITALES = [
  { id: 'curp', nombre: 'CURP' },
  { id: 'constanciaAntecedentes', nombre: 'Constancia Antecedentes Penales' },
  { id: 'ine', nombre: 'INE (ambas caras)' },
  { id: 'cartillaMilitar', nombre: 'Cartilla Militar / Acta Nacimiento' },
  { id: 'comprobanteDomicilio', nombre: 'Comprobante de Domicilio' },
  { id: 'certificadoMedico', nombre: 'Certificado Médico' },
  { id: 'certificadoPsicologico', nombre: 'Certificado Psicológico' },
  { id: 'certificadoToxicologico', nombre: 'Certificado Toxicológico' },
  { id: 'cartaModoHonesto', nombre: 'Modo Honesto de Vivir' },
  { id: 'fotoCredencial', nombre: 'Foto Infantil (para credencial)' }
];

const DOCUMENTOS_FISICOS_BASE = [
  { id: 'foto-peta', nombre: 'Foto infantil fondo blanco (1 unidad)' },
  { id: 'e5cinco', nombre: 'Recibo e5cinco (original)' },
  { id: 'cert-medico-orig', nombre: 'Certificado Médico (original)' },
  { id: 'cert-psico-orig', nombre: 'Certificado Psicológico (original)' },
  { id: 'cert-toxico-orig', nombre: 'Certificado Toxicológico (original)' },
  { id: 'constancia-orig', nombre: 'Constancia Antecedentes (original)' },
  { id: 'comprobante-orig', nombre: 'Comprobante Domicilio (original)' },
  { id: 'modo-honesto-orig', nombre: 'Modo Honesto de Vivir (original)' },
  { id: 'credencial-club', nombre: 'Credencial del Club 2026 (copia)' }
];

export default function VerificadorPETA({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [petaSeleccionado, setPetaSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [preloadedDocs, setPreloadedDocs] = useState({}); // Documentos precargados en Storage
  
  // Estado de verificación
  const [docsDigitalesVerif, setDocsDigitalesVerif] = useState({});
  const [docsFisicosVerif, setDocsFisicosVerif] = useState({});
  const [notas, setNotas] = useState('');

  // Función para buscar documentos precargados en Storage
  const checkPreloadedDocs = async (userEmail) => {
    const found = {};
    
    // 1. Buscar archivos con nombres exactos
    for (const [docId, fileNames] of Object.entries(PRELOADED_DOCS_MAP)) {
      for (const fileName of fileNames) {
        try {
          const docRef = ref(storage, `documentos/${userEmail}/${fileName}`);
          const url = await getDownloadURL(docRef);
          found[docId] = { url, fileName };
          console.log(`✅ Doc precargado: ${docId} -> ${fileName}`);
          break; // Encontrado, no buscar más nombres
        } catch (error) {
          // No encontrado con este nombre, continuar
        }
      }
    }
    
    // 2. Buscar archivos por prefijo (ej: fotoCredencial_xxxxx.jpg)
    try {
      const folderRef = ref(storage, `documentos/${userEmail}`);
      const fileList = await listAll(folderRef);
      
      for (const prefix of PREFIX_DOCS) {
        const matchingFile = fileList.items.find(item => item.name.startsWith(prefix));
        if (matchingFile && !found[prefix]) {
          try {
            const url = await getDownloadURL(matchingFile);
            found[prefix] = { url, fileName: matchingFile.name };
            console.log(`✅ Doc por prefijo: ${prefix} -> ${matchingFile.name}`);
          } catch (error) {
            console.log(`⚠️ Error obteniendo URL: ${matchingFile.name}`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Error listando carpeta: ${error.message}`);
    }
    
    return found;
  };
  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const sociosRef = collection(db, 'socios');
      const sociosSnap = await getDocs(sociosRef);
      
      const sociosList = await Promise.all(
        sociosSnap.docs.map(async (socioDoc) => {
          const socioData = socioDoc.data();
          
          // Cargar PETAs del socio
          const petasRef = collection(db, 'socios', socioDoc.id, 'petas');
          const petasSnap = await getDocs(petasRef);
          const petas = petasSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          return {
            email: socioDoc.id,
            nombre: socioData.nombre || socioDoc.id,
            petas: petas,
            documentosPETA: socioData.documentosPETA || {}
          };
        })
      );
      
      // Filtrar solo socios con PETAs
      const sociosConPETAs = sociosList.filter(s => s.petas.length > 0);
      setSocios(sociosConPETAs);
      
    } catch (error) {
      console.error('Error cargando socios:', error);
      alert('Error al cargar datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPETA = async (socio, peta) => {
    setSocioSeleccionado(socio);
    setPetaSeleccionado(peta);
    
    // Buscar documentos precargados en Storage
    const preloaded = await checkPreloadedDocs(socio.email);
    setPreloadedDocs(preloaded);
    
    // Auto-marcar como verificados los documentos que EXISTEN
    // Combina: verificación manual guardada + documentos encontrados (Firestore o Storage)
    const autoVerifDigitales = { ...(peta.verificacionDigitales || {}) };
    
    DOCUMENTOS_DIGITALES.forEach(docItem => {
      const existeEnFirestore = socio.documentosPETA?.[docItem.id]?.url;
      const existeEnStorage = preloaded[docItem.id]?.url;
      
      // Si el documento existe Y no tiene verificación guardada, marcarlo automáticamente
      if ((existeEnFirestore || existeEnStorage) && autoVerifDigitales[docItem.id] === undefined) {
        autoVerifDigitales[docItem.id] = true;
      }
    });
    
    // Pre-cargar estado de verificación
    setDocsDigitalesVerif(autoVerifDigitales);
    setDocsFisicosVerif(peta.verificacionFisicos || {});
    setNotas(peta.notasSecretario || '');
  };

  const toggleDocDigital = (docId) => {
    setDocsDigitalesVerif({
      ...docsDigitalesVerif,
      [docId]: !docsDigitalesVerif[docId]
    });
  };

  const toggleDocFisico = (docId) => {
    setDocsFisicosVerif({
      ...docsFisicosVerif,
      [docId]: !docsFisicosVerif[docId]
    });
  };

  const calcularProgreso = () => {
    const totalDigitales = DOCUMENTOS_DIGITALES.length;
    const verificadosDigitales = Object.values(docsDigitalesVerif).filter(v => v).length;
    
    let documentosFisicos = [...DOCUMENTOS_FISICOS_BASE];
    if (petaSeleccionado?.tipo === 'caza') {
      documentosFisicos.push({ id: 'licencia-caza', nombre: 'Licencia SEMARNAT (copia)' });
    }
    if (petaSeleccionado?.esRenovacion) {
      documentosFisicos.push({ id: 'peta-anterior', nombre: 'PETA anterior (original)' });
    }
    
    const totalFisicos = documentosFisicos.length;
    const verificadosFisicos = Object.values(docsFisicosVerif).filter(v => v).length;
    
    const total = totalDigitales + totalFisicos;
    const verificados = verificadosDigitales + verificadosFisicos;
    
    return {
      porcentaje: Math.round((verificados / total) * 100),
      verificados,
      total
    };
  };

  const guardarVerificacion = async () => {
    if (!socioSeleccionado || !petaSeleccionado) return;
    
    try {
      setGuardando(true);
      
      const petaRef = doc(db, 'socios', socioSeleccionado.email, 'petas', petaSeleccionado.id);
      
      await updateDoc(petaRef, {
        verificacionDigitales: docsDigitalesVerif,
        verificacionFisicos: docsFisicosVerif,
        notasSecretario: notas,
        ultimaActualizacion: Timestamp.now(),
        ultimaVerificacion: Timestamp.now(),
        verificadoPor: userEmail
      });
      
      alert('✅ Verificación guardada exitosamente');
      
      // Recargar datos
      await cargarSocios();
      
    } catch (error) {
      console.error('Error guardando verificación:', error);
      alert('Error al guardar. Por favor intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const marcarComoCompleto = async () => {
    if (!socioSeleccionado || !petaSeleccionado) return;
    
    const progreso = calcularProgreso();
    if (progreso.porcentaje < 100) {
      if (!confirm(`El progreso es ${progreso.porcentaje}%. ¿Estás seguro de marcar como completo?`)) {
        return;
      }
    }
    
    try {
      setGuardando(true);
      
      const petaRef = doc(db, 'socios', socioSeleccionado.email, 'petas', petaSeleccionado.id);
      
      await updateDoc(petaRef, {
        estado: 'documentacion_completa',
        verificacionDigitales: docsDigitalesVerif,
        verificacionFisicos: docsFisicosVerif,
        notasSecretario: notas,
        historial: arrayUnion({
          estado: 'documentacion_completa',
          fecha: Timestamp.now(),
          usuario: userEmail,
          notas: notas || 'Documentación verificada y completa'
        }),
        ultimaActualizacion: Timestamp.now()
      });
      
      alert('✅ PETA marcado como Documentación Completa');
      
      // Limpiar selección
      setSocioSeleccionado(null);
      setPetaSeleccionado(null);
      
      // Recargar datos
      await cargarSocios();
      
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar. Por favor intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const rechazarSolicitud = async () => {
    if (!socioSeleccionado || !petaSeleccionado) return;
    
    const motivo = prompt('Ingresa el motivo del rechazo:');
    if (!motivo) return;
    
    try {
      setGuardando(true);
      
      const petaRef = doc(db, 'socios', socioSeleccionado.email, 'petas', petaSeleccionado.id);
      
      await updateDoc(petaRef, {
        estado: 'rechazado',
        motivoRechazo: motivo,
        historial: arrayUnion({
          estado: 'rechazado',
          fecha: Timestamp.now(),
          usuario: userEmail,
          notas: `Rechazado: ${motivo}`
        }),
        ultimaActualizacion: Timestamp.now()
      });
      
      alert('❌ Solicitud rechazada');
      
      // Limpiar selección
      setSocioSeleccionado(null);
      setPetaSeleccionado(null);
      
      // Recargar datos
      await cargarSocios();
      
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      alert('Error al rechazar. Por favor intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando solicitudes PETA...</div>;
  }

  const sociosFiltrados = socios.filter(s => 
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Documentos físicos dinámicos según tipo de PETA
  let documentosFisicos = [...DOCUMENTOS_FISICOS_BASE];
  if (petaSeleccionado?.tipo === 'caza') {
    documentosFisicos.push({ id: 'licencia-caza', nombre: 'Licencia SEMARNAT (copia)' });
  }
  if (petaSeleccionado?.esRenovacion) {
    documentosFisicos.push({ id: 'peta-anterior', nombre: 'PETA anterior (original)' });
  }

  return (
    <div className="verificador-peta-container">
      <div className="verificador-header">
        <h2>✅ Verificador de PETAs</h2>
        <p className="subtitle">Panel de verificación de documentación</p>
      </div>

      <div className="verificador-layout">
        {/* Lista de socios con PETAs */}
        <div className="socios-panel">
          <div className="panel-header">
            <h3>Solicitudes PETA</h3>
            <input
              type="text"
              placeholder="Buscar socio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="socios-list">
            {sociosFiltrados.length === 0 ? (
              <div className="empty-message">No hay solicitudes PETA pendientes</div>
            ) : (
              sociosFiltrados.map(socio => (
                <div key={socio.email} className="socio-item">
                  <div className="socio-info">
                    <div className="socio-nombre">{socio.nombre}</div>
                    <div className="socio-email">{socio.email}</div>
                  </div>
                  <div className="petas-badges">
                    {socio.petas.map(peta => (
                      <button
                        key={peta.id}
                        className={`peta-badge estado-${peta.estado} ${
                          petaSeleccionado?.id === peta.id ? 'active' : ''
                        }`}
                        onClick={() => seleccionarPETA(socio, peta)}
                      >
                        {peta.tipo === 'tiro' && '🎯'}
                        {peta.tipo === 'competencia' && '🏆'}
                        {peta.tipo === 'caza' && '🦌'}
                        {' '}
                        {peta.tipo.charAt(0).toUpperCase() + peta.tipo.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de verificación */}
        <div className="verificacion-panel">
          {!petaSeleccionado ? (
            <div className="empty-selection">
              <div className="empty-icon">📋</div>
              <p>Selecciona una solicitud PETA para verificar</p>
            </div>
          ) : (
            <>
              <div className="verificacion-header">
                <div>
                  <h3>{socioSeleccionado.nombre}</h3>
                  <p className="socio-email">{socioSeleccionado.email}</p>
                  <p className="peta-tipo">
                    PETA {petaSeleccionado.tipo.toUpperCase()} - {petaSeleccionado.vigenciaInicio?.toDate().getFullYear()}
                  </p>
                </div>
                
                {(() => {
                  const progreso = calcularProgreso();
                  return (
                    <div className="progreso-box">
                      <div className="progreso-numero">{progreso.porcentaje}%</div>
                      <div className="progreso-texto">{progreso.verificados}/{progreso.total} docs</div>
                    </div>
                  );
                })()}
              </div>

              <div className="verificacion-content">
                {/* Documentos digitales */}
                <div className="docs-section">
                  <h4>📋 Documentos Digitales (ya subidos)</h4>
                  <div className="docs-checklist">
                    {DOCUMENTOS_DIGITALES.map(docItem => {
                      // Buscar en documentosPETA de Firestore o en preloadedDocs de Storage
                      const docData = socioSeleccionado.documentosPETA[docItem.id] || preloadedDocs[docItem.id];
                      const isPrecargado = !socioSeleccionado.documentosPETA[docItem.id] && preloadedDocs[docItem.id];
                      return (
                        <label key={docItem.id} className="doc-check-item">
                          <input
                            type="checkbox"
                            checked={docsDigitalesVerif[docItem.id] || false}
                            onChange={() => toggleDocDigital(docItem.id)}
                          />
                          <span className="doc-nombre">{docItem.nombre}</span>
                          {docData?.url && (
                            <a href={docData.url} target="_blank" rel="noopener noreferrer" className="btn-ver-doc">
                              {isPrecargado ? '📁 Ver (precargado)' : 'Ver PDF'}
                            </a>
                          )}
                          {!docData?.url && <span className="doc-faltante">❌ No subido</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Documentos físicos */}
                <div className="docs-section">
                  <h4>📦 Documentos Físicos (verificar presencial)</h4>
                  <div className="docs-checklist">
                    {documentosFisicos.map(doc => (
                      <label key={doc.id} className="doc-check-item">
                        <input
                          type="checkbox"
                          checked={docsFisicosVerif[doc.id] || false}
                          onChange={() => toggleDocFisico(doc.id)}
                        />
                        <span className="doc-nombre">{doc.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Armas */}
                <div className="docs-section">
                  <h4>🔫 Armas incluidas ({petaSeleccionado.armasIncluidas?.length || 0})</h4>
                  <div className="armas-verificacion-list">
                    {petaSeleccionado.armasIncluidas?.map((arma, idx) => (
                      <div key={idx} className="arma-verif-item">
                        {idx + 1}. {arma.clase} {arma.marca} {arma.calibre} - Mat: {arma.matricula}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div className="docs-section">
                  <h4>📝 Notas del Secretario</h4>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Agrega observaciones, pendientes o notas importantes..."
                    rows="4"
                    className="notas-textarea"
                  />
                </div>

                {/* Acciones */}
                <div className="verificacion-actions">
                  <button 
                    className="btn-guardar"
                    onClick={guardarVerificacion}
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : '💾 Guardar Progreso'}
                  </button>
                  
                  <button 
                    className="btn-completar"
                    onClick={marcarComoCompleto}
                    disabled={guardando || petaSeleccionado.estado === 'documentacion_completa'}
                  >
                    ✅ Marcar como COMPLETO
                  </button>
                  
                  <button 
                    className="btn-rechazar"
                    onClick={rechazarSolicitud}
                    disabled={guardando}
                  >
                    ❌ Rechazar Solicitud
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

/**
 * ExpedienteImpresor - Verificador e Impresor de Expediente Digital
 * 
 * Permite al secretario:
 * - Buscar un socio por nombre o email
 * - Ver estado de todos sus documentos digitales
 * - Abrir documentos individuales para impresión
 * - Abrir todos los documentos listos en pestañas para imprimir en lote
 */
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './ExpedienteImpresor.css';

// Mapeo de documentos precargados (subidos via scripts a Storage)
const PRELOADED_DOCS_MAP = {
  'curp': ['curp.pdf'],
  'constanciaAntecedentes': ['constancia_antecedentes.pdf', 'constancia.pdf', 'antecedentes.pdf']
};

// Documentos que se buscan por prefijo (tienen timestamp en el nombre)
const PREFIX_DOCS = ['fotoCredencial'];

// Documentos requeridos para PETA (en orden de impresión)
const DOCUMENTOS_EXPEDIENTE = [
  { id: 'ine', nombre: 'INE (ambas caras)', copias: '2 copias ampliadas 200%', requerido: true },
  { id: 'curp', nombre: 'CURP', copias: '2 copias', requerido: true },
  { id: 'cartillaMilitar', nombre: 'Cartilla Militar / Acta Nacimiento', copias: '2 copias', requerido: true },
  { id: 'constanciaAntecedentes', nombre: 'Constancia Antecedentes Penales', copias: '1 copia (original se entrega)', requerido: true },
  { id: 'comprobanteDomicilio', nombre: 'Comprobante de Domicilio', copias: '2 copias', requerido: true },
  { id: 'certificadoMedico', nombre: 'Certificado Médico', copias: '1 copia (original se entrega)', requerido: true },
  { id: 'certificadoPsicologico', nombre: 'Certificado Psicológico', copias: '1 copia (original se entrega)', requerido: true },
  { id: 'certificadoToxicologico', nombre: 'Certificado Toxicológico', copias: '1 copia (original se entrega)', requerido: true },
  { id: 'cartaModoHonesto', nombre: 'Modo Honesto de Vivir', copias: '1 copia (original se entrega)', requerido: true },
  { id: 'licenciaCaza', nombre: 'Licencia SEMARNAT (caza)', copias: '2 copias', requerido: false },
  { id: 'fotoCredencial', nombre: 'Foto Infantil Digital', copias: 'Para credencial del club', requerido: false },
];

export default function ExpedienteImpresor({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [documentosEncontrados, setDocumentosEncontrados] = useState({});
  const [armasConRegistro, setArmasConRegistro] = useState([]);

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const sociosRef = collection(db, 'socios');
      const sociosSnap = await getDocs(sociosRef);
      
      const sociosList = sociosSnap.docs.map(docSnap => ({
        email: docSnap.id,
        nombre: docSnap.data().nombre || docSnap.id,
        documentosPETA: docSnap.data().documentosPETA || {},
        totalArmas: docSnap.data().totalArmas || 0
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

  // Buscar documentos en Storage (precargados por scripts)
  const buscarDocumentosStorage = async (email) => {
    const found = {};
    const basePath = `documentos/${email}`;
    
    // Buscar documentos con nombres exactos
    for (const [docId, fileNames] of Object.entries(PRELOADED_DOCS_MAP)) {
      for (const fileName of fileNames) {
        try {
          const fileRef = ref(storage, `${basePath}/${fileName}`);
          const url = await getDownloadURL(fileRef);
          found[docId] = { url, fileName, source: 'storage' };
          break; // Encontrado, no buscar más variantes
        } catch (e) {
          // Archivo no existe, continuar
        }
      }
    }
    
    // Buscar documentos por prefijo (ej: fotoCredencial_timestamp.jpg)
    for (const prefix of PREFIX_DOCS) {
      try {
        const folderRef = ref(storage, basePath);
        const listResult = await listAll(folderRef);
        
        for (const item of listResult.items) {
          if (item.name.startsWith(prefix)) {
            const url = await getDownloadURL(item);
            found[prefix] = { url, fileName: item.name, source: 'storage' };
            break;
          }
        }
      } catch (error) {
        console.log(`⚠️ Error listando carpeta: ${error.message}`);
      }
    }
    
    return found;
  };

  // Buscar registros de armas en Storage
  const buscarRegistrosArmas = async (email) => {
    const armas = [];
    const basePath = `documentos/${email}/armas`;
    
    try {
      const armasFolderRef = ref(storage, basePath);
      const listResult = await listAll(armasFolderRef);
      
      // Cada subcarpeta es un arma
      for (const prefix of listResult.prefixes) {
        const armaId = prefix.name;
        const armaFiles = await listAll(prefix);
        
        for (const file of armaFiles.items) {
          if (file.name.includes('registro') || file.name.endsWith('.pdf')) {
            const url = await getDownloadURL(file);
            armas.push({
              armaId,
              fileName: file.name,
              url
            });
            break;
          }
        }
      }
    } catch (error) {
      console.log('No se encontró carpeta de armas:', error.message);
    }
    
    // También buscar en Firestore subcollection
    try {
      const armasRef = collection(db, 'socios', email, 'armas');
      const armasSnap = await getDocs(armasRef);
      
      for (const armaDoc of armasSnap.docs) {
        const armaData = armaDoc.data();
        if (armaData.documentoRegistro) {
          // Verificar si ya lo tenemos
          const yaExiste = armas.some(a => a.armaId === armaDoc.id);
          if (!yaExiste) {
            armas.push({
              armaId: armaDoc.id,
              fileName: 'registro.pdf',
              url: armaData.documentoRegistro,
              clase: armaData.clase,
              calibre: armaData.calibre,
              marca: armaData.marca,
              matricula: armaData.matricula
            });
          } else {
            // Agregar datos del arma al registro existente
            const idx = armas.findIndex(a => a.armaId === armaDoc.id);
            if (idx >= 0) {
              armas[idx] = {
                ...armas[idx],
                clase: armaData.clase,
                calibre: armaData.calibre,
                marca: armaData.marca,
                matricula: armaData.matricula
              };
            }
          }
        }
      }
    } catch (error) {
      console.log('Error buscando armas en Firestore:', error.message);
    }
    
    return armas;
  };

  const seleccionarSocio = async (socio) => {
    setBuscando(true);
    setSocioSeleccionado(socio);
    
    try {
      // Combinar documentos de Firestore + Storage
      const docsFirestore = socio.documentosPETA || {};
      const docsStorage = await buscarDocumentosStorage(socio.email);
      
      // Crear mapa completo de documentos
      const todosLosDocs = {};
      
      for (const docDef of DOCUMENTOS_EXPEDIENTE) {
        const fromFirestore = docsFirestore[docDef.id];
        const fromStorage = docsStorage[docDef.id];
        
        if (fromFirestore?.url) {
          todosLosDocs[docDef.id] = { ...fromFirestore, source: 'firestore' };
        } else if (fromStorage?.url) {
          todosLosDocs[docDef.id] = fromStorage;
        }
      }
      
      setDocumentosEncontrados(todosLosDocs);
      
      // Buscar registros de armas
      const armas = await buscarRegistrosArmas(socio.email);
      setArmasConRegistro(armas);
      
    } catch (error) {
      console.error('Error buscando documentos:', error);
    } finally {
      setBuscando(false);
    }
  };

  const abrirDocumento = (url) => {
    window.open(url, '_blank');
  };

  const abrirTodosListos = () => {
    // Abrir todos los documentos encontrados
    const docsParaAbrir = [];
    
    for (const docDef of DOCUMENTOS_EXPEDIENTE) {
      const doc = documentosEncontrados[docDef.id];
      if (doc?.url) {
        docsParaAbrir.push(doc.url);
      }
    }
    
    // Agregar registros de armas
    for (const arma of armasConRegistro) {
      if (arma.url) {
        docsParaAbrir.push(arma.url);
      }
    }
    
    if (docsParaAbrir.length === 0) {
      alert('No hay documentos listos para imprimir');
      return;
    }
    
    // Advertencia antes de abrir muchas pestañas
    if (docsParaAbrir.length > 3) {
      const confirmar = window.confirm(
        `Se abrirán ${docsParaAbrir.length} pestañas con los documentos.\n\n` +
        `Asegúrate de que tu navegador permita ventanas emergentes.\n\n` +
        `¿Continuar?`
      );
      if (!confirmar) return;
    }
    
    // Abrir cada documento en nueva pestaña
    docsParaAbrir.forEach((url, index) => {
      setTimeout(() => {
        window.open(url, '_blank');
      }, index * 300); // Pequeño delay para evitar bloqueo de popups
    });
  };

  const contarDocumentos = () => {
    const total = DOCUMENTOS_EXPEDIENTE.filter(d => d.requerido).length;
    const encontrados = DOCUMENTOS_EXPEDIENTE.filter(d => 
      d.requerido && documentosEncontrados[d.id]?.url
    ).length;
    return { total, encontrados };
  };

  // Filtrar socios por búsqueda
  const sociosFiltrados = socios.filter(s => 
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="expediente-impresor">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando socios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expediente-impresor">
      <div className="expediente-content">
        {/* Panel izquierdo: Búsqueda de socio */}
        <div className="panel-busqueda">
          <div className="busqueda-container">
            <input
              type="text"
              placeholder="🔍 Buscar socio por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>
          
          <div className="lista-socios">
            {sociosFiltrados.slice(0, 20).map(socio => (
              <div
                key={socio.email}
                className={`socio-item ${socioSeleccionado?.email === socio.email ? 'seleccionado' : ''}`}
                onClick={() => seleccionarSocio(socio)}
              >
                <span className="socio-nombre">{socio.nombre}</span>
                <span className="socio-armas">{socio.totalArmas} armas</span>
              </div>
            ))}
            {sociosFiltrados.length > 20 && (
              <p className="mas-resultados">
                Mostrando 20 de {sociosFiltrados.length} resultados...
              </p>
            )}
          </div>
        </div>

        {/* Panel derecho: Documentos del socio */}
        <div className="panel-documentos">
          {!socioSeleccionado ? (
            <div className="sin-seleccion">
              <p>👈 Selecciona un socio para ver su expediente digital</p>
            </div>
          ) : buscando ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Buscando documentos de {socioSeleccionado.nombre}...</p>
            </div>
          ) : (
            <>
              <div className="socio-info">
                <h3>{socioSeleccionado.nombre}</h3>
                <p className="socio-email">{socioSeleccionado.email}</p>
                
                <div className="resumen-docs">
                  {(() => {
                    const { total, encontrados } = contarDocumentos();
                    const porcentaje = Math.round((encontrados / total) * 100);
                    return (
                      <>
                        <div className={`badge-progreso ${porcentaje === 100 ? 'completo' : porcentaje >= 50 ? 'parcial' : 'incompleto'}`}>
                          {encontrados}/{total} documentos requeridos
                        </div>
                        {armasConRegistro.length > 0 && (
                          <div className="badge-armas">
                            + {armasConRegistro.length} registros de armas
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                <button 
                  onClick={abrirTodosListos}
                  className="btn-imprimir-todos"
                  disabled={Object.keys(documentosEncontrados).length === 0 && armasConRegistro.length === 0}
                >
                  🖨️ Abrir todos para imprimir
                </button>
              </div>

              {/* Lista de documentos */}
              <div className="documentos-lista">
                <h4>📋 Documentos del Expediente</h4>
                
                {DOCUMENTOS_EXPEDIENTE.map(docDef => {
                  const docEncontrado = documentosEncontrados[docDef.id];
                  const tieneDoc = !!docEncontrado?.url;
                  
                  return (
                    <div 
                      key={docDef.id} 
                      className={`documento-row ${tieneDoc ? 'encontrado' : 'faltante'} ${!docDef.requerido ? 'opcional' : ''}`}
                    >
                      <div className="doc-status">
                        {tieneDoc ? '✅' : (docDef.requerido ? '❌' : '➖')}
                      </div>
                      <div className="doc-info">
                        <span className="doc-nombre">{docDef.nombre}</span>
                        <span className="doc-copias">{docDef.copias}</span>
                        {!docDef.requerido && <span className="doc-opcional">(opcional)</span>}
                      </div>
                      <div className="doc-acciones">
                        {tieneDoc ? (
                          <button 
                            onClick={() => abrirDocumento(docEncontrado.url)}
                            className="btn-ver"
                          >
                            📄 Ver / Imprimir
                          </button>
                        ) : (
                          <span className="estado-faltante">
                            {docDef.requerido ? 'No subido' : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Registros de armas */}
              {armasConRegistro.length > 0 && (
                <div className="documentos-lista armas-lista">
                  <h4>🔫 Registros de Armas (RFA)</h4>
                  
                  {armasConRegistro.map((arma, idx) => (
                    <div key={arma.armaId || idx} className="documento-row encontrado">
                      <div className="doc-status">✅</div>
                      <div className="doc-info">
                        <span className="doc-nombre">
                          {arma.clase ? `${arma.clase} ${arma.calibre}` : `Arma ${idx + 1}`}
                        </span>
                        <span className="doc-copias">
                          {arma.marca && `${arma.marca} `}
                          {arma.matricula && `Mat: ${arma.matricula}`}
                        </span>
                      </div>
                      <div className="doc-acciones">
                        <button 
                          onClick={() => abrirDocumento(arma.url)}
                          className="btn-ver"
                        >
                          📄 Ver / Imprimir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notas de impresión */}
              <div className="notas-impresion">
                <h4>📝 Notas para impresión PETA</h4>
                <ul>
                  <li><strong>INE:</strong> Ampliar al 200%, ambas caras</li>
                  <li><strong>CURP:</strong> Tamaño normal</li>
                  <li><strong>Registros RFA:</strong> 2 copias por arma (máx 10 armas por PETA)</li>
                  <li><strong>Certificados:</strong> El original se entrega, la copia se archiva</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

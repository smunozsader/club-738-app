import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import './MisDocumentosOficiales.css';

export default function MisDocumentosOficiales({ user, socioData }) {
  const [documentos, setDocumentos] = useState({
    curp: { url: null, loading: true, exists: false },
    constancia: { url: null, loading: true, exists: false }
  });
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerTitle, setViewerTitle] = useState('');

  useEffect(() => {
    if (!user?.email) return;

    const cargarDocumentos = async () => {
      const email = user.email.toLowerCase();
      
      // Cargar CURP
      try {
        const curpRef = ref(storage, `documentos/${email}/curp.pdf`);
        const curpUrl = await getDownloadURL(curpRef);
        setDocumentos(prev => ({
          ...prev,
          curp: { url: curpUrl, loading: false, exists: true }
        }));
      } catch (error) {
        setDocumentos(prev => ({
          ...prev,
          curp: { url: null, loading: false, exists: false }
        }));
      }

      // Cargar Constancia - probar diferentes nombres
      const constanciaNames = ['constancia_antecedentes.pdf', 'constancia.pdf', 'antecedentes.pdf'];
      let constanciaFound = false;
      
      for (const fileName of constanciaNames) {
        try {
          const constanciaRef = ref(storage, `documentos/${email}/${fileName}`);
          const constanciaUrl = await getDownloadURL(constanciaRef);
          setDocumentos(prev => ({
            ...prev,
            constancia: { url: constanciaUrl, loading: false, exists: true }
          }));
          constanciaFound = true;
          break;
        } catch (error) {
          // Continuar con el siguiente nombre
        }
      }
      
      if (!constanciaFound) {
        setDocumentos(prev => ({
          ...prev,
          constancia: { url: null, loading: false, exists: false }
        }));
      }
    };

    cargarDocumentos();
  }, [user]);

  const openViewer = (url, title) => {
    setViewerUrl(url);
    setViewerTitle(title);
  };

  const closeViewer = () => {
    setViewerUrl(null);
    setViewerTitle('');
  };

  const DocumentoCard = ({ tipo, titulo, descripcion, icono, doc }) => (
    <div className={`doc-oficial-card ${doc.exists ? 'disponible' : 'no-disponible'}`}>
      <div className="doc-oficial-icon">{icono}</div>
      <div className="doc-oficial-info">
        <h4>{titulo}</h4>
        <p>{descripcion}</p>
      </div>
      <div className="doc-oficial-actions">
        {doc.loading ? (
          <span className="doc-loading">Cargando...</span>
        ) : doc.exists ? (
          <div className="action-buttons">
            <button 
              className="btn-ver"
              onClick={() => openViewer(doc.url, titulo)}
            >
              👁️ Ver
            </button>
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-descargar"
            >
              📥 Descargar
            </a>
          </div>
        ) : (
          <span className="doc-no-disponible">No disponible</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="mis-documentos-oficiales">
      {/* Visor de PDF */}
      {viewerUrl && (
        <div className="pdf-viewer-overlay" onClick={closeViewer}>
          <div className="pdf-viewer-container" onClick={e => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h4>{viewerTitle}</h4>
              <button className="btn-close-viewer" onClick={closeViewer}>✕</button>
            </div>
            <div className="pdf-viewer-content">
              <iframe 
                src={`${viewerUrl}#toolbar=1&navpanes=0`}
                title={viewerTitle}
                className="pdf-iframe"
              />
            </div>
            <div className="pdf-viewer-footer">
              <a 
                href={viewerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-abrir-nueva"
              >
                🔗 Abrir en nueva pestaña
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="docs-oficiales-header">
        <h3>📋 Mis Documentos Oficiales</h3>
        <p>Documentos proporcionados por el Club. Descárgalos cuando los necesites.</p>
      </div>

      <div className="docs-oficiales-grid">
        <DocumentoCard
          tipo="curp"
          titulo="CURP Oficial"
          descripcion="Clave Única de Registro de Población verificada"
          icono="🆔"
          doc={documentos.curp}
        />
        <DocumentoCard
          tipo="constancia"
          titulo="Constancia de No Antecedentes"
          descripcion="Constancia de antecedentes penales federales"
          icono="📜"
          doc={documentos.constancia}
        />
      </div>

      {socioData?.curp && (
        <div className="datos-personales">
          <h4>🔐 Tu CURP</h4>
          <code className="curp-display">{socioData.curp}</code>
        </div>
      )}
    </div>
  );
}

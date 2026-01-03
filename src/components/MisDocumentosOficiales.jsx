import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import './MisDocumentosOficiales.css';

export default function MisDocumentosOficiales({ user, socioData }) {
  const [documentos, setDocumentos] = useState({
    curp: { url: null, loading: true, exists: false },
    constancia: { url: null, loading: true, exists: false }
  });

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

      // Cargar Constancia
      try {
        const constanciaRef = ref(storage, `documentos/${email}/constancia.pdf`);
        const constanciaUrl = await getDownloadURL(constanciaRef);
        setDocumentos(prev => ({
          ...prev,
          constancia: { url: constanciaUrl, loading: false, exists: true }
        }));
      } catch (error) {
        setDocumentos(prev => ({
          ...prev,
          constancia: { url: null, loading: false, exists: false }
        }));
      }
    };

    cargarDocumentos();
  }, [user]);

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
          <a 
            href={doc.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-descargar"
          >
            📥 Descargar
          </a>
        ) : (
          <span className="doc-no-disponible">No disponible</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="mis-documentos-oficiales">
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

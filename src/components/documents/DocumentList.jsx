import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
import DocumentCard from './DocumentCard';
import ProgressBar from './ProgressBar';
import { ListSkeleton } from '../common/LoadingSkeleton';
import './DocumentList.css';

// Mapeo de documentos precargados (Storage) a IDs de documentos PETA
const PRELOADED_DOCS_MAP = {
  'curp': ['curp.pdf'],
  'constanciaAntecedentes': ['constancia_antecedentes.pdf', 'constancia.pdf', 'antecedentes.pdf']
};

// Lista completa de los 15 documentos PETA (agregado CURP)
// Referencia: Base datos/Requisitos PETA (1).docx
const DOCUMENTOS_PETA = [
  // === IDENTIFICACIÓN ===
  {
    id: 'curp',
    label: 'CURP',
    description: 'Clave Única de Registro de Población. Copia legible.',
    icon: '🆔',
    required: true,
    category: 'identificacion'
  },
  {
    id: 'ine',
    label: 'INE (Identificación Oficial)',
    description: 'Copia ampliada 200%, ambas caras en una página tamaño carta.',
    icon: '🪪',
    required: true,
    category: 'identificacion'
  },
  {
    id: 'cartillaMilitar',
    label: 'Cartilla Militar / Acta de Nacimiento',
    description: 'Cartilla liberada (hombres) o Acta de nacimiento (mujeres). Se presenta copia.',
    icon: '📜',
    required: true,
    category: 'identificacion'
  },
  {
    id: 'comprobanteDomicilio',
    label: 'Comprobante de Domicilio',
    description: 'CFE, Telmex, agua o predial. Original reciente (no mayor a 3 meses).',
    icon: '🏠',
    required: true,
    category: 'identificacion'
  },
  
  // === CERTIFICADOS MÉDICOS (Opcionales - originales se entregan físicamente) ===
  {
    id: 'certificadoMedico',
    label: 'Certificado Médico',
    description: 'Opcional. El original se entrega físicamente en 32 ZM.',
    icon: '🩺',
    required: false,
    category: 'medico'
  },
  {
    id: 'certificadoPsicologico',
    label: 'Certificado Psicológico',
    description: 'Opcional. El original se entrega físicamente en 32 ZM.',
    icon: '🧠',
    required: false,
    category: 'medico'
  },
  {
    id: 'certificadoToxicologico',
    label: 'Certificado Toxicológico',
    description: 'Opcional. El original se entrega físicamente en 32 ZM.',
    icon: '🧪',
    required: false,
    category: 'medico'
  },
  
  // === DOCUMENTOS LEGALES ===
  {
    id: 'constanciaAntecedentes',
    label: 'Constancia de Antecedentes Penales',
    description: 'Constancia federal de https://constancias.oadprs.gob.mx/. Original requerido.',
    icon: '📋',
    required: true,
    category: 'legal'
  },
  {
    id: 'cartaModoHonesto',
    label: 'Carta Modo Honesto de Vivir',
    description: 'Formato oficial del club. Original firmado se entrega en 32 ZM.',
    icon: '✍️',
    required: true,
    category: 'legal'
  },
  
  // === ARMAS Y PERMISOS ===
  {
    id: 'registrosArmas',
    label: 'Registros de Armas (RFA)',
    description: 'Fotocopias legibles de hojas de registro SEDENA. Máximo 10 armas por PETA.',
    icon: '�',
    required: true,
    category: 'armas'
  },
  {
    id: 'licenciaCaza',
    label: 'Licencia de Caza SEMARNAT',
    description: 'Solo modalidad cacería. Verificar vigencia antes de subir.',
    icon: '📄',
    required: false,
    category: 'armas'
  },
  {
    id: 'permisoAnterior',
    label: 'Permiso Anterior (Renovaciones)',
    description: 'Solo si es renovación. El original se entrega en 32 ZM.',
    icon: '📑',
    required: false,
    category: 'armas'
  },
  
  // === FOTOGRAFÍA PARA CREDENCIAL ===
  {
    id: 'fotoCredencial',
    label: 'Foto para Credencial del Club',
    description: 'Foto infantil fondo blanco. Se usa para generar tu credencial oficial.',
    icon: '📸',
    required: true,
    category: 'fotos'
  }
];

// Agrupación por categoría para mostrar
const CATEGORIAS = {
  identificacion: { label: '🆔 Identificación', order: 1 },
  medico: { label: '🏥 Certificados Médicos (Opcionales)', order: 2 },
  legal: { label: '⚖️ Documentos Legales', order: 3 },
  armas: { label: '📋 Armas y Permisos', order: 4 },
  fotos: { label: '📸 Foto para Credencial', order: 5 }
};

export default function DocumentList({ userId, documentosData = {}, onUploadComplete }) {
  const [preloadedDocs, setPreloadedDocs] = useState({});
  const [loadingPreloaded, setLoadingPreloaded] = useState(true);

  // Verificar documentos precargados en Storage
  useEffect(() => {
    const checkPreloadedDocs = async () => {
      if (!userId) return;
      
      const found = {};
      
      for (const [docId, fileNames] of Object.entries(PRELOADED_DOCS_MAP)) {
        for (const fileName of fileNames) {
          try {
            const docRef = ref(storage, `documentos/${userId}/${fileName}`);
            const url = await getDownloadURL(docRef);
            found[docId] = { url, fileName };
            console.log(`✅ Documento precargado encontrado: ${docId} -> ${fileName}`);
            break; // Encontrado, no buscar más nombres
          } catch (error) {
            // No encontrado con este nombre, continuar
          }
        }
      }
      
      setPreloadedDocs(found);
      setLoadingPreloaded(false);
    };

    checkPreloadedDocs();
  }, [userId]);

  // Combinar documentosData con precargados
  const mergedDocData = { ...documentosData };
  for (const [docId, preloaded] of Object.entries(preloadedDocs)) {
    if (!mergedDocData[docId]?.url && preloaded.url) {
      mergedDocData[docId] = {
        url: preloaded.url,
        estado: 'precargado',
        isPreloaded: true
      };
    }
  }
  
  // Calcular progreso (usando datos combinados)
  const requiredDocs = DOCUMENTOS_PETA.filter(d => d.required);
  const completedDocs = requiredDocs.filter(d => mergedDocData[d.id]?.url).length;
  const progressPercent = Math.round((completedDocs / requiredDocs.length) * 100);

  // Agrupar documentos por categoría
  const groupedDocs = DOCUMENTOS_PETA.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  // Ordenar categorías
  const sortedCategories = Object.keys(groupedDocs).sort(
    (a, b) => CATEGORIAS[a].order - CATEGORIAS[b].order
  );

  return (
    <div className="document-list">
      <div className="document-list-header">
        <h3>� Mi Expediente Digital</h3>
        <p>Documentación para tu renovación de membresía y trámite PETA</p>
      </div>

      <ProgressBar 
        percent={progressPercent} 
        completed={completedDocs} 
        total={requiredDocs.length} 
      />

      <div className="documents-info-box bienvenida">
        <h4>👋 ¡Bienvenido!</h4>
        <p>Para la <strong>renovación de tu membresía</strong> en el Club y el trámite de tu <strong>PETA</strong>, por favor:</p>
        <ol>
          <li><strong>Sube tu documentación</strong> en formato digital (escaneos o fotos legibles)</li>
          <li><strong>Prepara los originales</strong> que se entregarán físicamente</li>
          <li><strong>Agenda una cita</strong> para entregar documentos y realizar el pago</li>
        </ol>
      </div>

      <div className="documents-info-box entrega">
        <h4>📍 Entrega de Documentos Físicos</h4>
        <p>Los documentos originales y el pago de inscripción + FEMETI se entregan <strong>previa cita</strong> en:</p>
        <div className="direccion-entrega">
          <p><strong>MVZ Sergio Muñoz de Alba Medrano</strong></p>
          <p className="cargo-secretario">Secretario del Club</p>
          <p>Calle 26 #246-B x 15 y 15A</p>
          <p>Col. Vista Alegre, 97130</p>
          <p>Mérida, Yucatán</p>
          <a href="https://goo.gl/maps/T2gFh3NUeuTKzBKV7" target="_blank" rel="noopener noreferrer" className="maps-link">
            📍 Ver en Google Maps
          </a>
        </div>
        <p className="cita-contacto">
          <strong>Agendar cita:</strong> <a href="https://wa.me/525665824667" target="_blank" rel="noopener noreferrer">WhatsApp +52 56 6582 4667</a>
        </p>
      </div>

      {sortedCategories.map(category => (
        <div key={category} className="document-category">
          <h4 className="category-title">{CATEGORIAS[category].label}</h4>
          <div className="documents-grid">
            {groupedDocs[category].map((doc) => (
              <DocumentCard
                key={doc.id}
                userId={userId}
                documentType={doc.id}
                label={doc.label}
                description={doc.description}
                icon={doc.icon}
                required={doc.required}
                documentData={mergedDocData[doc.id]}
                isPreloaded={mergedDocData[doc.id]?.isPreloaded}
                onUploadComplete={onUploadComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

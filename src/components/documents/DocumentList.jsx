import React from 'react';
import DocumentCard from './DocumentCard';
import ProgressBar from './ProgressBar';
import './DocumentList.css';

// Lista completa de los 14 documentos PETA
// Referencia: Base datos/Requisitos PETA (1).docx
const DOCUMENTOS_PETA = [
  // === IDENTIFICACIÓN ===
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
  
  // === CERTIFICADOS MÉDICOS ===
  {
    id: 'certificadoMedico',
    label: 'Certificado Médico',
    description: 'Certificado de no impedimento físico para portar armas. Original requerido.',
    icon: '🩺',
    required: true,
    category: 'medico'
  },
  {
    id: 'certificadoPsicologico',
    label: 'Certificado Psicológico',
    description: 'Certificado de aptitud mental. Original requerido.',
    icon: '🧠',
    required: true,
    category: 'medico'
  },
  {
    id: 'certificadoToxicologico',
    label: 'Certificado Toxicológico',
    description: 'Prueba de drogas negativa. Original requerido.',
    icon: '🧪',
    required: true,
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
    icon: '🔫',
    required: true,
    category: 'armas'
  },
  {
    id: 'licenciaCaza',
    label: 'Licencia de Caza SEMARNAT',
    description: 'Solo modalidad cacería. Verificar vigencia antes de subir.',
    icon: '🦌',
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
  
  // === FOTOGRAFÍAS ===
  {
    id: 'fotoCredencial',
    label: 'Foto para Credencial del Club',
    description: 'Fotografía tamaño infantil para tu credencial de socio.',
    icon: '📸',
    required: true,
    category: 'fotos'
  },
  {
    id: 'fotoPETA',
    label: 'Foto para PETA',
    description: 'Fotografía a color, fondo blanco, tamaño infantil. También entregar física en 32 ZM.',
    icon: '🖼️',
    required: true,
    category: 'fotos'
  },
  
  // === PAGO ===
  {
    id: 'reciboe5cinco',
    label: 'Recibo de Pago e5cinco',
    description: 'Comprobante del pago de derechos SEDENA. Original se presenta en 32 ZM.',
    icon: '💳',
    required: true,
    category: 'pago'
  }
];

// Agrupación por categoría para mostrar
const CATEGORIAS = {
  identificacion: { label: '🆔 Identificación', order: 1 },
  medico: { label: '🏥 Certificados Médicos', order: 2 },
  legal: { label: '⚖️ Documentos Legales', order: 3 },
  armas: { label: '🔫 Armas y Permisos', order: 4 },
  fotos: { label: '📷 Fotografías', order: 5 },
  pago: { label: '💰 Pago', order: 6 }
};

export default function DocumentList({ userId, documentosData = {}, onUploadComplete }) {
  
  // Calcular progreso
  const requiredDocs = DOCUMENTOS_PETA.filter(d => d.required);
  const completedDocs = requiredDocs.filter(d => documentosData[d.id]?.url).length;
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
        <h3>📄 Mis Documentos PETA</h3>
        <p>Sube los documentos requeridos para tu Permiso Extraordinario de Transportación de Armas</p>
      </div>

      <ProgressBar 
        percent={progressPercent} 
        completed={completedDocs} 
        total={requiredDocs.length} 
      />

      <div className="documents-info-box">
        <h4>ℹ️ Información Importante</h4>
        <ul>
          <li>Los documentos marcados como <strong>"Original requerido"</strong> deben entregarse físicamente al secretario</li>
          <li>Sube aquí una copia escaneada para tener tu expediente digital completo</li>
          <li>Los originales se presentan en la <strong>32 Zona Militar (Valladolid)</strong></li>
        </ul>
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
                documentData={documentosData[doc.id]}
                onUploadComplete={onUploadComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

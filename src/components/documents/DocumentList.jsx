import React from 'react';
import DocumentCard from './DocumentCard';
import ProgressBar from './ProgressBar';
import './DocumentList.css';

// Lista de los 8 documentos que SÍ se suben al portal
const DOCUMENTOS_PETA = [
  {
    id: 'ine',
    label: 'INE (Identificación Oficial)',
    description: 'Credencial de elector vigente. El domicilio debe coincidir con el comprobante.',
    icon: '🪪',
    required: true
  },
  {
    id: 'comprobanteDomicilio',
    label: 'Comprobante de Domicilio',
    description: 'CFE, Telmex, agua o predial. Reciente (no mayor a 3 meses).',
    icon: '🏠',
    required: true
  },
  {
    id: 'cartillaMilitar',
    label: 'Cartilla Militar / Acta de Nacimiento',
    description: 'Cartilla liberada (hombres) o Acta de nacimiento (mujeres).',
    icon: '📜',
    required: true
  },
  {
    id: 'registrosArmas',
    label: 'Registros de Armas',
    description: 'Fotocopias legibles de las hojas de registro SEDENA (máx. 10 armas).',
    icon: '🔫',
    required: true
  },
  {
    id: 'fotoCredencial',
    label: 'Foto para Credencial del Club',
    description: 'Fotografía tamaño infantil para tu credencial de socio.',
    icon: '📸',
    required: true
  },
  {
    id: 'fotoPETA',
    label: 'Foto para PETA',
    description: 'Fotografía a color, fondo blanco, tamaño infantil para trámite SEDENA.',
    icon: '🖼️',
    required: true
  },
  {
    id: 'licenciaCaza',
    label: 'Licencia de Caza',
    description: 'Solo si solicitas permiso en modalidad cacería. Debe estar vigente.',
    icon: '🦌',
    required: false
  },
  {
    id: 'constanciaAntecedentes',
    label: 'Constancia de Antecedentes Penales',
    description: 'Constancia federal. El secretario puede tenerla si la tramitaste con el club.',
    icon: '📋',
    required: true
  }
];

export default function DocumentList({ userId, documentosData = {}, onUploadComplete }) {
  
  // Calcular progreso
  const requiredDocs = DOCUMENTOS_PETA.filter(d => d.required);
  const completedDocs = requiredDocs.filter(d => documentosData[d.id]?.url).length;
  const progressPercent = Math.round((completedDocs / requiredDocs.length) * 100);

  return (
    <div className="document-list">
      <div className="document-list-header">
        <h3>📄 Mis Documentos PETA</h3>
        <p>Sube los documentos requeridos para tu trámite de Permiso Extraordinario de Transportación de Armas</p>
      </div>

      <ProgressBar 
        percent={progressPercent} 
        completed={completedDocs} 
        total={requiredDocs.length} 
      />

      <div className="documents-info-box">
        <h4>ℹ️ Documentos que NO se suben aquí:</h4>
        <ul>
          <li><strong>Carta Modo Honesto de Vivir</strong> - Original firmado</li>
          <li><strong>Certificados Médicos</strong> - Físico, Psicológico y Toxicológico (originales)</li>
          <li><strong>Recibo bancario e5cinco</strong> - Original del pago</li>
          <li><strong>Permiso anterior</strong> - Original para renovación</li>
        </ul>
        <p>Estos documentos se entregan físicamente al secretario.</p>
      </div>

      <div className="documents-grid">
        {DOCUMENTOS_PETA.map((doc) => (
          <DocumentCard
            key={doc.id}
            userId={userId}
            documentType={doc.id}
            label={doc.label}
            description={doc.description}
            icon={doc.icon}
            documentData={documentosData[doc.id]}
            onUploadComplete={onUploadComplete}
          />
        ))}
      </div>
    </div>
  );
}

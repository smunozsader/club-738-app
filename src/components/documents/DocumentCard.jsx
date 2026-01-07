import React, { useState } from 'react';
import MultiImageUploader from './MultiImageUploader';
import ArmasRegistroUploader from './ArmasRegistroUploader';
import './DocumentCard.css';

// Documentos que permiten múltiples imágenes (frente/vuelta)
const MULTI_IMAGE_DOCS = ['ine', 'cartillaMilitar'];

// Documentos que se suben como imagen (JPG) no como PDF
const IMAGE_ONLY_DOCS = ['fotoCredencial'];

export default function DocumentCard({ 
  userId,
  documentType, 
  label, 
  description, 
  icon,
  documentData,
  isPreloaded,
  onUploadComplete 
}) {
  const [showUploader, setShowUploader] = useState(false);
  
  // Caso especial: Registros de Armas usa componente dedicado con OCR
  const isArmasRegistro = documentType === 'registrosArmas';
  
  // Determinar si este documento permite múltiples imágenes
  const allowMultiple = MULTI_IMAGE_DOCS.includes(documentType);
  
  // Determinar si este documento es solo imagen (no PDF)
  const imageOnly = IMAGE_ONLY_DOCS.includes(documentType);

  const getStatusInfo = () => {
    if (!documentData) {
      return { status: 'pendiente', label: 'Pendiente', color: '#ff9800' };
    }
    if (isPreloaded || documentData.estado === 'precargado') {
      return { status: 'precargado', label: 'Ya cargado ✓', color: '#8b5cf6' };
    }
    switch (documentData.estado) {
      case 'aprobado':
        return { status: 'aprobado', label: 'Aprobado', color: '#4caf50' };
      case 'rechazado':
        return { status: 'rechazado', label: 'Rechazado', color: '#f44336' };
      case 'pendiente_revision':
        return { status: 'revision', label: 'En revisión', color: '#2196f3' };
      default:
        return { status: 'pendiente', label: 'Pendiente', color: '#ff9800' };
    }
  };

  const statusInfo = getStatusInfo();
  const hasDocument = !!documentData?.url;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleUploadComplete = (type, url) => {
    setShowUploader(false);
    if (onUploadComplete) {
      onUploadComplete(type, url);
    }
  };

  // Caso especial: Registros de Armas usa componente dedicado con OCR
  if (isArmasRegistro) {
    return (
      <div className="document-card armas-registro">
        <div className="card-header">
          <span className="card-icon">{icon}</span>
          <div className="card-title-section">
            <h4>{label}</h4>
            <p className="card-description">{description}</p>
          </div>
        </div>
        <ArmasRegistroUploader 
          userId={userId}
          onUploadComplete={onUploadComplete}
        />
      </div>
    );
  }

  return (
    <div className={`document-card ${statusInfo.status}`}>
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <div className="card-title-section">
          <h4>{label}</h4>
          <p className="card-description">{description}</p>
        </div>
        <div className="card-status" style={{ backgroundColor: statusInfo.color }}>
          {statusInfo.label}
        </div>
      </div>

      {hasDocument && !showUploader && (
        <div className="card-file-info">
          <span className="file-name">📎 {documentData.fileName}</span>
          <span className="file-date">{formatDate(documentData.uploadDate)}</span>
          <div className="file-actions">
            <a 
              href={documentData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-view"
            >
              Ver
            </a>
            <button 
              className="btn-replace"
              onClick={() => setShowUploader(true)}
            >
              Reemplazar
            </button>
          </div>
        </div>
      )}

      {(!hasDocument || showUploader) && (
        <div className="card-uploader">
          <MultiImageUploader
            userId={userId}
            documentType={documentType}
            documentLabel={label}
            allowMultiple={allowMultiple}
            imageOnly={imageOnly}
            onUploadComplete={handleUploadComplete}
          />
          {showUploader && (
            <button 
              className="btn-cancel"
              onClick={() => setShowUploader(false)}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import MultiImageUploader from './MultiImageUploader';
import ArmasRegistroUploader from './ArmasRegistroUploader';
import EliminarDocumentoModal from './EliminarDocumentoModal';
import PDFPreviewModal from '../common/PDFPreviewModal';
import './DocumentCard.css';

// Documentos que permiten múltiples imágenes (frente/vuelta)
const MULTI_IMAGE_DOCS = ['ine', 'cartillaMilitar'];

// Documentos que se suben como imagen (JPG) no como PDF
const IMAGE_ONLY_DOCS = ['fotoCredencial'];

// Documentos oficiales que DEBEN aceptar PDF (gobierno federal)
const PDF_ALLOWED_DOCS = ['curp', 'constanciaAntecedentes'];

// Documentos que están precargados masivamente
const PRELOADED_DOCS = ['curp', 'constanciaAntecedentes'];

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
  const [mostrarEliminarModal, setMostrarEliminarModal] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  
  // Caso especial: Registros de Armas usa componente dedicado con OCR
  const isArmasRegistro = documentType === 'registrosArmas';
  
  // Determinar si este documento permite múltiples imágenes
  const allowMultiple = MULTI_IMAGE_DOCS.includes(documentType);
  
  // Determinar si este documento es solo imagen (no PDF)
  const imageOnly = IMAGE_ONLY_DOCS.includes(documentType);
  
  // Determinar si este documento acepta PDF
  const allowPdf = PDF_ALLOWED_DOCS.includes(documentType);
  
  // Determinar si este documento está precargado
  const isDocumentoPrecargado = PRELOADED_DOCS.includes(documentType);

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
          {isPreloaded && isDocumentoPrecargado && (
            <div className="aviso-precargado">
              <span className="icono-info">ℹ️</span>
              <div className="texto-aviso">
                <strong>Este documento ya está en el sistema</strong>
                <p>Fue cargado previamente por el club. Solo necesitas verificarlo.</p>
              </div>
            </div>
          )}
          <span className="file-name">📎 {documentData.fileName || 'Documento oficial'}</span>
          <span className="file-date">{formatDate(documentData.uploadDate)}</span>
          <div className="file-actions">
            <button 
              className="btn-view"
              onClick={() => setMostrarPreview(true)}
            >
              👁️ Ver
            </button>
            <a 
              href={documentData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-download"
            >
              ⬇️
            </a>
            {!isPreloaded && (
              <>
                <button 
                  className="btn-replace"
                  onClick={() => setShowUploader(true)}
                >
                  Reemplazar
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => setMostrarEliminarModal(true)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {mostrarEliminarModal && (
        <EliminarDocumentoModal
          socioEmail={userId}
          documentType={documentType}
          documentLabel={label}
          documentData={documentData}
          onClose={() => setMostrarEliminarModal(false)}
          onSuccess={() => {
            setMostrarEliminarModal(false);
            if (onUploadComplete) {
              onUploadComplete();
            }
          }}
        />
      )}

      {mostrarPreview && documentData?.url && (
        <PDFPreviewModal
          url={documentData.url}
          title={label}
          onClose={() => setMostrarPreview(false)}
        />
      )}

      {(!hasDocument || showUploader) && (
        <div className="card-uploader">
          {isDocumentoPrecargado && !hasDocument && (
            <div className="mensaje-precargado-pendiente">
              <span className="icono-atencion">⚠️</span>
              <p><strong>Nota:</strong> Este documento normalmente ya está en el sistema. Si no lo ves, contacta al secretario antes de subirlo.</p>
            </div>
          )}
          <MultiImageUploader
            userId={userId}
            documentType={documentType}
            documentLabel={label}
            allowMultiple={allowMultiple}
            imageOnly={imageOnly}
            allowPdf={allowPdf}
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

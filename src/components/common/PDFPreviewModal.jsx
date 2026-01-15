import React, { useState, useEffect } from 'react';
import './PDFPreviewModal.css';

export default function PDFPreviewModal({ url, title, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleZoomReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'documento.pdf';
    link.target = '_blank';
    link.click();
  };

  const handleOpenNew = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay pdf-preview-overlay" onClick={onClose}>
      <div className="modal-content pdf-preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pdf-preview-header">
          <div className="pdf-preview-title">
            <span className="pdf-icon">📄</span>
            <h3>{title || 'Vista Previa PDF'}</h3>
          </div>
          
          <div className="pdf-preview-actions">
            {/* Zoom controls */}
            <div className="zoom-controls">
              <button
                className="btn-zoom"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                title="Alejar (Ctrl + -)"
              >
                🔍-
              </button>
              <span className="zoom-level">{zoom}%</span>
              <button
                className="btn-zoom"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                title="Acercar (Ctrl + +)"
              >
                🔍+
              </button>
              <button
                className="btn-zoom-reset"
                onClick={handleZoomReset}
                title="Restablecer zoom"
              >
                ↻
              </button>
            </div>

            {/* Action buttons */}
            <button className="btn-action" onClick={handleDownload} title="Descargar PDF">
              ⬇️
            </button>
            <button className="btn-action" onClick={handleOpenNew} title="Abrir en nueva pestaña">
              ↗️
            </button>
            <button className="btn-close-pdf" onClick={onClose} title="Cerrar (Esc)">
              ✕
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="pdf-preview-body">
          {error ? (
            <div className="pdf-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn-retry" onClick={handleOpenNew}>
                Abrir en nueva pestaña
              </button>
            </div>
          ) : (
            <iframe
              src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              title={title || 'PDF Preview'}
              className="pdf-iframe"
              style={{ transform: `scale(${zoom / 100})` }}
              onError={() => setError('No se pudo cargar el PDF. Intenta abrirlo en nueva pestaña.')}
            />
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="pdf-preview-footer">
          <span className="shortcut-hint">
            <kbd>Esc</kbd> Cerrar
          </span>
          <span className="shortcut-hint">
            <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd> Zoom
          </span>
        </div>
      </div>
    </div>
  );
}

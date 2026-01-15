/**
 * EliminarDocumentoModal - Modal de confirmación para eliminar documentos
 * 
 * Features:
 * - Advertencias sobre la acción irreversible
 * - Detalles del documento a eliminar
 * - Botón crítico de eliminación
 * - Eliminación de Storage + Firestore
 * - Audit trail automático
 */
import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../firebaseConfig';
import './EliminarDocumentoModal.css';

export default function EliminarDocumentoModal({ 
  socioEmail, 
  documentType, 
  documentLabel,
  documentData,
  onClose, 
  onSuccess 
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const eliminarDocumento = async () => {
    try {
      setDeleting(true);
      setError(null);

      // 1. Eliminar archivo de Storage
      if (documentData?.url) {
        try {
          // Extraer path del Storage desde la URL
          const url = documentData.url;
          const pathMatch = url.match(/o\/(.+?)\?/);
          if (pathMatch) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            console.log('✅ Archivo eliminado de Storage:', filePath);
          }
        } catch (storageError) {
          // Si el archivo no existe en Storage, continuamos
          console.warn('⚠️ Archivo no encontrado en Storage (puede haber sido eliminado previamente)');
        }
      }

      // 2. Actualizar Firestore - eliminar campo del documento
      const socioRef = doc(db, 'socios', socioEmail);
      await updateDoc(socioRef, {
        [`documentosPETA.${documentType}`]: deleteField()
      });

      // 3. Crear registro de auditoría
      const auditoriaRef = collection(db, 'socios', socioEmail, 'auditoria');
      await addDoc(auditoriaRef, {
        campo: `documentosPETA.${documentType}`,
        valorAnterior: JSON.stringify({
          url: documentData?.url || 'N/A',
          fileName: documentData?.fileName || 'N/A',
          uploadDate: documentData?.uploadDate?.toDate?.() || 'N/A'
        }),
        valorNuevo: 'ELIMINADO',
        modificadoPor: auth.currentUser?.email || 'admin@club738.com',
        fecha: serverTimestamp(),
        tipo: 'eliminacion_documento',
        documentoTipo: documentType,
        documentoLabel: documentLabel
      });

      console.log(`✅ Documento ${documentType} eliminado exitosamente`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('❌ Error eliminando documento:', err);
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content eliminar-documento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🗑️ Eliminar Documento</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="warning-critical">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h3>¡Atención! Esta acción NO se puede deshacer</h3>
              <p>El archivo será eliminado permanentemente de Firebase Storage y no podrá ser recuperado.</p>
            </div>
          </div>

          <div className="documento-detalles">
            <h4>Detalles del Documento:</h4>
            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="detalle-label">Tipo:</span>
                <span className="detalle-value">{documentLabel}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Nombre archivo:</span>
                <span className="detalle-value">{documentData?.fileName || 'Documento oficial'}</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Fecha de subida:</span>
                <span className="detalle-value">{formatDate(documentData?.uploadDate)}</span>
              </div>
              <div className="detalle-item full-width">
                <span className="detalle-label">Socio:</span>
                <span className="detalle-value">{socioEmail}</span>
              </div>
            </div>
          </div>

          <div className="consecuencias-box">
            <h4>Consecuencias de la eliminación:</h4>
            <ul>
              <li>❌ El archivo será eliminado de Firebase Storage</li>
              <li>❌ El registro será removido de Firestore</li>
              <li>📋 Se creará un registro en el historial de auditoría</li>
              <li>⚠️ El socio deberá volver a subir el documento si es necesario</li>
            </ul>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn-cancel"
            disabled={deleting}
          >
            ← Cancelar
          </button>
          <button
            onClick={eliminarDocumento}
            className="btn-delete-critical"
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : '🗑️ Eliminar Definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}

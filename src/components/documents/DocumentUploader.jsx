import React, { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import './DocumentUploader.css';

export default function DocumentUploader({ userId, documentType, documentLabel, onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos PDF, JPG o PNG');
      return false;
    }
    if (file.size > maxSize) {
      setError('El archivo no debe superar 5MB');
      return false;
    }
    return true;
  };

  const uploadFile = async (file) => {
    if (!validateFile(file)) return;

    setError('');
    setUploading(true);
    setProgress(0);

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${documentType}_${timestamp}.${extension}`;
    // IMPORTANTE: La ruta debe ser documentos/{email}/ para coincidir con Storage Rules
    const storageRef = ref(storage, `documentos/${userId}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => {
        setError('Error al subir archivo: ' + err.message);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Actualizar Firestore con la URL del documento
          const socioRef = doc(db, 'socios', userId);
          await updateDoc(socioRef, {
            [`documentosPETA.${documentType}`]: {
              url: downloadURL,
              fileName: file.name,
              uploadDate: serverTimestamp(),
              estado: 'pendiente_revision',
              fileSize: file.size,
              fileType: file.type
            }
          });

          setUploading(false);
          setProgress(100);
          if (onUploadComplete) {
            onUploadComplete(documentType, downloadURL);
          }
        } catch (err) {
          setError('Error al guardar referencia: ' + err.message);
          setUploading(false);
        }
      }
    );
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [userId, documentType]);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <div className={`document-uploader ${isDragging ? 'dragging' : ''}`}>
      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>{progress}% subiendo...</span>
          </div>
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              Arrastra tu <strong>{documentLabel}</strong> aquí
            </p>
            <p className="upload-hint">o</p>
            <label className="file-select-btn">
              Seleccionar archivo
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                hidden
              />
            </label>
            <p className="upload-formats">PDF, JPG o PNG (máx. 5MB)</p>
          </>
        )}
      </div>
      
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}

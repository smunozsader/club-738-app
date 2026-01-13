import React, { useState, useCallback, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import { validarDocumento, REGLAS_DOCUMENTOS } from '../../utils/documentValidation';
import './DocumentUploader.css';

export default function DocumentUploader({ userId, documentType, documentLabel, onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file) => {
    // Validación estricta usando reglas de documentValidation.js
    const resultado = validarDocumento(documentType, file);
    
    if (!resultado.valido) {
      // Mostrar error específico al usuario
      alert(resultado.error);
      setError(resultado.error.split('\n\n')[0]); // Mostrar solo el título del error
      
      // Resetear input file para permitir seleccionar de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      return false;
    }
    
    // Mostrar advertencia si existe (no bloquea subida)
    if (resultado.advertencia) {
      console.log(resultado.advertencia);
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
    
  
  // Determinar formatos permitidos según el tipo de documento
  const getAcceptedFormats = () => {
    const regla = REGLAS_DOCUMENTOS[documentType];
    if (!regla) return '.pdf,.jpg,.jpeg,.png';
    
    return regla.formatos.map(f => `.${f}`).join(',');
  };
  
  const getFormatsText = () => {
    const regla = REGLAS_DOCUMENTOS[documentType];
    if (!regla) return 'PDF, JPG o PNG (máx. 5MB)';
    
    const formatosTexto = regla.formatos.map(f => f.toUpperCase()).join(' o ');
    const tamañoMB = (regla.tamañoMax / (1024 * 1024)).toFixed(0);
    return `${formatosTexto} (máx. ${tamañoMB}MB)`;
  };setIsDragging(false);
    
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
        {uploadiref={fileInputRef}
                type="file"
                accept={getAcceptedFormats()}
                onChange={handleFileSelect}
                hidden
              />
            </label>
            <p className="upload-formats">{getFormatsText()}
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

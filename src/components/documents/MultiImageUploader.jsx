import React, { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import { jsPDF } from 'jspdf';
import heic2any from 'heic2any';
import './MultiImageUploader.css';

export default function MultiImageUploader({ 
  userId, 
  documentType, 
  documentLabel,
  allowMultiple = false, // true para INE (frente/vuelta)
  onUploadComplete 
}) {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(false);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
  const maxSize = 10 * 1024 * 1024; // 10MB per file
  const maxImages = allowMultiple ? 4 : 1;

  // Convertir HEIC (iOS) a JPEG
  const convertHeicToJpeg = async (file) => {
    try {
      setConverting(true);
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      setConverting(false);
      return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
    } catch (err) {
      setConverting(false);
      console.error('Error converting HEIC:', err);
      throw new Error('No se pudo convertir la imagen HEIC');
    }
  };

  // Convertir imagen a base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Obtener dimensiones de imagen
  const getImageDimensions = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = base64;
    });
  };

  // Convertir imágenes a PDF
  const imagesToPdf = async (imageFiles) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter' // Carta
    });

    const pageWidth = 215.9; // Letter width in mm
    const pageHeight = 279.4; // Letter height in mm
    const margin = 10;

    for (let i = 0; i < imageFiles.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const base64 = await imageToBase64(imageFiles[i]);
      const dims = await getImageDimensions(base64);
      
      // Calcular dimensiones para ajustar a la página
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);
      
      let width = dims.width;
      let height = dims.height;
      
      // Escalar proporcionalmente
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      // Convertir px a mm (asumiendo 96 DPI)
      const widthMm = (width / 96) * 25.4;
      const heightMm = (height / 96) * 25.4;
      
      // Centrar en la página
      const x = (pageWidth - widthMm) / 2;
      const y = (pageHeight - heightMm) / 2;

      pdf.addImage(base64, 'JPEG', x, y, widthMm, heightMm);
    }

    return pdf.output('blob');
  };

  const validateFile = (file) => {
    // Check type (including HEIC)
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    if (!allowedTypes.includes(file.type) && !isHeic) {
      setError('Solo se permiten archivos PDF, JPG, PNG o HEIC');
      return false;
    }
    if (file.size > maxSize) {
      setError('El archivo no debe superar 10MB');
      return false;
    }
    return true;
  };

  const processFile = async (file) => {
    // Si es HEIC, convertir a JPEG
    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      return await convertHeicToJpeg(file);
    }
    return file;
  };

  const handleFiles = async (files) => {
    setError('');
    const validFiles = [];

    for (const file of files) {
      if (!validateFile(file)) continue;
      
      // Si ya es PDF, subir directamente
      if (file.type === 'application/pdf') {
        await uploadFile(file);
        return;
      }

      try {
        const processedFile = await processFile(file);
        validFiles.push(processedFile);
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    if (validFiles.length === 0) return;

    // Agregar a la lista de imágenes
    const newImages = [...images, ...validFiles].slice(0, maxImages);
    setImages(newImages);

    // Si no permite múltiples, convertir y subir inmediatamente
    if (!allowMultiple && newImages.length > 0) {
      await convertAndUpload(newImages);
    }
  };

  const convertAndUpload = async (imagesToConvert) => {
    if (imagesToConvert.length === 0) {
      setError('Agrega al menos una imagen');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Convertir a PDF
      setProgress(30);
      const pdfBlob = await imagesToPdf(imagesToConvert);
      setProgress(50);

      // Crear archivo PDF
      const pdfFile = new File([pdfBlob], `${documentType}_${Date.now()}.pdf`, { 
        type: 'application/pdf' 
      });

      // Subir a Firebase Storage
      await uploadFile(pdfFile);
      
      // Limpiar imágenes
      setImages([]);
    } catch (err) {
      setError('Error al convertir a PDF: ' + err.message);
      setUploading(false);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(60);

    const timestamp = Date.now();
    const fileName = `${documentType}_${timestamp}.pdf`;
    const storageRef = ref(storage, `documentos/${userId}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = 60 + Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 40);
        setProgress(prog);
      },
      (err) => {
        setError('Error al subir archivo: ' + err.message);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Actualizar Firestore
          const socioRef = doc(db, 'socios', userId);
          await updateDoc(socioRef, {
            [`documentosPETA.${documentType}`]: {
              url: downloadURL,
              fileName: fileName,
              uploadDate: serverTimestamp(),
              estado: 'pendiente_revision',
              fileSize: file.size,
              fileType: 'application/pdf'
            }
          });

          setUploading(false);
          setProgress(100);
          setImages([]);
          
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

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [images]);

  const handleFileSelect = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  return (
    <div className={`multi-image-uploader ${isDragging ? 'dragging' : ''}`}>
      {/* Preview de imágenes agregadas */}
      {images.length > 0 && (
        <div className="images-preview">
          {images.map((img, idx) => (
            <div key={idx} className="preview-item">
              <img src={URL.createObjectURL(img)} alt={`Imagen ${idx + 1}`} />
              <button className="remove-btn" onClick={() => removeImage(idx)}>×</button>
              <span className="image-label">
                {allowMultiple ? (idx === 0 ? 'Frente' : idx === 1 ? 'Vuelta' : `Pág ${idx + 1}`) : 'Imagen'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Zona de drop */}
      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading || converting ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>
              {converting ? 'Convirtiendo imagen...' : 
               progress < 50 ? 'Creando PDF...' : 
               progress < 100 ? `${progress}% subiendo...` : 
               '¡Completado!'}
            </span>
          </div>
        ) : (
          <>
            <div className="upload-icon">📷</div>
            {allowMultiple ? (
              <>
                <p className="upload-text">
                  {images.length === 0 ? (
                    <>Toma foto del <strong>FRENTE</strong> de tu {documentLabel}</>
                  ) : images.length === 1 ? (
                    <>Ahora toma foto de la <strong>VUELTA</strong></>
                  ) : (
                    <>Listo para convertir a PDF</>
                  )}
                </p>
                <p className="upload-hint">{images.length} de {maxImages} imágenes</p>
              </>
            ) : (
              <p className="upload-text">
                Arrastra o toma foto de tu <strong>{documentLabel}</strong>
              </p>
            )}
            
            <label className="file-select-btn">
              {allowMultiple && images.length > 0 ? 'Agregar otra foto' : '📷 Tomar foto / Seleccionar'}
              <input
                type="file"
                accept="image/*,.pdf,.heic,.heif"
                capture="environment"
                onChange={handleFileSelect}
                multiple={allowMultiple}
                hidden
              />
            </label>
            
            <p className="upload-formats">
              JPG, PNG, HEIC o PDF (máx. 10MB)
              {allowMultiple && <><br/>Se convertirá automáticamente a PDF</>}
            </p>
          </>
        )}
      </div>

      {/* Botón para convertir y subir (solo modo múltiple) */}
      {allowMultiple && images.length > 0 && !uploading && (
        <button 
          className="convert-btn"
          onClick={() => convertAndUpload(images)}
        >
          ✨ Convertir a PDF y Subir ({images.length} {images.length === 1 ? 'imagen' : 'imágenes'})
        </button>
      )}

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}

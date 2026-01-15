import React, { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import { jsPDF } from 'jspdf';
import heic2any from 'heic2any';
import { validarDocumento } from '../../utils/documentValidation';
import './MultiImageUploader.css';

export default function MultiImageUploader({ 
  userId, 
  documentType, 
  documentLabel,
  allowMultiple = false, // true para INE (frente/vuelta)
  imageOnly = false, // true para fotoCredencial (sube JPG, no PDF)
  allowPdf = false, // true para CURP y Constancia (acepta PDF oficial)
  onUploadComplete 
}) {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(false);
  const [uploadMode, setUploadMode] = useState(null); // 'pdf' o 'photo'
  const maxImages = allowMultiple ? 4 : 1;

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setError('');

    // Si permite PDF y se suelta un PDF
    if (allowPdf && files[0].type === 'application/pdf') {
      if (!validateFile(files[0], true)) return;
      await uploadFile(files[0]);
      return;
    }

    // Si es imageOnly (fotoCredencial)
    if (imageOnly) {
      const file = files[0];
      const resultado = validarDocumento('fotoCredencial', file);
      if (!resultado.valido) {
        setError(resultado.error.split('\n\n')[0]);
        return;
      }
      await uploadFile(file, true);
      return;
    }

    // Procesar imágenes para convertir a PDF
    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setError('Por favor arrastra archivos de imagen (JPG, PNG, HEIC)');
      return;
    }

    const processedImages = [];
    for (const file of validImages.slice(0, maxImages)) {
      const processed = await processFile(file);
      processedImages.push(processed);
    }

    setImages(processedImages);
    setUploadMode('photo');
  }, [allowPdf, imageOnly, maxImages]);

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

  const validateFile = (file, isPdfMode = false) => {
    // Determinar el tipo de documento según el modo
    // imageOnly=true → fotoCredencial (solo JPG/JPEG)
    // isPdfMode=true → documento PDF (ine, etc.)
    // allowMultiple=true → generalmente INE (fotos que se convierten a PDF)
    
    let tipoDoc = documentType;
    
    // Para validar el archivo original antes de procesarlo
    if (imageOnly) {
      // fotoCredencial: solo JPG/JPEG
      tipoDoc = 'fotoCredencial';
    } else if (isPdfMode) {
      // Documentos PDF (cuando suben PDF directo de INE)
      tipoDoc = 'ine'; // Usamos reglas de INE como base
    }
    
    const resultado = validarDocumento(tipoDoc, file);
    
    if (!resultado.valido) {
      alert(resultado.error);
      setError(resultado.error.split('\n\n')[0]);
      return false;
    }
    
    if (resultado.advertencia) {
      console.log(resultado.advertencia);
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

  // Manejar subida de PDF preparado
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError('');
    if (!validateFile(file, true)) return;
    
    await uploadFile(file);
  };

  // Manejar subida directa de imagen (JPG) - para fotoCredencial
  const handleImageOnlyUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError('');
    
    // Validación estricta: solo JPG/JPEG (rechaza PNG/HEIC/PDF)
    const resultado = validarDocumento('fotoCredencial', file);
    
    if (!resultado.valido) {
      alert(resultado.error);
      setError(resultado.error.split('\n\n')[0]);
      // Resetear input
      e.target.value = '';
      return;
    }
    
    if (resultado.advertencia) {
      console.log(resultado.advertencia);
    }
    
    try {
      // Subir como imagen (JPG/JPEG puro, no PDF)
      await uploadFile(file, true);
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar fotos para convertir a PDF
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setError('');
    const validFiles = [];

    for (const file of files) {
      if (!validateFile(file, false)) continue;
      
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

  // Legacy handler para drag & drop
  const handleFiles = async (files) => {
    setError('');

    for (const file of files) {
      // Si es PDF, subir directamente
      if (file.type === 'application/pdf') {
        if (!validateFile(file, true)) return;
        await uploadFile(file);
        return;
      }

      // Si es imagen, procesar
      if (!validateFile(file, false)) continue;
      
      try {
        const processedFile = await processFile(file);
        const newImages = [...images, processedFile].slice(0, maxImages);
        setImages(newImages);

        if (!allowMultiple && newImages.length > 0) {
          await convertAndUpload(newImages);
        }
      } catch (err) {
        setError(err.message);
        return;
      }
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

  const uploadFile = async (file, asImage = false) => {
    setUploading(true);
    setProgress(60);

    const timestamp = Date.now();
    const extension = asImage ? 'jpg' : 'pdf';
    const mimeType = asImage ? 'image/jpeg' : 'application/pdf';
    const fileName = `${documentType}_${timestamp}.${extension}`;
    const storagePath = `documentos/${userId}/${fileName}`;
    
    // 🔍 Debug: mostrar información de upload
    console.log('📤 UPLOAD DEBUG:', {
      path: storagePath,
      userId: userId,
      fileName: fileName,
      fileType: file.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      asImage: asImage
    });

    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = 60 + Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 40);
        setProgress(prog);
      },
      (err) => {
        // 🔍 Debug: mostrar error completo
        console.error('❌ UPLOAD ERROR:', {
          code: err.code,
          message: err.message,
          serverResponse: err.serverResponse,
          path: storagePath,
          userId: userId,
          fileType: file.type,
          fileSize: file.size
        });
        
        // Mostrar código de error específico al usuario
        let errorMsg = 'Error al subir: ';
        if (err.code === 'storage/unauthorized') {
          errorMsg += `Sin permisos (${userId}). Verifica tu sesión o contacta al administrador.`;
        } else if (err.code === 'storage/canceled') {
          errorMsg += 'Subida cancelada.';
        } else if (err.code === 'storage/retry-limit-exceeded') {
          errorMsg += 'Conexión lenta. Intenta de nuevo.';
        } else {
          errorMsg += `${err.code || err.message}`;
        }
        setError(errorMsg);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Storage upload OK, URL:', downloadURL);
          
          // Actualizar Firestore
          const socioRef = doc(db, 'socios', userId);
          console.log('📝 Updating Firestore doc: socios/', userId);
          
          await updateDoc(socioRef, {
            [`documentosPETA.${documentType}`]: {
              url: downloadURL,
              fileName: fileName,
              uploadDate: serverTimestamp(),
              estado: 'pendiente_revision',
              fileSize: file.size,
              fileType: asImage ? 'image/jpeg' : 'application/pdf'
            }
          });

          console.log('✅ Firestore update OK');
          setUploading(false);
          setProgress(100);
          setImages([]);
          
          if (onUploadComplete) {
            onUploadComplete(documentType, downloadURL);
          }
        } catch (err) {
          console.error('❌ FIRESTORE ERROR:', {
            code: err.code,
            message: err.message,
            docPath: `socios/${userId}`
          });
          
          // Error específico de Firestore
          let errorMsg = 'Error Firestore: ';
          if (err.code === 'not-found') {
            errorMsg += 'Tu perfil de socio no existe. Contacta al admin.';
          } else if (err.code === 'permission-denied') {
            errorMsg += 'Sin permisos para actualizar tu perfil.';
          } else {
            errorMsg += err.message;
          }
          setError(errorMsg);
          setUploading(false);
        }
      }
    );
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  // Si es imageOnly (fotoCredencial), mostrar interfaz simplificada
  if (imageOnly) {
    return (
      <div className={`multi-image-uploader image-only ${isDragging ? 'dragging' : ''}`}>
        {!uploading ? (
          <div className="image-only-upload">
            <div className="image-only-info">
              <p className="image-only-title">📸 Sube tu foto</p>
              <p className="image-only-desc">Solo JPG o JPEG, fondo blanco, tamaño infantil</p>
            </div>
            
            <label className="file-select-btn image-btn">
              📷 Seleccionar imagen JPG
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                capture="environment"
                onChange={handleImageOnlyUpload}
                hidden
              />
            </label>
            
            <p className="image-only-hint">
              💡 Toma la foto con tu celular o selecciona un JPG guardado. Máximo 2MB.
            </p>
          </div>
        ) : (
          <div className="upload-progress-container">
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span>
                {converting ? '🔄 Procesando imagen...' : 
                 progress < 100 ? `⬆️ ${progress}% subiendo...` : 
                 '✅ ¡Completado!'}
              </span>
            </div>
          </div>
        )}
        
        {error && <div className="upload-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className={`multi-image-uploader ${isDragging ? 'dragging' : ''}`}>
      
      {/* Caso especial: Documentos oficiales PDF (CURP, Constancia) */}
      {allowPdf && !uploading && (
        <div className="pdf-oficial-section">
          <div className="pdf-oficial-info">
            <span className="icono-oficial">🏛️</span>
            <div>
              <strong>Documento Oficial del Gobierno Federal</strong>
              <p>Sube el PDF original tal como lo descargaste (ya tiene OCR y formato óptimo)</p>
            </div>
          </div>
          
          <label className="file-select-btn pdf-oficial-btn">
            📄 Seleccionar PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              hidden
            />
          </label>
          
          <div className="pdf-oficial-requisitos">
            <p>✓ Peso máximo: 5 MB</p>
            <p>✓ Formato: PDF original del portal oficial</p>
          </div>
        </div>
      )}
      
      {/* Selector de modo (si no es allowPdf y no hay nada en progreso) */}
      {!allowPdf && !uploadMode && !uploading && images.length === 0 && (
        <div className="upload-mode-selector">
          <p className="mode-title">¿Cómo quieres subir tu {documentLabel}?</p>
          
          <button 
            className="mode-btn mode-pdf"
            onClick={() => setUploadMode('pdf')}
          >
            <span className="mode-icon">📄</span>
            <span className="mode-label">Ya tengo PDF listo</span>
            <span className="mode-desc">Ampliado al 200%, tamaño carta, máx 5MB</span>
          </button>
          
          <button 
            className="mode-btn mode-photo"
            onClick={() => setUploadMode('photo')}
          >
            <span className="mode-icon">📷</span>
            <span className="mode-label">Tomar foto</span>
            <span className="mode-desc">Se convertirá a PDF automáticamente</span>
          </button>
        </div>
      )}

      {/* Modo PDF: Subir PDF preparado (solo si NO es allowPdf) */}
      {!allowPdf && uploadMode === 'pdf' && !uploading && (
        <div className="pdf-upload-section">
          <div className="pdf-requirements">
            <h4>📋 Requisitos del PDF:</h4>
            <ul>
              <li>✓ Tamaño <strong>carta</strong> (letter)</li>
              <li>✓ Resolución mínima <strong>200 DPI</strong></li>
              <li>✓ Ampliado al <strong>200%</strong> (especialmente INE)</li>
              <li>✓ Peso máximo: <strong>5 MB</strong></li>
            </ul>
            <p className="pdf-tip">
              💡 Tip: Usa <a href="https://www.ilovepdf.com/es" target="_blank" rel="noopener noreferrer">iLovePDF.com</a> para preparar tu documento
            </p>
          </div>
          
          <label className="file-select-btn pdf-btn">
            📄 Seleccionar PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              hidden
            />
          </label>
          
          <button className="btn-back-mode" onClick={() => setUploadMode(null)}>
            ← Cambiar método
          </button>
        </div>
      )}

      {/* Modo Foto: Tomar fotos (solo si NO es allowPdf) */}
      {!allowPdf && uploadMode === 'photo' && !uploading && (
        <>
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

          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📷</div>
            {allowMultiple ? (
              <>
                <p className="upload-text">
                  {images.length === 0 ? (
                    <>Toma foto del <strong>FRENTE</strong></>
                  ) : images.length === 1 ? (
                    <>Ahora el <strong>REVERSO</strong></>
                  ) : (
                    <>Listo para convertir</>
                  )}
                </p>
                <p className="upload-hint">{images.length} de {maxImages} imágenes</p>
              </>
            ) : (
              <p className="upload-text">Toma foto de tu documento</p>
            )}
            
            <label className="file-select-btn">
              📷 {images.length > 0 ? 'Agregar foto' : 'Tomar foto'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                multiple={allowMultiple}
                hidden
              />
            </label>

            {documentType.toLowerCase().includes('ine') && (
              <p className="ine-reminder">
                ⚠️ <strong>Para INE:</strong> Prepara mejor tu PDF al 200% con iLovePDF
              </p>
            )}
          </div>

          {/* Botón para convertir */}
          {allowMultiple && images.length > 0 && (
            <button 
              className="convert-btn"
              onClick={() => convertAndUpload(images)}
            >
              ✨ Crear PDF y Subir ({images.length} {images.length === 1 ? 'imagen' : 'imágenes'})
            </button>
          )}

          <button className="btn-back-mode" onClick={() => { setUploadMode(null); setImages([]); }}>
            ← Cambiar método
          </button>
        </>
      )}

      {/* Estado de subida */}
      {(uploading || converting) && (
        <div className="upload-progress-container">
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>
              {converting ? '🔄 Convirtiendo imagen...' : 
               progress < 50 ? '📝 Creando PDF...' : 
               progress < 100 ? `⬆️ ${progress}% subiendo...` : 
               '✅ ¡Completado!'}
            </span>
          </div>
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}

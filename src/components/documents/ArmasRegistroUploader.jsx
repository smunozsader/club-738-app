/**
 * ArmasRegistroUploader - Componente para subir registros de armas con validación OCR
 * Muestra las armas del socio y permite subir el registro de cada una validando
 * que el PDF contenga la matrícula correcta
 */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { validateArmaRegistro } from '../../utils/ocrValidation';
import './ArmasRegistroUploader.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ArmasRegistroUploader({ userId, onUploadComplete }) {
  const [armas, setArmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // ID del arma en proceso
  const [validating, setValidating] = useState(null); // ID del arma validando OCR
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(null); // {armaId, file} para forzar subida

  useEffect(() => {
    cargarArmas();
  }, [userId]);

  const cargarArmas = async () => {
    try {
      const socioRef = doc(db, 'socios', userId);
      const armasRef = collection(socioRef, 'armas');
      const snapshot = await getDocs(armasRef);
      
      const armasData = [];
      
      for (const docSnap of snapshot.docs) {
        const armaData = {
          id: docSnap.id,
          ...docSnap.data()
        };
        
        // Verificar si ya existe documento en Storage
        try {
          const storageRef = ref(
            storage, 
            `documentos/${userId}/armas/${docSnap.id}/registro.pdf`
          );
          const url = await getDownloadURL(storageRef);
          armaData.documentoRegistro = url;
        } catch {
          // No existe
        }
        
        armasData.push(armaData);
      }
      
      setArmas(armasData);
    } catch (error) {
      console.error('Error cargando armas:', error);
      setError('No se pudieron cargar tus armas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (armaId, file, forceUpload = false) => {
    if (!file) return;
    
    const arma = armas.find(a => a.id === armaId);
    if (!arma) return;

    // Limpiar estados anteriores
    setError(null);
    if (!forceUpload) {
      setPendingUpload(null);
    }

    // Validar tipo
    if (file.type !== 'application/pdf') {
      setError('⚠️ Solo se aceptan archivos PDF');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`⚠️ El PDF pesa ${sizeMB}MB. Máximo permitido: 5MB\n\n💡 Comprime en iLovePDF.com`);
      return;
    }

    // Paso 1: Validar con OCR (a menos que sea forzado)
    if (!forceUpload) {
      setValidating(armaId);
      setProgress('Verificando documento...');

      try {
        const validation = await validateArmaRegistro(
          file, 
          arma,
          ({ message }) => setProgress(message)
        );

        if (!validation.valid) {
          setValidating(null);
          // Guardar archivo pendiente para opción de forzar
          setPendingUpload({ armaId, file, matricula: arma.matricula });
          setError(validation.message);
          return;
        }
      } catch (err) {
        console.warn('Error en validación OCR:', err);
        // Si falla el OCR, permitir subir de todas formas
      }
    }

    // Paso 2: Subir a Storage
    setValidating(null);
    setUploading(armaId);
    setProgress('Subiendo documento...');

    try {
      const filePath = `documentos/${userId}/armas/${armaId}/registro.pdf`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Actualizar estado local
      setArmas(prev => prev.map(a => 
        a.id === armaId 
          ? { ...a, documentoRegistro: downloadURL }
          : a
      ));

      setProgress('');
      
      // Notificar al padre si hay callback
      if (onUploadComplete) {
        onUploadComplete('registrosArmas', downloadURL);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setUploading(null);
      setValidating(null);
      setProgress('');
    }
  };

  const getIconoClase = (clase) => {
    const claseNorm = clase?.toUpperCase() || '';
    if (claseNorm.includes('PISTOLA')) return '🔫';
    if (claseNorm.includes('REVOLVER')) return '🔫';
    if (claseNorm.includes('RIFLE')) return '🎯';
    if (claseNorm.includes('ESCOPETA')) return '🦆';
    return '🔫';
  };

  // Calcular progreso
  const armasConDoc = armas.filter(a => a.documentoRegistro).length;
  const porcentaje = armas.length > 0 ? Math.round((armasConDoc / armas.length) * 100) : 0;

  if (loading) {
    return (
      <div className="armas-registro-loading">
        <span className="spinner">⏳</span>
        Cargando tus armas registradas...
      </div>
    );
  }

  if (armas.length === 0) {
    return (
      <div className="armas-registro-empty">
        <p>📭 No tienes armas registradas en el sistema.</p>
        <p>Si crees que esto es un error, contacta al administrador.</p>
      </div>
    );
  }

  return (
    <div className="armas-registro-uploader">
      {/* Cabecera */}
      <div className="armas-registro-header">
        <p className="armas-registro-intro">
          Sube el registro SEDENA (RFA) de cada arma. El sistema verificará 
          automáticamente que la matrícula coincida.
        </p>
        
        {/* Mini progreso */}
        <div className="armas-registro-progress">
          <div className="progress-text">
            <span>{armasConDoc} de {armas.length} registros</span>
            <span className="progress-percent">{porcentaje}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="armas-registro-error">
          <button className="error-close" onClick={() => { setError(null); setPendingUpload(null); }}>×</button>
          <pre>{error}</pre>
          {/* Opción para forzar subida si el OCR falla */}
          {pendingUpload && (
            <div className="force-upload-section">
              <p>¿Estás seguro de que este es el registro correcto para <strong>{pendingUpload.matricula}</strong>?</p>
              <button 
                className="btn-force-upload"
                onClick={() => handleFileSelect(pendingUpload.armaId, pendingUpload.file, true)}
              >
                ✅ Sí, subir de todas formas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progreso de validación */}
      {(validating || uploading) && (
        <div className="armas-registro-validating">
          <span className="spinner">⏳</span>
          <span>{progress}</span>
        </div>
      )}

      {/* Lista de armas */}
      <div className="armas-registro-list">
        {armas.map(arma => (
          <div 
            key={arma.id} 
            className={`arma-item ${arma.documentoRegistro ? 'completado' : 'pendiente'}`}
          >
            <div className="arma-item-icon">
              {getIconoClase(arma.clase)}
            </div>
            
            <div className="arma-item-info">
              <div className="arma-item-title">
                {arma.marca} {arma.modelo}
              </div>
              <div className="arma-item-details">
                <span>Matrícula: <strong>{arma.matricula}</strong></span>
                <span>Calibre: {arma.calibre}</span>
              </div>
            </div>

            <div className="arma-item-action">
              {arma.documentoRegistro ? (
                <div className="arma-item-completed">
                  <a 
                    href={arma.documentoRegistro} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-view-registro"
                  >
                    📄 Ver registro
                  </a>
                  <label className="btn-replace-registro">
                    Reemplazar
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        handleFileSelect(arma.id, e.target.files[0]);
                        e.target.value = ''; // Reset para permitir re-seleccionar mismo archivo
                      }}
                      disabled={!!validating || !!uploading}
                    />
                  </label>
                </div>
              ) : (
                <label className={`btn-upload-registro ${(validating === arma.id || uploading === arma.id) ? 'uploading' : ''}`}>
                  {validating === arma.id ? '🔍 Verificando...' : 
                   uploading === arma.id ? '📤 Subiendo...' : 
                   '📄 Subir registro PDF'}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      handleFileSelect(arma.id, e.target.files[0]);
                      e.target.value = ''; // Reset para permitir re-seleccionar mismo archivo
                    }}
                    disabled={!!validating || !!uploading}
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nota de ayuda */}
      <div className="armas-registro-help">
        <h5>💡 ¿Qué es el RFA?</h5>
        <p>
          El <strong>Registro Federal de Armas (RFA)</strong> es el documento que SEDENA 
          te entrega cuando registras tu arma. Contiene la matrícula única del arma.
        </p>
        <p>
          El sistema usa <strong>OCR (Reconocimiento Óptico)</strong> para verificar 
          que el PDF que subes corresponde al arma correcta.
        </p>
      </div>
    </div>
  );
}

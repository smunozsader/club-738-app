import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './MisArmas.css';

// Tamaño máximo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function MisArmas({ user }) {
  const [armas, setArmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [socioData, setSocioData] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [dragOver, setDragOver] = useState(null); // ID del arma sobre la que se arrastra

  useEffect(() => {
    cargarArmas();
  }, [user.email]);

  const cargarArmas = async () => {
    try {
      const socioRef = doc(db, 'socios', user.email.toLowerCase());
      const armasRef = collection(socioRef, 'armas');
      const snapshot = await getDocs(armasRef);
      
      const armasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setArmas(armasData);
    } catch (error) {
      console.error('Error cargando armas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (armaId, file) => {
    if (!file) return;
    
    // ⚠️ SOLO PDFs - Los registros deben estar preparados correctamente
    if (file.type !== 'application/pdf') {
      alert('⚠️ Solo se aceptan archivos PDF\n\n📋 Requisitos:\n• Tamaño carta\n• Resolución 200-300 DPI\n• Máximo 5MB\n\n💡 Usa iLovePDF.com o Adobe Scan para preparar tu documento');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(`⚠️ El PDF pesa ${sizeMB}MB\n\nMáximo: 5MB\n\n💡 Comprime en iLovePDF.com`);
      return;
    }

    setUploading(armaId);
    
    try {
      const userEmail = user.email.toLowerCase();
      const filePath = `documentos/${userEmail}/armas/${armaId}/${armaId}_registro.pdf`;
      
      console.log('📤 Subiendo registro arma:', filePath);
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('✅ Storage OK');

      // Actualizar Firestore
      const armaRef = doc(db, 'socios', userEmail, 'armas', armaId);
      await updateDoc(armaRef, {
        documentoRegistro: downloadURL,
        fechaRegistro: new Date().toISOString()
      });

      // Actualizar estado local
      setArmas(prev => prev.map(a => 
        a.id === armaId 
          ? { ...a, documentoRegistro: downloadURL, fechaRegistro: new Date().toISOString() }
          : a
      ));

      alert('✅ Registro subido correctamente');
    } catch (error) {
      console.error('❌ Error:', error);
      
      let errorMsg = 'Error: ';
      if (error.code === 'storage/unauthorized') {
        errorMsg += 'Sin permisos. Verifica tu sesión.';
      } else {
        errorMsg += error.message;
      }
      alert(errorMsg);
    } finally {
      setUploading(null);
    }
  };

  const handleDragOver = (e, armaId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(armaId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  };

  const handleDrop = (e, armaId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(armaId, file);
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

  const armasConDocumento = armas.filter(a => a.documentoRegistro).length;
  const progreso = armas.length > 0 ? Math.round((armasConDocumento / armas.length) * 100) : 0;

  if (loading) {
    return <div className="mis-armas-loading">Cargando tus armas...</div>;
  }

  return (
    <div className="mis-armas">
      <div className="mis-armas-header">
        <h2>🔫 Mis Armas Registradas</h2>
        <p className="mis-armas-subtitle">
          Sube el registro SEDENA (PDF) de cada arma para completar tu PETA
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="progreso-armas">
        <div className="progreso-info">
          <span>Documentos subidos: {armasConDocumento} de {armas.length}</span>
          <span className="progreso-porcentaje">{progreso}%</span>
        </div>
        <div className="progreso-barra">
          <div 
            className="progreso-fill" 
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Tips de escaneo */}
      <div className="tips-escaneo">
        <button className="tips-toggle" onClick={() => setShowTips(!showTips)}>
          💡 {showTips ? 'Ocultar' : 'Ver'} tips de escaneo
        </button>
        {showTips && (
          <div className="tips-content">
            <h4>📋 Recomendaciones para escanear</h4>
            <ul>
              <li><strong>Resolución:</strong> 200-300 DPI (suficiente para texto)</li>
              <li><strong>Color:</strong> Escala de grises (reduce 60% el tamaño)</li>
              <li><strong>Formato:</strong> PDF</li>
              <li><strong>Tamaño máximo:</strong> 5 MB por archivo</li>
            </ul>
            <p className="tips-link">
              ¿Tu archivo pesa más de 5MB? 
              <a href="https://www.ilovepdf.com/es/comprimir_pdf" target="_blank" rel="noopener noreferrer">
                Comprimirlo en iLovePDF →
              </a>
            </p>
          </div>
        )}
      </div>

      {armas.length === 0 ? (
        <div className="sin-armas">
          <p>No tienes armas registradas en el sistema.</p>
          <p>Si crees que esto es un error, contacta al administrador del club.</p>
        </div>
      ) : (
        <div className="armas-grid">
          {armas.map(arma => (
            <div 
              key={arma.id} 
              className={`arma-card ${arma.documentoRegistro ? 'completa' : 'pendiente'}`}
            >
              <div className="arma-icono">{getIconoClase(arma.clase)}</div>
              
              <div className="arma-info">
                <h3>{arma.marca} {arma.modelo}</h3>
                <p className="arma-clase">{arma.clase}</p>
                <div className="arma-detalles">
                  <span><strong>Calibre:</strong> {arma.calibre}</span>
                  <span><strong>Matrícula:</strong> {arma.matricula}</span>
                  <span><strong>Folio:</strong> {arma.folio}</span>
                </div>
              </div>

              <div className="arma-documento">
                {arma.documentoRegistro ? (
                  <div className="documento-ok">
                    <span className="check">✅</span>
                    <a href={arma.documentoRegistro} target="_blank" rel="noopener noreferrer">
                      Ver registro
                    </a>
                  </div>
                ) : (
                  <div 
                    className={`documento-pendiente drop-zone ${dragOver === arma.id ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, arma.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, arma.id)}
                  >
                    {uploading === arma.id ? (
                      <div className="uploading-status">⏳ Subiendo...</div>
                    ) : (
                      <>
                        <div className="drop-hint">
                          {dragOver === arma.id ? '📥 Suelta aquí' : '📄 Sube tu registro (PDF)'}
                        </div>
                        <label className="upload-btn-small">
                          📄 Seleccionar PDF
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleFileUpload(arma.id, e.target.files[0])}
                            disabled={uploading !== null}
                          />
                        </label>
                        <span className="file-types">Solo PDF • Tamaño carta • Máx 5MB</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

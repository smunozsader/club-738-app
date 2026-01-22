import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL, getBlob } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './MisArmas.css';

/**
 * MisArmas - Vista de solo lectura de las armas del socio
 * Los registros de armas se suben desde "Documentos PETA" con validación OCR
 */
export default function MisArmas({ user }) {
  const [armas, setArmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);

  // Verificar si es secretario
  const isSecretario = user.email.toLowerCase() === 'admin@club738.com';

  useEffect(() => {
    cargarArmas();
  }, [user.email]);

  // Función para cambiar modalidad de un arma
  const cambiarModalidad = async (armaId, nuevaModalidad) => {
    setActualizando(armaId);
    try {
      const armaRef = doc(db, 'socios', user.email.toLowerCase(), 'armas', armaId);
      await updateDoc(armaRef, { modalidad: nuevaModalidad });
      
      // Actualizar estado local
      setArmas(armas.map(a => 
        a.id === armaId ? { ...a, modalidad: nuevaModalidad } : a
      ));
    } catch (error) {
      console.error('Error actualizando modalidad:', error);
      alert('Error al actualizar la modalidad');
    } finally {
      setActualizando(null);
    }
  };

  const cargarArmas = async () => {
    try {
      const socioRef = doc(db, 'socios', user.email.toLowerCase());
      const armasRef = collection(socioRef, 'armas');
      const snapshot = await getDocs(armasRef);
      
      const armasData = [];
      
      for (const docSnap of snapshot.docs) {
        const armaData = {
          id: docSnap.id,
          ...docSnap.data()
        };
        
        armasData.push(armaData);
      }
      
      setArmas(armasData);
    } catch (error) {
      console.error('Error cargando armas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconoClase = (clase) => {
    const claseNorm = clase?.toUpperCase() || '';
    if (claseNorm.includes('PISTOLA')) return '•';
    if (claseNorm.includes('REVOLVER')) return '•';
    if (claseNorm.includes('RIFLE')) return '•';
    if (claseNorm.includes('ESCOPETA')) return '•';
    return '•';
  };

  const armasConDocumento = armas.filter(a => a.documentoRegistro).length;
  const progreso = armas.length > 0 ? Math.round((armasConDocumento / armas.length) * 100) : 0;

  if (loading) {
    return <div className="mis-armas-loading">Cargando tus armas...</div>;
  }

  return (
    <div className="mis-armas">
      <div className="mis-armas-header">
        <h2>Mis Armas Registradas</h2>
        <p className="mis-armas-subtitle">
          Información de tus armas registradas en SEDENA
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="progreso-armas">
        <div className="progreso-info">
          <span>Registros verificados: {armasConDocumento} de {armas.length}</span>
          <span className="progreso-porcentaje">{progreso}%</span>
        </div>
        <div className="progreso-barra">
          <div 
            className="progreso-fill" 
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Nota sobre subir registros */}
      <div className="nota-registros">
        <p>
          📄 Para subir los registros de tus armas, ve a{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'documentos-socio'; window.location.reload(); }}>
            <strong>Mi Expediente Digital</strong>
          </a>
          {' '}→ <strong>Armas y Permisos</strong>
        </p>
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
                
                {/* Modalidad del arma */}
                <div className="arma-modalidad">
                  <strong>Modalidad PETA:</strong>
                  {isSecretario ? (
                    <select 
                      value={arma.modalidad || ''}
                      onChange={(e) => cambiarModalidad(arma.id, e.target.value)}
                      disabled={actualizando === arma.id}
                      className={`modalidad-select ${arma.modalidad || 'sin-asignar'}`}
                    >
                      <option value="">Sin asignar</option>
                      <option value="caza">🦌 Caza</option>
                      <option value="tiro">🎯 Tiro</option>
                      <option value="ambas">✅ Ambas</option>
                    </select>
                  ) : (
                    <span className={`modalidad-badge ${arma.modalidad || 'sin-asignar'}`}>
                      {arma.modalidad === 'caza' && '🦌 Caza'}
                      {arma.modalidad === 'tiro' && '🎯 Tiro'}
                      {arma.modalidad === 'ambas' && '✅ Ambas'}
                      {!arma.modalidad && '⏳ Pendiente'}
                    </span>
                  )}
                </div>
              </div>

              <div className="arma-documento">
                {arma.documentoRegistro ? (
                  <div className="documento-ok">
                    <span className="check">✅</span>
                    <button 
                      onClick={async () => {
                        try {
                          // USAR armaId (UUID) para la ruta - es único e inmutable
                          const storageRef = ref(
                            storage, 
                            `documentos/${user.email.toLowerCase()}/armas/${arma.id}/registro.pdf`
                          );
                          
                          // Descargar el archivo como blob (con autenticación)
                          const blob = await getBlob(storageRef);
                          
                          // Crear URL temporal del blob
                          const blobUrl = URL.createObjectURL(blob);
                          
                          // Abrir en nueva pestaña
                          const win = window.open(blobUrl, '_blank');
                          
                          // Limpiar URL del blob después de 1 minuto
                          setTimeout(() => {
                            URL.revokeObjectURL(blobUrl);
                          }, 60000);
                          
                          if (!win) {
                            alert('Por favor permite las ventanas emergentes para ver el documento');
                          }
                        } catch (error) {
                          console.error('Error abriendo registro:', error);
                          alert('Error al abrir el documento. Verifica que el archivo exista.');
                        }
                      }}
                      className="ver-registro-btn"
                    >
                      Ver registro
                    </button>
                  </div>
                ) : (
                  <div className="documento-pendiente-info">
                    <span className="pendiente-icon">⏳</span>
                    <span className="pendiente-text">Registro pendiente</span>
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

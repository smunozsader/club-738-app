import { useState, useEffect } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import './MisArmas.css';

/**
 * MisArmas - Vista de solo lectura de las armas del socio
 * Los registros de armas se suben desde "Documentos PETA" con validación OCR
 */
export default function MisArmas({ user }) {
  const [armas, setArmas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarArmas();
  }, [user.email]);

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
        
        // Verificar si existe documento en Storage
        if (!armaData.documentoRegistro) {
          try {
            const storageRef = ref(
              storage, 
              `documentos/${user.email.toLowerCase()}/armas/${docSnap.id}/registro.pdf`
            );
            const url = await getDownloadURL(storageRef);
            armaData.documentoRegistro = url;
          } catch {
            // No existe el documento
          }
        }
        
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
          <strong>"Documentos PETA" → "Registros de Armas (RFA)"</strong>
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

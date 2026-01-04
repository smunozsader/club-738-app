import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './WelcomeDialog.css';

export default function WelcomeDialog({ user, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [socioData, setSocioData] = useState(null);

  useEffect(() => {
    checkFirstVisit();
  }, []);

  const checkFirstVisit = async () => {
    try {
      const socioRef = doc(db, 'socios', user.email.toLowerCase());
      const socioSnap = await getDoc(socioRef);
      
      if (socioSnap.exists()) {
        setSocioData(socioSnap.data());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const socioRef = doc(db, 'socios', user.email.toLowerCase());
      await setDoc(socioRef, {
        bienvenidaVista: true,
        fechaBienvenida: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error guardando bienvenida:', error);
      // Continuar aunque falle - no bloquear al usuario
    }
    // Siempre cerrar el diálogo, aunque falle el guardado
    onClose();
  };

  if (loading) {
    return (
      <div className="dialog-overlay">
        <div className="dialog-content">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const totalArmas = socioData?.totalArmas || 0;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        {step === 1 && (
          <>
            <div className="dialog-icon">👋</div>
            <h2>¡Bienvenido al Portal del Club 738!</h2>
            <p className="dialog-greeting">
              Hola <strong>{socioData?.nombre || user.email}</strong>
            </p>
            <p>
              Este portal te permitirá gestionar tus documentos para el 
              <strong> Permiso Extraordinario de Transportación de Armas (PETA)</strong>.
            </p>
            <button className="dialog-btn primary" onClick={() => setStep(2)}>
              Continuar →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="dialog-icon">📋</div>
            <h2>¿Qué es el PETA?</h2>
            <p>
              El PETA es el permiso que necesitas para transportar legalmente tus armas 
              desde tu domicilio hasta el club y viceversa.
            </p>
            <div className="info-box">
              <p><strong>Vigencia:</strong> 1 año</p>
              <p><strong>Emisor:</strong> SEDENA</p>
              <p><strong>Requisito:</strong> Documentos actualizados</p>
            </div>
            <div className="dialog-buttons">
              <button className="dialog-btn secondary" onClick={() => setStep(1)}>
                ← Atrás
              </button>
              <button className="dialog-btn primary" onClick={() => setStep(3)}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="dialog-icon">�</div>
            <h2>Tus Armas Registradas</h2>
            {totalArmas > 0 ? (
              <>
                <p className="armas-count">
                  Tienes <strong>{totalArmas} arma{totalArmas > 1 ? 's' : ''}</strong> registrada{totalArmas > 1 ? 's' : ''} en el club.
                </p>
                <p>
                  Para cada arma necesitas subir una copia digital (PDF) de su 
                  <strong> Registro SEDENA</strong>.
                </p>
              </>
            ) : (
              <p className="no-armas">
                No tienes armas registradas aún. Si crees que esto es un error, 
                contacta al administrador del club.
              </p>
            )}
            <div className="dialog-buttons">
              <button className="dialog-btn secondary" onClick={() => setStep(2)}>
                ← Atrás
              </button>
              <button className="dialog-btn primary" onClick={() => setStep(4)}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="dialog-icon">📄</div>
            <h2>Documentos Requeridos</h2>
            <div className="docs-list">
              <div className="doc-item">✅ INE vigente (ambos lados)</div>
              <div className="doc-item">✅ Comprobante de domicilio reciente</div>
              <div className="doc-item">✅ Constancia de no antecedentes penales</div>
              <div className="doc-item">✅ Registro SEDENA de cada arma</div>
              <div className="doc-item">✅ 2 fotografías tamaño infantil</div>
              <div className="doc-item">✅ Licencia de caza vigente</div>
            </div>
            <div className="dialog-buttons">
              <button className="dialog-btn secondary" onClick={() => setStep(3)}>
                ← Atrás
              </button>
              <button className="dialog-btn primary" onClick={() => setStep(5)}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="dialog-icon">🚀</div>
            <h2>¡Listo para comenzar!</h2>
            <p>
              En la siguiente pantalla verás tus armas registradas. 
              Sube el registro SEDENA de cada una para completar tu expediente.
            </p>
            <div className="checklist">
              <p>📌 <strong>Tip:</strong> Ten a la mano los PDFs de tus registros SEDENA</p>
            </div>
            <button className="dialog-btn primary large" onClick={handleComplete}>
              Ir a Mis Armas →
            </button>
          </>
        )}

        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={`step-dot ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

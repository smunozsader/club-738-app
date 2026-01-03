import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import Login from './components/Login';
import DocumentList from './components/documents/DocumentList';
import MisArmas from './components/MisArmas';
import MisDocumentosOficiales from './components/MisDocumentosOficiales';
import WelcomeDialog from './components/WelcomeDialog';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [documentosData, setDocumentosData] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [socioData, setSocioData] = useState(null);

  useEffect(() => {
    // Escuchar cambios en autenticación
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Escuchar cambios en documentos del usuario
  useEffect(() => {
    if (!user) return;

    const socioRef = doc(db, 'socios', user.email.toLowerCase());
    const unsubscribe = onSnapshot(socioRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSocioData(data);
        setDocumentosData(data.documentosPETA || {});
        
        // Mostrar bienvenida si es primera vez
        if (!data.bienvenidaVista) {
          setShowWelcome(true);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveSection('dashboard');
  };

  const handleUploadComplete = (docType, url) => {
    // El estado se actualiza automáticamente via onSnapshot
    console.log(`Documento ${docType} subido: ${url}`);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="app-container">
      {/* Dialog de bienvenida */}
      {showWelcome && (
        <WelcomeDialog 
          user={user} 
          onClose={() => {
            setShowWelcome(false);
            setActiveSection('armas');
          }} 
        />
      )}
      
      <header>
        <div className="header-brand">
          <img src="/logo.jpg" alt="Logo Club 738" className="header-logo" />
          <div className="header-titles">
            <h1>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
            <span className="header-subtitle">SEDENA: 738 | FEMETI: YUC 05/2020 | SEMARNAT: CIN-005-YUC-05</span>
          </div>
        </div>
        <div className="user-info">
          <span>Hola, {user.email}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <main>
        {activeSection === 'dashboard' && (
          <div className="dashboard">
            <h2>Bienvenido al Portal del Club 738</h2>
            <p>Aquí podrás gestionar tus documentos para el PETA.</p>
            
            <div className="features">
              <div className="feature-card" onClick={() => setActiveSection('docs-oficiales')}>
                <h3>🆔 Documentos Oficiales</h3>
                <p>Descarga tu CURP y Constancia de antecedentes</p>
              </div>
              <div className="feature-card" onClick={() => setActiveSection('documentos')}>
                <h3>📄 Mis Documentos PETA</h3>
                <p>Sube y gestiona tus documentos para el PETA</p>
              </div>
              <div className="feature-card">
                <h3>🎫 Mi Credencial</h3>
                <p>Descarga tu credencial del Club</p>
              </div>
              <div className="feature-card" onClick={() => setActiveSection('armas')}>
                <h3>🔫 Mis Armas</h3>
                <p>Consulta tus armas registradas y sube documentos</p>
                {socioData?.totalArmas > 0 && (
                  <span className="feature-badge">{socioData.totalArmas} armas</span>
                )}
              </div>
              <div className="feature-card">
                <h3>💳 Pagos</h3>
                <p>Verifica tu estado de pago anual</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'documentos' && (
          <div className="section-documentos">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <DocumentList 
              userId={user.uid}
              documentosData={documentosData}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {activeSection === 'docs-oficiales' && (
          <div className="section-docs-oficiales">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <MisDocumentosOficiales user={user} socioData={socioData} />
          </div>
        )}

        {activeSection === 'armas' && (
          <div className="section-armas">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <MisArmas user={user} />
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-social">
            <a href="https://www.facebook.com/profile.php?id=61554753867361" target="_blank" rel="noopener noreferrer" title="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/tiro_practico_yucatan/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://maps.app.goo.gl/xUfQggW8jAG7gtC19" target="_blank" rel="noopener noreferrer" title="Ubicación del Campo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.403 16.199 0 12 0zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
            </a>
            <a href="https://www.femeti.org.mx/" target="_blank" rel="noopener noreferrer" title="FEMETI">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </a>
          </div>
          <p>© 2026 Club de Caza, Tiro y Pesca de Yucatán, A.C. - Todos los derechos reservados</p>
          <p className="footer-registros">Afiliado a FEMETI | Registro SEMARNAT-CLUB-CIN-005-YUC-05</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

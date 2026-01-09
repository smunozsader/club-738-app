import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, getDocs, query, where, collectionGroup } from 'firebase/firestore';
import LandingPage from './components/LandingPage';
import DocumentList from './components/documents/DocumentList';
import MisArmas from './components/MisArmas';
import MisDocumentosOficiales from './components/MisDocumentosOficiales';
import WelcomeDialog from './components/WelcomeDialog';
import AvisoPrivacidad from './components/privacidad/AvisoPrivacidad';
import DashboardRenovaciones from './components/DashboardRenovaciones';
import DashboardCumpleanos from './components/DashboardCumpleanos';
import GeneradorPETA from './components/GeneradorPETA';
import CalculadoraPCP from './components/CalculadoraPCP';
import CalendarioTiradas from './components/CalendarioTiradas';
import SolicitarPETA from './components/SolicitarPETA';
import MisPETAs from './components/MisPETAs';
import VerificadorPETA from './components/VerificadorPETA';
import ExpedienteImpresor from './components/ExpedienteImpresor';
import RegistroPagos from './components/RegistroPagos';
import ReporteCaja from './components/ReporteCaja';
import MiPerfil from './components/MiPerfil';
import './App.css';

// Detectar rutas públicas (sin necesidad de login)
const isCalculadoraRoute = () => {
  return window.location.pathname === '/calculadora' || 
         window.location.hash === '#/calculadora';
};

const isCalendarioRoute = () => {
  return window.location.pathname === '/calendario' || 
         window.location.hash === '#/calendario' ||
         window.location.pathname === '/tiradas' ||
         window.location.hash === '#/tiradas';
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [documentosData, setDocumentosData] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [socioData, setSocioData] = useState(null);
  
  // Para el secretario: ver documentos de otro socio
  const [socioViendoDocumentos, setSocioViendoDocumentos] = useState(null);
  
  // Contador de PETAs pendientes (solo secretario)
  const [petasPendientes, setPetasPendientes] = useState(0);
  
  // Modal de estado de pagos
  const [showPagosModal, setShowPagosModal] = useState(false);

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

  // Cargar contador de PETAs pendientes (solo secretario)
  useEffect(() => {
    if (!user || user.email !== 'smunozam@gmail.com') return;
    
    const cargarPetasPendientes = async () => {
      try {
        // Obtener todos los socios y sus PETAs
        const sociosRef = collection(db, 'socios');
        const sociosSnap = await getDocs(sociosRef);
        
        let pendientes = 0;
        for (const socioDoc of sociosSnap.docs) {
          const petasRef = collection(db, 'socios', socioDoc.id, 'petas');
          const petasSnap = await getDocs(petasRef);
          
          petasSnap.docs.forEach(petaDoc => {
            const estado = petaDoc.data().estado;
            // Contar PETAs en estados que requieren acción del secretario
            if (estado === 'documentacion_proceso' || estado === 'documentacion_completa') {
              pendientes++;
            }
          });
        }
        
        setPetasPendientes(pendientes);
      } catch (error) {
        console.error('Error cargando PETAs pendientes:', error);
      }
    };
    
    cargarPetasPendientes();
    // Refrescar cada 5 minutos
    const interval = setInterval(cargarPetasPendientes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveSection('dashboard');
    setSocioViendoDocumentos(null);
  };

  const handleUploadComplete = (docType, url) => {
    // El estado se actualiza automáticamente via onSnapshot
    console.log(`Documento ${docType} subido: ${url}`);
  };

  // Handler para que el secretario vea documentos de otro socio
  const handleVerDocumentosSocio = (email, nombre) => {
    setSocioViendoDocumentos({ email, nombre });
    setActiveSection('documentos-socio');
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Ruta pública: Calculadora PCP (sin necesidad de login)
  if (isCalculadoraRoute()) {
    return <CalculadoraPCP />;
  }

  // Ruta pública: Calendario de Tiradas (sin necesidad de login)
  if (isCalendarioRoute()) {
    return <CalendarioTiradas />;
  }

  if (!user) {
    return <LandingPage />;
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
      
      {/* Modal Estado de Pagos */}
      {showPagosModal && (
        <div className="modal-overlay" onClick={() => setShowPagosModal(false)}>
          <div className="modal-pagos" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPagosModal(false)}>×</button>
            <h2>💳 Estado de Pagos 2026</h2>
            
            <div className={`pago-status ${socioData?.renovacion2026?.estado === 'pagado' ? 'pagado' : 'pendiente'}`}>
              {socioData?.renovacion2026?.estado === 'pagado' ? (
                <>
                  <span className="status-icon">✅</span>
                  <span className="status-text">Membresía al corriente</span>
                </>
              ) : (
                <>
                  <span className="status-icon">⏳</span>
                  <span className="status-text">Pago pendiente</span>
                </>
              )}
            </div>
            
            {socioData?.renovacion2026?.estado === 'pagado' ? (
              <div className="pago-detalles">
                <div className="pago-row">
                  <span className="pago-label">Cuota Club:</span>
                  <span className="pago-valor">${socioData?.renovacion2026?.cuotaClub?.toLocaleString() || '6,000'} MXN</span>
                </div>
                <div className="pago-row">
                  <span className="pago-label">Cuota FEMETI:</span>
                  <span className="pago-valor">${socioData?.renovacion2026?.cuotaFemeti?.toLocaleString() || '350'} MXN</span>
                </div>
                <div className="pago-row total">
                  <span className="pago-label">Total pagado:</span>
                  <span className="pago-valor">
                    ${((socioData?.renovacion2026?.cuotaClub || 0) + (socioData?.renovacion2026?.cuotaFemeti || 0)).toLocaleString()} MXN
                  </span>
                </div>
                <div className="pago-row">
                  <span className="pago-label">Fecha de pago:</span>
                  <span className="pago-valor">
                    {socioData?.renovacion2026?.fechaPago?.toDate?.()?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) || 'No registrada'}
                  </span>
                </div>
                <div className="pago-row">
                  <span className="pago-label">Método:</span>
                  <span className="pago-valor">{socioData?.renovacion2026?.metodoPago || 'No especificado'}</span>
                </div>
              </div>
            ) : (
              <div className="pago-pendiente-info">
                <p>Tu membresía 2026 está pendiente de pago.</p>
                <div className="pago-instrucciones">
                  <h4>Para realizar tu pago:</h4>
                  <ol>
                    <li>Agenda una cita con el Secretario</li>
                    <li>Trae tus documentos originales</li>
                    <li>Realiza el pago de tu cuota anual + FEMETI</li>
                  </ol>
                </div>
                <a 
                  href="https://wa.me/525665824667" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-agendar-pago"
                >
                  📱 Agendar cita por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-brand">
          <a href="/" onClick={(e) => { e.preventDefault(); setActiveSection('principal'); }} className="logo-home-link">
            <img src="/assets/logo-club-738.jpg" alt="Club 738" className="header-logo" />
          </a>
          <div className="header-titles">
            <h1>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
            <div className="header-badges">
              <span className="badge">SEDENA 738</span>
              <span className="badge">FEMETI YUC 05/2020</span>
              <span className="badge">SEMARNAT-CLUB-CIN-005-YUC-05</span>
            </div>
          </div>
        </div>
        <div className="user-info">
          <span className="user-email">{socioData?.nombre || user.email}</span>
          <button onClick={() => setActiveSection('mi-perfil')} className="btn-perfil">⚙️ Mi Perfil</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <main>
        {activeSection === 'dashboard' && (
          <div className="dashboard-container">
            <div className="dashboard-welcome">
              <h2>Portal del Socio</h2>
              <p>Gestiona tu expediente digital para trámites PETA</p>
            </div>
            
            <div className="dashboard-grid">
              {/* Mi Expediente */}
              <div className="dash-card expediente" onClick={() => setActiveSection('docs-oficiales')}>
                <div className="dash-card-icon">🆔</div>
                <h3>Documentos Oficiales</h3>
                <p>Descarga tu CURP y Constancia de antecedentes penales</p>
                <span className="dash-card-cta">Ver documentos →</span>
              </div>
              
              <div className="dash-card documentos" onClick={() => setActiveSection('documentos')}>
                <div className="dash-card-icon">�</div>
                <h3>Mi Expediente Digital</h3>
                <p>Documentos para facilitar tu trámite PETA</p>
                <span className="dash-card-cta">Ver expediente →</span>
              </div>
              
              <div className="dash-card armas" onClick={() => setActiveSection('armas')}>
                <div className="dash-card-icon">📄</div>
                <h3>Mis Armas</h3>
                <p>Consulta tus armas registradas en SEDENA</p>
                {socioData?.totalArmas > 0 && (
                  <span className="dash-card-badge">{socioData.totalArmas} armas</span>
                )}
                <span className="dash-card-cta">Ver armas →</span>
              </div>
              
              <div className="dash-card petas" onClick={() => setActiveSection('mis-petas')}>
                <div className="dash-card-icon">🎯</div>
                <h3>Mis PETAs</h3>
                <p>Solicita y gestiona tus permisos de transporte</p>
                <span className="dash-card-cta">Ver solicitudes →</span>
              </div>
              
              <div className="dash-card perfil" onClick={() => setActiveSection('mi-perfil')}>
                <div className="dash-card-icon">⚙️</div>
                <h3>Mi Perfil</h3>
                <p>Cambia tu contraseña y configuración de cuenta</p>
                <span className="dash-card-cta">Configurar →</span>
              </div>
              
              <div className="dash-card pagos" onClick={() => setShowPagosModal(true)}>
                <div className="dash-card-icon">💳</div>
                <h3>Estado de Pagos</h3>
                <p>Tu membresía 2026</p>
                {socioData?.renovacion2026?.estado === 'pagado' ? (
                  <span className="dash-card-badge pagado">✅ Al corriente</span>
                ) : (
                  <span className="dash-card-badge pendiente">⏳ Pendiente</span>
                )}
                <span className="dash-card-cta">Ver detalles →</span>
              </div>
            </div>
            
            {/* Sección Herramientas */}
            <div className="dashboard-section">
              <h3 className="section-title">Herramientas</h3>
              <div className="dashboard-grid tools-grid">
                <div className="dash-card calendario" onClick={() => window.location.href = '/calendario'}>
                  <div className="dash-card-icon">📅</div>
                  <h3>Calendario de Tiradas</h3>
                  <p>Competencias 2026 del Club y región Sureste</p>
                  <span className="dash-card-cta">Ver calendario →</span>
                </div>
                
                <div className="dash-card calculadora" onClick={() => window.location.href = '/calculadora'}>
                  <div className="dash-card-icon">🔢</div>
                  <h3>Calculadora PCP</h3>
                  <p>Verifica si tu rifle de aire requiere registro</p>
                  <span className="dash-card-cta">Calcular →</span>
                </div>
              </div>
            </div>
            
            {/* Panel Secretario */}
            {user.email === 'smunozam@gmail.com' && (
              <div className="dashboard-section admin-section">
                <h3 className="section-title">Panel de Secretario</h3>
                <div className="dashboard-grid admin-grid">
                  <div className="dash-card admin" onClick={() => setActiveSection('renovaciones')}>
                    <div className="dash-card-icon">📊</div>
                    <h3>Panel de Cobranza</h3>
                    <p>Dashboard de renovaciones 2026</p>
                    <span className="dash-card-cta">Abrir panel →</span>
                  </div>
                  
                  <div className="dash-card admin cumples" onClick={() => setActiveSection('cumpleanos')}>
                    <div className="dash-card-icon">🎂</div>
                    <h3>Cumpleaños</h3>
                    <p>Calendario y demografía de socios</p>
                    <span className="dash-card-cta">Ver cumpleaños →</span>
                  </div>
                  
                  <div className="dash-card admin peta" onClick={() => setActiveSection('generador-peta')}>
                    <div className="dash-card-icon">📄</div>
                    <h3>Generar PETA</h3>
                    <p>Oficios de solicitud PETA</p>
                    <span className="dash-card-cta">Generar oficio →</span>
                  </div>
                  
                  <div className="dash-card admin verificador" onClick={() => setActiveSection('verificador-peta')}>
                    <div className="dash-card-icon">✅</div>
                    <h3>Verificador PETA</h3>
                    <p>Checklist de documentación</p>
                    {petasPendientes > 0 && (
                      <span className="dash-card-badge alert">{petasPendientes} pendientes</span>
                    )}
                    <span className="dash-card-cta">Verificar solicitudes →</span>
                  </div>
                  
                  <div className="dash-card admin imprimir" onClick={() => setActiveSection('expediente-impresor')}>
                    <div className="dash-card-icon">🖨️</div>
                    <h3>Expediente Digital</h3>
                    <p>Verificar e imprimir documentos</p>
                    <span className="dash-card-cta">Preparar impresión →</span>
                  </div>
                  
                  <div className="dash-card admin pagos" onClick={() => setActiveSection('registro-pagos')}>
                    <div className="dash-card-icon">💰</div>
                    <h3>Registro de Pagos</h3>
                    <p>Cobranza y activación de membresías</p>
                    <span className="dash-card-cta">Registrar pagos →</span>
                  </div>
                  
                  <div className="dash-card admin reporte" onClick={() => setActiveSection('reporte-caja')}>
                    <div className="dash-card-icon">📊</div>
                    <h3>Corte de Caja</h3>
                    <p>Reporte de pagos recibidos</p>
                    <span className="dash-card-cta">Ver reporte →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'documentos' && (
          <div className="section-documentos">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <DocumentList 
              userId={user.email.toLowerCase()}
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

        {activeSection === 'mis-petas' && (
          <div className="section-mis-petas">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <MisPETAs 
              userEmail={user.email}
              onNuevoPETA={() => setActiveSection('solicitar-peta')}
              onBack={() => setActiveSection('dashboard')}
            />
          </div>
        )}

        {activeSection === 'mi-perfil' && (
          <div className="section-mi-perfil">
            <MiPerfil user={user} onBack={() => setActiveSection('dashboard')} />
          </div>
        )}

        {activeSection === 'solicitar-peta' && (
          <div className="section-solicitar-peta">
            <button className="btn-back" onClick={() => setActiveSection('mis-petas')}>
              ← Volver a Mis PETAs
            </button>
            <SolicitarPETA 
              userEmail={user.email}
              onBack={() => setActiveSection('mis-petas')}
            />
          </div>
        )}

        {activeSection === 'privacidad' && (
          <div className="section-privacidad">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <AvisoPrivacidad />
          </div>
        )}

        {activeSection === 'renovaciones' && user.email === 'smunozam@gmail.com' && (
          <div className="section-renovaciones">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <DashboardRenovaciones 
              userEmail={user.email} 
              onVerDocumentos={handleVerDocumentosSocio}
            />
          </div>
        )}

        {activeSection === 'cumpleanos' && user.email === 'smunozam@gmail.com' && (
          <div className="section-cumpleanos">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <DashboardCumpleanos userEmail={user.email} />
          </div>
        )}

        {activeSection === 'generador-peta' && user.email === 'smunozam@gmail.com' && (
          <div className="section-generador-peta">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <GeneradorPETA userEmail={user.email} />
          </div>
        )}

        {activeSection === 'verificador-peta' && user.email === 'smunozam@gmail.com' && (
          <div className="section-verificador-peta">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <VerificadorPETA userEmail={user.email} onBack={() => setActiveSection('dashboard')} />
          </div>
        )}

        {activeSection === 'expediente-impresor' && user.email === 'smunozam@gmail.com' && (
          <div className="section-expediente-impresor">
            <ExpedienteImpresor userEmail={user.email} onBack={() => setActiveSection('dashboard')} />
          </div>
        )}

        {activeSection === 'registro-pagos' && user.email === 'smunozam@gmail.com' && (
          <div className="section-registro-pagos">
            <button className="btn-back" onClick={() => setActiveSection('dashboard')}>
              ← Volver al Dashboard
            </button>
            <RegistroPagos userEmail={user.email} onBack={() => setActiveSection('dashboard')} />
          </div>
        )}

        {activeSection === 'reporte-caja' && user.email === 'smunozam@gmail.com' && (
          <div className="section-reporte-caja">
            <ReporteCaja userEmail={user.email} onBack={() => setActiveSection('dashboard')} />
          </div>
        )}

        {/* Sección para que el secretario vea documentos de otro socio */}
        {activeSection === 'documentos-socio' && user.email === 'smunozam@gmail.com' && socioViendoDocumentos && (
          <div className="section-documentos-socio">
            <button className="btn-back" onClick={() => {
              setSocioViendoDocumentos(null);
              setActiveSection('renovaciones');
            }}>
              ← Volver al Panel de Cobranza
            </button>
            <div className="socio-header-info">
              <h3>📁 Documentos de: {socioViendoDocumentos.nombre}</h3>
              <p className="socio-email">{socioViendoDocumentos.email}</p>
            </div>
            <DocumentList 
              userId={socioViendoDocumentos.email.toLowerCase()}
              documentosData={{}}
              onUploadComplete={handleUploadComplete}
              isSecretarioView={true}
            />
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
          <p className="footer-legal">
            <button className="link-privacidad" onClick={() => setActiveSection('privacidad')}>
              📋 Aviso de Privacidad
            </button>
            {' | '}
            <button className="link-privacidad" onClick={() => setActiveSection('privacidad')}>
              ⚖️ Derechos ARCO
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

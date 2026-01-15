import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './LandingPage.css';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequisitos, setShowRequisitos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Capturar evento de instalación PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Ocultar botón si ya está instalado
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ PWA instalada');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <a href="/" className="logo-home-link">
              <img src="/assets/logo-club-738.jpg" alt="Club de Caza, Tiro y Pesca de Yucatán" className="logo-img" />
            </a>
            <div>
              <h1>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge">SEDENA 738</span>
            <span className="badge">FEMETI YUC 05/2020</span>
            <span className="badge">SEMARNAT-CLUB-CIN-005-YUC-05</span>
            {showInstallButton && (
              <button onClick={handleInstallClick} className="install-button" title="Instalar aplicación">
                📲 Instalar App
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tarjetas principales */}
      <section className="cards-section">
        <a href="/calendario" className="feature-card calendario-card">
          <div className="card-icon">📅</div>
          <h3>Calendario de Tiradas</h3>
          <p>Consulta todas las competencias 2026 del Club 738 y la región Sureste</p>
          <span className="card-cta">Ver calendario →</span>
        </a>

        <a href="/calculadora" className="feature-card calculadora-card">
          <div className="card-icon">🔢</div>
          <h3>Calculadora PCP</h3>
          <p>Calcula la energía cinética de tu rifle de aire y verifica el límite legal</p>
          <span className="card-cta">Calcular →</span>
        </a>

        <div className="feature-card requisitos-card" onClick={() => setShowRequisitos(true)}>
          <div className="card-icon">📋</div>
          <h3>Hazte Socio</h3>
          <p>Conoce los requisitos y cuotas para formar parte del Club 738</p>
          <span className="card-cta">Ver requisitos →</span>
        </div>
      </section>

      {/* Enlaces SEDENA */}
      <section className="sedena-links-section">
        <h2>🏛️ Enlaces Útiles SEDENA</h2>
        <p className="sedena-subtitle">Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos</p>
        <div className="sedena-links-grid">
          <a 
            href="https://www.gob.mx/cms/uploads/attachment/file/1045710/42-HOJA_DE_AYUDA_DEFENSA-02-045.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sedena-link-card"
          >
            <div className="sedena-icon">📄</div>
            <h3>Pago PETA (hasta 3 armas)</h3>
            <p>Hoja de ayuda e5cinco para permiso de transportación de armas</p>
            <span className="sedena-cta">Descargar PDF →</span>
          </a>
          
          <a 
            href="https://www.gob.mx/cms/uploads/attachment/file/1045714/43-HOJA_DE_AYUDA_DEFENSA-02-046_POR_CADA_ARMA_ADICIONAL.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sedena-link-card"
          >
            <div className="sedena-icon">➕</div>
            <h3>Pago por Arma Adicional</h3>
            <p>Hoja de ayuda e5cinco por cada arma adicional a las 3 primeras</p>
            <span className="sedena-cta">Descargar PDF →</span>
          </a>
          
          <a 
            href="https://www.gob.mx/defensa/acciones-y-programas/formatos-de-pagos-e5-del-2023?state=published" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sedena-link-card"
          >
            <div className="sedena-icon">💰</div>
            <h3>Todos los Formatos e5cinco</h3>
            <p>Catálogo completo de hojas de ayuda para pago de derechos</p>
            <span className="sedena-cta">Ver catálogo →</span>
          </a>
          
          <a 
            href="https://www.gob.mx/defensa/acciones-y-programas/comercializacion-de-armas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sedena-link-card"
          >
            <div className="sedena-icon">🏪</div>
            <h3>Comercialización de Armas</h3>
            <p>DCAM - Compra de armas y municiones autorizadas</p>
            <span className="sedena-cta">Ver información →</span>
          </a>
        </div>
      </section>

      {/* Portal de Socios - Login */}
      <section className="login-section">
        <div className="login-card">
          <div className="login-header">
            <span className="login-icon">🔐</span>
            <h3>Portal de Socios</h3>
          </div>
          <p className="login-description">
            Accede a tu expediente digital, documentos PETA, registro de armas y estado de cuenta
          </p>
          
          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="login-error">{error}</div>}
            
            <div className="form-row">
              <input
                id="landing-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                id="landing-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </form>
          
          <p className="login-help">
            ¿Problemas para acceder? Contacta al secretario del club
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h4>📍 Ubicación</h4>
            <p>Calle 50 No. 531-E x 69 y 71</p>
            <p>Col. Centro, 97000 Mérida, Yucatán</p>
            <a 
              href="https://maps.app.goo.gl/AcpqoDN9wN8g8r1Q6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="map-link"
            >
              Ver en Google Maps
            </a>
          </div>
          <div className="footer-info">
            <h4>📞 Contacto</h4>
            <a 
              href="https://wa.me/525665824667" 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +52 56 6582 4667
            </a>
            <a href="mailto:tiropracticoyucatan@gmail.com" className="email-link">tiropracticoyucatan@gmail.com</a>
          </div>
          <div className="footer-info">
            <h4>📜 Registros Oficiales</h4>
            <p>SEDENA: 738</p>
            <p>FEMETI: YUC-05/2020</p>
            <p>SEMARNAT: CLUB-CIN-005-YUC-05</p>
          </div>
        </div>
        <div className="footer-social">
          <a href="https://www.facebook.com/profile.php?id=61554753867361" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/tiro_practico_yucatan/" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://maps.app.goo.gl/xUfQggW8jAG7gtC19" target="_blank" rel="noopener noreferrer" title="Campo de Tiro">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.403 16.199 0 12 0zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
          </a>
          <a href="https://www.femeti.org.mx/" target="_blank" rel="noopener noreferrer" title="FEMETI">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </a>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Club de Caza, Tiro y Pesca de Yucatán, A.C. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modal de Requisitos */}
      {showRequisitos && (
        <div className="modal-overlay" onClick={() => setShowRequisitos(false)}>
          <div className="modal-requisitos" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRequisitos(false)}>×</button>
            
            <h2>📋 Requisitos para Hacerse Socio</h2>
            
            <div className="requisitos-content">
              <div className="requisitos-section">
                <h3>📄 Documentación Requerida</h3>
                <ul>
                  <li>Solicitud en formato del club (se proporciona)</li>
                  <li>Compromiso Art. 80 Ley de Armas (se proporciona)</li>
                  <li>Acta de Nacimiento (2 copias)</li>
                  <li>Cartilla Militar liberada (2 copias)</li>
                  <li>Registro Federal de Armas - RFA (2 copias por arma)</li>
                  <li>4 Fotografías color tamaño infantil</li>
                  <li>CURP (2 copias)</li>
                  <li>RFC (2 copias)</li>
                  <li>INE vigente (2 copias)</li>
                  <li>Comprobante de domicilio (2 copias)</li>
                  <li>Licencia de Caza SEMARNAT vigente (2 copias)</li>
                  <li>Constancia Modo Honesto de Vivir (original + copia) - Se proporciona formato</li>
                  <li>Constancia de Antecedentes Penales Federales (original + copia) - <a href="https://constancias.oadprs.gob.mx/" target="_blank" rel="noopener noreferrer">Tramitar aquí</a></li>
                  <li>Certificado Médico (original + copia)</li>
                  <li>Certificado Toxicológico (original + copia)</li>
                  <li>Certificado Psicológico (original + copia)</li>
                </ul>
              </div>
              
              <div className="requisitos-section">
                <h3>💰 Cuotas y Costos</h3>
                <p className="contacto-cuotas">
                  Para información sobre cuotas de inscripción y anualidad, contáctanos por 
                  <a href="https://wa.me/525665824667" target="_blank" rel="noopener noreferrer"> WhatsApp</a> o 
                  escríbenos a <a href="mailto:tiropracticoyucatan@gmail.com">tiropracticoyucatan@gmail.com</a>
                </p>
              </div>
              
              <div className="requisitos-section">
                <h3>✅ Incluye</h3>
                <ul>
                  <li>1 trámite de permiso de transportación (PETA)</li>
                  <li>Acceso al campo de tiro</li>
                  <li>Participación en tiradas del club</li>
                </ul>
              </div>
              
              <div className="requisitos-section">
                <h3>⚠️ Notas Importantes</h3>
                <ul>
                  <li>NO incluye pago de derechos (forma e5cinco)</li>
                  <li>NO incluye costos de mensajería</li>
                  <li>Trámite personal, no enviar intermediarios</li>
                </ul>
              </div>
              
              <div className="requisitos-contacto">
                <p>¿Interesado? Contáctanos:</p>
                <a 
                  href="https://wa.me/525665824667" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp: +52 56 6582 4667
                </a>
                <a href="mailto:tiropracticoyucatan@gmail.com" className="email-link modal-email">
                  ✉️ tiropracticoyucatan@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

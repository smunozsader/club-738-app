import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './LandingPage.css';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequisitos, setShowRequisitos] = useState(false);

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
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
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
                <h3>💰 Cuotas 2026</h3>
                <table className="cuotas-table">
                  <tbody>
                    <tr>
                      <td>Inscripción</td>
                      <td className="monto">$2,000.00 MXN</td>
                    </tr>
                    <tr>
                      <td>Cuota Anual</td>
                      <td className="monto">$6,000.00 MXN</td>
                    </tr>
                    <tr>
                      <td>FEMETI primer ingreso</td>
                      <td className="monto">$700.00 MXN</td>
                    </tr>
                    <tr>
                      <td>FEMETI socios</td>
                      <td className="monto">$350.00 MXN</td>
                    </tr>
                  </tbody>
                </table>
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

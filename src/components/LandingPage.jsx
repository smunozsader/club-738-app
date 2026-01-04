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
            <img src="/assets/logo-club-738.jpg" alt="Club de Caza, Tiro y Pesca de Yucatán" className="logo-img" />
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
            <p>Tel: +52 56 6582 4667</p>
            <p>Email: tiropracticoyucatan@gmail.com</p>
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
                  <li>Solicitud en formato libre</li>
                  <li>Compromiso Art. 80 Ley de Armas</li>
                  <li>Acta de Nacimiento (2 copias)</li>
                  <li>Cartilla Militar liberada (2 copias)</li>
                  <li>Registro Federal de Armas - RFA (2 copias por arma)</li>
                  <li>4 Fotografías color tamaño infantil</li>
                  <li>CURP (2 copias)</li>
                  <li>RFC (2 copias)</li>
                  <li>INE vigente (2 copias)</li>
                  <li>Comprobante de domicilio (2 copias)</li>
                  <li>Licencia de Caza SEMARNAT vigente (2 copias)</li>
                  <li>Constancia Modo Honesto de Vivir (original + copia)</li>
                  <li>Constancia de No Antecedentes Penales (original + copia)</li>
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
                  <li>NO se acepta documentación digitalizada</li>
                  <li>Trámite personal, no enviar intermediarios</li>
                </ul>
              </div>
              
              <div className="requisitos-contacto">
                <p>¿Interesado? Contáctanos:</p>
                <p><strong>📞 +52 56 6582 4667</strong></p>
                <p><strong>✉️ tiropracticoyucatan@gmail.com</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import ThemeToggle from './ThemeToggle';
import './CalculadoraPCP.css';

// Datos de calibres organizados por categoría
const CALIBRES = {
  pequenos: {
    titulo: '🎯 Calibres Pequeños - Tiro Deportivo & Control de Plagas',
    descripcion: 'Ideales para competencia y entrenamiento',
    items: [
      { id: '177', nombre: '0.177" Cal. (4.5mm)', pesoTipico: 8.2, uso: '🎯 Olímpico', descripcion: 'Competencia olímpica, plinking' },
      { id: '20', nombre: '0.20" Cal. (5.0mm)', pesoTipico: 11.4, uso: '🎯 Precisión', descripcion: 'Tiro deportivo de precisión' },
      { id: '22', nombre: '0.22" Cal. (5.5mm)', pesoTipico: 14.3, uso: '🏹 Caza menor', descripcion: 'El más versátil, caza menor responsable' },
    ]
  },
  medianos: {
    titulo: '🏹 Calibres Medianos - Caza Responsable & Tiro a Distancia',
    descripcion: 'Mayor energía de impacto, excelentes para caza ética',
    items: [
      { id: '25', nombre: '0.25" Cal. (6.35mm)', pesoTipico: 25.4, uso: '🏹 Caza mediana', descripcion: 'Excelente para caza mediana' },
      { id: '30', nombre: '0.30" Cal. (7.62mm)', pesoTipico: 44.8, uso: '🦌 Caza mayor', descripcion: 'Caza mayor, largo alcance' },
    ]
  },
  grandes: {
    titulo: '🦌 Calibres Grandes - Caza Mayor & Big Bore',
    descripcion: '⚠️ Alta potencia - Mayor probabilidad de requerir registro',
    items: [
      { id: '357', nombre: '0.357" Cal. (9.07mm)', pesoTipico: 81.0, uso: '🦌 Big Game', descripcion: 'Caza mayor, jabalí' },
      { id: '45', nombre: '0.45" Cal. (11.43mm)', pesoTipico: 143.0, uso: '⚠️ Big Bore', descripcion: 'Caza extrema - Alta potencia' },
      { id: '50', nombre: '0.50" Cal. (12.7mm)', pesoTipico: 178.0, uso: '⚠️ Big Bore', descripcion: 'Máxima potencia - Caza extrema' },
    ]
  }
};

const LIMITE_JOULES = 140;

function CalculadoraPCP() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [peso, setPeso] = useState('');
  const [velocidad, setVelocidad] = useState('');
  const [resultado, setResultado] = useState(null);
  const [calibreSeleccionado, setCalibreSeleccionado] = useState(null);
  const [error, setError] = useState('');

  // Calcular energía cinética: E = 0.5 * m * v²
  const calcularEnergia = (masaGranos, velocidadFps) => {
    const masaKg = masaGranos * 0.0000647989; // granos a kg
    const velocidadMs = velocidadFps * 0.3048; // fps a m/s
    return 0.5 * masaKg * Math.pow(velocidadMs, 2);
  };

  // Calcular velocidad límite para un peso dado
  const calcularVelocidadLimite = (masaGranos) => {
    const masaKg = masaGranos * 0.0000647989;
    const velocidadMs = Math.sqrt((2 * LIMITE_JOULES) / masaKg);
    return velocidadMs / 0.3048; // m/s a fps
  };

  const handleSeleccionarCalibre = (calibre) => {
    setCalibreSeleccionado(calibre);
    setPeso(calibre.pesoTipico.toString());
    setResultado(null);
    setError('');
  };

  const limpiarSeleccion = () => {
    setCalibreSeleccionado(null);
    setPeso('');
    setVelocidad('');
    setResultado(null);
    setError('');
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    setError('');

    const pesoNum = parseFloat(peso);
    const velocidadNum = parseFloat(velocidad);

    if (!pesoNum || pesoNum <= 0) {
      setError('Ingresa un peso válido (mayor a 0)');
      return;
    }

    if (!velocidadNum || velocidadNum <= 0) {
      setError('Ingresa una velocidad válida (mayor a 0)');
      return;
    }

    const energia = calcularEnergia(pesoNum, velocidadNum);
    const requiereRegistro = energia > LIMITE_JOULES;
    const diferencia = Math.abs(energia - LIMITE_JOULES);
    const velocidadLimite = calcularVelocidadLimite(pesoNum);

    setResultado({
      energia: energia.toFixed(2),
      requiereRegistro,
      diferencia: diferencia.toFixed(2),
      velocidadLimite: velocidadLimite.toFixed(0),
      pesoUsado: pesoNum,
      velocidadUsada: velocidadNum
    });
  };

  return (
    <div className="calculadora-pcp">
      {/* Header oficial del club */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <button onClick={() => window.location.href = '/'} className="btn-home" title="Volver al inicio">
              🏠 Inicio
            </button>
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
            <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
          </div>
        </div>
      </header>

      <div className="calc-container">
        {/* Hero Section */}
        <section className="calc-hero">
          <div className="calc-instructivo">
            <h2>🎯 ¿Eres deportista de tiro neumático?</h2>
            <p className="calc-subtitle">¿Quieres saber si debes registrar tu rifle ante SEDENA?</p>
            <p><strong>Utiliza nuestra calculadora para conocer cómo debes proceder</strong></p>

            <div className="calc-pasos">
              <div className="calc-paso">
                <span className="paso-numero">1️⃣</span>
                <div>
                  <h4>Captura el peso de tu "pellet" o "diábolo"</h4>
                  <p>Busca en la caja de munición o pesa tu proyectil. Se mide en <strong>granos</strong>.</p>
                </div>
              </div>
              <div className="calc-paso">
                <span className="paso-numero">2️⃣</span>
                <div>
                  <h4>Ingresa la velocidad de tu rifle</h4>
                  <p>Usa un cronógrafo o consulta especificaciones. Se mide en <strong>fps</strong> (pies por segundo).</p>
                </div>
              </div>
              <div className="calc-paso">
                <span className="paso-numero">3️⃣</span>
                <div>
                  <h4>Conoce la potencia que desarrolla tu rifle</h4>
                  <p>La calculadora determina si <strong>requiere o no registro</strong> ante SEDENA.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de cálculo */}
          <div className="calc-formulario">
            <h3>⚡ Calculadora de Energía Cinética</h3>
            
            {calibreSeleccionado && (
              <div className="calibre-seleccionado">
                <span>🎯 {calibreSeleccionado.nombre}</span>
                <button onClick={limpiarSeleccion} className="btn-limpiar">✕ Limpiar</button>
              </div>
            )}

            <form onSubmit={handleCalcular}>
              <div className="form-group">
                <label htmlFor="peso">Peso del proyectil (granos):</label>
                <input
                  type="number"
                  id="peso"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 14.3"
                  step="0.1"
                  min="0"
                  required
                />
                {calibreSeleccionado && (
                  <small className="input-hint">💡 Peso típico precargado - ajusta según tu munición</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="velocidad">Velocidad (fps):</label>
                <input
                  type="number"
                  id="velocidad"
                  value={velocidad}
                  onChange={(e) => setVelocidad(e.target.value)}
                  placeholder="Ej: 850"
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              <button type="submit" className="btn-calcular">
                🎯 Calcular cómo Proceder
              </button>
            </form>

            {error && <div className="calc-error">{error}</div>}

            {resultado && (
              <div className={`calc-resultado ${resultado.requiereRegistro ? 'requiere' : 'no-requiere'}`}>
                <h4>{resultado.requiereRegistro ? '⚠️ REQUIERE REGISTRO' : '✅ NO REQUIERE REGISTRO'}</h4>
                
                <div className="resultado-datos">
                  <p><strong>📊 Datos ingresados:</strong></p>
                  <p>• Peso del proyectil: <strong>{resultado.pesoUsado} granos</strong></p>
                  <p>• Velocidad del rifle: <strong>{resultado.velocidadUsada} fps</strong></p>
                </div>

                <p><strong>⚡ Energía calculada:</strong> {resultado.energia} joules</p>
                
                <p><strong>📋 Diferencia:</strong> {resultado.requiereRegistro 
                  ? `Excede el límite por ${resultado.diferencia} joules`
                  : `Está ${resultado.diferencia} joules por debajo del límite`
                }</p>

                <p className="resultado-limite">
                  💡 <strong>Velocidad límite para {resultado.pesoUsado} gr:</strong> {resultado.velocidadLimite} fps
                  <br />
                  <small>Mantente por debajo para NO requerir registro</small>
                </p>

                {resultado.requiereRegistro && (
                  <div className="info-registro">
                    <h5>📋 Proceso de Registro ante SEDENA:</h5>
                    <ol>
                      <li>Acudir a la Zona Militar correspondiente (32 ZM - Valladolid para Yucatán)</li>
                      <li>Presentar documentación personal (INE, CURP, comprobante de domicilio)</li>
                      <li>Llevar el rifle de aire para inspección</li>
                      <li>Tramitar permiso extraordinario de transportación</li>
                    </ol>
                    <p>💡 <strong>Tip:</strong> Si eres socio del Club 738, te apoyamos con el trámite.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Preclasificador por Calibres */}
        <section className="calc-preclasificador">
          <h3>🎯 Preclasificador por Calibres de Rifles de Aire</h3>
          <p className="preclasificador-desc">
            Selecciona tu calibre para precargar el peso típico del proyectil
          </p>

          {Object.entries(CALIBRES).map(([categoria, datos]) => (
            <div key={categoria} className={`calibre-categoria ${categoria}`}>
              <div className="categoria-header">
                <h4>{datos.titulo}</h4>
                <small>{datos.descripcion}</small>
              </div>
              <div className="calibres-grid">
                {datos.items.map(calibre => {
                  const velocidadLimite = calcularVelocidadLimite(calibre.pesoTipico);
                  return (
                    <div 
                      key={calibre.id}
                      className={`calibre-card ${calibreSeleccionado?.id === calibre.id ? 'selected' : ''}`}
                      onClick={() => handleSeleccionarCalibre(calibre)}
                    >
                      <div className="calibre-nombre">{calibre.nombre}</div>
                      <div className="calibre-peso">{calibre.pesoTipico} gr típicos</div>
                      <div className="calibre-limite">Max: ~{velocidadLimite.toFixed(0)} fps</div>
                      <div className="calibre-uso">{calibre.uso}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Marco Legal */}
        <section className="calc-legal">
          <h3>⚖️ Marco Legal - Ley Federal de Armas de Fuego y Explosivos</h3>
          <div className="legal-content">
            <div className="legal-articulo">
              <h4>Artículo 16 - LFAFE</h4>
              <p>
                "Los rifles de aire o gas comprimido cuya energía cinética en la boca del cañón 
                exceda de <strong>140 joules</strong>, requieren registro ante la Secretaría de la 
                Defensa Nacional (SEDENA)."
              </p>
            </div>
            <div className="legal-resumen">
              <div className="legal-item verde">
                <span className="legal-icon">✅</span>
                <div>
                  <strong>Menor o igual a 140 joules</strong>
                  <p>Uso libre - No requiere registro ni permiso</p>
                </div>
              </div>
              <div className="legal-item rojo">
                <span className="legal-icon">⚠️</span>
                <div>
                  <strong>Mayor a 140 joules</strong>
                  <p>Requiere registro ante SEDENA y permiso de transportación</p>
                </div>
              </div>
            </div>
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
      </div>
    </div>
  );
}

export default CalculadoraPCP;

import React, { useState } from 'react';
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
      {/* Header */}
      <header className="calc-header">
        <div className="calc-header-content">
          <img src="/logo.jpg" alt="Logo Club 738" className="calc-logo" />
          <div className="calc-header-text">
            <h1>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
            <p>Tiro Deportivo y Caza Responsable - Calculadora PCP</p>
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
        <footer className="calc-footer">
          <div className="footer-club">
            <img src="/logo.jpg" alt="Logo Club" className="footer-logo" />
            <div>
              <h4>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h4>
              <p>Calle 50 No. 531-E x 69 y 71, Col. Centro</p>
              <p>97000 Mérida, Yucatán</p>
            </div>
          </div>
          <div className="footer-contacto">
            <p><strong>📱 WhatsApp:</strong> <a href="https://wa.me/5215665824667">+52 56 6582 4667</a></p>
            <p><strong>📧 Email:</strong> <a href="mailto:tiropracticoyucatan@gmail.com">tiropracticoyucatan@gmail.com</a></p>
          </div>
          <div className="footer-afiliaciones">
            <a href="https://www.femeti.org.mx/" target="_blank" rel="noopener noreferrer">
              <img src="/femeti-logo.avif" alt="FEMETI" className="femeti-logo" onError={(e) => e.target.style.display='none'} />
            </a>
            <p>Afiliados a FEMETI - Federación Mexicana de Tiro</p>
            <p>Registro SEDENA: 738 | SEMARNAT: CIN-005-YUC-05</p>
          </div>
          <p className="footer-copy">© 2026 Club de Caza, Tiro y Pesca de Yucatán, A.C. - Calculadora PCP v1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default CalculadoraPCP;

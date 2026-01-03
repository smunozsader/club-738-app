// ConsentimientoPrivacidad.jsx
// Componente React para obtener consentimiento del usuario
// Uso: Agregar en el formulario de registro de socios

import React, { useState } from 'react';
import './ConsentimientoPriv.css';

export default function ConsentimientoPrivacidad({ onConsentChange }) {
  const [consentimientoPrimario, setConsentimientoPrimario] = useState(false);
  const [consentimientoSecundario, setConsentimientoSecundario] = useState(false);
  const [consentimientoSensibles, setConsentimientoSensibles] = useState(false);
  const [mostrarAvisoCompleto, setMostrarAvisoCompleto] = useState(false);

  const handleConsentimientoPrimario = (e) => {
    const checked = e.target.checked;
    setConsentimientoPrimario(checked);
    
    // Notificar al componente padre sobre el cambio
    if (onConsentChange) {
      onConsentChange({
        primario: checked,
        secundario: consentimientoSecundario,
        sensibles: consentimientoSensibles
      });
    }
  };

  const handleConsentimientoSecundario = (e) => {
    const checked = e.target.checked;
    setConsentimientoSecundario(checked);
    
    if (onConsentChange) {
      onConsentChange({
        primario: consentimientoPrimario,
        secundario: checked,
        sensibles: consentimientoSensibles
      });
    }
  };

  const handleConsentimientoSensibles = (e) => {
    const checked = e.target.checked;
    setConsentimientoSensibles(checked);
    
    if (onConsentChange) {
      onConsentChange({
        primario: consentimientoPrimario,
        secundario: consentimientoSecundario,
        sensibles: checked
      });
    }
  };

  return (
    <div className="consentimiento-privacidad">
      <h3>📋 Protección de Datos Personales</h3>
      
      <div className="aviso-resumen">
        <p>
          El <strong>Club de Caza, Tiro y Pesca de Yucatán, A.C.</strong> (Registro SEDENA 738), 
          con domicilio en Calle 50 No. 531-E x 69 y 71, Centro, Mérida, Yucatán, 
          es responsable del tratamiento de sus datos personales conforme a la 
          <strong> Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>.
        </p>
      </div>

      {/* Consentimiento para finalidades primarias (OBLIGATORIO) */}
      <div className="checkbox-container obligatorio">
        <label>
          <input
            type="checkbox"
            checked={consentimientoPrimario}
            onChange={handleConsentimientoPrimario}
            required
          />
          <span className="checkbox-texto">
            <strong>He leído y acepto el Aviso de Privacidad</strong> para el tratamiento de mis datos personales 
            con las siguientes finalidades <strong>primarias y necesarias</strong>: gestión de membresía, 
            emisión de credencial, control de acceso, gestión de pagos, trámites ante SEDENA (PETA), 
            expediente digital, comunicación institucional y seguridad. 
            <span className="obligatorio-tag"> (OBLIGATORIO)</span>
          </span>
        </label>
      </div>

      {/* Consentimiento para datos sensibles (OBLIGATORIO) */}
      <div className="checkbox-container obligatorio">
        <label>
          <input
            type="checkbox"
            checked={consentimientoSensibles}
            onChange={handleConsentimientoSensibles}
            required
          />
          <span className="checkbox-texto">
            <strong>Consiento expresamente el tratamiento de mis datos personales sensibles</strong> 
            (cartilla militar, certificados médicos, psicológicos, toxicológicos, antecedentes penales, 
            grupo sanguíneo y huella dactilar) necesarios para cumplir con los requisitos de la SEDENA 
            y garantizar la seguridad en las instalaciones del Club.
            <span className="obligatorio-tag"> (OBLIGATORIO)</span>
          </span>
        </label>
      </div>

      {/* Consentimiento para finalidades secundarias (OPCIONAL) */}
      <div className="checkbox-container opcional">
        <label>
          <input
            type="checkbox"
            checked={consentimientoSecundario}
            onChange={handleConsentimientoSecundario}
          />
          <span className="checkbox-texto">
            <strong>(OPCIONAL)</strong> Consiento que mis datos sean utilizados para 
            <strong> finalidades secundarias</strong>: envío de publicidad y promociones, 
            publicación de resultados deportivos, fotografías/videos en redes sociales del Club 
            y estadísticas internas. 
            <span className="opcional-tag"> (Puede rechazar sin afectar su membresía)</span>
          </span>
        </label>
      </div>

      {/* Botones de acción */}
      <div className="acciones-privacidad">
        <button 
          type="button"
          className="btn-aviso-completo"
          onClick={() => setMostrarAvisoCompleto(!mostrarAvisoCompleto)}
        >
          {mostrarAvisoCompleto ? '▲ Ocultar' : '▼ Leer'} Aviso de Privacidad Completo
        </button>
        
        <a 
          href="/aviso-privacidad-integral.pdf" 
          target="_blank" 
          className="btn-descargar"
        >
          📥 Descargar PDF
        </a>
      </div>

      {/* Aviso completo (desplegable) */}
      {mostrarAvisoCompleto && (
        <div className="aviso-completo">
          <iframe 
            src="/aviso-privacidad-simplificado.html" 
            title="Aviso de Privacidad Completo"
            width="100%"
            height="500px"
            style={{ border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
      )}

      {/* Información de contacto */}
      <div className="info-contacto">
        <p className="texto-pequeno">
          <strong>Derechos ARCO:</strong> Puede ejercer sus derechos de Acceso, Rectificación, 
          Cancelación u Oposición enviando un correo a{' '}
          <a href="mailto:tiropracticoyucatan@gmail.com">tiropracticoyucatan@gmail.com</a>
        </p>
        <p className="texto-pequeno">
          <strong>Consulta el Aviso de Privacidad Integral en:</strong>{' '}
          <a href="https://club-738-app.web.app/aviso-privacidad" target="_blank" rel="noopener noreferrer">
            https://club-738-app.web.app/aviso-privacidad
          </a>
        </p>
      </div>

      {/* Validación visual */}
      {!consentimientoPrimario && !consentimientoSensibles && (
        <div className="advertencia">
          ⚠️ Debe aceptar el tratamiento de datos personales y datos sensibles para continuar con su registro.
        </div>
      )}
    </div>
  );
}

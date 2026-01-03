// AvisoPrivacidad.jsx
// Página pública con el Aviso de Privacidad completo
// Ruta: /aviso-privacidad

import React, { useState } from 'react';
import './AvisoPrivacidad.css';

export default function AvisoPrivacidad() {
  const [vistaActiva, setVistaActiva] = useState('simplificado');

  return (
    <div className="aviso-privacidad-page">
      <div className="aviso-container">
        {/* Header */}
        <header className="aviso-header">
          <div className="club-info">
            <img src="/logo.jpg" alt="Club 738" className="club-logo" />
            <div>
              <h1>Aviso de Privacidad</h1>
              <p className="club-nombre">Club de Caza, Tiro y Pesca de Yucatán, A.C.</p>
              <p className="registro">Registro SEDENA: 738</p>
            </div>
          </div>
        </header>

        {/* Tabs de navegación */}
        <nav className="aviso-tabs">
          <button 
            className={`tab ${vistaActiva === 'simplificado' ? 'active' : ''}`}
            onClick={() => setVistaActiva('simplificado')}
          >
            📋 Aviso Simplificado
          </button>
          <button 
            className={`tab ${vistaActiva === 'integral' ? 'active' : ''}`}
            onClick={() => setVistaActiva('integral')}
          >
            📜 Aviso Integral
          </button>
          <button 
            className={`tab ${vistaActiva === 'arco' ? 'active' : ''}`}
            onClick={() => setVistaActiva('arco')}
          >
            ⚖️ Derechos ARCO
          </button>
        </nav>

        {/* Contenido */}
        <main className="aviso-content">
          {vistaActiva === 'simplificado' && <AvisoSimplificado />}
          {vistaActiva === 'integral' && <AvisoIntegral />}
          {vistaActiva === 'arco' && <DerechosARCO />}
        </main>

        {/* Footer con acciones */}
        <footer className="aviso-footer">
          <p>
            <strong>Contacto para ejercer derechos ARCO:</strong>{' '}
            <a href="mailto:tiropracticoyucatan@gmail.com">tiropracticoyucatan@gmail.com</a>
          </p>
          <p className="fecha-actualizacion">
            Última actualización: 3 de enero de 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

// Componente: Aviso Simplificado
function AvisoSimplificado() {
  return (
    <div className="aviso-seccion">
      <h2>📋 Aviso de Privacidad Simplificado</h2>
      
      <div className="info-box">
        <p>
          En cumplimiento a la <strong>Ley Federal de Protección de Datos Personales 
          en Posesión de los Particulares (LFPDPPP)</strong>, el Club de Caza, Tiro y 
          Pesca de Yucatán, A.C. informa lo siguiente:
        </p>
      </div>

      <section>
        <h3>¿Quién es el Responsable de sus Datos?</h3>
        <p>
          <strong>Club de Caza, Tiro y Pesca de Yucatán, A.C.</strong><br />
          Calle 50 No. 531-E x 69 y 71, Colonia Centro<br />
          C.P. 97000, Mérida, Yucatán, México<br />
          Correo: tiropracticoyucatan@gmail.com<br />
          Teléfono: 999-923-2264
        </p>
      </section>

      <section>
        <h3>¿Qué Datos Personales Recabamos?</h3>
        <ul>
          <li><strong>Identificación:</strong> Nombre, CURP, RFC, fecha de nacimiento, INE, fotografía</li>
          <li><strong>Contacto:</strong> Domicilio, teléfono, correo electrónico</li>
          <li><strong>Datos Sensibles:</strong> Cartilla militar, certificados médicos (físico, psicológico, toxicológico), antecedentes penales</li>
          <li><strong>Datos de Armas:</strong> Registros SEDENA (RFA), clase, calibre, marca, modelo, matrícula</li>
        </ul>
      </section>

      <section>
        <h3>¿Para Qué Usamos sus Datos?</h3>
        <div className="finalidades-grid">
          <div className="finalidad-card primaria">
            <h4>Finalidades Primarias (Necesarias)</h4>
            <ul>
              <li>Gestión de membresía</li>
              <li>Emisión de credencial de socio</li>
              <li>Control de acceso a instalaciones</li>
              <li>Gestión de pagos y facturación</li>
              <li>Trámites ante SEDENA (PETA)</li>
              <li>Expediente digital del socio</li>
              <li>Comunicación institucional</li>
            </ul>
          </div>
          <div className="finalidad-card secundaria">
            <h4>Finalidades Secundarias (Opcionales)</h4>
            <ul>
              <li>Envío de publicidad y promociones</li>
              <li>Publicación en redes sociales</li>
              <li>Fotografías/videos de eventos</li>
              <li>Estadísticas internas</li>
            </ul>
            <p className="nota">Puede oponerse sin afectar su membresía</p>
          </div>
        </div>
      </section>

      <section>
        <h3>¿Con Quién Compartimos sus Datos?</h3>
        <ul>
          <li><strong>SEDENA:</strong> Para trámites de permisos de armas (obligatorio por ley)</li>
          <li><strong>Autoridades competentes:</strong> Cuando exista orden judicial</li>
          <li><strong>Servicios de emergencia:</strong> En caso de accidente</li>
        </ul>
      </section>

      <section>
        <h3>¿Cómo Protegemos sus Datos?</h3>
        <div className="seguridad-badges">
          <span className="badge">🔒 Encriptación SSL/TLS</span>
          <span className="badge">👤 Control de acceso</span>
          <span className="badge">💾 Respaldos automáticos</span>
          <span className="badge">🛡️ Firebase Security Rules</span>
        </div>
      </section>
    </div>
  );
}

// Componente: Aviso Integral
function AvisoIntegral() {
  return (
    <div className="aviso-seccion aviso-integral">
      <h2>📜 Aviso de Privacidad Integral</h2>
      
      <div className="disclaimer">
        <p>
          El presente Aviso de Privacidad Integral cumple con lo dispuesto en los 
          artículos 15, 16 y 17 de la Ley Federal de Protección de Datos Personales 
          en Posesión de los Particulares (LFPDPPP).
        </p>
      </div>

      <section>
        <h3>1. Identidad y Domicilio del Responsable</h3>
        <p>
          <strong>Responsable:</strong> Club de Caza, Tiro y Pesca de Yucatán, A.C.<br />
          <strong>Domicilio:</strong> Calle 50 No. 531-E x 69 y 71, Colonia Centro, C.P. 97000, Mérida, Yucatán, México<br />
          <strong>Registro SEDENA:</strong> 738<br />
          <strong>Correo electrónico:</strong> tiropracticoyucatan@gmail.com<br />
          <strong>Teléfono:</strong> 999-923-2264
        </p>
      </section>

      <section>
        <h3>2. Datos Personales que Recabamos</h3>
        
        <h4>A) Datos de Identificación y Contacto:</h4>
        <ul>
          <li>Nombre completo, CURP, RFC</li>
          <li>Fecha de nacimiento, nacionalidad, estado civil</li>
          <li>Fotografía, INE/pasaporte, acta de nacimiento</li>
          <li>Domicilio completo, comprobante de domicilio</li>
          <li>Teléfono celular, teléfono de casa, correo electrónico</li>
        </ul>

        <h4>B) Datos Sensibles (requieren consentimiento expreso):</h4>
        <div className="warning-box">
          <p>⚠️ Conforme al artículo 8 de la LFPDPPP, los siguientes datos requieren su <strong>consentimiento expreso</strong>:</p>
        </div>
        <ul>
          <li>Cartilla del Servicio Militar Nacional liberada</li>
          <li>Certificado médico de no impedimento físico</li>
          <li>Certificado médico-psicológico de aptitud mental</li>
          <li>Certificado toxicológico</li>
          <li>Constancia de antecedentes penales federales</li>
          <li>Grupo sanguíneo y factor RH (para emergencias)</li>
        </ul>

        <h4>C) Datos de Armas de Fuego:</h4>
        <ul>
          <li>Registros de armas ante SEDENA (forma RFA-RA-001)</li>
          <li>Clase, calibre, marca, modelo, matrícula, folio SEDENA</li>
        </ul>
      </section>

      <section>
        <h3>3. Finalidades del Tratamiento</h3>
        
        <h4>Finalidades Primarias (no requieren consentimiento):</h4>
        <ol>
          <li>Gestión de la membresía (alta, baja, renovación)</li>
          <li>Verificación de identidad en instalaciones</li>
          <li>Emisión de credencial de socio</li>
          <li>Control de acceso a instalaciones</li>
          <li>Gestión de pagos y facturación</li>
          <li>Trámites ante SEDENA (Permisos PETA)</li>
          <li>Cumplimiento de obligaciones legales</li>
          <li>Integración de expediente digital</li>
          <li>Comunicación institucional</li>
          <li>Seguridad e identificación en emergencias</li>
        </ol>

        <h4>Finalidades Secundarias (requieren consentimiento):</h4>
        <ol>
          <li>Envío de publicidad y promociones</li>
          <li>Prospección comercial</li>
          <li>Estadísticas internas</li>
          <li>Publicación de resultados deportivos en redes sociales</li>
        </ol>
      </section>

      <section>
        <h3>4. Transferencias de Datos</h3>
        <p>Sus datos podrán ser transferidos a:</p>
        
        <h4>Sin consentimiento (Art. 37 LFPDPPP):</h4>
        <ul>
          <li><strong>SEDENA:</strong> Trámites de permisos de armas</li>
          <li><strong>Autoridades competentes:</strong> Requerimientos legales</li>
          <li><strong>Servicios de emergencia:</strong> Situaciones de salud/seguridad</li>
        </ul>

        <h4>Con consentimiento:</h4>
        <ul>
          <li>Proveedores de servicios tecnológicos</li>
          <li>Patrocinadores (solo finalidades secundarias)</li>
        </ul>
      </section>

      <section>
        <h3>5. Medidas de Seguridad</h3>
        <ul>
          <li>Encriptación de datos en tránsito (SSL/TLS) y en reposo</li>
          <li>Control de acceso basado en roles (solo secretario/directiva)</li>
          <li>Firestore Security Rules para protección a nivel de documento</li>
          <li>Respaldos automáticos diarios</li>
          <li>Obligación de confidencialidad del personal</li>
        </ul>
      </section>

      <section>
        <h3>6. Derechos ARCO</h3>
        <p>
          Usted tiene derecho a <strong>Acceder</strong>, <strong>Rectificar</strong>, 
          <strong>Cancelar</strong> u <strong>Oponerse</strong> al tratamiento de sus datos.
        </p>
        <p>
          Para ejercer estos derechos, envíe su solicitud a: <strong>tiropracticoyucatan@gmail.com</strong>
        </p>
        <p>
          <strong>Plazo de respuesta:</strong> 20 días hábiles<br />
          <strong>Plazo de efectividad:</strong> 15 días hábiles adicionales
        </p>
      </section>

      <section>
        <h3>7. Revocación del Consentimiento</h3>
        <p>
          Puede revocar su consentimiento en cualquier momento mediante solicitud a 
          nuestro correo electrónico. La revocación para finalidades primarias puede 
          implicar la imposibilidad de continuar como socio del Club.
        </p>
      </section>

      <section>
        <h3>8. Cambios al Aviso de Privacidad</h3>
        <p>
          El Club se reserva el derecho de modificar este Aviso de Privacidad. 
          Las modificaciones serán notificadas mediante:
        </p>
        <ul>
          <li>Publicación en el sitio web: https://club-738-app.web.app</li>
          <li>Correo electrónico a los socios registrados</li>
          <li>Anuncios en las instalaciones del Club</li>
        </ul>
      </section>

      <div className="fecha-vigencia">
        <p><strong>Fecha de entrada en vigor:</strong> 3 de enero de 2026</p>
      </div>
    </div>
  );
}

// Componente: Derechos ARCO
function DerechosARCO() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    derecho: '',
    descripcion: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // En producción, esto enviaría un email o guardaría en Firestore
    const mailtoLink = `mailto:tiropracticoyucatan@gmail.com?subject=Solicitud ARCO - ${formData.derecho}&body=${encodeURIComponent(
      `Nombre: ${formData.nombre}\n` +
      `Email: ${formData.email}\n` +
      `Teléfono: ${formData.telefono}\n` +
      `Derecho solicitado: ${formData.derecho}\n\n` +
      `Descripción:\n${formData.descripcion}`
    )}`;
    window.location.href = mailtoLink;
    setEnviado(true);
  };

  return (
    <div className="aviso-seccion derechos-arco">
      <h2>⚖️ Derechos ARCO</h2>
      
      <div className="info-box">
        <p>
          La <strong>Ley Federal de Protección de Datos Personales en Posesión de 
          los Particulares (LFPDPPP)</strong> le otorga los siguientes derechos sobre 
          sus datos personales:
        </p>
      </div>

      <div className="derechos-grid">
        <div className="derecho-card">
          <span className="derecho-letra">A</span>
          <h4>Acceso</h4>
          <p>Conocer qué datos personales tenemos sobre usted y cómo los tratamos.</p>
        </div>
        <div className="derecho-card">
          <span className="derecho-letra">R</span>
          <h4>Rectificación</h4>
          <p>Corregir sus datos si son inexactos, incompletos o están desactualizados.</p>
        </div>
        <div className="derecho-card">
          <span className="derecho-letra">C</span>
          <h4>Cancelación</h4>
          <p>Solicitar la eliminación de sus datos cuando ya no sean necesarios.</p>
        </div>
        <div className="derecho-card">
          <span className="derecho-letra">O</span>
          <h4>Oposición</h4>
          <p>Oponerse al tratamiento de sus datos para finalidades específicas.</p>
        </div>
      </div>

      <section className="procedimiento">
        <h3>📝 Procedimiento para Ejercer sus Derechos</h3>
        
        <div className="pasos">
          <div className="paso">
            <span className="paso-numero">1</span>
            <p>Presente su solicitud por escrito al correo <strong>tiropracticoyucatan@gmail.com</strong></p>
          </div>
          <div className="paso">
            <span className="paso-numero">2</span>
            <p>Incluya: nombre completo, copia de INE, descripción del derecho y datos específicos</p>
          </div>
          <div className="paso">
            <span className="paso-numero">3</span>
            <p>Recibirá respuesta en un plazo máximo de <strong>20 días hábiles</strong></p>
          </div>
          <div className="paso">
            <span className="paso-numero">4</span>
            <p>Si procede, se hará efectivo en <strong>15 días hábiles</strong> adicionales</p>
          </div>
        </div>
      </section>

      <section className="formulario-arco">
        <h3>📧 Enviar Solicitud ARCO</h3>
        
        {enviado ? (
          <div className="mensaje-exito">
            <p>✅ Se abrirá su cliente de correo con la solicitud pre-llenada.</p>
            <p>Si no se abre automáticamente, envíe un correo a: <strong>tiropracticoyucatan@gmail.com</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo electrónico *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="derecho">Derecho que desea ejercer *</label>
              <select
                id="derecho"
                value={formData.derecho}
                onChange={(e) => setFormData({...formData, derecho: e.target.value})}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Acceso">Acceso - Conocer mis datos</option>
                <option value="Rectificación">Rectificación - Corregir mis datos</option>
                <option value="Cancelación">Cancelación - Eliminar mis datos</option>
                <option value="Oposición">Oposición - Dejar de usar mis datos</option>
                <option value="Revocación">Revocación del consentimiento</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción de su solicitud *</label>
              <textarea
                id="descripcion"
                rows="4"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describa los datos específicos y lo que solicita..."
                required
              />
            </div>

            <div className="form-note">
              <p>⚠️ <strong>Importante:</strong> Deberá adjuntar copia de su INE al correo para verificar su identidad.</p>
            </div>

            <button type="submit" className="btn-enviar">
              📧 Enviar Solicitud
            </button>
          </form>
        )}
      </section>

      <section className="autoridad">
        <h3>🏛️ Autoridad Competente</h3>
        <p>
          Si considera que sus derechos han sido vulnerados, puede presentar una 
          queja ante el <strong>Instituto Nacional de Transparencia, Acceso a la 
          Información y Protección de Datos Personales (INAI)</strong>:
        </p>
        <p>
          <strong>Sitio web:</strong> <a href="https://home.inai.org.mx" target="_blank" rel="noopener noreferrer">https://home.inai.org.mx</a><br />
          <strong>Teléfono:</strong> 800 835 4324 (IFAI)
        </p>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import './ManualUsuario.css';

/**
 * Manual de Usuario - Centro de Ayuda del Portal
 * Versión 1.14.0 - Enero 2026
 */
function ManualUsuario({ onBack }) {
  const [seccionExpandida, setSeccionExpandida] = useState(null);

  const toggleSeccion = (seccionId) => {
    setSeccionExpandida(seccionExpandida === seccionId ? null : seccionId);
  };

  const scrollToTop = () => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const scrollToSection = (seccionId) => {
    const element = document.getElementById(seccionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSeccionExpandida(seccionId);
    }
  };

  return (
    <div className="manual-usuario-container">
      <header className="manual-header">
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Volver al Dashboard
          </button>
        )}
        <h1>📚 Centro de Ayuda</h1>
        <p className="subtitle">Manual de Usuario del Portal del Socio</p>
        <div className="version-badge">v1.14.0 - Enero 2026</div>
      </header>

      {/* ÍNDICE RÁPIDO */}
      <div className="indice-rapido">
        <h2>🗂️ Índice Rápido</h2>
        <div className="indice-grid">
          <button className="indice-btn" onClick={() => scrollToSection('dashboard')}>
            🏠 Dashboard Principal
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('expediente')}>
            📋 Expediente Digital
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('peta')}>
            🎯 Solicitar PETA
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('arsenal')}>
            📦 Gestión de Arsenal
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('citas')}>
            📅 Agendar Citas
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('pagos')}>
            💰 Pagos y Membresía
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('faq')}>
            ❓ Preguntas Frecuentes
          </button>
          <button className="indice-btn" onClick={() => scrollToSection('contacto')}>
            📞 Contacto
          </button>
        </div>
      </div>

      {/* CONTENIDO DEL MANUAL */}
      <div className="manual-content">
        
        {/* DASHBOARD PRINCIPAL */}
        <section id="dashboard" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('dashboard')}>
            <h2>🏠 Dashboard Principal</h2>
            <span className="toggle-icon">{seccionExpandida === 'dashboard' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'dashboard' && (
            <div className="section-content">
              <p>Después de iniciar sesión, verás el Dashboard con varias tarjetas organizadas:</p>
              
              <h3>Mi Expediente</h3>
              <ul>
                <li><strong>📋 Mis Documentos PETA</strong>: Sube y gestiona los 16 documentos necesarios</li>
                <li><strong>📄 Documentos Oficiales</strong>: Descarga tu CURP y Constancia de Antecedentes</li>
                <li><strong>🔫 Mis Armas</strong>: Consulta tus armas registradas en SEDENA</li>
                <li><strong>📦 Gestión de Arsenal</strong>: Reporta ventas, transferencias o bajas de armas</li>
                <li><strong>🎯 Mis PETAs</strong>: Solicita y da seguimiento a tus permisos de transporte</li>
                <li><strong>⚙️ Mi Perfil</strong>: Cambia tu contraseña y configuración</li>
                <li><strong>📅 Agendar Cita</strong>: Reserva tiempo con el secretario</li>
                <li><strong>💳 Estado de Pagos</strong>: Consulta tu membresía 2026</li>
              </ul>

              <h3>Herramientas</h3>
              <ul>
                <li><strong>🗓️ Calendario de Tiradas</strong>: Competencias 2026 del club y región sureste</li>
                <li><strong>🧮 Calculadora PCP</strong>: Calcula energía cinética de rifles de aire</li>
              </ul>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* EXPEDIENTE DIGITAL */}
        <section id="expediente" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('expediente')}>
            <h2>📋 Completar Expediente Digital</h2>
            <span className="toggle-icon">{seccionExpandida === 'expediente' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'expediente' && (
            <div className="section-content">
              <h3>Documentos Requeridos (16 total)</h3>
              
              <div className="info-box">
                <strong>📌 Importante:</strong>
                <ul>
                  <li>CURP y Constancia ya están disponibles en "Documentos Oficiales" - solo descárgalos</li>
                  <li>INE debe estar ampliada al 200% y mostrar ambas caras</li>
                  <li>Foto infantil con fondo blanco (para tu credencial 2026)</li>
                  <li>Todos los archivos: PDF, JPG o PNG - Máximo 5 MB</li>
                </ul>
              </div>

              <h3>Lista de Documentos</h3>
              <ol>
                <li>INE (ambas caras ampliadas 200%)</li>
                <li>CURP (descargar de Documentos Oficiales)</li>
                <li>Cartilla Militar / Acta de Nacimiento</li>
                <li>Comprobante de Domicilio (máx 3 meses)</li>
                <li>Constancia Antecedentes Penales (descargar de Documentos Oficiales)</li>
                <li>Certificado Médico</li>
                <li>Certificado Psicológico</li>
                <li>Certificado Toxicológico</li>
                <li>Carta Modo Honesto de Vivir</li>
                <li>Licencia de Caza SEMARNAT (solo si solicitarás PETA de caza)</li>
                <li>Foto Infantil (fondo blanco, para credencial)</li>
                <li>Recibo Pago e5cinco</li>
                <li>Registros de Armas (RFA) - hasta 10 armas</li>
              </ol>

              <h3>Cómo Subir Documentos</h3>
              <ol>
                <li>Ve a <strong>"Mis Documentos PETA"</strong> desde el dashboard</li>
                <li>Click en <strong>"Subir"</strong> para cada documento</li>
                <li>Selecciona el archivo desde tu computadora</li>
                <li>Espera a que se complete la carga (verás ✅)</li>
                <li>El secretario verificará cada documento</li>
              </ol>

              <p><strong>Progreso:</strong> Puedes ver tu avance en la barra superior (ej: 12/16 documentos)</p>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* SOLICITAR PETA */}
        <section id="peta" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('peta')}>
            <h2>🎯 Solicitar PETA</h2>
            <span className="toggle-icon">{seccionExpandida === 'peta' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'peta' && (
            <div className="section-content">
              <h3>Tipos de PETA Disponibles</h3>
              
              <div className="tabla-peta">
                <div className="peta-card">
                  <h4>Práctica de Tiro</h4>
                  <p><strong>Vigencia:</strong> Ene → Dic (1 año)</p>
                  <p><strong>Para:</strong> Solo campo de tiro del club</p>
                </div>
                <div className="peta-card">
                  <h4>Competencia Nacional</h4>
                  <p><strong>Vigencia:</strong> Ene → Dic (1 año)</p>
                  <p><strong>Para:</strong> Eventos FEMETI autorizados por DN27</p>
                </div>
                <div className="peta-card">
                  <h4>Caza</h4>
                  <p><strong>Vigencia:</strong> Jul → Jun (1 año)</p>
                  <p><strong>Para:</strong> Transportar armas a cotos/UMAs SEMARNAT</p>
                </div>
              </div>

              <h3>Cómo Solicitar</h3>
              <ol>
                <li>Ve a <strong>"Mis PETAs"</strong></li>
                <li>Click en <strong>"+ Solicitar Nuevo PETA"</strong></li>
                <li>Completa el formulario:
                  <ul>
                    <li><strong>Tipo:</strong> Tiro, Competencia o Caza</li>
                    <li><strong>Renovación:</strong> Si ya tuviste PETA anterior (anota el número de oficio)</li>
                    <li><strong>Armas:</strong> Selecciona hasta 10 armas de tu inventario</li>
                    <li><strong>Estados:</strong> Hasta 10 estados (solo Competencia/Caza)</li>
                    <li><strong>Domicilio:</strong> Verifica que esté correcto</li>
                  </ul>
                </li>
                <li>Click en <strong>"📤 Enviar Solicitud"</strong></li>
              </ol>

              <h3>Estados del Trámite</h3>
              <ul>
                <li>🟡 <strong>Documentación en proceso:</strong> Falta completar documentos</li>
                <li>🟢 <strong>Documentación completa:</strong> Todo verificado, listo para enviar</li>
                <li>📤 <strong>Enviado a 32 ZM:</strong> En Zona Militar (Valladolid)</li>
                <li>⏳ <strong>En revisión SEDENA:</strong> DN27 revisando</li>
                <li>✅ <strong>PETA aprobado:</strong> Listo para recoger</li>
                <li>❌ <strong>Rechazado:</strong> Ver motivo y corregir</li>
              </ul>

              <div className="warning-box">
                <strong>⚠️ Tiempo estimado:</strong> El trámite completo toma 2-3 meses
              </div>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* GESTIÓN DE ARSENAL */}
        <section id="arsenal" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('arsenal')}>
            <h2>📦 Gestión de Arsenal</h2>
            <span className="toggle-icon">{seccionExpandida === 'arsenal' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'arsenal' && (
            <div className="section-content">
              <div className="warning-box">
                <strong>⚖️ Obligación Legal:</strong> Debes reportar ventas, transferencias o pérdidas de armas <strong>dentro de 30 días</strong> según la Ley Federal de Armas de Fuego y Explosivos.
              </div>

              <h3>✅ Solicitar Alta de Arma Nueva</h3>
              <p><strong>¿Compraste o recibiste un arma?</strong> Solicita que se registre en tu arsenal.</p>
              
              <ol>
                <li>Ve a <strong>"📦 Gestión de Arsenal"</strong></li>
                <li>Click en <strong>"➕ Solicitar Alta de Arma Nueva"</strong></li>
                <li>Completa los datos del arma:
                  <ul>
                    <li>Clase (PISTOLA, RIFLE, ESCOPETA, REVOLVER)</li>
                    <li>Marca y modelo</li>
                    <li>Calibre</li>
                    <li>Matrícula</li>
                    <li>Folio SEDENA (si ya lo tienes)</li>
                    <li>Modalidad (tiro, caza, ambas)</li>
                  </ul>
                </li>
                <li>Indica cómo la adquiriste:
                  <ul>
                    <li>💰 Compra a particular</li>
                    <li>👥 Transferencia familiar</li>
                    <li>📜 Herencia</li>
                    <li>🎁 Donación</li>
                  </ul>
                </li>
                <li>Si fue compra/transferencia, proporciona datos del vendedor</li>
                <li>Click en <strong>"📤 Enviar Solicitud"</strong></li>
              </ol>

              <div className="info-box">
                <strong>📄 Documentos a presentar al secretario:</strong>
                <ul>
                  <li>Registro Federal de Armas (RFA) del arma</li>
                  <li>Recibo de compra o contrato de compraventa</li>
                  <li>Registro de transferencia SEDENA (si aplica)</li>
                </ul>
              </div>

              <h3>🔻 Reportar Baja de Arma</h3>
              <p><strong>¿Vendiste, transferiste o perdiste un arma?</strong> Repórtalo para cumplir con SEDENA.</p>

              <h4>Cuándo usar:</h4>
              <ul>
                <li>Vendiste un arma a otra persona</li>
                <li>Regalaste o transferiste un arma a familiar</li>
                <li>Extraviaste un arma</li>
                <li>Te robaron un arma (con denuncia)</li>
                <li>Destruiste un arma</li>
              </ul>

              <h4>Cómo reportar:</h4>
              <ol>
                <li>Ve a <strong>"📦 Gestión de Arsenal"</strong></li>
                <li>Verás tu arsenal completo</li>
                <li>Click en <strong>"📤 Reportar Baja"</strong> en la tarjeta del arma</li>
                <li>Elige el motivo (venta, transferencia, pérdida, robo, destrucción)</li>
                <li>Para venta/transferencia:
                  <ul>
                    <li>Nombre completo del receptor</li>
                    <li>CURP</li>
                    <li>Email</li>
                    <li>El sistema detecta si es socio del club</li>
                  </ul>
                </li>
                <li>Si YA hiciste el trámite en SEDENA, anota:
                  <ul>
                    <li>Folio del registro</li>
                    <li>Zona Militar</li>
                    <li>Fecha del trámite</li>
                  </ul>
                </li>
                <li>Click en <strong>"Enviar Solicitud"</strong></li>
              </ol>

              <h3>¿Qué Pasa Después?</h3>
              <ul>
                <li>Tu solicitud queda en estado: <strong>⏳ Pendiente</strong></li>
                <li>El secretario la revisa y aprueba</li>
                <li>Si el receptor es socio, recibe notificación automática</li>
                <li>El secretario genera oficios para 32 ZM y DN27</li>
                <li>El arma se marca como inactiva después de confirmar con SEDENA</li>
              </ul>

              <div className="info-box">
                <strong>📌 Nota:</strong> El arma NO se elimina automáticamente. El secretario la actualizará después de confirmar el trámite.
              </div>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* AGENDAR CITAS */}
        <section id="citas" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('citas')}>
            <h2>📅 Agendar Citas con el Secretario</h2>
            <span className="toggle-icon">{seccionExpandida === 'citas' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'citas' && (
            <div className="section-content">
              <h3>¿Para Qué Necesito una Cita?</h3>
              <ul>
                <li>Entregar documentos físicos para PETA</li>
                <li>Realizar pagos de membresía</li>
                <li>Resolver consultas personales</li>
                <li>Cualquier asunto que requiera atención del secretario</li>
              </ul>

              <h3>Cómo Agendar</h3>
              <ol>
                <li>Ve a <strong>"📅 Agendar Cita"</strong></li>
                <li>Selecciona fecha:
                  <ul>
                    <li>Solo días laborables (lunes a viernes)</li>
                    <li>Con al menos 24 horas de anticipación</li>
                    <li>Hasta 3 meses adelante</li>
                  </ul>
                </li>
                <li>Selecciona horario:
                  <ul>
                    <li>Slots de 30 minutos</li>
                    <li>Horario: 9:00 - 17:00 hrs</li>
                    <li>Los slots ocupados aparecen deshabilitados</li>
                  </ul>
                </li>
                <li>Elige el propósito:
                  <ul>
                    <li>🎯 Trámite PETA</li>
                    <li>💰 Pago de membresía</li>
                    <li>📄 Entrega de documentos</li>
                    <li>💬 Consulta general</li>
                    <li>📌 Otro (especifica en notas)</li>
                  </ul>
                </li>
                <li>Agrega notas adicionales (opcional)</li>
                <li>Click en <strong>"📅 Agendar Cita"</strong></li>
              </ol>

              <h3>Después de Agendar</h3>
              <ul>
                <li>Recibes <strong>invitación de Google Calendar</strong> en tu email</li>
                <li>Estado inicial: <strong>⏳ Pendiente confirmación</strong></li>
                <li>El secretario ve tu solicitud en su agenda</li>
                <li>Recibes recordatorios automáticos:
                  <ul>
                    <li>24 horas antes</li>
                    <li>1 hora antes</li>
                    <li>15 minutos antes</li>
                  </ul>
                </li>
              </ul>

              <h3>Estados de Cita</h3>
              <ul>
                <li>⏳ <strong>Pendiente:</strong> Esperando confirmación del secretario</li>
                <li>✅ <strong>Confirmada:</strong> Cita confirmada, te esperamos</li>
                <li>❌ <strong>Cancelada:</strong> Cancelada por ti o el secretario</li>
                <li>✔️ <strong>Completada:</strong> Cita realizada exitosamente</li>
              </ul>

              <div className="warning-box">
                <strong>⚠️ Cancelaciones:</strong> Contacta al secretario por WhatsApp (+52 56 6582 4667) con al menos 2 horas de anticipación.
              </div>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* PAGOS Y MEMBRESÍA */}
        <section id="pagos" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('pagos')}>
            <h2>💰 Pagos y Membresía 2026</h2>
            <span className="toggle-icon">{seccionExpandida === 'pagos' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'pagos' && (
            <div className="section-content">
              <h3>Cuotas 2026</h3>
              
              <div className="tabla-cuotas">
                <div className="cuota-card">
                  <h4>Cuota Anual</h4>
                  <p className="precio">$6,000.00 MXN</p>
                  <p>Todos los socios</p>
                </div>
                <div className="cuota-card">
                  <h4>FEMETI Socio</h4>
                  <p className="precio">$350.00 MXN</p>
                  <p>Socios existentes</p>
                </div>
                <div className="cuota-card">
                  <h4>Inscripción</h4>
                  <p className="precio">$2,000.00 MXN</p>
                  <p>Solo socios nuevos</p>
                </div>
                <div className="cuota-card">
                  <h4>FEMETI Nuevo</h4>
                  <p className="precio">$700.00 MXN</p>
                  <p>Solo socios nuevos</p>
                </div>
              </div>

              <div className="info-box">
                <strong>📌 Importante:</strong>
                <ul>
                  <li>Las cuotas son <strong>donativos</strong> a la Asociación Civil</li>
                  <li>No se emiten comprobantes fiscales</li>
                  <li>Incluye: 1 trámite PETA</li>
                  <li>NO incluye: Pago e5cinco (~$2,500) ni mensajería</li>
                </ul>
              </div>

              <h3>Métodos de Pago</h3>
              <ul>
                <li>Efectivo</li>
                <li>Transferencia bancaria</li>
              </ul>

              <h3>Proceso</h3>
              <ol>
                <li>Confirma el monto total con el secretario</li>
                <li>Realiza el pago por tu método preferido</li>
                <li>El secretario registra el pago en el sistema</li>
                <li>Tu membresía 2026 se activa automáticamente ✅</li>
                <li>Consulta tu estado en "Estado de Pagos"</li>
              </ol>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* PREGUNTAS FRECUENTES */}
        <section id="faq" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('faq')}>
            <h2>❓ Preguntas Frecuentes</h2>
            <span className="toggle-icon">{seccionExpandida === 'faq' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'faq' && (
            <div className="section-content">
              <div className="faq-item">
                <h4>¿Puedo solicitar varios PETAs al mismo tiempo?</h4>
                <p>Sí, puedes solicitar Tiro + Competencia + Caza simultáneamente. Cada uno requiere formulario separado y 1 foto infantil física.</p>
              </div>

              <div className="faq-item">
                <h4>¿Qué pasa si no tengo armas registradas?</h4>
                <p>Contacta al secretario para que agregue tus armas al sistema. Necesitarás tus Registros de Armas (RFA).</p>
              </div>

              <div className="faq-item">
                <h4>¿Cuánto tarda el trámite PETA?</h4>
                <p><strong>Total aproximado: 2-3 meses</strong>
                  <ul>
                    <li>Documentación completa → Envío a 32 ZM: 1-2 semanas</li>
                    <li>Revisión SEDENA: 4-8 semanas</li>
                  </ul>
                </p>
              </div>

              <div className="faq-item">
                <h4>¿Dónde consigo la Constancia de Antecedentes Penales?</h4>
                <p>En línea: <a href="https://constancias.oadprs.gob.mx/" target="_blank" rel="noopener noreferrer">https://constancias.oadprs.gob.mx/</a><br/>Es gratuita y se emite al instante.</p>
              </div>

              <div className="faq-item">
                <h4>¿Qué es el pago e5cinco?</h4>
                <p>Es el pago de derechos a SEDENA por el trámite PETA. No se incluye en la cuota del club. Lo pagas directamente y subes el recibo.</p>
              </div>

              <div className="faq-item">
                <h4>¿Cómo reporto que vendí un arma?</h4>
                <p>Usa el módulo <strong>"📦 Gestión de Arsenal"</strong>. Debes reportarlo dentro de 30 días según la ley. El sistema notificará al secretario y generará oficios para SEDENA.</p>
              </div>

              <div className="faq-item">
                <h4>¿Cómo agendo una cita con el secretario?</h4>
                <p>Usa el módulo <strong>"📅 Agendar Cita"</strong>. Selecciona fecha, horario y propósito. Recibirás invitación de Google Calendar con recordatorios automáticos.</p>
              </div>

              <div className="faq-item">
                <h4>¿Vence mi PETA automáticamente?</h4>
                <p>Sí:
                  <ul>
                    <li><strong>Tiro/Competencia:</strong> 31 de diciembre</li>
                    <li><strong>Caza:</strong> 30 de junio del año siguiente</li>
                  </ul>
                  Solicita renovación con 2 meses de anticipación.
                </p>
              </div>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="manual-section">
          <div className="section-header" onClick={() => toggleSeccion('contacto')}>
            <h2>📞 Contacto y Soporte</h2>
            <span className="toggle-icon">{seccionExpandida === 'contacto' ? '▼' : '▶'}</span>
          </div>
          {seccionExpandida === 'contacto' && (
            <div className="section-content">
              <h3>Secretario del Club</h3>
              <div className="contacto-card">
                <p><strong>📅 Agendar cita:</strong> Usa el módulo "Agendar Cita" del portal</p>
                <p><strong>📱 WhatsApp:</strong> <a href="tel:+525665824667">+52 56 6582 4667</a></p>
                <p><strong>📧 Email:</strong> <a href="mailto:tiropracticoyucatan@gmail.com">tiropracticoyucatan@gmail.com</a></p>
                <p><strong>🕐 Horario:</strong> Lunes a Viernes, 9:00 - 17:00 hrs</p>
              </div>

              <h3>Campo de Tiro</h3>
              <div className="contacto-card">
                <p><strong>📍 Ubicación:</strong> Km 7.5 Carretera Federal 281, Hunucmá - Sisal</p>
                <p><strong>🗺️ Google Maps:</strong> <a href="https://maps.app.goo.gl/AcpqoDN9wN8g8r1Q6" target="_blank" rel="noopener noreferrer">Ver en mapa</a></p>
              </div>

              <h3>32 Zona Militar</h3>
              <div className="contacto-card">
                <p><strong>📍 Ubicación:</strong> Valladolid, Yucatán</p>
                <p><strong>🏛️ Autoridad:</strong> SEDENA - Dirección General del Registro Federal de Armas</p>
              </div>
              <button className="btn-volver-arriba" onClick={scrollToTop}>⬆️ Volver arriba</button>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="manual-footer">
        <div className="footer-info">
          <h3>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h3>
          <p>Registro SEDENA: 738 | FEMETI: YUC 05/2020 | SEMARNAT: SEMARNAT-CLUB-CIN-005-YUC-05</p>
          <p className="version">Manual v1.14.0 - Enero 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default ManualUsuario;

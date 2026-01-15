/**
 * WhatsApp Business Integration
 * Genera enlaces wa.me con mensajes pre-formateados
 */

// Número de WhatsApp del club (sin + ni espacios)
const WHATSAPP_CLUB = '525665824667'; // +52 56 6582 4667

/**
 * Genera enlace de WhatsApp con mensaje pre-formateado
 * @param {string} mensaje - Mensaje a enviar
 * @param {string} telefono - Número destino (opcional, por defecto club)
 * @returns {string} URL de WhatsApp
 */
export function generarEnlaceWhatsApp(mensaje, telefono = WHATSAPP_CLUB) {
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${telefono}?text=${mensajeCodificado}`;
}

/**
 * Plantillas de mensajes predefinidos
 */
export const PLANTILLAS_WHATSAPP = {
  // Notificación de nueva PETA
  notificarPETA: (nombreSocio, tipoPermiso, numArmas) => {
    return `*NUEVA SOLICITUD PETA*

Socio: ${nombreSocio}
Tipo: ${tipoPermiso}
Armas: ${numArmas}

Por favor revisar en el portal.`;
  },

  // Consulta general
  consultaGeneral: (nombreSocio, asunto) => {
    return `Hola, soy ${nombreSocio}.

Asunto: ${asunto}

`;
  },

  // Agendar cita para documentos
  agendarCita: (nombreSocio, motivo) => {
    return `Hola, soy ${nombreSocio}.

Necesito agendar cita para: ${motivo}

¿Cuándo hay disponibilidad?`;
  },

  // Consulta sobre documento
  consultaDocumento: (nombreSocio, documento) => {
    return `Hola, soy ${nombreSocio}.

Tengo una pregunta sobre: ${documento}

`;
  },

  // Notificación de pago realizado
  notificarPago: (nombreSocio, concepto, monto, referencia) => {
    return `*PAGO REALIZADO*

Socio: ${nombreSocio}
Concepto: ${concepto}
Monto: $${monto} MXN
Referencia: ${referencia}

Por favor confirmar recepción.`;
  },

  // Solicitud de renovación
  solicitarRenovacion: (nombreSocio, año) => {
    return `Hola, soy ${nombreSocio}.

Deseo renovar mi membresía ${año}.

¿Cuál es el proceso?`;
  },
};

/**
 * Envía notificación por WhatsApp (abre enlace en nueva pestaña)
 * @param {string} mensaje - Mensaje a enviar
 * @param {string} telefono - Número destino
 */
export function enviarWhatsApp(mensaje, telefono = WHATSAPP_CLUB) {
  const enlace = generarEnlaceWhatsApp(mensaje, telefono);
  window.open(enlace, '_blank');
}

/**
 * Notificación automática cuando se crea una PETA
 * Genera mensaje y retorna enlace (no abre automáticamente)
 */
export function notificarPETAWhatsApp(socioData, petaData) {
  const mensaje = PLANTILLAS_WHATSAPP.notificarPETA(
    socioData.nombre,
    petaData.tipo === 'caza' ? 'Caza' : 'Tiro/Competencia',
    petaData.armasIncluidas.length
  );
  
  return generarEnlaceWhatsApp(mensaje);
}

export default {
  generarEnlaceWhatsApp,
  enviarWhatsApp,
  notificarPETAWhatsApp,
  PLANTILLAS_WHATSAPP,
  WHATSAPP_CLUB,
};

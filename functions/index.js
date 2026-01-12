/**
 * Firebase Cloud Functions - Club 738
 *
 * Funciones:
 * - onPetaCreated: Envía email de notificación cuando un socio solicita PETA
 * - crearEventoCalendar: Crea evento en Google Calendar al crear cita
 * - actualizarEventoCalendar: Actualiza evento al cambiar estado de cita
 */

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Inicializar Firebase Admin
admin.initializeApp();

// Importar funciones de Google Calendar
// const calendarFunctions = require('./calendar-integration');

// Configuración global
setGlobalOptions({
  maxInstances: 10,
  region: "us-central1",
});

// Configuración de email (usar variables de entorno en producción)
// Para configurar: firebase functions:secrets:set EMAIL_PASS
const EMAIL_CONFIG = {
  // Emails de notificación
  destinatarios: [
    "smunozam@gmail.com", // Secretario
    "tiropracticoyucatan@gmail.com", // Club
  ],

  // Configuración SMTP (Gmail)
  // NOTA: Necesitas habilitar "Apps menos seguras" o usar App Password
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER ||
          "tiropracticoyucatan@gmail.com",
      pass: process.env.EMAIL_PASS || "",
      // Configurar con: firebase functions:secrets:set EMAIL_PASS
    },
  },
};

/**
 * Trigger: Cuando se crea un documento en socios/{email}/petas/{petaId}
 * Acción: Enviar email de notificación al secretario y al club
 */
exports.onPetaCreated = onDocumentCreated(
    "socios/{email}/petas/{petaId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const petaData = snapshot.data();
      const email = event.params.email;
      const petaId = event.params.petaId;

      console.log(`Nueva solicitud PETA: ${petaId} de ${email}`);

      // Obtener datos del socio
      let nombreSocio = email;
      try {
        const socioDoc = await admin.firestore()
            .collection("socios")
            .doc(email)
            .get();

        if (socioDoc.exists) {
          nombreSocio = socioDoc.data().nombre || email;
        }
      } catch (error) {
        console.error("Error obteniendo datos del socio:", error);
      }

      // Formatear armas incluidas
      const armasIncluidas = petaData.armasIncluidas || [];
      const listaArmas = armasIncluidas.map((a) =>
        `• ${a.clase} ${a.marca} ${a.calibre} (Mat: ${a.matricula})`,
      ).join("\n");

      // Formatear estados
      const estados = petaData.estadosAutorizados || [];
      const listaEstados = estados.length > 0 ?
        estados.join(", ") :
        "Solo Yucatán (Práctica de Tiro)";

      // Tipos de PETA
      const tiposPETA = {
        "tiro": "Práctica de Tiro",
        "competencia": "Competencia Nacional",
        "caza": "Caza",
      };

      // Formatear fechas
      let fechaInicio = "N/A";
      let fechaFin = "N/A";
      try {
        if (petaData.vigenciaInicio && petaData.vigenciaInicio.toDate) {
          fechaInicio = petaData.vigenciaInicio.toDate()
              .toLocaleDateString("es-MX");
        }
        if (petaData.vigenciaFin && petaData.vigenciaFin.toDate) {
          fechaFin = petaData.vigenciaFin.toDate()
              .toLocaleDateString("es-MX");
        }
      } catch (e) {
        console.log("Error formateando fechas:", e);
      }

      // Formatear domicilio
      const dom = petaData.domicilio || {};
      const munEstado = [
        dom.municipio || "",
        dom.estado || "",
      ].filter(Boolean).join(", ");
      const domicilioStr = [
        dom.calle || "",
        dom.colonia || "",
        munEstado,
        dom.cp ? `C.P. ${dom.cp}` : "",
      ].filter(Boolean).join(", ");

      // Fecha formateada
      const fechaSolicitud = new Date().toLocaleString(
          "es-MX",
          {timeZone: "America/Merida"},
      );

      const asunto = `🎯 Nueva Solicitud PETA - ${nombreSocio}`;

      const cuerpo = `
═══════════════════════════════════════════════════════
   NUEVA SOLICITUD DE PETA
   Club de Caza, Tiro y Pesca de Yucatán, A.C.
═══════════════════════════════════════════════════════

📋 DATOS DE LA SOLICITUD

Solicitante: ${nombreSocio}
Email: ${email}
Tipo de PETA: ${tiposPETA[petaData.tipo] || petaData.tipo}
Es renovación: ${petaData.esRenovacion ? "Sí" : "No"}
${petaData.esRenovacion ? "PETA anterior: " + petaData.petaAnteriorNumero : ""}

📅 VIGENCIA SOLICITADA
Inicio: ${fechaInicio}
Fin: ${fechaFin}

🗺️ ESTADOS AUTORIZADOS
${listaEstados}

🔫 ARMAS INCLUIDAS (${armasIncluidas.length}/10)
${listaArmas || "Ninguna especificada"}

📍 DOMICILIO
${domicilioStr || "No especificado"}

═══════════════════════════════════════════════════════

🔔 ACCIÓN REQUERIDA:
   Ingresa al portal para verificar la documentación
   https://club-738-app.web.app

Fecha de solicitud: ${fechaSolicitud}
ID Solicitud: ${petaId}

═══════════════════════════════════════════════════════
Este es un mensaje automático del sistema.
Club de Caza, Tiro y Pesca de Yucatán, A.C.
SEDENA 738 | FEMETI YUC 05/2020
    `.trim();

      // Enviar email
      try {
      // Verificar si hay credenciales configuradas
        if (!EMAIL_CONFIG.smtp.auth.pass) {
          console.log("⚠️ Email no configurado. " +
            "Credenciales SMTP no disponibles.");
          console.log("Contenido que se enviaría:");
          console.log("Asunto:", asunto);
          console.log("Destinatarios:", EMAIL_CONFIG.destinatarios.join(", "));
          console.log("---");
          console.log(cuerpo);
          return {success: false, reason: "Email credentials not configured"};
        }

        const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);

        const mailOptions = {
          from: `"Club 738 - Sistema PETA" <${EMAIL_CONFIG.smtp.auth.user}>`,
          to: EMAIL_CONFIG.destinatarios.join(", "),
          subject: asunto,
          text: cuerpo,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email enviado:", info.messageId);

        return {success: true, messageId: info.messageId};
      } catch (error) {
        console.error("❌ Error enviando email:", error);
        return {success: false, error: error.message};
      }
    },
);

/**
 * Trigger: Cuando se crea un documento en citas/{citaId}
 * Acción: Enviar email de notificación al secretario sobre la nueva cita
 */
exports.onCitaCreated = onDocumentCreated(
    "citas/{citaId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const citaData = snapshot.data();
      const citaId = event.params.citaId;

      console.log(`Nueva cita agendada: ${citaId} de ${citaData.socioEmail}`);

      // Obtener datos del socio para más información
      let telefonoSocio = "No disponible";
      let nombreSocio = citaData.socioNombre || citaData.socioEmail;
      try {
        const socioDoc = await admin.firestore()
            .collection("socios")
            .doc(citaData.socioEmail)
            .get();

        if (socioDoc.exists) {
          const socioData = socioDoc.data();
          nombreSocio = socioData.nombre || citaData.socioEmail;
          telefonoSocio = socioData.telefono || "No disponible";
        }
      } catch (error) {
        console.error("Error obteniendo datos del socio:", error);
      }

      // Mapeo de propósitos
      const propositos = {
        "peta": "Trámite PETA",
        "pago": "Pago de membresía",
        "documentos": "Entrega de documentos",
        "consulta": "Consulta general",
        "otro": "Otro",
      };

      const proposito = propositos[citaData.proposito] ||
        citaData.proposito ||
        "No especificado";

      // Formato de fecha
      const fecha = new Date(citaData.fecha);
      const fechaFormato = fecha.toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Asunto del email
      const asunto = `📅 Nueva Cita Agendada - ${nombreSocio}`;

      // Cuerpo del email
      const cuerpo = `
┌────────────────────────────────────────────────────────┐
│           📅 NUEVA CITA AGENDADA EN EL SISTEMA         │
└────────────────────────────────────────────────────────┘

INFORMACIÓN DEL SOCIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Nombre: ${nombreSocio}
📧 Email: ${citaData.socioEmail}
📞 Teléfono: ${telefonoSocio}

DETALLES DE LA CITA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📆 Fecha: ${fechaFormato}
🕒 Hora: ${citaData.hora}
📋 Propósito: ${proposito}
${citaData.notas ? `
📝 Notas del socio:
${citaData.notas}
` : ""}

PRÓXIMOS PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ La cita se ha creado en tu Google Calendar
✅ Se envió una invitación al socio: ${citaData.socioEmail}
📋 Estado actual: ${citaData.estado || "pendiente"}

DIRECCIÓN DEL CLUB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Club de Caza, Tiro y Pesca de Yucatán, A.C.
Calle 50 No. 531-E x 69 y 71
Col. Centro, 97000 Mérida, Yucatán
🌐 https://club-738-app.web.app

SEDENA 738 | FEMETI YUC 05/2020
    `.trim();

      // Enviar email
      try {
        if (!EMAIL_CONFIG.smtp.auth.pass) {
          console.log("⚠️ Email no configurado. " +
            "Credenciales SMTP no disponibles.");
          console.log("Contenido que se enviaría:");
          console.log("Asunto:", asunto);
          console.log("Destinatarios:", EMAIL_CONFIG.destinatarios.join(", "));
          console.log("---");
          console.log(cuerpo);
          return {
            success: false,
            reason: "Email credentials not configured",
          };
        }

        const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);

        const sistemaLabel = "Club 738 - Sistema de Citas";
        const mailOptions = {
          from: `"${sistemaLabel}" <${EMAIL_CONFIG.smtp.auth.user}>`,
          to: EMAIL_CONFIG.destinatarios.join(", "),
          subject: asunto,
          text: cuerpo,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email de cita enviado:", info.messageId);

        return {success: true, messageId: info.messageId};
      } catch (error) {
        console.error("❌ Error enviando email de cita:", error);
        return {success: false, error: error.message};
      }
    },
);

/**
 * Función HTTP para probar el envío de emails
 * URL: https://us-central1-club-738-app.cloudfunctions.net/testEmail
 */
exports.testEmail = require("firebase-functions/v2/https").onRequest(
    async (req, res) => {
      const fechaTest = new Date().toLocaleString(
          "es-MX",
          {timeZone: "America/Merida"},
      );
      const testMessage = {
        from: `"Club 738 - Test" <${EMAIL_CONFIG.smtp.auth.user}>`,
        to: EMAIL_CONFIG.destinatarios.join(", "),
        subject: "🔧 Test - Sistema de Notificaciones Club 738",
        text: `
Este es un mensaje de prueba del sistema de notificaciones.

Si recibes este email, el sistema está configurado correctamente.

Fecha: ${fechaTest}
      `.trim(),
      };

      try {
        if (!EMAIL_CONFIG.smtp.auth.pass) {
          res.status(200).json({
            success: false,
            message: "Email credentials not configured. Set EMAIL_PASS secret.",
            wouldSendTo: EMAIL_CONFIG.destinatarios,
          });
          return;
        }

        const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);
        const info = await transporter.sendMail(testMessage);

        res.status(200).json({
          success: true,
          messageId: info.messageId,
          sentTo: EMAIL_CONFIG.destinatarios,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    },
);

// Exportar funciones de Google Calendar
// exports.crearEventoCalendar = calendarFunctions.crearEventoCalendar;
// exports.actualizarEvent = calendarFunctions.actualizarEventoCalendar;

/**
 * Firebase Functions - Google Calendar Integration
 * Integración con Google Calendar para sistema de citas
 *
 * Funcionalidades:
 * - Crear evento en Google Calendar al crear cita
 * - Actualizar evento al cambiar estado de cita
 * - Eliminar evento al cancelar cita
 * - Enviar invitaciones por email a socios
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {google} = require("googleapis");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Inicializar Firebase Admin (solo si no está inicializado)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Email del calendario del secretario (donde se crearán los eventos)
const CALENDAR_ID = "smunozam@gmail.com";

// Configuración de email SMTP
const EMAIL_CONFIG = {
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "smunozam@gmail.com",
      pass: process.env.EMAIL_PASS || "",
    },
  },
};

/**
 * Enviar email de confirmación de cita al socio
 * @param {Object} citaData - Datos de la cita
 * @param {string} calendarLink - Link al evento en el calendario
 */
async function enviarEmailConfirmacionCita(citaData, calendarLink) {
  const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);

  const fechaFormateada = new Date(`${citaData.fecha}T${citaData.hora}:00`)
      .toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Merida",
      });

  const asunto = `📅 Cita Confirmada - Club 738 - ${fechaFormateada}`;

  const cuerpoHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">📅 Cita Confirmada</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0;">Club de Caza, Tiro y Pesca de Yucatán, A.C.</p>
      </div>
      
      <div style="padding: 30px; background: #f8fafc;">
        <p style="font-size: 16px; color: #334155;">Hola <strong>${citaData.socioNombre}</strong>,</p>
        
        <p style="font-size: 16px; color: #334155;">Tu cita ha sido registrada exitosamente:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 8px 0;"><strong>📋 Motivo:</strong> ${getPropositoNombre(citaData.proposito)}</p>
          <p style="margin: 8px 0;"><strong>📅 Fecha y Hora:</strong> ${fechaFormateada}</p>
          <p style="margin: 8px 0;"><strong>📍 Lugar:</strong> Club 738 - Calle 50 No. 531-E x 69 y 71, Col. Centro, Mérida</p>
          ${citaData.notas ? `<p style="margin: 8px 0;"><strong>📝 Notas:</strong> ${citaData.notas}</p>` : ""}
        </div>
        
        <p style="font-size: 14px; color: #64748b;">Te esperamos puntualmente. Si necesitas cambiar tu cita, contacta al secretario.</p>
      </div>
      
      <div style="background: #1e293b; padding: 15px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Club de Caza, Tiro y Pesca de Yucatán, A.C. (Club 738)</p>
        <p style="color: #64748b; font-size: 11px; margin: 5px 0 0 0;">Este es un mensaje automático, no responder.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Club 738" <smunozam@gmail.com>',
      to: citaData.socioEmail,
      subject: asunto,
      html: cuerpoHTML,
    });
    console.log(`📧 Email de confirmación enviado a ${citaData.socioEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error.message);
    return false;
  }
}

/**
 * Cargar credenciales de Google Service Account
 * @return {Object} Credenciales del service account
 */
function loadCredentials() {
  const keyPath = path.join(__dirname, "calendar_service_account.json");

  if (!fs.existsSync(keyPath)) {
    console.error("❌ No se encontró calendar_service_account.json");
    console.error("📝 Sigue las instrucciones en docs/GOOGLE_CALENDAR_SETUP.md");
    throw new Error("Service account credentials not found");
  }

  return JSON.parse(fs.readFileSync(keyPath, "utf8"));
}

/**
 * Crear cliente de Google Calendar API autenticado
 * @return {Object} Cliente de Google Calendar API
 */
async function getCalendarClient() {
  const credentials = loadCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({version: "v3", auth});
}

/**
 * Obtener nombre del propósito de cita en español
 * @param {string} proposito - Código del propósito
 * @return {string} Nombre en español
 */
function getPropositoNombre(proposito) {
  const nombres = {
    "peta": "Trámite PETA",
    "pago": "Pago de membresía",
    "documentos": "Entrega de documentos",
    "consulta": "Consulta general",
    "otro": "Otro",
  };
  return nombres[proposito] || "Cita";
}

/**
 * Cloud Function: Crear evento en Google Calendar cuando se crea una cita
 * Trigger: onCreate en colección 'citas'
 */
exports.crearEventoCalendar = functions.firestore
    .document("citas/{citaId}")
    .onCreate(async (snap, context) => {
      const citaData = snap.data();
      const citaId = context.params.citaId;

      console.log("📅 Iniciando creación de evento en Google Calendar");
      console.log(`   Cita ID: ${citaId}`);
      console.log(`   Socio: ${citaData.socioNombre} (${citaData.socioEmail})`);
      console.log(`   Fecha: ${citaData.fecha} ${citaData.hora}`);

      try {
        const calendar = await getCalendarClient();

        // Construir fecha/hora del evento
        const fechaHora = `${citaData.fecha}T${citaData.hora}:00`;
        const startDateTime = new Date(fechaHora);

        // Duración: 30 minutos
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + 30);

        // Construir descripción del evento
        const descripcion = `
🎯 Propósito: ${getPropositoNombre(citaData.proposito)}

👤 Socio: ${citaData.socioNombre}
📧 Email: ${citaData.socioEmail}
${citaData.notas ? `\n📝 Notas:\n${citaData.notas}` : ""}

---
📌 Cita generada automáticamente desde Portal Club 738
🔗 ID: ${citaId}
      `.trim();

        // Crear evento (sin attendees externos para evitar error de Domain-Wide Delegation)
        const event = {
          summary: `📅 ${getPropositoNombre(citaData.proposito)} - ${citaData.socioNombre}`,
          description: descripcion,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: "America/Merida",
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: "America/Merida",
          },
          // NOTA: No incluir attendees externos - Service Account no puede invitar sin Domain-Wide Delegation
          reminders: {
            useDefault: false,
            overrides: [
              {method: "email", minutes: 24 * 60}, // 1 día antes
              {method: "popup", minutes: 60}, // 1 hora antes
              {method: "popup", minutes: 15}, // 15 minutos antes
            ],
          },
          colorId: "9", // Azul
          location: "Club de Caza, Tiro y Pesca de Yucatán, A.C.\nCalle 50 No. 531-E x 69 y 71\nCol. Centro, 97000 Mérida, Yucatán",
        };

        console.log("📤 Enviando request a Google Calendar API...");

        const response = await calendar.events.insert({
          calendarId: CALENDAR_ID,
          resource: event,
          sendUpdates: "none", // No enviar invitaciones (enviamos email separado)
        });

        console.log(`✅ Evento creado exitosamente: ${response.data.id}`);
        console.log(`🔗 Link: ${response.data.htmlLink}`);

        // Actualizar documento en Firestore con el Event ID
        await snap.ref.update({
          calendarEventId: response.data.id,
          calendarEventLink: response.data.htmlLink,
          calendarEventCreated: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("💾 Firestore actualizado con Event ID");

        // Enviar email de confirmación al socio
        await enviarEmailConfirmacionCita(citaData, response.data.htmlLink);

        return {
          success: true,
          eventId: response.data.id,
          link: response.data.htmlLink,
        };
      } catch (error) {
        console.error("❌ Error creando evento en Google Calendar:", error);
        console.error("   Detalle:", error.message);

        // Guardar error en Firestore para debugging
        await snap.ref.update({
          calendarError: error.message,
          calendarErrorTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Re-throw para que aparezca en Firebase Functions logs
        throw error;
      }
    });

/**
 * Cloud Function: Actualizar evento cuando cambia el estado de la cita
 * Trigger: onUpdate en colección 'citas'
 */
exports.actualizarEventoCalendar = functions.firestore
    .document("citas/{citaId}")
    .onUpdate(async (change, context) => {
      const before = change.before.data();
      const after = change.after.data();
      const citaId = context.params.citaId;

      // Solo proceder si cambió el estado
      if (before.estado === after.estado) {
        console.log("⏭️  Estado no cambió, skip");
        return null;
      }

      const eventId = after.calendarEventId;
      if (!eventId) {
        console.log("⚠️  No hay calendarEventId, skip");
        return null;
      }

      console.log(`📅 Actualizando evento ${eventId}`);
      console.log(`   Estado: ${before.estado} → ${after.estado}`);

      try {
        const calendar = await getCalendarClient();

        // Si fue CANCELADA, eliminar evento
        if (after.estado === "cancelada") {
          console.log("❌ Cancelando evento...");

          await calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: eventId,
            sendUpdates: "all", // Notificar cancelación
          });

          console.log("✅ Evento cancelado");

          // Actualizar Firestore
          await change.after.ref.update({
            calendarEventDeleted: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Si fue CONFIRMADA, actualizar título y color
        else if (after.estado === "confirmada") {
          console.log("✅ Confirmando evento...");

          const event = await calendar.events.get({
            calendarId: CALENDAR_ID,
            eventId: eventId,
          });

          await calendar.events.update({
            calendarId: CALENDAR_ID,
            eventId: eventId,
            resource: {
              ...event.data,
              summary: `✅ CONFIRMADA: ${getPropositoNombre(after.proposito)} - ${after.socioNombre}`,
              colorId: "10", // Verde
            },
            sendUpdates: "all", // Notificar confirmación
          });

          console.log("✅ Evento confirmado");

          await change.after.ref.update({
            calendarEventUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Si fue COMPLETADA, actualizar título y color
        else if (after.estado === "completada") {
          console.log("✔️  Marcando evento como completado...");

          const event = await calendar.events.get({
            calendarId: CALENDAR_ID,
            eventId: eventId,
          });

          await calendar.events.update({
            calendarId: CALENDAR_ID,
            eventId: eventId,
            resource: {
              ...event.data,
              summary: `✔️  COMPLETADA: ${getPropositoNombre(after.proposito)} - ${after.socioNombre}`,
              colorId: "8", // Gris
            },
            sendUpdates: "all",
          });

          console.log("✅ Evento marcado como completado");

          await change.after.ref.update({
            calendarEventUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        return {success: true};
      } catch (error) {
        console.error("❌ Error actualizando evento:", error);
        console.error("   Detalle:", error.message);

        // Guardar error en Firestore
        await change.after.ref.update({
          calendarUpdateError: error.message,
          calendarUpdateErrorTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        throw error;
      }
    });

/**
 * NOTA: Para activar estas funciones:
 *
 * 1. Configurar Google Cloud Project y Google Calendar API
 *    (ver docs/GOOGLE_CALENDAR_SETUP.md)
 *
 * 2. Copiar calendar_service_account.json a /functions/
 *
 * 3. Compartir calendario del secretario con service account
 *
 * 4. Deploy:
 *    firebase deploy --only functions
 *
 * 5. Verificar en Firebase Console:
 *    - Functions → crearEventoCalendar (activa)
 *    - Functions → actualizarEventoCalendar (activa)
 *
 * 6. Test:
 *    - Crear cita desde portal
 *    - Verificar evento en Google Calendar
 *    - Verificar email de invitación
 */

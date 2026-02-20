# Google Calendar API - Setup Guide

## Integración de Agendamiento con Google Calendar

Esta guía detalla cómo configurar la integración entre el portal de Club 738 y Google Calendar para el sistema de agendamiento de citas.

---

## 📋 Prerequisitos

- Cuenta de Google (secretario del club)
- Acceso a Google Cloud Console
- Firebase CLI instalado
- Node.js 18+ instalado

---

## 🔧 Paso 1: Configurar Google Cloud Project

### 1.1 Crear Proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto o seleccionar proyecto existente de Firebase:
   - Nombre: `club-738-app` (o el nombre de tu proyecto Firebase)
   - Organización: (tu organización)
3. Anotar el **Project ID**

### 1.2 Habilitar Google Calendar API

1. En Google Cloud Console, ir a **APIs & Services** → **Library**
2. Buscar: `Google Calendar API`
3. Click en **Enable**
4. Esperar confirmación de activación

---

## 🔐 Paso 2: Configurar Credenciales OAuth 2.0

### 2.1 Crear OAuth 2.0 Credentials

1. Ir a **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Si es primera vez, configurar **OAuth consent screen**:
   - User Type: **Internal** (si tienes Google Workspace) o **External**
   - App name: `Club 738 - Sistema de Agendamiento`
   - User support email: `smunozam@gmail.com`
   - Developer contact: `smunozam@gmail.com`
   - Scopes: Agregar `https://www.googleapis.com/auth/calendar`

4. Crear OAuth client ID:
   - Application type: **Web application**
   - Name: `Club 738 Calendar Integration`
   - Authorized redirect URIs:
     ```
     http://localhost:5000 (para testing local)
     https://yucatanctp.org (producción)
     ```
5. Download JSON de credenciales:
   - Guardar como `oauth2_credentials.json` en directorio seguro
   - **NUNCA commitear este archivo a Git**

### 2.2 Crear Service Account (Alternativa)

**Opción recomendada para automatización:**

1. Ir a **IAM & Admin** → **Service Accounts**
2. Click **+ CREATE SERVICE ACCOUNT**:
   - Name: `calendar-integration`
   - ID: `calendar-integration@club-738-app.iam.gserviceaccount.com`
   - Role: **Owner** (o permisos mínimos necesarios)
3. Click **DONE**
4. Click en la service account creada
5. Tab **KEYS** → **ADD KEY** → **Create new key**
   - Type: **JSON**
6. Download JSON:
   - Guardar como `calendar_service_account.json` en `/Applications/club-738-web/scripts/`
   - **NUNCA commitear este archivo a Git**

### 2.3 Otorgar Acceso al Calendario del Secretario

**IMPORTANTE**: La service account necesita acceso al calendario personal del secretario:

1. Abrir [Google Calendar](https://calendar.google.com)
2. Click en **Settings** (⚙️) → **Settings**
3. En la columna izquierda, click en el calendario principal (generalmente tu email)
4. Scroll down a **Share with specific people**
5. Click **+ Add people**
6. Agregar el email de la service account:
   ```
   calendar-integration@club-738-app.iam.gserviceaccount.com
   ```
7. Permisos: **Make changes to events**
8. Click **Send**

---

## 🔥 Paso 3: Configurar Firebase Functions

### 3.1 Inicializar Firebase Functions

```bash
cd /Applications/club-738-web

# Si no existe /functions
firebase init functions

# Seleccionar:
# - Language: JavaScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### 3.2 Instalar Dependencias

```bash
cd functions
npm install googleapis@126
npm install --save-dev @types/node
```

### 3.3 Copiar Service Account Key

```bash
# Copiar el JSON de service account a /functions
cp /ruta/a/calendar_service_account.json /Applications/club-738-web/functions/
```

### 3.4 Agregar a .gitignore

```bash
# Editar /functions/.gitignore
echo "calendar_service_account.json" >> .gitignore
```

---

## 📝 Paso 4: Crear Firebase Function

Archivo: `/functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

admin.initializeApp();

// Cargar credenciales de service account
const keyPath = path.join(__dirname, 'calendar_service_account.json');
const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Email del calendario del secretario (donde se crearán los eventos)
const CALENDAR_ID = 'smunozam@gmail.com'; // Cambiar por el email del secretario

/**
 * Cloud Function: Crear evento en Google Calendar cuando se crea una cita
 * Trigger: onCreate en colección 'citas'
 */
exports.crearEventoCalendar = functions.firestore
  .document('citas/{citaId}')
  .onCreate(async (snap, context) => {
    try {
      const citaData = snap.data();
      const citaId = context.params.citaId;

      console.log('📅 Creando evento en Google Calendar para cita:', citaId);

      // Autenticar con Google Calendar API
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      // Construir fecha/hora del evento
      const fechaHora = `${citaData.fecha}T${citaData.hora}:00`;
      const startDateTime = new Date(fechaHora);
      
      // Duración: 30 minutos
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 30);

      // Crear evento
      const event = {
        summary: `📅 Cita: ${citaData.socioNombre}`,
        description: `
Propósito: ${citaData.proposito}
Email: ${citaData.socioEmail}
${citaData.notas ? `\nNotas: ${citaData.notas}` : ''}

---
Cita generada automáticamente desde Portal Club 738
        `.trim(),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Merida',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Merida',
        },
        attendees: [
          { email: citaData.socioEmail, displayName: citaData.socioNombre },
          { email: CALENDAR_ID, organizer: true }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 día antes
            { method: 'popup', minutes: 60 },      // 1 hora antes
          ],
        },
        colorId: '9', // Azul (opcional)
      };

      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: event,
        sendUpdates: 'all', // Enviar invitaciones por email
      });

      console.log('✅ Evento creado:', response.data.id);

      // Actualizar documento en Firestore con el Event ID
      await snap.ref.update({
        calendarEventId: response.data.id,
        calendarEventLink: response.data.htmlLink,
      });

      return { success: true, eventId: response.data.id };

    } catch (error) {
      console.error('❌ Error creando evento en Google Calendar:', error);
      
      // Guardar error en Firestore para debugging
      await snap.ref.update({
        calendarError: error.message,
      });

      throw error;
    }
  });

/**
 * Cloud Function: Actualizar evento cuando cambia el estado de la cita
 * Trigger: onUpdate en colección 'citas'
 */
exports.actualizarEventoCalendar = functions.firestore
  .document('citas/{citaId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Solo proceder si cambió el estado
      if (before.estado === after.estado) {
        return null;
      }

      const eventId = after.calendarEventId;
      if (!eventId) {
        console.log('⚠️ No hay calendarEventId, skip');
        return null;
      }

      console.log(`📅 Actualizando evento ${eventId}, estado: ${after.estado}`);

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      // Si fue cancelada, eliminar evento
      if (after.estado === 'cancelada') {
        await calendar.events.delete({
          calendarId: CALENDAR_ID,
          eventId: eventId,
          sendUpdates: 'all', // Notificar cancelación
        });
        console.log('❌ Evento cancelado');
      }
      
      // Si fue confirmada, actualizar título
      else if (after.estado === 'confirmada') {
        const event = await calendar.events.get({
          calendarId: CALENDAR_ID,
          eventId: eventId,
        });

        await calendar.events.update({
          calendarId: CALENDAR_ID,
          eventId: eventId,
          resource: {
            ...event.data,
            summary: `✅ CONFIRMADA: ${after.socioNombre}`,
          },
          sendUpdates: 'all',
        });
        console.log('✅ Evento confirmado');
      }

      // Si fue completada, actualizar título
      else if (after.estado === 'completada') {
        const event = await calendar.events.get({
          calendarId: CALENDAR_ID,
          eventId: eventId,
        });

        await calendar.events.update({
          calendarId: CALENDAR_ID,
          eventId: eventId,
          resource: {
            ...event.data,
            summary: `✔️ COMPLETADA: ${after.socioNombre}`,
            colorId: '8', // Gris
          },
          sendUpdates: 'all',
        });
        console.log('✔️ Evento completado');
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Error actualizando evento:', error);
      throw error;
    }
  });
```

---

## 🚀 Paso 5: Deploy de Firebase Functions

```bash
cd /Applications/club-738-web

# Deploy solo functions
firebase deploy --only functions

# O deploy completo
firebase deploy
```

### Verificar Deploy

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Proyecto: `club-738-app`
3. **Functions** → Verificar:
   - ✅ `crearEventoCalendar`
   - ✅ `actualizarEventoCalendar`

---

## 🧪 Paso 6: Testing

### 6.1 Test Manual desde Portal

1. Login como socio en: https://yucatanctp.org
2. Ir a **Agendar Cita**
3. Seleccionar fecha, hora, propósito
4. Submit
5. Verificar:
   - ✅ Cita creada en Firestore
   - ✅ Evento en Google Calendar del secretario
   - ✅ Email de invitación recibido por socio

### 6.2 Verificar Logs

```bash
# Ver logs de Firebase Functions
firebase functions:log --only crearEventoCalendar

# Logs en tiempo real
firebase functions:log --tail
```

### 6.3 Verificar en Firestore

1. Firebase Console → **Firestore Database**
2. Colección `citas` → Verificar documento creado tenga:
   - `calendarEventId`: ID del evento
   - `calendarEventLink`: Link directo al evento

---

## 🔒 Seguridad

### Archivos que NUNCA se deben commitear:

```
/functions/calendar_service_account.json
/scripts/oauth2_credentials.json
/scripts/calendar_service_account.json
```

### Agregar a .gitignore global:

```bash
# En /Applications/club-738-web/.gitignore
**/calendar_service_account.json
**/oauth2_credentials.json
```

---

## 🐛 Troubleshooting

### Error: "Calendar API has not been used in project"

**Solución**: Habilitar Google Calendar API en Google Cloud Console

### Error: "Insufficient Permission"

**Solución**: 
1. Verificar que service account tenga permisos en el calendario
2. Re-compartir calendario con email de service account

### Error: "Invalid credentials"

**Solución**: 
1. Verificar que `calendar_service_account.json` esté en `/functions/`
2. Re-download credenciales desde Google Cloud Console

### Evento creado pero sin invitación por email

**Solución**: 
1. Verificar `sendUpdates: 'all'` en código
2. Verificar que email del socio sea válido

### Zona horaria incorrecta

**Solución**: 
1. Verificar `timeZone: 'America/Merida'` en código
2. Ajustar según ubicación del club

---

## 📞 Contactos

- **Secretario**: Sergio Muñoz (smunozam@gmail.com)
- **Soporte Firebase**: https://firebase.google.com/support
- **Google Calendar API Docs**: https://developers.google.com/calendar/api/v3/reference

---

## ✅ Checklist de Implementación

- [ ] Proyecto Google Cloud creado
- [ ] Google Calendar API habilitado
- [ ] Service Account creada y JSON descargado
- [ ] Calendario compartido con service account
- [ ] Firebase Functions inicializado
- [ ] Dependencias instaladas (`googleapis`)
- [ ] `calendar_service_account.json` copiado a `/functions/`
- [ ] Archivo agregado a `.gitignore`
- [ ] Functions deployadas
- [ ] Test manual exitoso
- [ ] Email de invitación recibido
- [ ] Logs verificados sin errores

---

**Última actualización**: 10 Enero 2026  
**Versión del sistema**: v1.14.0

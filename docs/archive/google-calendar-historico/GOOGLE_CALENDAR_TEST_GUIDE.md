# 📅 Google Calendar Integration - Guía de Pruebas

## ✨ Resumen Rápido

Tu Google Calendar Integration funciona automáticamente en 4 pasos:

### PASO 1: Socio Crea Cita
- Entra a https://yucatanctp.org
- Click "Agendar Cita"
- Llena: Fecha, Hora, Propósito, Notas
- Click "GUARDAR CITA"
- ✅ Se guarda en Firestore

### PASO 2: Cloud Function Dispara (Automático)
- **Función**: `crearEventoCalendar()`
- **Trigger**: Cuando se crea una cita en Firestore
- **Qué hace**:
  - Carga credenciales del service account
  - Autentica con Google Calendar API
  - CREA EVENTO en Google Calendar

### PASO 3: Evento se Crea en Google Calendar
- **Calendario**: smunozam@gmail.com (secretario)
- **Evento creado con**:
  - 📅 Título: "📅 PETA - Juan Pérez"
  - 🕐 Hora: La misma que en la cita
  - ⏱️ Duración: 30 minutos
  - 🎨 Color: Azul (#9)
  - 🔔 Recordatorios: 24h, 1h, 15min
  - 📧 Invitación al socio por email

### PASO 4: Admin Ve Alerta en Tiempo Real
- **Componente**: NotificacionesCitas
- **Ubicación**: AdminDashboard
- **Muestra**:
  - 🔔 Banner naranja con citas pendientes
  - Información de cada cita
  - Botones: CONFIRMAR, CANCELAR, COMPLETAR

### PASO 5: Admin Toma Acción
- **Si CONFIRMA (✅)**:
  - Estado: "pendiente" → "confirmada"
  - Google Calendar: Color → Verde, Título → "✅ CONFIRMADA: ..."
  - Email al socio: "Tu cita ha sido confirmada"

- **Si CANCELA (❌)**:
  - Estado: "pendiente" → "cancelada"
  - Google Calendar: Evento ELIMINADO
  - Email al socio: "Tu cita ha sido cancelada"

- **Si COMPLETA (✔️)**:
  - Estado: "pendiente" → "completada"
  - Google Calendar: Color → Gris, Título → "✔️ COMPLETADA: ..."
  - Email al socio: "Tu cita ha sido completada"

---

## 🧪 Cómo Hacer Pruebas

### Opción 1: Prueba Manual por UI
1. Abre: https://yucatanctp.org
2. Login como SOCIO (cualquier email)
3. Ve a "Agendar Cita"
4. Llena el formulario:
   - **Fecha**: Hoy o mañana
   - **Hora**: 14:30
   - **Propósito**: PETA
   - **Notas**: "Prueba Google Calendar"
5. Click "GUARDAR CITA"
6. Espera 3-5 segundos
7. Abre https://calendar.google.com
8. Verifica que apareció el evento

### Opción 2: Prueba con Script Node.js
1. Abre terminal en `/Applications/club-738-web`
2. Ejecuta:
```bash
node scripts/test-calendar-integration.js
```
3. El script:
   - Crea una cita de prueba en Firestore
   - Espera a que Cloud Function procese
   - Verifica que se agregó `calendarEventId`
   - Muestra el resultado

### Opción 3: Monitorear Cloud Functions
1. Ve a: https://console.firebase.google.com/project/club-738-app
2. Ve a: **Functions** → **Logs**
3. Busca: `crearEventoCalendar` o `actualizarEventoCalendar`
4. Verás logs como:
   ```
   📅 Iniciando creación de evento en Google Calendar
   📤 Enviando request a Google Calendar API...
   ✅ Evento creado exitosamente: 7h8a9b0c...
   💾 Firestore actualizado con Event ID
   ```

---

## 📊 Datos Que Se Sincronizan

### De Firestore a Google Calendar
```
Cita (Firestore)              →  Evento (Google Calendar)
├─ socioNombre                →  Asistente (nombre)
├─ socioEmail                 →  Asistente (email)
├─ fecha + hora               →  Fecha/Hora del evento
├─ proposito                  →  Parte del título
├─ notas                      →  Parte de la descripción
└─ createdAt                  →  createdTime del evento
```

### De Google Calendar a Firestore
```
Evento (Google Calendar)      →  Cita (Firestore)
├─ eventId                    →  calendarEventId
├─ htmlLink                   →  calendarEventLink
├─ createdTime                →  calendarEventCreated
└─ (si se actualiza)          →  calendarEventUpdated
```

---

## 🔍 Qué Verificar

Después de crear una cita:

### En Firestore (Firebase Console)
- ✅ Ve a: Database → citas → [citaId]
- ✅ Busca campo: `calendarEventId` (debe tener un valor)
- ✅ Busca campo: `calendarEventLink` (debe tener URL)

### En Google Calendar
- ✅ Abre: https://calendar.google.com
- ✅ Ve a: smunozam@gmail.com
- ✅ Busca evento con el nombre del socio
- ✅ Color debe ser: 🔵 Azul

### En Gmail (Confirmación)
- ✅ El socio recibe email: "Calendar invitation: [Nombre]"
- ✅ Email viene de: `noreply@google.com`
- ✅ Incluye link directo a Google Calendar

---

## ⚙️ Componentes Involucrados

| Archivo | Rol | Ubicación |
|---------|-----|-----------|
| `functions/calendar-integration.js` | Crea/actualiza eventos | Backend (Cloud Functions) |
| `functions/index.js` | Exporta las funciones | Backend (Cloud Functions) |
| `src/components/AgendarCita.jsx` | Socio crea cita | Frontend (React) |
| `src/components/MiAgenda.jsx` | Admin gestiona citas | Frontend (React) |
| `src/components/admin/NotificacionesCitas.jsx` | Alertas en tiempo real | Frontend (React) |

---

## 📍 Archivos Clave

### Backend
- **Cloud Functions v2 API**: `onDocumentCreated`, `onDocumentUpdated`
- **Google Calendar API v3**: `events.insert()`, `events.update()`, `events.delete()`
- **Service Account**: `/functions/calendar_service_account.json`

### Firestore Collection
- **Path**: `citas/{citaId}`
- **Documentos**: Uno por cada cita creada
- **Campos**: socioEmail, socioNombre, fecha, hora, proposito, estado, calendarEventId, etc

### Configuración
- **Calendario**: smunozam@gmail.com
- **Zona horaria**: America/Merida
- **Service Account Email**: firebase-adminsdk-fbsvc@club-738-appgit-50256612-450b8.iam.gserviceaccount.com

---

## 🐛 Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Evento no aparece en Google Calendar | Cloud Function no se ejecutó | Revisa logs en Firebase Console |
| `calendarEventId` vacío en Firestore | Error en Cloud Function | Ve a Functions → Logs para ver error |
| Email de invitación no llega | Socio email incorrecto | Verifica que socioEmail sea válido |
| Función tarda mucho | Primera ejecución | Las funciones tardan más la primera vez |

---

## 🚀 Resumen de Deploy

- ✅ **firebase deploy --only functions** completado exitosamente
- ✅ **crearEventoCalendar**: Node.js 22 (2nd Gen) ✓
- ✅ **actualizarEventoCalendar**: Node.js 22 (2nd Gen) ✓
- ✅ **Región**: us-central1
- ✅ **Máximo instancias**: 10
- ✅ **Status**: ACTIVO en producción

---

## 📞 Próximos Pasos Recomendados

1. ✅ **Crear cita de prueba** vía UI o script
2. ✅ **Verificar Google Calendar** después de 3-5 segundos
3. ✅ **Revisar email** de invitación al socio
4. ✅ **Confirmar cita** desde AdminDashboard
5. ✅ **Verificar cambio de color** en Google Calendar
6. ✅ **Monitorear logs** en Firebase Console

¡Todo listo para probar! 🎉

# 📅 Google Calendar Integration - Flujo Visual

## 🔄 Cómo Funciona la Integración

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DE CITAS                      │
└─────────────────────────────────────────────────────────────────┘

1️⃣  CREAR CITA (Socio)
    ↓
    Socio entra a "Agendar Cita"
    Selecciona: Fecha, Hora, Propósito
    Click "Guardar Cita"
    ↓
    📝 Se crea documento en Firestore: citas/{citaId}
    ↓
    🚀 Se dispara TRIGGER: crearEventoCalendar()


2️⃣  CREAR EVENTO EN GOOGLE CALENDAR
    ↓
    Cloud Function recibe: Datos de la cita
    ↓
    📧 Autentica con Service Account
    📧 Accede a Google Calendar (smunozam@gmail.com)
    ↓
    📅 CREA EVENTO CON:
    ✅ Título:     "📅 PETA - Juan Pérez"
    ✅ Fecha/Hora: 2026-01-31 14:30
    ✅ Duración:   30 minutos
    ✅ Color:      Azul (#9)
    ✅ Recordatorios: 24h, 1h, 15min
    ✅ Asistente:  socio@email.com
    ↓
    📬 ENVÍA EMAIL al socio:
    "Te han invitado a: PETA - Juan Pérez"
    "Accede a: [Google Calendar Link]"


3️⃣  ADMIN VE ALERTA EN TIEMPO REAL
    ↓
    Banner "🔔 Tienes 3 citas pendientes"
    Click en cita → Abre modal MiAgenda
    ↓
    ① CONFIRMAR (Click botón ✅ CONFIRMAR)
    ② CANCELAR (Click botón ❌ CANCELAR)
    ③ COMPLETADA (Click botón ✔️ COMPLETADA)


4️⃣  ACTUALIZAR ESTADO EN GOOGLE CALENDAR
    ↓
    Se actualiza en Firestore: estado = "confirmada"
    ↓
    🚀 Se dispara TRIGGER: actualizarEventoCalendar()
    ↓
    
    SI estado = "confirmada":
    └─→ Google Calendar:
        ├─ Título: "✅ CONFIRMADA: PETA - Juan Pérez"
        ├─ Color: Verde (#10)
        └─ Email: Notifica cambio al socio
    
    SI estado = "completada":
    └─→ Google Calendar:
        ├─ Título: "✔️ COMPLETADA: PETA - Juan Pérez"
        ├─ Color: Gris (#8)
        └─ Email: Notifica cambio al socio
    
    SI estado = "cancelada":
    └─→ Google Calendar:
        ├─ Elimina evento
        └─ Email: Notifica cancelación al socio
```

---

## 📊 Arquitectura de Componentes

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  AgendarCita.jsx          MiAgenda.jsx      AdminDashboard.jsx│
│  (Socio)                  (Admin)           (Admin)            │
│  └─ Crear cita            └─ Confirmar      └─ Alerts        │
│     Save to Firestore        Completar      └─ NotificacionesCitas
│                              Cancelar           (Real-time)    │
│                                                                │
└───────────────┬──────────────────────────────┬────────────────┘
                │                              │
                │ onSnapshot listeners         │ Real-time data
                │                              │
┌───────────────▼──────────────────────────────▼────────────────┐
│                    FIRESTORE DATABASE                          │
├────────────────────────────────────────────────────────────────┤
│  Collection: citas/{citaId}                                   │
│  ├─ socioEmail: "juan@email.com"                              │
│  ├─ socioNombre: "Juan Pérez"                                 │
│  ├─ fecha: "2026-01-31"                                       │
│  ├─ hora: "14:30"                                             │
│  ├─ proposito: "peta"                                         │
│  ├─ estado: "pendiente" → "confirmada" → "completada"        │
│  ├─ calendarEventId: "abc123xyz789"  (Set por Cloud Function)│
│  └─ calendarEventLink: "https://calendar.google.com/..."    │
│                                                                │
└────────────────┬───────────────────────────────────┬──────────┘
                 │ Triggers                          │
                 │                                   │
         ┌───────▼───────────┐           ┌───────────▼────────┐
         │  onCreate Event   │           │  onUpdate Event    │
         │  (documentId)     │           │  (estado changed)  │
         └────────┬──────────┘           └──────────┬─────────┘
                  │                                 │
┌─────────────────▼─────────────────────────────────▼──────────┐
│             CLOUD FUNCTIONS (Node.js 22 Gen 2)               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  functions/calendar-integration.js                           │
│                                                                │
│  ✅ crearEventoCalendar()                                     │
│     Trigger: citas/{citaId} onCreate                          │
│     └─→ Crea evento en Google Calendar                       │
│     └─→ Envía email al socio                                 │
│                                                                │
│  ✅ actualizarEventoCalendar()                                │
│     Trigger: citas/{citaId} onUpdate                          │
│     └─→ Actualiza evento según estado                        │
│     └─→ Cambia color y título                                │
│     └─→ Notifica cambios por email                           │
│                                                                │
└────────────────┬────────────────┬────────────────────────────┘
                 │                │
                 │ Google Auth    │
                 │ JWT Token      │
                 │                │
         ┌───────▼────────────────▼──────────────────┐
         │   GOOGLE CALENDAR API v3                 │
         ├──────────────────────────────────────────┤
         │                                           │
         │  Service Account:                        │
         │  firebase-adminsdk-fbsvc@...             │
         │                                           │
         │  Calendario:                             │
         │  smunozam@gmail.com (Secretario)        │
         │                                           │
         │  Acciones:                               │
         │  ├─ events.insert()   → Crear evento    │
         │  ├─ events.update()   → Actualizar     │
         │  └─ events.delete()   → Eliminar        │
         │                                           │
         └──────────────────────────────────────────┘
```

---

## 🎬 Estados y Transiciones

```
PENDIENTE (Estado Inicial)
    │
    ├─→ ✅ CONFIRMAR
    │   ├─ Título: "✅ CONFIRMADA: ..."
    │   ├─ Color: Verde (#10)
    │   └─ Email: Confirmación al socio
    │   │
    │   └─→ ✔️ COMPLETADA
    │       ├─ Título: "✔️ COMPLETADA: ..."
    │       ├─ Color: Gris (#8)
    │       └─ Email: Finalización al socio
    │
    └─→ ❌ CANCELAR
        ├─ Evento: ELIMINADO del calendario
        └─ Email: Cancelación al socio
```

---

## 📱 Pantallas Involucradas

### 1️⃣ **AgendarCita.jsx** (Socio)
```
┌────────────────────────────────┐
│  AGENDAR CITA                  │
├────────────────────────────────┤
│                                │
│  📅 Fecha: [2026-01-31]        │
│  🕐 Hora:  [14:30]             │
│  📋 Propósito:                 │
│     ○ PETA                     │
│     ○ Pago                     │
│     ○ Documentos               │
│  📝 Notas: [____________]      │
│                                │
│         [✅ GUARDAR CITA]      │
│                                │
└────────────────────────────────┘
        ↓ Click
    Firestore cita creada
        ↓
Cloud Function dispara automáticamente
        ↓
Google Calendar evento creado + email
```

### 2️⃣ **MiAgenda.jsx** (Admin/Secretario)
```
┌────────────────────────────────────────┐
│  MIS CITAS                             │
├────────────────────────────────────────┤
│                                        │
│  CITA #1                              │
│  👤 Juan Pérez (juan@email.com)      │
│  📅 31 Enero 2026 - 14:30            │
│  📋 PETA                              │
│  📌 Estado: PENDIENTE                 │
│                                        │
│  [✅ CONFIRMAR] [❌ CANCELAR]         │
│                                        │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                        │
│  CITA #2                              │
│  👤 María García (maria@email.com)   │
│  📅 31 Enero 2026 - 16:00            │
│  📋 Pago                              │
│  📌 Estado: CONFIRMADA ✅             │
│                                        │
│  [✔️ COMPLETADA] [🔄 EDITAR]         │
│                                        │
└────────────────────────────────────────┘
```

### 3️⃣ **NotificacionesCitas.jsx** (Admin Dashboard)
```
┌─────────────────────────────────────────────────────┐
│  🔔 TIENES 5 CITAS PENDIENTES           [▲ Colapsar]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Juan Pérez - 31 Ene 14:30 - PETA              │
│     [✅ CONFIRMAR RÁPIDO]                         │
│                                                     │
│  2. María García - 31 Ene 16:00 - Pago            │
│     [✅ CONFIRMAR RÁPIDO]                         │
│                                                     │
│  3. Carlos López - 01 Feb 10:00 - Documentos      │
│     [✅ CONFIRMAR RÁPIDO]                         │
│                                                     │
│  ...                                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Logs en Google Cloud

Cuando se crea/actualiza una cita, verás logs como:

```
📅 Iniciando creación de evento en Google Calendar
   Cita ID: cita_abc123
   Socio: Juan Pérez (juan@email.com)
   Fecha: 2026-01-31 14:30

📤 Enviando request a Google Calendar API...

✅ Evento creado exitosamente: 7h8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3
🔗 Link: https://calendar.google.com/calendar/event?eid=7h8a9b0c...

💾 Firestore actualizado con Event ID

─────────────────────────────────────

📅 Actualizando evento abc123xyz
   Estado: pendiente → confirmada

✅ Confirmando evento...

✅ Evento confirmado
```

---

## ✅ Checklist de Configuración

- ✅ Service Account JSON: `/functions/calendar_service_account.json`
- ✅ Google Calendar: Compartido con service account
- ✅ Cloud Functions v2: Deployd exitosamente
- ✅ Firestore Rules: Permite lectura/escritura en citas
- ✅ Frontend Components: NotificacionesCitas, MiAgenda, AgendarCita

---

## 🚀 Próximas Pruebas

1. **Test 1**: Crear cita de prueba
   - Verificar evento en Google Calendar
   - Verificar email de invitación

2. **Test 2**: Confirmar cita
   - Verificar cambio de color en Google Calendar
   - Verificar email de confirmación

3. **Test 3**: Cancelar cita
   - Verificar eliminación de evento en Google Calendar
   - Verificar email de cancelación


# 📧 Modal de Preview y Edición de Recordatorios - v1.35.4

**Fecha de Implementación**: 24 Enero 2026  
**Versión**: v1.35.4  
**Estado**: ✅ PRODUCCIÓN  

---

## 🎯 Objetivo Principal

**Evitar SPAM y permitir personalización de mensajes** antes de enviar recordatorios a socios pendientes.

En lugar de enviar automáticamente, ahora tienes la oportunidad de:
- ✅ Revisar cada mensaje individualmente
- ✅ Editar el contenido para personalizarlo
- ✅ Navegar entre todos los destinatarios
- ✅ Confirmar antes de enviar

---

## 🚀 Cómo Usar

### Paso 1: Abre Reporte Contable
1. Ve a Admin → Panel Cobranza → Reporte Contable
2. Verás la sección **"📢 ENVIAR RECORDATORIOS A PENDIENTES"**

### Paso 2: Elige el Canal
```
┌─────────────────────────────────────────┐
│ 📢 ENVIAR RECORDATORIOS A PENDIENTES   │
│ ⏰ Plazo límite: 28 de febrero de 2026 │
│                                         │
│  [📧 Enviar por Email (7)]              │
│  [💬 Enviar por WhatsApp (7)]           │
└─────────────────────────────────────────┘
```

El número entre paréntesis indica cuántos socios pendientes hay.

### Paso 3: Se Abre el Modal de Preview

```
╔═══════════════════════════════════════════════════════════╗
║ 🔍 Revisar Mensajes - EMAIL                           ✕  ║
║ Mensaje 1 de 7                                          ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║ DESTINATARIO:                                            ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Luis Fernando Guillermo Gamboa                       │  ║
║ │ 📧 luis.fernando@email.com                          │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ MENSAJE (EDITABLE):                                      ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Estimado(a) Luis Fernando,                          │  ║
║ │                                                       │  ║
║ │ Le recordamos que debe realizar su pago de          │  ║
║ │ renovación de membresía antes del 28 de febrero     │  ║
║ │ de 2026.                                            │  ║
║ │                                                       │  ║
║ │ MONTO A PAGAR: $6,500 MXN                          │  ║
║ │ CONCEPTO: Cuota de Renovación 2026                │  ║
║ │                                                       │  ║
║ │ Para realizar su pago, favor de contactar          │  ║
║ │ directamente con la tesorería del club.            │  ║
║ │                                                       │  ║
║ │ Agradecemos su puntualidad.                        │  ║
║ │                                                       │  ║
║ │ ---                                                  │  ║
║ │ Club de Caza, Tiro y Pesca de Yucatán, A.C.       │  ║
║ │ Tel: +52 56 6582 4667                             │  ║
║ │                                                       │  ║
║ └─────────────────────────────────────────────────────┘  ║
║ 356 caracteres                                            ║
║                                                           ║
║  [← Anterior]    [Siguiente →]                           ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║ [❌ Cancelar]    [✅ Enviar 7 Recordatorios]             ║
╚═══════════════════════════════════════════════════════════╝
```

### Paso 4: Personaliza el Mensaje (Opcional)

Puedes **editar el mensaje directamente en el textarea**:

- ✏️ Añade información personal
- ✏️ Cambia el tono si es necesario
- ✏️ Agrega detalles específicos del socio
- ✏️ El contador de caracteres actualiza en tiempo real

**Ejemplo - Antes**:
```
Estimado(a) Luis Fernando,

Le recordamos que debe realizar su pago...
```

**Ejemplo - Después (Personalizado)**:
```
Estimado Lucho,

¡Nos falta tu pago para completar el registro! Recuerda que el plazo vence el 28 de febrero.

Tu cuota anual 2026 es de $6,500 MXN. Puedes pagar con Ricardo en tesorería o transferir a la cuenta del club.

¡Vamos, que es rápido! 💪

Club de Caza, Tiro y Pesca de Yucatán
Tel: +52 56 6582 4667
```

### Paso 5: Navega Entre los Mensajes

Use los botones **Anterior** y **Siguiente** para revisar cada destinatario:

- `[← Anterior]` - Deshabilitado en el primer mensaje
- `[Siguiente →]` - Deshabilitado en el último mensaje
- El contador superior muestra: "Mensaje 1 de 7"

### Paso 6: Confirma el Envío

Cuando estés satisfecho con todos los mensajes, haz clic en:

```
[✅ Enviar 7 Recordatorios]
```

- El botón muestra la cantidad total de mensajes
- Al hacer clic, se envían TODOS los mensajes editados
- Verás un toast confirmando: "7 recordatorios por email ✓"

### Paso 7: Cancelar (Si Cambias de Idea)

En cualquier momento puedes hacer clic en:

```
[❌ Cancelar]
```

O en la **X** en la esquina superior derecha del modal para cerrar sin enviar nada.

---

## 📊 Diferencias: Email vs WhatsApp

### 📧 Email

**Tono**: Formal, profesional  
**Formato**: Párrafos completos  
**Máximo**: Sin límite de caracteres (pero el contador te ayuda)  

**Ejemplo Predefinido**:
```
Estimado(a) [NOMBRE],

Le recordamos que debe realizar su pago de renovación de membresía antes del 
28 de febrero de 2026.

MONTO A PAGAR: $6,500 MXN
CONCEPTO: Cuota de Renovación 2026

Para realizar su pago, favor de contactar directamente con la tesorería del club.

Agradecemos su puntualidad.

---
Club de Caza, Tiro y Pesca de Yucatán, A.C.
Calle 50 No. 531-E x 69 y 71, Col. Centro, 97000 Mérida, Yucatán
Tel: +52 56 6582 4667
```

---

### 💬 WhatsApp

**Tono**: Informal, amigable  
**Formato**: Mensajes cortos, emojis  
**Máximo**: Idealmente <160 caracteres por mensaje (estándar SMS)  

**Ejemplo Predefinido**:
```
¡Hola [NOMBRE]! 👋

Recordatorio importante: Tu renovación de membresía vence el 28 de febrero de 2026.

💰 Monto: $6,500 MXN
📋 Concepto: Cuota Anual 2026

Favor contactar al club para procesar tu pago.

🏹 Club de Caza, Tiro y Pesca de Yucatán
Teléfono: +52 56 6582 4667
```

---

## ⚙️ Detalles Técnicos

### Estados del Modal

| Estado | Descripción |
|--------|-------------|
| **Cerrado** | Normal, ver botones "Enviar por Email/WhatsApp" |
| **Abierto** | Modal visible con mensaje editable |
| **Enviando** | El botón "Enviar" muestra "⏳ Enviando..." (deshabilitado) |
| **Completado** | Se cierra automáticamente después del envío |

### Funciones Principales

```javascript
// 1. Mostrar modal con mensajes generados
enviarRecordatoriosPendientes(tipo: 'email' | 'whatsapp')

// 2. Generar mensajes personalizados para cada socio
generarMensajesPersonalizados(socios, tipo)

// 3. Actualizar un mensaje individual
actualizarMensaje(nuevoMensaje)

// 4. Enviar todos los mensajes a Cloud Function
confirmarEnvio()

// 5. Cerrar modal sin enviar
cancelarEnvio()
```

### Cloud Function Actualizada

La función `enviarRecordatorios` ahora acepta **dos formatos**:

**Formato Nuevo (Recomendado)**:
```javascript
{
  tipo: 'email' | 'whatsapp',
  mensajes: [
    {
      email: 'user@email.com',
      nombre: 'Luis Fernando',
      telefono: '+5291234567',
      mensaje: 'Mensaje personalizado...'
    },
    // ... más mensajes
  ]
}
```

**Formato Antiguo (Legacy - Sigue Funcionando)**:
```javascript
{
  tipo: 'email' | 'whatsapp',
  socios: [
    {
      email: 'user@email.com',
      nombre: 'Luis Fernando',
      telefono: '+5291234567',
      monto: 6500
    },
    // ... más socios
  ]
}
```

---

## 🎨 Estilos CSS

El modal es completamente **responsivo**:

### Desktop (≥900px)
- Modal: 700px de ancho
- Textarea: 12 filas visibles
- Botones: Lado a lado

### Tablet (600px - 900px)
- Modal: 90% del ancho
- Textarea: 10 filas
- Botones: Lado a lado

### Mobile (<600px)
- Modal: Full-width con padding
- Textarea: 8 filas
- Botones: Full-width (stack vertical)

---

## ⚠️ Notas Importantes

### Prevención de SPAM

1. **Lee cada mensaje** antes de enviar
2. **Evita enviar demasiado frecuentemente** (máximo 1-2 veces por semana)
3. **Personaliza si es posible** (aumenta tasa de respuesta)
4. **Verifica destinatarios** (especialmente WhatsApp)
5. **Respeta el deadline** de 28 de febrero

### Límites Técnicos

- ✅ Máximo socios por envío: Ilimitado (procesado en Cloud Function)
- ✅ Caracteres por mensaje: Ilimitado (pero contador te advierte)
- ✅ Formatos soportados: Email, WhatsApp (futuro: SMS, Telegram)
- ⏳ Tiempo de envío: ~1-2 segundos por socio

### Auditoría

Cada envío se registra en:
- `functions/index.js` - Logs de Cloud Function
- Firebase Console → Functions → Logs
- Cada mensaje exitoso: `✅ [CANAL] enviado a [DESTINATARIO]`

---

## 🐛 Troubleshooting

### El modal no abre

**Problema**: Hago clic en "Enviar por Email" pero no pasa nada  
**Solución**:
1. Verifica que hay socios **pendientes** (estado = 'pendiente')
2. Abre la consola del navegador (F12 → Console)
3. Revisa si hay errores de red

### El botón "Enviar" no funciona

**Problema**: Hago clic en "✅ Enviar X Recordatorios" pero nada pasa  
**Solución**:
1. Verifica la conexión a internet
2. Abre la consola (F12 → Network)
3. Busca la petición a `https://us-central1-club-738-app.cloudfunctions.net/enviarRecordatorios`
4. Si dice "Blocked by CSP" → Contacta al admin (error de configuración)

### Los mensajes se ven cortados

**Problema**: El textarea en mobile no muestra todo el contenido  
**Solución**:
1. Scroll dentro del textarea (está habilitado)
2. En desktop deberías ver todo sin problemas
3. Si el problema persiste, reporta al admin

### No se envió el recordatorio a un socio

**Problema**: El modal dice "7 enviados" pero el socio no recibió nada  
**Solución**:
1. Verifica que el **email/teléfono es correcto** en Firestore
2. Chequea la carpeta de SPAM del destinatario
3. Revisa los logs de Cloud Function en Firebase Console
4. Si el problema persiste, registra manualmente (RegistroPagos)

---

## 📈 Mejoras Futuras

- [ ] Historial de recordatorios enviados
- [ ] Plantillas de mensajes guardables
- [ ] Vista previa de email HTML (formato final)
- [ ] Integración real de WhatsApp (actualmente simulado)
- [ ] Programación de envíos (enviar en X fecha/hora)
- [ ] Analytics: tasa de apertura, clics, conversiones
- [ ] A/B testing de mensajes

---

## 📞 Soporte

Si tienes problemas con el modal:

1. **Reporta en**: Issues → GitHub
2. **Incluye**: Número de socios, qué error ves, screenshot
3. **Admin**: admin@club738.com

---

**Versión**: v1.35.4  
**Última Actualización**: 24 Enero 2026  
**Estado**: Producción ✅


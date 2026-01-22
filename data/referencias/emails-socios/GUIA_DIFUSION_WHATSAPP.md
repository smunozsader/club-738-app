# 📱 Guía WAPI Sender - Difusión Lanzamiento Portal

> **Actualizado**: 9 enero 2026  
> **Tipo de campaña**: Difusión masiva NO segmentada  
> **Objetivo**: Anunciar portal + Invitar a renovar + Generar expedientes digitales

---

## 🎯 Objetivo de la Campaña

**UN SOLO MENSAJE** para todos los socios:
- ✅ Anunciar lanzamiento del portal yucatanctp.org
- ✅ Entregar credenciales de acceso
- ✅ Invitar a renovar membresía 2026 ($6,000)
- ✅ Promover creación de expediente digital
- ✅ Motivar subida de documentos PETA

---

## 📊 Alcance

| Concepto | Cantidad |
|----------|----------|
| **Socios con WhatsApp** | 73 |
| **Sin WhatsApp** | 1 (KRISZTIAN GOR) |
| **Excluidos** | 1 (Sergio, secretario) |
| **Total socios activos** | 75 |

**Nota**: No hay segmentación por morosidad. Todos reciben el mismo mensaje.

---

## 📁 Archivos Necesarios

```
✅ whatsapp-difusion-portal.csv        → CSV con 73 socios
✅ WAPI-Template-Difusion-Portal.txt   → Template del mensaje
```

**Ubicación**: `emails-socios/`

---

## 📝 Contenido del Mensaje

```
Hola {First Name} 👋

El *Club de Caza, Tiro y Pesca de Yucatán, A.C.* estrena portal web:

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: {Email}
• Contraseña: {Password}
• Credencial: #{Credencial}

📋 DESDE EL PORTAL PUEDES:
✅ Generar tu expediente electrónico PETA
✅ Subir tus documentos digitales
✅ Solicitar trámites de transportación
✅ Consultar tus armas registradas
✅ Ver calendario de tiradas 2026

💰 *RENOVACIÓN 2026*: $6,000 MXN
Incluye: 1 PETA gratis

📤 *COMPLETA TU EXPEDIENTE DIGITAL*:
Sube tus documentos para agilizar trámites

⚠️ *Cambia tu contraseña al entrar*
(Menú → Mi Perfil)

📞 Dudas o para renovar: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.
```

---

## 🚀 Procedimiento de Envío

### PASO 1: Preparación

1. **Verificar WAPI Sender** instalado en Chrome
2. **Abrir WhatsApp Web**: https://web.whatsapp.com
3. **Escanear código QR** con tu teléfono
4. Esperar a que cargue completamente

### PASO 2: Configurar WAPI Sender

1. Click en ícono de **WAPI Sender** en Chrome
2. Click **"Upload Excel"** o **"Choose File"**
3. Seleccionar: `whatsapp-difusion-portal.csv`
4. Verificar: ✅ **"73 contacts loaded"**

### PASO 3: Configurar el Mensaje

1. Abrir archivo: `WAPI-Template-Difusion-Portal.txt`
2. **Copiar TODO el contenido** (Ctrl+A, Ctrl+C)
3. **Pegar** en campo "WhatsApp Messages" de WAPI Sender
4. Verificar que se vean los placeholders: `{First Name}`, `{Email}`, etc.

### PASO 4: Configurar Intervalo

⚠️ **MUY IMPORTANTE**:
- Configurar **10-12 segundos** entre mensajes
- NO usar menos de 8 segundos (riesgo de bloqueo)

### PASO 5: Prueba (RECOMENDADO)

**Antes de enviar a todos**:
1. Edita el CSV temporalmente con solo **3 contactos**
2. Incluye tu propio número
3. Click **"Send now"**
4. Verifica que los mensajes lleguen correctamente
5. Confirma que placeholders se reemplazan bien

### PASO 6: Envío Completo

1. Sube el CSV completo (73 socios)
2. Verifica configuración:
   - ✅ Mensaje correcto
   - ✅ Intervalo 10-12 segundos
   - ✅ 73 contactos
3. Click **"Send now"** o **"Start sending"**
4. **NO cerrar WhatsApp Web** durante el envío
5. **NO usar WhatsApp** en el teléfono mientras envía

---

## ⏱️ Tiempos Estimados

| Actividad | Tiempo |
|-----------|--------|
| Configuración inicial | 3 min |
| Envío 73 mensajes (11 seg/mensaje) | 13-14 min |
| **TOTAL** | **~17 min** |

---

## ⚠️ Durante el Envío

### ✅ SÍ hacer:
- Dejar la pestaña de WhatsApp Web abierta
- Mantener teléfono con internet estable
- Dejar la computadora encendida
- Ir por un café ☕

### ❌ NO hacer:
- Cerrar WhatsApp Web
- Usar WhatsApp en el celular
- Usar WhatsApp Web manualmente
- Apagar la computadora
- Cambiar de pestaña en Chrome

---

## 🔍 Verificación Post-Envío

### Revisar Estadísticas WAPI

Al finalizar verás:
- **Total enviados**: 73
- **Exitosos**: Idealmente 73
- **Fallidos**: Verificar por qué

### Revisar Chats WhatsApp

1. Abre WhatsApp Web
2. Busca los últimos chats enviados
3. Verifica:
   - Formato correcto (negritas con *)
   - Credenciales únicas por socio
   - Sin duplicados

### Reenviar Fallidos

Si algún mensaje no llegó:
- Copia el template
- Reemplaza manualmente `{First Name}`, `{Email}`, `{Password}`, `{Credencial}`
- Envía por WhatsApp directo

---

## 📧 Socio Sin Teléfono

**KRISZTIAN GOR** (credencial 227)
- Email: ttok09136@gmail.com
- **Acción**: Enviar credenciales por correo electrónico

---

## 🛡️ Seguridad

### Límites de WhatsApp

- ✅ **Hasta 300 mensajes/día**: Seguro
- ⚠️ **Más de 500/día**: Riesgo de bloqueo

**Nuestra campaña (73 mensajes)**: ✅ **Totalmente seguro**

### Si WhatsApp Bloquea Temporalmente

1. Espera 2-4 horas
2. Aumenta intervalo a 15-20 segundos
3. Reinicia el envío desde donde quedó

---

## 📋 Checklist Pre-Envío

- [ ] WAPI Sender instalado
- [ ] WhatsApp Web funcionando
- [ ] Teléfono conectado a internet
- [ ] CSV descargado: whatsapp-difusion-portal.csv
- [ ] Template copiado: WAPI-Template-Difusion-Portal.txt
- [ ] Intervalo configurado: 10-12 segundos
- [ ] Prueba realizada con 2-3 contactos
- [ ] Tiempo disponible: 20 minutos sin interrupciones

---

## 🔄 Regenerar Archivos

Si necesitas volver a generar el CSV y template:

```powershell
node scripts/generar-wapi-difusion.cjs
```

---

## 📊 Comparación con Email

| Aspecto | Email | WhatsApp |
|---------|-------|----------|
| **Destinatarios** | 76 socios | 73 socios |
| **Segmentación** | Sí (general/morosos) | NO (mensaje único) |
| **Tiempo** | 2 días | 15 minutos |
| **Herramienta** | YAMM | WAPI Sender |
| **Límite diario** | 50 emails/día | Sin límite (con intervalos) |

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué no segmentar entre morosos y al corriente?**  
R: Para simplificar el mensaje y unificar la campaña. Todos reciben invitación a renovar.

**P: ¿Qué pasa con los que ya pagaron 2026?**  
R: Igual reciben el mensaje. Enfocarse en el portal y expediente digital.

**P: ¿Puedo enviar más tarde?**  
R: Sí, pero coordina con el envío de emails para consistencia.

**P: ¿Qué si un socio no tiene smartphone?**  
R: El mensaje llegará igual. Si no puede acceder al portal, asistirlo manualmente.

---

## 📞 Soporte Técnico

| Problema | Solución |
|----------|----------|
| CSV no carga | Verificar formato .csv (no .xlsx) |
| Placeholders no se reemplazan | Verificar nombres de columnas |
| WhatsApp se desconecta | Internet estable en teléfono |
| Números inválidos | Formato +52XXXXXXXXXX |
| Extensión no aparece | Actualizar Chrome |

---

**¡Éxito con la difusión del portal! 🚀**

*Club de Caza, Tiro y Pesca de Yucatán, A.C.*

# 📧 GUÍA RÁPIDA: Mail Merge para 77 Socios
**9 de Enero 2026 - Lanzamiento Portal YucatanCTP**

---

## ✅ PASO 1: Instalar Extensión (5 minutos)

1. Abre Chrome/Edge
2. Ve a Chrome Web Store
3. Busca: **"Yet Another Mail Merge"** (YAMM)
4. Click **"Agregar a Chrome"**
5. Acepta permisos

**Límite gratuito**: 50 emails/día
**Plan**: Enviar 50 hoy + 27 mañana

---

## ✅ PASO 2: Preparar Email en Gmail (3 minutos)

### A. Abrir Gmail
- Ve a https://gmail.com
- Inicia sesión con: **smunozam@gmail.com**

### B. Crear Borrador
1. Click **"Redactar"**
2. **Asunto**: 
   ```
   Bienvenido al nuevo portal YucatanCTP - Tus credenciales
   ```
3. **Cuerpo**:
   - Abre el archivo: `/Applications/club-738-web/emails-socios/TEMPLATE_MAIL_MERGE.html`
   - Selecciona TODO el contenido (Cmd+A)
   - Copia (Cmd+C)
   - Pega en Gmail (Cmd+V)

**IMPORTANTE**: Verifica que las variables estén intactas:
- `{{Nombre}}`
- `{{Email}}`
- `{{Credencial}}`
- `{{Password}}`

---

## ✅ PASO 3: Configurar Mail Merge (2 minutos)

1. En el email borrador, click en ícono **YAMM** (abajo derecha)
2. Click **"Start Mail Merge"**
3. **Upload CSV**:
   - Selecciona: `/Applications/club-738-web/emails-socios/mail-merge-data.csv`
4. **Mapear columnas**:
   - To: `Email`
   - Nombre: `Nombre`
   - Credencial: `Credencial`
   - Password: `Password`
5. Click **"Preview"** para ver un ejemplo
6. **Enviar prueba** a tu email (smunozam@gmail.com) primero

---

## ✅ PASO 4: Envío Masivo (Automático)

### Primera Tanda (50 emails)
1. Click **"Send emails"**
2. YAMM enviará automáticamente
3. Progreso: Ver en "Sent" de Gmail
4. Tiempo estimado: **5-10 minutos**

### Segunda Tanda (27 emails) - Mañana 10 de Enero
1. Repite los pasos 2-4
2. YAMM recordará la configuración
3. Solo sube el CSV de nuevo y envía

---

## 🔥 CONSEJOS IMPORTANTES

### Evitar Spam
- ✅ Envía máximo 50/día (YAMM gratuito)
- ✅ Espera 24 horas entre tandas
- ✅ NO cambies el asunto ni cuerpo (Gmail detecta patrones)
- ✅ Verifica que FROM sea: "smunozam@gmail.com"

### Monitoreo
- Ver estadísticas en YAMM Dashboard
- Revisar "Sent" en Gmail
- Comprobar que no hay "bounces" (rebotes)

### Errores Comunes
- ❌ Variables sin doble llave: `{Nombre}` → `{{Nombre}}`
- ❌ CSV mal formateado (YAMM te avisará)
- ❌ Enviar más de 50/día (se pausará automáticamente)

---

## 📊 RESUMEN

| Ítem | Valor |
|------|-------|
| **Total socios** | 77 |
| **Tanda 1** (hoy) | 50 emails |
| **Tanda 2** (mañana) | 27 emails |
| **Tiempo estimado** | 15 min total |
| **Archivo CSV** | `/Applications/club-738-web/emails-socios/mail-merge-data.csv` |
| **Template HTML** | `/Applications/club-738-web/emails-socios/TEMPLATE_MAIL_MERGE.html` |

---

## 🎯 CHECKLIST PRE-ENVÍO

Antes de hacer click en "Send emails":

- [ ] Extensión YAMM instalada
- [ ] Gmail abierto con smunozam@gmail.com
- [ ] Template HTML copiado en Gmail
- [ ] Variables {{...}} correctas
- [ ] CSV subido y mapeado
- [ ] Email de prueba enviado y revisado
- [ ] Asunto correcto
- [ ] Horario apropiado (9-11 AM recomendado)

---

## 📧 EMAIL DE PRUEBA

**ANTES de enviar a todos**, envía 1 email de prueba:

1. En YAMM, filtra CSV a solo 1 fila (tu email)
2. Envía
3. Revisa en tu bandeja:
   - ✅ Diseño se ve bien
   - ✅ Variables reemplazadas correctamente
   - ✅ Links funcionan (https://yucatanctp.org)
   - ✅ No hay errores de formato

---

## 🆘 SOPORTE

Si algo falla:
- **YAMM Support**: https://support.yet-another-mail-merge.com/
- **Gmail Limits**: https://support.google.com/mail/answer/22839

---

**¡Todo listo para mañana! 🚀**

Archivos en:
- `/Applications/club-738-web/emails-socios/`

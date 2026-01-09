# 📧 Guía de Envío Masivo de Emails - YucatanCTP 2026

## 📊 Estrategia de Segmentación

### Resumen de Grupos

| Grupo | Cantidad | Template | CSV | Asunto |
|-------|----------|----------|-----|--------|
| **General** | 76 | TEMPLATE_MAIL_MERGE.html | mail-merge-data.csv | ¡Bienvenido al nuevo portal YucatanCTP! |
| **Morosos con armas** | 59 | TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html | morosos-con-armas-mail-merge.csv | Borrón y Cuenta Nueva - Renovación 2026 |
| **Morosos sin armas** | 7 | TEMPLATE_MOROSOS_SIN_ARMAS.html | morosos-sin-armas-mail-merge.csv | Renovación 2026 - Club YucatanCTP |

**IMPORTANTE**: 
- El email general (76) incluye a Aimee y otros exentos (solo acceso al portal, sin cobro)
- NO incluye a Sergio (secretario)
- Luis Fernando está AL CORRIENTE (pagó ayer $8,700)

---

## 🛠️ Herramienta: Yet Another Mail Merge (YAMM)

### Instalación

1. Abre Gmail desde Google Chrome
2. Ve a [YAMM Chrome Web Store](https://chrome.google.com/webstore/detail/yet-another-mail-merge/mgmgmhkohaenhokbdnlpcljckbhpbmea)
3. Click en "Agregar a Chrome" → "Agregar extensión"
4. Actualiza la página de Gmail

### Límites del Plan Gratuito

- ✅ **50 emails/día**
- ⏰ El contador se resetea a las 00:00 UTC (18:00 CST del día anterior)
- 📊 Seguimiento básico de aperturas

---

## 📅 Plan de Envío (3 días)

### **DÍA 1** (Hoy - 9 Enero 2026)

#### Envío #1: General (50 de 76)
- **CSV**: `mail-merge-data.csv` (primeras 50 filas)
- **Template**: `TEMPLATE_MAIL_MERGE.html`
- **Asunto**: `¡Bienvenido al nuevo portal YucatanCTP!`
- **Cantidad**: 50 emails

---

### **DÍA 2** (10 Enero 2026)

#### Envío #2: General (26 restantes)
- **CSV**: `mail-merge-data.csv` (filas 51-76)
- **Template**: `TEMPLATE_MAIL_MERGE.html`
- **Asunto**: `¡Bienvenido al nuevo portal YucatanCTP!`
- **Cantidad**: 26 emails

---

### **DÍA 3** (11 Enero 2026)

#### Envío #3: Morosos con armas (50 de 59)
- **CSV**: `morosos-con-armas-mail-merge.csv` (primeras 50 filas)
- **Template**: `TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html`
- **Asunto**: `Borrón y Cuenta Nueva - Renovación 2026`
- **Cantidad**: 50 emails

---

### **DÍA 4** (12 Enero 2026)

#### Envío #4: Morosos con armas (9 restantes) + Morosos sin armas
- **CSV 1**: `morosos-con-armas-mail-merge.csv` (filas 51-59)
  - Template: `TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html`
  - Asunto: `Borrón y Cuenta Nueva - Renovación 2026`
  - Cantidad: 9 emails

- **CSV 2**: `morosos-sin-armas-mail-merge.csv` (todas)
  - Template: `TEMPLATE_MOROSOS_SIN_ARMAS.html`
  - Asunto: `Renovación 2026 - Club YucatanCTP`
  - Cantidad: 7 emails

**Total DÍA 4**: 16 emails

---

## 📝 Procedimiento Paso a Paso

### PASO 1: Preparar el Template HTML

1. Abre el template correspondiente en tu editor de texto
2. **Copia todo el contenido** (Ctrl/Cmd + A, luego Ctrl/Cmd + C)

### PASO 2: Importar CSV a Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com)
2. Click en "Nuevo" → "Hoja de cálculo en blanco"
3. Archivo → Importar → Subir → Seleccionar CSV
4. Configuración de importación:
   - **Tipo de separador**: Detectar automáticamente
   - **Convertir texto a números...**: NO marcar
   - Click "Importar datos"
5. Renombra la hoja: "Mail Merge - [Nombre del grupo]"

**Para envíos parciales (50 emails):**
- Selecciona filas 2-51 (header + 50 socios)
- Copia y pega en una nueva hoja
- Nombra: "Mail Merge - [Grupo] - Día X"

### PASO 3: Configurar YAMM

1. En la hoja de Google Sheets, ve a: **Extensiones → Yet Another Mail Merge → Start Mail Merge**
2. Se abrirá el panel lateral de YAMM

### PASO 4: Redactar el Email

1. En el panel de YAMM, sección "Email draft":
   - Click en "Write new email"
2. Se abre Gmail Compose
3. **Asunto**: Usa el asunto correspondiente al grupo
4. **Cuerpo**: 
   - Pega el HTML completo del template
   - Verifica que las variables estén correctas: `{{Nombre}}`, `{{Email}}`, `{{Credencial}}`, `{{Password}}`

### PASO 5: Preview y Test

1. En YAMM, sección "Recipients":
   - Verifica el número de destinatarios
   - Click en "Preview emails"
2. Revisa que las variables se sustituyan correctamente
3. **Enviar email de prueba**:
   - Click en "Send test email"
   - Ingresa tu email: `smunozam@gmail.com`
   - Verifica que llegue correctamente
   - ⚠️ **IMPORTANTE**: Revisa que no haya errores de formato

### PASO 6: Envío Final

1. Si el test está OK, en YAMM:
   - Click en "Send emails"
   - Confirma el número de emails a enviar
2. Espera a que YAMM termine (verás el progreso)
3. ✅ Verás "Mail merge complete" cuando termine

### PASO 7: Monitoreo

1. En la hoja de Google Sheets, YAMM agregará columnas:
   - **Merge status**: sent, failed, etc.
   - **Recipient status**: opened, clicked, bounced
2. Revisa que todos tengan status "sent"

---

## ⚠️ Consejos Importantes

### Evitar que Gmail marque como SPAM

1. **Horario óptimo**: Enviar entre 9:00 AM - 11:00 AM CST
2. **No enviar todos de golpe**: Espaciar 5-10 minutos entre tandas
3. **Asunto profesional**: Sin MAYÚSCULAS, sin exceso de emojis
4. **Contenido balanceado**: Texto + HTML, no solo imágenes
5. **Link válido**: Verificar que https://yucatanctp.org funcione

### Qué hacer si un email falla

1. Verifica el email en la columna "Recipient"
2. Reenvía manualmente desde Gmail
3. Anota el email en una lista de "Problemas de entrega"

### Backup

- ✅ Todos los CSVs están en `/emails-socios/`
- ✅ Templates en `/emails-socios/TEMPLATE_*.html`
- 📁 Guarda una copia de Google Sheets antes de cada envío

---

## 📋 Checklist Pre-Envío

Antes de cada envío, verifica:

- [ ] CSV importado correctamente en Google Sheets
- [ ] Número de filas correcto (header + socios)
- [ ] Template HTML copiado sin errores
- [ ] Variables {{Nombre}}, {{Email}}, {{Credencial}}, {{Password}} presentes
- [ ] Asunto correcto para el grupo
- [ ] Email de prueba enviado y verificado
- [ ] Portal https://yucatanctp.org accesible
- [ ] Límite de 50 emails/día no excedido
- [ ] Horario entre 9:00-11:00 AM

---

## 📊 Registro de Envíos

### DÍA 1 (9 Ene)
- [ ] General 1-50: ___ emails enviados a las _____

### DÍA 2 (10 Ene)
- [ ] General 51-76: ___ emails enviados a las _____

### DÍA 3 (11 Ene)
- [ ] Morosos con armas 1-50: ___ emails enviados a las _____

### DÍA 4 (12 Ene)
- [ ] Morosos con armas 51-59: ___ emails enviados a las _____
- [ ] Morosos sin armas 1-7: ___ emails enviados a las _____

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica los límites de YAMM (50/día)
2. Revisa la bandeja de SPAM de Gmail
3. Consulta la [documentación de YAMM](https://support.yet-another-mail-merge.com/)
4. Contacta al desarrollador del portal: smunozam@gmail.com

---

## 📌 Resumen de Archivos

```
emails-socios/
├── TEMPLATE_MAIL_MERGE.html (General - 76 socios)
├── TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html (59 morosos con armas)
├── TEMPLATE_MOROSOS_SIN_ARMAS.html (7 morosos sin armas)
├── mail-merge-data.csv (76 filas)
├── morosos-con-armas-mail-merge.csv (59 filas)
└── morosos-sin-armas-mail-merge.csv (7 filas)
```

**Total de emails a enviar**: 76 + 59 + 7 = **142 emails**

---

**¡Éxito con el lanzamiento del portal YucatanCTP!** 🎯

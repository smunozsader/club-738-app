# 📧 Guía de Envío Masivo de Emails - YucatanCTP 2026

> **Actualizado**: 9 enero 2026  
> **Nombre oficial**: Club de Caza, Tiro y Pesca de Yucatán, A.C.  
> **Portal**: https://yucatanctp.org

## 📊 Estrategia de Segmentación

### Resumen de Grupos

| Grupo | Cantidad | Template | CSV | Asunto |
|-------|----------|----------|-----|--------|
| **Socios al corriente** | 57 | TEMPLATE_GENERAL.html | mail-merge-general.csv | Nuevo Portal YucatanCTP - Tu Expediente Digital |
| **Morosos 2025** | 19 | TEMPLATE_MOROSOS.html | morosos-2025-mail-merge.csv | Importante: Regularización de Membresía 2026 - Requisito Legal |

**IMPORTANTE**: 
- ✅ Total de emails: 76 (77 socios - Sergio)
- ✅ Arqueo validado: sin duplicados, todos existen en credenciales
- ✅ Distribución corregida: 57 general + 19 morosos (NO 10 + 59)
- ⚠️ Los 19 morosos son los que NO pagaron 2025 (verificados en Firestore)

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

## 📅 Plan de Envío (2 días)

### **DÍA 1** (HOY - 9 Enero 2026)

#### Envío #1: Socios al corriente (50 de 57)
- **CSV**: `mail-merge-general.csv` (primeras 50 filas + header)
- **Template**: `TEMPLATE_GENERAL.html`
- **Asunto**: `Nuevo Portal YucatanCTP - Tu Expediente Digital`
- **Horario recomendado**: 9:00 AM - 11:00 AM
- **Cantidad**: 50 emails

---

### **DÍA 2** (10 Enero 2026)

#### Envío #2: Socios al corriente (7 restantes)
- **CSV**: `mail-merge-general.csv` (filas 51-57)
- **Template**: `TEMPLATE_GENERAL.html`
- **Asunto**: `Nuevo Portal YucatanCTP - Tu Expediente Digital`
- **Cantidad**: 7 emails

#### Envío #3: Morosos 2025 (todos)
- **CSV**: `morosos-2025-mail-merge.csv` (todas las filas)
- **Template**: `TEMPLATE_MOROSOS.html`
- **Asunto**: `Importante: Regularización de Membresía 2026 - Requisito Legal`
- **Cantidad**: 19 emails

**Total DÍA 2**: 26 emails (dentro del límite de 50/día)

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
:
   - General: `Nuevo Portal YucatanCTP - Tu Expediente Digital`
   - Morosos: `Importante: Regularización de Membresía 2026 - Requisito Legal`
4. **Cuerpo**: 
   - Pega el HTML completo del template (TEMPLATE_GENERAL.html o TEMPLATE_MOROSOS.html)
   - Verifica que las variables estén correctas: `{{Nombre}}`, `{{Email}}`, `{{Credencial}}`, `{{Password}}`
   - **IMPORTANTE**: Verifica que diga "Club de Caza, Tiro y Pesca de Yucatán, A.C." (NO "Club 738")
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
 (TEMPLATE_GENERAL.html o TEMPLATE_MOROSOS.html)
- [ ] Variables {{Nombre}}, {{Email}}, {{Credencial}}, {{Password}} presentes
- [ ] Asunto correcto para el grupo
- [ ] Nombre oficial del club presente: "Club de Caza, Tiro y Pesca de Yucatán, A.C."
- [ ] Email de prueba enviado y verificado
- [ ] Portal https://yucatanctp.org accesible
- [ ] Límite de 50 emails/día no excedido
- [ ] Horario entre 9:00-11:00 AM

---

## 📊 Registro de Envíos

### DÍA 1 (9 Ene)
- [ ] Socios al corriente 1-50: ___ emails enviados a las _____
  - CSV: mail-merge-general.csv (filas 1-50)
  - Template: TEMPLATE_GENERAL.html

### DÍA 2 (10 Ene)
- [ ] Socios al corriente 51-57: ___ emails enviados a las _____
  - CSV: mail-merge-general.csv (filas 51-57)
  - Template: TEMPLATE_GENERAL.html
- [ ] Morosos 2025 (todos): ___ emails enviados a las _____
  - CSV: morosos-2025-mail-merge.csv (19 filas)
  - Template: TEMPLATE_MOROSOS.html

**Total enviado**: ___ / 76 emails
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
GENERAL.html              → Socios al corriente (57)
├── TEMPLATE_MOROSOS.html              → Morosos 2025 (19)
├── mail-merge-general.csv             → 57 filas + header
├── morosos-2025-mail-merge.csv        → 19 filas + header
├── PROPUESTAS_REDACCION_EMAILS.md     → Redacciones finales aprobadas
└── GUIA_MAIL_MERGE_2026.md            → Esta guía
```

**Total de emails a enviar**: 57 + 19 = **76 emails**

---

## 📝 Cambios vs Versión Anterior

### ✅ Correcciones Aplicadas

1. **Distribución corregida**: 57 general + 19 morosos (vs anterior 10 + 59 + 7)
2. **Nombre oficial**: "Club de Caza, Tiro y Pesca de Yucatán, A.C." en todos los templates
3. **CSVs regenerados**: mail-merge-general.csv y morosos-2025-mail-merge.csv
4. **Arqueo validado**: 76 emails únicos, sin duplicados
5. **Mensaje morosos**: "Regularización obligatoria" (requisito legal) en vez de "Borrón y Cuenta Nueva"
6. **Calendario reducido**: 2 días (vs anterior 4 días)

### ❌ Archivos Obsoletos (NO usar)

- ~~TEMPLATE_MAIL_MERGE.html~~
- ~~TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html~~
- ~~TEMPLATE_MOROSOS_SIN_ARMAS.html~~
- ~~mail-merge-data.csv~~
- ~~morosos-con-armas-mail-merge.csv~~
- ~~morosos-sin-armas-mail-merge.csv~~

---

**¡Éxito con el lanzamiento del portal del Club de Caza, Tiro y Pesca de Yucatán, A.C.
---

**¡Éxito con el lanzamiento del portal YucatanCTP!** 🎯

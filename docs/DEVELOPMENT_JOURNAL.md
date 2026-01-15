### 2026-01-14 - v1.14.2 Fix permanente: Upload de PDFs de armas

#### Corrección del flujo de subida en ArmaEditor.jsx

**Problema detectado**: El flujo de creación/edición de armas tenía un bug que causaba que los PDFs se subieran a Storage pero no se vincularan a Firestore, generando registros huérfanos.

**Causa raíz**: 
- En modo **creación**: Intentaba subir PDF usando `armaId` que era `null`, fallaba silenciosamente
- En modo **edición**: Usaba función `subirPDF()` que requería `armaId` existente previamente
- El código duplicaba lógica y no garantizaba la actualización de Firestore

**Solución implementada**:

1. **Modo CREACIÓN** (nueva arma):
   ```javascript
   // Paso 1: Crear documento en Firestore (obtener ID)
   const nuevoArmaDoc = await addDoc(armasRef, dataToCreate);
   const newArmaId = nuevoArmaDoc.id;
   
   // Paso 2: Subir PDF a Storage usando el ID generado
   const storageRef = ref(storage, `documentos/${email}/armas/${newArmaId}/registro.pdf`);
   await uploadBytes(storageRef, pdfFile);
   
   // Paso 3: Obtener URL pública
   const nuevoPdfUrl = await getDownloadURL(storageRef);
   
   // Paso 4: CRÍTICO - Actualizar Firestore con URL
   await updateDoc(doc(db, 'socios', email, 'armas', newArmaId), {
     documentoRegistro: nuevoPdfUrl
   });
   ```

2. **Modo EDICIÓN** (arma existente):
   ```javascript
   // Ya tenemos armaId, subir PDF directamente
   const storageRef = ref(storage, `documentos/${email}/armas/${armaId}/registro.pdf`);
   await uploadBytes(storageRef, pdfFile);
   const nuevoPdfUrl = await getDownloadURL(storageRef);
   
   // Actualizar en el mismo updateDoc
   dataToUpdate.documentoRegistro = nuevoPdfUrl;
   await updateDoc(armaDocRef, dataToUpdate);
   ```

3. **Manejo de errores robusto**:
   - Try/catch separado para upload de PDF
   - En creación: No falla si PDF falla, solo advierte al usuario
   - En edición: Mantiene URL existente si no hay nuevo PDF
   - Estados `uploadingPdf` manejados con finally

**Cambios realizados**:
- Eliminada función `subirPDF()` (código duplicado)
- Flujo inline con mejor control de errores
- Comentarios explícitos "MODO CREACIÓN" vs "MODO EDICIÓN"
- Garantiza que **siempre** se actualiza Firestore después de subir a Storage

**Resultado**: 
- ✅ De ahora en adelante, todos los PDFs subidos se vincularán correctamente
- ✅ No más registros huérfanos en Storage
- ✅ ExpedienteAdminView siempre mostrará los PDFs subidos

**Archivos modificados**:
- `src/components/admin/ArmaEditor.jsx` - Refactor completo de handleSubmit()

**Deploy**: Hosting actualizado en producción (https://club-738-app.web.app)

---

### 2026-01-14 - v1.14.1 Fix crítico: Vinculación de PDFs de armas

#### Corrección de mapeo Storage-Firestore para registros de armas

**Problema detectado**: 18 armas de 6 socios tenían PDFs de registro subidos a Storage pero el campo `documentoRegistro` estaba NULL en Firestore, causando que no aparecieran en ExpedienteAdminView.

**Causa raíz**: El componente ArmaEditor.jsx subía correctamente los PDFs a Storage pero la actualización del campo `documentoRegistro` en Firestore fallaba silenciosamente o no se ejecutaba.

**Socios afectados**:
- Ivan Tsuis Cabo Torres (3 armas)
- Fabian Márquez Ortega (3 armas)
- Joaquín Rodolfo Gardoni Núñez (3 armas)
- Sergio Fernando Martínez Aguilar (3 armas)
- Daniel de Jesús Padilla Robles (5 armas)
- Celestino Sánchez Fernández (1 arma)

**Solución implementada**:
1. **verificar-storage-ivan.cjs** - Script de diagnóstico
   - Lista todos los archivos en Storage por socio
   - Compara con armas en Firestore
   - Identifica PDFs huérfanos (en Storage pero no vinculados)

2. **vincular-pdfs-armas.cjs** - Script de corrección automática
   - Escanea todas las armas de todos los socios
   - Verifica si existe PDF en Storage con path esperado
   - Genera URL pública y actualiza campo `documentoRegistro`
   - Marca `ultimaModificacion` con timestamp actual

**Resultados**:
- ✅ 18 armas vinculadas exitosamente
- ✅ 6 socios con expedientes completos
- ✅ PDFs ahora visibles en ExpedienteAdminView con botón "📄 Ver PDF"

**Archivos creados**:
- `scripts/verificar-storage-ivan.cjs` - Diagnóstico completo de Storage vs Firestore
- `scripts/vincular-pdfs-armas.cjs` - Vinculación automática masiva

**Acción preventiva recomendada**: Revisar flujo de upload en ArmaEditor.jsx para asegurar que siempre actualice Firestore después de subir a Storage.

---

### 2026-01-11 - v1.13.1 Límites legales de cartuchos (PETA)

#### Implementación de límites por calibre en GeneradorPETA

**Objetivo**: Asegurar el cumplimiento de la LFAFE en la cantidad de cartuchos por calibre/clase y reflejarlo en la UI y en el PDF del oficio PETA.

**Cambios realizados**:
- Agregado helper `getCartuchoSpec()` para definir límites y defaults por calibre/clase (.22 LR → máx 1000, escopetas 12/20/GA → máx 500, resto → máx 200).
- Agregado `clampCartuchos()` para redondeo al `step` y ajuste a `min/max`.
- Reemplazados defaults heurísticos en `toggleArma()` por `spec.default` según calibre/clase.
- Al cargar solicitudes PETA, se clampa `armasIncluidas[*].cartuchos` a los límites legales antes de guardar estado.
- Inputs de “Cartuchos” ahora usan `min/max/step` por calibre y clamping en `onChange`.
- Generación de PDF: el valor en la columna CARTUCHOS se clampa a los límites antes de renderizar.

**Archivos modificados/creados**:
- `src/components/GeneradorPETA.jsx` – Helpers de límites, clamping en carga/inputs/PDF.
- `docs/DEVELOPMENT_JOURNAL.md` – Entrada de journal.

**Deploy**: Hosting actualizado tras build exitoso. Se realizará `firebase deploy --only hosting`.

### 2026-01-11 - v1.13.2 Revisión secretaria: armas fijas

#### Bloqueo de edición de armas/cartuchos en revisión desde solicitud

**Objetivo**: Mantener las armas seleccionadas por el socio inmutables durante la revisión del secretario (modo Desde Solicitud) y evitar cambios accidentales.

**Cambios realizados**:
- Añadido flag `revisionBloqueada` (secretario + solicitud cargada + modo manual OFF).
- Deshabilitado `onClick` en tarjetas de armas cuando `revisionBloqueada` está activo.
- Inputs de “Cartuchos” ahora se muestran deshabilitados en revisión.
- Se eliminó el reseteo de selección/cartuchos al cargar armas del socio (`cargarArmasSocio`).

**Archivos modificados/creados**:
- `src/components/GeneradorPETA.jsx` – Bloqueo de edición y no reset de selección.
- `docs/DEVELOPMENT_JOURNAL.md` – Entrada de journal.

**Deploy**: Hosting actualizado tras build y deploy.

### 2026-01-12 - v1.13.3 Ajustes de formato PDF PETA

#### Eliminación de etiquetas de fecha y centrado de firma

**Objetivo**: Mejorar la presentación del PDF PETA eliminando las etiquetas de formato de fecha mal colocadas y centrando la sección de firma.

**Cambios realizados**:
- En la sección "PERÍODO": Eliminadas las etiquetas "DIA MES AÑO" que aparecían misalieadas bajo los campos de fechas.
- En la sección "FIRMA": Centradas todas las líneas usando `doc.text(..., pageWidth / 2, y, { align: 'center' })`:
  - LUGAR Y FECHA DE LA SOLICITUD
  - ATENTAMENTE.
  - SUFRAGIO EFECTIVO, NO REELECCIÓN

---

### 2026-01-13 - v1.14.0 Separación Admin + Arsenal PDF + Notificaciones

#### Fase 4: Gestión de Arsenal - COMPLETADO

**Objetivo**: Permitir al secretario gestionar el arsenal de los socios con CRUD completo y subida de PDFs.

**Cambios realizados**:
- **ArmaEditor.jsx/css** - Modal de creación/edición de armas
  - Formulario con validación (clase, marca, modelo, calibre, matrícula, folio)
  - Subida de PDF de registro federal (max 5MB)
  - Estados: pdfFile, pdfUrl, uploadingPdf
  - Storage path: `documentos/{email}/armas/{armaId}/registro.pdf`
  - Integración con getDownloadURL para URLs públicas

- **ExpedienteAdminView.jsx** - Tabla de armas mejorada
  - Agregada columna "Registro Federal" con botón "📄 Ver PDF"
  - window.open() para visualizar PDFs en nueva pestaña
  - Botón "Eliminar arma" con confirmación
  - Integración con ArmaEditor modal

- **Resultados**: ✅ CRUD funcional, ✅ PDFs suben correctamente, ✅ Auditoría implementada

**Archivos modificados/creados**:
- `src/components/admin/ArmaEditor.jsx` - Modal completo con PDF upload
- `src/components/admin/ArmaEditor.css` - Estilos para input-file, pdf-actual
- `src/components/admin/ExpedienteAdminView.jsx` - Columna registro federal
- `src/components/admin/ExpedienteAdminView.css` - Estilos para tabla armas

#### Fase 5: Notificaciones In-App - PARCIALMENTE COMPLETADO

**Objetivo**: Sistema de notificaciones en tiempo real para socios y secretario.

**Cambios realizados**:
- **Notificaciones.jsx/css** - Banner flotante de notificaciones
  - onSnapshot listener en tiempo real
  - Ordenamiento por fecha descendente
  - Marca como leído al hacer clic
  - Badge contador de no leídas
  - Menú desplegable con scroll

- **Scripts admin** - Herramientas de envío masivo
  - `crear-notificacion-individual.cjs` - Envío a 1 socio
  - `crear-notificacion-masiva.cjs` - Broadcast a todos
  - Integración con Firebase Admin SDK

- **firestore.rules** - Reglas de seguridad
  - Socios leen solo sus notificaciones
  - Socios actualizan solo campos leido/fechaLeido
  - Admin/secretario pueden crear/editar todas

**Resultados**: ✅ In-app funcional, ❌ Email pendiente, ❌ WhatsApp pendiente

**Archivos modificados/creados**:
- `src/components/Notificaciones.jsx` - Componente de banner
- `src/components/Notificaciones.css` - Estilos flotantes
- `scripts/crear-notificacion-individual.cjs` - Script envío individual
- `scripts/crear-notificacion-masiva.cjs` - Script broadcast
- `firestore.rules` - Reglas para colección notificaciones

#### CRÍTICO: Separación de Roles Admin

**Problema detectado**: Usuario smunozam@gmail.com (socio regular) veía paneles de administrador al iniciar sesión.

**Solución implementada**:
- Creado constante `ADMIN_EMAIL = 'admin@club738.com'` en App.jsx
- Reemplazadas 11 referencias hardcoded de 'smunozam@gmail.com'
- Actualizado firestore.rules: isSecretario() y isAdmin() → admin@club738.com
- Actualizado 4 componentes: DashboardRenovaciones, GeneradorPETA, MisArmas, DashboardCumpleanos
- Creada cuenta Firebase Auth: admin@club738.com / Club738*Admin#2026!Seguro

**Resultados**: ✅ Separación funcional, ✅ Seguridad corregida, ✅ Testing exitoso

**Archivos modificados**:
- `src/App.jsx` - ADMIN_EMAIL constant + 11 replacements
- `firestore.rules` - isSecretario/isAdmin functions
- `src/components/admin/DashboardRenovaciones.jsx`
- `src/components/admin/GeneradorPETA.jsx`
- `src/components/MisArmas.jsx`
- `src/components/admin/DashboardCumpleanos.jsx`

#### Scripts de Sincronización Storage

**Objetivo**: Sincronizar documentos CURP desde Storage a Firestore.

**Script ejecutado**:
- **sincronizar-curps-storage.cjs** - Sincronización masiva
  - Escaneó Storage en `documentos/{email}/curp.pdf`
  - Actualizó 75 de 77 socios con URLs públicas
  - Guardó en Firestore: `socios/{email}.documentosPETA.curp.url`
  - 2 socios sin CURP en Storage (no encontrados)

**Resultados**: ✅ 75 CURPs sincronizados

**Archivos creados**:
- `scripts/sincronizar-curps-storage.cjs`

#### ❌ BUGS NO RESUELTOS - CSS Layout Issues

**Problemas reportados por usuario**:
1. **Stats blanco sobre blanco** - Números "Total Socios" invisibles
2. **Tabla admin desalineada** - Headers no coinciden con columnas de datos
3. **Dashboard muy angosto** - A pesar de remover max-width: 1400px
4. **Tabla armas angosta** - No usa ancho completo disponible

**Intentos de corrección (6 iteraciones)**:
- AdminDashboard.css: width 100%, max-width 100%, color white !important
- ExpedienteAdminView.css: table-layout auto/fixed múltiples veces
- Stats grid: repeat(auto-fit) → repeat(4, 1fr)
- Table headers: white-space nowrap

**Resultado**: ❌ Bugs persisten en producción
**Causa probable**: Problemas de cascada CSS, especificidad, o estilos heredados
**Acción requerida**: Refactor CSS completo o inspección con DevTools

**Archivos modificados (sin éxito)**:
- `src/components/admin/AdminDashboard.css` - 3 ediciones
- `src/components/admin/ExpedienteAdminView.css` - 5 ediciones

#### ❌ PROBLEMA PENDIENTE - Documentos no visibles en Expedientes

**Reporte de usuario**: CURPs y Constancias de Antecedentes subidos a Storage no aparecen en expedientes de usuarios.

**Datos conocidos**:
- 75 CURPs sincronizados con script (confirmado)
- Constancias subidas con scripts anteriores
- URLs guardadas en Firestore bajo `documentosPETA.{tipo}.url`

**Causa probable**: 
- DocumentList.jsx no lee URLs de Firestore correctamente
- Mapeo incorrecto entre nombres de campos
- Filtrado de documentos con URL vacía/undefined

**Acción requerida**: Debug de DocumentList.jsx y verificación de estructura Firestore

**Deploy**: Múltiples deploys realizados (6+ durante sesión), cambios en producción en https://club-738-app.web.app
  - LIC. RICARDO J. FERNÁNDEZ Y GASQUE
  - PRESIDENTE DEL CLUB.

**Archivos modificados**:
- `src/components/GeneradorPETA.jsx` – PDF generation updates.

**Deploy**: Hosting actualizado tras build y deploy.

### 2026-01-12 - v1.13.4 Mejora de formato PDF: bordes decorativos y tablas

#### Aplicación de bordes decorativos y mejora de tablas

**Objetivo**: Mejorar la presentación visual del PDF PETA para que se asemeje más al formato oficial SEDENA con bordes decorativos y tablas bien definidas.

**Cambios realizados**:
- Agregado marco decorativo doble alrededor de la página (borde exterior grueso + borde interior fino) usando `doc.rect()` y `doc.setLineWidth()`.
- Mejorada tabla de armas con líneas divisorias entre filas y encabezados claramente delimitados.
- Validación de que todos los encabezados de secciones ya estaban en bold.
- Ajuste de padding interno en celdas de tabla para mejor legibilidad.

**Archivos modificados**:
- `src/components/GeneradorPETA.jsx` – Agregados bordes decorativos y líneas de tabla.

**Deploy**: Hosting actualizado tras build y deploy.

# 📔 Development Journal - Club 738 Web

## Resumen del Proyecto

**Club 738 Web** es el portal de socios del Club de Caza, Tiro y Pesca de Yucatán, A.C. (SEDENA #738). Permite a los socios gestionar su documentación para trámites PETA ante la 32 Zona Militar de Valladolid.

**URL de Producción**: https://club-738-app.web.app  
**Dominio Principal**: https://yucatanctp.org

---

## 📅 Enero 2026

### 10 de Enero - Mensajes Individualizados WhatsApp + Aclaración Costos PETA

#### Generación de Mensajes Manuales para WhatsApp

**Objetivo**: Como WAPI Sender no funcionó, generar mensajes individualizados para copiar/pegar manualmente en WhatsApp.

**Problema**: 
- WAPI Sender Chrome Extension no compatible con WhatsApp Web actual
- Necesidad de envío manual a 73 socios

**Solución implementada**:

1. **Script generador de mensajes**
   - Creado: `scripts/generar-mensajes-individuales.cjs`
   - Lee CSV de socios con credenciales
   - Genera mensajes personalizados (nombre, email, password, credencial)
   - Output: `emails-socios/mensajes-individuales-whatsapp.txt` (3,515 líneas)

2. **Aclaración de costos PETA**
   - **Problema detectado**: Mensaje original decía "Incluye: 1 PETA gratis" - generaba confusión
   - **Corrección aplicada**: Diferenciar entre:
     - Renovación $6,000 = Tramitación del PETA ante 32 ZM SEDENA
     - Derechos SEDENA (pago aparte):
       - Formato 045: $1,819 (hasta 3 armas)
       - Formato 046: $604 (por cada arma adicional)
       - Se pagan con hojas de ayuda E5cinco

3. **Documentación generada**
   - `emails-socios/GUIA_ENVIO_MANUAL.md` - Instrucciones paso a paso
   - `emails-socios/checklist-envio-whatsapp.txt` - Control imprimible de 73 socios
   - `emails-socios/RESUMEN_ENVIO_MANUAL.md` - Resumen ejecutivo
   - Script adicional: `generar-checklist-envio.cjs`

**Estructura del mensaje final**:
```
Hola [NOMBRE] 👋

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: [email]
• Contraseña: [password]
• Credencial: #[numero]

📋 DESDE EL PORTAL PUEDES:
✅ Generar expediente PETA
✅ Subir documentos
✅ Solicitar transportación
✅ Ver calendario 2026

💰 *RENOVACIÓN 2026*: $6,000 MXN
Incluye: Tramitación de 1 PETA ante 32 ZM SEDENA

💳 *DERECHOS SEDENA (PAGO APARTE)*:
• Formato 045: $1,819 (hasta 3 armas)
• Formato 046: $604 (por cada arma adicional)
• Se pagan con hojas de ayuda E5cinco

⚠️ *Cambia tu contraseña al entrar*

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club...
```

**Archivos modificados**:
- `scripts/generar-mensajes-individuales.cjs` - Template del mensaje
- `emails-socios/mensajes-individuales-whatsapp.txt` - 73 mensajes regenerados
- `emails-socios/GUIA_ENVIO_MANUAL.md` - Guía actualizada
- `emails-socios/RESUMEN_ENVIO_MANUAL.md` - Resumen actualizado

**Tiempo estimado de envío**: 2.5-3.5 horas (2-3 min por mensaje)

**Deploy**: No aplica (archivos locales para envío manual)

---

### 9 de Enero - v1.19.1 Preparación WAPI Sender - Formato Excel Oficial

#### Corrección de Formato Excel para Compatibilidad WAPI Sender

**Objetivo**: Generar Excel compatible con WAPI Sender Chrome Extension para envío masivo.

**Problema detectado**:
- WAPI Sender requiere formato Excel específico, no acepta CSV directamente
- Primera columna debe llamarse: `WhatsApp Number(with country code)`
- Números deben tener formato: `+52XXXXXXXXXX` (con signo +)

**Solución implementada**:

1. **Script de conversión CSV → Excel**
   - Creado: `convertir-csv-a-excel.cjs`
   - Genera: `whatsapp-difusion-portal.xlsx`
   - Primera versión funcional pero incompatible con WAPI

2. **Archivos alternativos para pruebas**
   - Script: `generar-archivos-wapi-alternos.cjs`
   - Generados:
     - `wapi-prueba-5-socios.xlsx` (5 socios para testing)
     - `numeros-whatsapp.txt` (73 números separados por coma)

3. **Análisis del template oficial**
   - Descargado: `WAPlusSenderTemplate1.xlsx` (muestra oficial)
   - Identificada estructura correcta:
     ```
     WhatsApp Number(with country code) | First Name | Last Name | Other | Tips
     +8613161611906                      | Sender     | WAPI      | ...   | ...
     ```

4. **Generación de Excel con formato oficial**
   - Script final: `generar-excel-wapi-oficial.cjs`
   - Archivo producido: `WAPI-Sender-Difusion-Portal.xlsx`
   - Correcciones aplicadas:
     - ✅ Columna 1: `WhatsApp Number(with country code)` (nombre exacto)
     - ✅ Números: `+529999490494` (agregado signo +)
     - ✅ Hoja: `Sheet1` (nombre estándar)
     - ✅ 73 socios con formato correcto

**Archivos creados**:
- `scripts/convertir-csv-a-excel.cjs`
- `scripts/generar-archivos-wapi-alternos.cjs`
- `scripts/generar-excel-wapi-oficial.cjs`
- `emails-socios/WAPI-Sender-Difusion-Portal.xlsx` ← **Archivo final**
- `emails-socios/wapi-prueba-5-socios.xlsx`
- `emails-socios/numeros-whatsapp.txt`

**Pendiente**:
- Ejecutar campaña WAPI Sender con archivo corregido
- Enviar credenciales por email a KRISZTIAN GOR (sin WhatsApp)

**Deploy**: No aplica (archivos de datos, no código de producción)

---

### 9 de Enero - v1.19.0 Campaña WhatsApp - Difusión Lanzamiento Portal

#### Desarrollo del Sistema de Mensajería WhatsApp

**Objetivo**: Difusión masiva del lanzamiento de yucatanctp.org a todos los socios vía WhatsApp.

**Cambios realizados**:

1. **Sincronización con GitHub**
   - Git pull exitoso: 126 archivos actualizados
   - Archivos nuevos: emails-socios/, scripts de morosos, MiPerfil.jsx, SEO (robots.txt, sitemap.xml)

2. **Verificación del módulo de mensajes WhatsApp**
   - Revisión de archivos generados por scripts previos
   - 75 mensajes individuales .txt generados
   - 1 socio sin teléfono (KRISZTIAN GOR)
   - CSV para WAPI Sender con 74 socios

3. **Actualización de firma oficial**
   - Cambio de "Secretaría" a firma completa:
     ```
     MVZ Sergio Muñoz de Alba Medrano
     Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.
     ```
   - Archivos actualizados:
     - `generar-mensajes-whatsapp.cjs`
     - `generar-excel-wapi-sender.cjs`
     - Templates de mensajes

4. **Pivote estratégico: De segmentación a difusión única**
   - **Inicial**: Intentó segmentar mensajes (general vs morosos)
   - **Decisión final**: UN SOLO MENSAJE para todos los socios
   - **Razón**: Simplificar campaña, enfoque en portal y expediente digital
   - Eliminación de mensajes individuales (carpetas .txt)

5. **Creación de sistema de difusión masiva**
   - Script: `generar-wapi-difusion.cjs`
   - Archivos generados:
     - `whatsapp-difusion-portal.csv` (73 socios)
     - `WAPI-Template-Difusion-Portal.txt`
     - `GUIA_DIFUSION_WHATSAPP.md`
   - **Excluido**: Sergio (secretario)
   - **Sin teléfono**: 1 socio (envío por email)

6. **Correcciones técnicas al CSV**
   - **Problema**: Faltaba columna "First Name" requerida por WAPI Sender
   - **Solución**: Modificación de script para incluir columna "First Name"
   - **Encoding**: Corrección UTF-8 para preservar acentos y Ñ
   - **Casos especiales**: 
     - J. JESÚS Valencia Rojas (era solo "J.")
     - Nombres con ÑÁÉÍÓÚ preservados correctamente

7. **Limpieza de archivos obsoletos**
   - Eliminadas carpetas:
     - `mensajes-whatsapp/` (74 archivos)
     - `mensajes-whatsapp-general/` (55 archivos)
     - `mensajes-whatsapp-morosos/` (18 archivos)
   - Eliminados archivos:
     - `whatsapp-general.csv`, `whatsapp-morosos.csv`
     - `WAPI-Template-General.txt`, `WAPI-Template-Morosos.txt`
     - `WAPI-Sender-Socios.xlsx`, `whatsapp-socios.csv`
   - Eliminadas guías:
     - `GUIA_WAPI_SENDER.md`
     - `GUIA_WHATSAPP_SEGMENTADO.md`

**Contenido del mensaje único**:
- Anuncio del portal yucatanctp.org
- Credenciales de acceso personalizadas
- Invitación a renovar membresía 2026 ($6,000)
- **Llamado a acción**: Generar expediente digital PETA
- Motivación para subir documentos
- Lista de funciones del portal

**Archivos finales de la campaña**:
```
emails-socios/
├── whatsapp-difusion-portal.csv           → 73 socios + First Name
├── WAPI-Template-Difusion-Portal.txt      → Template con placeholders
├── GUIA_DIFUSION_WHATSAPP.md              → Guía paso a paso
└── socios-sin-telefono-whatsapp.txt       → 1 socio sin teléfono
```

**Scripts desarrollados**:
- `generar-whatsapp-segmentado.cjs` - Generación segmentada (descartado)
- `generar-wapi-difusion.cjs` - Generación de difusión única (FINAL)

**Tiempo estimado de envío**: 14 minutos (73 mensajes × 11 seg/mensaje)

**Deploy**: No requiere deploy, archivos listos para WAPI Sender en Chrome

---

### 9 de Enero - v1.18.0 Campaña de Emails y Corrección de Datos

#### Campaña de Emails para Lanzamiento de yucatanctp.org

**Objetivo**: Anunciar el nuevo portal web a todos los socios (77) y gestionar renovaciones de membresía 2026.

**Segmentación de socios**:
- **Total socios**: 77
- **Exentos** (no pagan pero SÍ usan portal): 2 (Aimee, Sergio)
- **Al corriente**: 8 socios
- **Morosos 2026**: 67 socios
  - Con armas: 60 socios → Mensaje "Borrón y Cuenta Nueva"
  - Sin armas: 7 socios → Renovación + Club como intermediario DN27

**Templates HTML creados** (3):
1. `TEMPLATE_MAIL_MERGE.html` - Email general (76 socios)
   - Anuncio portal yucatanctp.org
   - Credenciales de acceso
   - Funciones del portal
   
2. `TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html` - Morosos con armas (59 CSVs)
   - Oferta: Solo pagar 2026 ($6,000), se perdona 2025
   - Válido hasta 31 marzo 2026
   
3. `TEMPLATE_MOROSOS_SIN_ARMAS.html` - Morosos sin armas (7)
   - Renovación 2026
   - Mensaje sobre el club como intermediario SEDENA (Ley Federal de Armas)
   - Oferta de apoyo para trámite de compra de primera arma ante DN27

**CSVs generados para mail merge** (3):
- `mail-merge-data.csv` - 76 socios (todos menos Sergio)
- `morosos-con-armas-mail-merge.csv` - 59 socios
- `morosos-sin-armas-mail-merge.csv` - 7 socios

**Plan de envío** (4 días, límite YAMM 50/día):
- DÍA 1 (9 Ene): 50 emails generales
- DÍA 2 (10 Ene): 26 emails generales
- DÍA 3 (11 Ene): 50 morosos con armas
- DÍA 4 (12 Ene): 9 morosos con armas + 7 sin armas

**Total emails**: 142

**Guías creadas**:
- `GUIA_MAIL_MERGE_2026.md` - Procedimiento completo paso a paso con YAMM
- `RESUMEN_EJECUTIVO.md` - Vista rápida de la estrategia

#### Corrección de Datos en Firestore

**1. Registro de pago - Luis Fernando Guillermo Gamboa**
- **Email**: oso.guigam@gmail.com
- **Status anterior**: Moroso (por error)
- **Status corregido**: AL CORRIENTE
- **Pago registrado**: 8 enero 2026
  - Inscripción socio nuevo: $2,000 MXN
  - Anualidad 2026: $6,000 MXN
  - FEMETI primer ingreso: $700 MXN
  - **Total**: $8,700 MXN
- **Campo actualizado**: `renovacion2026.estado = 'pagado'`

**2. Corrección de teléfono - Ariel Baltazar Córdoba Wilson**
- **Email**: atietzbabam@gmail.com
- **Problema**: Datos cruzados con Ariel Antonio Paredes Cetina
- **Teléfono anterior**: 9994912883 (incorrecto, era del otro Ariel)
- **Teléfono corregido**: 9992003314 (+52 999 200 3314)

**Scripts creados**:
- `scripts/identificar-morosos-reales.cjs` - Identificar morosos excluyendo exentos
- `scripts/generar-csvs-morosos.cjs` - Generar CSVs para mail merge
- `scripts/registrar-pago-luis-fernando.cjs` - Registrar pago de socio nuevo
- `scripts/corregir-telefono-ariel-baltazar.cjs` - Corregir teléfono cruzado

**Archivos modificados**:
- `emails-socios/TEMPLATE_MOROSOS_SIN_ARMAS.html`
- `emails-socios/GUIA_MAIL_MERGE_2026.md`
- `emails-socios/RESUMEN_EJECUTIVO.md`
- `emails-socios/morosos-con-armas-mail-merge.csv`
- `emails-socios/morosos-sin-armas-mail-merge.csv`

**Deploy**: Pendiente envío de emails (inicio 9 enero 2026)

---

## 📅 Enero 2026

### 7 de Enero - v1.14.0 Repoblación de Armas y Fechas desde Excel Maestro

#### Repoblación completa de colección `armas` y `fechaAlta`

**Problema**: Los archivos Excel anteriores estaban corruptos o desactualizados. Se identificó un archivo maestro con datos correctos al 31 de diciembre de 2025.

**Archivo fuente**:
```
/Applications/club-738-web/data/socios/2025.31.12_RELACION_SOCIOS_ARMAS.xlsx
```

**Hojas utilizadas**:
- `CLUB 738. RELACION SOCIOS 31 DI`: Relación de armas por socio (471 filas)
- `Anexo A`: Fechas de alta de socios (77 registros)

**Proceso ejecutado**:
1. ✅ Eliminación de archivos Excel corruptos:
   - `CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx` (múltiples versiones)
   - `RELACION-738-30 DE SEPTIEMBRE-2025.xlsx` (múltiples copias)
2. ✅ Limpieza de colección `socios/{email}/armas/`
3. ✅ Repoblación con 276 armas de 65 socios
4. ✅ Actualización de 65 fechas de ingreso (`fechaAlta`)

**Datos importados por arma**:
```javascript
{
  clase: string,         // PISTOLA, RIFLE, ESCOPETA, etc.
  calibre: string,       // .380", 9mm, 12GA, etc.
  marca: string,
  modelo: string,
  matricula: string,     // Matrícula única
  folio: string,         // Folio SEDENA
  modalidad: string,     // 'tiro' | 'caza' (auto-determinado)
  fechaActualizacion: timestamp
}
```

**Script creado**:
- `scripts/repoblar-armas-y-fechas.py`: Script Python con Firebase Admin SDK

**Dependencias Python instaladas**:
- `firebase-admin`: SDK de administración de Firebase
- `openpyxl`: Lectura de archivos Excel .xlsx

**Resultados**:
```
✅ Fechas cargadas: 75 socios desde Anexo A
✅ Armas cargadas: 65 socios validados en Firestore
✅ Armas eliminadas: 0 (ya limpiadas)
✅ Total de armas insertadas: 276
✅ Total de fechas actualizadas: 65
```

**Estructura Firestore actualizada**:
```
socios/{email}
├── fechaAlta: timestamp (desde Anexo A)
├── fechaActualizacionFecha: timestamp
└── armas/ (subcollection)
    └── {uuid}
        ├── clase
        ├── calibre
        ├── marca
        ├── modelo
        ├── matricula
        ├── folio
        ├── modalidad
        └── fechaActualizacion
```

**Notas**:
- Se usa UUID v4 para IDs de armas (evita problemas con caracteres especiales en matrículas)
- La modalidad se determina automáticamente basada en la clase de arma
- Este es ahora el **único archivo Excel válido** para datos maestros de socios/armas

---

### 7 de Enero - v1.13.0 ExpedienteImpresor + Fix VerificadorPETA

#### Nuevo Módulo: ExpedienteImpresor

**Objetivo**: Herramienta para el secretario que permite verificar y preparar documentos digitales para impresión cuando el socio trae sus documentos físicos.

**Funcionalidades**:
- Búsqueda de socio por nombre o email
- Vista de todos los documentos del expediente con estado (✅/❌)
- Indicador de copias requeridas por documento
- Botón "Ver / Imprimir" individual por documento
- Botón "Abrir todos para imprimir" (abre múltiples pestañas)
- Lista de registros de armas (RFA) del socio
- Notas de impresión (INE 200%, etc.)

**Documentos verificados**:
| Documento | Copias requeridas |
|-----------|-------------------|
| INE (ambas caras) | 2 copias ampliadas 200% |
| CURP | 2 copias |
| Cartilla Militar / Acta Nacimiento | 2 copias |
| Constancia Antecedentes Penales | 1 copia (original se entrega) |
| Comprobante de Domicilio | 2 copias |
| Certificado Médico | 1 copia (original se entrega) |
| Certificado Psicológico | 1 copia (original se entrega) |
| Certificado Toxicológico | 1 copia (original se entrega) |
| Modo Honesto de Vivir | 1 copia (original se entrega) |
| Licencia SEMARNAT (opcional) | 2 copias |
| Foto Infantil Digital (opcional) | Para credencial del club |

**Archivos creados**:
- `src/components/ExpedienteImpresor.jsx`: Componente principal
- `src/components/ExpedienteImpresor.css`: Estilos

**Archivos modificados**:
- `src/App.jsx`: Import del componente + tarjeta en panel admin + renderizado de sección

#### Fix: VerificadorPETA - Progreso dinámico

**Problema**: El badge de progreso mostraba "0/19 docs" aunque había documentos encontrados en Storage y checkboxes marcados.

**Causa**: La función `seleccionarPETA()` solo cargaba `peta.verificacionDigitales || {}` pero no auto-marcaba los documentos que ya existían.

**Solución**: Modificar `seleccionarPETA()` para que itere sobre `DOCUMENTOS_DIGITALES` y auto-marque como verificados los documentos que existen en Firestore (`documentosPETA`) o Storage (`preloadedDocs`).

**Código clave agregado**:
```javascript
// Auto-marcar como verificados los documentos que EXISTEN
DOCUMENTOS_DIGITALES.forEach(docItem => {
  const existeEnFirestore = socio.documentosPETA?.[docItem.id]?.url;
  const existeEnStorage = preloaded[docItem.id]?.url;
  
  if ((existeEnFirestore || existeEnStorage) && autoVerifDigitales[docItem.id] === undefined) {
    autoVerifDigitales[docItem.id] = true;
  }
});
```

---

### 6 de Enero - v1.12.1 Enlaces SEDENA + Redes Sociales

#### Nueva Sección: Enlaces SEDENA

**Objetivo**: Facilitar a los socios el acceso a formatos de pago e5cinco.

**Ubicación**: Landing page pública, arriba del pie de página.

**Diseño**:
- **Título**: 📋 Enlaces SEDENA
- **Subtítulo**: *Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos*
- **Grid**: 4 tarjetas con iconos y descripciones

**Tarjetas**:
| Icono | Título | URL |
|-------|--------|-----|
| 📄 | Pago PETA (hasta 3 armas) | PDF formato e5cinco PETA |
| ➕ | Pago por Arma Adicional | PDF formato arma adicional |
| 💰 | Todos los Formatos e5cinco | Catálogo completo SEDENA |
| 🏪 | Comercialización de Armas | Portal DCAM |

#### Redes Sociales en Footer

**Agregados**: Facebook, Instagram, Google Maps en footer de landing page.

**Archivos modificados**:
- `LandingPage.jsx`: Nueva sección `sedena-links-section` + iconos redes sociales
- `LandingPage.css`: Estilos `.sedena-links-section`, `.sedena-links-grid`, `.sedena-link-card`, `.sedena-subtitle`

---

### 6 de Enero - v1.12.0 Rediseño UX Expediente Digital + Foto Credencial

#### Rediseño del Flujo de Documentos PETA

**Cambios conceptuales**:
- Renombrado "Mis Documentos PETA" → "Mi Expediente Digital"
- Enfoque en facilitar el trámite, no en "subir 16 documentos"
- Separación clara: documentos digitales vs físicos

**Documentos eliminados del upload** (se entregan físicos):
- ❌ `fotoPETA` - Foto infantil para PETA
- ❌ `reciboe5cinco` - Recibo de pago de derechos

**Documentos ahora opcionales** (originales físicos):
- 🟡 Certificado Médico
- 🟡 Certificado Psicológico
- 🟡 Certificado Toxicológico

#### Nueva Bienvenida e Instrucciones al Socio

**Sección de bienvenida** en Mi Expediente Digital:
```
👋 ¡Bienvenido!
Para la renovación de tu membresía y trámite PETA:
1. Sube tu documentación digital
2. Prepara los originales físicos
3. Agenda una cita para entrega y pago
```

**Información de entrega física**:
```
📍 MVZ Sergio Muñoz de Alba Medrano
   Secretario del Club
   Calle 26 #246-B x 15 y 15A
   Col. Vista Alegre, 97130, Mérida
   📍 Google Maps | 📱 WhatsApp para cita
```

#### Tarjeta Estado de Pagos Habilitada

**Cambios en Dashboard del Socio**:
- ❌ Eliminada tarjeta "Mi Credencial" (se imprime física)
- ✅ Habilitada tarjeta "Estado de Pagos" con badge dinámico:
  - `✅ Al corriente` (verde) si `renovacion2026.estado === 'pagado'`
  - `⏳ Pendiente` (amarillo) si no

**Modal de Estado de Pagos**:
- Si pagado: muestra monto, fecha, método de pago
- Si pendiente: instrucciones y botón "Agendar cita por WhatsApp"

#### Foto para Credencial como JPG

**Problema**: El uploader convertía todo a PDF, pero necesitamos JPG para Canva.

**Solución**: Nuevo modo `imageOnly` en `MultiImageUploader`:
- Interfaz simplificada: "📸 Sube tu foto"
- Acepta JPG, PNG, HEIC (convierte a JPG)
- Se sube directamente como `.jpg` (no PDF)
- Usado solo para `fotoCredencial`

#### Script: Subida Masiva de Fotos Existentes

**Nuevo script**: `scripts/subir-fotos-credencial.cjs`
- Lee fotos de `data/fotos/fotos_para_canva_bis/`
- Formato nombre: `{seq}_{numCredencial}_{NOMBRE}.jpeg`
- Mapea credencial → email via `credenciales_socios.json`
- Sube a Storage: `documentos/{email}/fotoCredencial_{timestamp}.jpg`
- Actualiza Firestore con estado `precargado`

**Resultado**: 35 fotos subidas exitosamente

---

### 6 de Enero - v1.11.0 Módulo Corte de Caja + Sincronización de Pagos

#### Housekeeping: Reorganización de Estructura del Proyecto

**Objetivo**: Limpiar el root del proyecto y organizar archivos por categoría.

**Nueva estructura de carpetas**:
```
club-738-web/
├── data/                    # DATOS LOCALES (no se suben a Git)
│   ├── socios/              # Excel, CSVs, auth imports
│   ├── credenciales/        # Canva exports, PDFs impresión
│   ├── constancias/         # Constancias antecedentes penales
│   ├── curps/pdfs/          # PDFs de CURPs
│   └── fotos/               # Fotos infantiles socios
│
├── docs/                    # DOCUMENTACIÓN
│   ├── formatos-peta/       # Formatos Word solicitudes
│   ├── legal/               # Ley de Armas, privacidad
│   └── Tiradas Club 738/    # Info de tiradas
│
├── src/components/privacidad/  # Componentes React de privacidad
└── public/assets/           # Logos e imágenes públicas
```

#### Major Feature: Reporte de Pagos / Corte de Caja

**Objetivo**: Crear un módulo de reportes que muestre el estado de cobranza con corte de caja.

##### ReporteCaja.jsx - Nuevo Módulo

**Features implementados**:
- 4 tarjetas de resumen: Total recaudado, Socios pagados, Pendientes, Desglose
- Agrupación por método de pago (efectivo, transferencia, tarjeta, cheque)
- Filtros: Estado (todos/pagados/pendientes/exentos), búsqueda, rango de fechas
- Ordenamiento por nombre, fecha de pago, o monto
- Tabla detallada con: nombre, estado, fecha, cuota club, FEMETI, total, método, comprobante
- Exportar a CSV con encoding UTF-8 (BOM)
- Vista optimizada para impresión

**Integración**:
- Acceso desde Dashboard del Secretario → "📊 Corte de Caja"
- Lee datos de `renovacion2026` y `membresia2026` (dual-source)

#### Bug Fix: Sincronización de Sistemas de Pago

**Problema detectado**: El módulo RegistroPagos y DashboardRenovaciones usaban campos diferentes:
- `RegistroPagos` → `membresia2026.activa`, `pagos[]`
- `DashboardRenovaciones` → `renovacion2026.estado`, `renovacion2026.cuotaClub/cuotaFemeti`

**Solución implementada**:

1. **RegistroPagos.jsx modificado** - Ahora actualiza ambos sistemas:
   ```javascript
   await updateDoc(socioRef, {
     pagos: arrayUnion(registroPago),
     membresia2026: { activa: true, ... },
     'renovacion2026.estado': 'pagado',
     'renovacion2026.cuotaClub': cuotaClub,
     'renovacion2026.cuotaFemeti': cuotaFemeti,
     ...
   });
   ```

2. **DashboardRenovaciones.jsx modificado** - Detecta pagos de ambas fuentes

3. **firestore.rules actualizado** - Permite al secretario actualizar todos los campos

---

### 5 de Enero - v1.10.1 Modalidad de Armas + Estados Sugeridos

**Tiempo de sesión**: ~1.5 horas

#### 1. Campo Modalidad en Armas

**Problema identificado**: Socios pueden solicitar PETA de CAZA con armas registradas para TIRO (y viceversa), lo cual es rechazado en la 32 Zona Militar.

**Solución implementada**:
- Nuevo campo `modalidad` en cada arma: `'caza'`, `'tiro'`, `'ambas'`
- Script de inferencia automática basado en clase/calibre
- 310 armas actualizadas automáticamente

**Script creado**: `scripts/actualizar-modalidad-armas.cjs`
- Inferencia por clase: Escopetas → ambas, Pistolas/Revólveres → tiro
- Inferencia por calibre: .30-06, .308, .270 → caza | .22, 9mm, .45 → tiro
- Modo batch (automático) o interactivo (-i)

**Resultados de inferencia**:
| Modalidad | Cantidad |
|-----------|----------|
| 🦌 Caza | 46 armas |
| 🎯 Tiro | 180 armas |
| ✅ Ambas | 84 armas |

#### 2. Cambio de Bloqueo a Advertencia

**Problema**: El .223 puede ser CAZA o TIRO según el RFA de cada persona. No debemos bloquear.

**Cambios realizados**:
- ❌ Antes: Alert bloqueante que impedía continuar
- ✅ Ahora: Confirm informativo que permite continuar

**Nuevo flujo**:
1. Armas con modalidad diferente muestran advertencia amarilla (no roja)
2. Al enviar, si hay discrepancias → confirm pregunta si desea continuar
3. Mensaje aclara: "La modalidad real depende de tu RFA"

#### 3. MisArmas.jsx - Edición de Modalidad

**Para secretario** (smunozam@gmail.com):
- Dropdown para cambiar modalidad de cualquier arma
- Estilos según modalidad (verde/azul/púrpura)

**Para socios**:
- Badge de solo lectura mostrando modalidad sugerida

#### 4. Estados Sugeridos para PETA

**OCR ejecutado** en imagen de estados de tiro práctico FEMETI.

**Estados sugeridos para Tiro Práctico (10)**:
1. Yucatán (base)
2. Baja California
3. Jalisco
4. Coahuila
5. Hidalgo
6. Tabasco
7. Estado de México
8. Michoacán
9. San Luis Potosí
10. Guanajuato

**Estados sugeridos para Caza (8)**:
- Yucatán, Campeche, Quintana Roo, Tabasco, Chiapas, Veracruz, Tamaulipas, Sonora

**Botón agregado**: "✨ Usar estados sugeridos para Tiro Práctico (FEMETI 2026)"

#### 5. Firestore Rules Actualizado

```javascript
match /armas/{armaId} {
  allow read: if isOwner(email) || isSecretario();
  // Secretario puede actualizar modalidad
  allow update: if isSecretario() 
    && request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['modalidad']);
}
```

---

### 5 de Enero - v1.10.0 Módulo PETA Completo

**Tiempo de sesión**: ~4 horas

#### Componentes Creados (4)

1. **SolicitarPETA.jsx** + CSS (450 líneas)
   - Formulario completo de solicitud PETA
   - 3 tipos: Tiro, Competencia Nacional, Caza
   - Selección de hasta 10 armas
   - Selección de hasta 10 estados (Competencia/Caza)
   - Pre-llenado de domicilio desde Firestore
   - Cálculo automático de vigencias
   - Validaciones completas

2. **MisPETAs.jsx** + CSS (380 líneas)
   - Vista de solicitudes PETA del socio
   - Cards expandibles con detalles
   - Timeline de estados con iconos
   - 6 estados tracking
   - Filtrado por estado

3. **VerificadorPETA.jsx** + CSS (520 líneas)
   - Panel de secretario para verificación
   - Checklist dual: digital (10 docs) + físico (9-11 docs)
   - Barra de progreso (%)
   - Notas del secretario
   - Cambios de estado documentados

4. **RegistroPagos.jsx** + CSS (490 líneas)
   - Sistema de cobranza y membresías
   - 4 conceptos de pago
   - Auto-detección socio nuevo vs existente
   - 4 métodos de pago
   - Activación automática membresía 2026
   - Historial de pagos

#### Estados PETA Implementados

| Estado | Icono | Responsable |
|--------|-------|-------------|
| documentacion_proceso | 🟡 | Socio |
| documentacion_completa | 🟢 | Secretario |
| enviado_32zm | 📤 | Secretario |
| revision_sedena | ⏳ | SEDENA |
| aprobado | ✅ | SEDENA |
| rechazado | ❌ | SEDENA |

#### Flujo de Trabajo PETA

1. Socio completa expediente (16 docs)
2. Socio solicita PETA → `documentacion_proceso`
3. Secretario verifica docs físicos
4. Secretario marca completo → `documentacion_completa`
5. Secretario registra pago → Membresía 2026 ✅
6. Secretario envía a 32ZM → `enviado_32zm`
7. SEDENA revisa → `revision_sedena`
8. Resolución → `aprobado` o `rechazado`

#### Documentación Creada

1. **MANUAL_USUARIO.md** (326 líneas)
   - 5 pasos completos
   - Tabla de 16 documentos
   - Cuotas 2026
   - FAQ (8 preguntas)
   - Contacto

2. **FLUJO_PETA.md** (320 líneas)
   - Diagrama ASCII del flujo
   - Tabla de 6 estados con iconos y responsables
   - Componentes implementados (4)
   - Estructura de datos Firestore completa
   - 3 casos de uso detallados

---

### 5 de Enero - v1.9.1 Renombrado Sitio Web + Mensajes VIP

**Tiempo aproximado**: 30 minutos

#### Renombrado del Sitio
- **Antes**: "Club 738 - Portal de Socios"
- **Ahora**: "Club de Caza, Tiro y Pesca de Yucatán, A.C."
- Actualizado `<title>` y meta descripción en index.html

#### Mensajes VIP Actualizados (6 mensajes)
- Cambiado "Portal Web del Club 738" → "Sitio Web del Club de Caza, Tiro y Pesca de Yucatán"
- Corregido texto de ORIGINALES
- Agregado: "Foto tamaño infantil (física); una para cada PETA"
- Agregado: "Formato de PAGO e5 por los derechos de cada PETA"

**VIPs actualizados**:
1. Gral. Ricardo Fernández (Presidente)
2. Joaquín Gardoni (Tesorero)
3. Iván Cabo
4. Santiago Quintal
5. Ángel García
6. Ariel Paredes

---

### 5 de Enero - v1.9.0 Normalización de Domicilios + UI Unificada

**Tiempo aproximado**: 3 horas

#### Auditoría de copilot-instructions.md
- Revisado contra estructura real del proyecto
- Agregados 7 componentes faltantes
- Agregadas dependencias clave (jspdf, heic2any, pdfjs-dist, tesseract.js, xlsx)
- Documentados 9 scripts de administración

#### Integración WhatsApp
- Agregado ícono SVG de WhatsApp en footers
- Link directo: `https://wa.me/525665824667`
- Implementado en: LandingPage, CalendarioTiradas, CalculadoraPCP

#### Unificación de Headers y Footers
- Headers con logo + 3 badges: SEDENA 738, FEMETI, SEMARNAT
- Footer con ubicación, contacto (WhatsApp + mailto), registros oficiales

#### Normalización de Domicilios (Excel)
**Formato:** `CALLE, COLONIA, MUNICIPIO, ESTADO, CP XXXXX` (4 comas)

| Paso | Resultado |
|------|-----------|
| Saltos de línea → comas | 35 filas |
| Ajustes finos | 122 filas |
| Eliminar totales | 77 filas |
| **Total**: 76 socios, 74 domicilios únicos, 100% normalizados |

#### Importación a Firestore
- 76/76 socios con domicilio estructurado
- Campos: calle, colonia, municipio, estado, cp

#### Scripts Creados

| Script | Propósito |
|--------|-----------|
| `normalizar-domicilios.cjs` | Saltos de línea → comas |
| `normalizar-domicilios-paso2.cjs` | Ajustes finos |
| `eliminar-filas-totales.cjs` | Limpia "TOTAL POR PERSONA" |
| `domicilios-compartidos.cjs` | Identifica duplicados |
| `importar-domicilios-firestore.cjs` | Importa a Firestore |
| `verificar-domicilios-firestore.cjs` | Verifica en Firestore |

---

### 5 de Enero - v1.8.0 Generador de Oficios PETA

**Tiempo aproximado**: 2 horas

#### Módulo GeneradorPETA completo
- Componente React con formulario paso a paso
- Generación de PDF con jsPDF
- Formato oficial SEDENA replicado fielmente
- 3 tipos de PETA: Tiro, Competencia Nacional, Caza

#### Funcionalidades implementadas
- Búsqueda de socios por nombre/email/número
- Selección de tipo con vigencias automáticas
- Tabla de armas con cartuchos editables (máx 10)
- Selector de estados para Competencia/Caza (máx 10)
- Datos del solicitante (NPS, PETA anterior, dirección)

#### Documentación creada
- `docs/PETA_SCHEMA.md` - Esquema completo del módulo
- `docs/TODO.md` - Roadmap actualizado

**Deploy a producción**: https://club-738-app.web.app

---

## 📅 Diciembre 2025 - Enero 2026

### 4 de Enero - v1.6.0 Portal Público Completo

#### Major Release: Landing Page + Calendario de Tiradas + Calculadora PCP

**Objetivo**: Transformar la app de un simple login a un portal público informativo con acceso a socios.

#### Nueva Arquitectura de Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | LandingPage | Página principal con tarjetas de features |
| `/calendario` | CalendarioTiradas | Calendario 2026 (Club 738 + Sureste) |
| `/calculadora` | CalculadoraPCP | Calculadora de energía cinética |

#### LandingPage.jsx - Portal de Entrada

**Features implementados**:
- Header oficial con logo y 3 registros (SEDENA 738, FEMETI YUC 05/2020, SEMARNAT)
- 3 tarjetas de features: Calendario, Calculadora, Hazte Socio
- Login integrado en la página (Portal de Socios)
- Modal de requisitos para nuevos socios con cuotas 2026
- Footer con ubicación, contacto y registros oficiales

#### CalendarioTiradas.jsx - Competencias 2026

**Fuente de datos**: `src/data/tiradasData.js`

**Tiradas Club 738** (11 confirmadas):
- Recorrido de Caza (RC): Tirada del Benemérito, Tirada del Padre, etc.
- Tiro Práctico Mexicano (TPM): Competencias bimestrales
- Blancos en Movimiento (BM)
- Siluetas Metálicas (SM)

**Región Sureste** (50+ tiradas):
- Estados: Yucatán, Campeche, Quintana Roo, Tabasco, Chiapas, Veracruz
- Fuente: FEMETI - Registro Nacional 2026

#### CalculadoraPCP.jsx - Energía Cinética

**Propósito**: Verificar si un rifle de aire requiere registro SEDENA (>140 joules)

**Funcionalidad**:
- Selector de calibres por categoría (pequeños, medianos, grandes)
- Cálculo: E = 0.5 × m × v² (granos → kg, fps → m/s)
- Resultado visual: ✅ No requiere / ⚠️ Requiere registro
- Velocidad límite calculada para cada peso

---

### 3 de Enero - v1.3.0 OCR Validation + Centralización de Registros de Armas

#### Problema resuelto: Upload de registros de armas fallaba por permisos

**Root cause**: Las reglas de Firestore tienen `allow write: if false` en `/socios/{email}/armas/{armaId}`, bloqueando actualizaciones desde cliente.

**Solución implementada**: 
1. **Centralizar uploads en "Documentos PETA"**
2. **Validación OCR automática** - Verifica matrícula antes de subir

#### Archivos creados
- `src/utils/ocrValidation.js` - Validador OCR con lazy loading
- `src/components/documents/ArmasRegistroUploader.jsx` - Uploader especializado

#### Dependencias agregadas
- `tesseract.js` - OCR en navegador
- `pdfjs-dist` - Extracción de texto y rendering de PDFs

---

### 3 de Enero - v1.2.0 Uploader con opción PDF preparado

#### Mejora UX: Selector de modo de subida

**Problema identificado**: Las fotos tomadas desde iPhone y convertidas a PDF resultaban de muy baja calidad.

**Solución**: Dar al usuario la opción clara de subir un PDF ya preparado correctamente.

---

### 3 de Enero - v1.1.1 Fix Storage Path + CORS

#### Bug crítico corregido: Error de permisos en upload

**Problema**: Al subir documentos desde iPhone aparecía error de permisos.

**Root cause**: `DocumentUploader.jsx` usaba ruta incorrecta:
- ❌ Antes: `socios/${userId}/documentos/${fileName}`
- ✅ Ahora: `documentos/${userId}/${fileName}`

**CORS configurado** (`cors.json`):
```json
{
  "origin": ["https://club-738-app.web.app", "http://localhost:5173"],
  "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
  "maxAgeSeconds": 3600
}
```

---

### 3 de Enero - v1.1.0 Privacidad LFPDPPP

#### Implementación de Protección de Datos Personales

**Implementación completa**:
1. **Página de Aviso de Privacidad** (`/aviso-privacidad`) - 3 tabs
2. **Componente ConsentimientoPriv.jsx** - 3 checkboxes
3. **Links en footer** - "📋 Aviso de Privacidad" + "⚖️ Derechos ARCO"

**Cumplimiento LFPDPPP**:
| Requisito | Artículo | ✅ |
|-----------|----------|---|
| Identidad del responsable | Art. 15.I | ✅ |
| Datos que se recaban | Art. 15.II | ✅ |
| Finalidades (primarias/secundarias) | Art. 15.III | ✅ |
| Datos sensibles con consentimiento | Art. 8 | ✅ |
| Derechos ARCO | Art. 22-27 | ✅ |
| Transferencias | Art. 36-37 | ✅ |

---

### 3 de Enero - v1.0.0 Release

#### Sesión de desarrollo completa

**Problema inicial**: Los socios necesitan subir documentos desde sus iPhones, pero las fotos en formato HEIC no se podían procesar.

**Solución implementada**:
1. Instalé `heic2any` para convertir HEIC → JPEG
2. Instalé `jsPDF` para convertir imágenes → PDF
3. Creé `MultiImageUploader.jsx`

**Bug crítico encontrado y corregido**: El componente usaba `user.uid` pero las Storage Rules esperaban `user.email`.

---

### 2 de Enero - v0.2.0 Expansión de documentos PETA

Expandí `DocumentList.jsx` de 8 a 14 tipos de documentos, organizados en 6 categorías.

---

### 1 de Enero - v0.1.0 Setup inicial y seguridad

**Reglas de seguridad implementadas** - Cada socio solo puede acceder a sus propios datos.

**Scripts de migración creados**:
- `scripts/subir-curps.cjs` - Subir 76 CURPs a Storage
- `scripts/actualizar-curps-firestore.cjs` - Actualizar URLs en Firestore
- `scripts/agregar-socios-faltantes.cjs` - Crear documentos para socios sin registro

---

## 🏗️ Arquitectura

```
club-738-web/
├── src/
│   ├── App.jsx              # Router principal + auth state
│   ├── firebaseConfig.js    # Firebase services init
│   └── components/
│       ├── Login.jsx                    # Auth (login/signup)
│       ├── LandingPage.jsx              # Portal público
│       ├── CalendarioTiradas.jsx        # Calendario competencias
│       ├── CalculadoraPCP.jsx           # Calculadora energía
│       ├── MisArmas.jsx                 # Listado de armas
│       ├── MisDocumentosOficiales.jsx   # CURP + Constancia viewer
│       ├── WelcomeDialog.jsx            # Onboarding modal
│       ├── GeneradorPETA.jsx            # Generador oficios PDF
│       ├── SolicitarPETA.jsx            # Formulario solicitud PETA
│       ├── MisPETAs.jsx                 # Estado de solicitudes
│       ├── VerificadorPETA.jsx          # Panel verificación secretario
│       ├── ExpedienteImpresor.jsx       # Preparar impresiones
│       ├── RegistroPagos.jsx            # Cobranza y membresías
│       ├── ReporteCaja.jsx              # Corte de caja
│       ├── DashboardRenovaciones.jsx    # Panel cobranza
│       ├── DashboardCumpleanos.jsx      # Demografía socios
│       ├── documents/
│       │   ├── DocumentList.jsx         # Grid de documentos
│       │   ├── DocumentCard.jsx         # Card individual
│       │   ├── DocumentUploader.jsx     # Upload simple (PDF)
│       │   ├── MultiImageUploader.jsx   # Upload multi-foto → PDF
│       │   └── ArmasRegistroUploader.jsx # Upload registros armas
│       └── privacidad/
│           ├── AvisoPrivacidad.jsx      # Página completa LFPDPPP
│           └── ConsentimientoPriv.jsx   # Checkbox consentimiento
├── docs/                    # Documentación
├── scripts/                 # Node.js migration scripts
├── firestore.rules          # Security rules DB
├── storage.rules            # Security rules files
└── firebase.json            # Hosting config
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Socios registrados | 76 |
| Tipos de documentos | 14 |
| Componentes React | 20+ |
| Versión actual | v1.13.0 |
| Última release | 7 Ene 2026 |

---

## 📝 Notas de Negocio

1. **Donativos**: Club opera con cuotas como donativos, sin emisión de facturas fiscales
2. **Métodos de pago**: Solo efectivo confirmado, transferencia bancaria pendiente autorización
3. **Credenciales PVC**: Evaluando proveedor en Mérida para impresión profesional tipo licencia de conducir
4. **RFA digitalizados**: Beneficio clave - socios suben una vez, secretario imprime cuando necesita

---

## 🔮 Roadmap

### Próximo (v1.14.0+)
- [ ] Firma del Presidente para credenciales
- [ ] Cambio de estado a "Enviado 32ZM"
- [ ] Registro número PETA asignado por SEDENA
- [ ] Mi Credencial digital descargable

### Futuro
- [ ] Reminder semanal cobranza
- [ ] Generador de comunicados WhatsApp/Email
- [ ] Alertas de vencimiento de PETAs
- [ ] PWA con modo offline

---

## 🐛 Bugs Conocidos

1. **Cache agresivo**: Usuarios ven versión vieja después de deploy. Solución: hard refresh o modo incógnito.

2. **Bundle grande**: 2.4MB por incluir Firebase completo. TODO: importar solo módulos necesarios.

---

## 👥 Contacto

- **Administrador**: Sergio Muñoz (smunozam@gmail.com)
- **Club**: tiropracticoyucatan@gmail.com
- **Teléfono**: +52 56 6582 4667

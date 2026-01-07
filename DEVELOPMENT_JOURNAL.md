# 📔 Development Journal - Club 738 Web

## Resumen del Proyecto

**Club 738 Web** es el portal de socios del Club de Caza, Tiro y Pesca de Yucatán, A.C. (SEDENA #738). Permite a los socios gestionar su documentación para trámites PETA ante la 32 Zona Militar de Valladolid.

**URL de Producción**: https://club-738-app.web.app

---

## 📅 Enero 2026

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

### 6 de Enero - v1.12.1 Enlaces SEDENA en Landing Page

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

**Archivos modificados**:
- `LandingPage.jsx`: Nueva sección `sedena-links-section` con grid de 4 enlaces
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

#### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `DocumentList.jsx` | Eliminados fotoPETA, reciboe5cinco; certificados opcionales; nueva bienvenida |
| `DocumentList.css` | Estilos para bienvenida, dirección entrega, contacto |
| `DocumentCard.jsx` | Nuevo array `IMAGE_ONLY_DOCS`, prop `imageOnly` |
| `MultiImageUploader.jsx` | Prop `imageOnly`, función `handleImageOnlyUpload`, upload como JPG |
| `MultiImageUploader.css` | Estilos para modo imagen simplificado |
| `App.jsx` | Modal estado pagos, eliminada tarjeta credencial, badge dinámico |
| `App.css` | Estilos modal pagos, badges pagado/pendiente |
| `LandingPage.jsx` | Cuotas reemplazadas por contacto WhatsApp/email |

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

**Archivos movidos**:
| Origen | Destino |
|--------|---------|
| `Base datos/*.xlsx` | `data/socios/` |
| `credenciales_socios.*` | `data/socios/` |
| `Credencial-Club-2026/` | `data/credenciales/` |
| `2025. 738. CONSTANCIAS...` | `data/constancias/` |
| `curp_socios/` | `data/curps/pdfs/` |
| `fotos infantiles socios/` | `data/fotos/` |
| `privacidad/*.jsx,css` | `src/components/privacidad/` |
| `privacidad/*.md,pdf` | `docs/legal/` |

**.gitignore actualizado** para nueva estructura `data/`

---

#### Major Feature: Reporte de Pagos / Corte de Caja

**Objetivo**: Crear un módulo de reportes que muestre el estado de cobranza con corte de caja.

#### ReporteCaja.jsx - Nuevo Módulo

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

2. **DashboardRenovaciones.jsx modificado** - Detecta pagos de ambas fuentes:
   ```javascript
   if (estado !== 'pagado' && data.membresia2026?.activa) {
     estado = 'pagado';
   }
   ```

3. **firestore.rules actualizado** - Permite al secretario actualizar todos los campos:
   ```javascript
   allow update: if isSecretario();
   ```

4. **Migración de datos** - Script para sincronizar pagos existentes (ej: Santiago Quintal Paredes)

#### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `src/components/ReporteCaja.jsx` | Módulo de corte de caja |
| `src/components/ReporteCaja.css` | Estilos responsive + impresión |

#### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/App.jsx` | Import ReporteCaja, botón en menú admin, sección de visualización |
| `src/components/RegistroPagos.jsx` | Sincroniza renovacion2026 al registrar pago |
| `src/components/DashboardRenovaciones.jsx` | Lee de ambas fuentes de pago |
| `firestore.rules` | Permisos de escritura para secretario |

---

### 5 de Enero - v1.10.0 Paleta de Colores + Mejoras UI

#### Implementación de Variables CSS

**Objetivo**: Centralizar colores del proyecto para mantener consistencia visual.

**Variables definidas en :root**:
```css
--color-primary: #2d5a2d;
--color-primary-dark: #1a2e1a;
--color-primary-light: #e8f5e8;
--color-success: #2d7a2d;
--color-warning: #f0a020;
--color-danger: #dc3545;
--color-text-primary: #1a2e1a;
--color-text-muted: #888;
...
```

#### Mejoras de UI

1. **Footer legibilidad** - Texto amarillo cambiado a color visible
2. **Logo como botón home** - Click en logo regresa a landing
3. **Botones "Volver"** - Estilizados consistentemente en todas las secciones
4. **Firebase Functions** - Deploy de funciones de email (onPetaCreated, testEmail)

---

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

**Correcciones aplicadas**:
- Año del club: Fundado 2005 (no "70+ años")
- Cuotas actualizadas a 2026
- Eliminado subheader duplicado
- Eliminadas tarjetas de estadísticas (socios activos, años de historia)

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

**Features del calendario**:
- 3 vistas: Calendario mensual, Lista, Solo Club 738
- Filtros por modalidad y estado
- Semana inicia en Lunes (Sáb/Dom a la derecha)
- Link a Google Maps del campo de tiro
- Navegación de regreso a landing

#### CalculadoraPCP.jsx - Energía Cinética

**Propósito**: Verificar si un rifle de aire requiere registro SEDENA (>140 joules)

**Funcionalidad**:
- Selector de calibres por categoría (pequeños, medianos, grandes)
- Cálculo: E = 0.5 × m × v² (granos → kg, fps → m/s)
- Resultado visual: ✅ No requiere / ⚠️ Requiere registro
- Velocidad límite calculada para cada peso

#### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `src/components/LandingPage.jsx` | Página de inicio pública |
| `src/components/LandingPage.css` | Estilos responsive |
| `src/components/CalendarioTiradas.jsx` | Calendario de competencias |
| `src/components/CalendarioTiradas.css` | Estilos del calendario |
| `src/components/CalculadoraPCP.jsx` | Calculadora de energía |
| `src/components/CalculadoraPCP.css` | Estilos de la calculadora |
| `src/data/tiradasData.js` | Datos de 60+ tiradas 2026 |
| `public/assets/logo-club-738.jpg` | Logo oficial del club |

#### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/App.jsx` | Detección de rutas públicas, import LandingPage |
| `.github/copilot-instructions.md` | Documentación completa actualizada |

#### Documentación Actualizada

**copilot-instructions.md** - Reescrito completamente:
- Información oficial del club (registros correctos)
- Arquitectura de componentes actual
- Estructura de rutas públicas
- Cuotas 2026
- Calendario de tiradas
- Pending features actualizado

---

### 3 de Enero - v1.3.0 OCR Validation + Centralización de Registros de Armas

#### Problema resuelto: Upload de registros de armas fallaba por permisos

**Error detectado**: Al subir PDF de registro de arma desde "Mis Armas", aparecía error de permisos de Firestore:
```
Missing or insufficient permissions
```

**Root cause**: Las reglas de Firestore tienen `allow write: if false` en `/socios/{email}/armas/{armaId}`, bloqueando actualizaciones desde cliente.

**Solución implementada**: 

1. **Centralizar uploads en "Documentos PETA"** - El documento "Registros de Armas (RFA)" ahora muestra las armas del socio con opción de subir cada registro individual.

2. **Validación OCR automática** - Antes de subir, el sistema:
   - Extrae texto del PDF usando pdfjs-dist
   - Si es PDF escaneado, aplica OCR con tesseract.js
   - Verifica que la matrícula del arma aparezca en el documento
   - Solo permite upload si la matrícula coincide

3. **MisArmas simplificado** - Vista de solo lectura mostrando estado de registros

#### Archivos creados
- `src/utils/ocrValidation.js` - Validador OCR con lazy loading
- `src/components/documents/ArmasRegistroUploader.jsx` - Uploader especializado
- `src/components/documents/ArmasRegistroUploader.css` - Estilos

#### Archivos modificados
- `src/components/MisArmas.jsx` - Simplificado a vista read-only
- `src/components/MisArmas.css` - Estilos para nota informativa
- `src/components/documents/DocumentCard.jsx` - Caso especial para registrosArmas
- `src/components/documents/DocumentCard.css` - Estilos card armas

#### Dependencias agregadas
- `tesseract.js` - OCR en navegador
- `pdfjs-dist` - Extracción de texto y rendering de PDFs

#### Características técnicas
- **Lazy loading** de bibliotecas pesadas para no afectar carga inicial
- **Dos métodos de extracción**: texto nativo del PDF + OCR como fallback
- **Variaciones de OCR**: Tolera confusiones comunes (0/O, 1/I/L, 5/S)
- **Progress feedback**: Muestra progreso de validación al usuario

---

### 3 de Enero - v1.2.0 Uploader con opción PDF preparado

#### Mejora UX: Selector de modo de subida

**Problema identificado**: Las fotos tomadas desde iPhone y convertidas a PDF resultaban de muy baja calidad. Los documentos oficiales (especialmente INE) requieren ampliación al 200% y buena resolución.

**Solución**: Dar al usuario la opción clara de subir un PDF ya preparado correctamente.

#### MultiImageUploader - Selector de modo

Ahora muestra **dos opciones claras** al iniciar:

1. **📄 "Ya tengo PDF listo"**
   - Requisitos mostrados: Tamaño carta, 200 DPI, ampliado 200%, máx 5MB
   - Link directo a iLovePDF.com para preparar documentos
   - Solo acepta archivos PDF

2. **📷 "Tomar foto"**  
   - Convierte fotos a PDF automáticamente
   - Advertencia especial para INE sobre preparar PDF al 200%

#### MisArmas - Solo PDFs

- **Eliminada opción de imágenes** - Solo acepta PDFs
- Requisitos claros: Tamaño carta, 200-300 DPI, máx 5MB
- Mensaje de error informativo con link a iLovePDF

#### Archivos modificados
- `src/components/documents/MultiImageUploader.jsx` - Selector de modo PDF/Foto
- `src/components/documents/MultiImageUploader.css` - Estilos para selector
- `src/components/MisArmas.jsx` - Solo acepta PDFs

---

### 3 de Enero - v1.1.1 Fix Storage Path + CORS

#### Bug crítico corregido: Error de permisos en upload

**Problema**: Al subir documentos desde iPhone aparecía error:
```
User does not have permission to access 'documentos/EQASQOwPz1PRZRxjcBt695dD2tl1/ine_xxx.pdf'
```

**Root cause**: `DocumentUploader.jsx` usaba ruta incorrecta:
- ❌ Antes: `socios/${userId}/documentos/${fileName}`
- ✅ Ahora: `documentos/${userId}/${fileName}`

**Solución aplicada**:
1. Corregí ruta en `DocumentUploader.jsx` línea 48
2. Instalé Google Cloud SDK (`brew install --cask google-cloud-sdk`)
3. Configuré CORS para Firebase Storage

**CORS configurado** (`cors.json`):
```json
{
  "origin": ["https://club-738-app.web.app", "http://localhost:5173"],
  "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
  "maxAgeSeconds": 3600
}
```

**Comando ejecutado**:
```bash
gsutil cors set cors.json gs://club-738-app.firebasestorage.app
```

#### Mejoras de debugging
- Agregué console.log con emojis en `MisDocumentosOficiales.jsx`
- Agregué display de código de error en UI cuando documento no carga

#### Archivos modificados
- `src/components/documents/DocumentUploader.jsx` - Fix ruta Storage
- `src/components/MisDocumentosOficiales.jsx` - Logs de debug
- `src/components/MisDocumentosOficiales.css` - Estilo error code
- `cors.json` - Configuración CORS (nuevo)

---

### 3 de Enero - v1.1.0 Privacidad LFPDPPP

#### Implementación de Protección de Datos Personales

**Contexto legal**: La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) requiere que los sitios web que manejan datos personales:
1. Publiquen un Aviso de Privacidad
2. Informen sobre Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
3. Obtengan consentimiento expreso para datos sensibles

**Implementación completa**:

1. **Página de Aviso de Privacidad** (`/aviso-privacidad`)
   - 3 tabs: Simplificado, Integral, Derechos ARCO
   - Diseño responsive con estilos del club
   - Formulario para ejercer derechos ARCO (abre mailto:)

2. **Componente ConsentimientoPriv.jsx**
   - 3 checkboxes: primario (obligatorio), sensibles (obligatorio), secundario (opcional)
   - Para integrar en formulario de registro de socios

3. **Links en footer**
   - "📋 Aviso de Privacidad"
   - "⚖️ Derechos ARCO"

**Cumplimiento LFPDPPP**:
| Requisito | Artículo | ✅ |
|-----------|----------|---|
| Identidad del responsable | Art. 15.I | ✅ |
| Datos que se recaban | Art. 15.II | ✅ |
| Finalidades (primarias/secundarias) | Art. 15.III | ✅ |
| Datos sensibles con consentimiento | Art. 8 | ✅ |
| Derechos ARCO | Art. 22-27 | ✅ |
| Transferencias | Art. 36-37 | ✅ |

#### Archivos creados
- `src/components/privacidad/AvisoPrivacidad.jsx` (450+ líneas)
- `src/components/privacidad/AvisoPrivacidad.css`
- `src/components/privacidad/ConsentimientoPriv.jsx`
- `src/components/privacidad/ConsentimientoPriv.css`

#### Archivos modificados
- `src/App.jsx` - Import AvisoPrivacidad, sección privacidad, links en footer
- `src/App.css` - Estilos para links de privacidad

---

### 3 de Enero - v1.0.0 Release

#### Sesión de desarrollo completa

**Problema inicial**: Los socios necesitan subir documentos desde sus iPhones, pero las fotos en formato HEIC no se podían procesar.

**Solución implementada**:
1. Instalé `heic2any` para convertir HEIC → JPEG
2. Instalé `jsPDF` para convertir imágenes → PDF
3. Creé `MultiImageUploader.jsx` - componente que permite:
   - Seleccionar múltiples fotos (ej: INE frente y reverso)
   - Convertir automáticamente a PDF
   - Preview de imágenes antes de subir
   - Progress bar durante conversión

**Bug crítico encontrado**: Al probar en iPhone, apareció error de permisos:
```
User does not have permission to access 'documentos/EQASQOwPz1PRZRxjcBt695dD2tl1/...'
```

**Root cause**: El componente usaba `user.uid` (UID de Firebase Auth) pero las Storage Rules esperaban `user.email`. 

**Fix aplicado en App.jsx**:
```jsx
// Antes (incorrecto)
userId={user.uid}

// Después (correcto)
userId={user.email.toLowerCase()}
```

**Optimización móvil**: Agregué media queries para pantallas <480px:
- Header más compacto
- Cards de documentos con padding reducido
- Botones full-width para mejor touch target
- Grid de documentos en columna única

#### Archivos creados/modificados
- `src/components/documents/MultiImageUploader.jsx` (372 líneas)
- `src/components/documents/MultiImageUploader.css`
- `src/App.jsx` - Fix userId
- `src/App.css` - Mobile styles
- `src/components/documents/DocumentCard.css` - Mobile styles
- `src/components/documents/DocumentList.css` - Mobile styles

---

### 2 de Enero - v0.2.0

#### Expansión de documentos PETA

**Contexto**: Revisé el documento oficial "Requisitos PETA (1).docx" y encontré que se necesitan 16 documentos, no 8.

**Cambios**:
- Expandí `DocumentList.jsx` de 8 a 14 tipos de documentos
- Organicé en 6 categorías: Identificación, Médicos, Legales, Armas, Fotos, Pago
- Actualicé `copilot-instructions.md` con tabla de requisitos completa

**Documentos agregados**:
- Certificado Toxicológico
- Carta Modo Honesto de Vivir
- Licencia de Caza
- Registros de Armas (RFA)
- Fotografía
- Recibo e5cinco

#### Nuevo logo
- Subí el nuevo logo del club (escudo verde/dorado)
- Actualicé `public/logo-club-738.png`

---

### 1 de Enero - v0.1.0

#### Setup inicial y seguridad

**Reglas de seguridad implementadas**:

```javascript
// firestore.rules
match /socios/{email} {
  allow read, write: if request.auth.token.email.lower() == email;
}

// storage.rules
match /documentos/{email}/{document=**} {
  allow read, write: if request.auth.token.email.lower() == email;
}
```

**Principio**: Cada socio solo puede acceder a sus propios datos.

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
│       ├── Login.jsx        # Auth (login/signup)
│       ├── MisArmas.jsx     # Listado de armas
│       ├── MisDocumentosOficiales.jsx  # CURP + Constancia viewer
│       ├── WelcomeDialog.jsx           # Onboarding modal
│       ├── documents/
│       │   ├── DocumentList.jsx        # Grid de 14 documentos
│       │   ├── DocumentCard.jsx        # Card individual
│       │   ├── DocumentUploader.jsx    # Upload simple (PDF)
│       │   └── MultiImageUploader.jsx  # Upload multi-foto → PDF
│       └── privacidad/
│           ├── AvisoPrivacidad.jsx     # Página completa LFPDPPP
│           ├── AvisoPrivacidad.css
│           ├── ConsentimientoPriv.jsx  # Checkbox consentimiento
│           └── ConsentimientoPriv.css
├── privacidad/              # Documentos legales fuente (MD)
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
| Tamaño bundle | 2.4 MB (649 KB gzip) |
| Lighthouse Performance | Pending |
| Cobertura de tests | 0% (TODO) |

---

## 🔮 Roadmap

### v1.2.0 (Próximo)
- [ ] Generación de Credencial del Club (PDF)
- [ ] Notificaciones de documentos por vencer
- [ ] Panel de administrador para secretario

### v1.3.0
- [ ] Exportar expediente completo (ZIP)
- [ ] Firma digital en solicitud PETA
- [ ] Integración con calendario de vencimientos

### v2.0.0
- [ ] PWA con modo offline
- [ ] Push notifications
- [ ] Chat de soporte

### ✅ Completado en v1.1.0
- [x] Aviso de Privacidad (LFPDPPP)
- [x] Derechos ARCO
- [x] Consentimiento para datos sensibles

---

## 🐛 Bugs Conocidos

1. **Cache agresivo**: Usuarios ven versión vieja después de deploy. Solución: hard refresh o modo incógnito.

2. **Bundle grande**: 2.4MB por incluir Firebase completo. TODO: importar solo módulos necesarios.

---

## 👥 Contacto

- **Administrador**: Sergio Muñoz (smunozam@gmail.com)
- **Club**: tiropracticoyucatan@gmail.com
- **Teléfono**: +52 56 6582 4667

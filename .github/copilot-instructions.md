# Club 738 Web - AI Coding Agent Instructions

## Project Overview

**Club de Caza, Tiro y Pesca de Yucatán, A.C.** (Club 738) es un portal web en español para socios de un club de caza/tiro/pesca. La aplicación provee:
- **Portal público**: Landing page, calendario de tiradas, calculadora PCP, requisitos de membresía
- **Portal de socios**: Gestión de documentos PETA, registro de armas, expediente digital

### Información Oficial del Club
```
Club de Caza, Tiro y Pesca de Yucatán, A.C.
Calle 50 No. 531-E x 69 y 71
Col. Centro, 97000 Mérida, Yucatán
Tel: +52 56 6582 4667 (WhatsApp)
Email: tiropracticoyucatan@gmail.com

Registros Oficiales:
- SEDENA: 738
- FEMETI: YUC 05/2020
- SEMARNAT: SEMARNAT-CLUB-CIN-005-YUC-05

Fundado: 2005
```

---

## 🔄 Git Workflow (Multi-Machine Development)

### Repositorio
```
https://github.com/smunozsader/club-738-app.git
```

### Máquinas de Desarrollo
| Máquina | OS | Ruta |
|---------|-----|------|
| iMac Desktop | macOS | `/Applications/club-738-web` |
| Laptop | Windows | `C:\Users\smuno\Club_738_Webapp\club-738-app` |

### Flujo Diario OBLIGATORIO

```
┌─────────────────────────────────────────────────────────┐
│  AL EMPEZAR A TRABAJAR (en cualquier máquina)          │
├─────────────────────────────────────────────────────────┤
│  git pull                                               │
│  (o en VS Code: Source Control → ... → Pull)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  AL TERMINAR DE TRABAJAR                               │
├─────────────────────────────────────────────────────────┤
│  git add .                                              │
│  git commit -m "descripción de cambios"                │
│  git push                                               │
│                                                         │
│  (o en VS Code: Source Control → + → Commit → Push)    │
└─────────────────────────────────────────────────────────┘
```

### 📔 Journaling de Desarrollo (OBLIGATORIO para AI Agent)

**Después de cada cambio significativo**, el AI coding agent DEBE:

1. **Documentar en el Journal** (`docs/DEVELOPMENT_JOURNAL.md`):
   - Fecha y versión (si aplica)
   - Qué se modificó/creó
   - Archivos afectados
   - Problemas resueltos o features agregados

2. **Commit descriptivo** con formato:
   ```
   tipo(scope): descripción breve
   
   - Detalle 1
   - Detalle 2
   ```
   Tipos: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`

3. **Push a GitHub** para sincronizar entre máquinas

**¿Cuándo sugerir journaling al usuario?**
- ✅ Después de crear un nuevo componente
- ✅ Después de corregir un bug significativo
- ✅ Después de modificar múltiples archivos (3+)
- ✅ Después de actualizar configuración (firebase, rules, etc.)
- ✅ Después de agregar nuevas dependencias
- ✅ Al finalizar una sesión de desarrollo extensa

**Frase sugerida al usuario**:
> "Los cambios están completos. ¿Quieres que actualice el journal, haga commit y push a GitHub?"

**Estructura del Journal entry**:
```markdown
### [Fecha] - v[X.Y.Z] Descripción breve

#### [Nombre del feature/fix]

**Objetivo**: [Qué se quería lograr]

**Cambios realizados**:
- [Cambio 1]
- [Cambio 2]

**Archivos modificados/creados**:
- `path/to/file.jsx` - [descripción]

**Deploy**: [Si se desplegó a producción]
```

### Resolución de Conflictos
Si olvidaste hacer pull y hay cambios remotos:
```bash
git pull --rebase
# Si hay conflictos, resolverlos manualmente
git add .
git rebase --continue
git push
```

### Archivos que NO se sincronizan (en .gitignore)
```
node_modules/           # Se regenera con npm install
scripts/serviceAccountKey.json  # Credenciales Firebase Admin
dist/                   # Build de producción
```

**IMPORTANTE**: El archivo `serviceAccountKey.json` debe copiarse manualmente a cada máquina (USB, email seguro, etc.)

---

## Architecture

### Tech Stack
- **Frontend**: React 18.x + Vite 5.x
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **Styling**: CSS co-localizados con componentes

### Dependencias Clave
| Paquete | Versión | Propósito |
|---------|---------|----------|
| `jspdf` | ^4.0.0 | Generación de PDFs (oficios PETA, credenciales) |
| `heic2any` | ^0.0.4 | Conversión de fotos HEIC (iPhone) a JPG |
| `pdfjs-dist` | ^5.4.530 | Renderizado y procesamiento de PDFs |
| `tesseract.js` | ^7.0.0 | OCR para validación de documentos |
| `xlsx` | ^0.18.5 | Lectura de archivos Excel (importación de datos) |

### Firebase Backend Integration
- **Authentication**: Firebase Auth (email/password)
- **Database**: Firestore (socios, armas, documentos)
- **File Storage**: Firebase Cloud Storage (documentos PETA, registros)
- **Hosting**: Firebase Hosting

Ver [src/firebaseConfig.js](src/firebaseConfig.js) para la inicialización.

### URL de Producción
```
https://yucatanctp.org
```

## Component Architecture

### Estructura de Rutas
```
/                   → LandingPage (público)
/calendario         → CalendarioTiradas (público)
/tiradas            → CalendarioTiradas (alias de /calendario)
/calculadora        → CalculadoraPCP (público)
[login]             → Dashboard del socio (autenticado)
```

### Componentes Principales

| Componente | Tipo | Descripción |
|------------|------|-------------|
| **LandingPage.jsx** | Público | Página de inicio con tarjetas de features, login integrado, modal de requisitos, enlaces SEDENA |
| **CalendarioTiradas.jsx** | Público | Calendario de competencias 2026 (Club 738 + región Sureste) |
| **CalculadoraPCP.jsx** | Público | Calculadora de energía cinética para rifles de aire |
| **MisArmas.jsx** | Autenticado | Vista de armas registradas del socio. Secretario puede editar modalidad |
| **MisDocumentosOficiales.jsx** | Autenticado | CURP y Constancia de antecedentes descargables |
| **DocumentList.jsx** | Autenticado | Lista de documentos PETA con estado (Mi Expediente Digital) |
| **DocumentUploader.jsx** | Autenticado | Subida de documentos con validación |
| **SolicitarPETA.jsx** | Autenticado | Formulario para solicitar trámite PETA (hasta 10 armas, 10 estados). Admin puede solicitar para cualquier socio |
| **MisPETAs.jsx** | Autenticado | Vista de estado de solicitudes PETA del socio con timeline |
| **VerificadorPETA.jsx** | Solo Admin | Checklist de verificación de documentos por socio/PETA |
| **ExpedienteImpresor.jsx** | Solo Admin | Preparar e imprimir documentos digitales del socio |
| **RegistroPagos.jsx** | Solo Admin | Registro de pagos y activación de membresías |
| **ReporteCaja.jsx** | Solo Admin | Corte de caja, reporte de pagos con filtros y exportar CSV |
| **DashboardRenovaciones.jsx** | Solo Admin | Panel de cobranza 2026 |
| **DashboardCumpleanos.jsx** | Solo Admin | Demografía y cumpleaños de socios |
| **GeneradorPETA.jsx** | Solo Admin | Generador de oficios PETA en PDF (jsPDF) |
| **AdminDashboard.jsx** | Solo Admin | Panel principal de administración con tabla de socios y sidebar de herramientas |
| **ExpedienteAdminView.jsx** | Solo Admin | Vista detallada del expediente de un socio específico |
| **ReportadorExpedientes.jsx** | Solo Admin | Reportes y análisis de expedientes de socios |
| **AdminBajasArsenal.jsx** | Solo Admin | Gestión de solicitudes de baja de armas |
| **AdminAltasArsenal.jsx** | Solo Admin | Gestión de solicitudes de alta de armas |
| **CobranzaUnificada.jsx** | Solo Admin | Panel unificado de cobranza (integra pagos, reportes, renovaciones) |
| **MiAgenda.jsx** | Solo Admin | Gestión de citas y agenda del secretario |
| **WelcomeDialog.jsx** | Autenticado | Diálogo de bienvenida para nuevos usuarios |
| **Login.jsx** | Público | Formulario de login standalone (usado en LandingPage) |
| **AvisoPrivacidad.jsx** | Público | Componente de aviso de privacidad integral |
| **ArmasRegistroUploader.jsx** | Autenticado | Subida de registros RFA por arma |
| **ImageEditor.jsx** | Autenticado | Editor de imágenes (recorte, rotación) |
| **MultiImageUploader.jsx** | Autenticado | Subida múltiple de imágenes (INE, fotos) |
| **ProgressBar.jsx** | Autenticado | Barra de progreso para subidas |

### Archivos de Datos
- **src/data/tiradasData.js**: Calendario de tiradas 2026 (Club 738 + regionales)

## Key Patterns & Conventions

### Authentication Flow
```jsx
// App.jsx - Estado de autenticación
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

### Public Routes Detection
```jsx
// Rutas públicas que no requieren login
const isCalculadoraRoute = () => window.location.pathname === '/calculadora';
const isCalendarioRoute = () => window.location.pathname === '/calendario';
```

### Firestore Real-time Listeners
```jsx
// Escuchar cambios en documentos del socio
const unsubscribe = onSnapshot(socioRef, (docSnap) => {
  if (docSnap.exists()) {
    setSocioData(docSnap.data());
  }
});
```

### Component Design
- Functional components con React Hooks
- CSS co-localizados (ComponentName.jsx + ComponentName.css)
- Estados de carga manejados por componente
- Formularios con try/catch y finally para loading states

### Internationalization
- **100% en español**: UI, mensajes, placeholders
- Comentarios en código: español

### Styling Guidelines
- **NO usar emojis de armas** (🔫🎯🦆) - Mantener imagen profesional
- Usar emojis neutros: 📋📄✅⚠️📌 para indicadores
- Preferir texto o iconos SVG sobre emojis temáticos
- Logo oficial: /public/assets/logo-club-738.jpg

### Nombre Oficial del Club
- **SIEMPRE usar**: "Club de Caza, Tiro y Pesca de Yucatán, A.C."
- **NUNCA usar**: "Club 738" en comunicados oficiales a socios o externos
- **Nota**: "738" es el número de registro ante SEDENA, NO forma parte del nombre oficial
- **Contexto de uso**:
  - ✅ Comunicados a socios (emails, oficios, credenciales)
  - ✅ Documentos oficiales (PETAs, constancias)
  - ✅ Comunicación externa (autoridades, otras organizaciones)
  - ✅ Footer de emails y documentos
  - ❌ NO usar en código (variables, archivos, componentes)
  - ❌ NO usar en URLs o paths internos

## Development Workflow

### Commands
```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Deploy a Firebase
firebase deploy --only hosting

# Deploy completo (hosting + rules)
firebase deploy

# Convertir Markdown a PDF (usa npx md-to-pdf)
npx md-to-pdf ruta/al/archivo.md
npx md-to-pdf archivo.md --pdf-options '{"format":"A4","margin":"20mm"}'
```

### ⚠️ IMPORTANTE - URL de Producción
**NUNCA decir que se desplegó en `https://club-738-app.web.app`**

La URL de PRODUCCIÓN oficial es:
```
https://yucatanctp.org
```

Esta URL es un dominio custom configurado en Firebase Hosting. Cuando hagas deploy, SIEMPRE menciona:
- ✅ "Deploy completado en https://yucatanctp.org"
- ❌ "Deploy completado en https://club-738-app.web.app" (NO correcto)

Ambas URLs apuntan al mismo sitio, pero la oficial es `yucatanctp.org`.

### Markdown to PDF
**Herramienta:** `md-to-pdf` via npx (NO usar extensión VS Code Markdown PDF)

**Problema conocido:** La extensión Markdown PDF de VS Code falla con error "no active editor"

**Solución:** Usar `npx md-to-pdf` desde terminal (siempre funciona)

**Ejemplos:**
```bash
# Conversión básica
npx md-to-pdf docs/INSTRUCCIONES_GESTION_ARSENAL_GARDONI.md

# Con opciones personalizadas
npx md-to-pdf docs/MANUAL_SECRETARIO_BAJAS_ARSENAL.md --pdf-options '{"format":"A4","margin":"20mm","printBackground":true}'

# Múltiples archivos
npx md-to-pdf docs/*.md
```

**Nota:** Soporta emojis y tablas, genera PDFs de alta calidad

### Adding Features
1. Crear componente en src/components/ con .jsx y .css pareados
2. Importar Firebase desde firebaseConfig.js (nunca crear nuevas instancias)
3. Para rutas públicas: agregar detector en App.jsx
4. Para features autenticados: agregar en el dashboard

### dark-mode-premium.css # Estilos dark mode
├── components/
│   ├── LandingPage.jsx/css      # Página pública de inicio + enlaces SEDENA
│   ├── Login.jsx/css            # Formulario de login
│   ├── CalendarioTiradas.jsx/css # Calendario público
│   ├── CalculadoraPCP.jsx/css   # Calculadora pública
│   ├── MisArmas.jsx/css         # Armas del socio (editable por admin)
│   ├── MisDocumentosOficiales.jsx/css  # CURP y Constancia descargables
│   ├── WelcomeDialog.jsx/css    # Diálogo de bienvenida
│   ├── Notificaciones.jsx/css   # Sistema de notificaciones
│   ├── MiPerfil.jsx/css         # Perfil del socio
│   ├── ThemeToggle.jsx/css      # Toggle dark/light mode
│   ├── ManualUsuario.jsx/css    # Manual del usuario
│   │
│   │  # Módulo PETA (v1.10.0+)
│   ├── SolicitarPETA.jsx/css    # Socio/Admin solicita trámite PETA
│   ├── MisPETAs.jsx/css         # Socio ve estado de sus PETAs
│   ├── VerificadorPETA.jsx/css  # Admin verifica documentos
│   ├── ExpedienteImpresor.jsx/css  # Admin prepara impresión
│   ├── GeneradorPETA.jsx/css    # Generador de oficios PETA
│   │
│   │  # Módulo Cobranza (v1.10.0+)
│   ├── RegistroPagos.jsx/css    # Registrar pagos de socios
│   ├── ReporteCaja.jsx/css      # Corte de caja / reportes
│   ├── DashboardRenovaciones.jsx/css  # Panel cobranza 2026
│   ├── DashboardCumpleanos.jsx/css    # Demografía socios
│   ├── CobranzaUnificada.jsx/css # Panel unificado de cobranza
│   │
│   │  # Módulo Arsenal (v1.14.0+)
│   ├── GestionArsenal.jsx/css   # Gestión de arsenal del socio
│   ├── AdminBajasArsenal.jsx/css  # Admin gestiona bajas
│   ├── AdminAltasArsenal.jsx/css  # Admin gestiona altas
│   │
│   │  # Módulo Agenda (v1.14.0+)
│   ├── AgendarCita.jsx/css      # Socio agenda citas
│   ├── MiAgenda.jsx/css         # Admin gestiona agenda
│   │
│   ├── admin/           # Componentes admin
│   │   ├── AdminDashboard.jsx/css     # Panel principal admin
│   │   ├── ExpedienteAdminView.jsx/css # Vista de expediente
│   │   ├── ReportadorExpedientes.jsx/css # Reportes
│   │   ├── ArmaEditor.jsx/css         # Editor de armas
│   │   └── HistorialAuditoria.jsx/css # Historial de cambios
│   │
│   ├── documents/       # Componentes de documentos PETA
│   │   ├── DocumentList.jsx/css     # Mi Expediente Digital
│   │   ├── DocumentCard.jsx/css
│   │   ├── DocumentUploader.jsx/css
│   │   ├── ArmasRegistroUploader.jsx/css  # Subida de RFA
│   │   ├── ImageEditor.jsx/css    # Editor de imágenes
│   │   ├── MultiImageUploader.jsx/css  # Subida múltiple
│   │   └── ProgressBar.jsx/css    # Barra de progreso
│   │
│   ├── privacidad/      # Avisos de privacidad
│   │   ├── AvisoPrivacidad.jsx/css
│   │   └── ConsentimientoPriv.jsx/css
│   │
│   └── common/          # Componentes comunes
│
├── hooks/
│   ├── useRole.js       # Hook de detección de rol
│   └── useDarkMode.js   # Hook de dark mode
│
├── contexts/
│   └── ToastContext.js  # Context para notificaciones toast
│
├── data/
│   └── tiradasData.js   # Calendario de tiradas 2026
│es
│   │   ├── MultiImageUploader.jsx/css  # Subida múltiple
│   │   └── ProgressBar.jsx/css    # Barra de progreso
│   └── privacidad/      # Avisos de privacidad
│       ├── AvisoPrivacidad.jsx/css
│       └── ConsentimientoPriv.jsx/css
├── data/
│   └── tiradasData.js   # Calendario de tiradas 2026
└── utils/
    ├── curpParser.js    # Parser de CURP
    └── ocrValidation.js # Validación OCR
```

## Documentos Requeridos para PETA

### Lista de 16 Documentos

| # | Documento | Presentación | Estado |
|---|-----------|--------------|--------|
| 1 | **INE** | Copia ampliada 200%, ambas caras | Socio sube |
| 2 | **CURP** | Copia | ✅ En Storage |
| 3 | **Cartilla Militar / Acta Nacimiento** | Copia | Socio sube |
| 4 | **Comprobante de Domicilio** | Original | Socio sube |
| 5 | **Constancia Antecedentes Penales** | Original | ✅ En Storage |
| 6 | **Certificado Médico** | Original | Socio sube |
| 7 | **Certificado Psicológico** | Original | Socio sube |
| 8 | **Certificado Toxicológico** | Original | Socio sube |
| 9 | **Carta Modo Honesto de Vivir** | Original | Socio sube |
| 10 | **Licencia de Caza** | Copia | Solo modalidad caza |
| 11 | **Credencial del Club** | Copia | ⏳ Pendiente generar |
| 12 | **Solicitud PETA** | Original | Club provee |
| 13 | **Registros de Armas (RFA)** | Copia | Máx 10 por PETA |
| 14 | **Recibo Pago e5cinco** | Original | Socio sube |
| 15 | **Fotografía** | Física + Digital | Fondo blanco, infantil |
| 16 | **Permiso Anterior** | Original | Solo renovaciones |

### Flujo de Documentos
1. **Socio sube** → Firebase Storage documentos/{email}/{tipo}.pdf
2. **Sistema valida** → Tipo y tamaño (PDF/JPG/PNG, max 5MB)
3. **Secretario verifica** → Marca "verificado" en Firestore
4. **Originales físicos** → Se entregan en 32 Zona Militar (Valladolid)

## Requisitos para Socios Nuevos

### Documentación (16 puntos)
1. Solicitud en formato del club (se proporciona)
2. Compromiso Art. 80 Ley de Armas (se proporciona)
3. Acta de Nacimiento (2 copias)
4. Cartilla Militar liberada (2 copias)
5. Registro Federal de Armas - RFA (2 copias por arma)
6. Fotografías color infantil (4)
7. CURP (2 copias)
8. RFC (2 copias)
9. INE vigente (2 copias)
10. Comprobante de domicilio (2 copias)
11. Licencia de Caza SEMARNAT vigente (2 copias)
12. Constancia Modo Honesto de Vivir (original + copia) - Se proporciona formato
13. Constancia de Antecedentes Penales Federales (original + copia) - https://constancias.oadprs.gob.mx/
14. Certificado Médico (original + copia)
15. Certificado Toxicológico (original + copia)
16. Certificado Psicológico (original + copia)

### Cuotas 2026

| Concepto | Monto |
|----------|-------|
| Inscripción | $2,000.00 MXN |
| Cuota Anual | $6,000.00 MXN |
| FEMETI primer ingreso | $700.00 MXN |
| FEMETI socios | $350.00 MXN |

**Incluye**: 1 trámite PETA
**NO incluye**: Pago e5cinco, mensajería

## Data Sources

### Master Database (Fuente de Verdad - Actualizada 17 Ene 2026)

**Archivo Excel Maestro (ÚNICA FUENTE DE VERDAD):**
```
socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx
```

**IMPORTANTE**: Este Excel es la **única fuente de verdad consolidada** que combina:
- **Anexo A Oficial** (Diciembre 2025): 76 socios con metadata completa
- **Base Normalizada** (Diciembre 2025): 276 armas registradas
- **Actualizaciones Enero 2026**: 4 armas nuevas (Gardoni, Arechiga, Iván Cabo x2)
- **Correcciones de datos**: Agustín Moreno, Ariel Córdoba Wilson

**Cobertura total**:
- **76 socios** (100% de Anexo A oficial)
  - 66 socios con armas registradas (276 armas)
  - 10 socios sin armas (marcados con "0")
- **286 filas de datos** (276 armas + 10 socios sin armas)
- **19 columnas Firebase-ready**
- **76 emails únicos** (sin duplicados) ✅

**Estructura del Excel Maestro (19 columnas):**
| Columna | Campo | Descripción |
|---------|-------|-------------|
| 1 | No. REGISTRO | Número de registro SEDENA (738) |
| 2 | DOMICILIO CLUB | Dirección del club |
| 3 | **No. CREDENCIAL** | Número de credencial del socio (1-236) |
| 4 | NOMBRE SOCIO | Nombre completo en MAYÚSCULAS |
| 5 | **CURP** | Clave Única de Registro de Población |
| 6 | **TELEFONO** | Teléfono de contacto |
| 7 | **EMAIL** | Email de acceso al portal (identificador Firebase - CRÍTICO) |
| 8 | **FECHA ALTA** | Fecha de alta en el club |
| 9-13 | **Dirección estructurada** | CALLE, COLONIA, CIUDAD, ESTADO, CP (para auto-fill PETAs) |
| 14 | CLASE | Clase de arma (PISTOLA, ESCOPETA, RIFLE) o "0" si sin armas |
| 15 | CALIBRE | Calibre del arma |
| 16 | MARCA | Marca fabricante |
| 17 | MODELO | Modelo de arma |
| 18 | MATRÍCULA | Matrícula/Número de serie (normalizado) |
| 19 | FOLIO | Folio de registro SEDENA |

**Cambios y correcciones aplicados (17 Ene 2026):**
- Email corregido: Agustín Moreno → `agus_tin1_@hotmail.com` (era duplicado)
- Teléfono corregido: Agustín Moreno → `+52 999 278 0476` (era duplicado)
- Teléfono corregido: Ariel Córdoba Wilson → `+52 999 200 3314` (era duplicado)
- Incluidos 10 socios sin armas (antes no estaban en base de datos)
- Direcciones estructuradas agregadas (5 campos separados)
- Metadata Firebase agregada (credencial, teléfono, fecha_alta)
- Sincronización Excel-Firebase completada ✅

**Archivos históricos movidos a** `socios/referencia_historica/`:
```
2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx (66 socios solamente)
Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx (66 socios)
2026_ENERO_RELACION_SOCIOS_ARMAS_MASTER.xlsx (66 socios solamente)
credenciales_socios.csv (formato antiguo)
credenciales_socios.json (formato antiguo)
7 archivos backup automáticos
```

### Firebase Storage Structure
```
documentos/{email}/
├── curp.pdf
├── constancia.pdf
├── ine.pdf
├── comprobante-domicilio.pdf
├── certificado-medico.pdf
├── certificado-psicologico.pdf
├── certificado-toxicologico.pdf
├── modo-honesto.pdf
├── licencia-caza.pdf
├── foto.jpg
├── recibo-e5cinco.pdf
├── permiso-anterior.pdf
└── armas/
    └── {armaId}/
        └── registro.pdf
```

### Firestore Structure
```
socios/{email}
├── nombre: string
├── curp: string
├── fechaAlta: timestamp
├── totalArmas: number
├── bienvenidaVista: boolean
├── domicilio: {              # Agregado v1.9.0
│     calle: string
│     colonia: string
│     municipio: string
│     estado: string
│     cp: string
│   }
├── renovacion2026: {         # Agregado v1.10.0
│     estado: 'pagado' | 'pendiente'
│     monto: number
│     fecha: timestamp
│     metodo: string
│   }
├── membresia2026: {          # Agregado v1.11.0
│     fechaPago: timestamp
│     monto: number
│     metodoPago: string
│     registradoPor: string
│   }
├── documentosPETA: {
│     curp: { url, verificado, fechaSubida }
│     constanciaAntecedentes: { url, verificado, fechaSubida }
│     ine: { url, verificado, fechaSubida }
│     ...
│   }
├── armas/ (subcollection)
│   └── {armaId}
│       ├── clase: string
│       ├── calibre: string
│       ├── marca: string
│       ├── modelo: string
│       ├── matricula: string
│       ├── folio: string
│       ├── modalidad: 'caza' | 'tiro' | 'ambas'  # Agregado v1.10.1
│       └── documentoRegistro: string (URL)
└── petas/ (subcollection)    # Agregado v1.10.0
    └── {petaId}
        ├── tipo: 'caza' | 'tiro'
        ├── estado: 'borrador' | 'pendiente' | 'en_revision' | 'aprobado' | 'enviado_zm' | 'completado'
        ├── armasIncluidas: array<{armaId, clase, calibre, marca, matricula}>
        ├── estadosSeleccionados: array<string>
        ├── fechaSolicitud: timestamp
        ├── fechaVigenciaInicio: timestamp
        ├── fechaVigenciaFin: timestamp
        ├── esRenovacion: boolean
        ├── verificacionDigitales: object
        ├── verificacionFisicos: object
        ├── notasSecretario: string
        └── historial: array<{fecha, estado, usuario, nota}>
```

## Security

### Roles
| Rol | Email | Permisos | Notas |
|-----|-------|----------|-------|
| **Admin/Secretario** | admin@club738.com | Acceso total al panel admin | Usuario administrativo del portal |
| **Socio** | {email} | Solo sus propios datos | Todos los demás usuarios |

**IMPORTANTE**: 
- Usuario GitHub: `smunozsader` (SERGIO MUÑOZ SADER) - Solo para desarrollo
- Usuario webapp admin: `admin@club738.com` - Cuenta exclusiva del secretario
- El admin puede ver y gestionar datos de todos los socios

### Firestore Rules Summary
```javascript
// Funciones helper para roles
function isOwner(email) {
  return request.auth.token.email == email;
}

function isAdminOrSecretary() {
  return request.auth.token.email == 'admin@club738.com';
}

// Cada socio solo accede a sus datos, admin puede leer todos
match /socios/{email} {
  allow read: if isOwner(email) || isAdminOrSecretary();
  allow write: if isOwner(email);
}

// PETAs: Socio crea sus propias solicitudes, admin puede crear para cualquiera
match /socios/{email}/petas/{petaId} {
  allow read: if isOwner(email) || isAdminOrSecretary();
  allow create: if isOwner(email) || isAdminOrSecretary();
  allow update: if (isOwner(email) && resource.data.estado == 'documentacion_proceso') 
                || isAdminOrSecretary();
  allow delete: if isAdminOrSecretary();
}

// Armas: solo lectura para socios, escritura via Admin SDK
match /socios/{email}/armas/{armaId} {
  allow read: if isOwner(email) || isAdminOrSecretary();
  // Escritura solo via Admin SDK o scripts
}
```

### Storage Rules Summary
```javascript
// Documentos del socio
match /documentos/{email}/{document=**} {
  allow read, write: if isOwner(email);
  // Solo PDF, JPG, PNG
  // Máximo 5MB
}
```

### Datos Sensibles - NUNCA Commitear
```
scripts/serviceAccountKey.json
credenciales_socios.csv / .json
firebase_auth_import.json
Base datos/*.xlsx
curp_socios/*.pdf
```

### HTTP Security Headers (firebase.json)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Scripts de Administración

Los scripts en /scripts/ requieren serviceAccountKey.json (nunca commitear):

### Scripts de Importación
| Script | Propósito |
|--------|-----------|
| importar-usuarios-firebase.cjs | Crear usuarios en Firebase Auth |
| importar-armas-firestore.cjs | Poblar armas desde Excel |
| importar-fechas-alta.cjs | Importar fechas de alta de socios |
| importar-domicilios-firestore.cjs | Importar domicilios estructurados |
| actualizar-curps-firestore.cjs | Sincronizar CURPs |
| actualizar-modalidad-armas.cjs | Clasificar armas por modalidad (caza/tiro/ambas) |
| agregar-socios-faltantes.cjs | Agregar socios que faltan en Firestore |

### Scripts de Storage
| Script | Propósito |
|--------|-----------|
| subir-curps.cjs | Subir PDFs de CURP a Storage |
| subir-constancias-firebase.cjs | Subir constancias a Storage |
| subir-constancias-corregido.cjs | Versión corregida de subida |
| subir-fotos-credencial.cjs | Subir fotos infantiles para credenciales |
| check-storage.cjs | Verificar archivos en Storage |

### Scripts de Normalización (Excel)
| Script | Propósito |
|--------|-----------|
| normalizar-domicilios.cjs | Convertir saltos de línea a comas |
| normalizar-domicilios-paso2.cjs | Ajustes finos de formato |
| eliminar-filas-totales.cjs | Eliminar filas "TOTAL POR PERSONA" |
| domicilios-compartidos.cjs | Identificar familias con mismo domicilio |
| corregir-curps-excel.py | Corrección de CURPs en Excel |

### Scripts de Verificación
| Script | Propósito |
|--------|-----------|
| verificar-domicilios-firestore.cjs | Verificar domicilios en Firestore |
| comparar-emails.cjs | Comparar emails entre fuentes |
| buscar-vips.cjs | Búsqueda de socios VIP |
| buscar-ariel.cjs | Buscar socio específico |
| buscar-richfer.cjs | Buscar socio específico |
| agregar-richfer0304.cjs | Agregar socio faltante |
| arqueo-curps.py | Arqueo de CURPs (Python) |

### Scripts de Credenciales
| Script | Propósito |
|--------|-----------|
| crear_pdfs_credenciales.py | Generar PDFs de credenciales del club |

## Common Gotchas

1. **Firebase API keys en source**: Es normal para apps web públicas, las reglas de seguridad son lo que importa
2. **Auth state changes**: Pueden ocurrir en otra pestaña - onAuthStateChanged lo maneja
3.**v1.22.1** | 17 Ene 2026 | **ACTUAL** - Fix props userEmail en módulos sidebar (RegistroPagos, ReporteCaja, DashboardRenovaciones) |
| v1.22.0 | 17 Ene 2026 | Panel admin completo con sidebar unificado (15 herramientas en 5 categorías) |
| v1.21.0 | Ene 2026 | Admin puede solicitar PETAs para socios |
| v1.19.1 | 9 Ene 2026 | Preparación WAPI Sender - Formato Excel Oficial |
| v1.19.0 | 9 Ene 2026 | Campaña WhatsApp - Difusión Lanzamiento Portal |
| v1.18.0 | 9 Ene 2026 | Campaña de Emails y Corrección de Datos |
| v1.14.3 | 14 Ene 2026 | Avisos para documentos precargados + PDF oficial |
| v1.14.2 | 14 Ene 2026 | Fix permanente: Upload de PDFs de armas |
| v1.14.1 | 14 Ene 2026 | Fix crítico: Vinculación de PDFs de armas |
| v1.14.0 | 13 Ene 2026 | Separación Admin + Arsenal PDF + Notificaciones |
| v1.13.4 | 12 Ene 2026 | Mejora de formato PDF: bordes decorativos y tablas |
| v1.13.3 | 12 Ene 2026 | Ajustes de formato PDF PETA |
| v1.13.2 | 11 Ene 2026 | Revisión secretaria: armas fijas |
| v1.13.1 | 11 Ene 2026 | Límites legales de cartuchos (PETA) |
| v1.13.0 | 7 Ene 2026 | ExpedienteImpresor, fix VerificadorPETA progreso |
| v1.12.1 | 6 Ene 2026 | Enlaces SEDENA, redes sociales footer |
| v1.12.0 | 6 Ene 2026 | Rediseño UX Expediente Digital, foto credencial JPG |
| v1.11.0 | 6 Ene 2026 | ReporteCaja (corte de caja), sincronización pagos |
| v1.10.1 | 5 Ene 2026 | Modalidad armas, estados sugeridos FEMETI |
| v1.10.0 | 5 Ene 2026 | Módulo PETA completo (SolicitarPETA, MisPETAs, VerificadorPETA, RegistroPagos) |
| v1.9.1 | 5 Ene 2026 | Renombrado sitio, mensajes VIP, cuotas $6,000 |
| v1.9.0 | 5 Ene 2026 | Domicilios normalizados, UI unificada |
| v1.8.0 | 5 Ene 2026 | GeneradorPETA, headers/footers unificados |
| v1.7.0 | 4 Ene 2026 | Credenciales 2026 con Canva |
| v1.6.0 | 4 Ene 2026 | Portal público completo (landing, calendario, calculadora) |
| v1.3.0 | 3 Ene 2026 | OCR Validation + Centralización de Registros de Armas |
| v1.2.0 | 3 Ene 2026 | Uploader con opción PDF preparado |
| v1.1.1 | 3 Ene 2026 | Fix Storage Path + CORS |
| v1.1.0 | 3 Ene 2026 | Privacidad LFPDPPP |
| v1.0.0 | 3 Ene 2026 | Release inicial |
| v0.2.0 | 2 Ene 2026 | Expansión de documentos PETA |
| v0.1.0 | 1 Ene 2026 | Setup inicial y seguridad |

**Total de versiones**: 40+  
**Período de desarrollo**: 17 días (1-17 enero 2026)  
**Promedio**: 2.35 versiones por día
- Siluetas Metálicas (SM)

### Campo de Tiro
Google Maps: https://maps.app.goo.gl/AcpqoDN9wN8g8r1Q6

### Región Sureste
Estados: Yucatán, Campeche, Quintana Roo, Tabasco, Chiapas, Veracruz

## Autoridad de Trámite PETA

- **32 Zona Militar** - Valladolid, Yucatán
- Formato PETA: SEDENA-02-045 (caza) o 02-046 (tiro/competencia)
- Máximo: 10 armas por PETA

## Pending Features

- [x] Generación de credencial del club (PDF) - Script: `crear_pdfs_credenciales.py`, datos en `Credencial-Club-2026/`
- [x] Normalización de domicilios - 76 socios con domicilio estructurado en Firestore
- [x] GeneradorPETA lee domicilio de Firestore y pre-llena campos
- [x] Estado de pagos/cobranza por socio - RegistroPagos.jsx + ReporteCaja.jsx
- [x] Enlaces SEDENA e5cinco en landing page
- [x] Redes sociales en footer (Facebook, Instagram, Google Maps)
- [x] Panel administrativo completo con 15 herramientas organizadas en sidebar
- [x] Admin puede solicitar PETAs para socios que no auto-inician
- [x] Sistema de notificaciones y toasts
- [x] Dark mode / Light mode toggle
- [x] Gestión de arsenal (altas y bajas)
- [x] Sistema de citas y agenda
- [ ] Descarga de credencial desde portal del socio (integrar PDFs generados)
- [ ] Notificaciones de vencimiento de documentos
- [ ] Firma del presidente para credenciales
- [ ] Sistema de recordatorios automáticos (pagos, documentos)

## Panel Administrativo - Sidebar Unificado (v1.22.0+)

### Estructura del Sidebar

El panel administrativo (`AdminDashboard.jsx`) incluye 15 herramientas organizadas en 5 categorías:

**👥 GESTIÓN DE SOCIOS** (2 herramientas)
1. **Gestión de Socios** - Vista activa por defecto (tabla de todos los socios)
2. **Reportador Expedientes** - Reportes y análisis de expedientes

**🎯 MÓDULO PETA** (3 herramientas)
3. **Verificador PETA** - Checklist de verificación de documentos digitales y físicos
4. **Generador PETA** - Generar oficios PETA en PDF para descargar
5. **Expediente Impresor** - Preparar expedientes completos para impresión

**💰 MÓDULO COBRANZA** (5 herramientas)
6. **Panel Cobranza** - Vista unificada de cobranza (CobranzaUnificada)
7. **Registro de Pagos** - Registrar pagos de membresías individuales
8. **Reporte de Caja** - Corte de caja con filtros y exportación CSV
9. **Renovaciones 2026** - Dashboard de seguimiento de renovaciones
10. **Cumpleaños** - Demografía y cumpleaños de socios

**🔫 GESTIÓN DE ARSENAL** (2 herramientas)
11. **Bajas de Arsenal** - Administrar solicitudes de baja de armas
12. **Altas de Arsenal** - Administrar solicitudes de alta de armas

**📅 AGENDA & CITAS** (1 herramienta)
13. **Mi Agenda** - Gestión de citas y agenda del secretario

### Props Requeridas por Componentes Admin

**IMPORTANTE**: Varios componentes administrativos requieren la prop `userEmail` para funcionar:

| Componente | Props Requeridas | Propósito |
|------------|------------------|-----------|
| RegistroPagos | `userEmail`, `onBack` | Registrar quién hace el pago (auditoría) |
| ReporteCaja | `userEmail`, `onBack` | Filtros y reportes |
| DashboardRenovaciones | `userEmail` | Validar `esSecretario = userEmail === 'admin@club738.com'` |
| VerificadorPETA | `userEmail`, `onBack` | Auditoría de verificaciones |
| GeneradorPETA | `userEmail` | Firma digital en PDFs |
| ExpedienteImpresor | `userEmail`, `onBack` | Auditoría de impresiones |
| DashboardCumpleanos | `userEmail` | Permisos de visualización |
| CobranzaUnificada | `onBack` | Navegación |
| MiAgenda | `onBack` | Navegación |
| AdminBajasArsenal | ninguna | Componente autónomo |
| AdminAltasArsenal | ninguna | Componente autónomo |

**Patrón de implementación en App.jsx**:
```jsx
{activeSection === 'registro-pagos' && user.email === ADMIN_EMAIL && (
  <div className="section-registro-pagos">
    <button className="btn-back" onClick={() => setActiveSection('admin-dashboard')}>
      ← Volver a Panel Admin
    </button>
    <RegistroPagos userEmail={user.email} />
  </div>
)}
```

### Navegación Admin

- **Estado activo**: `activeSection === 'admin-dashboard'` muestra el panel principal
- **Botones "Volver"**: SIEMPRE deben usar `setActiveSection('admin-dashboard')`, NO `'dashboard'`
- **Acceso**: Solo usuarios con email `admin@club738.com`
- **Seguridad**: Verificar `user.email === ADMIN_EMAIL` en cada sección admin

## Version History

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| v1.13.0 | 7 Ene 2026 | ExpedienteImpresor, fix VerificadorPETA progreso |
| v1.12.1 | 6 Ene 2026 | Enlaces SEDENA, redes sociales footer |
| v1.12.0 | 6 Ene 2026 | Rediseño UX Expediente Digital, foto credencial JPG |
| v1.11.0 | 6 Ene 2026 | ReporteCaja (corte de caja), sincronización pagos |
| v1.10.1 | 5 Ene 2026 | Modalidad armas, estados sugeridos FEMETI |
| v1.10.0 | 5 Ene 2026 | Módulo PETA completo (SolicitarPETA, MisPETAs, VerificadorPETA, RegistroPagos) |
| v1.9.1 | 5 Ene 2026 | Renombrado sitio, mensajes VIP, cuotas $6,000 |
| v1.9.0 | 5 Ene 2026 | Domicilios normalizados, UI unificada |
| v1.8.0 | 5 Ene 2026 | GeneradorPETA, headers/footers unificados |
| v1.7.0 | 4 Ene 2026 | Credenciales 2026 con Canva |
| v1.6.x | Dic 2025 | Landing page, calendario, calculadora |

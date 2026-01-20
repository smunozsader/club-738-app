# Club 738 Web - AI Coding Agent Instructions

**Status**: v1.30.1 | Última actualización: 19 Ene 2026

## Quick Start for AI Agents

### Essential Commands
```bash
npm run dev        # Local dev (http://localhost:5173)
npm run build      # Production build
firebase deploy    # Deploy a Firebase (hosting + rules)
npx md-to-pdf file.md  # Convert markdown to PDF (use for docs)
```

### Critical Constraints to ALWAYS Follow
- **Email authentication**: `admin@club738.com` = ÚNICA cuenta admin
- **Firestore path normalization**: SIEMPRE usar `.toLowerCase()` para emails en paths
- **SEDENA limits (Art. 50 LFAFE)**: `.22`=500 cartuchos, ESCOPETA=1000, OTROS=200
- **Production URL**: `https://yucatanctp.org` (NUNCA `club-738-app.web.app`)
- **Spanish 100%**: UI, mensajes, comentarios en español
- **No weapon emojis**: ❌ 🔫🎯 → ✅ Usar emojis neutros (📋✅⚠️)
- **🚀 BUILD & DEPLOY**: AFTER EVERY CODE MODIFICATION, ask user: "Should I build and deploy to make changes live?" Then run `npm run build && firebase deploy`

### Core Architecture Patterns

**Firebase Integration** (`src/firebaseConfig.js`):
- Single source of auth/db/storage instances (NUNCA crear nuevas instancias)
- Analytics tracking: `trackEvent()`, `trackPageView()` en production

**Component Communication**:
- Props drilling: Componentes reciben `userEmail`, `onBack` callbacks explícitamente
- `AdminDashboard.jsx` centraliza navegación admin con `activeSection` state
- Real-time listeners SIEMPRE se desuscriben en `useEffect` cleanup

**Document Module** (PETA Workflow):
- 16 documentos requeridos: CURP + Constancia precargadas en Storage
- Socio sube: INE, Cartilla, Domicilio, Médico, Psicológico, Toxicológico, Modo Honesto, Licencia Caza, Foto, Recibo e5cinco, Permiso Anterior
- Secretario verifica → estado cambia → webhook notifica socio
- Límites legales validados en `src/utils/limitesCartuchos.js` y `src/utils/pagosE5cinco.js`

**Admin Panel Structure** (`AdminDashboard.jsx`):
- 15 herramientas en 5 categorías (Socios, PETA, Cobranza, Arsenal, Agenda)
- Cada módulo recibe `userEmail` prop para auditoría y permisos
- Botones "Volver" usan `setActiveSection('admin-dashboard')` (NUNCA 'dashboard')

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

**AL EMPEZAR**: `git pull`  
**AL TERMINAR**: Commit → Push (usa patrón: `tipo(scope): descripción`)

---

## Architecture Deep Dive

### Authentication & Authorization

**Role System**:
```javascript
// En App.jsx - única forma de detectar admin
const ADMIN_EMAIL = 'admin@club738.com';

// Firestore rules implementan permisos por email
// useRole.jsx → hook para detectar rol actual
// Token claims automáticos: request.auth.token.email
```

**Key Pattern - Email Normalization**:
```javascript
// CRÍTICO: Firestore paths usan email como ID, SIEMPRE normalizar
const socioRef = doc(db, 'socios', user.email.toLowerCase());
const armaRef = doc(db, 'socios', email.toLowerCase(), 'armas', armaId);

// En reglas Firestore: request.auth.token.email.lower() == email.lower()
```

### Data Flow & Real-time Listeners

**Patrón Standard**:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const docRef = doc(db, 'socios', userEmail.toLowerCase());
  
  // LISTENER: Escucha cambios en tiempo real
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setData(docSnap.data());
    }
    setLoading(false);
  }, (error) => {
    console.error('Error:', error);
    setLoading(false);
  });

  // CLEANUP: Desuscribir al desmontar
  return () => unsubscribe();
}, [userEmail]);
```

**Importante**: Toda lectura de Firestore usa `onSnapshot()` para listeners (NO `getDoc()` estático).

### File Storage Patterns

**Upload Pattern** (en DocumentUploader.jsx):
```javascript
const file = e.target.files[0];
const fileName = `${documentType}.pdf`; // ej: curp.pdf, ine.pdf
const filePath = `documentos/${userId}/${fileName}`;

const storageRef = ref(storage, filePath);
const uploadTask = uploadBytesResumable(storageRef, file);

uploadTask.on('state_changed', 
  (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
  (error) => { /* manejar error */ },
  async () => {
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    // Guardar URL en Firestore documentosPETA.{tipo}.url
  }
);
```

**Critical Paths**:
- Documentos PETA: `documentos/{email}/{tipo}.pdf` (ej: `curp.pdf`, `ine.pdf`)
- Armas: `documentos/{email}/armas/{armaId}/registro.pdf`
- Fotos: `documentos/{email}/foto.jpg`

### Datos Legales & Validación

**NUNCA** cambiar sin revisar `docs/`:

1. **Límites Cartuchos** (`src/utils/limitesCartuchos.js`):
   - `.22` (excepto Magnum/Hornet): 500 máx
   - ESCOPETA (12/16/20/28/.410): 1000 máx
   - OTROS CALIBRES: 200 máx
   - Períodos: Anual (protección de domicilio), Trimestral (caza cinegética), Mensual (tiro)

2. **Pagos e5cinco** (`src/utils/pagosE5cinco.js`):
   - Tabla oficial: 1-3 armas=$1,819 → 10 armas=$6,047
   - Clave referencia: `034001132` (fija)
   - Cadena dependencia: `00276660000000` (1-3 armas) o `00276670000000` (4+)

3. **Cuotas 2026**:
   - Inscripción: $2,000
   - Cuota Anual: $6,000
   - FEMETI: $700 (primer ingreso) o $350 (renovación)

### ⚠️ CRITICAL LESSON: Weapon Caliber Validation

**NUNCA ASUMAS calibres sin verificación física/OCR del PDF** - Error cometido 19 Ene 2026:

**El Problema:**
- AI registró CZ P-10 C como `.40 S&W` (ILEGAL para civiles en México)
- NO hice OCR del PDF antes de asumir un calibre
- Resultado: Dato incorrecto en Excel + Firestore

**La Ley (SEDENA Art. 50 LFAFE):**
- ✅ **Máximo legal para CIVILES: `.380" ACP`**
- ❌ Calibres > `.380" ACP` = PROHIBIDOS (Solo fuerzas armadas)
- Ejemplos permitidos: .22 LR, .380 ACP, 9mm (ALGUNOS modelos), 38 SPL
- Ejemplos prohibidos: .40 S&W, 10mm, .45 ACP, 357 MAG

**El Proceso Correcto:**
1. **SIEMPRE hacer OCR del PDF** - `pdfplumber` o similar
2. **Buscar en texto**: matrícula, folio, marca, modelo, calibre
3. **Validar calibre contra SEDENA Art. 50** antes de registrar
4. **SI NO ESTÁ 100% SEGURO**: Pedir confirmación al usuario

**Código de Validación Recomendado:**
```javascript
const CALIBRES_PERMITIDOS_CIVILES = [
  '.22 LR', '.22 Magnum', '.22 TCM',
  '.380" ACP', 
  '9mm' // Solo algunos modelos - validar
];

function validarCalibreSegun(calibre) {
  if (!CALIBRES_PERMITIDOS_CIVILES.includes(calibre)) {
    throw new Error(`❌ CALIBRE PROHIBIDO: ${calibre} (Art. 50 LFAFE)`);
  }
  return true;
}
```

**Lección del Error:**
- Asunciones ≠ Verificación (especialmente en datos legales)
- En el club 738, cada dato de arma **AFECTA compliance con SEDENA**
- Un calibre incorrecto = **solicitud PETA RECHAZADA** en 32 Zona Militar

---

## Component Organization & Patterns

### Component Pairing
**SIEMPRE**: Crear con `.jsx` + `.css` pareados
- ✅ `MisArmas.jsx` + `MisArmas.css`
- ✅ `MyComponent.jsx` + `MyComponent.css`
- ❌ NO importar CSS de otro componente

### Key Components & Props

**Admin Panel Routing** (`App.jsx`):
```javascript
// Pattern: activeSection = estado actual, setActiveSection = navegador
{activeSection === 'admin-dashboard' && (
  <AdminDashboard userEmail={user.email} />
)}

// Submódulos reciben navegación explícita
{activeSection === 'registro-pagos' && (
  <RegistroPagos userEmail={user.email} onBack={() => setActiveSection('admin-dashboard')} />
)}
```

**Props Críticas por Componente**:

| Componente | Props Requeridas | Por Qué |
|------------|------------------|--------|
| `RegistroPagos` | `userEmail`, `onBack` | Auditoría quién registró pago |
| `VerificadorPETA` | `userEmail`, `onBack` | Auditoría verificaciones |
| `GeneradorPETA` | `userEmail` | Firma en PDF + metadata |
| `ReporteCaja` | `userEmail`, `onBack` | Filtros por usuario |
| `AdminBajasArsenal` | ninguna | Autónomo (no requiere auditoría) |
| `AdminAltasArsenal` | ninguna | Autónomo |

### Toast Notifications System

**Usar en cualquier componente**:
```javascript
import { useToastContext } from '../contexts/ToastContext';

export default function MyComponent() {
  const { showToast } = useToastContext();

  const handleSuccess = () => {
    showToast('Cambios guardados ✓', 'success', 3000);
  };

  const handleError = () => {
    showToast('Error al guardar', 'error', 3000);
  };

  return (/* ... */);
}
```

**Tipos**: `'success'`, `'error'`, `'info'`, `'warning'`

### Dark Mode Integration

**Ya está implementado**:
- `useDarkMode()` hook → `isDarkMode`, `toggleDarkMode()`
- CSS vars en `App.css` (`:root` + `.dark-mode`)
- Variables por componente en CSS propios

**Patrón** (en ComponentName.css):
```css
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

---



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

### Naming Conventions

**Spanish ALWAYS**:
- ✅ `const estado = 'pendiente'`
- ✅ `const manejarGuardar = () => {}`
- ✅ Comments: `// Verificar si el socio es admin`
- ❌ NO mixtur español/inglés en variables

**Club Name Rules**:
- ✅ Comunicados, PDFs, oficios: **"Club de Caza, Tiro y Pesca de Yucatán, A.C."**
- ❌ NUNCA en código: "club-738", "Club 738"
- ℹ️ "738" = número SEDENA, NO nombre oficial

**Variables Sensibles**:
- Admin status: `user.email === 'admin@club738.com'`
- Path building: `doc(db, 'socios', email.toLowerCase())`

### Styling & Emoji Guidelines

**Component Styling**:
- CSS co-localized: `MyComponent.jsx` + `MyComponent.css` (mismo directorio)
- Variables CSS: Usa `var(--bg-primary)`, `var(--text-primary)`, etc.
- Responsive: Mobile-first, usar media queries

**NO Weapon Emojis**:
- ❌ Prohibido: 🔫 🎯 🦆
- ✅ Usa: 📋 ✅ ⚠️ 🎯 (emojis neutros/temáticos del club)

### Common Gotchas

1. **Email Paths**: Firestore document IDs usan email → SIEMPRE `.toLowerCase()`
2. **Real-time Listeners**: Desuscribir en cleanup `return () => unsubscribe()`
3. **Admin Navigation**: `setActiveSection('admin-dashboard')` NO `'dashboard'`
4. **Props Drilling**: Admin components necesitan `userEmail` para auditoría
5. **PDF Generation**: jsPDF + custom headers/footers (ver `GeneradorPETA.jsx`)
6. **File Paths**: Siempre bajo `documentos/{email}/` (normalizado)

---

## Development Workflow

### Commands
```bash
npm run dev           # Local dev (http://localhost:5173)
npm run build         # Build for production
firebase deploy       # Deploy to Firebase
npx md-to-pdf file.md # Convert Markdown to PDF
```

### ⚠️ Production URL
- **SIEMPRE**: `https://yucatanctp.org` (official custom domain)
- **NUNCA**: `https://club-738-app.web.app` (Firebase default - don't mention)

### Journaling After Changes

**After significant changes (3+ files modified, new features, bug fixes)**:
1. Document in `docs/DEVELOPMENT_JOURNAL.md` (fecha, versión, qué cambió)
2. Commit: `tipo(scope): description` (feat, fix, docs, refactor, chore)
3. Push to GitHub for multi-machine sync

### Markdown to PDF
Use `npx md-to-pdf` (NOT VS Code extension - it has bugs):
```bash
npx md-to-pdf docs/ARCHIVO.md
npx md-to-pdf docs/ARCHIVO.md --pdf-options '{"format":"A4","margin":"20mm"}'
```

---

## PETA Workflow (Official Weapon Authorization Package)

### What is PETA?
- **Official form + 16-document package** submitted physically to 32 Zona Militar (Valladolid, Yucatán)
- Form types: SEDENA-02-045 (hunting) or 02-046 (sport shooting/competition)
- Maximum 10 weapons per submission
- **GeneradorPETA** is the key tool that auto-populates the form from Firebase weapon data

### The 16 Required Documents (Physical Hand-In Package)

| Document | Source | Format |
|----------|--------|--------|
| INE | Socio uploads | Both sides, 200% enlarged |
| CURP | Pre-loaded in Storage | Admin uploads |
| Cartilla Militar | Socio uploads | |
| Comprobante Domicilio | Socio uploads | |
| Constancia Antecedentes | Pre-loaded in Storage | Federal record |
| Certificado Médico | Socio uploads | |
| Certificado Psicológico | Socio uploads | |
| Certificado Toxicológico | Socio uploads | |
| Modo Honesto de Vivir | Socio uploads | Club template |
| Licencia de Caza | Socio uploads | If modalidad=caza |
| RFA (Weapon Registrations) | Socio uploads | Max 10 per PETA |
| Pago e5cinco Receipt | Socio uploads | SEDENA payment proof |
| Photo | Socio uploads | Passport style, white background |
| Permiso Anterior | Socio uploads | Renewals only |
| **PETA Form** | **GeneradorPETA** | **Auto-populated from Firebase** |

### Workflow: From Firebase → Official Package

```
Socio uploads 14 docs + weapon data in Firestore
    ↓
Secretary verifies docs in VerificadorPETA
    ↓
GeneradorPETA reads weapon data from Firestore & creates official PDF form
    ↓
Secretary uses ExpedienteImpresor to compile full 16-doc package
    ↓
Secretary hands physical package to 32 Zona Militar (Valladolid)
```

### GeneradorPETA - The Key Automation Tool
- **Purpose**: Auto-populate official form with weapon data from Firestore
- **Inputs**: `socios/{email}/armas/{armaId}` documents
- **Outputs**: PDF with all weapon specs, calibers, folios pre-filled
- **Status**: ~90% complete (needs minor UI/format refinements)
- **Key file**: `src/components/GeneradorPETA.jsx`

### Document Collection Module

**SolicitarPETA.jsx**:
- Socio (or Admin on behalf) initiates PETA request
- Selects 1-10 weapons to include
- Chooses target states

**DocumentList.jsx + DocumentUploader.jsx**:
- Socio uploads 14 required documents
- System validates file types (PDF/JPG/PNG, max 5MB)
- Documents stored: `documentos/{email}/{docType}.pdf`

**VerificadorPETA.jsx**:
- Secretary verifies each document (checklist)
- Marks as verified in Firestore
- Checks ammunition limits & payment validation

### Critical Business Rules

**Ammunition Limits** (Art. 50 LFAFE - used in form):
- `.22` caliber: max 500 rounds (except Magnum/Hornet/TCM)
- Shotgun: max 1000 rounds
- Other calibers: max 200 rounds
- Validation: `src/utils/limitesCartuchos.js`

**SEDENA Payments (e5cinco system)**:
- 1-3 weapons: $1,819.00 (cadena: `00276660000000`)
- 4-10 weapons: $2,423-$6,047 (cadena: `00276670000000`)
- Reference key: `034001132` (fixed)
- Validation: `src/utils/pagosE5cinco.js`

---

## Data Integrity: "LA FUENTE DE VERDAD" (Source of Truth)

### Why This Matters
- **SEDENA Compliance**: Bimonthly weapon inventory reports to 32 Zona Militar (Feb, Apr, Jun, Aug, Oct, Dec)
- **Club Control**: Track ownership changes, new purchases, transfers, sales outside club
- **Member Management**: Know exactly who owns what and who joined when

### What Must Be Accurate Daily

**Firestore Collection**: `socios/{email}/armas/{armaId}`
```
clase: string        # PISTOLA, ESCOPETA, RIFLE
calibre: string      # .22, 9mm, 12ga, etc.
marca: string        # Manufacturer
modelo: string       # Model name
matricula: string    # Serial number (normalized)
folio: string        # SEDENA registration number
modalidad: string    # 'caza' | 'tiro' | 'ambas'
documentoRegistro: string  # URL to RFA (Registro Federal de Armas)
```

### Bimonthly SEDENA Reporting Workflow

| Date | Report Deadline | Covers |
|------|-----------------|--------|
| Feb 28 | End of February | Jan-Feb changes (new guns, transfers, sales, new members) |
| Apr 30 | End of April | Mar-Apr changes |
| Jun 30 | End of June | May-Jun changes |
| Aug 31 | End of August | Jul-Aug changes |
| Oct 31 | End of October | Sep-Oct changes |
| Dec 31 | End of December | Nov-Dec changes |

### Data Changes That Must Be Tracked
1. **New weapon registrations** - Club member purchases
2. **Weapon transfers** - Private sales between socios
3. **Weapons sold outside club** - Member disposals
4. **New member additions** - Fresh joins
5. **Member removals** - Departures (bajas)

### Key Tools for Arsenal Management
- **MisArmas.jsx** - Socio views their weapons
- **AdminAltasArsenal.jsx** - Secretary processes new weapon registrations
- **AdminBajasArsenal.jsx** - Secretary processes weapon deregistrations
- **ReportadorExpedientes.jsx** - Generate reports for SEDENA

### Critical: Master Data Files
- **Excel Master** (`socios/FUENTE_DE_VERDAD_CLUB_738_*.xlsx`): 
  - Single source of truth for all weapons & members
  - 76 socios, 276+ weapons
  - Updated bimonthly before SEDENA reports
  - Schema: credencial, nombre, email, curp, teléfono, arma details (clase, calibre, marca, modelo, matrícula, folio)

---

## Financial Operations: Membership Renewals & Dues

### The Renewal Cycle: "Renovación de Membresías"

**Current Drive** (Jan-Feb 2026):
- **Goal**: 80% renewal rate by end of February
- **Status**: Tracking daily payments and member communications

### Payment Structure

**New Members** (`membresia2026.estado = 'nueva'`):
1. **Inscripción**: $2,000 MXN (one-time)
2. **Anualidad**: $6,000 MXN (yearly membership dues)
3. **FEMETI**: $700 MXN (Federación Mexicana de Tiro y Caza - first time only)
- **Total**: $8,700 for new members

**Renewing Members** (`membresia2026.estado = 'renovacion'`):
1. **Anualidad**: $6,000 MXN (yearly dues)
2. **FEMETI**: $350 MXN (renewal fee)
- **Total**: $6,350 for renewals

### Critical Financial Tracking

**Firestore Collection**: `socios/{email}/membresia2026`
```
estado: string            # 'pagado' | 'pendiente' | 'parcial'
monto: number             # Total owed based on new/renewal status
fechaPago: timestamp      # When paid
metodoPago: string        # 'efectivo' | 'transferencia' | 'cheque'
registradoPor: string     # Admin email (who recorded payment)
detallesPago: {
  inscripcion: { monto, pagado, fecha },
  anualidad: { monto, pagado, fecha },
  femeti: { monto, pagado, fecha }
}
```

### Key Financial Tools
- **RegistroPagos.jsx** - Secretary records individual payments
- **ReporteCaja.jsx** - Daily cash cutoff & reporting (CSV export)
- **DashboardRenovaciones.jsx** - Track renewal completion rate
- **CobranzaUnificada.jsx** - Unified billing view across all socios
- **DashboardCumpleanos.jsx** - Member demographics & renewal status

### Reports the Director Needs (Monthly)

| Report | Purpose | Tools |
|--------|---------|-------|
| **Renovación Status** | % of members who paid by deadline | DashboardRenovaciones |
| **Cash Position** | Daily/weekly revenue, payment methods | ReporteCaja (CSV) |
| **Delinquent Members** | Who owes what | CobranzaUnificada |
| **Payment Breakdown** | Inscripción vs Anualidad vs FEMETI | RegistroPagos ledger |
| **Growth** | New members joined this period | DashboardCumpleanos |

### Critical Success Metrics
- **% Renewals by Feb 28**: Target 80%
- **Days overdue tracking**: Alert when member 15+ days late
- **Collection rate**: Cash in vs committed dues

### Components & Their Roles

| Component | Purpose | Key Input |
|-----------|---------|-----------|
| `SolicitarPETA.jsx` | Initiate PETA request, select weapons | Socio/Admin selects from `socios/{email}/armas/` |
| `MisPETAs.jsx` | Track status of requests | Displays `socios/{email}/petas/` documents |
| `DocumentList.jsx` | Upload the 14 supporting docs | File uploads to Storage + Firestore metadata |
| `VerificadorPETA.jsx` | Secretary verification checklist | Mark docs as verified in Firestore |
| **`GeneradorPETA.jsx`** | **Generate official PDF form** | **Reads weapon data from Firestore, auto-populates form** |
| `ExpedienteImpresor.jsx` | Prepare complete 16-doc package for printing | Bundle all docs + form for hand-in |

---

## Firestore Data Schema

### Key Collections

**socios/{email}**
```
nombre, curp, telefono, fechaAlta, domicilio {...},
renovacion2026 {...}, membresia2026 {...}, documentosPETA {...}
```

**socios/{email}/armas/{armaId}**
```
clase, calibre, marca, modelo, matricula, folio, modalidad
```

**socios/{email}/petas/{petaId}**
```
tipo, estado, armasIncluidas[], estadosSeleccionados[],
fechaSolicitud, fechaVigencia, verificacionDigitales, verificacionFisicos
```

### Storage Structure
```
documentos/{email}/
  ├── curp.pdf (pre-uploaded by admin)
  ├── constancia.pdf (pre-uploaded by admin)
  ├── ine.pdf (socio uploads)
  ├── foto.jpg (socio uploads)
  ├── armas/{armaId}/registro.pdf
  └── ... (otros documentos PETA)
```

---

## Adding New Features

1. **Create component** with `.jsx` + `.css` paired in `src/components/`
2. **Import Firebase** from `src/firebaseConfig.js` (NEVER create new instances)
3. **For public routes**: Add detector in `App.jsx` (isCalculadoraRoute, isCalendarioRoute)
4. **For authenticated routes**: Add state case in `activeSection` switch
5. **For admin tools**: Ensure component receives `userEmail` prop + `onBack` callback
6. **Add journaling** if modifying 3+ files

### Project Structure

```
src/
├── App.jsx                    # Main router (public/auth routes, activeSection state)
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.jsx # Main admin panel (15 tools in 5 categories)
│   │   ├── ExpedienteAdminView.jsx
│   │   └── ReportadorExpedientes.jsx
│   ├── documents/
│   │   ├── DocumentList.jsx   # Mi Expediente Digital (socio's documents)
│   │   ├── DocumentUploader.jsx
│   │   └── ArmasRegistroUploader.jsx
│   ├── admin-tools/           # PETA, Billing, Arsenal, Schedule modules
│   │   ├── SolicitarPETA.jsx, VerificadorPETA.jsx, GeneradorPETA.jsx
│   │   ├── RegistroPagos.jsx, ReporteCaja.jsx
│   │   └── AdminBajasArsenal.jsx, AdminAltasArsenal.jsx
│   ├── LandingPage.jsx        # Public landing page
│   ├── CalendarioTiradas.jsx  # Public events calendar
│   ├── CalculadoraPCP.jsx     # Public PCP energy calculator
│   └── ThemeToggle.jsx        # Dark mode toggle
├── hooks/
│   ├── useRole.jsx            # Detect admin vs socio
│   ├── useDarkMode.js         # Dark mode with localStorage
│   ├── useToast.js            # Toast notifications
│   └── useAnalytics.js
├── contexts/
│   └── ToastContext.jsx       # Toast provider
├── utils/
│   ├── limitesCartuchos.js    # Legal ammo limits (Art. 50 LFAFE)
│   ├── pagosE5cinco.js        # SEDENA payment validation
│   ├── curpParser.js          # CURP parsing
│   └── documentValidation.js
├── data/
│   └── tiradasData.js         # 2026 competition calendar
└── firebaseConfig.js          # Firebase initialization (auth, db, storage)
```

## Required Documents for PETA (16-Document Hand-In Package)

These 16 documents + the auto-generated PETA form are compiled together and **physically handed to 32 Zona Militar** in Valladolid. The DocumentList and DocumentUploader modules collect these from socios.

| Document | Who Uploads | Storage Path |
|----------|-------------|--------------|
| INE | Socio | `documentos/{email}/ine.pdf` |
| CURP | Admin (pre-loaded) | `documentos/{email}/curp.pdf` |
| Cartilla Militar | Socio | `documentos/{email}/cartilla.pdf` |
| Comprobante Domicilio | Socio | `documentos/{email}/comprobante-domicilio.pdf` |
| Constancia Antecedentes | Admin (pre-loaded) | `documentos/{email}/constancia.pdf` |
| Certificado Médico | Socio | `documentos/{email}/certificado-medico.pdf` |
| Certificado Psicológico | Socio | `documentos/{email}/certificado-psicologico.pdf` |
| Certificado Toxicológico | Socio | `documentos/{email}/certificado-toxicologico.pdf` |
| Modo Honesto de Vivir | Socio | `documentos/{email}/modo-honesto.pdf` |
| Licencia de Caza | Socio (if applicable) | `documentos/{email}/licencia-caza.pdf` |
| RFA (Weapon Registrations) | Socio | `documentos/{email}/armas/{armaId}/registro.pdf` |
| Pago e5cinco Receipt | Socio | `documentos/{email}/recibo-e5cinco.pdf` |
| Photo | Socio | `documentos/{email}/foto.jpg` |
| Permiso Anterior | Socio (renewals) | `documentos/{email}/permiso-anterior.pdf` |
| **PETA Form** | **GeneradorPETA (auto)** | **Generated from Firestore weapon data** |

**File Validation**:
- Types: PDF, JPG, PNG only
- Max size: 5MB per document
- Storage rules: Socio can read/write own documents, Admin can read all

---

## Security & Roles

| Role | Email | Permissions |
|------|-------|-----------|
| **Admin/Secretary** | admin@club738.com | Full access to admin panel |
| **Socio (Member)** | {email} | Only own data |

**Firestore Rules Pattern**:
```javascript
function isOwner(email) {
  return request.auth.token.email.lower() == email.lower();
}

function isAdminOrSecretary() {
  return request.auth.token.email == 'admin@club738.com';
}

// Cada socio solo accede a sus datos, admin puede leer todos
match /socios/{email} {
  allow read: if isOwner(email) || isAdminOrSecretary();
  allow write: if isOwner(email);
}
```

**Storage Structure**: `documentos/{email}/{document}.pdf`
- Socio can read/write: own documents
- Admin can read: all documents

**NEVER COMMIT**:
```
scripts/serviceAccountKey.json
credenciales_socios.csv/json
firebase_auth_import.json
Base datos/*.xlsx
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email path errors | Use `.toLowerCase()` ALWAYS on email document IDs |
| Listeners not updating | Check for duplicate `onSnapshot()` or missing cleanup |
| Admin can't see data | Verify Firestore rule allows `isAdminOrSecretary()` |
| PDF generation fails | Check `jsPDF` version and custom fonts in `GeneradorPETA.jsx` |
| Dark mode not persisting | Verify `useDarkMode()` hook and localStorage key `'theme'` |
| Upload fails silently | Check Firebase Storage rules and document size (<5MB) |---

## Admin Panel Structure

The admin dashboard (`AdminDashboard.jsx`) includes 15 tools organized in 5 categories:

**👥 Member Management** (2 tools)
1. **Gestión de Socios** - Default view (all members table)
2. **Reportador Expedientes** - Reports and analysis

**🎯 PETA Module** (3 tools)
3. **Verificador PETA** - Document verification checklist
4. **Generador PETA** - Generate official PDF forms
5. **Expediente Impresor** - Prepare for printing

**💰 Billing Module** (5 tools)
6. **Panel Cobranza** - Unified billing view
7. **Registro de Pagos** - Record member payments
8. **Reporte de Caja** - Cash cutoff reports (CSV export)
9. **Renovaciones 2026** - Renewal tracking
10. **Cumpleaños** - Member demographics

**🔫 Arsenal Management** (2 tools)
11. **Bajas de Arsenal** - Weapon deregistration requests
12. **Altas de Arsenal** - Weapon registration requests

**📅 Schedule** (1 tool)
13. **Mi Agenda** - Appointment management

**Key Rule**: Admin nav buttons ALWAYS use `setActiveSection('admin-dashboard')`, never `'dashboard'`.

---

## Version History
| Version | Date | Changes |
|---------|------|---------|
| v1.30.1 | 19 Jan 2026 | CSS fix + database cleanup |
| v1.30.0 | 18 Jan 2026 | CRITICAL: e5cinco payment validation + legal ammo limits |
| v1.22.1 | 17 Jan 2026 | Fix userEmail props in sidebar modules |
| v1.22.0 | 17 Jan 2026 | Complete admin panel with unified sidebar |

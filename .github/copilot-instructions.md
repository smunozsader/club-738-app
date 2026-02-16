# Club 738 Web - AI Coding Agent Instructions

**Status**: v1.36.1 | Updated: Jan 29, 2026  
**Framework**: React 18.x + Vite 5.x + Firebase (Firestore, Auth, Storage, Functions, Hosting)

---

## 🚀 Quick Start (5 min)

### Essential Commands
```bash
npm run dev                           # Local dev → http://localhost:5173
npm run build                         # Production bundle (optimized chunks in dist/)
firebase deploy                       # Deploy hosting + firestore.rules + storage.rules
cd functions && npm run deploy        # Deploy Cloud Functions separately
firebase functions:log                # View Cloud Function logs
```

### Critical Constraints - ALWAYS
1. **Admin Email**: `admin@club738.com` (hardcoded, not configurable)
2. **Email Paths**: Use `.toLowerCase()` in ALL Firestore doc IDs (e.g., `socios/{email.toLowerCase()}`)
3. **Production URL**: `https://yucatanctp.org` (Firebase hosting auto-redirects from `club-738-app.web.app`)
4. **Spanish Only**: ALL UI text, messages, code comments, validation errors in Spanish
5. **Legal Limits** (SEDENA Art. 50): .22 LR=500 rounds, Shotgun=1,000, Others=200 max
6. **After Code Changes**: Ask user "Should I build and deploy?" → `npm run build && firebase deploy`

### AI Agent Operating Model - UX/UI & QA First
**Every AI agent task MUST include UX/UI and accessibility review as core deliverable, not optional.** These are non-negotiable requirements:

1. **UX/UI Specialist Mode**: Function as top-tier UX/UI and visual programmer
2. **QA-First Approach**: Full stack testing (backend + frontend) required before completion
3. **Accessibility Compliance**: WCAG 2.1 AA standards for all changes
4. **Visual Quality Assurance**: 
   - Test in both light AND dark modes (contrast must be readable in both)
   - Verify responsive layout (320px, 768px, 1440px)
   - Ensure visual hierarchy and typography consistency
   - Validate spacing, padding, and whitespace
5. **Functional QA**: 
   - No console errors or warnings
   - All interactive elements keyboard-accessible
   - Forms validate with clear error messages in Spanish
   - Real-time data updates visible
6. **Blocker Criteria**: 
   - ❌ Poor contrast in light or dark mode = FAIL (must fix)
   - ❌ Broken responsive layout = FAIL (must fix)
   - ❌ Inaccessible keyboard navigation = FAIL (must fix)
   - ❌ Hardcoded colors (should use CSS vars) = FAIL (must fix)

---

## 🏗️ Architecture at a Glance

### Tech Stack
- **Frontend**: React 18.2.x + Vite 5.x with code splitting (react-vendor, firebase-vendor, xlsx-vendor, pdf-vendor chunks)
- **Backend**: Firebase (Auth, Firestore, Cloud Storage, Cloud Functions v2, Hosting)
- **Key Libs**: jsPDF (PDF generation), tesseract.js (OCR for RFAs), xlsx (Excel), pdfjs-dist (PDF processing), googleapis (Google Calendar)
- **CSS**: Co-located modules + CSS variables (dark mode)
- **Analytics**: Firebase Analytics (production only)

### Core Services (Centralized in `src/firebaseConfig.js`)
```javascript
export { auth, db, storage, analytics, trackEvent, trackPageView }
// NEVER create new Firebase instances - use these exports everywhere
```

### Data Model: Three Pillars
1. **Socios** (`socios/{email}`) - Member base documents with SEDENA enrollment
2. **Armas** (`socios/{email}/armas/{armaId}`) - Weapon subcollection (RFA references, calibre, modalidad)
3. **PETAs** (`socios/{email}/petas/{petaId}`) - Authorization requests (1-10 weapons max, SEDENA forms)

### Integration Points
- **Google Calendar**: Cloud Functions (v2) sync citas → smunozam@gmail.com calendar with auto-invites
- **Cloud Functions**: Node 22, max 10 instances, 3 main functions: `onPetaCreated`, `crearEventoCalendar`, `actualizarEventoCalendar`
- **Cloud Storage**: Files >5MB rejected, paths normalized with lowercase emails, RFA PDFs OCR-validated for calibre

### Design System - CSS Variables (Non-Negotiable)
**All visual styling MUST use pre-defined CSS variables from:**
- `src/color-theory-wcag.css` - Color palette with WCAG AA compliance
- `src/dark-mode-premium.css` - Dark mode overrides

**Never hardcode colors—use these variable patterns:**
```css
/* Text & Background */
--text-primary       /* Dark text in light, light text in dark */
--text-secondary     /* Lighter/dimmer text */
--text-muted         /* Very light/dim text */
--bg-primary         /* Main background */
--bg-secondary       /* Secondary background (cards, etc.) */
--bg-tertiary        /* Tertiary background */

/* Interactive Elements */
--border-color       /* Borders visible in both modes */
--focus-ring         /* Focus outline (min 3px) */
--shadow-sm, --shadow-md, --shadow-lg

/* Status Colors */
--success            /* Green for success */
--error              /* Red for errors */
--warning            /* Amber for warnings */
--info               /* Blue for info */
```

**Testing CSS Variables:**
1. Open DevTools → Elements → computed styles
2. Toggle dark mode (Theme button or DevTools preference)
3. Verify all variables update
4. Check contrast: each var pair must meet 4.5:1 in both modes

---

## 🎯 Component & Hook Patterns

### Component Pairing (CRITICAL!)
**ALWAYS create paired files**:
- ✅ `MyComponent.jsx` + `MyComponent.css` (same directory, never cross-imported)
- ❌ NO shared CSS imports between components

### Core Hooks
| Hook | Purpose | Path |
|------|---------|------|
| `useRole()` | Detect admin vs socio (reads `usuarios/{email}.role`) | `src/hooks/useRole.jsx` |
| `useDarkMode()` | Dark mode toggle + localStorage persistence | `src/hooks/useDarkMode.js` |
| `useToast()` | Toast notifications with auto-dismiss | `src/hooks/useToast.js` |
| `useToastContext()` | Access toast provider (in ToastProvider wrapper) | Via `src/contexts/ToastContext.jsx` |

### Admin Navigation Pattern (Non-Negotiable)
In `App.jsx`, use `activeSection` state for routing (NOT browser history):
```javascript
{activeSection === 'admin-dashboard' && <AdminDashboard {...props} />}
{activeSection === 'registro-pagos' && (
  <RegistroPagos userEmail={user.email} onBack={() => setActiveSection('admin-dashboard')} />
)}
```
**Rule**: Admin sub-components MUST accept `onBack` callback prop, NEVER use `setActiveSection` internally

### Real-time Data (Firestore Pattern)
```javascript
useEffect(() => {
  const docRef = doc(db, 'socios', userEmail.toLowerCase());
  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists()) setData(snap.data());
  });
  return () => unsubscribe(); // CRITICAL: cleanup prevents memory leaks
}, [userEmail]);
```

### Toast Notifications Pattern
```javascript
import { useToastContext } from '../contexts/ToastContext';
const { showToast } = useToastContext();
showToast('Guardado ✓', 'success', 3000);
// Types: 'success' | 'error' | 'info' | 'warning'
```

### Dark Mode CSS Variables
Use system CSS variables (pre-defined in `color-theory-wcag.css` and `dark-mode-premium.css`):
```css
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
```
Activates via `useDarkMode()` hook → `document.documentElement.classList.toggle('dark-mode')`

---

## 🎨 UX/UI & Accessibility Standards (CRITICAL)

### Core UX/UI Principles - ALWAYS APPLY
**Every commit must improve or maintain visual appeal, accessibility, and usability.** Poor design is a blocker.

#### Visual Hierarchy & Legibility
- **Font sizes**: h1=2.2rem, h2=1.8rem, h3=1.4rem, body=1rem, small=0.875rem
- **Line height**: 1.5–1.8 for body text (improve readability)
- **Contrast**: Min WCAG AA (4.5:1 text, 3:1 UI elements) in both light AND dark modes
- **Dark Mode**: Test in both modes—CSS variables must ensure legibility at all times
  - Insufficient contrast = BLOCKER (no merge until fixed)

#### Layout & Spacing
- **Padding**: 25px component edges, 20px gaps between elements
- **Mobile-first**: Use CSS Grid/Flex for responsive layouts
- **Max-width**: 1200px for main content (prevent wall-of-text)
- **Whitespace**: Breathing room between sections (prevents visual clutter)

#### Component Design
- **Buttons**: Minimum 44px height (accessibility touch target)
- **Form fields**: Clear labels, visible focus states (ring or highlight)
- **Modals**: Close button (X), ESC key support, focus trap
- **Lists**: Proper indentation, visual separation between items

### Accessibility (WCAG 2.1 AA Compliance)
**Accessibility is NOT optional—it's a requirement.**

#### ARIA & Semantic HTML
```javascript
// ✅ DO: Use semantic HTML + ARIA
<button aria-label="Cerrar modal" onClick={onClose}>
  <span>✕</span>
</button>

// ❌ DON'T: Inaccessible clickable divs
<div onClick={onClose}>X</div>
```

#### Color Blindness & Contrast
- **Never rely on color alone** to convey information
  - ❌ "Click the blue button" → ✅ "Click 'Enviar' button"
- **Contrast testing**: Use WebAIM contrast checker for all text/backgrounds
- **Test modes**: Light mode, dark mode, high contrast mode

#### Keyboard Navigation
- All interactive elements must be keyboard-accessible
- Tab order follows visual flow (no `tabindex` > 0)
- Focus visible (via CSS `:focus-visible` or ring)
- ESC closes modals/menus

#### Images & Icons
- `alt` attributes describe purpose (not "image.jpg", but "Logo de Club 738")
- Icons with no accompanying text need `aria-label`
- No weapon emojis (accessibility/sensitivity)

#### Dark Mode Legibility (Specific Issue)
**CSS variables MUST ensure text readable in both modes:**
```css
.component {
  background: var(--bg-primary);      /* Light: #fff, Dark: #1a1a1a */
  color: var(--text-primary);         /* Light: #000, Dark: #f0f0f0 */
  border: 1px solid var(--border);    /* Light: #ddd, Dark: #444 */
}
```
Test contrast ratio for each variable pair at launch.

### QA & Full Stack Testing Checklist
**Before any PR, developers/AI agents MUST verify:**

#### Visual QA
- [ ] Page renders without layout breaks (responsive at 320px, 768px, 1440px)
- [ ] All text legible in light mode (contrast ≥ 4.5:1)
- [ ] All text legible in dark mode (same contrast requirement)
- [ ] Typography hierarchy is clear (headings, body, captions distinct)
- [ ] Spacing consistent (gaps, padding, margins follow 25px/20px system)
- [ ] Images load, no broken layouts
- [ ] No horizontal scroll on mobile

#### Accessibility QA
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, ESC)
- [ ] Form labels associated with inputs (`htmlFor` attribute)
- [ ] ARIA labels on buttons/icons without text
- [ ] Color not sole indicator (labels/icons support info)
- [ ] Focus visible and visible enough (use browser devtools to test)
- [ ] No weapon emojis or sensitive imagery

#### Functional QA
- [ ] All buttons clickable, no hung states
- [ ] Forms validate, show clear error messages in Spanish
- [ ] Real-time data updates visible (Firestore listeners work)
- [ ] Toasts appear, auto-dismiss correctly
- [ ] No console errors (check DevTools)
- [ ] Modals open/close smoothly

#### Dark Mode Specific QA
- [ ] Toggle works (click ThemeToggle button)
- [ ] All colors switch (use browser color-picker to verify CSS vars)
- [ ] Text readable in both modes (contrast test)
- [ ] Images visible in both modes (not too bright/dark)
- [ ] Borders visible in both modes

#### Performance & Bundle
- [ ] Load time < 3 seconds (Core Web Vitals)
- [ ] No console warnings (except expected Firebase logs)
- [ ] Bundle size within budget (check ANALYZE build)

### Design System & Visual Consistency
**Club 738 colors (from CSS variables):**
- **Light Mode**: White background (#fff), dark text (#000), blue accents (#007bff)
- **Dark Mode**: Near-black background (#1a1a1a), light text (#f0f0f0), adjusted accents
- **Status colors**: Success (green), Error (red), Warning (amber), Info (blue)

**All new components MUST:**
1. Use CSS variables (never hardcoded colors)
2. Have paired `.jsx` + `.css` files (no inline styles)
3. Test in both light and dark modes before commit

### Common UX Patterns (Reference)
| Pattern | File | Usage |
|---------|------|-------|
| Toast notifications | `src/hooks/useToast.js` | All user feedback (no `alert()`) |
| Modal with focus trap | `src/components/common/Modal.jsx` | Confirmations, forms |
| Dark mode toggle | `src/components/ThemeToggle.jsx` | Theme switching |
| Loading skeleton | `src/components/common/LoadingSkeleton.jsx` | Data fetching states |
| Error boundary | `src/components/common/ErrorBoundary.jsx` | Error handling |

### Accessibility Resources (Built-in Testing)
```bash
# Check bundle for unused CSS (reduces load time)
npm run build && npm run analyze

# Test locally in dark mode: Open DevTools → Rendering → Emulate CSS media
# Check contrast: https://webaim.org/resources/contrastchecker/
# Keyboard nav: Tab through entire page, verify logical order
```

---

## 🔐 Security & Auth

### Role Detection
```javascript
const ADMIN_EMAIL = 'admin@club738.com';
const isAdmin = user?.email === ADMIN_EMAIL; // ONLY way to check admin
```
Admin role determined by exact email match in `useRole()` hook (reads from `usuarios/{email}.role`)

### Firestore Rules (Email Normalization Critical)
- **Owner access**: `request.auth.token.email.lower() == docId.lower()`
- **Admin access**: `request.auth.token.email == 'admin@club738.com'`
- **Rule**: ALWAYS use `.lower()` in Firestore rules for email comparisons

### Storage Structure (Lower-cased Email Paths)
```
documentos/{email_lowercase}/
  ├── curp.pdf, constancia.pdf (admin pre-uploads)
  ├── ine.pdf, foto.jpg, cartilla.pdf (socio uploads)
  ├── peta_solicitudes/
  └── armas/{armaId}/registro.pdf (RFA documents)
```

---

## 📋 PETA Workflow (16-Document Package)

### What is PETA?
Official authorization package **physically submitted** to 32 Zona Militar (Valladolid):
- Form: SEDENA-02-045 (hunting) or 02-046 (sport shooting)
- Max 10 weapons per PETA
- **Auto-populated by GeneradorPETA.jsx from Firestore weapon data**

### The 16 Required Documents
| Doc | Uploaded By | Path | Type |
|-----|------------|------|------|
| CURP | Admin (pre) | `documentos/{email}/curp.pdf` | PDF |
| INE | Socio | `documentos/{email}/ine.pdf` | PDF |
| Cartilla, Domicilio, Médico, Psico, Toxico | Socio | `documentos/{email}/*.pdf` | PDF |
| Modo Honesto, Licencia Caza, Foto | Socio | `documentos/{email}/*` | PDF/JPG |
| RFA (Weapons) | Socio | `documentos/{email}/armas/{id}/*.pdf` | PDF |
| e5cinco Receipt | Socio | `documentos/{email}/recibo-e5cinco.pdf` | PDF |
| **PETA Form** | **Auto-generated** | **From Firestore** | **PDF** |

### Key Tools
- **SolicitarPETA.jsx**: Initiate PETA, select 1-10 weapons
- **DocumentList.jsx**: Upload 14 supporting docs
- **VerificadorPETA.jsx**: Secretary verification checklist
- **GeneradorPETA.jsx**: Auto-populate official PDF form from Firestore ← KEY TOOL
- **ExpedienteImpresor.jsx**: Bundle all 16 docs for hand-in

---

## 💰 Financial Operations (2026 Drive)

### Payment Structure
**New Members**: Inscripción ($2,000) + Anualidad ($6,500) + FEMETI ($700) = **$8,700**
**Renewals**: Anualidad ($6,500) + FEMETI ($350) = **$6,850**

### Socios Exentos 2026 (8 total)
| Nombre | Email | Motivo |
|--------|-------|--------|
| Sergio Muñoz de Alba Medrano | smunozam@gmail.com | Secretario del Club |
| Joaquín Rodolfo Gardoni Nuñez | jrgardoni@gmail.com | Tesorero del Club |
| Ma. Fernanda Guadalupe Arechiga Ramos | arechiga@jogarplastics.com | Placeholder armas extras Tesorero |
| Ricardo Jesús Fernández y Gasque | richfegas@icloud.com | Familia del Presidente |
| Gerardo Antonio Fernández Quijano | gfernandez63@gmail.com | Familia del Presidente |
| Ricardo Manuel Fernández Quijano | richfer1020@gmail.com | Familia del Presidente |
| Ricardo Daniel Fernández Pérez | richfer0304@gmail.com | Familia del Presidente |
| Aimee Gómez Mendoza | aimeegomez615@gmail.com | Inscripción dic 2025 cubre 2026 |

### Tracking in Firestore
```javascript
socios/{email}/membresia2026: {
  estado: 'pagado' | 'pendiente' | 'parcial',
  monto: number,
  fechaPago: timestamp,
  registradoPor: 'admin@club738.com', // Audit
  detallesPago: { inscripcion, anualidad, femeti }
}
```

### Key Tools
- **RegistroPagos.jsx**: Record payments
- **ReporteCaja.jsx**: Daily cutoff + CSV export
- **DashboardRenovaciones.jsx**: 2026 renewal tracking (target: 80% by Feb 28)
- **CobranzaUnificada.jsx**: Unified billing view

### SEDENA Bimonthly Reports
Due: Feb 28, Apr 30, Jun 30, Aug 31, Oct 31, Dec 31
Track: New registrations, transfers, sales outside club, new members, departures

---

## 🔫 Arsenal Data Integrity - "LA FUENTE DE VERDAD"

### Master Source: Excel File
`socios/FUENTE_DE_VERDAD_CLUB_738_*.xlsx`:
- **76 socios** with complete profiles
- **292 weapons** (80 rifles, 69 shotguns, 99 pistols, 2 revolvers, 1 kit, 1 special)
- **9 socios without weapons** (recent members, active placeholders)
- NEVER delete or simplify entries - they're official SEDENA documents

### What Stays Synced Daily in Firestore
```javascript
socios/{email}/armas/{armaId}: {
  clase: "ESCOPETA SEMIAUTOMATICA",  // Verbatim from SEDENA
  type_group: "ESCOPETA",            // Normalized for UI queries
  calibre: ".22" | "9mm" | etc,      // Art. 50 SEDENA compliant
  marca, modelo, matricula, folio,
  modalidad: 'caza' | 'tiro' | 'ambas',
  documentoRegistro: URL             // RFA PDF
}
```

### Critical Lesson: Weapon Caliber Validation
❌ **NEVER assume** a caliber without PDF verification
✅ **ALWAYS OCR** weapon registration PDFs before entry

**Art. 50 LFAFE Compliance**:
- ✅ Permitted: .22 LR, .380 ACP, 9mm (some models), 38 SPL
- ❌ Prohibited: .40 S&W, 10mm, .45 ACP, 357 MAG

**Process**: 
1. Extract caliber from PDF via OCR
2. Validate against Art. 50 SEDENA
3. If uncertain → ask user for confirmation
4. One wrong calibre = PETA rejection from 32 Zona Militar

### Key Tools
- **MisArmas.jsx**: Socio views their weapons
- **AdminAltasArsenal.jsx**: Register new weapons
- **AdminBajasArsenal.jsx**: Deregister weapons
- **ReportadorExpedientes.jsx**: SEDENA reports

---

## ☁️ Cloud Functions (v2 Architecture)

### Three Active Functions
1. **`onPetaCreated`** - Trigger: `socios/{email}/petas/{petaId}` created
   - Sends email notification to secretary (smunozam@gmail.com)
   - Includes weapon list, authorization states, PETA type
   
2. **`crearEventoCalendar`** - Trigger: `socios/{email}/citas/{citaId}` created
   - Creates Google Calendar event in smunozam@gmail.com
   - Auto-invites socio via email
   - Reminders: 24h, 1h, 15min
   - Color: Blue (#9)

3. **`actualizarEventoCalendar`** - Trigger: `socios/{email}/citas/{citaId}` updated
   - Confirmada: Green title "✅ CONFIRMADA" + color #10
   - Completada: Gray "✔️ COMPLETADA" + color #8
   - Cancelada: Deletes event from calendar
   - Sends status change email to socio

### Key Configuration
- **Region**: us-central1
- **Max Instances**: 10
- **Runtime**: Node 22
- **Service Account**: firebase-adminsdk-fbsvc@club-738-appgit-50256612-450b8.iam.gserviceaccount.com
- **Calendar Email**: smunozam@gmail.com (must be shared with service account)
- **Secrets**: `EMAIL_PASS` (set via `firebase functions:secrets:set EMAIL_PASS`)

### Deployment
```bash
cd functions && npm run deploy  # Deploy only Cloud Functions
firebase deploy --only functions  # From root (same as above)
firebase functions:log           # View real-time logs
```

---

## 🏗️ Build & Bundle Configuration

### Vite Optimization Strategy
Defined in [vite.config.js](vite.config.js) with aggressive chunking:

**Manual Chunks** (separate vendor bundles):
- `react-vendor`: react, react-dom
- `firebase-vendor`: All Firebase SDK modules  
- `xlsx-vendor`: Excel processing
- `pdf-vendor`: jsPDF, pdfjs-dist

**Compression**:
- Gzip + Brotli (threshold: 1KB)
- Terser minification + console.log removal

**Asset Fingerprinting**:
- All JS/CSS: Hash-based names for cache busting
- Static assets: 1-year max-age
- HTML: No cache (must-revalidate)

### Analyzing Build Size
```bash
ANALYZE=1 npm run build  # Opens dist/stats.html with bundle breakdown
```

### Code Splitting Rules
- Entry point: Keep small (<100KB)
- Vendor chunks: Cached separately (1-year TTL)
- App code: Split by route lazy-loading opportunity
- Warning threshold: 1MB per chunk (logged but not blocking)

### Repositories & Machines
```
GitHub: https://github.com/smunozsader/club-738-app.git
iMac Desktop (macOS): /Applications/club-738-web
Laptop (Windows): C:\Users\smuno\Club_738_Webapp\club-738-app
```

### Daily Ritual
- **Start**: `git pull`
- **End**: Commit → Push (format: `tipo(scope): descripción`)

### Commit Types
`feat` | `fix` | `docs` | `refactor` | `chore`

### Development Journal
After significant changes, ask user: *"Update journal, commit, and push?"*

**Triggers**:
- Created new component
- Fixed significant bug
- Modified 3+ files
- Updated Firebase config/rules
- Added new dependencies
- End of long session

**Entry format** (in `DEVELOPMENT_JOURNAL.md`):
```markdown
### [Date] - v[X.Y.Z] Brief description

**Objective**: What was needed
**Changes**: - Change 1
           - Change 2
**Files Modified**: - path/file.jsx
**Deploy**: yes/no
```

### Conflict Resolution
```bash
git pull --rebase
# Resolve manually
git add . && git rebase --continue && git push
```

### Files Not Synced (.gitignore)
- `node_modules/` - Regenerated with `npm install`
- `scripts/serviceAccountKey.json` - Firebase Admin (copy manually)
- `dist/` - Build output

---

## 📚 Key File Reference

| File | Purpose |
|------|---------|
| [src/firebaseConfig.js](src/firebaseConfig.js) | Firebase init + analytics tracking (auth, db, storage) |
| [src/App.jsx](src/App.jsx) | Main router, activeSection state, auth state |
| [src/components/admin/AdminDashboard.jsx](src/components/admin/AdminDashboard.jsx) | Admin panel hub (15+ tools) + NotificacionesCitas banner |
| [src/components/admin/AdminToolsNavigation.jsx](src/components/admin/AdminToolsNavigation.jsx) | Grid nav for all admin functions |
| [src/hooks/useRole.jsx](src/hooks/useRole.jsx) | Admin vs socio detection (reads usuarios/{email}.role) |
| [src/hooks/useDarkMode.js](src/hooks/useDarkMode.js) | Dark mode + localStorage + system preference sync |
| [src/hooks/useToast.js](src/hooks/useToast.js) | Toast state management |
| [src/contexts/ToastContext.jsx](src/contexts/ToastContext.jsx) | Toast provider + useToastContext hook |
| [src/utils/limitesCartuchos.js](src/utils/limitesCartuchos.js) | Legal ammunition limits (Art. 50 SEDENA) |
| [src/utils/pagosE5cinco.js](src/utils/pagosE5cinco.js) | SEDENA payment validation |
| [src/utils/ocrValidation.js](src/utils/ocrValidation.js) | RFA caliber extraction via tesseract.js |
| [src/utils/curpParser.js](src/utils/curpParser.js) | CURP extraction & validation |
| [firestore.rules](firestore.rules) | Database security (email normalization, isAdminOrSecretary) |
| [storage.rules](storage.rules) | Cloud Storage access control |
| [firebase.json](firebase.json) | Hosting rewrites, CSP headers, cache headers |
| [vite.config.js](vite.config.js) | Build optimization, code splitting, compression |
| [functions/index.js](functions/index.js) | Cloud Functions v2 (onPetaCreated, calendar integration) |
| [DEVELOPMENT_JOURNAL.md](DEVELOPMENT_JOURNAL.md) | Feature history, versioning, architectural notes |

---

## 🔫 Arsenal Data Integrity - "LA FUENTE DE VERDAD"

### Master Source: Excel File
`socios/FUENTE_DE_VERDAD_CLUB_738_*.xlsx`:
- **76 socios** with complete profiles
- **292 weapons** (80 rifles, 69 shotguns, 99 pistols, 2 revolvers, 1 kit, 1 special)
- **9 socios without weapons** (recent members, active placeholders)
- NEVER delete or simplify entries - they're official SEDENA documents

### What Stays Synced Daily in Firestore
```javascript
socios/{email}/armas/{armaId}: {
  clase: "ESCOPETA SEMIAUTOMATICA",  // Verbatim from SEDENA
  type_group: "ESCOPETA",            // Normalized for UI queries
  calibre: ".22" | "9mm" | etc,      // Art. 50 SEDENA compliant
  marca, modelo, matricula, folio,
  modalidad: 'caza' | 'tiro' | 'ambas',
  documentoRegistro: URL             // RFA PDF
}
```

### Critical Lesson: Weapon Caliber Validation
❌ **NEVER assume** a caliber without PDF verification
✅ **ALWAYS OCR** weapon registration PDFs before entry

**Art. 50 LFAFE Compliance**:
- ✅ Permitted: .22 LR, .380 ACP, 9mm (some models), 38 SPL
- ❌ Prohibited: .40 S&W, 10mm, .45 ACP, 357 MAG

**Process**: 
1. Extract caliber from PDF via OCR
2. Validate against Art. 50 SEDENA
3. If uncertain → ask user for confirmation
4. One wrong calibre = PETA rejection from 32 Zona Militar

### Key Tools
- **MisArmas.jsx**: Socio views their weapons
- **AdminAltasArsenal.jsx**: Register new weapons
- **AdminBajasArsenal.jsx**: Deregister weapons
- **ReportadorExpedientes.jsx**: SEDENA reports

---

## ✅ Pre-Push Checklist

### Code Quality & Requirements
- [ ] Email normalized (`.toLowerCase()`) in all Firestore paths
- [ ] Admin email hardcoded as `admin@club738.com`
- [ ] Component has paired `.jsx` + `.css` files (no cross-imports)
- [ ] Real-time listeners unsubscribed in useEffect cleanup (return cleanup function)
- [ ] Props contain `userEmail` for audit trail (if admin tool)
- [ ] Spanish-only text in UI (no English mixed in)
- [ ] File sizes verified: normal <5MB, RFAs <10MB
- [ ] Toast notifications for all user feedback (no alert() dialogs)
- [ ] Storage paths normalized with lowercase emails
- [ ] Firestore rules match code (especially email comparisons with .lower())
- [ ] Weapon caliber validated against Art. 50 SEDENA limits

### UX/UI & Accessibility (CRITICAL)
- [ ] Tested in light mode AND dark mode (both readable)
- [ ] Text contrast ≥ 4.5:1 (WCAG AA) in both modes
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, ESC)
- [ ] Form labels associated with inputs (`htmlFor` attribute)
- [ ] ARIA labels on buttons/icons without visible text
- [ ] Focus visible and obvious (not just outline-only)
- [ ] No weapon emojis or sensitive imagery
- [ ] Responsive layout (tested at 320px, 768px, 1440px viewports)
- [ ] No horizontal scroll on mobile
- [ ] CSS variables used (no hardcoded colors)
- [ ] Modals have focus trap and close button
- [ ] Error messages clear, in Spanish, actionable
- [ ] Dark mode CSS variables ensure legibility (no text disappearing)

---

## 🧪 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Firestore path errors | Use `.toLowerCase()` ALWAYS on email doc IDs |
| Data not updating | Check `onSnapshot` setup, missing cleanup |
| Admin can't see data | Verify Firestore rule `isAdminOrSecretary()` |
| PDF generation fails | Check jsPDF version, fonts in GeneradorPETA |
| Upload fails silently | Check Storage rules, file size <5MB, MIME type |
| Dark mode not saving | Verify `useDarkMode()` hook localStorage key |
| Component style conflicts | Ensure CSS files paired with components, no cross-imports |

---

## 🎓 Gotchas

1. **Email Paths**: Firestore IDs must use `.toLowerCase()` everywhere
2. **Real-time Listeners**: ALWAYS unsubscribe in cleanup `return () => unsubscribe()`
3. **Admin Nav**: Use `setActiveSection('admin-dashboard')` NOT `'dashboard'`
4. **Props**: Admin components NEED `userEmail` for audit trail
5. **PDF**: jsPDF requires custom headers/footers (see GeneradorPETA.jsx)
6. **Caliber Data**: Never assume - OCR first, validate against Art. 50, ask user if uncertain
7. **CSS**: Component `.css` files are paired and isolated, never imported by other components
8. **Weapon Emojis**: Prohibited in UI text (accessibility/sensitivity)
9. **Cloud Functions**: v2 API uses `onDocumentCreated`/`onDocumentUpdated`, not v1 patterns
10. **Toast Context**: Must wrap components in `<ToastProvider>` in App.jsx (already done)

---

## 🚀 Deployment Workflow

### Build
```bash
npm run build  # Creates optimized dist/ folder
```

### Deploy to Firebase Hosting + Rules
```bash
firebase deploy  # Deploys hosting + firestore.rules + storage.rules
```

### Verify Deployment
```bash
firebase apps:list          # Confirm Firebase config
open https://yucatanctp.org # Test production URL
```

### Repositories & Machines
```
GitHub: https://github.com/smunozsader/club-738-app.git
iMac Desktop (macOS): /Applications/club-738-web
Laptop (Windows): C:\Users\smuno\Club_738_Webapp\club-738-app
```

### Daily Ritual
- **Start**: `git pull`
- **End**: Commit → Push (format: `tipo(scope): descripción`)

### Commit Types
`feat` | `fix` | `docs` | `refactor` | `chore`

### Development Journal
After significant changes, ask user: *"Update journal, commit, and push?"*

**Triggers**:
- Created new component
- Fixed significant bug
- Modified 3+ files
- Updated Firebase config/rules
- Added new dependencies
- End of long session

**Entry format** (in `DEVELOPMENT_JOURNAL.md`):
```markdown
### [Date] - v[X.Y.Z] Brief description

**Objective**: What was needed
**Changes**: - Change 1
           - Change 2
**Files Modified**: - path/file.jsx
**Deploy**: yes/no
```

### Conflict Resolution
```bash
git pull --rebase
# Resolve manually
git add . && git rebase --continue && git push
```

### Files Not Synced (.gitignore)
- `node_modules/` - Regenerated with `npm install`
- `scripts/serviceAccountKey.json` - Firebase Admin (copy manually)
- `dist/` - Build output

---

## 📞 Need Help?

1. **Data flow**: Check [DEVELOPMENT_JOURNAL.md](DEVELOPMENT_JOURNAL.md) for context
2. **Component patterns**: Search `src/components/` for similar component
3. **Firebase**: Verify `src/firebaseConfig.js` exports, never create new instances
4. **Security**: Check Firestore/Storage rules match code (email normalization critical)
5. **Styling**: Look at existing component `.css` files for CSS var patterns

---

**Last Updated**: Jan 29, 2026 | Version: 1.36.1 | Framework: React 18.x + Vite 5.x + Firebase

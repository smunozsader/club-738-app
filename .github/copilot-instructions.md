# Club 738 Web - AI Coding Agent Instructions

**Status**: v1.31.0 | Updated: Jan 21, 2026

---

## 🚀 Quick Start (5 min)

### Essential Commands
```bash
npm run dev                    # Local dev → http://localhost:5173
npm run build && firebase deploy  # Deploy to production
npx md-to-pdf docs/FILE.md    # Convert markdown to PDF
```

### Critical Constraints - ALWAYS
1. **Admin Email**: `admin@club738.com` = only admin account
2. **Email Paths**: ALWAYS use `.toLowerCase()` in Firestore doc IDs (e.g., `socios/{email.toLowerCase()}`)
3. **Production URL**: `https://yucatanctp.org` (NOT `club-738-app.web.app`)
4. **Spanish Only**: ALL UI text, messages, code comments in Spanish
5. **Legal Limits** (SEDENA Art. 50): .22 LR=500 rounds, Shotgun=1,000, Others=200
6. **After Code Changes**: Ask user "Should I build and deploy?" → `npm run build && firebase deploy`

---

## 🏗️ Architecture at a Glance

### Tech Stack
- **Frontend**: React 18.x + Vite 5.x + CSS modules (co-located with components)
- **Backend**: Firebase (Auth, Firestore, Cloud Storage, Hosting)
- **Key Libs**: jsPDF (PDF generation), tesseract.js (OCR), xlsx (Excel), pdfjs-dist (PDF processing)

### Core Services
All centralized in [`src/firebaseConfig.js`](src/firebaseConfig.js):
```javascript
export const auth, db, storage, analytics
// NEVER create new instances - use these exports everywhere
```

### Data Model: Three Pillars
1. **Socios** (`socios/{email}`) - Member base documents
2. **Armas** (`socios/{email}/armas/{armaId}`) - Weapon subcollection  
3. **PETAs** (`socios/{email}/petas/{petaId}`) - Authorization requests

---

## 🎯 Component Patterns

### Component Pairing (CRITICAL!)
**ALWAYS create paired files**:
- ✅ `MyComponent.jsx` + `MyComponent.css` (same directory)
- ❌ NO shared CSS imports between components

### Admin Navigation Pattern
```javascript
// In App.jsx - use activeSection state for routing
{activeSection === 'admin-dashboard' && <AdminDashboard userEmail={user.email} />}
{activeSection === 'registro-pagos' && (
  <RegistroPagos userEmail={user.email} onBack={() => setActiveSection('admin-dashboard')} />
)}
```

**Rule**: Admin sub-components ALWAYS use `onBack` callback, NEVER direct navigation

### Required Props Pattern
| Component | Props | Why |
|-----------|-------|-----|
| `RegistroPagos`, `VerificadorPETA`, `ReporteCaja` | `userEmail`, `onBack` | Audit trail |
| `GeneradorPETA` | `userEmail` | PDF signature/metadata |
| `AdminBajasArsenal`, `AdminAltasArsenal` | none | Autonomous modules |

### Real-time Data (Firestore Pattern)
```javascript
// ALWAYS use onSnapshot, unsubscribe in cleanup
useEffect(() => {
  const docRef = doc(db, 'socios', userEmail.toLowerCase());
  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists()) setData(snap.data());
  });
  return () => unsubscribe(); // CRITICAL cleanup
}, [userEmail]);
```

### Toast Notifications
```javascript
import { useToastContext } from '../contexts/ToastContext';
const { showToast } = useToastContext();
showToast('Guardado ✓', 'success', 3000);
// Types: 'success' | 'error' | 'info' | 'warning'
```

### Dark Mode
Use CSS variables (already implemented via `useDarkMode()` hook):
```css
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## 🔐 Security & Auth

### Role Detection
```javascript
const ADMIN_EMAIL = 'admin@club738.com';
const isAdmin = user?.email === ADMIN_EMAIL; // Only method
```

### Firestore Rules (Key Pattern)
- **Owner access**: `request.auth.token.email.lower() == docId.lower()`
- **Admin access**: `request.auth.token.email == 'admin@club738.com'`
- **Email normalization**: ALWAYS use `.lower()` in rules

### Storage Structure
```
documentos/{email}/
  ├── curp.pdf, constancia.pdf (admin pre-uploads)
  ├── ine.pdf, foto.jpg, cartilla.pdf (socio uploads)
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
**New Members**: Inscripción ($2,000) + Anualidad ($6,000) + FEMETI ($700) = **$8,700**
**Renewals**: Anualidad ($6,000) + FEMETI ($350) = **$6,350**

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

## 🔄 Multi-Machine Git Workflow

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
| [src/firebaseConfig.js](src/firebaseConfig.js) | Firebase init (auth, db, storage) |
| [src/App.jsx](src/App.jsx) | Main router, activeSection state |
| [src/components/admin/AdminDashboard.jsx](src/components/admin/AdminDashboard.jsx) | Admin panel hub (15 tools in 5 categories) |
| [src/hooks/useRole.jsx](src/hooks/useRole.jsx) | Admin vs socio detection |
| [src/hooks/useDarkMode.js](src/hooks/useDarkMode.js) | Dark mode + localStorage |
| [src/contexts/ToastContext.jsx](src/contexts/ToastContext.jsx) | Toast notifications |
| [src/utils/limitesCartuchos.js](src/utils/limitesCartuchos.js) | Legal ammo limits (Art. 50) |
| [src/utils/pagosE5cinco.js](src/utils/pagosE5cinco.js) | SEDENA payment validation |
| [firestore.rules](firestore.rules) | Database security rules |
| [storage.rules](storage.rules) | Cloud Storage security rules |
| [DEVELOPMENT_JOURNAL.md](DEVELOPMENT_JOURNAL.md) | Change log & feature history |

---

## ✅ Pre-Push Checklist

- [ ] Email normalized (`.toLowerCase()`) in all Firestore paths
- [ ] Admin email hardcoded as `admin@club738.com`
- [ ] Component has paired `.jsx` + `.css` files
- [ ] Real-time listeners unsubscribed in useEffect cleanup
- [ ] Props contain `userEmail` for audit (if admin tool)
- [ ] Spanish-only text in UI
- [ ] No weapon emojis (🔫❌)
- [ ] File sizes under 5MB (10MB for RFAs)
- [ ] Toast notifications for user feedback
- [ ] Dark mode CSS vars used
- [ ] Storage paths normalized with lowercase emails

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

1. **Email Paths**: Firestore IDs must use `.toLowerCase()`
2. **Real-time Listeners**: ALWAYS unsubscribe in cleanup `return () => unsubscribe()`
3. **Admin Nav**: Use `setActiveSection('admin-dashboard')` NOT `'dashboard'`
4. **Props**: Admin components NEED `userEmail` for audit trail
5. **PDF**: jsPDF requires custom headers/footers (see GeneradorPETA.jsx)
6. **Caliber Data**: Never assume - OCR first, validate against Art. 50, ask user if uncertain
7. **CSS**: Component `.css` files are paired and isolated, never imported by other components

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

---

## 📞 Need Help?

1. **Data flow**: Check [DEVELOPMENT_JOURNAL.md](DEVELOPMENT_JOURNAL.md) for context
2. **Component patterns**: Search `src/components/` for similar component
3. **Firebase**: Verify `src/firebaseConfig.js` exports, never create new instances
4. **Security**: Check Firestore/Storage rules match code (email normalization critical)
5. **Styling**: Look at existing component `.css` files for CSS var patterns

---

**Last Updated**: Jan 21, 2026 | Version: 1.31.0 | Framework: React 18.x + Vite 5.x + Firebase

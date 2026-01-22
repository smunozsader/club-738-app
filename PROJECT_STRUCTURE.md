# 📁 Club 738 Web - Project Structure

**Última actualización**: 22 de Enero, 2026 | v1.33.4

---

## 🏗️ Estructura General del Proyecto

```
club-738-web/
├── 📦 CORE APPLICATION
│   ├── src/                           # React source code
│   │   ├── components/                # React components (paired with .css)
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── contexts/                  # Context providers
│   │   ├── utils/                     # Utility functions
│   │   ├── App.jsx                    # Main app component
│   │   └── firebaseConfig.js          # Firebase initialization
│   ├── public/                        # Static assets (logo, icons, etc.)
│   ├── dist/                          # Build output (generated)
│   └── index.html                     # Entry point
│
├── 🔧 BUILD & DEPLOYMENT
│   ├── package.json                   # Node dependencies & scripts
│   ├── vite.config.js                 # Vite configuration
│   ├── firebase.json                  # Firebase config
│   ├── .firebaserc                    # Firebase projects
│   ├── firestore.rules                # Firestore security rules
│   ├── storage.rules                  # Cloud Storage rules
│   └── .github/                       # GitHub workflows & Copilot instructions
│
├── 📚 DOCUMENTATION (Root Only - Essential)
│   ├── DEVELOPMENT_JOURNAL.md         # Complete changelog & feature history
│   ├── CHANGELOG.md                   # Version history
│   ├── INSTRUCCIONES_PWA.md           # PWA setup guide
│   └── PROJECT_STRUCTURE.md           # THIS FILE
│
├── 📜 SCRIPTS
│   ├── scripts/admin-data/            # Data administration scripts
│   │   └── actualizar_*.py            # Update member/payment records
│   │
│   ├── scripts/audit/                 # Verification & auditing
│   │   ├── audit_*.py                 # Audit Firestore data
│   │   ├── verificar_*.py             # Verify specific members
│   │   ├── buscar_*.py                # Search utilities
│   │   └── verify_*.py                # Verification scripts
│   │
│   ├── scripts/armas/                 # Weapon management
│   │   ├── agregar_*.py               # Add new weapons
│   │   ├── registrar_*.py             # Register weapons
│   │   ├── corregir_*.mjs             # Fix/correct weapon data
│   │   └── limpiar_*.mjs              # Data cleanup operations
│   │
│   └── scripts/reports/               # Analysis & reporting
│       ├── estadisticas_*.py          # Generate statistics
│       ├── reporte_*.py               # Generate reports
│       ├── analizar_*.py              # Data analysis
│       ├── normalizar_*.py            # Normalize/standardize data
│       └── compare_*.py               # Compare data sets
│
├── 📖 DOCUMENTATION (Organized)
│   ├── docs/
│   │   ├── decisions/                 # Architecture & design decisions
│   │   │   ├── ADMIN_*.md             # Admin interface decisions
│   │   │   ├── DESIGN_*.md            # Design system docs
│   │   │   ├── COLOR_*.md             # Color palette decisions
│   │   │   ├── AUDIT_*.md             # Audit feature docs
│   │   │   ├── PROPUESTA_*.md         # Feature proposals
│   │   │   ├── FIREBASE_*.md          # Firebase architecture
│   │   │   └── ... (25+ decision documents)
│   │   └── (other docs as needed)
│   │
│   └── (Firebase hosted docs in future)
│
├── 💾 DATA & REFERENCES
│   ├── data/
│   │   ├── referencias/               # All data references & examples
│   │   │   ├── 2025-dic-usb-738/      # Previous year backups
│   │   │   ├── 2026. ine socios/      # Member ID references
│   │   │   ├── armas_socios/          # Weapon registry examples
│   │   │   ├── docs_socios/           # Member documentation
│   │   │   ├── emails-socios/         # Email lists
│   │   │   ├── formatos_E5_ayuda/     # E5CINCO format templates
│   │   │   ├── oficios_ejemplos/      # Sample documents (PETA)
│   │   │   ├── pdfs petas samples/    # PDF sample templates
│   │   │   ├── report_bimestrales/    # Bimonthly reports
│   │   │   └── socios/                # Member profiles
│   │   │
│   │   └── backups/                   # Secure backups & credentials
│   │       ├── data_backup_*.zip      # Firestore backups
│   │       └── CREDENTIALS_*.txt      # API keys (GITIGNORED)
│   │
│   └── (Data not committed to git - see .gitignore)
│
├── ⚙️ CONFIGURATION
│   ├── config/
│   │   └── cors.json                  # CORS configuration
│   │
│   ├── functions/                     # Firebase Cloud Functions
│   │   └── (Node.js backend functions)
│   │
│   ├── .venv/                         # Python virtual environment
│   ├── .vscode/                       # VS Code settings
│   ├── .github/                       # GitHub config & workflows
│   └── node_modules/                  # Node dependencies (not committed)
│
├── 📦 UTILITIES & MISC
│   ├── archive/                       # Deprecated code (cleanup area)
│   ├── .git/                          # Git repository
│   ├── .gitignore                     # Git ignore rules
│   ├── club-738-web.code-workspace    # VS Code workspace file
│   └── vite.config.js                 # Vite build config
```

---

## 📊 Scripts Organization

### `scripts/admin-data/` - Member & Payment Administration
**Purpose**: Update member information and payment records in Firestore

| Script | Purpose |
|--------|---------|
| `actualizar_pagos_carpeta.py` | Update payment records from folder |
| `actualizar_socio_*.py` | Update specific member information |

---

### `scripts/audit/` - Auditing & Verification
**Purpose**: Verify data integrity and member records

| Script | Purpose |
|--------|---------|
| `audit_*.py` | Full Firestore audits |
| `verificar_*.py` | Verify specific member data |
| `buscar_*.py` | Search members by criteria |
| `verify_*.py` | Additional verification scripts |

---

### `scripts/armas/` - Weapon Management
**Purpose**: Manage weapon registrations and PETA process

| Script | Purpose |
|--------|---------|
| `agregar_*.py` | Add new weapons from Excel |
| `registrar_*.py` | Register weapons in Firestore |
| `corregir_*.mjs` | Fix weapon data errors |
| `limpiar_*.mjs` | Cleanup & normalize weapon records |

---

### `scripts/reports/` - Analysis & Reporting
**Purpose**: Generate reports, statistics, and data analysis

| Script | Purpose |
|--------|---------|
| `estadisticas_*.py` | Generate statistics |
| `reporte_*.py` | Generate reports |
| `analizar_*.py` | Analyze data sets |
| `normalizar_*.py` | Normalize/standardize data |
| `compare_*.py` | Compare weapon data |

---

## 🔐 Critical Files (Do Not Delete)

### Security & Configuration
- `firestore.rules` - Database security rules (CRITICAL)
- `storage.rules` - Cloud Storage permissions (CRITICAL)
- `firebase.json` - Firebase project config
- `.firebaserc` - Firebase project IDs
- `package.json` - Dependencies & scripts
- `vite.config.js` - Build configuration

### Documentation
- `DEVELOPMENT_JOURNAL.md` - **ALWAYS UPDATE** after major changes
- `CHANGELOG.md` - Version history
- `PROJECT_STRUCTURE.md` - This file

### Source Code
- `src/` - All React code
- `public/` - Assets (logo, icons, PWA manifest)
- `functions/` - Firebase Cloud Functions

---

## 📋 File Guidelines

### What Goes Where?

| Content | Location | Condition |
|---------|----------|-----------|
| React components | `src/components/` | Must have paired `.css` |
| Utility functions | `src/utils/` | General purpose functions |
| Custom hooks | `src/hooks/` | React hook logic |
| Context providers | `src/contexts/` | State management |
| Static assets | `public/` | Logo, icons, manifest |
| Python scripts | `scripts/{category}/` | Never in root |
| Design decisions | `docs/decisions/` | Architecture docs |
| Member data | `data/referencias/` | References only |
| Backups | `data/backups/` | Sensitive files |

### DO NOT Store in Root
❌ Python/Node scripts
❌ Markdown decision docs
❌ Data folders
❌ Backup files
❌ Credential files

### ALWAYS Keep in Root
✅ `package.json`
✅ `firebase.json`
✅ `firestore.rules`
✅ `storage.rules`
✅ `DEVELOPMENT_JOURNAL.md` (essential reference)
✅ `CHANGELOG.md`
✅ `vite.config.js`
✅ `index.html`

---

## 🚀 Development Workflow

### Starting a Session
```bash
cd /Applications/club-738-web
npm install
npm run dev
```

### After Making Changes
1. Update `DEVELOPMENT_JOURNAL.md` with your changes
2. Test: `npm run build` (should complete in ~10s)
3. Deploy: `firebase deploy --only hosting`
4. Commit: `git add . && git commit -m "type(scope): message"`
5. Push: `git push`

### Cleaning Up
- Move old scripts to appropriate `scripts/{category}/`
- Move decision docs to `docs/decisions/`
- Move data to `data/referencias/`
- Update this file if structure changes

---

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| **Source Files** | ~100 files in `src/` |
| **Components** | 30+ React components |
| **Scripts** | 40+ Python/Node.js utilities |
| **Documentation** | 30+ decision documents |
| **Build Size** | ~336KB (Brotli compressed) |
| **Build Time** | ~8-10 seconds |

---

## 🔗 Key Directories Reference

| Path | Purpose | Ownership |
|------|---------|-----------|
| `src/firebaseConfig.js` | Firebase exports (CRITICAL) | Never modify |
| `src/components/admin/` | Admin interface components | Primary focus |
| `src/hooks/useRole.jsx` | Admin role detection | Security critical |
| `src/utils/limitesCartuchos.js` | SEDENA Art. 50 validation | Legal requirement |
| `scripts/audit/` | Data verification | Maintenance |
| `data/referencias/` | Member/weapon references | Archive |

---

## 📝 Last Cleanup

**Date**: 22 Enero 2026
**Version**: v1.33.4
**Changes**:
- ✅ Moved 40+ Python/Node scripts to organized categories
- ✅ Moved 25+ decision documents to `docs/decisions/`
- ✅ Moved 12+ data folders to `data/referencias/`
- ✅ Moved backups & credentials to `data/backups/`
- ✅ Created config/ for configuration files
- ✅ Root now contains only essential build & documentation files

**Result**: Clean, organized project structure with clear separation of concerns.


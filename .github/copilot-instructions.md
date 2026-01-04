# Club 738 Web - AI Coding Agent Instructions

## Project Overview

**Club 738** is a Spanish-language member portal for a hunting/shooting/fishing club. The app provides members with document management, credential handling, weapon registration, and payment status tracking.

## Architecture

### Firebase Backend Integration
- **Authentication**: Firebase Auth (email/password sign-in and registration)
- **Database**: Firestore (initialized but not yet used in UI)
- **File Storage**: Firebase Cloud Storage (initialized for document uploads)

See [src/firebaseConfig.js](src/firebaseConfig.js) for all Firebase service initialization.

### Component Structure
- **App.jsx** ([src/App.jsx](src/App.jsx)): Main router component with auth state management using `auth.onAuthStateChanged()`. Renders Loading → Login → Dashboard based on user state.
- **Login.jsx** ([src/components/Login.jsx](src/components/Login.jsx)): Dual-mode auth component supporting both login and signup. Error handling uses Firebase error messages directly.

### Hosting
- Built for Firebase Hosting (see [firebase.json](firebase.json))
- SPA rewrites all routes to `/index.html`
- Production build outputs to `/dist`

## Key Patterns & Conventions

### Authentication Flow
- **Startup**: `useEffect` with `auth.onAuthStateChanged()` listener to detect logged-in state
- **Logout**: Direct `signOut(auth)` call without additional cleanup (Firebase handles session)
- **Error Display**: Firebase exception messages shown directly to users (e.g., "invalid-email", "wrong-password")
- Currently no user profile enrichment - using only Firebase `currentUser.email`

### Component Design
- Functional components with React Hooks (useState, useEffect)
- Loading states managed at app level (`loading` in App.jsx)
- Form submission prevents default and includes try/catch with finally block for loading state

### Internationalization
- **Spanish UI**: All strings are in Spanish (interface labels, error messages, placeholders)
- Planned features mentioned in dashboard: "Mis Documentos", "Mi Credencial", "Mis Armas", "Pagos"
- Comments in code are in Spanish

### Styling
- CSS files co-located with components ([src/components/Login.css](src/components/Login.css), [src/App.css](src/App.css))
- **NO usar emojis de armas** (🔫🎯🦆) - Mantener imagen profesional
- Usar emojis neutros: 📋📄✅⚠️📌 para indicadores
- Preferir texto o iconos SVG profesionales sobre emojis temáticos

## Development Workflow

### Running the Project
```bash
# Build for production
npm run build  # Outputs to /dist

# Deploy to Firebase Hosting
firebase deploy
```

### Adding Features
1. **New Components**: Create in `src/components/` with paired `.jsx` and `.css` files
2. **Firebase Operations**: Import from `firebaseConfig.js` (don't create new instances)
3. **State Management**: Use component-level hooks; no Redux/context store currently
4. **User Context**: Access via `auth.currentUser` after login; wrap async calls in try/catch

### Auth-Protected Routes
Add conditional rendering in App.jsx based on `user` state (see existing pattern with `if (!user)` check).

## Critical Dependencies

- **react**: 18.x (functional components with hooks)
- **firebase**: 11.x SDK
- **react-dom**: For rendering

## Next Steps for Future Development

Based on dashboard UI hints, expected features include:
- Document upload/download (Firebase Storage integration needed)
- Member credential generation (likely PDF from template)
- Weapon registry CRUD (Firestore collection design needed)
- Payment status tracking (Firestore query or API integration)
- User profile completion (extend currentUser with Firestore doc)

## Documentos Requeridos para PETA

### Referencia Oficial
Los requisitos están documentados en:
```
Base datos/Requisitos PETA (1).docx
```

### Lista de 16 Documentos

| # | Documento | Presentación | Notas |
|---|-----------|--------------|-------|
| 1 | **INE** | Copia ampliada 200%, ambas caras en 1 página carta | Socio sube escaneado |
| 2 | **CURP** | Copia | ✅ Ya tenemos 76 en Firebase Storage |
| 3 | **Cartilla Militar / Acta Nacimiento** | Copia | Escanear una vez, tener lista para imprimir |
| 4 | **Comprobante de Domicilio** | Original | Socio sube escaneado para expediente integral |
| 5 | **Constancia Antecedentes Penales** | Original | ✅ ~70 socios ya subidas |
| 6 | **Certificado Médico** (no impedimento) | Original | Socio sube escaneado para constancia |
| 7 | **Certificado Psicológico** | Original | Socio sube escaneado para constancia |
| 8 | **Certificado Toxicológico** | Original | Socio sube escaneado para constancia |
| 9 | **Carta Modo Honesto de Vivir** | Original | Formato oficial, se entrega en 32 ZM. Socio sube escaneado |
| 10 | **Licencia de Caza** | Copia | Solo si modalidad caza. **REVISAR VIGENCIA** |
| 11 | **Credencial del Club** | Copia | ⏳ Pendiente generar |
| 12 | **Solicitud PETA** | Original | Club provee formato/template |
| 13 | **Registros de Armas (RFA)** | Copia | Verificar datos vs Firebase. Máx 10 armas por PETA |
| 14 | **Recibo Pago e5cinco** | Original | Socio sube escaneado |
| 15 | **Fotografía** (fondo blanco, infantil) | Física + Digital | Para credencial y entregar en 32 ZM |
| 16 | **Permiso Anterior** | Original | Solo renovaciones. Se entrega en 32 ZM |

### Flujo de Documentos
1. **Socio sube** → Firebase Storage `documentos/{email}/{tipo}.pdf`
2. **Secretario verifica** → Marca como "verificado" en Firestore
3. **Originales físicos** → Se entregan en 32 Zona Militar (Valladolid)

### Autoridad de Trámite
- **32 Zona Militar** - Valladolid, Yucatán
- Formato PETA: SEDENA-02-045 (caza) o 02-046 (tiro/competencia)
- Máximo: 10 armas por PETA

## Requisitos para Socios Nuevos

### Referencia Oficial
```
2025 requisitos club con whatsapp NEW.pdf
```

### Documentación Requerida (20 puntos)

| # | Documento | Cantidad | Notas |
|---|-----------|----------|-------|
| 1 | Solicitud formato libre | 1 | Club provee formato |
| 2 | Compromiso Art. 80 Ley de Armas | 1 | Club provee formato |
| 3 | Acta de Nacimiento | 2 copias | |
| 4 | Cartilla Militar (liberada) | 2 copias | |
| 5 | Registro Federal de Armas (RFA) | 2 copias c/u | Por cada arma |
| 6 | Fotografías color infantil | 4 | |
| 7 | CURP | 2 copias | |
| 8 | RFC | 2 copias | |
| 9 | INE (Credencial elector) | 2 copias | |
| 10 | Comprobante de domicilio | 2 copias | Luz, agua, teléfono, predial |
| 11 | Licencia de Cacería SEMARNAT | 2 copias | Vigente |
| 12 | Constancia Modo Honesto de Vivir | Original + copia | Incluir: fecha inicio laboral, cargo, ingresos |
| 13 | Constancia Antecedentes Penales | Original + copia | https://constancias.oadprs.gob.mx/ |
| 14 | Certificado Médico | Original + copia | Formato oficial |
| 15 | Certificado Toxicológico | Original + copia | Formato oficial |
| 16 | Certificado Psicológico | Original + copia | Formato oficial |

### Cuotas (2025)

| Concepto | Monto |
|----------|-------|
| Inscripción | $2,000.00 MXN |
| Cuota Anual | $6,000.00 MXN |
| FEMETI primer ingreso | $700.00 MXN |
| FEMETI socios | $350.00 MXN |

### Notas Importantes
- **Incluye**: 1 trámite de permiso de transportación
- **NO incluye**: Pago de derechos (forma e5), costos de mensajería
- **NO se acepta**: Documentación digitalizada (solo físicos)
- **Trámite personal**: No enviar intermediarios

### Datos de Contacto del Club
```
Club de Caza, Tiro y Pesca de Yucatán, A.C.
Calle 50 No. 531-E x 69 y 71
Colonia Centro, 97000 Mérida, Yucatán
Tel: +52 56 6582 4667
Email: tiropracticoyucatan@gmail.com

Registros:
- FEMETI: YUC 05/2020
- SEMARNAT: SEMARNAT-CLUB-CIN-005-YUC-05
- SEDENA: 738
```

## Data Sources

### Master Database File
**IMPORTANTE**: La única fuente de verdad para datos de socios y armas es:
```
Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx
```

**Estructura de columnas**:
| Col | Campo |
|-----|-------|
| A | No. REGISTRO DEL CLUB |
| B | DOMICILIO DEL CLUB |
| C | NOMBRE DEL SOCIO (No. CREDENCIAL) |
| D | CURP |
| E | No. CONSEC. DE SOCIO |
| F | DOMICILIO DEL SOCIO |
| G | TELEFONO |
| H | EMAIL |
| I | CLASE |
| J | CALIBRE |
| K | MARCA |
| L | MODELO |
| M | MATRÍCULA |
| N | FOLIO |
| O | ARMAS CORTAS |
| P | ARMAS LARGAS |

**Notas**:
- Cada fila representa un arma (un socio puede tener múltiples filas)
- Los CURPs deben coincidir exactamente con los PDFs en `curp_socios/`
- Los emails deben coincidir con Firebase Auth
- NO usar otros archivos Excel como fuente de datos

### Official Documents (PDFs)
- **CURPs oficiales**: `curp_socios/*.pdf` (76 archivos, nombrados con CURP)
- **Constancias de antecedentes**: Subidas a Firebase Storage en `documentos/{email}/constancia.pdf`
- **CURPs digitalizados**: Subidos a Firebase Storage en `documentos/{email}/curp.pdf`

## Common Gotchas

- Firebase API keys are exposed in source (fine for public web apps, but security rules matter)
- Auth state changes can occur outside the app (other tab sign-out) - `onAuthStateChanged` handles this
- Component unmounting: Always cleanup Firebase listeners (see `return () => unsubscribe()` pattern)
- Forms don't validate email/password strength - rely on Firebase validation
- **CURPs**: Siempre verificar contra PDFs oficiales en `curp_socios/` antes de modificar datos

## Security Guidelines

### Reglas de Seguridad (CRÍTICO)
Las reglas de Firestore y Storage están en:
- `firestore.rules` - Reglas de acceso a base de datos
- `storage.rules` - Reglas de acceso a archivos

**Principio fundamental**: Cada socio SOLO puede acceder a sus propios datos.

### Administrador
El administrador del sistema es **Sergio Muñoz** (`smunozam@gmail.com`).

Privilegios de administrador (vía Firebase Console o scripts con `serviceAccountKey.json`):
- ✅ Crear, modificar y eliminar socios
- ✅ Subir y eliminar documentos de cualquier socio
- ✅ Agregar, modificar y eliminar armas
- ✅ Gestionar usuarios en Firebase Auth (reset passwords, disable accounts)
- ✅ Acceso completo a Firestore y Storage

**NOTA**: Las operaciones de admin se realizan mediante:
1. **Firebase Console** - Para cambios manuales puntuales
2. **Scripts Node.js** - Para operaciones masivas (usar `scripts/serviceAccountKey.json`)

### Firestore Rules Summary
```
socios/{email}           → Solo lectura/escritura por el dueño (email = auth.email)
socios/{email}/armas/*   → Solo lectura por el dueño, NO escritura desde cliente
admin (server-side)      → Acceso total vía Admin SDK con serviceAccountKey
```

### Storage Rules Summary
```
documentos/{email}/*     → Solo acceso por el dueño
                         → Solo PDF, JPG, PNG permitidos
                         → Máximo 5MB por archivo
```

### Datos Sensibles - NUNCA Commitear
Los siguientes archivos contienen datos sensibles y están en `.gitignore`:
- `scripts/serviceAccountKey.json` - Credenciales de admin Firebase
- `credenciales_socios.csv` / `.json` - Emails y contraseñas
- `firebase_auth_import.json` - Datos de autenticación
- `Base datos/*.xlsx` - Información personal de socios
- `curp_socios/*.pdf` - Documentos oficiales de identidad
- `2025. 738. CONSTANCIAS NO ANTECEDENTES/*.pdf` - Documentos legales

### Headers de Seguridad HTTP
Configurados en `firebase.json`:
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-XSS-Protection: 1; mode=block` - Protección XSS legacy
- `Referrer-Policy: strict-origin-when-cross-origin` - Control de referrer

### Validación de Archivos (Cliente + Servidor)
- Tipos permitidos: PDF, JPG, PNG
- Tamaño máximo: 5MB
- Validación en cliente (`DocumentUploader.jsx`) + servidor (Storage Rules)

### Buenas Prácticas
1. **NO** exponer errores de Firebase directamente al usuario en producción
2. **NO** hacer console.log de datos sensibles
3. **SIEMPRE** validar en servidor (reglas), no confiar solo en cliente
4. **SIEMPRE** usar `rel="noopener noreferrer"` en enlaces externos
5. **REVISAR** reglas de seguridad antes de cada deploy con `firebase emulators:start`

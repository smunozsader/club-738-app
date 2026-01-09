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
https://club-738-app.web.app
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
| **SolicitarPETA.jsx** | Autenticado | Formulario para solicitar trámite PETA (hasta 10 armas, 10 estados) |
| **MisPETAs.jsx** | Autenticado | Vista de estado de solicitudes PETA del socio con timeline |
| **VerificadorPETA.jsx** | Solo Secretario | Checklist de verificación de documentos por socio/PETA |
| **ExpedienteImpresor.jsx** | Solo Secretario | Preparar e imprimir documentos digitales del socio |
| **RegistroPagos.jsx** | Solo Secretario | Registro de pagos y activación de membresías |
| **ReporteCaja.jsx** | Solo Secretario | Corte de caja, reporte de pagos con filtros y exportar CSV |
| **DashboardRenovaciones.jsx** | Solo Secretario | Panel de cobranza 2026 |
| **DashboardCumpleanos.jsx** | Solo Secretario | Demografía y cumpleaños de socios |
| **GeneradorPETA.jsx** | Solo Secretario | Generador de oficios PETA en PDF (jsPDF) |
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
```

### Adding Features
1. Crear componente en src/components/ con .jsx y .css pareados
2. Importar Firebase desde firebaseConfig.js (nunca crear nuevas instancias)
3. Para rutas públicas: agregar detector en App.jsx
4. Para features autenticados: agregar en el dashboard

### File Structure
```
src/
├── App.jsx              # Router principal + auth state
├── App.css              # Estilos globales + variables CSS :root
├── firebaseConfig.js    # Firebase initialization
├── main.jsx             # Entry point
├── components/
│   ├── LandingPage.jsx/css      # Página pública de inicio + enlaces SEDENA
│   ├── Login.jsx/css            # Formulario de login
│   ├── CalendarioTiradas.jsx/css # Calendario público
│   ├── CalculadoraPCP.jsx/css   # Calculadora pública
│   ├── MisArmas.jsx/css         # Armas del socio (editable por secretario)
│   ├── MisDocumentosOficiales.jsx/css
│   ├── WelcomeDialog.jsx/css
│   │
│   │  # Módulo PETA (v1.10.0+)
│   ├── SolicitarPETA.jsx/css    # Socio solicita trámite PETA
│   ├── MisPETAs.jsx/css         # Socio ve estado de sus PETAs
│   ├── VerificadorPETA.jsx/css  # Secretario verifica documentos
│   ├── ExpedienteImpresor.jsx/css  # Secretario prepara impresión
│   ├── GeneradorPETA.jsx/css    # Generador de oficios PETA
│   │
│   │  # Módulo Cobranza (v1.10.0+)
│   ├── RegistroPagos.jsx/css    # Registrar pagos de socios
│   ├── ReporteCaja.jsx/css      # Corte de caja / reportes
│   ├── DashboardRenovaciones.jsx/css  # Panel cobranza 2026
│   ├── DashboardCumpleanos.jsx/css    # Demografía socios
│   │
│   ├── documents/       # Componentes de documentos PETA
│   │   ├── DocumentList.jsx/css     # Mi Expediente Digital
│   │   ├── DocumentCard.jsx/css
│   │   ├── DocumentUploader.jsx/css
│   │   ├── ArmasRegistroUploader.jsx/css  # Subida de RFA
│   │   ├── ImageEditor.jsx/css    # Editor de imágenes
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

### Master Database (Fuente de Verdad - Actualizada 31 Dic 2025)

**Archivos CSV Maestros:**
```
data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv  # 77 socios + armas
data/socios/credenciales_socios.csv                        # Credenciales de acceso (77 líneas)
```

**IMPORTANTE**: Estos CSVs son la **única fuente de verdad** para:
- Lista de socios activos (77 total)
- Credenciales de acceso al portal
- Datos de armas registradas
- Emails válidos para envío de comunicaciones

**Archivo Excel original (referencia histórica):**
```
Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx
```

**Estructura de credenciales_socios.csv:**
| Columna | Campo | Descripción |
|---------|-------|-------------|
| No. | Número secuencial | 1-77 |
| Credencial | Número de credencial del club | Ej: 1, 30, 236 |
| Nombre | Nombre completo del socio | MAYÚSCULAS |
| Email | Email de acceso al portal | Único por socio |
| Password | Contraseña temporal | Formato: Club738-{CURP6} o personalizada |

**Estructura de Excel (referencia):**
|---------|-------|
| A | No. REGISTRO DEL CLUB |
| C | NOMBRE DEL SOCIO (No. CREDENCIAL) |
| D | CURP |
| E | No. CONSEC. DE SOCIO |
| H | EMAIL |
| I | CLASE (arma) |
| J | CALIBRE |
| K | MARCA |
| L | MODELO |
| M | MATRÍCULA |
| N | FOLIO |

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
| **Administrador** | smunozam@gmail.com | Acceso total (vía Console/Admin SDK) | Cuenta del secretario (webapp) |
| **Secretario** | smunozam@gmail.com | Lectura de todos los socios, paneles admin | Cuenta del secretario (webapp) |
| **Socio** | {email} | Solo sus propios datos | Todos los socios incluido smunozam@gmail.com |

**IMPORTANTE**: 
- Usuario GitHub: `smunozsader` (SERGIO MUÑOZ SADER) - Solo para desarrollo
- Usuario webapp secretario: `smunozam@gmail.com` - Cuenta de socio + permisos admin
- NO confundir: El nombre del socio con email `smunozam@gmail.com` está registrado en Firestore

### Firestore Rules Summary
```javascript
// Cada socio solo accede a sus datos
match /socios/{email} {
  allow read: if isOwner(email) || isSecretario();
  allow write: if isOwner(email);
}

// Armas: solo lectura para socios
match /socios/{email}/armas/{armaId} {
  allow read: if isOwner(email);
  // Escritura solo via Admin SDK
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
3. **Cleanup de listeners**: Siempre retornar () => unsubscribe() en useEffect
4. **CURPs**: Verificar contra PDFs oficiales en curp_socios/ antes de modificar
5. **Rutas públicas**: Deben detectarse ANTES del check de autenticación en App.jsx

## Calendario de Tiradas 2026

### Tiradas Club 738
11 tiradas confirmadas en /src/data/tiradasData.js:
- Recorrido de Caza (RC): Tirada del Benemérito, Tirada del Padre, etc.
- Tiro Práctico Mexicano (TPM): Competencias mensuales
- Blancos en Movimiento (BM)
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
- [ ] Descarga de credencial desde portal del socio (integrar PDFs generados)
- [ ] Notificaciones de vencimiento de documentos
- [ ] Firma del presidente para credenciales

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

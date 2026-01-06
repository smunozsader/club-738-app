# Changelog - Club 738 Web

Portal de socios del Club de Caza, Tiro y Pesca de Yucatán, A.C.

## [1.10.0] - 2026-01-05

### 🎯 Módulo PETA Completo - Solicitud y Gestión

**MAJOR UPDATE**: Implementación completa del flujo de solicitud de PETAs para socios y verificación para el secretario.

### ✨ Nuevas Funcionalidades

#### Para Socios

**SolicitarPETA.jsx** - Formulario de solicitud
- Solicitar 3 tipos de PETA: Práctica de Tiro, Competencia Nacional, Caza
- Selección de hasta 10 armas del inventario del socio
- Selección de hasta 10 estados (solo Competencia/Caza)
- Domicilio pre-llenado desde Firestore
- Cálculo automático de vigencias según tipo
- Marcador de renovación (ingresar PETA anterior)
- Validación completa de formulario
- Recordatorio de documentos físicos a entregar

**MisPETAs.jsx** - Vista de solicitudes
- Lista de todas las solicitudes PETA del socio
- 6 estados de tracking: documentación en proceso → aprobado/rechazado
- Vista expandible con detalles completos:
  - Armas incluidas con cartuchos
  - Estados autorizados
  - Historial de cambios con timeline
  - Próximos pasos según estado
- Resumen rápido: fecha, armas, estados, vigencia
- Botón "Solicitar Nuevo PETA"

#### Para Secretario

**VerificadorPETA.jsx** - Checklist de verificación
- Panel con todas las solicitudes PETA de socios
- Búsqueda de socios por nombre/email
- Checklist de documentos digitales (10 docs)
- Checklist de documentos físicos (9-11 docs según tipo)
- Documentos dinámicos según tipo PETA (caza + licencia, renovación + PETA anterior)
- Progreso de verificación en %
- Notas del secretario
- Acciones:
  - Guardar progreso de verificación
  - Marcar como "Documentación Completa"
  - Rechazar solicitud (con motivo)
- Links directos a PDFs de documentos digitales

**RegistroPagos.jsx** - Módulo de cobranza
- Registro de pagos de cuota anual 2026
- Conceptos:
  - Cuota Anual: $6,000
  - FEMETI Socio: $350
  - Inscripción (nuevos): $2,000
  - FEMETI Nuevo: $700
- Auto-detección de socio nuevo vs existente
- 4 métodos de pago: Efectivo, Transferencia, Tarjeta, Cheque
- Generación automática de número de recibo
- Activación de membresía 2026
- Historial de pagos por socio
- Indicadores visuales: ✅ Pagado 2026 / ⏳ Pendiente

### 🗄️ Estructura Firestore

**Nueva colección**: `socios/{email}/petas/{petaId}`
```javascript
{
  tipo: 'tiro' | 'competencia' | 'caza',
  estado: 'documentacion_proceso' | 'documentacion_completa' | 'enviado_32zm' | 'revision_sedena' | 'aprobado' | 'rechazado',
  fechaSolicitud: Timestamp,
  vigenciaInicio: Timestamp,
  vigenciaFin: Timestamp,
  armasIncluidas: [{ clase, marca, calibre, matricula, cartuchos }],
  estadosAutorizados: ['Yucatán', 'Campeche', ...],
  domicilio: { calle, colonia, cp, municipio, estado },
  esRenovacion: boolean,
  petaAnteriorNumero: string,
  verificacionDigitales: { curp: true, ine: true, ... },
  verificacionFisicos: { 'foto-peta': true, ... },
  notasSecretario: string,
  historial: [{ estado, fecha, usuario, notas }],
  numeroPeta: string, // Asignado por SEDENA
  motivoRechazo: string // Si rechazado
}
```

**Nuevos campos en** `socios/{email}`:
```javascript
{
  pagos: [{ fecha, conceptos, total, metodoPago, numeroRecibo }],
  membresia2026: { activa: true, fechaPago, monto, metodoPago, numeroRecibo }
}
```

### 🎨 Componentes CSS

- `SolicitarPETA.css` - Formulario responsivo con grid layout
- `MisPETAs.css` - Cards expandibles con timeline de estados
- `VerificadorPETA.css` - Layout de 2 columnas (lista + verificación)
- `RegistroPagos.css` - Formulario de pagos con total dinámico

### 📱 Integración en App.jsx

**Dashboard del Socio**:
- Nueva card: "Mis PETAs" 🎯

**Panel del Secretario**:
- Nueva card: "Verificador PETA" ✅
- Nueva card: "Registro de Pagos" 💰

### 📚 Documentación

**MANUAL_USUARIO.md** - Manual completo de 5 pasos:
1. Completar Expediente Digital
2. Solicitar PETA
3. Entregar Documentos Físicos (checklist)
4. Realizar Pago y Activar Membresía
5. Recibir Credencial Firmada

Incluye:
- Tabla de 16 documentos requeridos
- Tipos de PETA y vigencias
- Cuotas 2026
- Estados del trámite
- Preguntas frecuentes
- Contactos y soporte

### 🔧 Notas Técnicas

- Estados de México: Array de 32 estados
- Validación de máximo 10 armas por PETA
- Validación de máximo 10 estados por PETA
- Cálculo automático de vigencias:
  - Tiro/Competencia: Fecha solicitud + 15 días → 31 Dic
  - Caza: 1 Jul → 30 Jun (año siguiente)
- Real-time listeners en colección `petas`
- Historial de cambios con arrayUnion

### 🐛 Fixes

- Distinción clara en documentación entre usuario GitHub (`smunozsader`) y usuario webapp secretario (`smunozam@gmail.com`)

---

## [1.0.0] - 2026-01-03

### 🎯 Primera versión estable

Esta versión marca el lanzamiento oficial del portal de socios con funcionalidad completa para gestión de documentos PETA.

### ✨ Funcionalidades Principales

#### Autenticación
- Login/registro con Firebase Auth (email/password)
- 76 socios registrados en el sistema
- Sesiones persistentes con `onAuthStateChanged`

#### Sistema de Documentos PETA (14 tipos)
Organizados en 6 categorías:

| Categoría | Documentos |
|-----------|------------|
| 📋 Identificación | INE, CURP, Cartilla/Acta Nacimiento, Comprobante Domicilio |
| 🏥 Médicos | Certificado Médico, Psicológico, Toxicológico |
| ⚖️ Legales | Antecedentes Penales, Modo Honesto de Vivir |
| 🎯 Armas | Licencia de Caza, Registros de Armas (RFA) |
| 📷 Fotos | Fotografías (fondo blanco, infantil) |
| 💳 Pago | Recibo e5cinco |

#### Upload de Documentos
- Drag & drop con validación de archivos
- Soporte PDF, JPG, PNG (máx 5MB)
- **Conversión automática de imágenes a PDF** (jsPDF)
- **Soporte HEIC de iOS** (heic2any)
- **Multi-imagen**: INE frente/reverso combinados en 1 PDF
- Progress bar durante upload
- Preview de documentos subidos

#### Mis Documentos Oficiales
- Visualización de CURP oficial del club
- Visualización de Constancia de Antecedentes Penales
- Visor PDF integrado con fallback a descarga

#### Mis Armas
- Listado de armas registradas desde Firestore
- Datos: Clase, Calibre, Marca, Modelo, Matrícula, Folio
- Soporte para armas cortas y largas

#### UI/UX
- Diseño responsive optimizado para móvil
- Colores institucionales (verde #1a472a, dorado #c9a227)
- Animaciones suaves en transiciones
- Footer con redes sociales y registros oficiales

### 🔒 Seguridad
- Reglas de Firestore: cada socio solo accede a sus datos
- Reglas de Storage: archivos en `documentos/{email}/`
- Validación de tipos MIME en cliente y servidor
- Headers de seguridad HTTP configurados

### 🛠️ Stack Técnico
- **Frontend**: React 18.2 + Vite 5.0
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting
- **Librerías**: jsPDF, heic2any, xlsx

---

## [0.3.0] - 2026-01-03

### Added
- MultiImageUploader para fotos de iPhone
- Conversión HEIC → JPG → PDF automática
- Optimización CSS para móvil
- Soporte multi-foto para INE (frente + reverso)

### Fixed
- Corregido userId: cambiado de `user.uid` a `user.email` para coincidir con Storage rules
- Corregido nombre de archivo constancia_antecedentes.pdf

---

## [0.2.0] - 2026-01-02

### Added
- Expandido sistema de documentos de 8 a 14 tipos
- Categorías de documentos PETA
- Nuevo logo del club
- Documentación de requisitos PETA en copilot-instructions.md

---

## [0.1.0] - 2026-01-01

### Added
- Sistema base de autenticación Firebase
- Dashboard con secciones principales
- Componente DocumentUploader con drag & drop
- Componente MisArmas
- Componente MisDocumentosOficiales
- Scripts de migración de datos (CURP, constancias)
- Reglas de seguridad Firestore y Storage

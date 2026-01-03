# Changelog - Club 738 Web

Portal de socios del Club de Caza, Tiro y Pesca de Yucatán, A.C.

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

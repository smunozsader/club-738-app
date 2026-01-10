# Módulo de Gestión de Arsenal

## Descripción General

Módulo que permite a los socios reportar bajas de armas de su arsenal y al secretario gestionar estas solicitudes, generando los avisos correspondientes a 32 Zona Militar y DN27 (Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos).

## Caso de Uso

**Problema identificado:**
- Socios tienen armas duplicadas en el portal
- Armas vendidas que siguen apareciendo en su arsenal
- Transferencias familiares (esposa, hijos) no reflejadas
- Falta de trazabilidad de bajas ante autoridades

**Solución implementada:**
- Portal de autogestion para socios
- Workflow de aprobación para secretario
- Generación de oficios para autoridades
- Notificaciones para socios receptores

## Componentes Implementados

### 1. GestionArsenal.jsx (Portal del Socio)

**Ruta:** `/Applications/club-738-web/src/components/GestionArsenal.jsx`

**Funcionalidades:**
- ✅ Vista de arsenal completo del socio
- ✅ Formulario de reporte de baja con validación
- ✅ Motivos de baja:
  - 💰 Venta
  - 👥 Transferencia familiar
  - ❓ Extravío
  - ⚠️ Robo
  - 🔨 Destrucción
- ✅ Captura de datos del receptor (si aplica)
- ✅ Detección automática de socios del club
- ✅ Registro opcional de transferencia SEDENA
- ✅ Vista de solicitudes pendientes

**Campos del Formulario:**

#### Datos de la Baja
```javascript
{
  motivo: string, // 'venta' | 'transferencia' | 'perdida' | 'robo' | 'destruccion'
  fechaBaja: date,
  observaciones: string
}
```

#### Datos del Receptor (solo venta/transferencia)
```javascript
{
  nombreReceptor: string,        // Nombre completo
  curpReceptor: string,          // CURP (opcional)
  esSocioClub: boolean,          // Si es socio del club
  emailReceptor: string          // Email (si es socio)
}
```

#### Registro SEDENA (opcional)
```javascript
{
  folioTransferencia: string,           // Ej: A3892689
  zonaMillitarTransferencia: string,    // Ej: 32
  fechaTransferencia: date
}
```

**Firestore Structure:**
```
socios/{email}/solicitudesBaja/{solicitudId}
├── armaId: string
├── armaDetalles: object
│   ├── clase: string
│   ├── calibre: string
│   ├── marca: string
│   ├── modelo: string
│   ├── matricula: string
│   └── folio: string
├── motivo: string
├── fechaBaja: date
├── observaciones: string
├── receptor: object (opcional)
│   ├── nombre: string
│   ├── curp: string
│   ├── esSocioClub: boolean
│   └── email: string
├── transferencia: object (opcional)
│   ├── folio: string
│   ├── zonaMilitar: string
│   └── fecha: date
├── estado: string // 'pendiente' | 'aprobada' | 'procesada'
├── fechaSolicitud: timestamp
├── solicitadoPor: string
└── nombreSolicitante: string
```

### 2. AdminBajasArsenal.jsx (Panel del Secretario)

**Ruta:** `/Applications/club-738-web/src/components/AdminBajasArsenal.jsx`

**Funcionalidades:**
- ✅ Dashboard de solicitudes con contadores
- ✅ Filtros por estado (pendiente, aprobada, procesada)
- ✅ Vista detallada de cada solicitud en modal
- ✅ Aprobar/rechazar solicitudes
- ✅ Marcar como procesada
- 🚧 Generación de oficio para 32 ZM (placeholder)
- 🚧 Generación de oficio para DN27 (placeholder)
- ✅ Notificación automática a socio receptor (si aplica)

**Estados de Solicitud:**

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|----------------------|
| `pendiente` | Recién creada por socio | ✅ Aprobar |
| `aprobada` | Aprobada por secretario | 📄 Generar oficios, ✔️ Marcar procesada |
| `procesada` | Tramitada ante autoridades | (Solo lectura) |

**Workflow:**

```
[Socio] Reporta baja
   ↓
[pendiente]
   ↓
[Secretario] Revisa y aprueba
   ↓
[aprobada]
   ↓
[Secretario] Genera oficios 32 ZM + DN27
   ↓
[Secretario] Marca como procesada
   ↓
[procesada]
   ↓
Si receptor es socio → Notificación automática
```

## Integración en App.jsx

### Dashboard del Socio

**Nueva tarjeta agregada:**
```jsx
<div className="dash-card arsenal" onClick={() => setActiveSection('gestion-arsenal')}>
  <div className="dash-card-icon">📦</div>
  <h3>Gestión de Arsenal</h3>
  <p>Reporta bajas, ventas o transferencias de armas</p>
  <span className="dash-card-cta">Actualizar arsenal →</span>
</div>
```

### Panel del Secretario

**Nueva tarjeta admin:**
```jsx
<div className="dash-card admin bajas-arsenal" onClick={() => setActiveSection('admin-bajas-arsenal')}>
  <div className="dash-card-icon">📦</div>
  <h3>Gestión de Bajas</h3>
  <p>Administrar solicitudes de baja de armas</p>
  <span className="dash-card-cta">Ver solicitudes →</span>
</div>
```

## Campos del Formato SEDENA Analizados

**PDF Analizado:**
`/Applications/club-738-web/armas_socios/H. REGISTRO. TIRO. CZ RIFLE 600 ALPHA .223 J032612.pdf`

**Campos identificados vía OCR:**

### Datos del Manifestante
- Apellido Paterno
- Apellido Materno
- Nombre(s)
- Fecha de Nacimiento
- Sexo
- CURP
- Nacionalidad
- Profesión/Oficio/Ocupación
- Lee/Escribe

### Domicilio
- Calle
- Número Exterior
- Número Interior
- Código Postal
- Colonia
- Municipio/Delegación
- Entidad Federativa
- Ciudad/Población/Localidad

### Datos del Arma
- Tipo/Clase (RIFLE DE REPETICION)
- Calibre (.223" REM)
- Marca (CESKA ZBROJOVKA)
- Modelo (CZ 600 ALPHA)
- Matrícula (J032612)
- Registro Anterior
- Uso del Arma (TIRO DEPORTIVO)
- Tipo de Manifestación (INICIAL)

### Datos de Recepción
- Número de Folio (A3892689)
- Zona Militar
- Fecha de Manifestación
- Firma del Manifestante

## Pendientes de Implementación

### Generadores de Oficios

#### 1. Oficio 32 Zona Militar (Valladolid)
**Función placeholder:** `generarOficioZM()`

**Datos requeridos:**
- Datos del socio vendedor
- Datos del arma
- Motivo de la baja
- Datos del receptor (si aplica)
- Fecha de la transacción

**Formato:** PDF oficial con membrete del club

#### 2. Oficio DN27
**Función placeholder:** `generarOficioDN27()`

**Destinatario:** Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos

**Datos requeridos:**
- Similares al oficio 32 ZM
- Número de folio SEDENA del registro
- Copias de documentación soporte

**Formato:** PDF oficial con membrete del club

## Caso de Prueba: Joaquin Gardoni

**Tesorero del club con situación compleja:**

```
Joaquin Gardoni (tesorero)
📧 joaquingardoni@gmail.com

Armas que requieren gestión:

1. Shadow 2 DP25087 - NO APARECE EN PORTAL
   Acción: Agregar manualmente

2. Grand Power LP 380 K084384 - Vendida a Daniel Manrique
   Acción: Reportar baja + alta en arsenal de Daniel

3. Grand Power LP 380 K084385 - Vendida a Jose Alberto Manrique
   Acción: Reportar baja + alta en arsenal de Jose Alberto

Transferencias a esposa:
MARIA FERNANDA GUADALUPE ARECHIGA RAMOS
- Pistola CZ P07 C647155
- Grand Power LP380 K078999
- Grand Power LP380 K084328

Acción: Reportar transferencias + alta en arsenal de esposa
```

## Próximos Pasos

1. **Implementar generadores de oficios PDF**
   - Template 32 ZM con jsPDF
   - Template DN27 con jsPDF
   - Integrar datos dinámicos

2. **Agregar subida de documentación soporte**
   - Comprobante de venta
   - Acta de transferencia familiar
   - Denuncia de robo/extravío

3. **Dashboard de estadísticas**
   - Bajas por mes/año
   - Motivos más comunes
   - Tiempo promedio de procesamiento

4. **Notificaciones automáticas**
   - Email al aprobar solicitud
   - Email al marcar como procesada
   - Recordatorios de documentación faltante

5. **Exportación de reportes**
   - CSV de bajas procesadas
   - Reporte anual para SEDENA
   - Estadísticas para junta directiva

## Referencias Legales

### Ley Federal de Armas de Fuego y Explosivos

**Artículo 7:**
> El propietario de armas tiene obligación de dar aviso a la Secretaría de la Defensa Nacional dentro de un plazo de 30 días naturales de cualquier cambio de domicilio, extravío, robo, destrucción o enajenación de armas.

**Artículo 24:**
> Los poseedores de armas de fuego tendrán la obligación de dar aviso a la Secretaría de la Defensa Nacional de cualquier cambio que se opere en relación con las mismas.

### Autoridades Competentes

**32 Zona Militar - Valladolid, Yucatán**
- Registro y trámites locales
- Verificación de documentación

**DN27 - Dirección General del Registro Federal de Armas de Fuego**
- Ciudad de México
- Registro nacional
- Expedición de permisos

## Archivos Relacionados

```
src/components/
├── GestionArsenal.jsx          # Portal del socio
├── GestionArsenal.css          # Estilos del portal
├── AdminBajasArsenal.jsx       # Panel admin
└── AdminBajasArsenal.css       # Estilos admin

docs/
└── GESTION_ARSENAL.md          # Este archivo

armas_socios/
├── H. REGISTRO. TIRO. CZ RIFLE 600 ALPHA .223 J032612.pdf
├── gardoni Listado registros armas a enero 2026.docx
└── registro_ocr_output.txt     # Output OCR del PDF
```

## Changelog

### v1.14.0 - 10 Enero 2026
- ✅ Creado módulo GestionArsenal.jsx (portal del socio)
- ✅ Creado AdminBajasArsenal.jsx (panel admin)
- ✅ Integración en App.jsx
- ✅ OCR del formato SEDENA de registro
- ✅ Estructura Firestore para solicitudes
- ✅ Estados de workflow implementados
- 🚧 Generadores de oficios (pendiente)
- 📋 Documentación completa

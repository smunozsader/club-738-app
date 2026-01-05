# Módulo PETA - Esquema de Datos y Flujo

## Tipos de PETA

### 1. Práctica de Tiro
- **Vigencia**: Enero (o fecha solicitud) → 31 Diciembre del mismo año
- **Propósito**: Practicar en campo de tiro del club
- **No requiere**: Lista de estados

### 2. Competencia Nacional  
- **Vigencia**: Enero (o fecha solicitud) → 31 Diciembre del mismo año
- **Propósito**: Competir en eventos del calendario FEMETI autorizados por DN27
- **Requiere**: Lista de hasta 10 estados donde competirá

### 3. Caza
- **Vigencia**: 1 Julio (o fecha solicitud) → 30 Junio del año siguiente
- **Propósito**: Transportar armas a cotos de caza o UMAs autorizados por SEMARNAT
- **Requiere**: Lista de hasta 10 estados donde cazará
- **Requiere**: Licencia de caza vigente (SEMARNAT)

---

## Datos del Club (constantes)

```javascript
const DATOS_CLUB = {
  nombre: 'CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.',
  registroSEDENA: '738',
  presidente: 'LIC. RICARDO J. FERNÁNDEZ Y GASQUE',
  campoTiro: {
    descripcion: 'CAMPO DE TIRO DEL CLUB DE CAZA TIRO Y PESCA DE YUCATÁN AC',
    ubicacion: 'KM 7.5 DE LA CARRETERA FEDERAL 281, TRAMO HUNUCMÁ - SISAL',
    municipio: 'HUNUCMÁ',
    estado: 'YUCATÁN',
    googleMaps: 'https://maps.app.goo.gl/AcpqoDN9wN8g8r1Q6'
  }
};
```

---

## Documentos Requeridos para PETA

| # | Documento | Tipo | Notas |
|---|-----------|------|-------|
| 1 | Carta modo honesto de vivir | Original | |
| 2 | Cartilla Militar liberada | Copia | Mujeres: Acta de nacimiento |
| 3 | Certificado médico no impedimento | Original | |
| 4 | Certificado médico-psicológico | Original | |
| 5 | Certificado toxicológico | Original | |
| 6 | Constancia antecedentes penales | Original | https://constancias.oadprs.gob.mx/ |
| 7 | Comprobante de domicilio | Original | |
| 8 | Licencia de caza SEMARNAT | Copia | **Solo para modalidad Caza** |
| 9 | Credencial del club vigente | Copia | |
| 10 | Solicitud formato club | Original | Generado por sistema |
| 11 | Registros de armas (RFA) | Copias | Máximo 10 armas por PETA |
| 12 | Recibo pago e5cinco | Original | |
| 13 | Fotografía color fondo blanco | Infantil | 1 por cada PETA |
| 14 | PETA anterior | Original | **Solo renovaciones** |

---

## Estados del Trámite PETA

```
documentacion_proceso  → Socio recopilando documentos
documentacion_completa → Todos los documentos listos
enviado_32zm          → Entregado en 32 Zona Militar (Valladolid)
revision_sedena       → En proceso de revisión DN27
aprobado              → PETA emitido ✅
rechazado             → Rechazado (con motivo)
```

---

## Estructura Firestore

```javascript
// Colección: socios/{email}/petas/{petaId}
{
  tipo: 'practica' | 'competencia' | 'caza',
  estado: 'documentacion_proceso' | 'documentacion_completa' | 'enviado_32zm' | 'revision_sedena' | 'aprobado' | 'rechazado',
  
  // Vigencia
  fechaSolicitud: Timestamp,
  vigenciaInicio: Timestamp,
  vigenciaFin: Timestamp,
  
  // Para competencia/caza
  estadosAutorizados: ['Yucatán', 'Campeche', ...], // máx 10
  
  // Armas incluidas (máx 10)
  armasIncluidas: [
    { clase: 'Escopeta', marca: 'Benelli', calibre: '12', matricula: 'XXX', cartuchos: 200 },
    ...
  ],
  
  // Tracking
  nps: string,                    // Número Personal de Socio
  petaAnteriorNumero: string,     // Para renovaciones
  
  // Documentos subidos
  documentos: {
    recibo_e5cinco: { url, fecha, verificado },
    foto: { url, fecha, verificado },
    ...
  },
  
  // Historial de estados
  historial: [
    { estado: 'documentacion_proceso', fecha: Timestamp, usuario: email },
    { estado: 'enviado_32zm', fecha: Timestamp, usuario: 'secretario@...', notas: 'Folio #123' },
    ...
  ],
  
  // Si rechazado
  motivoRechazo: string,
  
  // Resultado final
  numeroPeta: string,             // Número asignado por SEDENA
  fechaEmision: Timestamp,
  
  // Metadata
  creadoPor: email,
  fechaCreacion: Timestamp,
  ultimaActualizacion: Timestamp
}
```

---

## Formato Oficio Solicitud PETA

### Encabezado (igual para los 3 tipos)
```
SECRETARÍA DE LA DEFENSA NACIONAL
DIRECCIÓN GENERAL DEL REGISTRO FEDERAL DE ARMAS DE FUEGO Y CONTROL DE EXPLOSIVOS
SOLICITUD DE PERMISO EXTRAORDINARIO PARA LA PRÁCTICA DE CAZA, TIRO Y/O COMPETENCIA
```

### Sección 1: Datos del Club
- Nombre: CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.
- No. Reg. SEDENA: 738

### Sección 2: Datos del Solicitante
- NPS (Número Personal de Socio)
- No. PETA Anterior (solo renovaciones, ej: "S-1/M-4/86")
- Nombre completo
- Calle
- Colonia
- C.P.
- Delegación/Municipio, Estado

### Sección 3: Tipo de Actividad
```
TIPO DE ACTIVIDAD.
CAZA(   )    TIRO(   )    COMPETENCIA NACIONAL(   )
```
Se marca con **X** solo una opción:
- `CAZA( X )` - Para permisos de cacería
- `TIRO( X )` - Para práctica en campo de tiro
- `COMPETENCIA NACIONAL( X )` - Para competencias FEMETI

### Sección 4: Periodo de Vigencia
- Fecha inicio (mínimo 15 días después de solicitud)
- Fecha fin
- Formato: `15OCT2025 AL 31DIC2025`

### Sección 5: Armas (máx 10)
| ORD | CLASE | CALIBRE | MARCA | MATRÍCULA | CARTUCHOS |
|-----|-------|---------|-------|-----------|-----------|
| 1 | PISTOLA | .380" | CESKA ZBROJOVKA | FP41102 | 200 |
| 2 | RIFLE | .22" L.R. | CESKA ZBROJOVKA | J002602 | 1000 |
| ... | | | | | |

### Sección 6: Destino/Estados (VARÍA según tipo)

#### Para PRÁCTICA DE TIRO:
```
PARA EL CAMPO DE TIRO DEL CLUB DE CAZA TIRO Y PESCA DE YUCATÁN AC, 
SITO EN EL KM 7.5 DE LA CARRETERA FEDERAL 281, TRAMO HUNUCMÁ - SISAL, 
MUNICIPIO HUNUCMÁ, YUCATÁN.
```

#### Para COMPETENCIA NACIONAL:
```
POR SER DE PETA DE COMPETENCIA NACIONAL SE SOLICITAN LOS SIGUIENTES ESTADOS (MÁXIMO 10)
1. Yucatán
2. Baja California
3. Coahuila
... (hasta 10)
```

#### Para CAZA:
```
SI LA ACTIVIDAD ES DE CACERÍA ESPECIFIQUE LOS ESTADOS DONDE LA PRACTICARA (MÁXIMO 10)
1. Yucatán
2. Sonora
3. Campeche
... (hasta 10)
```

### Sección 7: Firma
```
LUGAR Y FECHA DE LA SOLICITUD      Mérida, Yucatán a 07 de OCTUBRE de 2025

ATENTAMENTE.
SUFRAGIO EFECTIVO, NO REELECCIÓN

LIC. RICARDO J. FERNÁNDEZ Y GASQUE
PRESIDENTE DEL CLUB.
```

---

## Estados de México (para selector)

```javascript
const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas'
];
```

---

## Flujo de Trabajo

### Para el Socio:
1. Solicitar nuevo PETA (seleccionar tipo)
2. Elegir armas a incluir (de sus armas registradas)
3. Si es caza/competencia: seleccionar estados
4. Subir documentos faltantes
5. Ver estado del trámite

### Para el Secretario:
1. Ver solicitudes pendientes
2. Verificar documentación completa
3. Generar oficio de solicitud (PDF)
4. Marcar como "Enviado a 32 ZM"
5. Actualizar estado según avance
6. Registrar aprobación/rechazo

---

## Alertas y Notificaciones

### Al Socio:
- PETA próximo a vencer (30 días antes)
- Cambio de estado en trámite
- Documentos faltantes

### Al Secretario:
- Nuevas solicitudes de PETA
- Solicitudes con documentación completa
- PETAs por vencer de socios

---

## Reportes

- PETAs activos por tipo
- PETAs por vencer este mes
- Historial de trámites por socio
- Estadísticas de aprobación/rechazo

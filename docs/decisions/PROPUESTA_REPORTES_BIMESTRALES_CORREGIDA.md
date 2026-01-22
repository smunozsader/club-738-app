# 📊 ANÁLISIS CORREGIDO: Reportes Bimestrales SEDENA

## 🎯 ESTRUCTURAS REALES IDENTIFICADAS

### 1️⃣ **RELACIÓN DE SOCIOS Y ARMAS** (Detallada por Arma)

**Encabezado & Metadata**
```
CAMPO DE TIRO UBICADO EN: CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.
No. REGISTRO SEDENA: 738
DOMICILIO: CALLE 50 No. 531-E x 69 y 71, COLONIA CENTRO, MÉRIDA, YUC.
FECHA DE REPORTE: 28 de FEBRERO de 2025
```

**Estructura de Datos (Una fila por ARMA)**
```
CREDENCIAL | NOMBRE              | CURP            | ARMA           | MARCA    | MODELO  | MATRICULA | CALIBRE | etc...
-----------|---------------------|-----------------|----------------|----------|---------|-----------|---------|--------
222        | IVAN TSUIS CABO     | TSUI850315...   | RIFLE HUNTING  | REMINGTON| 700     | XY123456  | .22 LR  | ...
222        | (BLANCO)            | (BLANCO)        | PISTOLA .380   | BERETTA  | M85     | AB456789  | .380    | ...
222        | (BLANCO)            | (BLANCO)        | ESCOPETA       | MOSSBERG | 500     | CD789012  | .410    | ...
[ROW ROJO] | TOTAL POR SOCIO: 3 ARMAS
-----------|---------------------|-----------------|----------------|----------|---------|-----------|---------|--------
223        | JOAQUIN GARDONI     | GARD500125...   | CARABINA       | SAKO      | L579    | EF012345  | .308    | ...
223        | (BLANCO)            | (BLANCO)        | PISTOLA .380   | COLT     | MUSTANG | GH345678  | .380    | ...
[ROW ROJO] | TOTAL POR SOCIO: 2 ARMAS
```

**Características clave:**
- ✅ Una fila POR ARMA (no por socio)
- ✅ Primera arma del socio: Credencial, Nombre, CURP en NEGRO
- ✅ Armas 2+: Credencial, Nombre, CURP en **TEXTO BLANCO** (invisible en impresión)
- ✅ Fila "TOTAL POR SOCIO" en **FONDO ROJO** con suma de armas

---

### 2️⃣ **ANEXO A** (Resumen Socios con Conteos)

**Estructura simple: 1 Fila = 1 Socio**
```
No. DE REGISTRO | NOMBRE SOCIO        | CURP            | No. DE SOCIO | ARMAS CORTAS | ARMAS LARGAS | TELÉFONO | CORREO
----------------|---------------------|-----------------|--------------|--------------|--------------|----------|--------
738             | RICARDO JESUS FZ... | FEGR350218...   | 1            | 2            | 1            | 999...   | email...
738             | JOSE JACINTO LIZA.. | LIZJ750609...   | 30           | 3            | 2            | 999...   | email...
738             | ADOLFO XACUR RIVE.. | XARA661008...   | 31           | 4            | 2            | 999...   | email...
```

**Características:**
- ✅ **UNA FILA POR SOCIO** (no por arma)
- ✅ Columnas: Registro (738), Nombre, CURP, No. Socio, Armas Cortas (cantidad), Armas Largas (cantidad)
- ✅ Datos de contacto: Teléfono, Correo
- ✅ Resumen simple y legible

---

### 3️⃣ **ANEXO B** (Cédula General de Totales)

**Estructura: Tabla resumen muy compacta**
```
CANTIDADES DE CLUBES REGISTRADOS

No. DE REGISTRO | NOMBRE DEL CLUB                    | CANTIDAD DE SOCIOS | ARMAS CORTAS | ARMAS LARGAS
----------------|------------------------------------|--------------------|--------------|-------------
738             | CLUB DE CAZA TIRO Y PESCA YUCATÁN  | 76                 | XX           | YY
```

**Características:**
- ✅ **UNA SOLA FILA DE DATOS** (resumen del club)
- ✅ **DINÁMICO**: Campos calculados (FÓRMULAS):
  - CANTIDAD DE SOCIOS: `=COUNTA(Anexo A col D)` 
  - ARMAS CORTAS: `=SUM(Anexo A col E)`
  - ARMAS LARGAS: `=SUM(Anexo A col F)`
- ✅ **SE ACTUALIZA AUTOMÁTICO** si Anexo A cambia
- ✅ Es una CÉDULA, no una lista

---

### 4️⃣ **ANEXO C** (Información del Club + Totales)

**Estructura: Información del club + Fórmulas de Totales**
```
No. P.G. | RAZÓN SOCIAL                      | DOMICILIO DEL CLUB               | TELÉFONO      | TOTAL SOCIOS | ARMAS CORTAS | ARMAS LARGAS
---------|-----------------------------------|----------------------------------|---------------|--------------|--------------|-------------
1        | CLUB DE CAZA, TIRO Y PESCA YUCATÁN| Calle 50 No. 531-E x 69 y 71    | 999 947 0480  | 76           | XX           | YY
```

**Columnas estáticas (Información del Club):**
- No. P.G.
- Razón Social
- Domicilio
- Teléfono
- RFC
- Registro SEDENA
- Autorización de funcionamiento
- Campos de tiro autorizados

**Columnas dinámicas (FÓRMULAS de Anexo A):**
- TOTAL SOCIOS: `=COUNTA(Anexo A col D)`
- ARMAS CORTAS: `=SUM(Anexo A col E)`
- ARMAS LARGAS: `=SUM(Anexo A col F)`

**Características:**
- ✅ **DINÁMICO**: Las columnas de totales tienen fórmulas
- ✅ Información del club (mayormente estática)
- ✅ Totales de socios y armas (dinámicos)
- ✅ **SE ACTUALIZA AUTOMÁTICO** con cada cambio en Anexo A
- ✅ Se reutiliza todo el bimestre (los datos cambian automático si hay cambios en Firebase)

---

## 🔄 Relación entre Reportes

```
FIREBASE (datos normalizados)
├─ Socios (nombre, CURP, CREDENCIAL, CONTACTO)
└─ Armas (credencial, clase, marca, modelo, calibre, etc)

        ↓↓↓

RELACIÓN (Detallada por arma)
├─ Una fila por arma
├─ Credencial + Nombre BLANCO en armas 2+ (invisible)
├─ Datos de arma: CLASE, MARCA, MODELO, CALIBRE, etc. (NEGROS - visibles)
└─ Filas ROJAS de TOTAL

        ↓↓↓

ANEXO A (Resumen por socio)
├─ Una fila por socio
├─ Conteo de armas cortas vs largas
└─ Datos de contacto

        ↓↓↓ (lee Anexo A)

ANEXO B (Cédula de totales)
├─ Una sola fila
├─ Fórmulas que leen Anexo A
└─ Totales generales del club

        ↓↓↓ (lee Anexo A)

ANEXO C (Info club + Totales)
├─ Una fila: Datos estáticos del club
├─ Columnas de totales con fórmulas (leen Anexo A)
└─ Autorización y legalidad
```

---

## 📈 Ciclos de Actualización

| Componente | Actualización | Frecuencia | Cambios por |
|-----------|---------------|-----------|-----------|
| RELACIÓN | Cada bimestre | Feb, Abr, Jun, Ago, Oct, Dic | Altas/Bajas socios + Cambios armamento |
| ANEXO A | Cada bimestre | Ídem | Ídem |
| ANEXO B | Cada bimestre | Ídem | Automático (fórmulas de Anexo A) |
| ANEXO C | Cada bimestre | Ídem | Automático (fórmulas de Anexo A) |

**Nota**: TODOS son dinámicos y se actualizan desde la RELACIÓN

---

## 💾 Datos Requeridos en Firebase

### `socios/{email}` (documento principal)
```javascript
{
  email: "socio@email.com",
  nombre: "IVAN",
  apellidoPaterno: "TSUIS",
  apellidoMaterno: "CABO",
  curp: "TSUI850315HYCXXX01",
  credencial: 222,
  noSocio: 1,  // número interno
  
  // Contacto
  telefono: "+34 999-123-4567",
  correo: "socio@email.com",
  
  // Estatus
  estado: "activo" | "baja",
  fechaAlta: Timestamp,
  fechaBaja: Timestamp || null
}
```

### `socios/{email}/armas/{armaId}` (subcollection)
```javascript
{
  // Clasificación
  clase: "RIFLE HUNTING",  // Tipo general
  tipo: "RIFLE" | "ESCOPETA" | "PISTOLA",  // Para anexos
  
  // Descripción técnica
  marca: "REMINGTON",
  modelo: "MODEL 700",
  matricula: "XY123456",
  calibre: ".22 LR",
  
  // Registro SEDENA
  folio: "RFA-2020-03456",
  
  // Modalidad
  modalidad: "CAZA" | "TIRO" | "AMBAS",
  
  // Control
  fechaRegistro: Timestamp,
  estado: "activa" | "baja",
  fechaBaja: Timestamp || null
}
```

---

## 🛠️ Componentes React a Crear

### 1. **ReportesBimestrales.jsx** (Panel Principal)
- Selector de bimestre/año
- Botones para generar cada reporte
- Estado: Draft / Generado / Enviado

### 2. **GeneradorRelacionSocios.jsx**
- Lee Firebase
- Agrupa por socio, lista armas por arma
- **IMPORTANTE**: Aplica texto BLANCO en repeticiones (ej: Credencial, Nombre en armas 2+)
- Genera EXCEL con estilos
- Convierte a PDF

### 3. **GeneradorAnexoA.jsx**
- Extrae datos de Firebase
- Calcula: Armas Cortas, Armas Largas por socio
- Una fila por socio
- Genera EXCEL

### 4. **GeneradorAnexoB.jsx**
- Crea tabla de resumen
- **FÓRMULAS** que leen Anexo A (no datos estáticos)
- Genera automático

### 5. **GeneradorAnexoC.jsx**
- Datos estáticos del club + Fórmulas dinámicas
- Información de autorizaciones
- Se genera automático en TODOS los bimestres
- Fórmulas actualizan con cada cambio en Firebase

### 6. **RegistroReportesBimestrales.jsx**
- Historial de reportes generados
- Descargas
- Cambiar estado (generado → enviado)

---

## 🎨 Detalle Técnico: Texto Blanco Invisible (SOLO EN RELACIÓN)

### Importante: ¿DÓNDE se aplica texto blanco?

**APLICA** (invisible en impresión):
- ✅ Columna: CREDENCIAL (en armas 2+)
- ✅ Columna: NOMBRE SOCIO (en armas 2+)
- ✅ Columna: CURP (en armas 2+)

**NO APLICA** (DEBE SER VISIBLE):
- ❌ Columnas de ARMA, MARCA, MODELO, CALIBRE, FOLIO, etc. (siempre NEGRO)
- ❌ Fila "TOTAL POR SOCIO" (fondo ROJO, texto NEGRO)

### En RELACIÓN (Excel/PDF):

```javascript
// Cuando se repite un socio (ARMA 1 - Visible):
{
  credencial: "222",        // NEGRO
  nombre: "IVAN TSUIS",     // NEGRO
  curp: "TSUI850315...",    // NEGRO
  arma: "RIFLE HUNTING",    // NEGRO
  marca: "REMINGTON",       // NEGRO
  modelo: "MODEL 700",      // NEGRO
  matricula: "XY123456",    // NEGRO
  calibre: ".22 LR",        // NEGRO
}

// ARMA 2 del mismo socio - Solo datos del socio en blanco:
{
  credencial: "222",        // BLANCO (invisible)
  nombre: "IVAN TSUIS",     // BLANCO (invisible)
  curp: "TSUI850315...",    // BLANCO (invisible)
  arma: "PISTOLA .380",    // NEGRO (visible!)
  marca: "BERETTA",         // NEGRO (visible!)
  modelo: "M85",            // NEGRO (visible!)
  matricula: "AB456789",    // NEGRO (visible!)
  calibre: "9MM",           // NEGRO (visible!)
}

// ARMA 3 del mismo socio:
{
  credencial: "222",        // BLANCO (invisible)
  nombre: "IVAN TSUIS",     // BLANCO (invisible)
  curp: "TSUI850315...",    // BLANCO (invisible)
  arma: "ESCOPETA",         // NEGRO (visible!)
  marca: "MOSSBERG",        // NEGRO (visible!)
  modelo: "500",            // NEGRO (visible!)
  matricula: "CD789012",    // NEGRO (visible!)
  calibre: ".410",          // NEGRO (visible!)
}

// TOTAL POR SOCIO:
{
  credencial: "TOTAL",      // NEGRO, fondo ROJO
  nombre: "3 ARMAS",        // NEGRO, fondo ROJO
  // resto de columnas en rojo también
}
```

### En XLSX (openpyxl/ExcelJS):

```javascript
// Para repeticiones (texto blanco):
cell.font = Font(color: "FFFFFF")  // Blanco
cell.fill = PatternFill(fill_type=None)  // Sin fondo

// Para datos de arma (siempre negro):
cell.font = Font(color: "000000")  // Negro
cell.fill = PatternFill(fill_type=None)  // Sin fondo

// Para fila TOTAL (fondo rojo):
cell.font = Font(color: "000000", bold: True)  // Negro, bold
cell.fill = PatternFill(patternType="solid", fgColor="FF0000")  // Rojo
```

---

## 📋 Oficios Acompañantes

### Oficio 066 (o similar)
```
"Se remite ANEXOS A, B Y C de conformidad con lo solicitado"
- Adjunta: Anexo A, Anexo B, Anexo C
```

### Oficio 065 (o similar)
```
"Se remite RELACIÓN ACTUALIZADA DE SOCIOS Y ARMAS"
- Adjunta: Relación Completa
```

### Oficio 061 (Socios causan BAJA)
```
"Se remite relación de socios que causan BAJA en el período"
- Adjunta: Listado de bajas con fechas y motivos
```

### Oficio 067 (Socios causan ALTA)
```
"Se remite relación de socios que causan ALTA en el período"
- Adjunta: Listado de altas
```

---

## ✅ Cronograma Bimestral 2026

| Bimestre | Fechas | Reportes Requeridos |
|----------|--------|-----------|
| 1 | 28 FEB | Relación, Anexo A, Anexo B, Anexo C, Oficio |
| 2 | 30 ABR | Relación, Anexo A, Anexo B, Oficio |
| 3 | 30 JUN | Relación, Anexo A, Anexo B, Oficio |
| 4 | 31 AGO | Relación, Anexo A, Anexo B, Oficio |
| 5 | 31 OCT | Relación, Anexo A, Anexo B, Oficio |
| 6 | 31 DIC | Relación, Anexo A, Anexo B, Oficio |

**Nota**: Anexo C solo en **Bimestre 1 (FEBRERO)**

---

## 🎯 Flujo de Generación

```
Admin selecciona: Bimestre + Año
        ↓
Sistema verifica:
├─ ¿Anexo C requerido? (solo si es febrero)
├─ Datos en Firebase actualizados
└─ Permisos de admin
        ↓
Genera en orden:
1. RELACIÓN (detallada por arma, con texto blanco en repeticiones)
2. ANEXO A (resumen por socio, conteos)
3. ANEXO B (cédula de totales, fórmulas)
4. [ANEXO C solo en Febrero]
        ↓
Convierte a PDF
        ↓
Genera Oficios adjuntos
        ↓
Guarda registro en Firestore
        ↓
Listo para descargar + enviar a SEDENA
```

---

## 💡 Ventajas del Enfoque Correcto

✅ **RELACIÓN**: Detallada (por arma), con look profesional usando texto blanco SOLO para datos del socio  
✅ **ANEXO A**: Resumen simple (por socio), fórmulas calculan armas cortas vs largas  
✅ **ANEXO B**: Automático (fórmulas que leen Anexo A), siempre sincronizado  
✅ **ANEXO C**: Dinámico (fórmulas de totales + datos estáticos del club), se actualiza automático  
✅ **Texto blanco**: Invisible en impresión, SOLO en credencial+nombre (datos de arma siempre visibles)  
✅ **Firebase**: Fuente única de verdad, datos normalizados  
✅ **Auditoría**: Registro completo de qué, cuándo, quién


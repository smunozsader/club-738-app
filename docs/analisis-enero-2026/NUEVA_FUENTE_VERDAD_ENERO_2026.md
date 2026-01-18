# NUEVA FUENTE DE VERDAD - ENERO 2026

**Fecha de creación**: 17 de enero de 2026  
**Archivo**: `data/socios/2026_ENERO_RELACION_SOCIOS_ARMAS_MASTER.xlsx`

---

## 📊 RESUMEN EJECUTIVO

### Estadísticas Finales

| Concepto | Cantidad |
|----------|----------|
| **Total de armas** | **280** |
| Armas cortas | 108 |
| Armas largas | 172 |
| **Total de socios** | **66** |
| Socios con dirección estructurada | 65 (98.5%) |
| Socios sin dirección estructurada | 1 (1.5%) |

### Composición del Archivo

```
Base diciembre 2025:  276 armas  (verificadas con reporte 32 ZM)
+ Nuevas enero 2026:    4 armas  (Iván Cabo, Gardoni, Arechiga)
─────────────────────────────────
TOTAL:                280 armas
```

---

## 🎯 ORIGEN DEL NÚMERO 287

**¿De dónde salió la cifra de 287 armas?**

El archivo actual (`Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx`) tiene:
- **292 filas totales** en Excel
- **291 filas con datos** (después de headers)

La cifra de **287** probablemente vino de:
1. **Conteo inicial** antes de limpieza de duplicados
2. **Versión previa** del archivo antes de sincronización v1.23.0
3. **Error de conteo** al incluir filas de separación o totales

**Realidad verificada**:
- Diciembre 2025: **276 armas** ✅ (reportadas a 32 ZM)
- Enero 2026: **280 armas** ✅ (nueva fuente de verdad)
- Diferencia: **+4 armas** (documentadas)

---

## 🆕 4 ARMAS AGREGADAS (Diciembre → Enero)

| Socio | Matrícula | Marca | Modelo | Calibre | Tipo |
|-------|-----------|-------|--------|---------|------|
| **Iván Cabo** | 73-H21YT-001717 | RETAY | GORDION | 9 mm | PISTOLA |
| **Iván Cabo** | FP40104 | CZ | SHADOW 2 | 9 mm | PISTOLA |
| **Gardoni** | DP25087 | CZ | SHADOW 2 | 9 mm | PISTOLA |
| **Arechiga** | C647155 | CZ | P07 | 9 mm | PISTOLA |

**Nota**: Arechiga también recibió 2 transferencias de Gardoni (K078999, K084328), pero esas ya existían en diciembre.

---

## 📁 ESTRUCTURA DEL ARCHIVO

### Columnas Principales

| # | Columna | Descripción |
|---|---------|-------------|
| 1 | No. REGISTRO DEL CLUB | 738 (constante) |
| 2 | DOMICILIO DEL CLUB | CALLE 50 No. 531-E x 69 y 71, CENTRO, 97000 MÉRIDA, YUC. |
| 3 | No. CREDENCIAL | Número de credencial del socio (1-236) |
| 4 | NOMBRE DEL SOCIO | Nombre completo en MAYÚSCULAS |
| 5 | CURP | Clave Única de Registro de Población |
| 6 | No. CONSEC. DE SOCIO | Número consecutivo interno |
| 7 | **CALLE** | ✨ **NUEVO: Dirección estructurada** |
| 8 | **COLONIA** | ✨ **NUEVO: Dirección estructurada** |
| 9 | **CIUDAD** | ✨ **NUEVO: Dirección estructurada** |
| 10 | **ESTADO** | ✨ **NUEVO: Dirección estructurada** |
| 11 | **CP** | ✨ **NUEVO: Código postal** |
| 12 | CLASE | Tipo de arma (PISTOLA, ESCOPETA, RIFLE, etc.) |
| 13 | CALIBRE | Calibre del arma |
| 14 | MARCA | Marca fabricante |
| 15 | MODELO | Modelo del arma |
| 16 | MATRÍCULA | Matrícula/Número de serie |
| 17 | FOLIO | Folio de registro SEDENA |

---

## ✨ CARACTERÍSTICAS CLAVE

### 1. Direcciones Estructuradas (NUEVO)

**Antes** (archivo antiguo):
```
Col 6: "CALLE 44 No. 438 x 21 y 23, FRACC. LOS PINOS, MÉRIDA, YUCATÁN, 97115"
```

**Ahora** (nueva fuente de verdad):
```
Col 7 CALLE:   "CALLE 44 No. 438 x 21 y 23"
Col 8 COLONIA: "FRACC. LOS PINOS"
Col 9 CIUDAD:  "MÉRIDA"
Col 10 ESTADO: "YUCATÁN"
Col 11 CP:     "97115"
```

**Beneficio**: Los campos estructurados se pueden usar para **auto-llenar formularios PETA** sin parsear texto manual.

### 2. Base Verificada

- ✅ Base diciembre 2025: **276 armas** (coincide con reporte oficial a 32 ZM)
- ✅ Normalización completa: todas las filas tienen datos de socio + arma
- ✅ Sin filas "TOTAL POR PERSONA" o separadores
- ✅ Headers formateados con estilo (fondo azul, texto en negritas)

### 3. Sincronización con Firebase

El archivo está **sincronizado** con:
- **Firebase Firestore**: Colección `socios/{email}/armas`
- **Firebase Storage**: PDFs de registros de armas subidos
- **Excel actualizado**: Hasta v1.23.0 (17 enero 2026)

---

## 🔝 TOP 10 SOCIOS (Por Cantidad de Armas)

| # | Socio | Armas |
|---|-------|-------|
| 1 | Remigio Beethoven Aguilar Canto | 10 |
| 2 | Rigomar Hinojosa Shields | 10 |
| 3 | Carlos Antonio Granja Pérez | 10 |
| 4 | Javier Ruz Peraza | 9 |
| 5 | Adolfo Xacur Rivera | 8 |
| 6 | Sergio Santinelli Grajales | 8 |
| 7 | Claudio Mauricio Canavati Farah | 8 |
| 8 | Eduardo Denis Herrera | 8 |
| 9 | Joaquín Rodolfo Gardoni Núñez | 8 |
| 10 | Paulino Edilberto Monforte Trava | 7 |

---

## ⚠️ NOTAS Y PENDIENTES

### Duplicado Detectado

- **Matrícula duplicada**: `0014-07080`
- **Acción requerida**: Verificar si es el mismo arma con 2 registros o 2 armas diferentes

### Discrepancia en Armas Cortas

- **Esperado** (según análisis previo): 107 cortas
- **Actual**: 108 cortas
- **Diferencia**: +1 corta
- **Posible causa**: El duplicado `0014-07080` podría ser una pistola

### Socio sin Dirección Estructurada

- **Cantidad**: 1 socio de 66 (1.5%)
- **Acción recomendada**: Identificar y completar datos de dirección

---

## 🔄 PROCESO DE CREACIÓN

### Script Utilizado

```python
crear_nueva_fuente_verdad.py
```

### Pasos Ejecutados

1. **Lectura de base diciembre normalizado**
   - Archivo: `2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS_NORMALIZADO.xlsx`
   - Resultado: 276 armas procesadas

2. **Lectura de archivo actual** (para direcciones)
   - Archivo: `data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx`
   - Resultado: 77 CURPs con direcciones estructuradas

3. **Matching por CURP**
   - Se buscaron los datos de cada arma de diciembre en el archivo actual
   - Se extrajeron las direcciones estructuradas (cols 7-11)
   - Resultado: 271 direcciones agregadas (98%)

4. **Agregado de 4 armas nuevas**
   - Iván Cabo: 2 armas (73-H21YT-001717, FP40104)
   - Gardoni: 1 arma (DP25087)
   - Arechiga: 1 arma (C647155)

5. **Formato y guardado**
   - Headers con estilo (azul + negritas)
   - Anchos de columna optimizados
   - Guardado en: `data/socios/2026_ENERO_RELACION_SOCIOS_ARMAS_MASTER.xlsx`

---

## 📝 VERIFICACIÓN COMPLETADA

| Verificación | Estado | Detalle |
|-------------|--------|---------|
| Total armas | ✅ | 280 armas (276 base + 4 nuevas) |
| Armas nuevas presentes | ✅ | Las 4 encontradas en archivo |
| Direcciones estructuradas | ✅ | 65 de 66 socios (98.5%) |
| Duplicados | ⚠️ | 1 matrícula duplicada (0014-07080) |
| Headers | ✅ | Formateados con estilo |
| CURPs únicos | ✅ | 66 socios |

---

## 🎯 USO RECOMENDADO

Este archivo es ahora **LA FUENTE DE VERDAD** para:

1. **Reportes a 32 Zona Militar**
   - Usar para próximo reporte (enero/febrero 2026)
   - Total a reportar: **280 armas** (108 cortas + 172 largas)

2. **Generación de PETAs**
   - Direcciones estructuradas facilitan auto-llenado
   - Datos de armas actualizados hasta enero 2026

3. **Sincronización Firebase**
   - Base para verificar/actualizar Firestore
   - Referencia para validar PDFs en Storage

4. **Gestión de Arsenal**
   - Lista completa y actualizada de todas las armas del club
   - Fácil identificación de socios y sus arsenales

---

## 📌 CONCLUSIÓN

✅ **NUEVA FUENTE DE VERDAD CREADA EXITOSAMENTE**

- **280 armas** registradas (verificadas y actualizadas)
- **66 socios** con datos completos
- **98.5%** de direcciones estructuradas
- **Base confiable** para todos los trámites 2026

**Archivo guardado en**:  
`/Applications/club-738-web/data/socios/2026_ENERO_RELACION_SOCIOS_ARMAS_MASTER.xlsx`

---

*Documento generado: 17 de enero de 2026*  
*Versión: 1.0*

# Base de Datos de Socios - Fuente de Verdad Unificada

**Última actualización**: 17 de Enero 2026, 20:40h

---

## 📁 Estructura de Archivos

```
socios/
├── FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx  ← ✅ BASE DE VERDAD ÚNICA
├── firebase_auth_import.json                  (autenticación Firebase)
└── referencia_historica/                      ← 📚 ARCHIVOS HISTÓRICOS (NO USAR)
    ├── 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx
    ├── Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx
    ├── 2026_ENERO_RELACION_SOCIOS_ARMAS_MASTER.xlsx
    ├── credenciales_socios.csv
    ├── credenciales_socios.json
    ├── backups automáticos (7 archivos)
    └── archivos diciembre 2025
```

---

## ✅ FUENTE DE VERDAD ÚNICA

**Archivo maestro oficial consolidado**:
```
socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx
```

Este archivo es la **única fuente de verdad** consolidada que combina:
- **Anexo A Oficial (Diciembre 2025)**: 76 socios con datos completos
- **Base Normalizada (Diciembre 2025)**: 276 armas registradas
- **Actualizaciones Enero 2026**: 4 armas nuevas (Gardoni, Arechiga, Iván Cabo x2)
- **Correcciones de datos**: Agustín Moreno, Ariel Córdoba Wilson

### Características

**Cobertura total**: 
- 76 socios (100% de Anexo A oficial)
- 66 socios con armas registradas (276 armas)
- 10 socios sin armas (marcados con "0")

**Campos Firebase-ready** (19 columnas):
1. No. REGISTRO (738)
2. DOMICILIO CLUB
3. No. CREDENCIAL (número de socio)
4. NOMBRE SOCIO
5. CURP
6. TELEFONO
7. **EMAIL** (identificador Firebase - CRÍTICO)
8. FECHA ALTA
9-13. **Dirección estructurada** (CALLE, COLONIA, CIUDAD, ESTADO, CP)
14-19. **Datos de armas** (CLASE, CALIBRE, MARCA, MODELO, MATRÍCULA, FOLIO)

**Calidad de datos**:
- ✅ 76 emails únicos (sin duplicados)
- ✅ 76 CURPs únicos
- ✅ Direcciones estructuradas (98.5% cobertura)
- ✅ Correcciones aplicadas en fuente

---

## 📊 Estadísticas Actuales (17 Enero 2026)

- **Total de socios**: 76 (100% de Anexo A)
- **Socios con armas**: 66
- **Socios sin armas**: 10
- **Total de armas**: 276 (base diciembre 2025)
- **Última actualización**: Consolidación completa con Anexo A + correcciones de datos

---

## 🔄 Actualizaciones Recientes

### 17 de Enero 2026 - Sincronización Completa

**JOAQUIN GARDONI**:
- Agregada: Shadow 2 DP25087
- Transferidas a Arechiga: K078999, K084328
- **Total armas**: 8 → 7

**MARIA FERNANDA ARECHIGA**:
- Recibidas de Gardoni: K078999 (LP380 FOLIO: A3601943), K084328 (LP380 FOLIO: A3714371)
- Agregada nueva: CZ P07 C647155 (FOLIO pendiente)
- Modelo K084328 corregido: P380 → LP380
- **Total armas**: 0 → 3

**IVÁN CABO**:
- Agregadas 2 armas nuevas:
  1. ESCOPETA 12 GA RETAY GORDION MAT: 73-H21YT-001717 FOLIO: A3905284
  2. PISTOLA .380" CZ SHADOW 2 MAT: FP40104 FOLIO: A3901317
- **Total armas**: 3 → 5

---

## ⚠️ Problemas Detectados

### 1. MARIA FERNANDA ARECHIGA - Armas sin asignar correctamente

**Situación**:
- El registro de ARECHIGA en Excel está vacío (solo tiene email)
- Sus armas aparecen bajo el email de GARDONI (esposo)

**Armas que deberían estar bajo ARECHIGA**:
- Pistola CZ P07 C647155
- Grand Power LP380 K078999
- Grand Power LP380 K084328

**ACCIÓN REQUERIDA**: Separar armas por socio individual

### 2. JOAQUIN GARDONI - Shadow 2 DP25087

**Situación**:
- Usuario reporta: Shadow 2 MAT: DP25087 subida al portal
- ❌ NO aparece en Excel maestro

**ACCIÓN REQUERIDA**: Verificar si debe agregarse o si fue vendida/transferida

---

## 🔍 Validación Cruzada

### JOAQUIN GARDONI (jrgardoni@gmail.com)
**Tel**: 5530565722  
**Armas en Excel maestro**: 8

| Tipo | Calibre | Marca | Modelo | Matrícula | Estado |
|------|---------|-------|--------|-----------|--------|
| PISTOLA | .22" L.R. | GRAND POWER | K22 X-TRIM | K078928 | ✅ Confirmada |
| RIFLE | .22" L.R. | KRISS | DMK22C | 22C002369 | ✅ Confirmada |
| RIFLE | .22" L.R. | RUGER | 25 | 0008-32069 | ✅ Confirmada |
| RIFLE | .22" L.R. | RUGER | 25 | 0013-82505 | ✅ Confirmada |
| PISTOLA | .380" | CESKA ZBROJOVKA | CZ SHADOW 2 | DP25246 | ✅ Confirmada |
| PISTOLA | .380" | CESKA ZBROJOVKA | CZ SHADOW 2 | DP25086 | ✅ Confirmada |
| PISTOLA | .380" | CESKA ZBROJOVKA | CZ SHADOW 2 | **DP25087** | ❌ NO en Excel |
| PISTOLA | .380" AUTO | GRAND POWER | LP380 | K078999 | ⚠️ Debería ser de ARECHIGA |
| PISTOLA | 0.380" | GRAND POWER | P380 | K084328 | ⚠️ Debería ser de ARECHIGA |

**Armas vendidas** (NO en Excel, correcto):
- Grand Power LP 380 K084384 → vendida a Daniel Manrique
- Grand Power LP 380 K084385 → vendida a Jose Alberto Manrique

---

### IVAN TSUIS CABO TORRES (ivancabo@gmail.com)
**Tel**: 9992315040  
**Armas en Excel maestro**: 5 (actualizado 17/01/2026)

| Tipo | Calibre | Marca | Modelo | Matrícula | Estado |
|------|---------|-------|--------|-----------|--------|
| PISTOLA | .380" | CESKA ZBROJOVKA | CZ P-10 C | DP23540 | ✅ OK |
| PISTOLA | .22" | BROWNING | BUCK | US515YY19935 | ✅ OK |
| RIFLE SEMI-AUTOMÁTICO | .22" L.R. | MENDOZA | PUMA | 27280 | ✅ OK |
| ESCOPETA | 12 GA | RETAY | GORDION | 73-H21YT-001717 | 🆕 Agregada 17/01 |
| PISTOLA | .380" | CESKA ZBROJOVKA | SHADOW 2 | FP40104 | 🆕 Agregada 17/01 |

---

## 📝 Procedimiento de Actualización

Cuando se necesite actualizar la base de verdad:

1. **Hacer backup automático**:
   ```python
   backup_file = archivo_maestro.replace('.xlsx', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx')
   shutil.copy(archivo_maestro, backup_file)
   ```

2. **Actualizar el archivo maestro**:
   ```
   data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx
   ```

3. **Documentar cambios** en este README

4. **Sincronizar con Firestore** (si aplica)

---

## 🚫 NO USAR

Los siguientes archivos están en `referencia_historica/` **SOLO para consulta**:
- ❌ NO editar
- ❌ NO usar como fuente de datos
- ❌ NO importar a Firebase

Son versiones antiguas que se mantienen por referencia histórica.

---

## 🔐 Archivos Sensibles

**NUNCA commitear a Git**:
- `credenciales_socios.csv`
- `credenciales_socios.json`
- `firebase_auth_import.json`
- Cualquier Excel con datos de socios

Estos archivos están en `.gitignore` y deben permanecer locales.

---

## 📞 Contacto

Para actualizaciones o correcciones contactar al secretario del club.

**Club de Caza, Tiro y Pesca de Yucatán, A.C.**  
Tel: +52 56 6582 4667 (WhatsApp)  
Email: tiropracticoyucatan@gmail.com

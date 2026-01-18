# Scripts del Proyecto Club 738

Esta carpeta contiene todos los scripts de desarrollo y administración organizados por función.

## 📁 Estructura Completa

```
scripts/
├── actualizacion/        Scripts de actualización de datos
├── analisis/             Scripts de análisis y búsqueda
├── debug/                Scripts de debugging y testing
├── email_whatsapp/       Scripts de generación de emails y WhatsApp
├── generacion/           Scripts de generación de archivos y datos
├── importacion/          Scripts de importación y sincronización
├── limpieza/             Scripts de corrección y limpieza de datos
├── migracion/            Scripts de migración Firebase
├── normalizacion/        Scripts de normalización de formatos
├── temp/                 Scripts temporales
├── validacion/           Scripts de verificación y auditoría
└── README.md             Este archivo
```

## 📊 Descripción de Categorías

### 🔄 actualizacion/ (4 scripts)
Scripts para actualizar datos en Firebase:
- `actualizar-curps-firestore.cjs`
- `actualizar-domicilios-6-campos.cjs`
- `actualizar-modalidad-armas.cjs`
- `actualizar-modalidad-caza-sergio.cjs`

### 🔍 analisis/ (27 scripts)
Scripts para analizar, buscar y comparar datos:
- Búsqueda de socios, armas, registros
- Análisis de domicilios, emails, morosos
- Arqueología de datos (arqueo-*.cjs)
- Normalización y separación de datos
- Ejemplos: `buscar-arma.cjs`, `arqueo-curps.py`, `separar-direcciones.py`

### 🐛 debug/ (11 scripts)
Scripts de debugging, testing y verificación:
- Búsquedas y verificaciones específicas
- Testing de funcionalidades
- Ejemplos: `check-firebase-pagos.js`, `debug-pagos.cjs`

### 📧 email_whatsapp/ (17 scripts)
Scripts para generar campañas de email y WhatsApp:
- Generación de CSVs para campañas
- Generación de mensajes WhatsApp
- Mail merge para morosos y general
- Importación a WAPI Sender
- Ejemplos: `generar-whatsapp-segmentado.cjs`, `generar-mail-merge-general.cjs`

### 📝 generacion/ (32 scripts)
Scripts para generar archivos y datos:
- Creación de usuarios, colecciones, notificaciones
- Generación de PDFs (credenciales)
- Subida de documentos a Firebase Storage
- Conversión y regeneración de URLs
- Ejemplos: `crear_pdfs_credenciales.py`, `subir-curps.cjs`

### 📥 importacion/ (14 scripts)
Scripts para importar y sincronizar datos:
- Importación a Firebase (usuarios, armas, domicilios)
- Repoblación de datos
- Sincronización de CURPs y documentos
- Agregación de socios faltantes
- Ejemplos: `importar-usuarios-firebase.cjs`, `repoblar-armas-y-fechas.py`

### 🧹 limpieza/ (10 scripts)
Scripts para corrección y limpieza de datos:
- Corrección de emails, teléfonos, mapeos
- Eliminación de filas duplicadas
- Limpieza de duplicados en Firebase
- Reseteo de passwords
- Ejemplos: `limpiar-duplicados-ivan-cabo.cjs`, `corregir-curps-excel.py`

### 🔀 migracion/ (4 scripts)
Scripts de migración Firebase (Node.js):
- `migrar-estructura-completa.cjs`
- `migrar-estructura-pagos.cjs`
- `migrar-final.cjs`
- `migrar-rutas-armas.cjs`

### 📝 normalizacion/ (6 scripts)
Scripts para normalizar formatos:
- Normalización de Excel
- Normalización de domicilios
- Ejemplos: `normalizar_campos_excel.py`, `normalizar_diciembre_2025.py`

### 🗑️ temp/ (2 scripts)
Scripts temporales (se pueden eliminar después de testing):
- `organizar.py` - Reorganización de scripts

### ✅ validacion/ (21 scripts)
Scripts de verificación, auditoría e inspección:
- Verificación de integridad de datos
- Auditoría de Storage y Firestore
- Comparación entre fuentes de datos
- Inspección de estructuras
- Ejemplos: `verificar-integridad-datos.cjs`, `auditoria-completa-storage.cjs`

---

## 📊 Estadísticas

| Categoría | Scripts | Descripción |
|-----------|---------|------------|
| analisis | 27 | Búsqueda, comparación, análisis |
| generacion | 32 | Generación de archivos y datos |
| validacion | 21 | Verificación e inspección |
| importacion | 14 | Importación y sincronización |
| email_whatsapp | 17 | Campañas email/WhatsApp |
| limpieza | 10 | Corrección y limpieza |
| actualizacion | 4 | Actualización de datos |
| migracion | 4 | Migración Firebase |
| normalizacion | 6 | Normalización de formatos |
| debug | 11 | Testing y debugging |
| temp | 2 | Temporales |
| **TOTAL** | **148** | **Scripts categorizados** |

---

## 🚀 Uso

### Scripts Python
Requieren venv activado:
```bash
source .venv/bin/activate
python scripts/analisis/arqueo_curps.py
```

### Scripts Node.js (.cjs)
Requieren dependencias instaladas:
```bash
npm install
node scripts/importacion/importar-usuarios-firebase.cjs
```

---

## 📋 Archivos Especiales

- **serviceAccountKey.json**: Credenciales Firebase Admin (NO COMMITEAR)
- **README.md**: Documentación (este archivo)

---

## 🔗 Enlaces Importantes

- **Fuente de verdad**: `socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx`
- **Base de datos**: `socios/`
- **Documentación**: `docs/`

---

## Última actualización
17 de Enero 2026 - Reorganización completa de scripts (148 archivos en 11 categorías)

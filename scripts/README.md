# Scripts del Proyecto Club 738

Esta carpeta contiene todos los scripts de desarrollo y administración organizados por categoría.

## 📁 Estructura

```
scripts/
├── analisis/          Scripts de análisis y verificación de datos
├── actualizacion/     Scripts de actualización y modificación de datos
├── normalizacion/     Scripts de normalización de Excel y formatos
├── migracion/         Scripts de migración de datos a Firebase
├── debug/             Scripts de debugging y testing
└── temp/              Scripts temporales (del día, experimentos)
```

## 📊 analisis/ (0 scripts)
Scripts para analizar, comparar y verificar datos:
- Comparación entre versiones de Excel
- Verificación de integridad de datos
- Análisis de discrepancias
- Búsqueda y extracción de información

## 🔄 actualizacion/ (15 scripts)
Scripts para actualizar datos en Excel y Firebase:
- `actualizar_base_verdad.py` - Actualizar archivo maestro
- `actualizar_firestore_arechiga.py` - Actualizar datos Arechiga en Firebase
- `actualizar_folios_arechiga.py` - Actualizar folios específicos
- `actualizar_gardoni_arechiga.py` - Actualizar datos Gardoni
- `actualizar_ivan_cabo_firestore.py` - Actualizar datos Iván Cabo
- `agregar_11_socios.py` - Agregar socios faltantes
- `corregir_telefono_ariel.py` - Correcciones específicas
- `corregir_y_crear_fuente.py` - Crear fuente de verdad corregida
- `crear_fuente_verdad_completa.py` - Crear fuente completa
- `crear_nueva_fuente_verdad.py` - Crear nueva versión
- `fix_k078999.py` - Fix específico de arma
- `reasignar_k078999.py` - Reasignar arma
- `sincronizar_firestore.py` - Sincronización Firebase
- `subir_pdfs_registros.py` - Subir PDFs de registros

## 📝 normalizacion/ (6 scripts)
Scripts para normalizar formatos de Excel:
- `normalizar_campos_excel.py` - Normalizar campos numéricos
- `normalizar_diciembre_2025.py` - Normalizar versión diciembre
- `normalizar_final.py` - Normalización final
- `normalizar_v2.py` - Versión 2 de normalización
- `mostrar_normalizacion.py` - Mostrar ejemplos normalizados
- `verificacion_final.py` - Verificación post-normalización

## 🔀 migracion/ (4 scripts)
Scripts de migración Firebase (Node.js):
- `migrar-estructura-completa.cjs` - Migración completa
- `migrar-estructura-pagos.cjs` - Migración de pagos
- `migrar-final.cjs` - Migración final
- `migrar-rutas-armas.cjs` - Migración de rutas de armas

## 🐛 debug/ (11 scripts)
Scripts de debugging y testing:
- `buscar-armas-ricardo.cjs` - Búsqueda específica
- `buscar-medicos-ricardo.cjs` - Búsqueda médicos
- `check-firebase-pagos.js` - Verificar pagos
- `check-luis.cjs` - Verificar datos Luis
- `check-pagos.cjs` - Verificar estructura pagos
- `check-ricardo-desquens.cjs` - Verificar datos Ricardo
- `check-santiago-full.cjs` - Verificar datos Santiago
- `check-sergio-martinez.cjs` - Verificar datos Sergio
- `debug-pagos.cjs` - Debug de pagos
- `debug-sergio-rutas.cjs` - Debug rutas
- `verify-estructura.cjs` - Verificar estructura general

## 🗑️ temp/ (1 script)
Scripts temporales (se pueden eliminar después de testing):
- `organizar.py` - Script de organización de carpetas

---

## Notas

- **Scripts Python**: Requieren venv activado (`.venv/bin/python`)
- **Scripts Node.js (.cjs)**: Requieren dependencias instaladas (`npm install`)
- **Scripts en temp/**: Revisar y eliminar periódicamente
- **Fuente de verdad actual**: `socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx`

## Última actualización
17 de Enero 2026 - Reorganización completa de scripts

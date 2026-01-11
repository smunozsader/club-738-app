# 🐛 BUG REPORT: Duplicación de Armas al Solicitar PETA

**Fecha:** 10 Enero 2026
**Reportado por:** Sergio Muñoz
**Afectados:** Sergio Muñoz, Iván Cabo (probablemente otros socios)

## Descripción del Problema

Las armas se duplican en Firestore cuando se importan desde Excel. Los socios ven armas duplicadas en "Mis Armas".

## Causa Raíz

**Archivo:** `scripts/importar-armas-firestore.cjs`
**Línea 100-101:**

```javascript
const armaId = `${arma.matricula}`.replace(/[\/\s]/g, '_');
await socioRef.collection('armas').doc(armaId).set({
```

### Problema Identificado:

1. **Primera importación**: Usa matrícula como ID (ej: `DP23540`)
2. **Actualizaciones posteriores** (script `actualizar-modalidad-armas.cjs`): 
   - Genera nuevos IDs con UUID
   - NO elimina los documentos originales
   - Resultado: 2 copias de la misma arma

### Evidencia:

**Sergio Muñoz (smunozam@gmail.com):**
- Arsenal antes: 12 registros (6 armas duplicadas)
- Arsenal después: 6 armas únicas
- Patrón: Armas con ID = matrícula (sin modalidad) + UUID (con modalidad)

**Iván Cabo (ivancabo@gmail.com):**
- Arsenal antes: 6 registros (3 armas con 2 duplicados)
- Arsenal después: 3 armas únicas
- Patrón: Mismo problema

## Solución Implementada

**Script creado:** `limpiar-duplicados-*.cjs`

**Lógica:**
1. Identificar duplicados por matrícula
2. Conservar versión con UUID y modalidad
3. Eliminar versión con ID = matrícula (sin modalidad)
4. Actualizar campo `totalArmas`

## Prevención

### ⚠️ Scripts a NO ejecutar dos veces:

1. `importar-armas-firestore.cjs` ❌
2. `actualizar-modalidad-armas.cjs` ❌

### ✅ Política recomendada:

- Ejecutar script de importación UNA SOLA VEZ
- Para actualizaciones individuales, crear scripts específicos
- Verificar arsenal después de cada importación masiva

## Scripts Creados para Diagnóstico:

1. `verificar-arsenal-sergio.cjs` - Detecta duplicados de Sergio
2. `verificar-arsenal-ivan-cabo.cjs` - Detecta duplicados de Iván
3. `limpiar-duplicados-sergio.cjs` - Limpia arsenal de Sergio
4. `limpiar-duplicados-ivan-cabo.cjs` - Limpia arsenal de Iván

## Socios Potencialmente Afectados

**Todos los socios** que fueron importados con el script original pueden tener duplicados si:
- Se ejecutó el script de importación más de una vez
- Se ejecutó el script de actualización de modalidades

### Acción Recomendada:

Crear script genérico para detectar y limpiar duplicados de TODOS los socios:

```bash
node scripts/verificar-todos-arsenales.cjs
node scripts/limpiar-todos-duplicados.cjs
```

## Estado Actual

✅ Sergio Muñoz: Arsenal limpio (6 armas)
✅ Iván Cabo: Arsenal limpio (3 armas)
⚠️ Otros 75 socios: Pendiente verificación

## Próximos Pasos

1. Crear script de verificación masiva
2. Ejecutar en todos los socios
3. Generar reporte de afectados
4. Limpiar duplicados masivamente
5. Documentar en CHANGELOG.md

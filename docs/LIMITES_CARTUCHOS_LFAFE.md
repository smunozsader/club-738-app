# Límites Legales de Cartuchos - LFAFE

## Artículo 50 de la Ley Federal de Armas de Fuego y Explosivos

**Última actualización**: Enero 2026

### Límites de Venta por Persona

La Secretaría, así como las personas físicas y morales con permiso general vigente, pueden vender únicamente en total por persona:

| Tipo de Arma | Límite de Cartuchos | Base Legal |
|--------------|---------------------|------------|
| **Calibre .22"** (excepto Magnum, Hornet, TCM) | **500 cartuchos** | Art. 50-a LFAFE |
| **Escopetas** (calibres 12, 16, 20, 28, .410) | **1,000 cartuchos** | Art. 50-b LFAFE |
| **Otras armas** (pistolas, rifles) | **200 cartuchos** | Art. 50-d LFAFE |

### Períodos de Comercialización

Los periodos para comercialización de las cantidades de municiones son:

- **Anualmente**: Protección de domicilio y parcela
- **Trimestralmente**: Actividades cinegéticas (caza)
- **Mensualmente**: Tiro deportivo

## Implementación en el Sistema

### Archivos Relacionados

1. **`src/utils/limitesCartuchos.js`** - Utilidad centralizada
   - `getLimitesCartuchos(calibre, clase)` - Obtiene límites por arma
   - `ajustarCartuchos(valor, calibre, clase)` - Ajusta a límites legales
   - `getCartuchosPorDefecto(calibre, clase, tipoPETA)` - Default según tipo

2. **`src/components/SolicitarPETA.jsx`**
   - Asigna cartuchos por defecto al crear solicitud
   - Usa límites legales correctos

3. **`src/components/GeneradorPETA.jsx`**
   - Genera oficios PDF con cantidades legales
   - Valida y ajusta entradas del usuario

### Detección Automática

El sistema detecta automáticamente el tipo de arma:

```javascript
// Ejemplos de detección:

// Escopetas (máx 1,000)
"12 GA" → 1,000 cartuchos
"ESCOPETA UN CAÑON" + "20 GA" → 1,000 cartuchos

// Calibre .22 (máx 500)
".22 LR" → 500 cartuchos
"22 L.R" → 500 cartuchos
".22" → 500 cartuchos

// Excepciones .22 (máx 200)
".22 MAGNUM" → 200 cartuchos
".22 HORNET" → 200 cartuchos
".22 TCM" → 200 cartuchos

// Otros calibres (máx 200)
"9mm" → 200 cartuchos
".380" → 200 cartuchos
".45 ACP" → 200 cartuchos
".38" → 200 cartuchos
```

### Valores por Defecto según Tipo de PETA

| Tipo PETA | Calibre .22 | Escopeta | Otros |
|-----------|-------------|----------|-------|
| **Tiro/Competencia** | 500 | 1,000 | 200 |
| **Caza** | 250 | 200 | 100 |

## Cambios Implementados (18 Enero 2026)

### Antes (INCORRECTO ❌)
- .22 LR: máx 1,000 ❌
- Escopetas: máx 500 ❌
- Resto: máx 200 ✅

### Después (CORRECTO ✅)
- .22 LR: máx **500** ✅
- Escopetas: máx **1,000** ✅
- Resto: máx 200 ✅

## Notas Importantes

1. **Límites NO acumulativos**: Los límites son por período (mensual, trimestral o anual)
2. **PETAs de caza**: Usar límite trimestral
3. **PETAs de tiro/competencia**: Usar límite mensual
4. **Cartuchos en oficios**: Siempre respetar máximos legales por calibre
5. **Validación automática**: El sistema ajusta automáticamente valores fuera de rango

## Referencias

- **Ley Federal de Armas de Fuego y Explosivos (LFAFE)**
- **Artículo 50** - Límites de venta de municiones
- **DOF**: Última reforma publicada

## Contacto

Para dudas sobre límites legales, consultar:
- **SEDENA**: https://www.gob.mx/sedena
- **32 Zona Militar** - Valladolid, Yucatán

# 🔍 Auditoría: PETA Competencia Nacional - Sección H sin Estados

**Fecha**: 22 de Febrero de 2026  
**Componentes Afectados**: `GeneradorPETA.jsx`, `modalidadesFEMETI2026.js`  
**Severidad**: ALTA (PDF genera sección H vacía)

---

## 📋 Resumen del Problema

Al generar un PETA de tipo **Competencia Nacional**, la **Sección H** ("Si la actividad es de competencia nacional, especifique clubes, periodo y Estados donde participará") aparece **vacía** en el PDF, sin mostrar los estados ni clubes seleccionados.

### Evidencia (PDF adjunto)
El PDF `PETA_COMPETENCIA_JOAQUIN_RODOLFO_GARD_2026.pdf` muestra:
- ✅ Sección A-E: Datos correctos
- ✅ Sección E: Armas listadas correctamente (5 armas)
- ❌ **Sección H: VACÍA** - No hay estados, clubes ni periodo

---

## 🔬 Análisis Técnico: Cadena de Datos

### 1. Origen del Dato (SelectorEstadosFEMETI.jsx)

```javascript
// Línea 172-179 - El selector devuelve estados en formato DISPLAY
const estadosSeleccionados = selecciones.map(s => s.estadoDisplay);

onChangeRef.current({
  estadosSeleccionados,  // ← Formato: ["Coahuila", "Jalisco", "Estado de México"]
  modalidad: modalidades[0] || null,
  ...
});
```

El estado `estadoDisplay` usa normalización con acentos:
- "Coahuila"
- "Estado de México"  
- "Michoacán"

### 2. Recepción en GeneradorPETA.jsx

```javascript
// Línea 604-611 - GeneradorPETA recibe estos valores
const matrizResultado = generarMatrizClubesPDF(
  modalidadFEMETI.modalidad,               // "TIRO PRACTICO" (correcto)
  modalidadFEMETI.estadosSeleccionados,    // ["Coahuila", "Estado de México"] 
  fechaOficio
);
```

### 3. Bug en modalidadesFEMETI2026.js (línea 1760)

```javascript
export const generarMatrizClubesPDF = (modalidad, estadosSeleccionados, fechaSolicitud) => {
  const data = MODALIDADES_FEMETI_2026[modalidad];
  
  for (const estado of estadosSeleccionados) {
    const estadoData = data.estados[estado];  // ❌ BUG AQUÍ
    if (!estadoData) continue;  // ← Si no encuentra, IGNORA el estado
    // ...
  }
};
```

### 4. Estructura Real de MODALIDADES_FEMETI_2026

```javascript
MODALIDADES_FEMETI_2026 = {
  "TIRO PRACTICO": {
    estados: {
      "COAHUILA": { display: "Coahuila", clubes: [...] },      // ← Clave en MAYÚSCULAS
      "JALISCO": { display: "Jalisco", clubes: [...] },
      "ESTADO DE MÉXICO": { display: "Estado de México", clubes: [...] },
      // ...
    }
  }
}
```

---

## 🐛 CAUSA RAÍZ IDENTIFICADA

### Mismatch de Normalización

| Componente | Formato de Estado | Ejemplo |
|------------|-------------------|---------|
| `SelectorEstadosFEMETI` (salida) | Display (capitalizado) | `"Coahuila"` |
| `MODALIDADES_FEMETI_2026` (claves) | **MAYÚSCULAS** | `"COAHUILA"` |
| `generarMatrizClubesPDF` (búsqueda) | Sin normalizar | `data.estados["Coahuila"]` → **undefined** |

### Comportamiento Actual

```javascript
// El usuario selecciona: "Coahuila"
estadosSeleccionados = ["Coahuila"]

// generarMatrizClubesPDF busca:
data.estados["Coahuila"]  // → undefined (la clave es "COAHUILA")

// Como no encuentra, hace continue y NO agrega ninguna fila
filas = []  // ← Array vacío = Sección H vacía en PDF
```

---

## 🛠️ Solución Propuesta

### Opción A: Normalizar en `generarMatrizClubesPDF` (RECOMENDADA)

```javascript
export const generarMatrizClubesPDF = (modalidad, estadosSeleccionados, fechaSolicitud) => {
  const data = MODALIDADES_FEMETI_2026[modalidad];
  if (!data) return null;
  
  const filas = [];
  let contador = 1;
  
  for (const estado of estadosSeleccionados) {
    // ✅ NORMALIZAR: convertir a mayúsculas para buscar en el objeto
    const estadoNormalizado = estado.toUpperCase();
    const estadoData = data.estados[estadoNormalizado];
    
    if (!estadoData) {
      console.warn(`[generarMatrizClubesPDF] Estado no encontrado: "${estado}" → "${estadoNormalizado}"`);
      continue;
    }
    
    for (const clubInfo of estadoData.clubes) {
      filas.push({
        numero: contador++,
        estado: estadoData.display,  // Usar display para el PDF
        club: clubInfo.club,
        temporalidad: temporalidad.textoCompleto,
        domicilio: clubInfo.domicilio
      });
    }
  }
  
  return { modalidad, tipoArma: data.tipoArma, calibres: data.calibres, temporalidad, filas, totalClubes: filas.length };
};
```

### Opción B: Pasar estados en MAYÚSCULAS desde SelectorEstadosFEMETI

Cambiar línea 172:
```javascript
// Antes
const estadosSeleccionados = selecciones.map(s => s.estadoDisplay);

// Después
const estadosSeleccionados = selecciones.map(s => s.estado);  // s.estado es MAYÚSCULAS
```

---

## ✅ Archivos a Modificar

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `src/data/modalidadesFEMETI2026.js` | 1760 | Añadir `.toUpperCase()` al buscar estado |

---

## 📊 Impacto

- **Usuarios afectados**: Todos los socios que solicitan PETA de Competencia Nacional
- **Consecuencia legal**: PETA incompleto puede ser rechazado por 32 Zona Militar
- **Tiempo estimado de fix**: 5 minutos

---

## 🧪 Prueba de Regresión

1. Generar PETA Competencia con modalidad "TIRO PRACTICO"
2. Seleccionar estados: Coahuila, Jalisco, Yucatán
3. Verificar que Sección H muestre tabla con clubes
4. Verificar total de clubes correcto

---

**Autor**: GitHub Copilot  
**Revisado por**: Pendiente

# Phase 3: Accessibilidad WCAG AA - Plan de Acción

**Estado**: En Progreso (v1.26.0+)  
**Objetivo**: Auditoría completa y fixes de accesibilidad en todos los componentes

---

## 📋 Resumen de Audit (v1.26.0)

### GestionArsenal.jsx - ✅ COMPLETO
- **Status**: 11/11 inputs con accesibilidad (100%)
- **Cambios**: Agregados id, htmlFor, name, aria-label
- **Patrón aplicado**:
  ```jsx
  <label htmlFor="formAlta-fieldName">
    <input id="formAlta-fieldName" name="fieldName" aria-label="Description" />
  </label>
  ```

### Documentos (DocumentList, DocumentCard, MultiImageUploader, DocumentUploader)
- **Tipo de inputs**: Principalmente `<input type="file">`
- **Estado actual**: Los inputs de file use hidden attribute
- **Recomendación**: 
  - Agregar `id` al input file hidden
  - Vincular `<label htmlFor="...">` 
  - Usar aria-label en inputs hidden si no hay label visible
  - Pattern: `<label><input type="file" id="upload-file" aria-label="..." hidden /></label>`

### SolicitarPETA.jsx
- **Inputs encontrados**: 
  - Inputs de texto para domicilio (calle, colonia, cp, municipio)
  - Checkboxes para estados y armas
  - Inputs hidden para datos de solicitud
- **Acción requerida**: Agregar id y aria-label

### GeneradorPETA.jsx  
- **Inputs encontrados**:
  - Inputs de domicilio (6 campos)
  - Inputs de fechas
  - Inputs para cartucho limits
- **Acción requerida**: Agregar id y aria-label

---

## 🎯 Estrategia Phase 3: Dos Enfoques Complementarios

### ENFOQUE A: Audit Global Rápido (Recomendado para esta sesión)

En lugar de modificar manualmente cada archivo, hacer:

1. **Script de búsqueda**: Buscar todos los inputs sin `id` atributo
2. **Generar reporte**: Lista de archivos + líneas que necesitan fixes
3. **Batch replace automático**: Usar patrón estándar para todas las correcciones

**Ventajas**:
- Completa Phase 3 en ~2 horas
- Garantiza consistencia
- Menos propenso a errores manuales

**Desventajas**:
- Menos control sobre detalles específicos
- Algunos componentes pueden necesitar tweaks post-deploy

### ENFOQUE B: Auditoría Manual Profunda (Futuro)

1. Revisar cada componente línea por línea
2. Escribir tests de accesibilidad
3. Usar Axe DevTools para validación
4. Aplicar fixes uno por uno

**Ventajas**:
- Máximo control y calidad
- Oportunidad de refactorizar código

**Desventajas**:
- Muy tiempo-intensivo
- Mejor dejar para sesión posterior

---

## 📊 Inventario de Inputs por Componente

### Prioridad ALTA (Interacción frecuente)
| Componente | Tipo | Estimado | Inputs |
|-----------|------|----------|--------|
| SolicitarPETA.jsx | Text, Checkbox, Select | 12 | Domicilio (4) + Estados (8) + Armas |
| GeneradorPETA.jsx | Text, Date, Number | 10 | Domicilio (6) + Fechas (2) + Cartucho (2) |
| RegistroPagos.jsx | Number, Date, Select | 6 | Monto, Método, Fecha |
| ReporteCaja.jsx | Number, Date, Select | 5 | Filtros: Monto, Fecha |
| MiPerfil.jsx | Password, Text | 3 | Password actual, Nueva, Confirmar |

### Prioridad MEDIA (Uso moderado)
| Componente | Tipo | Estimado | Inputs |
|-----------|------|----------|--------|
| MultiImageUploader.jsx | File | 2 | File input + Mode selection |
| DocumentUploader.jsx | File | 1 | File input |
| ArmasRegistroUploader.jsx | File, Text | 3 | File + search |
| AdminDashboard.jsx | Search, Filters | 4 | Búsqueda, filtros |
| DatosPersonalesEditor.jsx | Text | 1 | Nombre input |
| EmailEditor.jsx | Email | 2 | Email actual (read) + Email nuevo |

### Prioridad BAJA (Admin only, uso ocasional)
| Componente | Tipo | Estimado | Inputs |
|-----------|------|----------|--------|
| ArmaEditor.jsx | Text, Select, Radio | 7 | Marca, modelo, calibre, etc. |
| AdminBajasArsenal.jsx | Text, Select | 4 | Búsqueda, filters |
| AdminAltasArsenal.jsx | Text, Select | 4 | Búsqueda, filters |
| DashboardRenovaciones.jsx | Date, Select | 3 | Filtros |
| DashboardCumpleaños.jsx | Text, Date | 2 | Búsqueda |

---

## 🔧 Estándares de Implementación (v1.26.0+)

### Para `<input type="text|email|password|number|date|...">`:
```jsx
// ✅ CORRECTO (Patrón Final)
<label htmlFor="form-fieldName">
  Label text:
  <input 
    id="form-fieldName"
    name="fieldName"
    type="text"
    value={value}
    onChange={handler}
    aria-label="Descriptive text for screen readers"
    aria-required="true"  {/* Si required */}
    placeholder="..."
  />
</label>

// ❌ INCORRECTO (Antes)
<label>
  Label text:
  <input type="text" value={value} onChange={handler} />
</label>
```

### Para `<input type="file">` (hidden):
```jsx
// ✅ CORRECTO
<label htmlFor="fileUpload-document">
  📄 Seleccionar archivo
  <input
    id="fileUpload-document"
    type="file"
    accept=".pdf,.jpg"
    onChange={handler}
    aria-label="Subir documento PDF o JPG"
    hidden
  />
</label>

// ❌ INCORRECTO (Antes)
<label>
  📄 Seleccionar archivo
  <input type="file" accept=".pdf,.jpg" onChange={handler} hidden />
</label>
```

### Para `<select>`:
```jsx
// ✅ CORRECTO
<label htmlFor="methodSelect">
  Método de pago:
  <select 
    id="methodSelect"
    name="method"
    value={method}
    onChange={handler}
    aria-label="Selecciona el método de pago"
  >
    <option value="">Seleccionar...</option>
    ...
  </select>
</label>
```

### Para `<input type="checkbox|radio">`:
```jsx
// ✅ CORRECTO  
<label htmlFor="estado-yucatan">
  <input 
    id="estado-yucatan"
    type="checkbox"
    name="estados"
    value="yucatan"
    aria-label="Autorización para estado de Yucatán"
  />
  Yucatán
</label>
```

---

## 📈 Progress Tracking

### Fase 1: Dark Mode ✅ COMPLETO
- [x] 35+ CSS variables
- [x] Eliminados 30+ white backgrounds
- [x] Mejora contraste 3.8x
- [x] v1.25.0 deployed

### Fase 2: GestionArsenal ✅ COMPLETO  
- [x] 3 inputs restantes completados
- [x] 11/11 inputs WCAG AA compliant
- [x] v1.26.0 deployed

### Fase 3: Audit Global + Fixes (EN PROGRESO)
- [ ] Buscar todos los inputs sin id
- [ ] Documentar por archivo y línea
- [ ] Implementar fixes por prioridad
- [ ] Testing WCAG AA con Axe DevTools
- [ ] Deploy v1.27.0

---

## 🚀 Próximos Pasos Recomendados

### Sesión Actual (v1.27.0):
1. **Completar Prioridad ALTA** (SolicitarPETA, GeneradorPETA, RegistroPagos, ReporteCaja, MiPerfil)
   - Estimado: 4-5 horas
   - Impact: Cubre 80% de uso de inputs

2. **Build y Deploy v1.27.0**
   - Build: ~5 minutos
   - Deploy: ~3 minutos  
   - Testing: ~10 minutos

### Sesión Siguiente:
3. **Completar Prioridad MEDIA** (~3 horas)
4. **Completar Prioridad BAJA** (~2 horas)
5. **Full WCAG Testing** con Axe DevTools
6. **Deploy v1.28.0** (Final)

---

## ✨ WCAG AA Compliance Checklist

- [x] Contrast Ratio: 4.5:1 mínimo para texto (v1.25.0)
- [x] GestionArsenal inputs: id, htmlFor, aria-label (v1.26.0)
- [ ] Todos los text inputs: id, htmlFor, aria-label (v1.27.0 - EN PROGRESO)
- [ ] Todos los selects: id, htmlFor, aria-label (v1.27.0)
- [ ] Todos los file inputs: id, htmlFor, aria-label (v1.27.0)
- [ ] Todos los checkboxes/radios: id, aria-label (v1.27.0)
- [ ] Keyboard navigation: Tab through all inputs
- [ ] Screen reader: Test con NVDA o JAWS
- [ ] Final Axe audit: Zero WCAG violations
- [ ] v1.28.0 Deployment

---

## 📚 Recursos

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE Validator**: https://wave.webaim.org/
- **Label asociados**: https://www.w3.org/WAI/tutorials/forms/labels/


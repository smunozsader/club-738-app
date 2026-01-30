# Club 738 Web - Code Locations Reference
**For Quick Navigation During Fixes**

---

## 🎨 HARDCODED COLORS - BY FILE

### Top Priority (35+ colors each)

#### ComunicadosOficiales.css
```
Lines 15-49: Header colors (#1a237e, #546e7a, #1976d2, #1565c0)
Lines 83-112: Title colors & text colors
Lines 122-160: Button colors (#4caf50, #1976d2)
Lines 248-264: Card styling with hardcoded blues
Lines 304-350: Dark mode colors (hardcoded, should use vars)
```

#### HistorialAuditoria.css
```
Lines 25-70: Background & text colors (#f9f9f9, #333, #666)
Lines 87-135: Table styling with hardcoded gradients
Lines 195-240: Status colors (delete, success, etc.)
Lines 248-260: Dark mode colors (incomplete)
```

#### CobranzaUnificada.css
```
Lines 5-50: Gradient background & header styling
Lines 175-207: Input & select styling with #2c3e50, #7f8c8d
Lines 523-576: Form controls with hardcoded colors
Lines 759-944: Mobile & theme-specific rules
```

#### RegistroPagos.css
```
Lines 8-50: Header & panel styling (#2c3e50, #7f8c8d)
Lines 70-100: Search input with #ddd borders
Lines 140-200: Socio item styling
Lines 300+: Form controls & buttons
```

#### GestionArsenal.css
```
Lines 42-50: Tab buttons & styling
Lines 284-300: Form elements (no dark mode)
Lines 324-350: Checkbox styling
Lines 594+: Mobile adjustments (768px only, no 320px)
```

---

## 🔴 ALERT() CALLS - EXACT LINES

### SolicitarPETA.jsx
```
Line 116: alert('Error al cargar tus datos...')
Line 127: alert('Máximo 10 armas por PETA')
Line 139: alert('Máximo 10 estados por PETA')
Line 168: alert('Debes seleccionar al menos 1 arma')
Line 204: alert('Debes seleccionar al menos 1 estado')
Line 210: alert('Por favor completa todos los campos...')
Line 216: alert('Por favor ingresa el número de PETA anterior')
Line 324: alert('✅ Solicitud de PETA enviada...')
Line 340: alert(`Error al enviar la solicitud...`)
```

### GeneradorPETA.jsx
```
Line 257: alert('Error: No se encontró el socio...')
Line 359: alert('Error al cargar la solicitud...')
Line 439: alert('Selecciona un socio y al menos un arma')
Line 444: alert('Especifica las fechas de vigencia')
Line 449: alert('Selecciona al menos un estado')
```

### RegistroPagos.jsx
```
Line 97: alert('Error al cargar datos...')
```

---

## 📱 RESPONSIVE DESIGN GAPS

### 768px Only (Missing 320px)
1. **CobranzaUnificada.css:732** - Only has `@media (max-width: 768px)`
2. **GestionArsenal.css:573** - Only has `@media (max-width: 768px)`
3. **MisArmas.css:338** - Only has `@media (max-width: 768px)`
4. **RegistroPagos.css** - No media queries!
5. **AdminDashboard.jsx** - No media queries!
6. **SolicitarPETA.css** - Minimal mobile support

### Sidebar Layout Problems
- **RegistroPagos.css:24** - `grid-template-columns: 350px 1fr` won't fit 320px
- **CobranzaUnificada.css:2** - `max-width: 1400px` OK, but grid needs mobile collapse

---

## 🎨 OUTLINE: NONE - FILES TO FIX

```
CobranzaUnificada.css:193
CobranzaUnificada.css:554
GestionArsenal.css:301
MisArmas.css:480
documents/ImageEditor.css:57
documents/DocumentUploader.css (check all)
MisDocumentosOficiales.css (if exists)
VerificadorPETA.css (if exists)
+ 12 more across admin components
```

**Fix Pattern**:
```css
/* Remove */
outline: none;

/* Add instead */
outline: var(--focus-outline);
outline-offset: 2px;
```

---

## 🌓 DARK MODE - MISSING ENTIRELY

### Zero Dark Mode Rules
1. **CobranzaUnificada.css** - Lines 1-944 (NO :root.dark-mode)
2. **RegistroPagos.css** - Lines 1-809 (NO :root.dark-mode)
3. **GestionArsenal.css** - Lines 1-600+ (NO :root.dark-mode)
4. **MisArmas.css** - Lines 1-500+ (NO :root.dark-mode)
5. **DocumentCard.jsx** - CSS file location?
6. **AdminDashboard.jsx** - CSS file location?
7. **SolicitarPETA.css** - Minimal dark mode
8. **GeneradorPETA.css** - Minimal dark mode
9. **ExpedienteImpresor.css** - No dark mode
10. **ReporteCaja.css** - No dark mode
11. **DashboardRenovaciones.jsx** - CSS location?
12. **DashboardCumpleanos.jsx** - CSS location?

**Add Template**:
```css
:root.dark-mode .component-class {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border);
}
```

---

## 📋 MISSING ARIA LABELS - BY COMPONENT

### Admin Components (No Labels)
- **AdminToolsNavigation.jsx** - 15+ icon buttons need aria-label
- **NotificacionesCitas.jsx** - Action buttons need labels
- **HistorialAuditoria.jsx** - Delete/view buttons
- **ReportadorExpedientes.jsx** - Export/filter buttons
- **GeneradorDocumentos/** - All buttons need labels

### Document Components
- **DocumentCard.jsx** - Edit, delete, preview icons (3 per card)
- **MultiImageUploader.jsx** - File select buttons
- **ImageEditor.jsx** - Crop, zoom, rotate buttons
- **ArmasRegistroUploader.jsx** - Upload/replace buttons

### Communication
- **ComunicadosOficiales.jsx** - Download & read buttons (no labels)
- **Notificaciones.jsx** - Mark as read buttons

---

## 🔘 TOUCH TARGET SIZE < 44px

### Identified
1. **ComunicadosOficiales.jsx**
   - `.btn-descargar` - ~36px (padding: 10px 15px)
   - `.btn-leer` - ~36px

2. **DocumentCard.jsx**
   - Upload buttons - ~35px
   - Action buttons - ~32px

3. **AdminToolsNavigation.jsx**
   - Icon buttons - 32px

4. **Modal Close Buttons** (various)
   - Typically 24-30px (too small!)

5. **Admin Action Icons** (various)
   - Delete, edit buttons - 24-32px

---

## 📝 FORM VALIDATION WEAK POINTS

### No Specific Error Messages
1. **SolicitarPETA.jsx:165-220** - validarFormulario() returns true/false only
2. **GeneradorPETA.jsx:440s** - Generic error messages
3. **RegistroPagos.jsx** - Check validation logic

### No Field-Level Validation UI
- Inputs don't show validation state on blur
- No `aria-invalid` attributes
- No `aria-describedby` for error messages

### Needed
- Highlight invalid fields on blur
- Show specific error message below field
- Add aria-invalid="true" when error exists

---

## 🏗️ COMPONENT CONSISTENCY GAPS

### Button Patterns Inconsistent
- **ComunicadosOficiales.css**: padding: 10px 15px
- **RegistroPagos.css**: padding: 12px 20px
- **GestionArsenal.jsx**: padding varies
- **CobranzaUnificada.css**: inconsistent

### Missing Components
- Loading skeleton - Used in some, missing in others
- Empty states - MisArmas has one, others don't
- Error boundaries - Minimal usage
- Loading indicators - Inconsistent

---

## ⚡ PERFORMANCE OPPORTUNITIES

### Missing useMemo
1. **CobranzaUnificada.jsx** - Filter on every render
2. **ReporteCaja.jsx** - Sorting on every render
3. **MisDocumentosOficiales.jsx** - Document filtering

### Already Good ✅
1. **AdminDashboard.jsx** - Uses useMemo for filtered socios
2. **CalendarioTiradas.jsx** - Uses useMemo

### Listener Cleanup - Verify
```
App.jsx:98 ✅
App.jsx:113-126 ✅
useRole.jsx:50 ✅
Notificaciones.jsx:37-60 ✅
NotificacionesCitas.jsx:22-43 ✅
GeneradorDocumentos/* - Check all
```

---

## 📊 SPECIFIC CONTRAST ISSUES (WCAG Failures)

### Text Disappears in Dark Mode
1. **ComunicadosOficiales.css:15** - #1a237e text on #1a1a1a background
2. **HistorialAuditoria.css:31** - #333 text on dark background
3. **CobranzaUnificada.css:22** - #2c3e50 text on dark background
4. **RegistroPagos.css:12** - #2c3e50 on dark background

### Background Too Light in Dark Mode
1. **ComunicadosOficiales.css:123** - #f5f5f5 background
2. **HistorialAuditoria.css:25** - #f9f9f9 background
3. **RegistroPagos.css:59** - #f8f9fa background

---

## 🚀 QUICK FIX CHECKLIST

### File: ComunicadosOficiales.css (35 colors)
```
☐ Line 15: color: #1a237e → color: var(--text-primary)
☐ Line 22: color: #546e7a → color: var(--text-secondary)
☐ Line 40: border-left: solid #1976d2 → var(--primary)
☐ Line 49: gradient #1976d2, #1565c0 → var(--primary), var(--primary-dark)
☐ Line 123: background: #f5f5f5 → var(--bg-secondary)
☐ Lines 141-151: Button colors → use --success, --primary
☐ Add :root.dark-mode rules for all components
```

### File: CobranzaUnificada.css (32 colors)
```
☐ Line 5: gradient → use CSS variables
☐ Line 22: color: #2c3e50 → var(--text-primary)
☐ Line 27: color: #7f8c8d → var(--text-secondary)
☐ Line 36: background: #95a5a6 → var(--secondary-dark)
☐ All borders: use var(--border)
☐ All shadows: use var(--shadow-sm), etc.
☐ Add full :root.dark-mode section
```

### File: SolicitarPETA.jsx (9 alerts)
```
☐ Import: useToastContext
☐ Line 116: Replace with showToast
☐ Line 127: Replace with showToast
☐ Line 139: Replace with showToast
... (continue for all 9)
```

---

## 📍 MOBILE BREAKPOINT FIX TEMPLATE

For each file without 320px breakpoint:

```css
/* BEFORE */
@media (max-width: 768px) {
  .container { grid-template-columns: 1fr; }
}

/* AFTER */
/* Small phones: 320-480px */
@media (max-width: 480px) {
  .container { 
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
}

/* Tablets: 481-768px */
@media (min-width: 481px) and (max-width: 768px) {
  .container { 
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
}
```

---

## ✅ VALIDATION CHECKLIST

### Before Commit
```
☐ npm run build (no errors)
☐ Test in light mode (all pages readable)
☐ Test in dark mode (toggle + verify all text readable)
☐ Test on 320px width (no horizontal scroll)
☐ Test on 768px width (layout responsive)
☐ Test on 1440px (centered, max-width respected)
☐ Tab through entire page (focus visible everywhere)
☐ Press ESC on modals (closes)
☐ DevTools Console (no errors or warnings)
☐ Verify contrast (WebAIM checker on key pages)
```

---

**Last Updated**: January 29, 2026  
**Purpose**: Quick reference for developers doing fixes  
**Status**: Ready for Use


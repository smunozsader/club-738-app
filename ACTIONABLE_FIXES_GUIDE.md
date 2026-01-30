# Club 738 Web - Actionable Fixes & Implementation Guide
**Date**: January 29, 2026  
**Document**: Quick Reference for Developers  
**Status**: Phase 1 & 2 Recommendations

---

## 🔧 FIX TEMPLATES & CODE EXAMPLES

### Template 1: CSS Variable Migration

#### Pattern 1A: Text Colors
```css
/* ❌ BEFORE */
.component h2 {
  color: #1a237e;
  background: white;
}

/* ✅ AFTER */
.component h2 {
  color: var(--text-primary);
  background: var(--surface);
}

/* ✅ Dark mode already handled automatically */
:root.dark-mode {
  --text-primary: #f0f0f0;  /* Defined in color-theory-wcag.css */
  --surface: #2d2d2d;
}
```

#### Pattern 1B: Status Colors (Error/Warning/Success)
```css
/* ❌ BEFORE */
.error-message {
  color: #d32f2f;
  background: #ffebee;
  border: 1px solid #ef5350;
}

.success-message {
  color: #1b5e20;
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

/* ✅ AFTER */
.error-message {
  color: var(--error-text);
  background: var(--error-light);
  border: 1px solid var(--error);
}

.success-message {
  color: var(--success-text);
  background: var(--success-light);
  border: 1px solid var(--success);
}
```

#### Pattern 1C: Shadows & Borders
```css
/* ❌ BEFORE */
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}

/* ✅ AFTER */
.card {
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}
```

#### Pattern 1D: Gradients
```css
/* ❌ BEFORE */
.header {
  background: linear-gradient(135deg, #1976d2, #1565c0);
}

/* ✅ AFTER */
.header {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
}
```

---

### Template 2: Dark Mode CSS Rules

#### Pattern 2A: Complete Dark Mode Override
```css
/* Original light mode styles */
.component {
  background: #f5f5f5;
  color: #333;
  border-color: #e0e0e0;
}

/* ✅ ADD THIS for dark mode */
:root.dark-mode .component {
  background: var(--bg-secondary);  /* #37474f or similar */
  color: var(--text-primary);        /* #f0f0f0 */
  border-color: var(--border);       /* #444 */
}

:root.dark-mode .component:hover {
  background: var(--bg-tertiary);  /* Slightly lighter than bg-secondary */
}

:root.dark-mode .component h3 {
  color: var(--text-primary);  /* Ensure headings are readable */
}

:root.dark-mode .component p {
  color: var(--text-secondary);  /* Slightly dimmer for body text */
}
```

#### Pattern 2B: Shadows in Dark Mode
```css
/* Light mode - regular shadow */
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ✅ Dark mode - brighter shadow for depth */
:root.dark-mode .card {
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.08);
}

/* Alternative: Use CSS variable */
:root {
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:root.dark-mode {
  --shadow-sm: 0 2px 8px rgba(255, 255, 255, 0.08);
}

.card {
  box-shadow: var(--shadow-sm);  /* Works in both modes */
}
```

#### Pattern 2C: Opacity/Transparency
```css
/* ❌ BEFORE - hardcoded */
.overlay {
  background: rgba(0, 0, 0, 0.5);
}

/* ✅ AFTER - use semantic colors */
.overlay {
  background: rgba(0, 0, 0, 0.5);  /* Light mode: dark overlay */
}

:root.dark-mode .overlay {
  background: rgba(0, 0, 0, 0.7);  /* Dark mode: darker overlay */
}
```

---

### Template 3: Alert() → Toast Migration

#### Step 1: Identify Alert Calls
```bash
# Find all alert() calls
grep -r "alert(" src/ --include="*.jsx"

# In ComunicadosOficiales.jsx, SolicitarPETA.jsx, GeneradorPETA.jsx, etc.
```

#### Step 2: Replace Pattern
```jsx
/* ❌ BEFORE */
export default function SolicitarPETA({ userEmail }) {
  const handleSubmit = async () => {
    if (!formValid) {
      alert('Debes completar todos los campos');
      return;
    }
    
    try {
      // ... save logic
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
}

/* ✅ AFTER */
import { useToastContext } from '../contexts/ToastContext';

export default function SolicitarPETA({ userEmail }) {
  const { showToast } = useToastContext();
  
  const handleSubmit = async () => {
    if (!formValid) {
      showToast('⚠️ Completa todos los campos del formulario', 'warning');
      return;
    }
    
    try {
      // ... save logic
      showToast('✅ Solicitud guardada exitosamente', 'success', 3000);
    } catch (error) {
      showToast(`❌ Error: ${error.message}`, 'error', 5000);
    }
  };
}
```

#### Toast Types Reference
```jsx
showToast(message, type, duration)

// Types: 'success' | 'error' | 'warning' | 'info'
showToast('Acción completada', 'success', 3000);  // 3 sec auto-dismiss
showToast('Advertencia importante', 'warning', 5000);  // 5 sec
showToast('Error crítico', 'error', 0);  // Manual dismiss only (0 = no auto-dismiss)
showToast('Información', 'info', 4000);
```

---

### Template 4: Touch Target Size Fixes

#### Pattern 4A: Buttons
```css
/* ❌ TOO SMALL */
button {
  padding: 8px 12px;
  height: auto;
}

/* ✅ CORRECT */
button {
  min-height: 44px;  /* WCAG AA minimum */
  min-width: 44px;   /* Square buttons */
  padding: 12px 24px;  /* Ensures 44px total height */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* For icon-only buttons */
button.icon-button {
  width: 44px;
  height: 44px;
  padding: 8px;
  border-radius: 50%;
}
```

#### Pattern 4B: Form Controls
```css
/* ❌ TOO SMALL */
input, select {
  padding: 6px 8px;
  height: 32px;
}

/* ✅ CORRECT */
input, select {
  min-height: 44px;
  padding: 12px 12px;
  font-size: 16px;  /* Prevents iOS zoom */
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}
```

#### Pattern 4C: Touch Areas (Spacing)
```css
/* ❌ Too close together */
.list-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

/* ✅ Adequate spacing */
.list-item {
  min-height: 44px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.list-item + .list-item {
  margin-top: 4px;  /* Visual gap without reducing touch target */
}
```

---

### Template 5: Focus Visible Fixes

#### Pattern 5A: Replace `outline: none`
```css
/* ❌ BAD - blocks focus */
input:focus {
  outline: none;
}

/* ✅ GOOD - show focus ring */
input:focus-visible {
  outline: var(--focus-outline);  /* 2px solid blue */
  outline-offset: 2px;
}

/* ✅ ALTERNATIVE - use border */
input:focus {
  border: 2px solid var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
```

#### Pattern 5B: Focus Ring Styling
```css
/* Define in global CSS (color-theory-wcag.css already does this) */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* But override for specific components */
button:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 4px;
}

input:focus-visible {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}
```

#### Pattern 5C: Focus Trap for Modals
```jsx
/* Already implemented well in some modals */
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    // Focus trap logic
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

### Template 6: Mobile Responsive Fixes

#### Pattern 6A: Add 320px Breakpoint
```css
/* ❌ BEFORE - only 768px */
.component {
  grid-template-columns: 350px 1fr;
  gap: 20px;
  padding: 20px;
}

@media (max-width: 768px) {
  .component {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px;
  }
}

/* ✅ AFTER - add 320px breakpoint */
.component {
  grid-template-columns: 350px 1fr;
  gap: 20px;
  padding: 20px;
}

/* Small phones: 320-480px */
@media (max-width: 480px) {
  .component {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
  
  .sidebar {
    max-height: 200px;
    overflow-y: auto;
  }
  
  button {
    min-height: 44px;  /* Ensure touch targets */
  }
}

/* Larger phones/tablets: 481-768px */
@media (min-width: 481px) and (max-width: 768px) {
  .component {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .component {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

#### Pattern 6B: Grid Collapse
```css
/* Desktop - 2 column */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Tablet - 2 columns */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Mobile - 1 column */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* Very small phone */
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
  }
}
```

#### Pattern 6C: Typography Scaling
```css
/* Desktop */
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
body { font-size: 1rem; }

/* Tablet */
@media (max-width: 1024px) {
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  body { font-size: 0.95rem; }
}

/* Mobile */
@media (max-width: 768px) {
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.25rem; }
  h3 { font-size: 1.1rem; }
  body { font-size: 0.9rem; }
}

/* Very small */
@media (max-width: 480px) {
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.1rem; }
  h3 { font-size: 1rem; }
  body { font-size: 0.875rem; }
}
```

---

### Template 7: ARIA Labels

#### Pattern 7A: Icon Buttons
```jsx
/* ❌ BEFORE */
<button>
  <span>✕</span>
</button>

/* ✅ AFTER */
<button aria-label="Cerrar modal (presiona ESC)">
  <span aria-hidden="true">✕</span>
</button>

/* SVG icon version */
<button aria-label="Descargar documento">
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
</button>
```

#### Pattern 7B: Form Validation
```jsx
/* ❌ BEFORE */
<input 
  type="email" 
  placeholder="Email"
/>

/* ✅ AFTER */
<label htmlFor="email-input">Email</label>
<input
  id="email-input"
  type="email"
  placeholder="ejemplo@club738.com"
  aria-required="true"
  aria-invalid={hasError ? "true" : "false"}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" className="error-message" role="alert">
    Por favor ingresa un email válido
  </span>
)}
```

#### Pattern 7C: Tablist
```jsx
/* Already done well in MiAgenda.jsx */
<div className="filtro-tabs" role="tablist" aria-labelledby="estado-filter-label">
  <button
    role="tab"
    aria-selected={estado === 'todos'}
    aria-label="Mostrar todas las citas"
  >
    Todas
  </button>
  <button
    role="tab"
    aria-selected={estado === 'pendiente'}
    aria-label="Mostrar citas pendientes de confirmación"
  >
    Pendientes
  </button>
</div>
```

---

### Template 8: Form Validation Messaging

#### Pattern 8A: Specific Error Feedback
```jsx
/* ❌ GENERIC */
if (!valid) {
  showToast('Error en el formulario', 'error');
  return;
}

/* ✅ SPECIFIC */
const validar = () => {
  const errores = [];
  
  if (!nombre?.trim()) {
    errores.push('El nombre es requerido');
  }
  
  if (armas.length === 0) {
    errores.push('Debes seleccionar al menos 1 arma');
  } else if (armas.length > 10) {
    errores.push(`Máximo 10 armas (tienes ${armas.length})`);
  }
  
  if (!email.includes('@')) {
    errores.push('Email inválido');
  }
  
  if (errores.length > 0) {
    // Show first error
    showToast(`⚠️ ${errores[0]}`, 'warning');
    
    // Log all for debugging
    console.warn('Form validation errors:', errores);
    
    return false;
  }
  
  return true;
};
```

#### Pattern 8B: Field-Level Validation
```jsx
const [fieldErrors, setFieldErrors] = useState({});

const handleBlur = (fieldName, value) => {
  const error = validarCampo(fieldName, value);
  setFieldErrors(prev => ({
    ...prev,
    [fieldName]: error
  }));
};

return (
  <>
    <label htmlFor="email">Email *</label>
    <input
      id="email"
      value={email}
      onBlur={(e) => handleBlur('email', e.target.value)}
      aria-invalid={fieldErrors.email ? "true" : "false"}
      aria-describedby={fieldErrors.email ? "email-error" : undefined}
    />
    {fieldErrors.email && (
      <span id="email-error" className="field-error">
        {fieldErrors.email}
      </span>
    )}
  </>
);
```

---

## 📋 BATCH FIND-REPLACE COMMANDS

### Command 1: Find All Hardcoded Colors
```bash
grep -r "#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}" src/components --include="*.css" | wc -l
# Result: 100+ instances
```

### Command 2: Find All alert() Calls
```bash
grep -r "alert(" src/ --include="*.jsx" | grep -v "aria-alert"
# Files to fix: SolicitarPETA.jsx, GeneradorPETA.jsx, RegistroPagos.jsx, etc.
```

### Command 3: Find outline: none
```bash
grep -r "outline: none" src/ --include="*.css"
# Files: CobranzaUnificada.css, GestionArsenal.css, MisArmas.css, etc.
```

### Command 4: Find Missing Dark Mode Rules
```bash
# For each CSS file, check if it has :root.dark-mode rules
find src/components -name "*.css" | while read f; do
  if ! grep -q ":root.dark-mode" "$f"; then
    echo "Missing dark mode: $f"
  fi
done
```

---

## 🧪 TESTING CHECKLIST

### After Each Fix, Verify:
- [ ] Light mode: text readable, colors correct
- [ ] Dark mode: toggle and verify text readable (4.5:1 contrast minimum)
- [ ] Mobile 320px: layout doesn't break, buttons tapable (44px)
- [ ] Mobile 768px: sidebar collapses or adjusts
- [ ] Desktop 1440px: content centered, max-width respected
- [ ] Keyboard nav: Tab, Shift+Tab, Enter all work
- [ ] Focus visible: can see where focus is
- [ ] No console errors: DevTools clean

### Dark Mode Verification Script
```javascript
/* Run in browser console */
// Get all computed colors
Array.from(document.querySelectorAll('*')).forEach(el => {
  const computed = getComputedStyle(el);
  const bg = computed.backgroundColor;
  const color = computed.color;
  
  // Check contrast (simple check)
  if (bg.includes('rgb') && color.includes('rgb')) {
    // Parse and calculate contrast ratio
    console.log(`Element: ${el.className}, BG: ${bg}, Color: ${color}`);
  }
});
```

### Manual Testing Steps
1. Open app in light mode
2. Verify text readable (check 5 key pages)
3. Click theme toggle
4. Verify text still readable in dark mode
5. Resize browser to 320px width
6. Verify no horizontal scroll
7. Verify all buttons tappable (44px+)
8. Tab through entire page
9. Verify focus ring visible everywhere

---

## 📚 REFERENCE DOCS

### CSS Variable Reference
```css
/* Text Colors */
--text-primary: #1e293b;      /* Main text - 12.6:1 contrast */
--text-secondary: #334155;    /* Secondary text - 8.3:1 */
--text-muted: #64748b;        /* Muted text - 5.4:1 */
--text-disabled: #cbd5e1;     /* Disabled text - 2.9:1 */

/* Backgrounds */
--surface: #ffffff;           /* Card backgrounds */
--background: #f8fafc;        /* Page background */
--bg-secondary: #f1f5f9;      /* Secondary background */
--bg-tertiary: #e2e8f0;       /* Tertiary background */

/* Semantic Colors */
--success: #15803d;           /* Success - 5.1:1 */
--success-light: #dcfce7;
--error: #b91c1c;             /* Error - 5.8:1 */
--error-light: #fee2e2;
--warning: #b45309;           /* Warning - 4.6:1 */
--warning-light: #fef3c7;
--info: #0369a1;              /* Info - 5.5:1 */
--info-light: #e0f2fe;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
```

### WCAG Compliance Levels
```
AA (Minimum): 4.5:1 text contrast, 44px touch targets
AAA (Enhanced): 7:1 text contrast, accessible error messages
```

---

## ⏱️ IMPLEMENTATION TIMELINE

### Day 1-2: Phase 1 Critical Fixes
- Batch CSS variable migration (4 hours)
- Alert → Toast replacement (2 hours)
- Dark mode CSS addition (3 hours)
- Touch target fixes (2 hours)
- Total: ~11 hours

### Day 3-4: Phase 2 High Priority
- ARIA label additions (4 hours)
- Mobile breakpoint adds (3 hours)
- Form validation improvements (3 hours)
- Admin tool improvements (3 hours)
- Total: ~13 hours

### Day 5-6: Phase 3 Medium Priority
- Full dark mode coverage (4 hours)
- Button standardization (3 hours)
- Loading states (2 hours)
- Responsive layout fixes (3 hours)
- Total: ~12 hours

### Day 7: Phase 4 Polish & Testing
- Full QA (light + dark mode) (4 hours)
- Performance optimization (2 hours)
- Documentation updates (1 hour)
- Total: ~7 hours

**Total Estimate**: 43 hours (5-6 development days)

---

**Last Updated**: January 29, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation


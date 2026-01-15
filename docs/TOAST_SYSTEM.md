# Sistema de Toast Notifications

## Descripción

Sistema de notificaciones toast para feedback inmediato de acciones del usuario. Implementado con React Context API y portales para renderizado fuera del DOM principal.

## Componentes

### 1. ToastNotification.jsx
Componente individual de toast. Se renderiza usando `ReactDOM.createPortal()`.

**Props:**
- `message` (string): Mensaje a mostrar
- `type` ('success' | 'error' | 'warning' | 'info'): Tipo de notificación
- `duration` (number): Duración en ms (default: 4000)
- `onClose` (function): Callback al cerrar

**Tipos disponibles:**
```javascript
{
  success: { icon: '✅', color: '#4caf50' },
  error: { icon: '❌', color: '#f44336' },
  warning: { icon: '⚠️', color: '#ff9800' },
  info: { icon: 'ℹ️', color: '#2196f3' }
}
```

### 2. ToastContainer.jsx
Contenedor que gestiona múltiples toasts simultáneos.

**Props:**
- `toasts` (array): Array de toasts activos
- `removeToast` (function): Función para remover un toast

### 3. ToastContext.jsx
Context provider que provee el hook `useToastContext()` globalmente.

## Hook: useToast()

Custom hook para gestionar toasts.

**Retorna:**
```javascript
{
  toasts: [],              // Array de toasts activos
  showToast(msg, type),   // Mostrar toast genérico
  success(msg),           // Atajo para success
  error(msg),             // Atajo para error
  warning(msg),           // Atajo para warning
  info(msg),              // Atajo para info
  removeToast(id)         // Remover toast manualmente
}
```

## Uso

### Setup en App.jsx

```javascript
import { ToastProvider } from './contexts/ToastContext';

function AppWithToast() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

export default AppWithToast;
```

### Uso en componentes

```javascript
import { useToastContext } from '../contexts/ToastContext';

function MiComponente() {
  const toast = useToastContext();
  
  const handleSave = async () => {
    try {
      await guardarDatos();
      toast.success('Datos guardados correctamente');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };
  
  return <button onClick={handleSave}>Guardar</button>;
}
```

### Ejemplos de uso

```javascript
// Success
toast.success('Documento subido correctamente');

// Error
toast.error('Error al eliminar archivo');

// Warning
toast.warning('Este cambio no se puede deshacer');

// Info
toast.info('Procesando tu solicitud...');

// Duración personalizada (8 segundos)
toast.success('Cambios aplicados', 8000);
```

## Animaciones

El toast se desliza desde la derecha en desktop y desde arriba en móvil.

**CSS animations:**
```css
@keyframes toastSlideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

## Responsive

- **Desktop**: Posición fija `top-right`, slide desde derecha
- **Mobile**: Full width con margen, slide desde arriba

## Integración completada

✅ EliminarDocumentoModal
- Success: "Documento eliminado correctamente"
- Error: "Error al eliminar: {message}"

⏳ **Pendiente de integración:**
- DatosPersonalesEditor.jsx
- CURPEditor.jsx
- DomicilioEditor.jsx
- EmailEditor.jsx
- ArmaEditor.jsx
- DocumentUploader.jsx
- MultiImageUploader.jsx
- SolicitarPETA.jsx
- RegistroPagos.jsx

## Archivos

```
src/
├── components/
│   └── common/
│       ├── ToastNotification.jsx
│       ├── ToastNotification.css
│       ├── ToastContainer.jsx
│       └── ToastContainer.css
├── contexts/
│   └── ToastContext.jsx
└── hooks/
    └── useToast.js
```

## Notas de Implementación

1. **Auto-close**: Los toasts se cierran automáticamente después de `duration` ms
2. **Manual close**: Usuario puede cerrar con botón ✕
3. **Multiple toasts**: Soporta múltiples toasts apilados verticalmente
4. **Portal rendering**: No afecta el layout del componente padre
5. **Z-index**: 10000 para aparecer sobre modales (z-index típico: 1000-5000)

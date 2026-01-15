# 🧪 Testing en Vivo - 15 Enero 2026

**Objetivo**: Validar todas las nuevas features de FASE 8 y FASE 9 en producción

**URL de Testing**: https://yucatanctp.org

---

## ✅ Checklist de Testing

### 1️⃣ PWA Features (FASE 9 - Tarea #47)

**1.1 Instalación como App**
- [ ] Abrir https://yucatanctp.org en Chrome/Safari
- [ ] Verificar que aparezca prompt "Instalar Club de Caza, Tiro y Pesca de Yucatán"
- [ ] Instalar la PWA
- [ ] Abrir desde escritorio/home screen
- [ ] Verificar que se abra sin barra de navegador (standalone mode)

**1.2 Shortcuts**
- [ ] Click derecho en icono de la app instalada
- [ ] Verificar que aparezcan 3 shortcuts:
  - Mi Expediente
  - Mis Armas
  - Solicitar PETA
- [ ] Probar cada shortcut (debe abrir sección correcta)

**1.3 Offline Support**
- [ ] Con app abierta, activar modo avión
- [ ] Verificar que página principal siga funcionando
- [ ] Verificar mensaje de "Sin conexión" si aplica
- [ ] Reactivar conexión
- [ ] Verificar que se sincronice automáticamente

**1.4 Service Worker**
- [ ] Abrir DevTools → Application → Service Workers
- [ ] Verificar que sw.js esté activo
- [ ] Verificar cache "club-738-v1.20.0"
- [ ] Verificar que assets estén en cache

---

### 2️⃣ Dark Mode (FASE 8 - Tarea #44)

**2.1 Toggle Básico**
- [ ] Login como socio
- [ ] Localizar botón de dark mode (esquina superior derecha)
- [ ] Click en toggle
- [ ] Verificar que toda la UI cambie a modo oscuro
- [ ] Click nuevamente
- [ ] Verificar que vuelva a modo claro

**2.2 Persistencia**
- [ ] Activar dark mode
- [ ] Cerrar pestaña
- [ ] Abrir https://yucatanctp.org de nuevo
- [ ] Verificar que dark mode siga activo (localStorage)

**2.3 Componentes a Verificar**
- [ ] Landing page
- [ ] Dashboard socio
- [ ] Mi Expediente Digital
- [ ] Mis Armas
- [ ] Solicitar PETA
- [ ] Mis PETAs
- [ ] Calculadora PCP

---

### 3️⃣ Drag & Drop para Documentos (FASE 8 - Tarea #40)

**3.1 Upload Básico**
- [ ] Ir a "Mi Expediente Digital"
- [ ] Seleccionar documento sin subir (ej: INE)
- [ ] Arrastrar archivo PDF a la zona de drop
- [ ] Verificar feedback visual (borde verde/destacado)
- [ ] Soltar archivo
- [ ] Verificar barra de progreso
- [ ] Verificar mensaje de éxito (toast)

**3.2 Múltiples Archivos**
- [ ] Ir a sección de Fotos
- [ ] Arrastrar 3 imágenes JPG simultáneamente
- [ ] Verificar que todas se suban
- [ ] Verificar contador "2 de 3 archivos subidos"

**3.3 Validación de Tipos**
- [ ] Intentar arrastrar archivo .txt
- [ ] Verificar mensaje de error "Solo PDF, JPG, PNG"
- [ ] Intentar arrastrar archivo > 5MB
- [ ] Verificar mensaje de error "Archivo muy grande"

---

### 4️⃣ PDF Preview Modal (FASE 8 - Tarea #41)

**4.1 Abrir Modal**
- [ ] En "Mi Expediente", click en icono 👁️ de documento CURP
- [ ] Verificar que modal se abra en pantalla completa
- [ ] Verificar que PDF se renderice correctamente

**4.2 Controles de Zoom**
- [ ] Click en botón "+"
- [ ] Verificar que PDF haga zoom in
- [ ] Click en botón "-"
- [ ] Verificar que PDF haga zoom out
- [ ] Click en botón "100%"
- [ ] Verificar que vuelva a tamaño original

**4.3 Keyboard Shortcuts**
- [ ] Presionar tecla ESC
- [ ] Verificar que modal se cierre
- [ ] Abrir modal de nuevo
- [ ] Presionar +/- en teclado
- [ ] Verificar que zoom funcione

**4.4 Navegación de Páginas** (si PDF > 1 página)
- [ ] Click en flechas ← →
- [ ] Verificar que cambie de página
- [ ] Verificar contador "Página 1 de 3"

---

### 5️⃣ Búsqueda Avanzada (FASE 8 - Tarea #42)

**5.1 Búsqueda en Tiempo Real**
- [ ] Login como secretario (smunozam@gmail.com)
- [ ] Ir a Dashboard Admin o Gestión de Socios
- [ ] Escribir "Roberto" en barra de búsqueda
- [ ] Verificar que filtre resultados en < 500ms (debouncing)
- [ ] Borrar y escribir "MADAHUAR"
- [ ] Verificar que encuentre por apellido

**5.2 Filtros Combinados**
- [ ] Aplicar filtro "Estado: Activo"
- [ ] Aplicar filtro "Tiene PETA: Sí"
- [ ] Verificar que muestre solo socios con ambas condiciones
- [ ] Limpiar filtros
- [ ] Verificar que vuelva a mostrar todos

**5.3 Performance**
- [ ] Con 76 socios, verificar que búsqueda no cause lag
- [ ] Verificar que useMemo optimice renderizado

---

### 6️⃣ Excel Export (FASE 8 - Tarea #43)

**6.1 Exportar Lista de Socios**
- [ ] Login como secretario
- [ ] Ir a Dashboard o Gestión de Socios
- [ ] Click en botón "Exportar a Excel"
- [ ] Verificar que se descargue archivo .xlsx
- [ ] Abrir en Excel/Google Sheets
- [ ] Verificar 8 columnas:
  - Nombre
  - Email
  - CURP
  - Total Armas
  - Membresía 2026
  - Fecha Alta
  - Documentos Completos
  - Estado

**6.2 Datos Correctos**
- [ ] Verificar que haya 76 filas (+ header)
- [ ] Verificar que emails sean válidos
- [ ] Verificar que CURPs tengan 18 caracteres
- [ ] Verificar que fechas estén en formato legible

---

### 7️⃣ Firebase Analytics (FASE 9 - Tarea #49)

**7.1 Tracking de Eventos**
- [ ] Abrir Chrome DevTools → Console
- [ ] Filtrar por "analytics"
- [ ] Subir un documento (ej: INE)
- [ ] Verificar evento `document_uploaded` en console
- [ ] Solicitar PETA
- [ ] Verificar evento `peta_requested`
- [ ] Registrar pago (como secretario)
- [ ] Verificar evento `payment_registered`

**7.2 Page Views**
- [ ] Navegar entre secciones:
  - Mi Expediente
  - Mis Armas
  - Solicitar PETA
- [ ] Verificar `page_view` event por cada navegación

**7.3 Analytics Console** (verificar en 24-48 hrs)
- [ ] Abrir Firebase Console → Analytics
- [ ] Verificar que eventos aparezcan en dashboard
- [ ] Verificar user properties (user_role, total_armas)

---

### 8️⃣ Cloud Functions - Backups (FASE 9 - Tarea #50)

**8.1 Verificar Deployment**
- [ ] Abrir Firebase Console → Functions
- [ ] Verificar que existan 8 funciones:
  - scheduledFirestoreBackup
  - manualFirestoreBackup
  - restoreFirestoreBackup
  - listFirestoreBackups
  - onNotificacionCreated
  - onPetaCreated
  - onCitaCreated
  - testEmail
- [ ] Verificar que todas estén en status "Healthy"

**8.2 Backup Manual** (PELIGRO - solo con precaución)
- [ ] Abrir Firebase Console → Functions → manualFirestoreBackup
- [ ] Click en "Test" (solo si estás seguro)
- [ ] Verificar que backup se ejecute sin errores
- [ ] Verificar logs:
  ```
  ✅ Backup manual iniciado por admin@club738.com
  ```

**8.3 Verificar Backup Bucket**
- [ ] Abrir Google Cloud Console → Storage
- [ ] Buscar bucket: club-738-app-backups
- [ ] Verificar carpeta: firestore-backups/
- [ ] Verificar que existan backups con fecha

**8.4 Scheduler (verificar mañana 15 enero a las 3:05 AM)**
- [ ] A las 3:05 AM, revisar Cloud Scheduler
- [ ] Verificar que job scheduledFirestoreBackup se ejecutó
- [ ] Verificar nuevo backup en bucket con fecha 2026-01-15
- [ ] Verificar logs de función

---

### 9️⃣ Asset Compression (FASE 9 - Tarea #46)

**9.1 Verificar Headers en Producción**
- [ ] Abrir https://yucatanctp.org
- [ ] Abrir DevTools → Network
- [ ] Recargar página (Cmd+Shift+R)
- [ ] Click en archivo index.js
- [ ] Verificar headers:
  - `Cache-Control: public, max-age=31536000, immutable`
  - `Content-Encoding: br` (brotli)
- [ ] Verificar tamaño transferido vs tamaño real

**9.2 Performance**
- [ ] Abrir DevTools → Lighthouse
- [ ] Correr audit de Performance
- [ ] Verificar score > 90
- [ ] Verificar First Contentful Paint < 2s
- [ ] Verificar Largest Contentful Paint < 2.5s

---

### 🔟 Toast Notifications (FASE 8 - Tarea #38)

**10.1 Success Toasts**
- [ ] Subir documento
- [ ] Verificar toast verde "Documento subido exitosamente"
- [ ] Verificar que desaparezca en 3 segundos
- [ ] Agregar arma nueva
- [ ] Verificar toast "Arma agregada correctamente"

**10.2 Error Toasts**
- [ ] Intentar subir archivo muy grande
- [ ] Verificar toast rojo "Error: Archivo muy grande"
- [ ] Intentar acción sin permisos
- [ ] Verificar toast "Error: Permisos insuficientes"

**10.3 Info Toasts**
- [ ] Guardar cambios en perfil
- [ ] Verificar toast azul "Cambios guardados"

---

### 1️⃣1️⃣ Loading Skeletons (FASE 8 - Tarea #37)

**11.1 Verificar Skeletons**
- [ ] Logout y login de nuevo
- [ ] Observar carga de Mi Expediente
- [ ] Verificar que aparezcan placeholders grises (skeletons)
- [ ] Verificar que se reemplacen por contenido real
- [ ] Ir a Mis Armas
- [ ] Verificar skeletons para tabla de armas

**11.2 Performance UX**
- [ ] Throttling en DevTools → Network → Slow 3G
- [ ] Recargar página
- [ ] Verificar que skeletons den feedback visual durante carga

---

### 1️⃣2️⃣ Security Headers (FASE 9 - Tarea #45)

**12.1 Verificar CSP**
- [ ] Abrir https://yucatanctp.org
- [ ] DevTools → Network → index.html
- [ ] Verificar header `Content-Security-Policy`
- [ ] Verificar que incluya:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  - `connect-src 'self' https://*.firebaseio.com`

**12.2 Verificar Permissions-Policy**
- [ ] Verificar header `Permissions-Policy`
- [ ] Verificar: `geolocation=(), microphone=(), camera=()`

**12.3 Verificar X-Frame-Options**
- [ ] Verificar header `X-Frame-Options: DENY`
- [ ] Intentar cargar sitio en iframe (debe fallar)

---

## 🐛 Testing de Bugs Conocidos

### BUG #1: AdminDashboard CSS
- [ ] Login como secretario
- [ ] Ir a Dashboard Admin
- [ ] Verificar si stats cards tienen texto visible
- [ ] Si está invisible, activar dark mode
- [ ] Verificar si dark mode lo arregla

---

## 📊 Métricas a Recopilar

**Performance**:
- Lighthouse score: ____/100
- First Contentful Paint: ____ ms
- Largest Contentful Paint: ____ ms
- Total Blocking Time: ____ ms

**Compression**:
- Tamaño transferido: ____ KB
- Tamaño real: ____ KB
- % Reducción: ____ %

**PWA**:
- Installable: Sí / No
- Offline funciona: Sí / No
- Service Worker activo: Sí / No

**Analytics**:
- Eventos capturados: ____
- Page views tracking: Sí / No

**Backups**:
- Función deployada: Sí / No
- Bucket creado: Sí / No
- Backup manual exitoso: Sí / No

---

## 🚨 Problemas Encontrados

**Formato**: [Severidad] Componente - Descripción

Ejemplo:
```
[ALTA] PWA - Install prompt no aparece en Safari iOS
[MEDIA] Dark Mode - Toggle no persiste en X componente
[BAJA] Analytics - Evento X no se registra en console
```

### Problemas:
1. 
2. 
3. 

---

## ✅ Sign-off

**Testeado por**: _________________
**Fecha**: 15 enero 2026
**Hora inicio**: _______
**Hora fin**: _______
**Resultado general**: ✅ PASS / ⚠️ ISSUES / ❌ FAIL

**Notas adicionales**:
```
(Espacio para comentarios, observaciones, o issues no listados)
```

---

## 🔄 Próximos Pasos Post-Testing

Si todo pasa:
- [ ] Notificar a socios del club sobre nuevas features
- [ ] Enviar email con instrucciones de instalación PWA
- [ ] Monitorear Analytics por 1 semana
- [ ] Verificar backups diarios por 3 días

Si hay issues:
- [ ] Documentar bugs en GitHub Issues
- [ ] Priorizar fixes críticos
- [ ] Crear hotfix branch si es necesario
- [ ] Re-deploy y re-test

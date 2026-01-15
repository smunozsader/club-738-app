# Club 738 Web - TO-DO / Roadmap

**Última actualización**: 14 de enero 2026 (v1.16.0)

**Progreso general**: 38/50 tareas completadas (76%)

---

## 🎯 FASE 1-7: SISTEMA ADMINISTRATIVO CORE (38/38 - 100% ✅)

### ✅ FASE 1: Sistema de Roles y Permisos (4/4)
- [x] #1 - Constante ADMIN_EMAIL en App.jsx
- [x] #2 - Helper isAdmin() en componentes
- [x] #3 - Firestore rules con isSecretario() y isAdmin()
- [x] #4 - Testing de permisos por rol
**Status**: ✅ COMPLETADO - Admin separado (admin@club738.com), socio smunozam@gmail.com sin acceso admin

### ✅ FASE 2: Validación Estricta de Datos (5/5)
- [x] #5 - Validación CURP (18 chars, regex)
- [x] #6 - Validación emails (formato + duplicados)
- [x] #7 - Validación domicilios (campos requeridos)
- [x] #8 - Validación armas (matrícula única)
- [x] #9 - Mensajes de error descriptivos
**Status**: ✅ COMPLETADO - Validaciones funcionando en formularios

### ✅ FASE 3: Dashboard Admin y Analytics (5/5)
- [x] #10 - AdminDashboard.jsx con 4 stats cards
- [x] #11 - Tabla de socios con búsqueda/filtros
- [x] #12 - Indicador de progreso de documentos
- [x] #13 - Badges de estado (activo/pendiente/vencido)
- [x] #14 - Integración en App.jsx
**Status**: ✅ COMPLETADO - Dashboard funcional con bugs CSS pendientes

### ✅ FASE 4: Gestión de Arsenal (5/5)
- [x] #15 - ArmaEditor.jsx modal form
- [x] #16 - CRUD operations (create/edit/delete)
- [x] #17 - PDF upload para registros federales
- [x] #18 - Audit logging (fechaCreacion, ultimaModificacion)
- [x] #19 - Integración en ExpedienteAdminView
**Status**: ✅ COMPLETADO - Gestión completa con PDFs funcionando

### ✅ FASE 5: Sistema de Notificaciones (6/6 - 100% ✅)
- [x] #20 - Colección notificaciones en Firestore
- [x] #21 - Notificaciones.jsx banner component
- [x] #22 - onSnapshot real-time listener
- [x] #23 - Scripts admin (individual + masivo)
- [x] #24 - Cloud Function para email (onNotificacionCreada + nodemailer)
- [x] #25 - Integración WhatsApp Business API (whatsappIntegration.js)
**Status**: ✅ COMPLETADO - Sistema multi-canal: in-app + email + WhatsApp funcionando

### ✅ FASE 6: Edición de Datos de Socios (6/6 - 100% ✅)
- [x] #26 - DatosPersonalesEditor.jsx (nombre con validación)
- [x] #27 - CURPEditor.jsx (18 chars + verificación duplicados)
- [x] #28 - DomicilioEditor.jsx (campos estructurados)
- [x] #29 - EmailEditor.jsx (migración completa de datos)
- [x] #30 - Audit trail (subcollección auditoria con before/after)
- [x] #31 - Integración en ExpedienteAdminView (botones inline)
**Status**: ✅ COMPLETADO - Admin puede editar datos con confirmación y audit logging

---

## 🚧 FASE 8-9: GESTIÓN AVANZADA (0/12 - 0%)

### ✅ FASE 7: Eliminación Segura de Documentos (5/5 - 100% ✅)
- [x] #32 - Confirmación de eliminación (modal)
- [x] #33 - eliminarDocumento() con Storage.delete()
- [x] #34 - Audit logging de eliminaciones
- [x] #35 - HistorialAuditoria.jsx component
- [x] #36 - Integración en DocumentCard
**Status**: ✅ COMPLETADO - Modal confirmación, eliminación de Storage + Firestore, audit trail, historial timeline

### ⏳ FASE 8: UX y Experiencia de Usuario (0/8)
- [ ] #37 - Loading skeletons (suspense)
- [ ] #38 - Toast notifications (éxito/error)
- [ ] #39 - Confirmaciones optimistas (UI updates)
- [ ] #40 - Drag & drop para documentos
- [ ] #41 - Preview modal para PDFs
- [ ] #42 - Búsqueda avanzada con filtros
- [ ] #43 - Exportar a Excel (lista socios)
- [ ] #44 - Dark mode toggle
**Status**: ❌ NO INICIADO

### ⏳ FASE 9: Deploy y Producción (0/6)
- [ ] #45 - Firebase hosting config optimizado
- [ ] #46 - Compresión de assets (gzip/brotli)
- [ ] #47 - PWA manifest + service worker
- [ ] #48 - Error tracking (Sentry/LogRocket)
- [ ] #49 - Analytics (Google Analytics 4)
- [ ] #50 - Backup automático Firestore
**Status**: ❌ NO INICIADO

---

## 🐛 BUGS CONOCIDOS (ALTA PRIORIDAD)

### ❌ BUG #1: CSS Layout - AdminDashboard
**Síntomas**: 
- Stats "Total Socios" con texto blanco sobre fondo blanco (invisible)
- 4 stat cards no alineadas en grid
- Dashboard muy angosto a pesar de max-width: 100%

**Intentos de corrección**: 6 iteraciones sin éxito
- `color: white !important` en .stat-card
- `grid-template-columns: repeat(4, 1fr)` en .admin-stats
- Removido max-width: 1400px

**Causa probable**: Cascada CSS, especificidad, o estilos heredados
**Acción requerida**: Refactor CSS completo o inspección DevTools

### ❌ BUG #2: Tabla Admin Desalineada
**Síntomas**:
- Headers (6 columnas) no coinciden con datos
- Columnas: Socio, Email, CURP, Armas, Progreso Documentos, Acciones

**Intentos de corrección**: 3 iteraciones
- `table-layout: auto` + `white-space: nowrap`
- Múltiples cambios auto ↔ fixed

**Causa probable**: Widths de columna no especificados, contenido dinámico
**Acción requerida**: Definir anchos fijos o porcentuales por columna

### ❌ BUG #3: Documentos no visibles en Expedientes
**Síntomas**:
- 75 CURPs subidos a Storage y sincronizados en Firestore
- Constancias de Antecedentes también subidas
- NO aparecen en vista "Mi Expediente Digital" del socio

**Datos conocidos**:
- Script sincronizar-curps-storage.cjs ejecutado exitosamente
- URLs guardadas en `documentosPETA.curp.url`
- DocumentList.jsx renderiza lista de documentos

**Causa probable**: 
- DocumentList.jsx no lee campo .url de Firestore
- Filtrado incorrecto de documentos sin URL
- Mapeo entre tipos de documentos inconsistente

**Acción requerida**: Debug DocumentList.jsx, verificar estructura Firestore

### ❌ BUG #4: Tabla Armas Angosta (ExpedienteAdminView)
**Síntomas**:
- Tabla de armas no usa ancho completo disponible
- 9 columnas apretadas en espacio reducido

**Intentos de corrección**: 5 iteraciones
- `table-layout: fixed` → `auto`
- `min-width: 1000px` → `100%`
- `width: 100%` en múltiples contenedores

**Causa probable**: Contenedores padres con width constraints
**Acción requerida**: Inspeccionar jerarquía de contenedores

---

## 📊 MÉTRICAS DE PROGRESO

**FASE 1**: ████████████████████ 100% (4/4)
**FASE 2**: ████████████████████ 100% (5/5)
**FASE 3**: ████████████████████ 100% (5/5)
**FASE 4**: ████████████████████ 100% (5/5)
**FASE 5**: █████████████░░░░░░░ 67% (4/6)
**FASE 6**: ░░░░░░░░░░░░░░░░░░░░ 0% (0/6)
**FASE 7**: ░░░░░░░░░░░░░░░░░░░░ 0% (0/5)
**FASE 8**: ░░░░░░░░░░░░░░░░░░░░ 0% (0/8)
**FASE 9**: ░░░░░░░░░░░░░░░░░░░░ 0% (0/6)

**TOTAL**: ██████████░░░░░░░░░░ 50% (25/50)

---

## 📝 NOTAS DE DESARROLLO

### Commits recientes (13 Ene 2026)
- `8b256c8` - fix(auth): Cambiar credenciales admin de smunozam@gmail.com a admin@club738.com
- `0e130c4` - fix(ui): Ancho completo en AdminDashboard y ExpedienteAdminView
- `6575d27` - fix(css): Stats color y tabla layout (sin éxito)

### Deploys recientes
- 6+ deploys a producción durante debugging de CSS
- URL: https://club-738-app.web.app

### Scripts ejecutados
- ✅ sincronizar-curps-storage.cjs (75 CURPs)
- ✅ crear-notificacion-individual.cjs (testing)
- ⏳ Constancias pendientes de verificar visibilidad

---

## ✅ Completado

### v1.13.0 - ExpedienteImpresor + Fix VerificadorPETA (7 Ene 2026)
- [x] **ExpedienteImpresor.jsx** - Nuevo módulo para preparar impresión de expedientes
  - Búsqueda de socio por nombre o email
  - Vista de todos los documentos digitales con estado (✅/❌)
  - Indicador de copias requeridas por documento
  - Botón "Ver / Imprimir" individual por documento
  - Botón "Abrir todos para imprimir" (múltiples pestañas)
  - Lista de registros de armas (RFA) del socio
  - Notas de impresión (INE 200%, etc.)
- [x] **Fix VerificadorPETA** - Badge de progreso ahora dinámico
  - Auto-marca documentos existentes en Firestore/Storage
  - Progreso refleja documentos realmente encontrados
- [x] **WCAG 2.1 AA** - Mejoras de contraste de color
  - App.css variables actualizadas
  - DocumentList.css, MultiImageUploader.css reescritos

### v1.12.1 - Enlaces SEDENA + Redes Sociales (6 Ene 2026)
- [x] **Enlaces SEDENA** - Nueva sección en landing page
  - Pago PETA (hasta 3 armas) - formato e5cinco
  - Pago por Arma Adicional
  - Todos los Formatos e5cinco
  - Portal DCAM (Comercialización)
- [x] **Redes sociales en footer** - Facebook, Instagram, Google Maps

### v1.12.0 - Rediseño UX Expediente Digital (6 Ene 2026)
- [x] Renombrado "Mis Documentos PETA" → "Mi Expediente Digital"
- [x] Documentos eliminados del upload (se entregan físicos): fotoPETA, reciboe5cinco
- [x] Certificados médicos ahora opcionales en digital
- [x] Tarjeta "Estado de Pagos" habilitada con badge dinámico
- [x] Foto credencial acepta JPG directo (sin conversión forzada)

### v1.11.0 - Módulo Corte de Caja + Sincronización (6 Ene 2026)
- [x] **ReporteCaja.jsx** - Módulo de corte de caja / reporte de pagos
  - 4 tarjetas resumen (total recaudado, pagados, pendientes, desglose)
  - Agrupación por método de pago (efectivo, transferencia, tarjeta, cheque)
  - Filtros: estado, búsqueda, rango de fechas
  - Exportar a CSV, vista optimizada para impresión
- [x] **Sincronización de pagos** - RegistroPagos ahora actualiza `renovacion2026` + `membresia2026`
- [x] **DashboardRenovaciones** - Lee de ambas fuentes de pago
- [x] **firestore.rules** - Secretario puede actualizar todos los campos
- [x] **Firebase Functions** - Deploy de funciones email (onPetaCreated, testEmail)
- [x] **Paleta CSS centralizada** - Variables :root para colores consistentes
- [x] **UI mejorada** - Logo como botón home, footer legible, botones volver estilizados

### v1.10.1 - Modalidad Armas + Estados Sugeridos (5 Ene 2026)
- [x] **Campo modalidad en armas** - 'caza', 'tiro', 'ambas'
- [x] **Script actualizar-modalidad-armas.cjs** - Inferencia automática
- [x] 310 armas clasificadas (46 caza, 180 tiro, 84 ambas)
- [x] **MisArmas.jsx** - Secretario puede editar modalidad con dropdown
- [x] **SolicitarPETA.jsx** - Advertencia (no bloqueo) por modalidad
- [x] **Estados sugeridos FEMETI 2026** - 10 estados para Tiro Práctico
- [x] **Estados sugeridos Caza** - 8 estados región Sureste + UMAs
- [x] Botón "Usar estados sugeridos" en formulario PETA
- [x] Firestore rules para subcolección petas
- [x] Secretario puede actualizar modalidad de armas

### v1.10.0 - Módulo PETA Completo (5 Ene 2026)
- [x] **SolicitarPETA.jsx** - Formulario para socios soliciten PETAs
- [x] **MisPETAs.jsx** - Vista de estado de solicitudes PETA
- [x] **VerificadorPETA.jsx** - Checklist de verificación para secretario
- [x] **RegistroPagos.jsx** - Módulo de cobranza y activación membresías
- [x] Integración en App.jsx (dashboard socio + panel secretario)
- [x] Manual de usuario completo (MANUAL_USUARIO.md)
- [x] Estructura Firestore para colección `petas`
- [x] 6 estados de tracking del trámite PETA
- [x] Historial de cambios con timeline
- [x] Selección de hasta 10 armas por PETA
- [x] Selección de hasta 10 estados (Competencia/Caza)
- [x] Cálculo automático de vigencias según tipo
- [x] Registro de pagos con 4 conceptos
- [x] Activación automática de membresía 2026

### v1.9.1 - Renombrado Sitio Web (5 Ene 2026)
- [x] Título cambiado a "Club de Caza, Tiro y Pesca de Yucatán, A.C."
- [x] Meta descripción actualizada
- [x] 6 mensajes VIP actualizados con nuevo nombre
- [x] Texto de ORIGINALES corregido en mensajes VIP
- [x] Agregado: "Foto infantil; una para cada PETA"
- [x] Agregado: "Formato de PAGO e5 por derechos"

### v1.9.0 - Normalización Domicilios + UI (5 Ene 2026)
- [x] 76 domicilios normalizados en Excel
- [x] Domicilios importados a Firestore (calle, colonia, municipio, estado, cp)
- [x] GeneradorPETA lee domicilio de Firestore y pre-llena campos
- [x] Headers unificados (LandingPage, CalendarioTiradas, CalculadoraPCP)
- [x] Footers unificados con WhatsApp + Email mailto:
- [x] VIP Ariel Paredes agregado

### v1.8.0 - UI Consistency (5 Ene 2026)
- [x] Headers unificados (LandingPage, CalendarioTiradas, CalculadoraPCP, Dashboard)
- [x] Footers unificados con WhatsApp + Email funcional
- [x] Badge SEMARNAT agregado a todos los headers
- [x] Logos corregidos (paths a /assets/logo-club-738.jpg)
- [x] WhatsApp clickable en footer y modales
- [x] Email con mailto: funcional en todas las páginas
- [x] copilot-instructions.md actualizado con componentes faltantes

### v1.7.0 - Credenciales 2026
- [x] 35 credenciales generadas con Canva Bulk Create
- [x] PDFs de impresión listos (ANVERSOS.pdf + REVERSOS.pdf)
- [x] Fotos organizadas y renombradas
- [x] Script crear_pdfs_credenciales.py funcional

### v1.6.x - Portal Base
- [x] Landing Page pública
- [x] Calendario de Tiradas 2026
- [x] Calculadora PCP
- [x] Dashboard de socios
- [x] Mis Armas (read-only)
- [x] Mis Documentos Oficiales (CURP + Constancia)
- [x] Panel de Cobranza (DashboardRenovaciones)
- [x] Panel de Cumpleaños (DashboardCumpleanos)
- [x] GeneradorPETA - Oficios PDF para SEDENA

---

## ⏳ En Progreso

### Credenciales
- [ ] **Firma del Presidente** - Conseguir firma limpia para agregar al diseño Canva
- [ ] Regenerar 35 credenciales con firma
- [ ] Integrar descarga de credencial desde portal del socio

---

## 📋 Backlog

### 🎫 Credenciales Digitales
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| **Firma digital del socio** | Alta | Componente canvas para capturar firma (teléfono/mouse) |
| Impresión PVC | Alta | Evaluar proveedor para impresión tipo licencia de conducir |
| "Mi Credencial" | Alta | Card en dashboard para descargar credencial digital |
| Credenciales faltantes | Baja | 41 socios sin foto pendientes |

### 📄 Módulo PETA - Features Adicionales
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| ~~**Solicitar PETA**~~ | ~~Alta~~ | ✅ Completado v1.10.0 - SolicitarPETA.jsx |
| ~~**Tracker trámites**~~ | ~~Alta~~ | ✅ Completado v1.10.0 - MisPETAs.jsx |
| ~~**Verificador docs**~~ | ~~Alta~~ | ✅ Completado v1.10.0 - VerificadorPETA.jsx |
| **Cambio de estado a "Enviado 32ZM"** | Alta | Secretario marca cuando envía a Zona Militar |
| **Registro número PETA asignado** | Alta | Secretario ingresa número oficial de SEDENA |
| **Alertas vencimiento** | Media | Notificar cuando PETA esté por vencer (30 días) |
| Historial PETAs | Media | Ver PETAs anteriores del socio (años pasados) |
| Descargar oficio PDF | Media | Generar PDF del oficio PETA desde solicitud |

### 💰 Módulo de Cobranza
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| ~~**Registro de pagos**~~ | ~~Alta~~ | ✅ Completado v1.10.0 - RegistroPagos.jsx |
| ~~**Corte de caja**~~ | ~~Alta~~ | ✅ Completado v1.11.0 - ReporteCaja.jsx |
| **Reminder semanal** | Alta | Notificación al secretario con lista de morosos |
| **Generador comunicados** | Alta | Templates email/WhatsApp de cobro personalizados |
| Histórico de pagos | Media | Ver pagos de años anteriores por socio |
| ~~Dashboard de cobranza~~ | ~~Media~~ | ✅ Completado - Gráficas en ReporteCaja |

### 🗄️ Base de Datos
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| ~~**Normalizar domicilios**~~ | ~~Alta~~ | ✅ Completado v1.9.0 |
| ~~Migrar datos Excel~~ | ~~Alta~~ | ✅ 76 domicilios importados a Firestore |
| Validar CURPs | Media | Verificar formato y datos extraídos |

### 🔔 Notificaciones
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| Vencimiento documentos | Media | Alertar cuando certificados/constancias venzan |
| Vencimiento PETA | Media | Alertar 30 días antes de vencimiento |
| Cumpleaños socios | Baja | Notificación al secretario |

### 💳 Integración e5cinco
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| ~~Link a portal e5cinco~~ | ~~Baja~~ | ✅ Completado v1.12.1 - Enlaces SEDENA en landing |
| Verificar pago | Baja | Subir comprobante y validar |

---

## 🗓️ Calendario de Implementación Sugerido

### Enero 2026
- [x] Módulo PETA completo (solicitud + verificación + cobranza)
- [x] Manual de usuario
- [x] ExpedienteImpresor para preparar impresiones
- [x] Enlaces SEDENA e5cinco
- [ ] Completar credenciales (firma presidente)
- [ ] Implementar cambio de estado a "Enviado 32ZM"

### Febrero 2026
- [ ] Reminder semanal cobranza
- [ ] Generador de comunicados WhatsApp/Email
- [ ] Alertas de vencimiento de PETAs
- [ ] Descargar oficio PDF desde solicitud

### Marzo 2026
- [ ] Mi Credencial digital descargable
- [ ] Firma digital del socio
- [ ] Histórico de pagos años anteriores

---

## 📊 Métricas Actuales

| Métrica | Valor |
|---------|-------|
| Total socios en BD | 76 |
| Domicilios en Firestore | 76 (100%) |
| Credenciales generadas | 35 |
| Credenciales pendientes | 41 (sin foto) |
| Versión actual | v1.13.0 |
| Última release | 7 Ene 2026 |
| Componentes PETA | 5 (SolicitarPETA, MisPETAs, VerificadorPETA, ExpedienteImpresor, GeneradorPETA) |
| Componentes Cobranza | 3 (RegistroPagos, DashboardRenovaciones, ReporteCaja) |

---

## 📁 Documentación Relacionada

- [PETA_SCHEMA.md](./PETA_SCHEMA.md) - Esquema detallado del módulo PETA
- [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) - Manual de usuario del portal
- [copilot-instructions.md](../.github/copilot-instructions.md) - Instrucciones del proyecto
- [DEVELOPMENT_JOURNAL.md](./DEVELOPMENT_JOURNAL.md) - Bitácora de desarrollo

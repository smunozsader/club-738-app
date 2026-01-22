# AdminDashboard Architecture - v1.29.0

## 🏗️ Component Hierarchy

```
App.jsx
├─ useRole() → role = 'administrator' OR 'socio'
├─ useState(activeSection) → controls which component renders
│
├─ IF role === 'administrator'
│  └─ <admin-mode>
│     ├─ <header className="admin-header">
│     │  ├─ Logo + "Panel de Administración"
│     │  ├─ User email: admin@club738.com
│     │  └─ Logout button
│     │
│     └─ <main className="admin-main">
│        │
│        ├─ activeSection === 'admin-dashboard'
│        │  └─ <AdminDashboard>
│        │     ├─ <aside className="admin-tools-sidebar">  ← THE SIDEBAR
│        │     │  ├─ 👥 Gestión de Socios (2 tools)
│        │     │  ├─ 🎯 Módulo PETA (3 tools)
│        │     │  ├─ 💰 Módulo Cobranza (5 tools)
│        │     │  ├─ 🔫 Gestión de Arsenal (2 tools)
│        │     │  ├─ 📅 Agenda (1 tool)
│        │     │  └─ 📊 Reportes (1 tool)
│        │     │
│        │     └─ <div className="admin-main-content">
│        │        ├─ Header con search/filtros
│        │        ├─ Estadísticas rápidas
│        │        └─ Tabla de socios
│        │
│        ├─ activeSection === 'reportador-expedientes'
│        │  └─ <ReportadorExpedientes /> ✅
│        │
│        ├─ activeSection === 'expediente'
│        │  └─ <ExpedienteAdminView /> ✅
│        │
│        ├─ activeSection === 'admin-solicitar-peta'
│        │  └─ <SolicitarPETA targetEmail={email} /> ✅
│        │
│        ├─ activeSection === 'registro-pagos'
│        │  └─ <RegistroPagos userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'reporte-caja'
│        │  └─ <ReporteCaja userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'dashboard-renovaciones'
│        │  └─ <DashboardRenovaciones userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'verificador-peta'  ← MOVED TO ADMIN SECTION
│        │  └─ <VerificadorPETA userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'generador-peta'    ← MOVED TO ADMIN SECTION
│        │  └─ <GeneradorPETA userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'expediente-impresor' ← MOVED TO ADMIN SECTION
│        │  └─ <ExpedienteImpresor userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'cumpleanos'        ← MOVED TO ADMIN SECTION
│        │  └─ <DashboardCumpleanos userEmail={admin} /> ✅
│        │
│        ├─ activeSection === 'admin-bajas-arsenal' ← MOVED TO ADMIN SECTION
│        │  └─ <AdminBajasArsenal /> ✅
│        │
│        ├─ activeSection === 'admin-altas-arsenal' ← MOVED TO ADMIN SECTION
│        │  └─ <AdminAltasArsenal /> ✅
│        │
│        ├─ activeSection === 'mi-agenda'        ← MOVED TO ADMIN SECTION
│        │  └─ <MiAgenda onBack={...} /> ✅
│        │
│        └─ activeSection === 'cobranza'         ← MOVED TO ADMIN SECTION
│           └─ <CobranzaUnificada onBack={...} /> ✅
│
├─ ELSE role === 'socio'
│  └─ <socio-dashboard>
│     ├─ Dashboard regular de socio
│     ├─ Mis documentos
│     ├─ Mis armas
│     ├─ Mis PETAs
│     └─ etc...
│
└─ ELSE no user
   └─ <LandingPage /> (public page)
```

## 🎯 15 Admin Tools - Complete List

### 👥 Gestión de Socios (2 tools)
1. **Gestión de Socios** (Table view - default)
   - Button: onVerExpediente() → setActiveSection('expediente')
   - Shows: All socios, filters, search, progress indicators
2. **Reportador Expedientes**
   - Button: onReportadorExpedientes() → setActiveSection('reportador-expedientes')
   - Shows: Reports and analysis of socios' documents

### 🎯 Módulo PETA (3 tools)
3. **Verificador PETA**
   - Button: onVerificadorPETA() → setActiveSection('verificador-peta')
   - Component: `<VerificadorPETA userEmail={admin} />`
   - Shows: Checklist of digital and physical document verification

4. **Generador PETA**
   - Button: onGeneradorPETA() → setActiveSection('generador-peta')
   - Component: `<GeneradorPETA userEmail={admin} />`
   - Shows: PDF generation interface for PETA oficios

5. **Expediente Impresor**
   - Button: onExpedienteImpresor() → setActiveSection('expediente-impresor')
   - Component: `<ExpedienteImpresor userEmail={admin} />`
   - Shows: Prepare and print complete expedients

### 💰 Módulo Cobranza (5 tools)
6. **Panel Cobranza**
   - Button: onCobranza() → setActiveSection('cobranza')
   - Component: `<CobranzaUnificada onBack={...} />`
   - Shows: Unified collection/billing panel

7. **Registro de Pagos**
   - Button: onRegistroPagos() → setActiveSection('registro-pagos')
   - Component: `<RegistroPagos userEmail={admin} />`
   - Shows: Register individual membership payments

8. **Reporte de Caja**
   - Button: onReporteCaja() → setActiveSection('reporte-caja')
   - Component: `<ReporteCaja userEmail={admin} />`
   - Shows: Cash register and payment reports with CSV export

9. **Renovaciones 2026**
   - Button: onDashboardRenovaciones() → setActiveSection('dashboard-renovaciones')
   - Component: `<DashboardRenovaciones userEmail={admin} />`
   - Shows: 2026 renewal tracking dashboard

10. **Cumpleaños**
    - Button: onDashboardCumpleanos() → setActiveSection('cumpleanos')
    - Component: `<DashboardCumpleanos userEmail={admin} />`
    - Shows: Socios' birthdays and demographics

### 🔫 Gestión de Arsenal (2 tools)
11. **Bajas de Arsenal**
    - Button: onAdminBajas() → setActiveSection('admin-bajas-arsenal')
    - Component: `<AdminBajasArsenal />`
    - Shows: Manage weapon removal requests

12. **Altas de Arsenal**
    - Button: onAdminAltas() → setActiveSection('admin-altas-arsenal')
    - Component: `<AdminAltasArsenal />`
    - Shows: Manage new weapon registration requests

### 📅 Agenda & Citas (1 tool)
13. **Mi Agenda**
    - Button: onMiAgenda() → setActiveSection('mi-agenda')
    - Component: `<MiAgenda onBack={...} />`
    - Shows: Manage socios' appointments

### Additional (not in sidebar - triggered from table)
14. **Ver Expediente** (per socio)
    - Button: onVerExpediente(email) → setSocioSeleccionado(email); setActiveSection('expediente')
    - Component: `<ExpedienteAdminView socioEmail={email} />`
    - Shows: Detailed view of one socio's expedient

15. **Solicitar PETA** (per socio)
    - Button: onSolicitarPETA(email) → setSocioParaPETA(email); setActiveSection('admin-solicitar-peta')
    - Component: `<SolicitarPETA targetEmail={email} />`
    - Shows: Request PETA on behalf of socio

## 🔄 Navigation Flow

```
User (admin@club738.com) logs in
    ↓
useEffect(): role === 'administrator' detected
    ↓
setActiveSection('admin-dashboard')
    ↓
AdminDashboard renders with sidebar
    ↓
User clicks button in sidebar
    ↓
onXxxClick() callback fires → setActiveSection('xxx')
    ↓
App.jsx rerenders, finds matching activeSection handler
    ↓
Component renders in <main className="admin-main">
    ↓
User clicks "Volver al Panel Admin"
    ↓
setActiveSection('admin-dashboard')
    ↓
AdminDashboard re-renders again (full circle)
```

## 🔐 Security Rules

```javascript
// Only admin@club738.com can:
if (user.email === ADMIN_EMAIL) {
  // Access admin mode
  // View all socios' data
  // Modify PETA documents
  // Register payments
  // Generate PDFs
  // Manage arsenal
  // Manage schedule
}
```

## 📦 Import Chain

```
App.jsx imports:
├─ AdminDashboard (admin/AdminDashboard.jsx)
├─ ExpedienteAdminView (admin/ExpedienteAdminView.jsx)
├─ ReportadorExpedientes (admin/ReportadorExpedientes.jsx)
├─ VerificadorPETA (VerificadorPETA.jsx)
├─ GeneradorPETA (GeneradorPETA.jsx)
├─ ExpedienteImpresor (ExpedienteImpresor.jsx)
├─ DashboardCumpleanos (DashboardCumpleanos.jsx)
├─ DashboardRenovaciones (DashboardRenovaciones.jsx)
├─ RegistroPagos (RegistroPagos.jsx)
├─ ReporteCaja (ReporteCaja.jsx)
├─ CobranzaUnificada (CobranzaUnificada.jsx)
├─ AdminBajasArsenal (AdminBajasArsenal.jsx)
├─ AdminAltasArsenal (AdminAltasArsenal.jsx)
├─ MiAgenda (MiAgenda.jsx)
└─ SolicitarPETA (SolicitarPETA.jsx)
```

---

**Status**: ✅ FULLY FUNCTIONAL
**Last Updated**: 18 Enero 2026
**Version**: v1.29.0

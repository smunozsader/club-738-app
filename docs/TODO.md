# Club 738 Web - TO-DO / Roadmap

**Última actualización**: 5 de enero 2026 (v1.9.1)

---

## ✅ Completado

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

---

## 📋 Backlog

### 🎫 Credenciales Digitales
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| Firma digital del socio | Media | Componente canvas para firma en web app |
| "Mi Credencial" | Media | Card en dashboard para descargar credencial digital |
| Credenciales faltantes | Baja | 41 socios sin foto pendientes |

### � Base de Datos
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| ~~**Normalizar domicilios**~~ | ~~Alta~~ | ✅ Completado v1.9.0 |
| ~~Migrar datos Excel~~ | ~~Alta~~ | ✅ 76 domicilios importados a Firestore |
| Validar CURPs | Media | Verificar formato y datos extraídos |

### �💰 Módulo de Cobranza
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| **Reminder semanal** | Alta | Notificación al secretario con lista de morosos |
| **Generador comunicados** | Alta | Templates email/WhatsApp de cobro personalizados |
| Histórico de pagos | Media | Ver pagos de años anteriores por socio |

### 📄 Módulo PETA (Nuevo)
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| **Solicitar PETA** | Alta | Formulario para socio solicite PETA (Tiro/Competencia/Caza) |
| ~~**Generador oficios**~~ | ~~Alta~~ | ✅ Completado v1.8.0 - GeneradorPETA.jsx |
| **Tracker trámites** | Alta | Dashboard estado de cada solicitud |
| ~~Selección de armas~~ | ~~Alta~~ | ✅ Máx 10 armas del inventario del socio |
| ~~Selección de estados~~ | ~~Alta~~ | ✅ Máx 10 estados (Caza/Competencia) |
| **Alertas vencimiento** | Media | Notificar cuando PETA esté por vencer |
| Historial PETAs | Media | Ver PETAs anteriores del socio |

#### Tipos de PETA
| Tipo | Vigencia | Requisitos Especiales |
|------|----------|----------------------|
| Práctica de Tiro | Ene → Dic (mismo año) | Ninguno |
| Competencia Nacional | Ene → Dic (mismo año) | 10 estados + Calendario FEMETI |
| Caza | Jul → Jun (siguiente año) | 10 estados + Licencia caza SEMARNAT |

#### Estados del Trámite
```
documentacion_proceso → documentacion_completa → enviado_32zm → revision_sedena → aprobado/rechazado
```

### 🔔 Notificaciones
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| Vencimiento documentos | Media | Alertar cuando certificados/constancias venzan |
| Vencimiento PETA | Media | Alertar 30 días antes de vencimiento |
| Cumpleaños socios | Baja | Notificación al secretario |

### 💳 Integración e5cinco
| Tarea | Prioridad | Descripción |
|-------|-----------|-------------|
| Link a portal e5cinco | Baja | Información de cómo pagar derechos SEDENA |
| Verificar pago | Baja | Subir comprobante y validar |

---

## 🗓️ Calendario de Implementación Sugerido

### Enero 2026
- [ ] Completar credenciales (firma presidente)
- [ ] Implementar reminder semanal cobranza
- [ ] Generador de comunicados WhatsApp/Email

### Febrero 2026
- [ ] Módulo PETA - Formulario de solicitud
- [ ] Módulo PETA - Generador de oficios PDF
- [ ] Módulo PETA - Tracker de trámites

### Marzo 2026
- [ ] Alertas de vencimiento (documentos + PETA)
- [ ] Mi Credencial digital
- [ ] Firma digital del socio

---

## 📊 Métricas Actuales

| Métrica | Valor |
|---------|-------|
| Total socios en BD | 76 |
| Domicilios en Firestore | 76 (100%) |
| Credenciales generadas | 35 |
| Credenciales pendientes | 41 (sin foto) |
| Versión actual | v1.9.1 |
| Última release | 5 Ene 2026 |

---

## 📁 Documentación Relacionada

- [PETA_SCHEMA.md](./PETA_SCHEMA.md) - Esquema detallado del módulo PETA
- [copilot-instructions.md](../.github/copilot-instructions.md) - Instrucciones del proyecto

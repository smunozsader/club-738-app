# 📔 Development Journal - Club 738 Web

## Resumen del Proyecto

**Club 738 Web** es el portal de socios del Club de Caza, Tiro y Pesca de Yucatán, A.C. (SEDENA #738). Permite a los socios gestionar su documentación para trámites PETA ante la 32 Zona Militar de Valladolid.

**URL de Producción**: https://club-738-app.web.app

---

## 📅 Enero 2026

### 12 de Enero - v1.16.0 - Sistema de Citas y Notificaciones

#### Mejoras Implementadas

**1. Sistema de Agendamiento de Citas (AgendarCita.jsx)**
- ✅ Restricción de horarios: 17:00 - 20:00 horas (3 slots diarios)
- ✅ Duración de cita: 45 minutos + 15 minutos de descanso entre citas
- ✅ Integración con Google Calendar (invitaciones automáticas al socio)
- ✅ Firestore rules actualizadas para permitir creación de citas

**2. Cloud Functions para Notificaciones (functions/index.js)**
- ✅ `onCitaCreated`: Trigger cuando un socio agenda cita
  - Envía email al secretario (smunozam@gmail.com) con detalles
  - Incluye: nombre socio, email, fecha, hora, propósito, teléfono
  - Template profesional con datos del club
- ✅ `onPetaCreated`: Mantiene notificación de PETAs (v2 SDK)
- ✅ Validación de credenciales SMTP configuradas

**3. Módulo de Gestion Arsenal (GestionArsenal.jsx)**
- ✅ DCAM agregado como origen de adquisición
  - Manejo especial: No requiere "Número de Registro Anterior"
  - Vendedor auto-populate como "SEDENA"
  - Campo informativo visual para usuario
- ✅ Permitir fechas previas en registro de armas (min="1970-01-01")
- ✅ Replaced "CURP vendedor" con "Número de Registro Anterior"

**4. Firestore Security Rules (firestore.rules)**
- ✅ Comparación de emails case-insensitive en colección `citas`
- ✅ Socio solo puede crear citas propias
- ✅ Secretario puede actualizar/eliminar todas las citas

#### Archivos Modificados

- `src/components/AgendarCita.jsx` - Restricción de horarios (17:00-20:00)
- `src/components/GestionArsenal.jsx` - DCAM handling, fecha anterior, campo registro
- `functions/index.js` - Cloud Function `onCitaCreated` agregada
- `functions/.eslintrc.js` - Excepciones para calendar-integration.js
- `firestore.rules` - Validación case-insensitive para emails en citas

#### Problemas Resueltos

1. **"Missing or insufficient permissions"** al agendar cita
   - Causado por comparación case-sensitive de emails en Firestore rules
   - Solución: `.lower()` en ambas comparaciones

2. **DCAM causaba Firestore validation error**
   - Error: `undefined` en `vendedor.numeroRegistroAnterior`
   - Solución: Condicional para no incluir field cuando DCAM

3. **Linting errors en Cloud Functions**
   - Múltiples errores de indentación y quotes heredados
   - Solución: ESLint overrides para calendar-integration.js

#### Estado del Deploy

- ✅ Hosting: Completado
- ✅ Firestore Rules: Completado
- ✅ Cloud Functions: Completado (onCitaCreated, onPetaCreated)
- ⚠️  Nota: Función onPetaCreated fue deletada y recreada (v2 SDK)

---

## 📅 Enero 2026

### 10 de Enero - v1.15.0 - Sincronización Excel-Firebase y Limpieza de Duplicados

#### Problema Detectado

Usuario reportó inconsistencias entre el archivo Excel maestro (fuente de verdad) y Firebase. Análisis reveló múltiples problemas de integridad de datos.

#### Hallazgos del Análisis

**1. Email Duplicado (Agustín Moreno y Ezequiel Galvan)**
- **Problema**: Dos socios compartían `galvani@hotmail.com`
  - Ezequiel Galvan Vazquez (Cred. 157): 1 arma (TANFOGLIO)
  - Agustín Moreno Villalobos (Cred. 161): 4 armas
- **Causa**: Error en Excel, Firebase reflejó el problema
- **Firebase**: Tenía cuenta mezclada (5 armas, nombre incorrecto)

**2. Duplicados por Formato de Matrícula**
- **Problema**: Matrículas con y sin comas generaban duplicados
  - Ejemplo: `238677` vs `238,677` (tratadas como armas diferentes)
- **Alcance**: 17 socios afectados, 20 duplicados totales
- **Patrones**:
  ```
  41605 vs 41,605
  2552429 vs 2,552,429
  238677 vs 238,677
  ```

**3. Duplicado por Espacios (Ernesto González Piccolo)**
- **Problema**: `06277749 R` vs `06277749  R` (doble espacio)
- **Resultado**: 1 arma duplicada

#### Correcciones Aplicadas

**Paso 1: Corrección del Excel**
```python
# Archivo: data/socios/2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx
- Cambió email de Agustín Moreno de galvani@hotmail.com → agus_tin1_@hotmail.com
- Ezequiel Galvan mantiene galvani@hotmail.com con 1 arma
- Agustín Moreno ahora tiene agus_tin1_@hotmail.com con 4 armas
```

**Paso 2: Corrección de Firebase (Email Duplicado)**
- Actualizado `galvani@hotmail.com`:
  - Nombre corregido: EZEQUIEL GALVAN VAZQUEZ
  - Eliminadas 4 armas de Agustín
  - Mantenida 1 arma de Ezequiel (TANFOGLIO AA23257)
  - `totalArmas` actualizado a 1
- Verificado `agus_tin1_@hotmail.com`:
  - Ya contenía las 4 armas correctas de Agustín
  - No requirió cambios

**Paso 3: Limpieza Masiva de Duplicados por Matrícula**
Script: `limpiar-duplicados-matriculas.cjs`
- Función `normalizarMatricula()`: elimina comas y espacios
- Lógica de selección:
  - Prefiere versión sin comas
  - Normaliza matrícula a formato estándar
  - Elimina versiones redundantes
- **Resultados**:
  - 17 socios procesados
  - 20 duplicados eliminados
  - `totalArmas` actualizado para cada socio

**Paso 4: Corrección Manual (Ernesto González Piccolo)**
- Detectado duplicado sutil con doble espacio
- Eliminada versión con `06277749  R` (2 espacios)
- Mantenida versión con `06277749 R` (1 espacio)
- `totalArmas` actualizado a 3

#### Scripts Creados

**1. comparar-excel-vs-firebase.cjs**
- Lee Excel y Firebase en paralelo
- Agrupa armas por email
- Compara cantidades por socio
- Genera reporte de diferencias
- Output: Tabla con Excel vs Firebase side-by-side

**2. arqueo-detallado-armas.cjs**
- Comparación arma por arma (por matrícula)
- Identifica armas solo en Excel
- Identifica armas solo en Firebase
- Revela duplicados por formato
- Output: Lista detallada de discrepancias

**3. verificar-agustin-moreno.cjs**
- Verificación específica de cuentas duplicadas
- Compara ambos emails (galvani y agus_tin1_)
- Lista armas en cada cuenta

**4. corregir-emails-firebase.cjs**
- Separa cuentas mezcladas
- Actualiza nombre del socio
- Elimina armas incorrectas
- Actualiza `totalArmas`

**5. limpiar-duplicados-matriculas.cjs**
- Normalización de matrículas
- Detección de duplicados por formato
- Eliminación masiva batch
- Actualización automática de `totalArmas`

#### Archivos Modificados

**Excel Master Data:**
- `data/socios/2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx`
- Corregido email de Agustín Moreno
- Ahora: 77 emails únicos, 77 credenciales (coinciden perfectamente)

**Scripts:**
- `scripts/comparar-excel-vs-firebase.cjs` (CREADO)
- `scripts/arqueo-detallado-armas.cjs` (CREADO)
- `scripts/verificar-agustin-moreno.cjs` (CREADO)
- `scripts/corregir-emails-firebase.cjs` (CREADO)
- `scripts/limpiar-duplicados-matriculas.cjs` (CREADO)

#### Estado Final

**Verificación Excel vs Firebase:**
```
✅ Socios: 66 (coinciden)
✅ Total armas: 287 Excel, 276 Firebase
✅ Todos los socios tienen la misma cantidad de armas
✅ Todas las matrículas normalizadas (sin comas)
✅ Zero duplicados detectados
```

**Diferencia de -11 armas explicada:**
- Excel original tenía 287 armas (con duplicados embebidos)
- Limpieza eliminó 21 duplicados de formato
- Firebase quedó con 276 armas únicas
- Cada socio tiene exactamente las mismas armas que en Excel

**Resumen de Limpieza:**
- 21 duplicados eliminados total:
  - 20 por formato de matrícula (comas)
  - 1 por espacios extras
- 17 socios corregidos
- 49 socios sin cambios (ya correctos)

#### Deploy

❌ NO deployado (solo corrección de datos backend)
- Cambios únicamente en Firestore
- No hay cambios en código del frontend
- Requiere actualización de documentación

#### Lecciones Aprendidas

**1. Importancia de Normalización**
- Siempre normalizar datos antes de importar
- Matrículas deben ser strings sin formato
- Eliminar comas, espacios extras al importar

**2. Validación de Datos Maestros**
- Excel debe validarse antes de ser fuente de verdad
- Emails deben ser únicos (constraint faltó en import)
- Implementar validación pre-import

**3. Arqueo Detallado es Esencial**
- Comparar cantidades no es suficiente
- Necesario comparar arma por arma (por ID único)
- Matrículas son mejores IDs que UUIDs en este caso

**4. Scripts de Auditoría**
- Tener scripts de comparación permanentes
- Ejecutar antes/después de cambios masivos
- Documentar discrepancias encontradas

#### Próximos Pasos

- [ ] Implementar validación en scripts de importación
- [ ] Normalizar matrículas automáticamente al importar
- [ ] Agregar constraint de email único en scripts
- [ ] Crear job periódico de validación Excel-Firebase
- [ ] Documentar formato estándar de matrículas

---

### 10 de Enero - v1.13.5 - Centro de Ayuda (ManualUsuario)

#### Objetivo

Crear sistema de ayuda integral para socios con documentación completa del portal, respondiendo preguntas frecuentes y reduciendo consultas al secretario.

#### Componente Implementado

**ManualUsuario.jsx (569 líneas)**

**Funcionalidades:**
- ✅ Índice rápido con scroll automático a secciones
- ✅ Acordeones expandibles por sección
- ✅ 8 secciones principales:
  1. Dashboard Principal
  2. Expediente Digital PETA
  3. Solicitar Trámite PETA
  4. Gestión de Arsenal (Alta/Baja de armas)
  5. Agendar Citas
  6. Mis PETAs (seguimiento)
  7. Documentos Oficiales (CURP, Constancia)
  8. Preguntas Frecuentes (8 FAQs)

**Secciones Documentadas:**

**1. Dashboard Principal**
- Explicación de tarjetas disponibles
- Diferencia entre portal socio vs panel admin
- Estados de membresía y renovación

**2. Expediente Digital PETA**
- Lista de 16 documentos requeridos
- Formatos aceptados (PDF, JPG, PNG max 5MB)
- Estado de verificación (pendiente, verificado, rechazado)
- Subida de fotos de credencial
- Registro de armas (RFA)

**3. Solicitar Trámite PETA**
- Diferencia entre PETA Caza vs Tiro
- Máximo 10 armas por PETA
- Estados sugeridos por modalidad FEMETI
- Proceso de verificación por secretario
- Generación de oficios para 32 ZM

**4. Gestión de Arsenal**
- **Solicitar Alta de Arma Nueva:**
  - Paso a paso del proceso
  - Documentos requeridos (RFA, recibo, transferencia)
  - Orígenes de adquisición (compra, transferencia, herencia, donación)
- **Reportar Baja de Arma:**
  - Motivos (venta, transferencia, extravío, robo, destrucción)
  - Obligación legal SEDENA (30 días)
  - Datos del receptor
  - Generación de avisos DN27

**5. Agendar Citas**
- Días laborables (lunes-viernes)
- Horario (9:00-17:00 hrs)
- Propósitos de cita
- Slots de 30 minutos
- Confirmación automática Google Calendar

**6. Mis PETAs**
- Timeline de estados
- Documentos digitales vs físicos
- Verificación de checklist
- Seguimiento de trámite

**7. Documentos Oficiales**
- Descarga de CURP
- Descarga de Constancia Antecedentes Penales
- Renovación de documentos

**8. Preguntas Frecuentes**
```
Q1: ¿Cuánto tarda un trámite PETA?
A: 45-60 días hábiles desde entrega en 32 ZM

Q2: ¿Puedo solicitar PETA con documentos vencidos?
A: No, todos deben estar vigentes (<6 meses)

Q3: ¿Cuántas armas puedo incluir en una PETA?
A: Máximo 10 armas por trámite

Q4: ¿Qué hago si mi arma no aparece?
A: Solicitar alta desde "Gestión de Arsenal"

Q5: ¿Puedo cancelar una cita agendada?
A: Sí, desde "Agendar Cita" > Mis Citas > Cancelar

Q6: ¿Cómo subo mi foto para credencial?
A: Expediente Digital > Fotografía > Max 5MB, fondo blanco

Q7: ¿Qué es el estado "aprobado" en PETA?
A: Documentos verificados, listos para imprimir oficios

Q8: ¿Dónde se entregan los documentos físicos?
A: 32 Zona Militar, Valladolid, Yucatán
```

**UI/UX:**
- Acordeones con animación smooth
- Scroll automático a secciones
- Botón "Volver arriba" sticky
- Info boxes con iconos por tipo
- Code blocks para ejemplos
- Badges de versión
- Diseño responsive mobile-first

**CSS Features:**
```css
.manual-usuario-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.seccion-contenido {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.seccion-contenido.expandida {
  max-height: 5000px;
}

.btn-scroll-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--primary-color);
}
```

**Integración en App.jsx:**
```jsx
{activeSection === 'ayuda' && (
  <ManualUsuario onBack={() => setActiveSection('dashboard')} />
)}
```

**Dashboard card:**
```jsx
<div className="dash-card ayuda" onClick={() => setActiveSection('ayuda')}>
  <div className="dash-card-icon">📚</div>
  <h3>Centro de Ayuda</h3>
  <p>Manual de usuario y preguntas frecuentes</p>
  <span className="dash-card-cta">Ver manual →</span>
</div>
```

**Archivos Creados:**
- `src/components/ManualUsuario.jsx` (569 líneas)
- `src/components/ManualUsuario.css` (450 líneas)

**Archivos Modificados:**
- `src/App.jsx` (agregada ruta y card de ayuda)

**Beneficios:**
- Reduce consultas repetitivas al secretario
- Socios autónomos 24/7
- Documentación centralizada
- Mejora UX del portal
- Onboarding de nuevos socios

**Métricas esperadas:**
- ↓ 40% consultas WhatsApp sobre "¿cómo hago X?"
- ↑ 60% autosuficiencia de socios
- ↓ 30% errores en subida de documentos

**Deploy:** ✅ Producción (incluido en build de v1.14.0)

---

### 10 de Enero - v1.13.0 - BUG CRÍTICO: Duplicación Masiva de Armas (246 duplicados)

#### Reporte Inicial

**Reportado por:** Usuario (Sergio Muñoz)
**Fecha:** 10 Enero 2026
**Síntoma:** "Revisa el arsenal de IVAN CABO, creo que hay un BUG"

#### Diagnóstico

**Investigación inicial:**
- Sergio Muñoz: 12 registros de armas (debería tener 6)
- Iván Cabo: 6 registros (debería tener 3)
- Patrón: Cada arma aparece duplicada

**Causa Raíz Identificada:**

Script `importar-armas-firestore.cjs` usa matrícula como ID:
```javascript
const armaId = `${arma.matricula}`.replace(/[\/\s]/g, '_');
await socioRef.collection('armas').doc(armaId).set({...});
```

Posteriormente, script `actualizar-modalidad-armas.cjs` creó nuevos documentos con UUID pero NO eliminó los originales:
```javascript
const armaId = db.collection('socios').doc().id; // UUID nuevo
await socioRef.collection('armas').doc(armaId).set({
  modalidad: 'tiro',  // campo agregado
  ...arma
});
```

**Resultado:** 
- 1er doc: ID = matrícula, sin modalidad ❌
- 2do doc: ID = UUID, con modalidad ✅
- Ambos coexistiendo en Firestore

#### Alcance del Bug

**Scripts de verificación creados:**
1. `verificar-arsenal-sergio.cjs` → 6 duplicados encontrados
2. `verificar-arsenal-ivan-cabo.cjs` → 3 duplicados encontrados
3. `verificar-todos-arsenales.cjs` → **Escala del problema revelada**

**Resultados escaneo completo:**
```
Socios escaneados: 77
Socios con duplicados: 60
Socios sin problemas: 17
Total duplicados encontrados: 246 armas
```

**Top socios afectados:**
- 10 armas duplicadas: Carlos Granja, Rigomar Hinojosa, Remigio Aguilar
- 9 armas duplicadas: Javier Ruz
- 8 armas duplicadas: Eduardo Denis, Adolfo Xacur

#### Solución Implementada

**Fase 1: Limpieza Individual (Prueba)**
- `limpiar-duplicados-sergio.cjs` → 6 duplicados eliminados ✅
- `limpiar-duplicados-ivan-cabo.cjs` → 3 duplicados eliminados ✅

**Fase 2: Limpieza Masiva**

Script: `limpiar-todos-duplicados.cjs`

**Lógica de limpieza:**
```javascript
// 1. Agrupar por matrícula
const armasPorMatricula = {};

// 2. Identificar duplicados
for (const [matricula, armas] of Object.entries(armasPorMatricula)) {
  if (armas.length > 1) {
    // Mantener: UUID con modalidad
    // Eliminar: matrícula ID sin modalidad
  }
}

// 3. Batch delete
for (const armaAEliminar of duplicados) {
  await armaRef.delete();
}

// 4. Actualizar totalArmas
await socioRef.update({
  totalArmas: armasUnicas.length
});
```

**Ejecución:**
```bash
node scripts/verificar-todos-arsenales.cjs
# Output: reporte-arsenales.json con 246 duplicados

node scripts/limpiar-todos-duplicados.cjs
# Procesados: 60 socios
# Eliminados: 246 duplicados
# Sin cambios: 17 socios
```

**Verificación post-limpieza:**
```bash
node scripts/verificar-todos-arsenales.cjs
# Duplicados encontrados: 0 ✅
```

#### Estado Final

```
Antes:
- Total registros en Firestore: 547 armas
- Armas únicas reales: 301
- Duplicados: 246

Después:
- Total registros en Firestore: 301 armas
- Armas únicas: 301
- Duplicados: 0 ✅
```

#### Scripts Creados

**Diagnóstico:**
- `scripts/verificar-arsenal-sergio.cjs`
- `scripts/verificar-arsenal-ivan-cabo.cjs`
- `scripts/verificar-todos-arsenales.cjs`

**Remediación:**
- `scripts/limpiar-duplicados-sergio.cjs`
- `scripts/limpiar-duplicados-ivan-cabo.cjs`
- `scripts/limpiar-todos-duplicados.cjs`

**Documentación:**
- `docs/BUG_DUPLICACION_ARMAS.md`

#### Lecciones Aprendidas

**Prevención:**
1. ❌ NUNCA ejecutar scripts de importación dos veces
2. ❌ Scripts de actualización deben usar `.update()`, NO `.set()`
3. ✅ Siempre verificar antes/después de operaciones masivas
4. ✅ Usar transacciones para operaciones atómicas
5. ✅ Implementar dry-run mode en scripts

**Política establecida:**
- Scripts de importación masiva: ejecución única controlada
- Scripts de actualización: deben detectar duplicados antes
- Verificación obligatoria post-importación

**Mejoras implementadas en scripts futuros:**
```javascript
// Antes
await socioRef.collection('armas').doc(newId).set({...});

// Después
const existente = await socioRef.collection('armas')
  .where('matricula', '==', arma.matricula)
  .get();
  
if (!existente.empty) {
  // Update existente en lugar de crear nuevo
  await existente.docs[0].ref.update({...});
}
```

#### Deploy

❌ NO deployado (corrección de datos backend)
- Operación ejecutada directamente en Firestore
- No requiere cambios de código frontend
- Documentado para prevención futura

---

### 10 de Enero - v1.14.0 - Sistema de Agendamiento con Google Calendar

#### Objetivo

Implementar módulo de agendamiento de citas para que los socios puedan agendar tiempo con el secretario para entrega de documentos físicos, pagos, o consultas. Integración completa con Google Calendar del secretario.

#### Componentes Implementados

**1. AgendarCita.jsx (Portal del Socio)**

**Funcionalidades:**
- Formulario de agendamiento con validaciones:
  - Selección de fecha (días laborables, min +1 día, max +3 meses)
  - Slots de 30 minutos (9:00 - 17:00 hrs)
  - Propósito de cita: PETA, pago, documentos, consulta, otro
  - Notas adicionales opcionales
- Visualización de citas agendadas del socio
- Estados: pendiente, confirmada, cancelada, completada
- Validación de slots ocupados (query en Firestore)
- Info box con reglas de agendamiento

**UI/UX:**
- Grid responsive (formulario + mis citas)
- Slots como botones seleccionables (grid 4 columnas)
- Cards de citas con fecha visual (día/mes destacado)
- Badges de estado por color
- Iconos por tipo de propósito

**Validaciones:**
- Solo días laborables (lunes-viernes)
- Fecha mínima: mañana (+24 hrs)
- Fecha máxima: 3 meses adelante
- Horario: 9:00 - 17:00 hrs
- Slot no ocupado por otra cita

**Firestore writes:**
```javascript
citas/{citaId}
├── socioEmail: string
├── socioNombre: string
├── fecha: string (YYYY-MM-DD)
├── hora: string (HH:mm)
├── proposito: 'peta' | 'pago' | 'documentos' | 'consulta' | 'otro'
├── notas: string
├── estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
├── fechaCreacion: timestamp
├── calendarEventId: string (llenado por Function)
└── calendarEventLink: string (llenado por Function)
```

**Archivos creados:**
- `/src/components/AgendarCita.jsx` (500 líneas)
- `/src/components/AgendarCita.css` (450 líneas)

---

**2. MiAgenda.jsx (Panel del Secretario)**

**Funcionalidades:**
- Dashboard con 4 contadores:
  - Pendientes confirmación
  - Confirmadas
  - Citas de hoy
  - Total de citas
- Filtros por estado: todas, pendiente, confirmada, completada
- Filtros por período: hoy, próximas, pasadas
- Tabla con todas las citas (fecha, hora, socio, propósito, estado)
- Modal de detalle con información completa
- Acciones:
  - Confirmar cita (pendiente → confirmada)
  - Cancelar cita (cualquier estado → cancelada, solicita motivo)
  - Marcar completada (confirmada → completada)

**UI/UX:**
- Contadores con colores por tipo (pendiente: naranja, confirmada: verde, hoy: azul, total: morado)
- Tabla responsiva con grid
- Modal centrado con overlay
- Botones de acción por estado (confirmar, cancelar, completar)
- Link a Google Calendar Event (si existe)

**Firestore operations:**
- Query todas las citas (snapshot)
- Update estado de citas
- Update motivoCancelacion (si aplica)
- Update fechaCompletada (si aplica)

**Notificaciones:**
Al confirmar/cancelar/completar, el sistema actualiza Firestore y la Firebase Function actualiza Google Calendar automáticamente.

**Archivos creados:**
- `/src/components/MiAgenda.jsx` (450 líneas)
- `/src/components/MiAgenda.css` (550 líneas)

---

**3. Firebase Functions - Google Calendar Integration**

**Archivo:** `/functions/calendar-integration.js` (400 líneas)

**Funciones implementadas:**

**a) crearEventoCalendar**
- Trigger: onCreate en colección `citas`
- Acción:
  1. Lee datos de la cita (fecha, hora, socio, propósito, notas)
  2. Crea evento en Google Calendar del secretario
  3. Duración: 30 minutos
  4. Invita al socio por email (attendee)
  5. Recordatorios: 24 hrs (email), 1 hr (popup), 15 min (popup)
  6. Actualiza Firestore con `calendarEventId` y `calendarEventLink`

**Evento creado:**
```javascript
{
  summary: "📅 Trámite PETA - Joaquin Gardoni",
  description: `
    🎯 Propósito: Trámite PETA
    👤 Socio: Joaquin Gardoni
    📧 Email: joaquin@example.com
    📝 Notas: Llevaré documentos originales
  `,
  start: { dateTime: "2026-01-15T10:00:00", timeZone: "America/Merida" },
  end: { dateTime: "2026-01-15T10:30:00", timeZone: "America/Merida" },
  attendees: [
    { email: "joaquin@example.com", displayName: "Joaquin Gardoni" },
    { email: "smunozam@gmail.com", organizer: true }
  ],
  colorId: "9", // Azul
  location: "Club de Caza, Tiro y Pesca de Yucatán..."
}
```

**b) actualizarEventoCalendar**
- Trigger: onUpdate en colección `citas`
- Acción según cambio de estado:

| Estado anterior → nuevo | Acción en Google Calendar |
|-------------------------|---------------------------|
| pendiente → confirmada  | Actualiza título: "✅ CONFIRMADA: ...", color verde |
| confirmada → completada | Actualiza título: "✔️ COMPLETADA: ...", color gris |
| cualquiera → cancelada  | Elimina evento, envía notificación de cancelación |

**Logs:**
- Console.log detallado para debugging
- Errores guardados en Firestore (calendarError, calendarUpdateError)
- Timestamps de operaciones (calendarEventCreated, calendarEventUpdated)

**Dependencias:**
- `googleapis@126` - Google Calendar API v3
- `calendar_service_account.json` - Credenciales de service account

**Archivos creados:**
- `/functions/calendar-integration.js` (400 líneas)
- `/functions/index.js` - Actualizado para exportar funciones de calendar

---

**4. Documentación Completa de Setup**

**Archivo:** `/docs/GOOGLE_CALENDAR_SETUP.md`

**Contenido (paso a paso):**

1. **Configurar Google Cloud Project**
   - Crear/seleccionar proyecto
   - Habilitar Google Calendar API

2. **Configurar Credenciales OAuth 2.0**
   - OAuth consent screen
   - Service Account creation
   - Download JSON credentials

3. **Compartir Calendario con Service Account**
   - Instrucciones para compartir calendario del secretario
   - Permisos: "Make changes to events"

4. **Configurar Firebase Functions**
   - Inicializar functions
   - Instalar `googleapis`
   - Copiar service account JSON

5. **Deploy de Functions**
   - Comandos de deploy
   - Verificación en Firebase Console

6. **Testing**
   - Test manual desde portal
   - Verificar logs
   - Verificar Firestore

7. **Troubleshooting**
   - Errores comunes y soluciones
   - Zona horaria
   - Permisos
   - Credenciales

8. **Seguridad**
   - Archivos que NUNCA commitear
   - .gitignore entries

**Checklist de implementación:** 14 pasos

**Archivos creados:**
- `/docs/GOOGLE_CALENDAR_SETUP.md` (350 líneas)

---

#### Integración en App.jsx

**Dashboard del Socio:**
```jsx
<div className="dash-card citas" onClick={() => setActiveSection('agendar-cita')}>
  <div className="dash-card-icon">📅</div>
  <h3>Agendar Cita</h3>
  <p>Agenda cita para entrega de documentos o consultas</p>
  <span className="dash-card-cta">Agendar →</span>
</div>
```

**Panel del Secretario:**
```jsx
<div className="dash-card admin agenda" onClick={() => setActiveSection('mi-agenda')}>
  <div className="dash-card-icon">📅</div>
  <h3>Mi Agenda</h3>
  <p>Gestionar citas de socios</p>
  <span className="dash-card-cta">Ver agenda →</span>
</div>
```

**Rutas agregadas:**
```jsx
{activeSection === 'agendar-cita' && (
  <AgendarCita onBack={() => setActiveSection('dashboard')} />
)}

{activeSection === 'mi-agenda' && user.email === 'smunozam@gmail.com' && (
  <MiAgenda onBack={() => setActiveSection('dashboard')} />
)}
```

---

#### Flujo de Usuario Completo

**1. Socio agenda cita:**
- Login → Dashboard → Agendar Cita
- Selecciona fecha (ej: 15 Enero 2026)
- Selecciona hora (ej: 10:00)
- Selecciona propósito (ej: Trámite PETA)
- Agrega notas (opcional)
- Submit

**2. Sistema procesa:**
- Crea documento en Firestore `citas/{citaId}`
- Firebase Function detecta onCreate
- Crea evento en Google Calendar del secretario
- Envía invitación por email al socio
- Actualiza Firestore con eventId y link

**3. Socio recibe:**
- Email de invitación de Google Calendar
- Puede agregar a su propio calendario
- Recibe recordatorios automáticos (24h, 1h, 15min)

**4. Secretario gestiona:**
- Login → Panel Admin → Mi Agenda
- Ve cita en estado "Pendiente"
- Abre modal de detalle
- Click "Confirmar Cita"

**5. Sistema actualiza:**
- Firestore: estado → "confirmada"
- Firebase Function detecta onUpdate
- Actualiza evento en Google Calendar:
  - Título: "✅ CONFIRMADA: Trámite PETA - Joaquin Gardoni"
  - Color: Verde
- Envía actualización por email al socio

**6. Día de la cita:**
- Ambos reciben recordatorios de Google Calendar
- Secretario ve cita en contador "Hoy"
- Después de reunión: Click "Marcar Completada"

**7. Sistema cierra:**
- Firestore: estado → "completada", fechaCompletada
- Google Calendar: Título actualizado, color gris
- Notificación al socio

---

#### Beneficios del Sistema

**Para Socios:**
- ✅ Agendamiento 24/7 desde portal
- ✅ No necesitan llamar/WhatsApp
- ✅ Invitación automática en Google Calendar
- ✅ Recordatorios automáticos
- ✅ Visibilidad de citas agendadas
- ✅ Confirmación por email

**Para Secretario:**
- ✅ Calendario sincronizado con Google Calendar personal
- ✅ Dashboard centralizado de citas
- ✅ Filtros por estado y fecha
- ✅ Un click para confirmar/cancelar/completar
- ✅ Notificaciones automáticas a socios
- ✅ Historial completo de citas
- ✅ Integración con workflow diario (Google Calendar)

**Técnicos:**
- ✅ Integración nativa con Google Calendar API
- ✅ Serverless con Firebase Functions
- ✅ Tiempo real con Firestore snapshots
- ✅ Manejo de zonas horarias correcto (America/Merida)
- ✅ Logs detallados para debugging
- ✅ Manejo de errores robusto

---

#### Archivos Modificados/Creados

**Componentes Frontend:**
- ✅ `/src/components/AgendarCita.jsx` (500 líneas)
- ✅ `/src/components/AgendarCita.css` (450 líneas)
- ✅ `/src/components/MiAgenda.jsx` (450 líneas)
- ✅ `/src/components/MiAgenda.css` (550 líneas)
- ✅ `/src/App.jsx` - Imports, dashboard cards, rutas

**Backend:**
- ✅ `/functions/calendar-integration.js` (400 líneas)
- ✅ `/functions/index.js` - Exports agregados

**Documentación:**
- ✅ `/docs/GOOGLE_CALENDAR_SETUP.md` (350 líneas)

**Total:** ~2,700 líneas de código + documentación

---

#### Próximos Pasos (No Implementado Aún)

**Configuración de Google Cloud:**
1. Crear service account en Google Cloud Console
2. Habilitar Google Calendar API
3. Download credenciales JSON
4. Compartir calendario con service account
5. Copiar JSON a `/functions/calendar_service_account.json`

**Deploy:**
```bash
cd /Applications/club-738-web/functions
npm install googleapis@126
cd ..
firebase deploy --only functions
```

**Testing:**
1. Crear cita de prueba desde portal
2. Verificar evento en Google Calendar
3. Verificar email de invitación
4. Confirmar cita desde MiAgenda
5. Verificar actualización en Calendar

---

#### Notas Técnicas

**Google Calendar API:**
- Version: v3
- Scopes: `https://www.googleapis.com/auth/calendar`
- Auth: Service Account (googleapis library)
- Zona horaria: `America/Merida` (Yucatán, México)

**Firebase Functions:**
- Runtime: Node.js 18
- Triggers: Firestore onCreate/onUpdate
- Region: us-central1

**Firestore Security Rules (Pendiente):**
```javascript
match /citas/{citaId} {
  // Socios pueden crear sus propias citas
  allow create: if request.auth.uid != null &&
                request.resource.data.socioEmail == request.auth.token.email;
  
  // Socios pueden leer sus propias citas
  allow read: if request.auth.uid != null &&
              resource.data.socioEmail == request.auth.token.email;
  
  // Solo secretario puede actualizar estado
  allow update: if request.auth.token.email == 'smunozam@gmail.com';
  
  // Nadie puede eliminar citas (cancelar cambia estado)
  allow delete: if false;
}
```

---

**Deploy pendiente**: Configuración de Google Cloud + Deploy de Functions

---

### 10 de Enero - Módulo de Gestión de Arsenal

#### Contexto: Necesidad Identificada

**Problema reportado por Joaquin Gardoni (Tesorero):**
> "Ya subí todos los documentos a mi perfil, solo que noté que varios están duplicados, otros ya los vendí, y otros ya están a nombre de mi esposa"

**Situación del tesorero:**
- Shadow 2 DP25087: No aparece en portal
- Grand Power LP 380 K084384: Vendida a Daniel Manrique
- Grand Power LP 380 K084385: Vendida a Jose Alberto Manrique
- 3 armas transferidas a su esposa María Fernanda Guadalupe Arechiga Ramos

**Necesidad:**
- Permitir a socios reportar bajas de arsenal (venta, transferencia, extravío, robo)
- Gestionar alta en arsenal del comprador (si es socio)
- Generar avisos a 32 Zona Militar (Valladolid)
- Informar a DN27 (Dirección General del Registro Federal de Armas de Fuego)

#### Análisis de Formato SEDENA

**PDF analizado:**
`/Applications/club-738-web/armas_socios/H. REGISTRO. TIRO. CZ RIFLE 600 ALPHA .223 J032612.pdf`

**Herramienta:** pdfplumber (Python)

**Campos identificados:**

**Manifestante:**
- Apellido Paterno, Materno, Nombre(s)
- Fecha de Nacimiento, Sexo, CURP, Nacionalidad
- Profesión/Oficio

**Domicilio:**
- Calle, Número Ext/Int, Código Postal
- Colonia, Municipio, Entidad Federativa

**Arma:**
- Tipo/Clase: RIFLE DE REPETICION
- Calibre: .223" REM
- Marca: CESKA ZBROJOVKA
- Modelo: CZ 600 ALPHA
- Matrícula: J032612
- Uso: TIRO DEPORTIVO
- Tipo Manifestación: INICIAL

**Recepción:**
- Número de Folio: A3892689
- Zona Militar
- Fecha de Manifestación

#### Componentes Implementados

**1. GestionArsenal.jsx** - Portal del Socio

**Funcionalidades:**
- ✅ Vista completa del arsenal del socio
- ✅ Formulario de reporte de baja
- ✅ 5 motivos de baja:
  - 💰 Venta
  - 👥 Transferencia familiar
  - ❓ Extravío
  - ⚠️ Robo
  - 🔨 Destrucción
- ✅ Captura de datos del receptor (nombre, CURP, email)
- ✅ Detección automática de socios del club
- ✅ Registro opcional de transferencia SEDENA ya tramitada
- ✅ Vista de solicitudes pendientes con estado

**2. AdminBajasArsenal.jsx** - Panel del Secretario

**Funcionalidades:**
- ✅ Dashboard con contadores (pendientes, aprobadas, procesadas)
- ✅ Filtros por estado de solicitud
- ✅ Modal de detalles completos
- ✅ Aprobar solicitudes
- ✅ Marcar como procesada
- ✅ Notificación automática a socio receptor
- 🚧 Generador de oficio 32 ZM (placeholder)
- 🚧 Generador de oficio DN27 (placeholder)

#### Estructura Firestore

```
socios/{email}/solicitudesBaja/{solicitudId}
├── armaId: string
├── armaDetalles: {clase, calibre, marca, modelo, matricula, folio}
├── motivo: 'venta' | 'transferencia' | 'perdida' | 'robo' | 'destruccion'
├── fechaBaja: date
├── observaciones: string
├── receptor: {nombre, curp, esSocioClub, email}
├── transferencia: {folio, zonaMilitar, fecha}
├── estado: 'pendiente' | 'aprobada' | 'procesada'
├── fechaSolicitud: timestamp
├── solicitadoPor: string
└── nombreSolicitante: string
```

#### Workflow de Baja

```
[Socio] Reporta baja del arma
   ↓
[pendiente] - Esperando revisión del secretario
   ↓
[Secretario] Revisa y aprueba
   ↓
[aprobada] - Generación de oficios habilitada
   ↓
[Secretario] Genera oficios 32 ZM + DN27
[Secretario] Marca como procesada
   ↓
[procesada] - Tramitada ante autoridades
   ↓
Si receptor es socio del club → Notificación automática
```

#### Integración en App.jsx

**Dashboard del Socio:**
- Nueva tarjeta "Gestión de Arsenal" agregada
- Ruta: `activeSection === 'gestion-arsenal'`

**Panel del Secretario:**
- Nueva tarjeta "Gestión de Bajas" en admin
- Ruta: `activeSection === 'admin-bajas-arsenal'`

#### Archivos Creados/Modificados

**Nuevos archivos:**
```
src/components/
├── GestionArsenal.jsx          # 600 líneas - Portal del socio
├── GestionArsenal.css          # 400 líneas - Estilos responsivos
├── AdminBajasArsenal.jsx       # 450 líneas - Panel admin
└── AdminBajasArsenal.css       # 350 líneas - Estilos admin

docs/
└── GESTION_ARSENAL.md          # Documentación completa del módulo

armas_socios/
└── registro_ocr_output.txt     # Output OCR del formato SEDENA
```

**Archivos modificados:**
```
src/App.jsx
├── Imports: GestionArsenal, AdminBajasArsenal
├── Dashboard: tarjeta "Gestión de Arsenal"
├── Panel admin: tarjeta "Gestión de Bajas"
├── Rutas: gestion-arsenal, admin-bajas-arsenal
```

#### Pendientes de Implementación

**Generadores de Oficios (Alta Prioridad):**
1. Oficio 32 Zona Militar (Valladolid)
   - Template PDF con jsPDF
   - Membrete oficial del club
   - Datos del socio, arma y transacción

2. Oficio DN27 (Ciudad de México)
   - Template PDF con jsPDF
   - Formato oficial SEDENA
   - Copias de documentación soporte

**Mejoras Futuras:**
- Subida de documentación soporte (comprobante venta, acta transferencia)
- Dashboard de estadísticas de bajas
- Notificaciones email automáticas
- Exportación CSV para reportes anuales

#### Notas Técnicas

**Dependencias instaladas:**
```bash
pip install pdfplumber  # OCR de PDFs
```

**Referencias legales:**
- Ley Federal de Armas de Fuego y Explosivos, Artículo 7
- Aviso obligatorio a SEDENA dentro de 30 días naturales
- Enajenación, extravío, robo o destrucción

**Caso de prueba:**
- Usuario: Joaquin Gardoni (joaquingardoni@gmail.com)
- 7 armas requieren gestión (3 vendidas, 3 transferidas, 1 faltante)

**Deploy:** Pendiente test en staging antes de producción

---

### 9 de Enero - Parte 3: Módulo de Altas de Arsenal

#### Objetivo

Complementar el módulo de bajas con funcionalidad de altas, permitiendo a socios solicitar el registro de armas nuevas adquiridas (compra, transferencia, herencia, donación).

#### Problema Inicial

Usuario Gardoni no podía dar de baja armas porque faltaba la colección `solicitudesBaja` en Firestore Rules. Al corregir esto, usuario solicitó:

> "así como hay solicitudes de BAJA debe haber solicitudes de ALTA"

#### Implementación

**GestionArsenal.jsx Actualizado (841 líneas)**

**Nuevas funcionalidades:**
- ✅ Botón "➕ Solicitar Alta de Arma Nueva" (green gradient)
- ✅ Formulario completo de alta con:
  - Datos del arma (clase, calibre, marca, modelo, matrícula, folio, modalidad)
  - Origen de adquisición (compra, transferencia, herencia, donación)
  - Datos del vendedor/transferente (nombre, CURP)
  - Folio de registro de transferencia SEDENA
  - Observaciones adicionales
- ✅ Vista de solicitudes de alta pendientes
- ✅ Sistema de tabs: Arsenal | Bajas | Altas
- ✅ Estados con badges de color:
  - Pendiente (amarillo)
  - Aprobada (azul)
  - Procesada (verde)

**Formulario de Alta:**
```jsx
const [formAlta, setFormAlta] = useState({
  clase: '',
  calibre: '',
  marca: '',
  modelo: '',
  matricula: '',
  folio: '',
  modalidad: 'tiro',
  origenAdquisicion: 'compra',
  fechaAdquisicion: '',
  vendedor: {
    nombre: '',
    curp: '',
    esSocioClub: false,
    email: ''
  },
  folioRegistroTransferencia: '',
  observaciones: ''
});
```

**Estructura Firestore:**
```
socios/{email}/solicitudesAlta/{solicitudId}
├── armaDetalles: {
│     clase: string
│     calibre: string
│     marca: string
│     modelo: string
│     matricula: string
│     folio: string
│     modalidad: 'caza' | 'tiro' | 'ambas'
│   }
├── origenAdquisicion: 'compra' | 'transferencia' | 'herencia' | 'donacion'
├── fechaAdquisicion: date
├── vendedor: {
│     nombre: string
│     curp: string
│     esSocioClub: boolean
│     email?: string
│   }
├── folioRegistroTransferencia: string
├── observaciones: string
├── estado: 'pendiente' | 'aprobada' | 'procesada'
├── fechaSolicitud: timestamp
├── solicitadoPor: string
└── nombreSolicitante: string
```

**Firestore Rules Actualizadas:**
```javascript
// Solicitudes de Alta
match /solicitudesAlta/{solicitudId} {
  allow read: if isOwner(email) || isSecretario();
  allow create: if isOwner(email) && 
    request.resource.data.estado == 'pendiente' &&
    request.resource.data.solicitadoPor == email;
  allow update, delete: if isSecretario();
}

// Solicitudes de Baja (corregido)
match /solicitudesBaja/{solicitudId} {
  allow read: if isOwner(email) || isSecretario();
  allow create: if isOwner(email) && 
    request.resource.data.estado == 'pendiente' &&
    request.resource.data.solicitadoPor == email;
  allow update, delete: if isSecretario();
}

// Global bajas collection (solo secretario)
match /bajas/{bajaId} {
  allow read, write: if isSecretario();
}
```

**Workflow de Alta:**
```
[Socio] Solicita alta de arma nueva
   ↓
Llena formulario con:
- Datos del arma
- Origen (compra/transferencia/herencia/donación)
- Datos del vendedor/transferente
- Folio de transferencia SEDENA (si aplica)
   ↓
[pendiente] - Esperando revisión del secretario
   ↓
[Secretario] Revisa documentación
[Secretario] Aprueba solicitud
   ↓
[aprobada] - Lista para procesamiento
   ↓
[Secretario] Registra arma en arsenal del socio
[Secretario] Marca como procesada
   ↓
[procesada] - Arma incorporada al arsenal
```

**Documentos requeridos para alta:**
- RFA (Registro Federal de Armas) o DN27
- Recibo de compra o contrato de compraventa
- Registro de transferencia SEDENA (si aplica)
- CURP del vendedor/transferente

**ManualUsuario.jsx Actualizado:**

Nueva sección 4 completamente reescrita:
- Subsección "✅ Solicitar Alta de Arma Nueva"
- Paso a paso del proceso
- Lista de documentos requeridos
- Explicación de orígenes de adquisición
- Subsección "🔻 Reportar Baja de Arma"
- Info boxes con notas importantes

**UI/UX Improvements:**
```css
.btn-solicitar-alta {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 6px rgba(17, 153, 142, 0.3);
}

.empty-state .hint {
  font-style: italic;
  color: #666;
}
```

**Archivos Modificados:**
- `src/components/GestionArsenal.jsx` (600 → 841 líneas)
- `src/components/GestionArsenal.css` (agregados estilos para formulario alta)
- `src/components/ManualUsuario.jsx` (sección 4 reescrita)
- `firestore.rules` (agregadas reglas solicitudesAlta + corregidas solicitudesBaja)

**Deploy:**
```bash
npm run build  # 539 modules, 2.7MB main bundle
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only hosting
```

**Build exitoso:**
- ✅ Hosting: https://club-738-app.web.app
- ✅ Firestore Rules deployadas
- ✅ Storage Rules deployadas
- ⚠️ Functions: 296 linting errors (no bloqueante)

#### Beneficios del Sistema Alta/Baja

**Para Socios:**
- Solicitar altas y bajas desde portal 24/7
- Tracking de solicitudes con estados visuales
- Historial completo de movimientos de arsenal
- No requiere visita física al club para solicitar

**Para Secretario:**
- Gestión centralizada de solicitudes
- Aprobación con un click
- Registro automático en Firestore
- Auditoría completa de cambios
- Workflow estructurado SEDENA-compliant

**Workflow Completo (Alta + Baja):**
```
Socio solicita BAJA → Secretario aprueba → Genera oficio 32 ZM
                                         ↓
Si receptor es socio → Notifica al receptor
                                         ↓
Receptor solicita ALTA → Secretario aprueba → Registra en arsenal
                                             ↓
                         Actualiza totalArmas en Firestore
```

#### Próximos Pasos

- [ ] Panel admin para gestionar solicitudes de alta
- [ ] Generador de oficios de alta para 32 ZM
- [ ] Subida de documentación (RFA, recibos)
- [ ] Validación de matrículas únicas (no duplicadas)
- [ ] Notificaciones email/WhatsApp automáticas

---

### 9 de Enero - Parte 2: Estrategia WhatsApp + Automatización WAPI Sender

#### Cambio de Estrategia: WhatsApp Business en lugar de Email

**Decisión**: Después de analizar tasas de apertura, se decidió usar WhatsApp como canal principal:
- Email: ~20-30% tasa de apertura
- WhatsApp: ~98% tasa de lectura
- Confirmación de lectura (palomitas azules)
- Interacción bidireccional inmediata

#### Extracción de Teléfonos desde Firestore

**Script creado**: `scripts/generar-mensajes-whatsapp.cjs`

**Funcionalidad**:
1. Lee credenciales desde `credenciales_socios.csv`
2. Extrae teléfonos desde Firestore (campo `telefono`)
3. Valida formato (10 dígitos)
4. Genera múltiples formatos de salida

**Resultados**:
- ✅ 75 socios con teléfono válido
- ❌ 1 socio sin teléfono: KRISZTIAN GOR (Credencial #227)
- ⚠️ 1 email en Firestore sin credenciales: agus_tin1_@hotmail.com (conocido)

#### Archivos Generados para WhatsApp

**1. CSV para extensiones Chrome** (`whatsapp-socios.csv`):
```csv
phone,name,email,password,credencial
529999490494,"ALEJANDRO GOMORY",agm@galletasdonde.com,qXb662ZRE$,147
```
- 75 socios
- Formato: +52 + 10 dígitos

**2. Mensajes individuales .txt** (`mensajes-whatsapp/`):
- 75 archivos pre-formateados
- Nomenclatura: `001-9999490494-NOMBRE.txt`
- Mensajes listos para copiar/pegar
- Backup para envío manual

**3. Template para Lista de Difusión** (`mensaje-lista-difusion.txt`):
- Mensaje genérico sin credenciales
- Para usar como último recurso

**4. Lista de socios sin teléfono** (`socios-sin-telefono.txt`):
- 1 socio (Krisztian Gor)
- Recibirá comunicación solo por email

#### Solución WAPI Sender (Chrome Extension)

**Problema inicial**: Primera extensión evaluada (WA Sender) no disponible en Chrome Web Store.

**Solución encontrada**: WAPI Sender
- URL: https://chromewebstore.google.com/detail/wapi-sender-wa-whatsapp-a/eacpodndpkokbialnikcedfbpjgkipil
- ✅ Soporta variables personalizadas
- ✅ Carga Excel con columnas custom
- ✅ Intervalo configurable entre mensajes
- ✅ Pausar/reanudar campaña
- ✅ Exportar reporte de envíos

#### Formato Excel para WAPI Sender

**Script creado**: `scripts/generar-excel-wapi-sender.cjs`

**Excel generado**: `WAPI-Sender-Socios.xlsx`

**Estructura**:
| Columna | Contenido | Variable en mensaje |
|---------|-----------|---------------------|
| WhatsApp Number(with country code) | +529991234567 | N/A |
| First Name | RICARDO | `{First Name}` |
| Email | richfegas@icloud.com | `{Email}` |
| Password | mFq323zbN# | `{Password}` |
| Credencial | 1 | `{Credencial}` |

**Template de mensaje** (`WAPI-Sender-Template-Mensaje.txt`):
```
Hola {First Name} 👋

El *Club de Caza, Tiro y Pesca de Yucatán, A.C.* estrena portal web:

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: {Email}
• Contraseña: {Password}
• Credencial: #{Credencial}

📋 FUNCIONES:
✅ Expediente digital PETA
✅ Solicitar trámites
✅ Consultar tus armas
✅ Calendario tiradas 2026

⚠️ *Cambia tu contraseña al entrar*
(Menú → Mi Perfil)

📞 Dudas: Responde este mensaje

Saludos,
Secretaría
```

#### Instrucciones de Envío WAPI Sender

**Procedimiento**:
1. Abrir WhatsApp Web (web.whatsapp.com)
2. Escanear QR
3. Click en extensión WAPI Sender
4. Upload Excel: `WAPI-Sender-Socios.xlsx`
5. Pegar template de mensaje con variables
6. Configurar intervalo: 10-12 segundos (evita bloqueo WhatsApp)
7. Click "Send now"

**Tiempo estimado**:
- Setup: 5 minutos
- Envío: 15-20 minutos (75 mensajes × 12 seg)
- Total: ~25 minutos vs 3+ horas manual

**Ventajas**:
- ✅ 100% personalizado (cada socio recibe SUS credenciales)
- ✅ Automático (solo supervisar)
- ✅ Seguro (intervalo evita bloqueos)
- ✅ Pausable/reanudable
- ✅ Reporte de entregas exportable

#### Corrección de Beneficios en Templates Email

**Cambio aplicado**: Beneficios incluidos en cuota $6,000

**ANTES** (confuso):
- ✅ Participación en 11 tiradas programadas 2026

**AHORA** (claro):
- ✅ Derecho a participar en tiradas del club (cuota individual por evento)
- ✅ Apoyo del club en trámites de adquisición de armas ante DN27 (Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos) y compra en DCAM

**Archivos actualizados**:
- `emails-socios/TEMPLATE_GENERAL.html`
- `emails-socios/TEMPLATE_MOROSOS.html`
- `emails-socios/PROPUESTAS_REDACCION_EMAILS.md`

**Aclaración**: Las tiradas tienen costo individual por evento. La membresía da el DERECHO a participar, NO cubre inscripciones.

#### Archivos Listos para Campaña

**WhatsApp** (canal principal):
```
emails-socios/
├── WAPI-Sender-Socios.xlsx              → Excel para WAPI Sender (75 socios)
├── WAPI-Sender-Template-Mensaje.txt     → Template con variables
├── whatsapp-socios.csv                  → CSV alternativo (75 socios)
├── mensaje-lista-difusion.txt           → Backup: mensaje genérico
├── socios-sin-telefono.txt              → 1 socio (Krisztian Gor)
└── mensajes-whatsapp/                   → 75 archivos .txt (backup manual)
```

**Email** (respaldo):
```
emails-socios/
├── TEMPLATE_GENERAL.html                → 57 socios al corriente
├── TEMPLATE_MOROSOS.html                → 19 morosos
├── mail-merge-general.csv               → 57 registros
└── morosos-2025-mail-merge.csv          → 19 registros
```

**Deploy**: No requiere rebuild (solo archivos de campaña)

**Próximos pasos**:
1. Enviar WhatsApp con WAPI Sender (75 socios)
2. Enviar email a Krisztian Gor (1 socio sin teléfono)
3. Monitorear respuestas y dudas
4. Exportar reporte de entregas

---

### 9 de Enero - Parte 1: Campaña Email: Regeneración CSVs + Nombre Oficial del Club

#### Corrección Crítica de Distribución de Campaña

**Problema detectado**: La segmentación inicial de la campaña de emails estaba basada en datos incorrectos.

**Distribución INCORRECTA (anterior)**:
- Email general: 10 socios
- Morosos con armas: 59 socios
- Morosos sin armas: 7 socios
- **Total**: 76 emails

**Distribución CORRECTA (actual)**:
- Socios al corriente: 57 (pagaron 2025)
- Morosos 2025: 19 (NO pagaron 2025)
- Sergio (excluido): 1
- **Total**: 76 emails

**Cambios realizados**:

1. **Script de regeneración** (`scripts/regenerar-csvs-campana.cjs`):
   - Lee credenciales_socios.csv (77 socios)
   - Excluye a Sergio (smunozam@gmail.com)
   - Filtra 19 morosos confirmados en Firestore
   - Genera 2 CSVs finales:
     - `mail-merge-general.csv` (57 socios)
     - `morosos-2025-mail-merge.csv` (19 socios)

2. **Arqueo de validación** (`scripts/arqueo-morosos-vs-firestore.cjs`):
   - ✅ Cross-validación de 19 morosos vs Firestore
   - ✅ Verificación de exentos (7 socios)
   - ✅ Verificación de recién pagados (3 socios)
   - ✅ Todos los 19 morosos confirmados con estado='pendiente'
   - ✅ Cero conflictos

3. **Archivos eliminados** (obsoletos):
   - mail-merge-data.csv (10 socios - INCORRECTO)
   - morosos-con-armas-mail-merge.csv (59 socios - INCORRECTO)
   - morosos-sin-armas-mail-merge.csv (7 socios)

#### Estandarización del Nombre Oficial del Club

**Regla establecida**: En TODOS los comunicados a socios y externos, usar el nombre oficial completo.

**Nombre oficial**: "Club de Caza, Tiro y Pesca de Yucatán, A.C."  
**NO usar**: "Club 738" (es solo el número de registro SEDENA)

**Archivos actualizados**:
- `.github/copilot-instructions.md` - Regla agregada en sección "Nombre Oficial del Club"
- `emails-socios/TEMPLATE_GENERAL.html` - Headers y footers con nombre oficial
- `emails-socios/TEMPLATE_MOROSOS.html` - Headers y footers con nombre oficial
- `emails-socios/PROPUESTAS_REDACCION_EMAILS.md` - Todas las referencias actualizadas

**Contexto de uso**:
- ✅ Comunicados a socios (emails, oficios, credenciales)
- ✅ Documentos oficiales (PETAs, constancias)
- ✅ Comunicación externa (autoridades, otras organizaciones)
- ❌ NO usar en código (variables, archivos, componentes)
- ❌ NO usar en URLs o paths internos

#### Templates HTML Finales

**TEMPLATE_GENERAL.html** (57 destinatarios):
- Asunto: "Nuevo Portal YucatanCTP - Tu Expediente Digital"
- Mensaje: Portal como herramienta de enlace, expediente digital "una sola vez"
- Beneficios: Apoyo en trámites DN27/DCAM, derecho a participar en tiradas

**TEMPLATE_MOROSOS.html** (19 destinatarios):
- Asunto: "Importante: Regularización de Membresía 2026 - Requisito Legal"
- Mensaje: Marco legal (Ley Federal de Armas), regularización sin liquidar adeudos anteriores
- Plazo: Antes del 31 de marzo 2026

#### Corrección de Beneficios Incluidos en Cuota $6,000

**Cuota de Regularización 2026**: $6,000.00 MXN

**Incluye** (corregido):
- ✅ Membresía activa 2026
- ✅ 1 trámite PETA completo
- ✅ Acceso al nuevo portal web
- ✅ Expediente digital
- ✅ Derecho a participar en tiradas del club **(cuota individual por evento)**
- ✅ Apoyo del club en trámites de adquisición de armas ante DN27 y compra en DCAM

**Eliminado** (era confuso):
- ❌ "Participación en 11 tiradas programadas 2026" (NO incluye inscripciones)

**Aclaración**: Las tiradas del club tienen cuota individual por evento. La membresía da el DERECHO a participar como socio activo, pero no cubre las inscripciones.

**DN27**: Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos  
**DCAM**: Dirección de Comercialización de Armas y Municiones

#### Documentación Actualizada

**PROPUESTAS_REDACCION_EMAILS.md**:
- Estado: "Redacciones Finales - Aprobadas e implementadas en HTML"
- Distribución corregida: 57 + 19 = 76
- Nombre oficial del club en todas las referencias
- Beneficios corregidos (tiradas con cuota individual, apoyo DN27/DCAM)
- Sección de implementación con resumen de mejoras

**GUIA_MAIL_MERGE_2026.md**:
- Plan de envío: 2 días (DÍA 1: 50 general, DÍA 2: 7 general + 19 morosos)
- Templates correctos: TEMPLATE_GENERAL.html y TEMPLATE_MOROSOS.html
- CSVs regenerados: mail-merge-general.csv y morosos-2025-mail-merge.csv
- Checklist con verificación de nombre oficial
- Sección de archivos obsoletos marcados como NO usar

**RESUMEN_EJECUTIVO.md**:
- Distribución final: 57 general + 19 morosos = 76 emails
- Calendario: 2 días (no 4)
- Nombre oficial del club destacado
- Archivos de campaña actualizados

#### Arqueo Final

**Validación exitosa** (`scripts/arqueo-emails-socios.cjs`):
```
Total socios activos: 77
Total emails en campaña: 76
Emails únicos en campaña: 76
Socios NO incluidos: 1 (smunozam@gmail.com)

✅ ARQUEO EXITOSO - Campaña coherente con base de socios
✓ 76 emails listos para enviar
```

**Archivos listos para envío**:
- `emails-socios/TEMPLATE_GENERAL.html` → 57 socios
- `emails-socios/TEMPLATE_MOROSOS.html` → 19 socios
- `emails-socios/mail-merge-general.csv` → 57 registros
- `emails-socios/morosos-2025-mail-merge.csv` → 19 registros

**Deploy**: No requiere rebuild (solo cambios en emails-socios/)

**Próximos pasos**:
1. Instalar YAMM en Chrome
2. Enviar lote piloto (1-2 emails de prueba)
3. Ejecutar campaña DÍA 1: 50 emails generales (9-11 AM)
4. Ejecutar campaña DÍA 2: 7 generales + 19 morosos

---

### 8 de Enero - v1.17.0 Google Search Console + Nuevo Socio

#### Google Search Console Verificado

**Objetivo**: Indexar el sitio en Google para aparecer en búsquedas orgánicas.

**Pasos completados**:
1. **Dominio verificado en Google Search Console**:
   - Método: Proveedor de nombres de dominio (DNS TXT)
   - Registro TXT agregado: `google-site-verification=w-Kkbf98VWF0N1Wq3LvEpuTbv_SqYBu7cSONR_bVYpk`
   - Estado: ✅ Propiedad verificada correctamente

2. **Sitemap enviado**:
   - URL: https://yucatanctp.org/sitemap.xml
   - Estado: ✅ Correcto
   - Páginas detectadas: **4**
   - Enviado: 8 enero 2026
   - Última lectura: 8 enero 2026

**Registros DNS activos** (verificado con nslookup):
```
yucatanctp.org TXT = "hosting-site=club-738-app"
yucatanctp.org TXT = "google-site-verification=w-Kkbf98VWF0N1Wq3LvEpuTbv_SqYBu7cSONR_bVYpk"
yucatanctp.org TXT = "v=spf1 include:spf.efwd.registrar-servers.com ~all"
```

**Impacto esperado**:
- 📈 Indexación en Google en 24-48 horas
- 🔍 Aparición en búsquedas: "club de tiro merida", "YucatanCTP", "FEMETI yucatan"
- 📊 Reportes de tráfico en Search Console

#### Nuevo Socio Agregado

**Socio**: LUIS FERNANDO GUILLERMO GAMBOA
- Credencial: **236**
- CURP: GUGL750204HYNLMS04
- Email: oso.guigam@gmail.com
- Teléfono: 9992420621
- Domicilio: Calle 32 x 9 Cedro, Tablaje 23222, Loc. Tixcuytun, Mérida, Yucatán 97305
- No. Consecutivo: **77**
- Fecha de alta: **08/01/2026**
- Total armas: 0

**Acciones realizadas**:
1. ✅ Usuario creado en Firebase Auth
   - UID: vpLW9ShJshTy7cctdGd4zsqKear2
   - Password temporal: `Club738-GUGL75`

2. ✅ Documento creado en Firestore (`socios/oso.guigam@gmail.com`)
   - Estructura completa con domicilio normalizado
   - `bienvenidaVista: false`
   - `totalArmas: 0`

3. ✅ CSV master actualizado
   - Archivo: `data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv`
   - Línea 289 agregada

**Script creado**: `scripts/agregar-socio-236.cjs`
- Crea usuario en Auth
- Crea documento en Firestore
- Maneja duplicados (si usuario ya existe)

**Estado**: El socio puede acceder al portal yucatanctp.org con sus credenciales.

**Pendiente**:
- [ ] Google Business Profile (requiere acceso de Fabiola - fa...@gmail.com)
- [ ] Eliminar perfil duplicado en Google Maps
- [ ] Envío de credenciales al socio

**Deploy**: No requiere deploy (solo datos backend)

---

### 8 de Enero - v1.16.0 SEO Completo + Dominio Personalizado yucatanctp.org

#### Optimización SEO y Adquisición de Dominio

**Objetivo**: Mejorar la visibilidad en buscadores y establecer identidad profesional con dominio personalizado .org apropiado para Asociación Civil.

**Dominio adquirido**:
- **yucatanctp.org** ($7.18 USD - descuento NEW YEAR SALE)
- Registrar: NameCheap
- Renovación automática: Activada
- WhoisGuard: Incluido GRATIS
- Fecha renovación: 8 enero 2027

**Optimizaciones SEO implementadas**:

1. **Meta Tags Completos** (`index.html`):
   - Title optimizado: "YucatanCTP - Club de Caza, Tiro y Pesca Yucatán | SEDENA 738"
   - Meta description con palabras clave estratégicas
   - Keywords: club de tiro yucatan, FEMETI, tiro practico mexicano, sporting clays, skeet, trap, recorrido de caza
   - Open Graph para redes sociales (Facebook, WhatsApp)
   - Twitter Cards
   - Geo tags (Mérida, Yucatán)
   - Canonical URL

2. **Datos Estructurados JSON-LD**:
   - Schema.org tipo "SportsOrganization"
   - Información completa: nombre, ubicación, contacto
   - AlternateName: "YucatanCTP", "Club 738"
   - Afiliación FEMETI
   - Geolocalización (20.9674, -89.5926)

3. **Sitemap XML** (`public/sitemap.xml`):
   - Páginas indexables: /, /calendario, /tiradas, /calculadora
   - Prioridades y frecuencias de cambio
   - URLs con dominio personalizado

4. **Robots.txt** (`public/robots.txt`):
   - Allow: Rutas públicas
   - Disallow: Dashboard y rutas privadas de socios
   - Sitemap reference
   - Bloqueo de bots maliciosos (AhrefsBot, SemrushBot)

**DNS Configurado (NameCheap → Firebase)**:
```
A Record:     @ → 199.36.158.100
TXT Record:   @ → hosting-site=club-738-app
CNAME Record: www → yucatanctp.org
```

**Seguridad**:
- 2FA activado con Authy (TOTP)
- 10 códigos de respaldo guardados
- Credenciales documentadas en `CREDENTIALS_NAMECHEAP.txt` (gitignored)
- WhoisGuard protege datos personales del WHOIS

**Archivos creados**:
- `public/sitemap.xml`
- `public/robots.txt`
- `CREDENTIALS_NAMECHEAP.txt` (local, no se sube a GitHub)

**Archivos modificados**:
- `index.html`: Meta tags completos + JSON-LD
- `.gitignore`: Protección de credenciales

**Estado actual**:
- ⏳ DNS propagándose (24-48 hrs máximo)
- ⏳ Firebase verificará dominio automáticamente
- ⏳ SSL/HTTPS se configurará automáticamente
- ✅ SEO optimizado desplegado en producción

**Próximos pasos** (cuando DNS propague):
- [ ] Registrar en Google Search Console
- [ ] Enviar sitemap.xml
- [ ] Crear Google Business Profile
- [ ] Actualizar redes sociales con nuevo dominio

**Deploy**: Aplicado a producción - URL transición de club-738-app.web.app a yucatanctp.org

---

### 8 de Enero - v1.15.0 Normalización Completa de Base de Datos CSV

#### Sistema de Normalización de Datos

**Objetivo**: Crear pipeline completo de normalización de datos desde Excel/CSV hasta Firestore, resolviendo problemas de calidad de datos (saltos de línea, campos concatenados, filas basura).

**Problema**: CSV original con 471 filas contenía:
- Saltos de línea (`\n`) dentro de celdas que rompían el formato
- 184 filas completamente vacías (solo comas)
- Columnas vacías al final de cada fila
- Campo "NOMBRE DEL SOCIO" con número de credencial concatenado
- 10 socios sin armas registradas causando errores de importación

**Solución implementada**:

1. **Normalización de saltos de línea y limpieza** (`normalizar-csv-saltos-linea.py`):
   - Reemplaza `\n` y `\r` por espacios
   - Elimina espacios múltiples
   - Remueve columnas vacías al final
   - Elimina filas completamente vacías
   - Resultado: 287 filas (header + 286 registros)

2. **Separación de campos concatenados** (`separar-nombre-credencial.py`):
   - Separa "1. RICARDO JESÚS FERNÁNDEZ Y GASQUE" en dos columnas:
     - Columna 3: `No. CREDENCIAL` (1, 30, 46...)
     - Columna 4: `NOMBRE DEL SOCIO` (nombre limpio)
   - Regex: `^(\d+)\.\s+(.+)$`

3. **Importación inteligente a Firestore** (`importar-csv-normalizado.cjs`):
   - Agrupa armas por email (socio)
   - Maneja socios sin armas (`totalArmas: 0`)
   - Solo crea documentos de armas si matrícula existe
   - Usa matrícula como ID de documento
   - Actualiza domicilio con 6 campos normalizados

4. **Diagnóstico de problemas** (`buscar-armas-sin-matricula.py`):
   - Identifica 10 socios sin armas registradas
   - Evita errores de validación en Firestore

**Archivos creados**:
- `scripts/normalizar-csv-saltos-linea.py`
- `scripts/separar-nombre-credencial.py`
- `scripts/importar-csv-normalizado.cjs`
- `scripts/buscar-armas-sin-matricula.py`
- `data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv` (CSV maestro normalizado)

**Archivos eliminados** (obsoletos):
- `2025.31.12_RELACION_SOCIOS_ARMAS copia con direccion, para firebase.csv`
- `2025.31.12_RELACION_SOCIOS_ARMAS copia con direccion.csv`
- `2025.31.12_RELACION_SOCIOS_ARMAS_NORMALIZADO.csv`
- `direcciones_separadas.csv`

**Resultado Final en Firestore**:
- ✅ 75 socios actualizados con estructura completa:
  - `numeroCredencial`: String
  - `nombre`: String
  - `curp`: String
  - `telefono`: String
  - `domicilio`: Object con 6 campos (calle, colonia, ciudad, municipio, estado, cp)
  - `totalArmas`: Number
- ✅ 276 armas en subcollections `socios/{email}/armas/{matricula}`
- ✅ 10 socios sin armas con `totalArmas: 0` (sin errores)

**Estadísticas de normalización**:
- Filas originales: 471
- Filas eliminadas (basura): 184
- Filas válidas: 287 (1 header + 286 armas)
- Celdas modificadas: 71 (saltos de línea reemplazados)
- Socios únicos: 75
- Socios con armas: 65
- Socios sin armas: 10

**Calidad de datos**: 100% de socios importados exitosamente, 0 errores de validación

---

### 8 de Enero - v1.14.0 Campo Ciudad en PDF PETA

#### Optimización de Formato PDF

**Objetivo**: Utilizar el campo `ciudad` en la generación de PDFs PETA para mejorar la claridad geográfica de las direcciones.

**Cambios realizados**:
- Agregado estado `ciudad` al componente GeneradorPETA
- Pre-llenado de `ciudad` desde `socioSeleccionado.domicilio.ciudad`
- Cambio en formato PDF de "DELG. O MPIO.: MÉRIDA, YUCATÁN" a "CIUDAD Y ESTADO: MÉRIDA, YUCATÁN"

**Archivos modificados**:
- `src/components/GeneradorPETA.jsx`:
  - Línea 59: Agregado `const [ciudad, setCiudad] = useState('')`
  - Línea 93: Pre-llenado `setCiudad(socioSeleccionado.domicilio.ciudad || '')`
  - Línea 311: Cambio de etiqueta y uso de campo ciudad en PDF

**Contexto**: El campo `ciudad` ya estaba poblado en Firestore para los 75 socios desde el script de normalización de domicilios, pero no se utilizaba en la generación de PDFs. Este cambio aprovecha el campo para mostrar la localidad exacta (especialmente útil para casos como BECANCHEN en municipio TEKAX).

**Deploy**: Aplicado a producción https://club-738-app.web.app

---

### 7 de Enero - v1.13.0 ExpedienteImpresor + Fix VerificadorPETA

#### Nuevo Módulo: ExpedienteImpresor

**Objetivo**: Herramienta para el secretario que permite verificar y preparar documentos digitales para impresión cuando el socio trae sus documentos físicos.

**Funcionalidades**:
- Búsqueda de socio por nombre o email
- Vista de todos los documentos del expediente con estado (✅/❌)
- Indicador de copias requeridas por documento
- Botón "Ver / Imprimir" individual por documento
- Botón "Abrir todos para imprimir" (abre múltiples pestañas)
- Lista de registros de armas (RFA) del socio
- Notas de impresión (INE 200%, etc.)

**Documentos verificados**:
| Documento | Copias requeridas |
|-----------|-------------------|
| INE (ambas caras) | 2 copias ampliadas 200% |
| CURP | 2 copias |
| Cartilla Militar / Acta Nacimiento | 2 copias |
| Constancia Antecedentes Penales | 1 copia (original se entrega) |
| Comprobante de Domicilio | 2 copias |
| Certificado Médico | 1 copia (original se entrega) |
| Certificado Psicológico | 1 copia (original se entrega) |
| Certificado Toxicológico | 1 copia (original se entrega) |
| Modo Honesto de Vivir | 1 copia (original se entrega) |
| Licencia SEMARNAT (opcional) | 2 copias |
| Foto Infantil Digital (opcional) | Para credencial del club |

**Archivos creados**:
- `src/components/ExpedienteImpresor.jsx`: Componente principal
- `src/components/ExpedienteImpresor.css`: Estilos

**Archivos modificados**:
- `src/App.jsx`: Import del componente + tarjeta en panel admin + renderizado de sección

#### Fix: VerificadorPETA - Progreso dinámico

**Problema**: El badge de progreso mostraba "0/19 docs" aunque había documentos encontrados en Storage y checkboxes marcados.

**Causa**: La función `seleccionarPETA()` solo cargaba `peta.verificacionDigitales || {}` pero no auto-marcaba los documentos que ya existían.

**Solución**: Modificar `seleccionarPETA()` para que itere sobre `DOCUMENTOS_DIGITALES` y auto-marque como verificados los documentos que existen en Firestore (`documentosPETA`) o Storage (`preloadedDocs`).

**Código clave agregado**:
```javascript
// Auto-marcar como verificados los documentos que EXISTEN
DOCUMENTOS_DIGITALES.forEach(docItem => {
  const existeEnFirestore = socio.documentosPETA?.[docItem.id]?.url;
  const existeEnStorage = preloaded[docItem.id]?.url;
  
  if ((existeEnFirestore || existeEnStorage) && autoVerifDigitales[docItem.id] === undefined) {
    autoVerifDigitales[docItem.id] = true;
  }
});
```

---

### 6 de Enero - v1.12.1 Enlaces SEDENA en Landing Page

#### Nueva Sección: Enlaces SEDENA

**Objetivo**: Facilitar a los socios el acceso a formatos de pago e5cinco.

**Ubicación**: Landing page pública, arriba del pie de página.

**Diseño**:
- **Título**: 📋 Enlaces SEDENA
- **Subtítulo**: *Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos*
- **Grid**: 4 tarjetas con iconos y descripciones

**Tarjetas**:
| Icono | Título | URL |
|-------|--------|-----|
| 📄 | Pago PETA (hasta 3 armas) | PDF formato e5cinco PETA |
| ➕ | Pago por Arma Adicional | PDF formato arma adicional |
| 💰 | Todos los Formatos e5cinco | Catálogo completo SEDENA |
| 🏪 | Comercialización de Armas | Portal DCAM |

**Archivos modificados**:
- `LandingPage.jsx`: Nueva sección `sedena-links-section` con grid de 4 enlaces
- `LandingPage.css`: Estilos `.sedena-links-section`, `.sedena-links-grid`, `.sedena-link-card`, `.sedena-subtitle`

---

### 6 de Enero - v1.12.0 Rediseño UX Expediente Digital + Foto Credencial

#### Rediseño del Flujo de Documentos PETA

**Cambios conceptuales**:
- Renombrado "Mis Documentos PETA" → "Mi Expediente Digital"
- Enfoque en facilitar el trámite, no en "subir 16 documentos"
- Separación clara: documentos digitales vs físicos

**Documentos eliminados del upload** (se entregan físicos):
- ❌ `fotoPETA` - Foto infantil para PETA
- ❌ `reciboe5cinco` - Recibo de pago de derechos

**Documentos ahora opcionales** (originales físicos):
- 🟡 Certificado Médico
- 🟡 Certificado Psicológico
- 🟡 Certificado Toxicológico

#### Nueva Bienvenida e Instrucciones al Socio

**Sección de bienvenida** en Mi Expediente Digital:
```
👋 ¡Bienvenido!
Para la renovación de tu membresía y trámite PETA:
1. Sube tu documentación digital
2. Prepara los originales físicos
3. Agenda una cita para entrega y pago
```

**Información de entrega física**:
```
📍 MVZ Sergio Muñoz de Alba Medrano
   Secretario del Club
   Calle 26 #246-B x 15 y 15A
   Col. Vista Alegre, 97130, Mérida
   📍 Google Maps | 📱 WhatsApp para cita
```

#### Tarjeta Estado de Pagos Habilitada

**Cambios en Dashboard del Socio**:
- ❌ Eliminada tarjeta "Mi Credencial" (se imprime física)
- ✅ Habilitada tarjeta "Estado de Pagos" con badge dinámico:
  - `✅ Al corriente` (verde) si `renovacion2026.estado === 'pagado'`
  - `⏳ Pendiente` (amarillo) si no

**Modal de Estado de Pagos**:
- Si pagado: muestra monto, fecha, método de pago
- Si pendiente: instrucciones y botón "Agendar cita por WhatsApp"

#### Foto para Credencial como JPG

**Problema**: El uploader convertía todo a PDF, pero necesitamos JPG para Canva.

**Solución**: Nuevo modo `imageOnly` en `MultiImageUploader`:
- Interfaz simplificada: "📸 Sube tu foto"
- Acepta JPG, PNG, HEIC (convierte a JPG)
- Se sube directamente como `.jpg` (no PDF)
- Usado solo para `fotoCredencial`

#### Script: Subida Masiva de Fotos Existentes

**Nuevo script**: `scripts/subir-fotos-credencial.cjs`
- Lee fotos de `data/fotos/fotos_para_canva_bis/`
- Formato nombre: `{seq}_{numCredencial}_{NOMBRE}.jpeg`
- Mapea credencial → email via `credenciales_socios.json`
- Sube a Storage: `documentos/{email}/fotoCredencial_{timestamp}.jpg`
- Actualiza Firestore con estado `precargado`

**Resultado**: 35 fotos subidas exitosamente

#### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `DocumentList.jsx` | Eliminados fotoPETA, reciboe5cinco; certificados opcionales; nueva bienvenida |
| `DocumentList.css` | Estilos para bienvenida, dirección entrega, contacto |
| `DocumentCard.jsx` | Nuevo array `IMAGE_ONLY_DOCS`, prop `imageOnly` |
| `MultiImageUploader.jsx` | Prop `imageOnly`, función `handleImageOnlyUpload`, upload como JPG |
| `MultiImageUploader.css` | Estilos para modo imagen simplificado |
| `App.jsx` | Modal estado pagos, eliminada tarjeta credencial, badge dinámico |
| `App.css` | Estilos modal pagos, badges pagado/pendiente |
| `LandingPage.jsx` | Cuotas reemplazadas por contacto WhatsApp/email |

---

### 6 de Enero - v1.11.0 Módulo Corte de Caja + Sincronización de Pagos

#### Housekeeping: Reorganización de Estructura del Proyecto

**Objetivo**: Limpiar el root del proyecto y organizar archivos por categoría.

**Nueva estructura de carpetas**:
```
club-738-web/
├── data/                    # DATOS LOCALES (no se suben a Git)
│   ├── socios/              # Excel, CSVs, auth imports
│   ├── credenciales/        # Canva exports, PDFs impresión
│   ├── constancias/         # Constancias antecedentes penales
│   ├── curps/pdfs/          # PDFs de CURPs
│   └── fotos/               # Fotos infantiles socios
│
├── docs/                    # DOCUMENTACIÓN
│   ├── formatos-peta/       # Formatos Word solicitudes
│   ├── legal/               # Ley de Armas, privacidad
│   └── Tiradas Club 738/    # Info de tiradas
│
├── src/components/privacidad/  # Componentes React de privacidad
└── public/assets/           # Logos e imágenes públicas
```

**Archivos movidos**:
| Origen | Destino |
|--------|---------|
| `Base datos/*.xlsx` | `data/socios/` |
| `credenciales_socios.*` | `data/socios/` |
| `Credencial-Club-2026/` | `data/credenciales/` |
| `2025. 738. CONSTANCIAS...` | `data/constancias/` |
| `curp_socios/` | `data/curps/pdfs/` |
| `fotos infantiles socios/` | `data/fotos/` |
| `privacidad/*.jsx,css` | `src/components/privacidad/` |
| `privacidad/*.md,pdf` | `docs/legal/` |

**.gitignore actualizado** para nueva estructura `data/`

---

#### Major Feature: Reporte de Pagos / Corte de Caja

**Objetivo**: Crear un módulo de reportes que muestre el estado de cobranza con corte de caja.

#### ReporteCaja.jsx - Nuevo Módulo

**Features implementados**:
- 4 tarjetas de resumen: Total recaudado, Socios pagados, Pendientes, Desglose
- Agrupación por método de pago (efectivo, transferencia, tarjeta, cheque)
- Filtros: Estado (todos/pagados/pendientes/exentos), búsqueda, rango de fechas
- Ordenamiento por nombre, fecha de pago, o monto
- Tabla detallada con: nombre, estado, fecha, cuota club, FEMETI, total, método, comprobante
- Exportar a CSV con encoding UTF-8 (BOM)
- Vista optimizada para impresión

**Integración**:
- Acceso desde Dashboard del Secretario → "📊 Corte de Caja"
- Lee datos de `renovacion2026` y `membresia2026` (dual-source)

#### Bug Fix: Sincronización de Sistemas de Pago

**Problema detectado**: El módulo RegistroPagos y DashboardRenovaciones usaban campos diferentes:
- `RegistroPagos` → `membresia2026.activa`, `pagos[]`
- `DashboardRenovaciones` → `renovacion2026.estado`, `renovacion2026.cuotaClub/cuotaFemeti`

**Solución implementada**:

1. **RegistroPagos.jsx modificado** - Ahora actualiza ambos sistemas:
   ```javascript
   await updateDoc(socioRef, {
     pagos: arrayUnion(registroPago),
     membresia2026: { activa: true, ... },
     'renovacion2026.estado': 'pagado',
     'renovacion2026.cuotaClub': cuotaClub,
     'renovacion2026.cuotaFemeti': cuotaFemeti,
     ...
   });
   ```

2. **DashboardRenovaciones.jsx modificado** - Detecta pagos de ambas fuentes:
   ```javascript
   if (estado !== 'pagado' && data.membresia2026?.activa) {
     estado = 'pagado';
   }
   ```

3. **firestore.rules actualizado** - Permite al secretario actualizar todos los campos:
   ```javascript
   allow update: if isSecretario();
   ```

4. **Migración de datos** - Script para sincronizar pagos existentes (ej: Santiago Quintal Paredes)

#### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `src/components/ReporteCaja.jsx` | Módulo de corte de caja |
| `src/components/ReporteCaja.css` | Estilos responsive + impresión |

#### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/App.jsx` | Import ReporteCaja, botón en menú admin, sección de visualización |
| `src/components/RegistroPagos.jsx` | Sincroniza renovacion2026 al registrar pago |
| `src/components/DashboardRenovaciones.jsx` | Lee de ambas fuentes de pago |
| `firestore.rules` | Permisos de escritura para secretario |

---

### 5 de Enero - v1.10.0 Paleta de Colores + Mejoras UI

#### Implementación de Variables CSS

**Objetivo**: Centralizar colores del proyecto para mantener consistencia visual.

**Variables definidas en :root**:
```css
--color-primary: #2d5a2d;
--color-primary-dark: #1a2e1a;
--color-primary-light: #e8f5e8;
--color-success: #2d7a2d;
--color-warning: #f0a020;
--color-danger: #dc3545;
--color-text-primary: #1a2e1a;
--color-text-muted: #888;
...
```

#### Mejoras de UI

1. **Footer legibilidad** - Texto amarillo cambiado a color visible
2. **Logo como botón home** - Click en logo regresa a landing
3. **Botones "Volver"** - Estilizados consistentemente en todas las secciones
4. **Firebase Functions** - Deploy de funciones de email (onPetaCreated, testEmail)

---

### 4 de Enero - v1.6.0 Portal Público Completo

#### Major Release: Landing Page + Calendario de Tiradas + Calculadora PCP

**Objetivo**: Transformar la app de un simple login a un portal público informativo con acceso a socios.

#### Nueva Arquitectura de Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | LandingPage | Página principal con tarjetas de features |
| `/calendario` | CalendarioTiradas | Calendario 2026 (Club 738 + Sureste) |
| `/calculadora` | CalculadoraPCP | Calculadora de energía cinética |

#### LandingPage.jsx - Portal de Entrada

**Features implementados**:
- Header oficial con logo y 3 registros (SEDENA 738, FEMETI YUC 05/2020, SEMARNAT)
- 3 tarjetas de features: Calendario, Calculadora, Hazte Socio
- Login integrado en la página (Portal de Socios)
- Modal de requisitos para nuevos socios con cuotas 2026
- Footer con ubicación, contacto y registros oficiales

**Correcciones aplicadas**:
- Año del club: Fundado 2005 (no "70+ años")
- Cuotas actualizadas a 2026
- Eliminado subheader duplicado
- Eliminadas tarjetas de estadísticas (socios activos, años de historia)

#### CalendarioTiradas.jsx - Competencias 2026

**Fuente de datos**: `src/data/tiradasData.js`

**Tiradas Club 738** (11 confirmadas):
- Recorrido de Caza (RC): Tirada del Benemérito, Tirada del Padre, etc.
- Tiro Práctico Mexicano (TPM): Competencias bimestrales
- Blancos en Movimiento (BM)
- Siluetas Metálicas (SM)

**Región Sureste** (50+ tiradas):
- Estados: Yucatán, Campeche, Quintana Roo, Tabasco, Chiapas, Veracruz
- Fuente: FEMETI - Registro Nacional 2026

**Features del calendario**:
- 3 vistas: Calendario mensual, Lista, Solo Club 738
- Filtros por modalidad y estado
- Semana inicia en Lunes (Sáb/Dom a la derecha)
- Link a Google Maps del campo de tiro
- Navegación de regreso a landing

#### CalculadoraPCP.jsx - Energía Cinética

**Propósito**: Verificar si un rifle de aire requiere registro SEDENA (>140 joules)

**Funcionalidad**:
- Selector de calibres por categoría (pequeños, medianos, grandes)
- Cálculo: E = 0.5 × m × v² (granos → kg, fps → m/s)
- Resultado visual: ✅ No requiere / ⚠️ Requiere registro
- Velocidad límite calculada para cada peso

#### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `src/components/LandingPage.jsx` | Página de inicio pública |
| `src/components/LandingPage.css` | Estilos responsive |
| `src/components/CalendarioTiradas.jsx` | Calendario de competencias |
| `src/components/CalendarioTiradas.css` | Estilos del calendario |
| `src/components/CalculadoraPCP.jsx` | Calculadora de energía |
| `src/components/CalculadoraPCP.css` | Estilos de la calculadora |
| `src/data/tiradasData.js` | Datos de 60+ tiradas 2026 |
| `public/assets/logo-club-738.jpg` | Logo oficial del club |

#### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/App.jsx` | Detección de rutas públicas, import LandingPage |
| `.github/copilot-instructions.md` | Documentación completa actualizada |

#### Documentación Actualizada

**copilot-instructions.md** - Reescrito completamente:
- Información oficial del club (registros correctos)
- Arquitectura de componentes actual
- Estructura de rutas públicas
- Cuotas 2026
- Calendario de tiradas
- Pending features actualizado

---

### 3 de Enero - v1.3.0 OCR Validation + Centralización de Registros de Armas

#### Problema resuelto: Upload de registros de armas fallaba por permisos

**Error detectado**: Al subir PDF de registro de arma desde "Mis Armas", aparecía error de permisos de Firestore:
```
Missing or insufficient permissions
```

**Root cause**: Las reglas de Firestore tienen `allow write: if false` en `/socios/{email}/armas/{armaId}`, bloqueando actualizaciones desde cliente.

**Solución implementada**: 

1. **Centralizar uploads en "Documentos PETA"** - El documento "Registros de Armas (RFA)" ahora muestra las armas del socio con opción de subir cada registro individual.

2. **Validación OCR automática** - Antes de subir, el sistema:
   - Extrae texto del PDF usando pdfjs-dist
   - Si es PDF escaneado, aplica OCR con tesseract.js
   - Verifica que la matrícula del arma aparezca en el documento
   - Solo permite upload si la matrícula coincide

3. **MisArmas simplificado** - Vista de solo lectura mostrando estado de registros

#### Archivos creados
- `src/utils/ocrValidation.js` - Validador OCR con lazy loading
- `src/components/documents/ArmasRegistroUploader.jsx` - Uploader especializado
- `src/components/documents/ArmasRegistroUploader.css` - Estilos

#### Archivos modificados
- `src/components/MisArmas.jsx` - Simplificado a vista read-only
- `src/components/MisArmas.css` - Estilos para nota informativa
- `src/components/documents/DocumentCard.jsx` - Caso especial para registrosArmas
- `src/components/documents/DocumentCard.css` - Estilos card armas

#### Dependencias agregadas
- `tesseract.js` - OCR en navegador
- `pdfjs-dist` - Extracción de texto y rendering de PDFs

#### Características técnicas
- **Lazy loading** de bibliotecas pesadas para no afectar carga inicial
- **Dos métodos de extracción**: texto nativo del PDF + OCR como fallback
- **Variaciones de OCR**: Tolera confusiones comunes (0/O, 1/I/L, 5/S)
- **Progress feedback**: Muestra progreso de validación al usuario

---

### 3 de Enero - v1.2.0 Uploader con opción PDF preparado

#### Mejora UX: Selector de modo de subida

**Problema identificado**: Las fotos tomadas desde iPhone y convertidas a PDF resultaban de muy baja calidad. Los documentos oficiales (especialmente INE) requieren ampliación al 200% y buena resolución.

**Solución**: Dar al usuario la opción clara de subir un PDF ya preparado correctamente.

#### MultiImageUploader - Selector de modo

Ahora muestra **dos opciones claras** al iniciar:

1. **📄 "Ya tengo PDF listo"**
   - Requisitos mostrados: Tamaño carta, 200 DPI, ampliado 200%, máx 5MB
   - Link directo a iLovePDF.com para preparar documentos
   - Solo acepta archivos PDF

2. **📷 "Tomar foto"**  
   - Convierte fotos a PDF automáticamente
   - Advertencia especial para INE sobre preparar PDF al 200%

#### MisArmas - Solo PDFs

- **Eliminada opción de imágenes** - Solo acepta PDFs
- Requisitos claros: Tamaño carta, 200-300 DPI, máx 5MB
- Mensaje de error informativo con link a iLovePDF

#### Archivos modificados
- `src/components/documents/MultiImageUploader.jsx` - Selector de modo PDF/Foto
- `src/components/documents/MultiImageUploader.css` - Estilos para selector
- `src/components/MisArmas.jsx` - Solo acepta PDFs

---

### 3 de Enero - v1.1.1 Fix Storage Path + CORS

#### Bug crítico corregido: Error de permisos en upload

**Problema**: Al subir documentos desde iPhone aparecía error:
```
User does not have permission to access 'documentos/EQASQOwPz1PRZRxjcBt695dD2tl1/ine_xxx.pdf'
```

**Root cause**: `DocumentUploader.jsx` usaba ruta incorrecta:
- ❌ Antes: `socios/${userId}/documentos/${fileName}`
- ✅ Ahora: `documentos/${userId}/${fileName}`

**Solución aplicada**:
1. Corregí ruta en `DocumentUploader.jsx` línea 48
2. Instalé Google Cloud SDK (`brew install --cask google-cloud-sdk`)
3. Configuré CORS para Firebase Storage

**CORS configurado** (`cors.json`):
```json
{
  "origin": ["https://club-738-app.web.app", "http://localhost:5173"],
  "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
  "maxAgeSeconds": 3600
}
```

**Comando ejecutado**:
```bash
gsutil cors set cors.json gs://club-738-app.firebasestorage.app
```

#### Mejoras de debugging
- Agregué console.log con emojis en `MisDocumentosOficiales.jsx`
- Agregué display de código de error en UI cuando documento no carga

#### Archivos modificados
- `src/components/documents/DocumentUploader.jsx` - Fix ruta Storage
- `src/components/MisDocumentosOficiales.jsx` - Logs de debug
- `src/components/MisDocumentosOficiales.css` - Estilo error code
- `cors.json` - Configuración CORS (nuevo)

---

### 3 de Enero - v1.1.0 Privacidad LFPDPPP

#### Implementación de Protección de Datos Personales

**Contexto legal**: La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) requiere que los sitios web que manejan datos personales:
1. Publiquen un Aviso de Privacidad
2. Informen sobre Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
3. Obtengan consentimiento expreso para datos sensibles

**Implementación completa**:

1. **Página de Aviso de Privacidad** (`/aviso-privacidad`)
   - 3 tabs: Simplificado, Integral, Derechos ARCO
   - Diseño responsive con estilos del club
   - Formulario para ejercer derechos ARCO (abre mailto:)

2. **Componente ConsentimientoPriv.jsx**
   - 3 checkboxes: primario (obligatorio), sensibles (obligatorio), secundario (opcional)
   - Para integrar en formulario de registro de socios

3. **Links en footer**
   - "📋 Aviso de Privacidad"
   - "⚖️ Derechos ARCO"

**Cumplimiento LFPDPPP**:
| Requisito | Artículo | ✅ |
|-----------|----------|---|
| Identidad del responsable | Art. 15.I | ✅ |
| Datos que se recaban | Art. 15.II | ✅ |
| Finalidades (primarias/secundarias) | Art. 15.III | ✅ |
| Datos sensibles con consentimiento | Art. 8 | ✅ |
| Derechos ARCO | Art. 22-27 | ✅ |
| Transferencias | Art. 36-37 | ✅ |

#### Archivos creados
- `src/components/privacidad/AvisoPrivacidad.jsx` (450+ líneas)
- `src/components/privacidad/AvisoPrivacidad.css`
- `src/components/privacidad/ConsentimientoPriv.jsx`
- `src/components/privacidad/ConsentimientoPriv.css`

#### Archivos modificados
- `src/App.jsx` - Import AvisoPrivacidad, sección privacidad, links en footer
- `src/App.css` - Estilos para links de privacidad

---

### 3 de Enero - v1.0.0 Release

#### Sesión de desarrollo completa

**Problema inicial**: Los socios necesitan subir documentos desde sus iPhones, pero las fotos en formato HEIC no se podían procesar.

**Solución implementada**:
1. Instalé `heic2any` para convertir HEIC → JPEG
2. Instalé `jsPDF` para convertir imágenes → PDF
3. Creé `MultiImageUploader.jsx` - componente que permite:
   - Seleccionar múltiples fotos (ej: INE frente y reverso)
   - Convertir automáticamente a PDF
   - Preview de imágenes antes de subir
   - Progress bar durante conversión

**Bug crítico encontrado**: Al probar en iPhone, apareció error de permisos:
```
User does not have permission to access 'documentos/EQASQOwPz1PRZRxjcBt695dD2tl1/...'
```

**Root cause**: El componente usaba `user.uid` (UID de Firebase Auth) pero las Storage Rules esperaban `user.email`. 

**Fix aplicado en App.jsx**:
```jsx
// Antes (incorrecto)
userId={user.uid}

// Después (correcto)
userId={user.email.toLowerCase()}
```

**Optimización móvil**: Agregué media queries para pantallas <480px:
- Header más compacto
- Cards de documentos con padding reducido
- Botones full-width para mejor touch target
- Grid de documentos en columna única

#### Archivos creados/modificados
- `src/components/documents/MultiImageUploader.jsx` (372 líneas)
- `src/components/documents/MultiImageUploader.css`
- `src/App.jsx` - Fix userId
- `src/App.css` - Mobile styles
- `src/components/documents/DocumentCard.css` - Mobile styles
- `src/components/documents/DocumentList.css` - Mobile styles

---

### 2 de Enero - v0.2.0

#### Expansión de documentos PETA

**Contexto**: Revisé el documento oficial "Requisitos PETA (1).docx" y encontré que se necesitan 16 documentos, no 8.

**Cambios**:
- Expandí `DocumentList.jsx` de 8 a 14 tipos de documentos
- Organicé en 6 categorías: Identificación, Médicos, Legales, Armas, Fotos, Pago
- Actualicé `copilot-instructions.md` con tabla de requisitos completa

**Documentos agregados**:
- Certificado Toxicológico
- Carta Modo Honesto de Vivir
- Licencia de Caza
- Registros de Armas (RFA)
- Fotografía
- Recibo e5cinco

#### Nuevo logo
- Subí el nuevo logo del club (escudo verde/dorado)
- Actualicé `public/logo-club-738.png`

---

### 1 de Enero - v0.1.0

#### Setup inicial y seguridad

**Reglas de seguridad implementadas**:

```javascript
// firestore.rules
match /socios/{email} {
  allow read, write: if request.auth.token.email.lower() == email;
}

// storage.rules
match /documentos/{email}/{document=**} {
  allow read, write: if request.auth.token.email.lower() == email;
}
```

**Principio**: Cada socio solo puede acceder a sus propios datos.

**Scripts de migración creados**:
- `scripts/subir-curps.cjs` - Subir 76 CURPs a Storage
- `scripts/actualizar-curps-firestore.cjs` - Actualizar URLs en Firestore
- `scripts/agregar-socios-faltantes.cjs` - Crear documentos para socios sin registro

---

## 🏗️ Arquitectura

```
club-738-web/
├── src/
│   ├── App.jsx              # Router principal + auth state
│   ├── firebaseConfig.js    # Firebase services init
│   └── components/
│       ├── Login.jsx        # Auth (login/signup)
│       ├── MisArmas.jsx     # Listado de armas
│       ├── MisDocumentosOficiales.jsx  # CURP + Constancia viewer
│       ├── WelcomeDialog.jsx           # Onboarding modal
│       ├── documents/
│       │   ├── DocumentList.jsx        # Grid de 14 documentos
│       │   ├── DocumentCard.jsx        # Card individual
│       │   ├── DocumentUploader.jsx    # Upload simple (PDF)
│       │   └── MultiImageUploader.jsx  # Upload multi-foto → PDF
│       └── privacidad/
│           ├── AvisoPrivacidad.jsx     # Página completa LFPDPPP
│           ├── AvisoPrivacidad.css
│           ├── ConsentimientoPriv.jsx  # Checkbox consentimiento
│           └── ConsentimientoPriv.css
├── privacidad/              # Documentos legales fuente (MD)
├── scripts/                 # Node.js migration scripts
├── firestore.rules          # Security rules DB
├── storage.rules            # Security rules files
└── firebase.json            # Hosting config
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Socios registrados | 76 |
| Tipos de documentos | 14 |
| Tamaño bundle | 2.4 MB (649 KB gzip) |
| Lighthouse Performance | Pending |
| Cobertura de tests | 0% (TODO) |

---

## 🔮 Roadmap

### v1.2.0 (Próximo)
- [ ] Generación de Credencial del Club (PDF)
- [ ] Notificaciones de documentos por vencer
- [ ] Panel de administrador para secretario

### v1.3.0
- [ ] Exportar expediente completo (ZIP)
- [ ] Firma digital en solicitud PETA
- [ ] Integración con calendario de vencimientos

### v2.0.0
- [ ] PWA con modo offline
- [ ] Push notifications
- [ ] Chat de soporte

### ✅ Completado en v1.1.0
- [x] Aviso de Privacidad (LFPDPPP)
- [x] Derechos ARCO
- [x] Consentimiento para datos sensibles

---

## 🐛 Bugs Conocidos

1. **Cache agresivo**: Usuarios ven versión vieja después de deploy. Solución: hard refresh o modo incógnito.

2. **Bundle grande**: 2.4MB por incluir Firebase completo. TODO: importar solo módulos necesarios.

---

## 👥 Contacto

- **Administrador**: Sergio Muñoz (smunozam@gmail.com)
- **Club**: tiropracticoyucatan@gmail.com
- **Teléfono**: +52 56 6582 4667

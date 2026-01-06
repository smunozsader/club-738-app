# Módulo PETA - Diagrama de Flujo

**Versión 1.10.0** - Implementación Completa

---

## 🔄 Flujo General del Trámite PETA

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SOCIO - Portal Web                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. Login
                                    ▼
                    ┌──────────────────────────────┐
                    │   Dashboard del Socio        │
                    │  - Mis Documentos PETA       │
                    │  - Mis Armas                 │
                    │  - Mis PETAs ← NUEVO         │
                    └──────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │ Mis Documentos PETA │       │     Mis PETAs       │
        │  📋 Subir 16 docs   │       │ 🎯 Ver solicitudes  │
        └─────────────────────┘       └─────────────────────┘
                    │                               │
                    │ 2. Completar                  │
                    │    expediente                 │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │ ✅ 16/16 documentos │       │ + Solicitar PETA    │
        └─────────────────────┘       └─────────────────────┘
                                                    │
                                                    │ 3. Llenar formulario
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │   SolicitarPETA.jsx          │
                                    │  - Tipo: Tiro/Comp/Caza      │
                                    │  - Seleccionar armas (10)    │
                                    │  - Seleccionar estados (10)  │
                                    │  - Verificar domicilio       │
                                    │  - Renovación? PETA anterior │
                                    └──────────────────────────────┘
                                                    │
                                                    │ 4. Enviar solicitud
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │ Firestore: petas/{id}        │
                                    │ Estado: documentacion_proceso│
                                    └──────────────────────────────┘
                                                    │
┌─────────────────────────────────────────────────┼───────────────────────┐
│                      SECRETARIO - Portal Web                            │
└─────────────────────────────────────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                                    ┌──────────────────────────────┐
                                    │   Panel de Secretario        │
                                    │  - Panel Cobranza            │
                                    │  - Verificador PETA ← NUEVO  │
                                    │  - Registro Pagos ← NUEVO    │
                                    │  - Generar PETA              │
                                    └──────────────────────────────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │               │               │
                                    ▼               ▼               ▼
                        ┌──────────────┐ ┌────────────┐ ┌─────────────┐
                        │ Verificador  │ │  Registro  │ │  Generar    │
                        │   PETA       │ │   Pagos    │ │   Oficio    │
                        └──────────────┘ └────────────┘ └─────────────┘
                                    │               │
                5. Cita con socio   │               │ 6. Registrar pago
                Verificar docs      │               │
                físicos             │               │
                                    ▼               ▼
                        ┌──────────────────────────────┐
                        │ VerificadorPETA.jsx          │
                        │ ✅ Docs digitales (10)       │
                        │ ✅ Docs físicos (9-11)       │
                        │ 📝 Notas secretario          │
                        │ ► Marcar como COMPLETO       │
                        └──────────────────────────────┘
                                    │
                                    │ 7. Estado: documentacion_completa
                                    ▼
                        ┌──────────────────────────────┐
                        │ RegistroPagos.jsx            │
                        │ 💰 Cuota Anual: $6,000       │
                        │ 💰 FEMETI: $350              │
                        │ ► Registrar y Activar        │
                        └──────────────────────────────┘
                                    │
                                    │ 8. Membresía 2026: ✅ Activa
                                    ▼
                        ┌──────────────────────────────┐
                        │ Estado: enviado_32zm         │
                        │ Folio: #12345                │
                        └──────────────────────────────┘
                                    │
┌─────────────────────────────────┼─────────────────────────────────────┐
│                        32 ZONA MILITAR - Valladolid                    │
└─────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ 9. Revisión SEDENA (DN27)
                                    │    4-8 semanas
                                    ▼
                        ┌──────────────────────────────┐
                        │ Estado: revision_sedena      │
                        └──────────────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                        ▼                       ▼
            ┌─────────────────┐   ┌─────────────────┐
            │ ✅ APROBADO     │   │ ❌ RECHAZADO    │
            │ Número PETA:    │   │ Motivo:         │
            │ S-1/M-4/123     │   │ ...             │
            └─────────────────┘   └─────────────────┘
                        │
                        │ 10. Recoger PETA en Zona Militar
                        ▼
            ┌─────────────────────────────────┐
            │ PETA VIGENTE                    │
            │ Vigencia: 15 Ene → 31 Dic 2026  │
            └─────────────────────────────────┘
```

---

## 📊 Estados del Trámite

| Estado | Icono | Descripción | Responsable | Siguiente Paso |
|--------|-------|-------------|-------------|----------------|
| `documentacion_proceso` | 🟡 | Socio recopilando documentos | Socio | Subir docs faltantes |
| `documentacion_completa` | 🟢 | Docs verificados por secretario | Secretario | Enviar a 32 ZM |
| `enviado_32zm` | 📤 | Expediente en Zona Militar | Secretario | Esperar revisión |
| `revision_sedena` | ⏳ | DN27 revisando expediente | SEDENA | Esperar resolución |
| `aprobado` | ✅ | PETA emitido | Socio | Recoger en 32 ZM |
| `rechazado` | ❌ | No aprobado | Socio | Corregir y reintentar |

---

## 🗂️ Componentes Implementados

### Para Socios

| Componente | Archivo | Función |
|------------|---------|---------|
| **Solicitar PETA** | `SolicitarPETA.jsx` | Formulario de solicitud nueva |
| **Mis PETAs** | `MisPETAs.jsx` | Ver estado de solicitudes |

### Para Secretario

| Componente | Archivo | Función |
|------------|---------|---------|
| **Verificador PETA** | `VerificadorPETA.jsx` | Checklist de docs digitales + físicos |
| **Registro Pagos** | `RegistroPagos.jsx` | Cobranza y activación membresías |
| **Generador PETA** | `GeneradorPETA.jsx` | Generar oficios PDF (existente) |

---

## 💾 Estructura de Datos

### Colección: `socios/{email}/petas/{petaId}`

```javascript
{
  // Tipo y estado
  tipo: 'tiro' | 'competencia' | 'caza',
  estado: 'documentacion_proceso' | 'documentacion_completa' | 
          'enviado_32zm' | 'revision_sedena' | 
          'aprobado' | 'rechazado',
  
  // Fechas
  fechaSolicitud: Timestamp,
  vigenciaInicio: Timestamp,
  vigenciaFin: Timestamp,
  
  // Datos del solicitante
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  domicilio: {
    calle: 'Calle 50 No. 531-E',
    colonia: 'Centro',
    cp: '97000',
    municipio: 'Mérida',
    estado: 'Yucatán'
  },
  
  // Armas (máx 10)
  armasIncluidas: [
    {
      id: 'arma123',
      clase: 'Escopeta',
      marca: 'Benelli',
      calibre: '12',
      modelo: 'M2',
      matricula: 'XXX123',
      cartuchos: 200
    }
  ],
  
  // Estados (solo competencia/caza, máx 10)
  estadosAutorizados: ['Yucatán', 'Campeche', 'Quintana Roo'],
  
  // Renovación
  esRenovacion: false,
  petaAnteriorNumero: '', // ej: 'S-1/M-4/86'
  
  // Verificación (llenado por secretario)
  verificacionDigitales: {
    curp: true,
    ine: true,
    'cartilla-militar': true,
    // ... 10 documentos digitales
  },
  verificacionFisicos: {
    'foto-peta': true,
    'e5cinco': true,
    'cert-medico-orig': true,
    // ... 9-11 documentos físicos
  },
  notasSecretario: 'Documentos completos. Todo en orden.',
  
  // Historial
  historial: [
    {
      estado: 'documentacion_proceso',
      fecha: Timestamp,
      usuario: 'juan@example.com',
      notas: 'Solicitud creada por el socio'
    },
    {
      estado: 'documentacion_completa',
      fecha: Timestamp,
      usuario: 'smunozam@gmail.com',
      notas: 'Verificado en cita presencial'
    }
  ],
  
  // Resultado (llenado cuando se resuelve)
  numeroPeta: 'S-1/M-4/123', // Asignado por SEDENA
  fechaEmision: Timestamp,
  motivoRechazo: '', // Solo si rechazado
  
  // Metadata
  creadoPor: 'juan@example.com',
  fechaCreacion: Timestamp,
  ultimaActualizacion: Timestamp,
  verificadoPor: 'smunozam@gmail.com',
  ultimaVerificacion: Timestamp
}
```

### Colección: `socios/{email}` (campos nuevos)

```javascript
{
  // ... campos existentes ...
  
  // Pagos (nuevo)
  pagos: [
    {
      fecha: Timestamp,
      conceptos: [
        { concepto: 'cuota_anual', nombre: 'Cuota Anual 2026', monto: 6000 },
        { concepto: 'femeti', nombre: 'FEMETI Socio', monto: 350 }
      ],
      total: 6350,
      metodoPago: 'transferencia',
      numeroRecibo: 'REC-2026-01-0001',
      notas: 'Pago completo 2026',
      registradoPor: 'smunozam@gmail.com',
      fechaRegistro: Timestamp
    }
  ],
  
  // Membresía (nuevo)
  membresia2026: {
    activa: true,
    fechaPago: Timestamp,
    monto: 6350,
    metodoPago: 'transferencia',
    numeroRecibo: 'REC-2026-01-0001'
  }
}
```

---

## 📱 Navegación en el Portal

### Dashboard del Socio

```
┌──────────────────────────────────────────────┐
│  Portal del Socio                            │
├──────────────────────────────────────────────┤
│                                              │
│  [🆔 Documentos Oficiales]                   │
│  [📋 Mis Documentos PETA]                    │
│  [📄 Mis Armas]                              │
│  [🎯 Mis PETAs] ← NUEVO                      │
│  [🎫 Mi Credencial (próximamente)]           │
│  [💳 Estado de Pagos (próximamente)]         │
│                                              │
└──────────────────────────────────────────────┘
```

### Panel del Secretario

```
┌──────────────────────────────────────────────┐
│  Panel de Secretario                         │
├──────────────────────────────────────────────┤
│                                              │
│  [📊 Panel de Cobranza]                      │
│  [🎂 Cumpleaños]                             │
│  [📄 Generar PETA]                           │
│  [✅ Verificador PETA] ← NUEVO               │
│  [💰 Registro de Pagos] ← NUEVO              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Socio solicita PETA de Práctica de Tiro

1. Socio completa expediente digital (16 docs)
2. Socio hace clic en "Mis PETAs" → "Solicitar PETA"
3. Selecciona tipo: **Práctica de Tiro**
4. Selecciona 3 armas de su inventario
5. Verifica domicilio
6. Envía solicitud → Estado: 🟡 `documentacion_proceso`
7. Agenda cita con Secretario
8. En cita, entrega docs físicos:
   - 1 foto infantil
   - Recibo e5cinco
   - Originales (certificados, constancia, etc.)
9. Secretario verifica con checklist → Estado: 🟢 `documentacion_completa`
10. Secretario registra pago ($6,350) → Membresía 2026 ✅
11. Secretario envía expediente a 32 ZM → Estado: 📤 `enviado_32zm`
12. SEDENA revisa → Estado: ⏳ `revision_sedena`
13. PETA aprobado → Estado: ✅ `aprobado`
14. Socio recoge PETA en Zona Militar

### Caso 2: Secretario verifica solicitudes pendientes

1. Secretario hace clic en "Verificador PETA"
2. Ve lista de socios con PETAs en proceso
3. Selecciona socio "Juan Pérez" → PETA Competencia Nacional
4. Ve progreso: 85% (17/20 docs verificados)
5. Revisa checklist:
   - ✅ 10/10 documentos digitales OK
   - ✅ 7/10 documentos físicos OK
   - ⏳ Falta: Licencia de Caza, PETA anterior, 1 RFA
6. Agrega nota: "Falta traer licencia SEMARNAT vigente"
7. Guarda progreso
8. Cuando complete, marca "Documentación Completa"

### Caso 3: Secretario registra pago de socio nuevo

1. Secretario hace clic en "Registro de Pagos"
2. Busca socio "María López"
3. Selecciona socio → Sistema detecta: Socio nuevo
4. Auto-selecciona conceptos:
   - ✅ Inscripción: $2,000
   - ✅ Cuota Anual: $6,000
   - ✅ FEMETI Nuevo: $700
   - Total: $8,700
5. Método: Transferencia
6. Fecha: 5 Ene 2026
7. Recibo: REC-2026-01-0042
8. Registra pago → Membresía 2026 activada automáticamente

---

## 🔐 Seguridad y Permisos

| Acción | Socio | Secretario |
|--------|-------|------------|
| Ver sus propias solicitudes PETA | ✅ | ✅ |
| Ver solicitudes de otros socios | ❌ | ✅ |
| Solicitar PETA | ✅ | ✅ |
| Verificar documentos | ❌ | ✅ |
| Cambiar estado de solicitud | ❌ | ✅ |
| Registrar pagos | ❌ | ✅ |
| Activar membresías | ❌ | ✅ |

---

**Versión 1.10.0** - 5 de Enero 2026  
Club de Caza, Tiro y Pesca de Yucatán, A.C.

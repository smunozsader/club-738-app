# 📄 PROPUESTA: Módulo Unificado "Generador de Documentos SEDENA"

## 🎯 Alcance

**UN SOLO MÓDULO** que genera:
1. **Reportes Bimestrales** (RELACIÓN + ANEXO A + ANEXO B + ANEXO C)
2. **Oficios Adjuntos** (múltiples tipos, auto-folio)

---

## 📊 REPORTES BIMESTRALES

### Ciclo de Actualización (TODOS dinámicos)

| Componente | Bimestres | Actualización |
|-----------|-----------|--------------|
| RELACIÓN | Feb, Abr, Jun, Ago, Oct, Dic | Automático desde Firebase |
| ANEXO A | Feb, Abr, Jun, Ago, Oct, Dic | Automático desde Firebase |
| ANEXO B | Feb, Abr, Jun, Ago, Oct, Dic | Fórmulas leen ANEXO A |
| ANEXO C | Feb, Abr, Jun, Ago, Oct, Dic | Fórmulas leen ANEXO A |

**Clave**: TODOS los bimestres incluyen ANEXO C (no solo Febrero)

---

## 📮 TIPOS DE OFICIOS

Basado en ejemplos reales: `/Applications/club-738-web/oficios_ejemplos/` + `/Applications/club-738-web/report_bimestrales/`

### **Tipo 1: SOLICITUD PETA** 
Archivo: `OF. 05_26 SOLICITUD PETA. competencia nacional. IVAN TSUIS CABO TORRES.md`
- **ASUNTO**: Se remite solicitud de PETA de un socio
- **Contextos**: COMPETENCIA NACIONAL | COMPETENCIA | TIRO | PRÁCTICA TIRO
- **Cuerpo template**:
```
En atención al oficio de referencia, me permito remitir a usted UNA solicitud de permiso 
extraordinario de transportación de armas (para [CONTEXTO]) del socio Sr. [NOMBRE] 
para lo cual adjunto a la presente los siguiente documentos:

1. Carta modo honesto de vivir
2. Certificado médico de no impedimento físico
3. Certificado médico-psicológico
4. Certificado toxicológico
5. Constancia de antecedentes penales federales
6. Comprobante de domicilio
7. Copia de la credencial del club vigente
8. Copia de registro de CINCO armas

Así mismo se adjuntan:
1. Solicitud conforme al formato autorizado
2. Recibo bancario de pago e5cinco
3. Una fotografía del interesado
4. Permiso anterior

Anexo: 17 DOCUMENTOS
```
- **Campos a llenar**: Contexto, Socio, Folio (auto)
- **Anexos**: 17 DOCUMENTOS (PETA + docs del socio)

---

### **Tipo 2: RELACIÓN ACTUALIZADA SOCIOS Y ARMAS**
Archivo: `2024. OCTUBRE. OFICIO 095_24... relacion actualizada de socios y armas con que cuentan.md`
- **ASUNTO**: Se remite relación actualizada de socios y armas con que cuentan
- **Frecuencia**: BIMESTRAL (Feb, Abr, Jun, Ago, Oct, Dic)
- **Cuerpo template**:
```
Con relación a los oficios citados en antecedentes, me permito enviar a Usted 
la información actualizada de los socios y armas con que cuentan del Club de 
Caza, Tiro y Pesca de Yucatán, de forma impresa, así como en archivo Excel y 
PDF respaldados en disco compacto por duplicado.

| No Registro | Razón Social | No Socios | Armas Cortas | Armas Largas | Total Armas |
| 738 | Club de Caza, Tiro y Pesca de Yucatán, AC | [COUNT] | [CORTAS] | [LARGAS] | [TOTAL] |

Se adjunta 8 fojas y un STICK MEMORIA USB
```
- **Anexos**: RELACIÓN (Excel + PDF en USB)

---

### **Tipo 3: REMITE ANEXOS A, B, C (DN27)**
Archivo: `2024. OCTUBRE. OFICIO 96_24... REMITE RELACION EN NUEVO FORMATO ANEXOS A, B Y C.md`
- **ASUNTO**: Se remite información requerida por DN27
- **Frecuencia**: BIMESTRAL (Feb, Abr, Jun, Ago, Oct, Dic)
- **Cuerpo template**:
```
En atención a su oficio citado en antecedentes, adjunto al presente me permito 
enviar la siguiente información requerida por la Dirección General del Registro 
Federal de Armas de Fuego y Control de Explosivos:

1. Anexo "A": Relación de Socios con No. Registro, Nombre, CURP, No. Socio, 
   Armas Cortas, Armas Largas, Fecha de Alta

2. Anexo "B": No. Registro, Nombre del Club, Cantidad de Socios, Armas Cortas, 
   Armas Largas, Total Armas

3. Anexo "C": No. Registro, Razón Social, Domicilio, Teléfono, Correo, 
   Autorización del Club, Federación, Zona Militar, Refrendo, Mesa Directiva, 
   Entidad, Total Socios, Armas Largas, Armas Cortas, Total Armas, Ubicación 
   Campo Tiro, Coordenadas, Fecha Autorización, Situación

Se anexan 5 fojas y un MEMORY STICK USB
```
- **Anexos**: ANEXO A + ANEXO B + ANEXO C (Excel + PDF en USB)

---

### **Tipo 4: FORMATO LIBRE**
- **ASUNTO**: Campo libre (input admin)
- **Cuerpo**: Redacción libre (editor WYSIWYG o textarea)
- **Propósito**: Asuntos generales, comunicaciones especiales
- **Anexos**: Seleccionables (admin elige qué documentos adjuntar)
- **Ejemplo**: "Solicitud de revisión de expediente", "Comunicación especial", etc.

---

## 🛠️ ARQUITECTURA DE COMPONENTES

```
GeneradorDocumentos/
│
├── ReportesBimestrales.jsx (Panel Principal)
│   ├── Selector: Año + Bimestre
│   ├── Botones generación:
│   │   ├── Generar RELACIÓN
│   │   ├── Generar ANEXO A
│   │   ├── Generar ANEXO B
│   │   ├── Generar ANEXO C
│   │   └── Generar TODO + Oficios Adjuntos
│   └── Vista previa + descarga
│
├── GeneradorOficios.jsx (Submódulo)
│   ├── Selector de tipo (1-5 arriba)
│   ├── Campos contextuales:
│   │   ├── [Tipo 1-2] Contexto: COMPETENCIA | TIRO | etc
│   │   ├── [Tipo 3] Fecha de información
│   │   ├── [Tipo 4] Nada (automático del expediente)
│   │   └── [Tipo 5] ASUNTO libre + CUERPO libre
│   ├── Selector de socio(s)
│   ├── Auto-folio: 001/26, 002/26, etc
│   └── Generar PDF + Preview
│
├── RegistroDocumentos.jsx (Histórico)
│   ├── Lista de reportes + oficios generados
│   ├── Estados: DRAFT → GENERADO → ENVIADO
│   ├── Descargas
│   └── Auditoría (quién, cuándo, qué)
│
└── Componentes Reutilizables:
    ├── GeneradorRelacionSocios.jsx
    ├── GeneradorAnexoA.jsx
    ├── GeneradorAnexoB.jsx
    └── GeneradorAnexoC.jsx
```

---

## 💾 FIRESTORE SCHEMA

### Reportes Bimestrales
```javascript
reportes_bimestrales/{anno_bimestre} {
  ano: 2026,
  bimestre: 1,  // 1=Feb, 2=Abr, 3=Jun, 4=Ago, 5=Oct, 6=Dic
  fechaReporte: Timestamp,
  estado: "draft" | "generado" | "enviado",
  generadoPor: "admin@club738.com",
  
  documentos: {
    relacion: { url: "gs://...", fechaGen: Timestamp, filas: 292 },
    anexoA: { url: "gs://...", fechaGen: Timestamp, socios: 76 },
    anexoB: { url: "gs://...", fechaGen: Timestamp },
    anexoC: { url: "gs://...", fechaGen: Timestamp }
  },
  
  // Oficios generados automáticamente
  oficios: [
    { 
      tipo: 1,
      folio: "001/2026",
      asunto: "REMITE ANEXOS A, B Y C",
      url: "gs://...",
      fechaGen: Timestamp
    }
  ],
  
  cambios: [
    { fecha: Timestamp, accion: "creado", por: "admin@club738.com" }
  ]
}
```

### Oficios (Histórico General)
```javascript
oficios/{ano_mes_folio} {  // ej: 2026_01_001
  ano: 2026,
  mes: 1,
  folio: "001/2026",
  
  tipo: 1 | 2 | 3 | 4 | 5,
  asunto: "Se remite solicitud de PETA...",
  
  // Campos contextuales
  contextoPeta: "COMPETENCIA" | "TIRO" | null,  // para tipo 1-2
  fechaInformacion: Timestamp,  // para tipo 3
  socio: "email@club.com",
  
  // Cuerpo libre (para tipo 5)
  cuerpoLibre: "...",
  
  // Adjuntos
  anexos: ["RELACIÓN", "ANEXO A", ...],
  urlPdf: "gs://...",
  
  // Auditoría
  generadoPor: "admin@club738.com",
  fechaGen: Timestamp,
  fechaEnvio: Timestamp | null,
  estado: "generado" | "enviado"
}
```

---

## 🔢 Numeración de Folios (FOLIO COUNTER)

En Firestore se mantiene contador:
```javascript
contadores/folio_2026 {
  ano: 2026,
  ultimoFolio: 14,  // El próximo será 15
  
  historial: [
    { folio: 1, tipo: 1, fecha: Timestamp, socio: "ivan@..." },
    { folio: 2, tipo: 2, fecha: Timestamp, socio: "joaquin@..." },
    ...
    { folio: 14, tipo: 4, fecha: Timestamp, socio: "luis@..." }
  ]
}
```

**Funcionamiento**:
1. Admin genera oficio
2. Firebase increment(ultimoFolio)
3. Oficio recibe: `015/2026` (año + folio)
4. Historial se actualiza automático

---

## 📋 FLUJOS DE GENERACIÓN

### Flujo 2: Generar Reporte Bimestral Completo
```
Admin selecciona: Feb 2026
        ↓
Click: "Generar TODO + Oficios"
        ↓
Sistema verifica datos actualizados en Firebase
        ↓
Genera en cascada:
  1. RELACIÓN (detallada por arma, 292 filas)
  2. ANEXO A (resumen por socio, 76 filas)
  3. ANEXO B (cédula totales, fórmulas leen ANEXO A)
  4. ANEXO C (info club + fórmulas leen ANEXO A)
        ↓
Genera Oficios Adjuntos automático:
  - TIPO 2: Remite RELACIÓN Actualizada Socios y Armas
  - TIPO 3: Remite ANEXOS A, B, C (DN27)
        ↓
Guarda registro completo en Firestore
        ↓
Descarga ZIP con todos los documentos + USB
```

### Flujo 3: Generar Oficio Individual (Socio Solicita PETA)
```
Admin selecciona: GeneradorOficios
        ↓
Selecciona: Tipo = "1: SOLICITUD PETA"
        ↓
Input: Contexto = "TIRO"
        ↓
Busca socio + sus armas de Firebase
        ↓
Preview oficio con datos pre-llenados
        ↓
Click: "Generar PDF"
        ↓
Firebase: increment(ultimoFolio) → 015/2026
        ↓
Genera oficio con folio 015/2026
        ↓
Guarda en oficios/2026_01_015 + histórico
        ↓
PDF descargable + registro en RegistroDocumentos
```

### Flujo 4: Oficio Formato Libre
```
Admin selecciona: Tipo = "4: FORMATO LIBRE"
        ↓
Input campos:
  - ASUNTO: "Solicitud de revisión de expediente"
  - CUERPO: [Editor WYSIWYG - redacción libre]
  - Adjuntos: [checkboxes] Relación ☑ | Anexo A ☐ | etc
        ↓
Preview con folio auto-asignado
        ↓
Click: "Generar"
        ↓
PDF con folio + ASUNTO + CUERPO + adjuntos
        ↓
Guarda registro completo
```

---

## 🎨 UI/UX EN ADMIN DASHBOARD

```
AdminDashboard
└── 📄 Generador de Documentos SEDENA
    │
    ├── TAB 1: Reportes Bimestrales
    │   ├── Selector: Mes 2026 [Feb ▼]
    │   ├── Estado actual: ○ SIN GENERAR | ● GENERADO | ✓ ENVIADO
    │   ├── Botones:
    │   │   ├── [Generar RELACIÓN] 
    │   │   ├── [Generar ANEXO A]
    │   │   ├── [Generar ANEXO B]
    │   │   ├── [Generar ANEXO C]
    │   │   └── [⚡ GENERAR TODO + OFICIOS]
    │   └── Descargas: RELACIÓN.xlsx | ANEXO A.xlsx | ... | TODO.zip
    │
    ├── TAB 2: Generador de Oficios
    │   ├── Tipo de Oficio: [Tipo 1: Solicitud PETA ▼]
    │   ├── [Mostrar campos contextuales según tipo]
    │   ├── Socio: [Buscar...] IVAN TSUIS CABO
    │   ├── Contexto (Tipo 1): [COMPETENCIA ▼]
    │   ├── [Preview]
    │   └── [Generar PDF] → Folio: 015/2026
    │
    ├── TAB 3: Histórico
    │   └── Tabla:
    │       | Folio | Tipo | Socio | Asunto | Fecha | Estado | Descargar |
    │       | 001/26 | Tipo 1 | IVAN | PETA ... | 12 Ene | Generado | [PDF] |
    │       | 002/26 | Tipo 3 | - | Rel. Armas | 12 Ene | Generado | [PDF] |
    │
    └── TAB 4: Auditoría
        └── Quién generó qué, cuándo, cambios de estado
```

---

## 📋 Tabla Resumen de Tipos

| Tipo | Descripción | Asunto | Adjuntos | Frecuencia |
|------|-------------|--------|----------|-----------|
| **1** | SOLICITUD PETA | Se remite solicitud de PETA de un socio | 17 docs PETA | A demanda |
| **2** | RELACIÓN ACTUALIZADA | Se remite relación actualizada de socios y armas | RELACIÓN + USB | BIMESTRAL |
| **3** | ANEXOS A, B, C (DN27) | Se remite información requerida por DN27 | ANEXOS A+B+C + USB | BIMESTRAL |
| **4** | FORMATO LIBRE | [Custom] | [Custom] | A demanda |

---

## ✅ Ventajas de Arquitectura Única

✅ **Un solo modulo**: Menos complejidad en AdminDashboard  
✅ **Datos compartidos**: RELACIÓN → ANEXOS (cascada)  
✅ **Folio unificado**: Continuidad de numeración (001/26, 002/26, etc)  
✅ **Oficios contextuales**: Tipo 2 + Tipo 3 generan automático con reportes bimestrales  
✅ **Auditoría consolidada**: Todo en `reportes_bimestrales/{}`  
✅ **Firestore optimizado**: Menos colecciones, schema limpio  
✅ **Extensible**: Fácil agregar nuevos tipos de oficios  
✅ **Formato Libre**: Flexible para asuntos especiales  
✅ **USB/CD**: Documentos en disco compacto para entrega física SEDENA  

---

## 🚀 Implementación Secuencial

1. **Phase 1**: Componentes generadores (RELACIÓN, ANEXO A, B, C)
2. **Phase 2**: GeneradorOficios (Tipos 1-5)
3. **Phase 3**: Firestore schema + folio counter
4. **Phase 4**: RegistroDocumentos + histórico
5. **Phase 5**: Integración en AdminDashboard
6. **Phase 6**: Testing con datos históricos

---

**¿Estructura confirmada?** ¿Empezamos con Phase 1?

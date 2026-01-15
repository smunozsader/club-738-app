# 🗂️ Manual del Secretario: Gestión de Bajas de Arsenal

**Usuario:** Sergio Muñoz (Secretario)  
**Módulo:** AdminBajasArsenal  
**Fecha:** 10 de Enero de 2026

---

## 🎯 Objetivo del Módulo

Gestionar las solicitudes de baja de armas de los socios, validar la información y generar los avisos correspondientes a:
- **32 Zona Militar** (Valladolid, Yucatán)
- **DN27** (Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos)

---

## 📋 Workflow General

```
1. SOCIO REPORTA
   El socio llena formulario en "Gestión de Arsenal"
   Estado: 🟡 PENDIENTE
   
2. SECRETARIO REVISA
   Verificas datos en panel admin
   Acción: ✅ Aprobar o ❌ Rechazar
   
3. SECRETARIO APRUEBA
   Estado: 🔵 APROBADA
   Se habilitan generadores de oficios
   
4. SECRETARIO GENERA OFICIOS
   - Oficio 32 Zona Militar
   - Oficio DN27
   (Pendiente implementación - placeholder)
   
5. SECRETARIO MARCA PROCESADA
   Estado: 🟢 PROCESADA
   Si receptor es socio → Notificación automática
   
6. INFORME BIMESTRAL
   Consolida todas las bajas procesadas
   Envía paquete a 32 ZM
```

---

## 🚀 Acceso al Panel Admin

### Paso 1: Ingresar al Portal

1. Ve a: **https://yucatanctp.org**
2. Inicia sesión: smunozam@gmail.com
3. En el Dashboard, sección **"Panel de Secretario"**, busca:

```
┌──────────────────────────────────────┐
│  📦 Gestión de Bajas                 │
│                                      │
│  Administrar solicitudes de          │
│  baja de armas                       │
│                                      │
│  Ver solicitudes →                   │
└──────────────────────────────────────┘
```

4. Click en "Ver solicitudes"

---

## 🎛️ Dashboard de Solicitudes

### Vista Principal

Al entrar verás 3 contadores:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PENDIENTES    │  │    APROBADAS    │  │   PROCESADAS    │
│                 │  │                 │  │                 │
│       5         │  │       2         │  │       18        │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Filtros por Estado

```
┌─────────────────────────────────────────────────────────┐
│  ⏳ Pendientes (5)  │  ✅ Aprobadas (2)  │  📋 Procesadas (18)  │
└─────────────────────────────────────────────────────────┘
```

Click en cada filtro para ver solo ese estado.

---

## 📝 Revisar Solicitudes PENDIENTES

### Vista de Tarjetas

Cada solicitud muestra:

```
┌───────────────────────────────────────────────────────────┐
│  Grand Power LP 380                                       │
│  👤 Joaquin Gardoni                                       │
│                                                           │
│  Matrícula: K084384 • Folio: [folio] • 💰 Venta          │
│  📤 → Daniel Manrique [Socio]                            │
│                                                           │
│  [ 👁️ Ver detalles ]  [ ✅ Aprobar ]                     │
│                                                           │
│  Solicitado: 10 de enero de 2026                         │
└───────────────────────────────────────────────────────────┘
```

### Ver Detalles Completos

Click en **"👁️ Ver detalles"** abre modal con información completa:

**Socio Solicitante:**
- Nombre: Joaquin Gardoni
- Email: joaquingardoni@gmail.com

**Datos del Arma:**
- Clase: Pistola
- Calibre: .380
- Marca: Grand Power
- Modelo: LP 380
- Matrícula: K084384
- Folio SEDENA: [si está registrado]

**Datos de la Baja:**
- Motivo: 💰 Venta
- Fecha de baja: 15/12/2025

**Comprador/Receptor:**
- Nombre: Daniel Manrique [apellidos]
- CURP: [si proporcionó]
- ¿Es socio del club? ✅ Sí
- Email: [email si es socio]

**Registro de Transferencia SEDENA:**
- Folio: [si ya tramitaron]
- Zona Militar: 32
- Fecha: [fecha del trámite]

**Observaciones:**
> Venta realizada en diciembre 2025. El comprador es socio 
> activo del club (Daniel Manrique). Se acordó tramitar la 
> transferencia oficial en febrero 2026.

---

## ✅ Aprobar Solicitudes

### Proceso de Aprobación

1. **Revisa la información:**
   - ¿Los datos del socio son correctos?
   - ¿El arma existe en Firestore?
   - ¿Los datos del receptor son completos?
   - ¿Las fechas son coherentes?

2. **Click en "✅ Aprobar"**

3. Confirma en el diálogo:
   ```
   ¿Aprobar la baja de Grand Power LP 380 K084384?
   
   [ Cancelar ]  [ Aprobar ]
   ```

4. Confirmación:
   ```
   ✅ Solicitud aprobada. 
   
   Ahora puedes generar los oficios para 32 ZM y DN27.
   ```

5. La solicitud cambia a estado: **🔵 APROBADA**

### ¿Cuándo NO aprobar?

- ❌ Información incompleta o incorrecta
- ❌ El arma no está en el arsenal del socio
- ❌ Fecha de baja no coherente
- ❌ Datos del receptor sospechosos

**Acción:** Contacta al socio por WhatsApp para aclarar antes de aprobar.

---

## 📄 Generar Oficios (APROBADAS)

### Estado Actual: 🚧 Placeholder

**Botones disponibles en solicitudes APROBADAS:**

```
[ 📄 Oficio 32 ZM ]  [ 📄 Oficio DN27 ]  [ ✔️ Marcar Procesada ]
```

**Click en "📄 Oficio 32 ZM":**
```
🚧 En desarrollo: Generador de oficio para 32 ZM

Arma: Grand Power LP 380
Matrícula: K084384
Folio: [folio]
```

**Click en "📄 Oficio DN27":**
```
🚧 En desarrollo: Generador de oficio para DN27

Arma: Grand Power LP 380
Matrícula: K084384
Folio: [folio]
```

### Implementación Futura (Siguiente versión)

Los generadores usarán **jsPDF** (como `GeneradorPETA.jsx`) para crear:

**Oficio 32 ZM:**
- Membrete del club
- Dirigido a: Comandante 32 Zona Militar, Valladolid
- Asunto: Aviso de cambio de propietario
- Datos del vendedor (socio)
- Datos del comprador
- Datos del arma
- Motivo de la baja
- Firma digital del secretario

**Oficio DN27:**
- Similar al anterior
- Dirigido a: Director General DN27, Ciudad de México
- Formato oficial SEDENA
- Anexos: Copias de documentación

---

## ✔️ Marcar como Procesada

### ¿Cuándo marcar como procesada?

**Después de:**
1. ✅ Generar oficios 32 ZM y DN27
2. ✅ Enviar oficios (email, mensajería o entrega personal)
3. ✅ Recibir acuse de recibo (opcional)

**O bien:**
- Al momento del **informe bimestral** consolidado

### Proceso

1. Click en **"✔️ Marcar Procesada"**

2. Confirma:
   ```
   ¿Marcar como procesada? 
   (Ya se tramitó ante autoridades)
   
   [ Cancelar ]  [ Confirmar ]
   ```

3. La solicitud cambia a estado: **🟢 PROCESADA**

4. **Si el receptor es socio del club:**
   - Sistema envía notificación automática al email del receptor
   - Mensaje:
   ```
   El socio Joaquin Gardoni transfirió un arma a tu nombre. 
   Por favor contacta al secretario para actualizar tu arsenal.
   ```

---

## 📊 Informe Bimestral a 32 ZM

### Consolidación de Bajas

**Periodicidad:** Cada 2 meses (o antes si hay trámites PETA urgentes)

**Proceso:**

1. Filtra por estado: **🟢 PROCESADAS**

2. Exporta lista (función futura):
   ```
   [ 📥 Exportar CSV ]
   ```

3. Genera informe consolidado:

```
CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.
Registro SEDENA: 738

INFORME DE MOVIMIENTOS DE ARSENAL
Periodo: Noviembre 2025 - Enero 2026

A: Comandante de la 32 Zona Militar
   Valladolid, Yucatán

De: Secretaría del Club 738

---

BAJAS POR VENTA (10 casos):
1. JOAQUIN GARDONI → DANIEL MANRIQUE
   Grand Power LP 380, Mat. K084384
   Fecha: 15/12/2025
   
2. JOAQUIN GARDONI → JOSE ALBERTO MANRIQUE
   Grand Power LP 380, Mat. K084385
   Fecha: 15/12/2025
   
[... continúa lista]

TRANSFERENCIAS FAMILIARES (8 casos):
1. JOAQUIN GARDONI → MARIA F. ARECHIGA RAMOS (esposa)
   Pistola CZ P07, Mat. C647155
   Fecha: 01/01/2026
   
[... continúa lista]

EXTRAVÍOS (1 caso):
[... detalles]

ROBOS (0 casos):

TOTAL: 19 movimientos reportados

---
Atentamente,
Sergio Muñoz de Alba Medrano
Secretario
Club de Caza, Tiro y Pesca de Yucatán, A.C.
```

4. Adjuntar copias de:
   - Solicitudes firmadas por socios
   - Comprobantes de venta (si aplica)
   - Denuncias (en caso de robo/extravío)

5. Enviar a:
   ```
   32 Zona Militar
   Valladolid, Yucatán
   
   Vía: Mensajería o entrega personal
   ```

6. CC a:
   ```
   DN27
   Dirección General del Registro Federal de Armas de Fuego
   Ciudad de México
   
   Vía: Correo certificado o plataforma digital SEDENA
   ```

---

## 🔔 Notificaciones Automáticas

### Socio Receptor es Miembro del Club

**Cuando marcas una solicitud como PROCESADA:**

Si `receptor.esSocioClub === true` y `receptor.email` existe:

```javascript
Sistema crea automáticamente:
socios/{emailReceptor}/notificaciones/{id}
{
  tipo: 'transferencia_arma',
  mensaje: 'El socio {nombreVendedor} transfirió un arma a tu nombre...',
  armaDetalles: { marca, modelo, matricula },
  vendedorEmail: 'joaquingardoni@gmail.com',
  fechaCreacion: timestamp,
  leida: false
}
```

**El receptor verá:**
- Badge en su dashboard (futuro)
- Email de notificación (futuro)

**Acción del receptor:**
- Contactar al secretario
- Proporcionar documentación
- Registrar el arma en su arsenal

---

## 📋 Caso de Prueba: Joaquin Gardoni

### Arsenal Actual

**Esperamos 5 solicitudes de Gardoni:**

| # | Tipo | Arma | Matrícula | Receptor |
|---|------|------|-----------|----------|
| 1 | 💰 Venta | Grand Power LP 380 | K084384 | Daniel Manrique ✅ |
| 2 | 💰 Venta | Grand Power LP 380 | K084385 | Jose Alberto Manrique ✅ |
| 3 | 👥 Transferencia | Pistola CZ P07 | C647155 | María F. Arechiga |
| 4 | 👥 Transferencia | Grand Power LP380 | K078999 | María F. Arechiga |
| 5 | 👥 Transferencia | Grand Power LP380 | K084328 | María F. Arechiga |

**Validaciones a realizar:**

1. ✅ Verificar que las 7 armas originales de Gardoni existen en Firestore
2. ✅ Confirmar identidad de compradores (Daniel y Jose Alberto Manrique)
3. ✅ Verificar si María Fernanda tiene membresía propia o es familiar
4. ✅ Revisar si Daniel y Jose Alberto ya tienen arsenal en el sistema
5. ✅ Confirmar fechas coherentes

**Acción especial:**
- Shadow 2 DP25087 NO aparece en portal → Agregarlo manualmente antes de procesar

---

## 🔍 Verificación de Datos

### Checklist de Validación

**Antes de aprobar, verifica:**

- [ ] **Socio vendedor existe en Firestore**
  - `socios/{email}`
  
- [ ] **Arma existe en arsenal del vendedor**
  - `socios/{email}/armas/{armaId}`
  - Matrícula coincide
  
- [ ] **Datos del receptor completos**
  - Nombre completo
  - CURP (opcional)
  - Si es socio: email válido
  
- [ ] **Fechas coherentes**
  - Fecha de baja no es futura
  - Fecha razonable (últimos 6-12 meses)
  
- [ ] **Motivo apropiado**
  - Venta → debe tener receptor
  - Transferencia → debe tener receptor
  - Extravío → no debe tener receptor
  - Robo → no debe tener receptor
  
- [ ] **Documentación SEDENA (si aplica)**
  - Folio válido
  - Zona Militar correcta (32)

---

## ⚠️ Casos Especiales

### 1. Receptor NO es socio del club

**Acción:**
- ✅ Aprobar solicitud normalmente
- ✅ Generar oficios 32 ZM + DN27
- ❌ NO notificar (no tiene cuenta en portal)

### 2. Transferencia Familiar (esposa, hijo)

**Consideraciones:**
- ¿La esposa tiene membresía propia?
- ¿Comparten domicilio?
- ¿Se requiere trámite SEDENA adicional?

**Acción:**
- Aprobar solicitud
- En observaciones del oficio: especificar "TRANSFERENCIA FAMILIAR"

### 3. Arma Vendida a Socio del Club

**Workflow especial:**
1. ✅ Aprobar baja del vendedor
2. ✅ Marcar como procesada
3. 🔔 Notificación automática al comprador
4. 👤 Comprador contacta secretario
5. ➕ Secretario da de alta arma en arsenal del comprador

### 4. Extravío o Robo

**Documentación adicional requerida:**
- Denuncia ante Ministerio Público
- Acta circunstanciada

**Proceso:**
- Solicitar documentación al socio
- Anexar a oficio 32 ZM
- Enviar copia a DN27
- Marcar como procesada

---

## 📊 Estadísticas y Reportes

### Dashboard (Futuro)

**Métricas a implementar:**
- Bajas por mes/año
- Motivos más comunes
- Tiempo promedio de procesamiento
- Socios con más movimientos

**Exportación:**
- CSV de bajas procesadas
- Reporte anual para SEDENA
- Estadísticas para junta directiva

---

## 🔒 Seguridad y Privacidad

### Acceso Restringido

**Solo el secretario (`smunozam@gmail.com`) puede:**
- Ver todas las solicitudes de todos los socios
- Aprobar/rechazar solicitudes
- Generar oficios
- Marcar como procesadas

**Los socios solo ven:**
- Sus propias solicitudes
- Estado de sus solicitudes
- Sus propias armas

### Firestore Security Rules

```javascript
match /socios/{email}/solicitudesBaja/{solicitudId} {
  allow read: if isOwner(email) || isSecretario();
  allow create: if isOwner(email);
  allow update: if isSecretario(); // Solo secretario aprueba/procesa
}
```

---

## 📞 Soporte a Socios

### Preguntas Frecuentes

**"¿Por qué mi solicitud sigue pendiente?"**
- Estoy revisando la información
- Puede tardar 24-48 horas
- Te contactaré si falta algo

**"¿Puedo cancelar una solicitud?"**
- Sí, contáctame antes de que la apruebe
- Una vez aprobada, es más complicado

**"¿Cuándo debo tramitar ante SEDENA?"**
- El club genera el aviso oficial
- Tú y el comprador deben tramitar la transferencia formal
- Plazo legal: 30 días naturales

---

## 📝 Próximos Pasos de Desarrollo

### v1.15.0 - Generadores de Oficios

**Implementar:**
1. Template PDF para Oficio 32 ZM
2. Template PDF para Oficio DN27
3. Generación dinámica con jsPDF
4. Membrete oficial del club
5. Firma digital del secretario

### v1.16.0 - Mejoras UX

**Implementar:**
1. Notificaciones email automáticas
2. Dashboard de estadísticas
3. Exportación CSV
4. Subida de documentación soporte
5. Timeline de procesamiento

---

## 📚 Referencias

**Ley Federal de Armas de Fuego y Explosivos:**
- Artículo 7: Obligación de aviso (30 días)
- Artículo 24: Cambios en relación con armas

**Autoridades:**
- 32 Zona Militar: Valladolid, Yucatán
- DN27: Dirección General del Registro Federal de Armas de Fuego y Control de Explosivos

**Contacto:**
- 32 ZM: [teléfono/dirección]
- DN27: [teléfono/dirección]

---

## ✅ Resumen Ejecutivo

**Como secretario, tu workflow es:**

```
1. Revisa solicitudes PENDIENTES
2. Verifica datos y coherencia
3. Aprueba (o contacta socio si hay dudas)
4. [Futuro] Genera oficios 32 ZM + DN27
5. Marca como PROCESADA
6. Si receptor es socio → Notificación automática
7. Cada 2 meses → Informe consolidado a 32 ZM
```

**Tiempo estimado por solicitud:** 5-10 minutos

**Caso Gardoni:** 5 solicitudes × 8 min = ~40 minutos

---

*Generado por: Sistema de Gestión Club 738*  
*Módulo: AdminBajasArsenal v1.14.0*

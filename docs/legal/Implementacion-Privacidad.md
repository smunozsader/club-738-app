# IMPLEMENTACIÓN COMPLETA: PROTECCIÓN DE DATOS PERSONALES
## Club de Caza, Tiro y Pesca de Yucatán, A.C. - Instrucciones para Copilot/Agente IA

---

## 📌 CONTEXTO: ¿QUÉ DEBO HACER?

Tengo un portal web React + Firebase para gestionar 75 socios del Club 738 (Registro SEDENA).

**Necesito implementar:**
1. ✅ Sistema de protección de datos personales (LFPDPPP 2025 - ley mexicana)
2. ✅ Avisos de Privacidad (3 versiones)
3. ✅ Sistema de upload de documentos sensibles (híbrido: digital + original)
4. ✅ Dashboard del Secretario para ver estado de documentos
5. ✅ Recordatorios automáticos por email
6. ✅ Auditoría completa en Firestore

---

## 🎯 RESUMEN DE REQUISITOS LEGALES

### Documentos Sensibles (Requieren Consentimiento Expreso + AMBAS formas):
```
FORMA 1: DIGITAL (copia en web)
- Socio sube JPG/PDF en plataforma
- Guardado en Firebase Storage
- Auditoría: fecha, hora, IP, navegador

FORMA 2: ORIGINAL FÍSICO (entrega presencial)
- Socio entrega en mano en Club
- Secretario verifica y archiva
- Marca en sistema como "verificado"

Documentos:
1. Certificado Médico (no impedimento físico)
2. Certificado Psicológico (aptitud mental)
3. Certificado Toxicológico (prueba de drogas)
4. Constancia Antecedentes Penales Federales (ya tienes ~70)
5. Cartilla Militar (liberada) o Acta Nacimiento
6. Comprobante de Domicilio (reciente, <3 meses)
```

### Documentos de Identificación (Upload digital + Original previa):
```
1. INE (Identificación oficial)
2. CURP (ya tienes en base de datos)
3. Acta de Nacimiento
4. Registros de Armas SEDENA (RFA-RA-001)
```

### Documentos Declarativos (Solo digital):
```
1. Fotografía para PETA (fondo blanco, 5x5cm) - JPG
2. Fotografía para Credencial Club - JPG
3. Carta "Modo Honesto de Vivir" - JPG/PDF
```

---

## 📁 ARCHIVOS A CREAR / ACTUALIZAR

### ARCHIVOS NUEVOS A CREAR:

**1. `src/components/DocumentoUpload.jsx`**
- Componente para upload drag-drop de documentos
- Validación: tamaño máx 5MB, tipos JPG/PDF
- Mostrar progreso de carga
- Guardar en Firebase Storage

**2. `src/components/DocumentoUpload.css`**
- Estilos: drag-drop visual, upload progress bar
- Responsive (móvil + desktop)

**3. `src/components/DashboardSecretario.jsx`**
- Vista del Secretario con tabla de socios
- Columnas: Socio, % Completitud, Documentos Faltantes, Acciones
- Filtros: falta certificado médico, falta psicológico, etc.
- Botón: "Enviar recordatorio por email"

**4. `src/components/DashboardSecretario.css`**
- Estilos para tabla y filtros

**5. `src/components/MiDocumentos.jsx`**
- Vista del Socio: lista de documentos con estado
- Estado: "Pendiente" (rojo), "Cargado" (azul), "Verificado" (verde)
- Botón: Upload documento
- Mostrar: fecha de upload, archivo

**6. `src/components/MiDocumentos.css`**
- Estilos responsive

**7. `src/utils/firebaseStorage.js`**
- Funciones auxiliares:
  - `uploadDocumento(socioID, tipoDocumento, archivo)`
  - `obtenerEstadoDocumentos(socioID)`
  - `listarSociosPendientes(tipoDocumento)` 
  - `marcarComoVerificado(socioID, tipoDocumento, notas)`

**8. `src/utils/emailService.js`**
- Funciones para enviar emails (Firebase Cloud Functions):
  - `enviarRecordatorioDocumentos(socioID)`
  - `enviarConfirmacionUpload(socioID, tipoDocumento)`
  - `enviarConfirmacionOriginal(socioID)`

**9. `firebaseConfig.js` (ACTUALIZAR)**
- Asegurar que Storage está inicializado
- Agregar configuración de Cloud Functions

**10. `public/legal/aviso-privacidad-integral.html`**
- Convertir markdown a HTML
- Publicar en Firebase Hosting

**11. `public/legal/aviso-privacidad-simplificado.html`**
- Versión corta del aviso

**12. `src/pages/PrivacyPolicy.jsx`**
- Página web `/aviso-privacidad`
- Mostrar aviso completo en iframe
- Botón: descargar PDF

---

## 📊 ESTRUCTURA FIRESTORE ACTUALIZADA

**Cambios en la colección `socios/{socioID}`:**

```javascript
socios/{socioID} = {
  // DATOS EXISTENTES
  datosPersonales: { ... },
  consentimientos: { ... },
  armas: [ ... ],
  pago: { ... },
  
  // NUEVOS: DOCUMENTOS SENSIBLES
  documentosPETA: {
    certificadoMedico: {
      obligatorio: true,
      tipo: "datos_sensibles",
      
      // UPLOAD DIGITAL
      uploadDigital: {
        archivo: "gs://bucket/.../medico.jpg",
        fechaUpload: timestamp("2026-01-05 14:30"),
        ipAddress: "192.168.1.100",
        navegador: "Chrome 120.0",
        tamaño_mb: 2.5,
        estado: "cargado" // "pendiente"|"cargado"|"verificado"
      },
      
      // ORIGINAL FÍSICO
      originalFisico: {
        entregado: true,
        fechaEntrega: timestamp("2026-01-10 16:00"),
        verificadoPor: "Roberto Pérez",
        notas: "Vigencia: 2027-06-15",
        estado: "verificado" // "pendiente"|"entregado"|"verificado"
      },
      
      // AUDITORÍA
      historial: [
        { fecha: timestamp, acción: "subido", usuario: "socio", ip: "192.168.1.100" },
        { fecha: timestamp, acción: "verificado", usuario: "secretario", notas: "OK" }
      ]
    },
    
    certificadoPsicologico: { /* MISMO PATRÓN */ },
    certificadoToxicologico: { /* MISMO PATRÓN */ },
    antecedentespenales: { /* MISMO PATRÓN */ },
    cartillaMilitar: { /* MISMO PATRÓN */ },
    comprobanteDomicilio: { /* MISMO PATRÓN */ },
    
    // DOCUMENTOS DE IDENTIFICACIÓN (solo copia digital)
    ine: {
      obligatorio: true,
      tipo: "identificacion",
      uploadDigital: { /* ... */ },
      originalFisico: { /* ...entrega previa... */ },
      historial: [ /* ... */ ]
    },
    actaNacimiento: { /* MISMO */ },
    registrosArmas: { /* MISMO */ },
    
    // DOCUMENTOS DECLARATIVOS (solo digital)
    fotografiaPETA: {
      obligatorio: true,
      tipo: "fotografia",
      uploadDigital: { /* ... */ },
      historial: [ /* ... */ ]
    },
    fotografiaCredencial: { /* MISMO */ },
    cartaModoHonesto: { /* MISMO */ }
  },
  
  // ESTADO AGREGADO
  expediente: {
    porcentajeCompleción: 85,
    documentosSubidos: 8,
    documentosVerificados: 6,
    documentosPendientes: ["certificadoPsicologico", "certificadoToxicologico"],
    documentosFaltanteOriginal: [],
    ultimaActualizacion: timestamp,
    listo_para_SEDENA: false // true solo si todo está verificado
  }
}
```

---

## 🔥 FIRESTORE SECURITY RULES (A ACTUALIZAR)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // SOCIOS: Solo el propietario ve sus datos
    match /socios/{socioID} {
      allow read: if request.auth.uid == socioID || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'secretario';
      
      allow write: if request.auth.uid == socioID || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'secretario';
      
      // DOCUMENTOS UPLOAD: Solo el socio puede subir sus documentos
      match /documentosPETA/{documento} {
        allow read: if request.auth.uid == socioID || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'secretario';
        
        allow write: if request.auth.uid == socioID;
        
        // SOLO SECRETARIO puede verificar originales
        allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'secretario' &&
                        request.resource.data.originalFisico.estado == 'verificado';
      }
    }
  }
}
```

---

## 📧 CLOUD FUNCTIONS (A IMPLEMENTAR)

**Crear archivo: `functions/index.js`**

```javascript
// Funciones serverless para emails y tareas automáticas

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Configurar transporte email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 1. Recordatorio automático: si documento falta >7 días
exports.recordatorioDocumentosPendientes = 
  functions.pubsub.schedule('every day 10:00').onRun(async (context) => {
    const socios = await admin.firestore().collection('socios').get();
    
    socios.forEach(async (doc) => {
      const socio = doc.data();
      const ahora = admin.firestore.Timestamp.now();
      
      Object.entries(socio.documentosPETA || {}).forEach(([tipo, doc]) => {
        if (doc.uploadDigital?.estado === 'pendiente') {
          const diasPendiente = (ahora.seconds - doc.uploadDigital.fechaCreacion.seconds) / 86400;
          
          if (diasPendiente > 7) {
            // Enviar email recordatorio
            transporter.sendMail({
              from: 'tiropracticoyucatan@gmail.com',
              to: socio.datosPersonales.email,
              subject: `⏰ Recordatorio: Falta ${tipo} en tu expediente`,
              html: `
                <p>Estimado ${socio.datosPersonales.nombre},</p>
                <p>Aún no hemos recibido tu <strong>${tipo}</strong>.</p>
                <p>Por favor cárgalo en: https://yucatanctp.org/mis-documentos</p>
                <p>¿Dudas? Escribe a: tiropracticoyucatan@gmail.com</p>
              `
            });
          }
        }
      });
    });
  });

// 2. Email de confirmación: cuando socio sube documento
exports.confirmarUploadDocumento = 
  functions.firestore
    .document('socios/{socioID}/documentosPETA/{documento}')
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const socioID = context.params.socioID;
      const tipoDoc = context.params.documento;
      
      const socio = await admin.firestore().collection('socios').doc(socioID).get();
      
      await transporter.sendMail({
        from: 'tiropracticoyucatan@gmail.com',
        to: socio.data().datosPersonales.email,
        subject: '✅ Documento recibido',
        html: `
          <p>Estimado ${socio.data().datosPersonales.nombre},</p>
          <p>Confirmamos que recibimos tu <strong>${tipoDoc}</strong>.</p>
          <p><strong>IMPORTANTE:</strong> Aún debes entregar el <strong>ORIGINAL</strong> en mano en el Club.</p>
          <p>Gracias por tu diligencia.</p>
        `
      });
    });

// 3. Email notificación: cuando secretario marca como verificado
exports.confirmarVerificacionOriginal = 
  functions.firestore
    .document('socios/{socioID}/documentosPETA/{documento}')
    .onUpdate(async (change, context) => {
      const datosNuevos = change.after.data();
      const datosPrevios = change.before.data();
      
      // Si estado cambió a "verificado"
      if (datosPrevios.originalFisico?.estado !== 'verificado' && 
          datosNuevos.originalFisico?.estado === 'verificado') {
        
        const socioID = context.params.socioID;
        const tipoDoc = context.params.documento;
        const socio = await admin.firestore().collection('socios').doc(socioID).get();
        
        await transporter.sendMail({
          from: 'tiropracticoyucatan@gmail.com',
          to: socio.data().datosPersonales.email,
          subject: '✅ Documento original verificado',
          html: `
            <p>Estimado ${socio.data().datosPersonales.nombre},</p>
            <p>Confirmamos que verificamos tu <strong>${tipoDoc}</strong> original.</p>
            <p>Estado: <strong>Verificado ✅</strong></p>
            <p>${datosNuevos.originalFisico.notas || ''}</p>
          `
        });
      }
    });
```

---

## 🎨 COMPONENTES A IMPLEMENTAR (Orden de Prioridad)

### PRIORIDAD 1 (CRÍTICO):

**1. DocumentoUpload.jsx**
```
Descripción: Componente para subir documentos
Ubicación: src/components/DocumentoUpload.jsx
Props:
  - socioID (string)
  - tipoDocumento (string: "certificadoMedico", "certificadoPsicologico", etc.)
  - obligatorio (boolean)
  - descripcion (string)
  - onUploadSuccess (callback)

Funcionalidad:
  - Drag-drop zone (visual claro)
  - File picker (click para seleccionar)
  - Validación: tamaño <5MB, tipo JPG/PDF
  - Progress bar durante carga
  - Mensajes: éxito/error
  - Muestra archivo cargado: nombre, tamaño, fecha
  - Botón: "Eliminar" (solo si no está verificado)
```

**2. MiDocumentos.jsx**
```
Descripción: Dashboard del socio para gestionar sus documentos
Ubicación: src/components/MiDocumentos.jsx
Props:
  - socioID (string)

Funcionalidad:
  - Tabla con 2 secciones: "Datos Sensibles" y "Otros Documentos"
  - Columnas: Documento | Estado Digital | Estado Original | Progreso
  - Estado visual:
    * "⏳ Pendiente" (rojo) - no subido
    * "💾 Cargado" (azul) - subido pero no verificado original
    * "✅ Verificado" (verde) - completado
  - Para cada documento: 
    * Botón upload (si pendiente)
    * Mostrar fecha upload + archivo
    * Mostrar fecha verificación original
    * Info: "Entrega original en próxima reunión"
  - Progress bar: X/14 documentos completados
  - Info box: explicar sistema híbrido (digital + original)
```

**3. DashboardSecretario.jsx**
```
Descripción: Vista de control para el Secretario
Ubicación: src/components/DashboardSecretario.jsx
Props:
  - rol (debe ser "secretario")

Funcionalidad:
  - TABLA PRINCIPAL:
    * Columnas: Socio | % Completitud | Docs Subidos | Docs Verificados | Acciones
    * Rows: todos los 75 socios
    * Ordenable: por % completitud, nombre, etc.
    * Filtros: 
      - "Mostrando los 10 con menos avance"
      - "Solo falta certificado médico"
      - "Solo falta original verificado"
  
  - PANEL LATERAL (ALERTAS):
    * "5 socios sin certificado médico (>7 días sin envío)"
    * "3 socios sin certificado psicológico"
    * "2 socios listos para SEDENA"
  
  - ACCIONES POR SOCIO:
    * Click en socio → Ver detalles (modal)
    * Botón: "Ver expediente"
    * Botón: "Enviar recordatorio email"
    * Botón: "Marcar original como verificado"
  
  - MODAL DE DETALLES:
    * Todos los documentos del socio
    * Estado de cada uno (digital + original)
    * Historial de auditoría (quién, cuándo, qué)
    * Botón: "Descargar expediente completo (ZIP)"
    * Botón: "Marcar LISTO para SEDENA"
```

### PRIORIDAD 2 (IMPORTANTE):

**4. PrivacyPolicy.jsx**
```
Descripción: Página pública con Aviso de Privacidad
Ubicación: src/pages/PrivacyPolicy.jsx
Ruta: /aviso-privacidad

Funcionalidad:
  - Mostrar Aviso Integral en iframe
  - Botón: "Descargar PDF"
  - Botón: "Descargar Versión Simplificada"
  - Info: "Última actualización: 2 enero 2026"
  - Link a "Derechos ARCO"
```

**5. DerechosARCO.jsx**
```
Descripción: Formulario para ejercer derechos ARCO
Ubicación: src/pages/DerechosARCO.jsx
Ruta: /derechos-arco

Funcionalidad:
  - Formulario:
    * Email (requerido)
    * Tipo de derecho: Acceso|Rectificación|Cancelación|Oposición
    * Descripción del solicitud
    * Adjuntar copia de INE
  - Enviar a: tiropracticoyucatan@gmail.com
  - Mostrar plazo: "Responderemos en 20 días hábiles"
```

---

## 🔗 RUTAS A AGREGAR (en App.jsx)

```javascript
// Nuevas rutas públicas
<Route path="/aviso-privacidad" element={<PrivacyPolicy />} />
<Route path="/derechos-arco" element={<DerechosARCO />} />

// Rutas privadas (requieren auth)
<Route path="/mis-documentos" element={<MiDocumentos />} />
<Route path="/dashboard-secretario" element={<DashboardSecretario />} />
<Route path="/expediente/:socioID" element={<ExpedienteDetalles />} />
```

---

## 📧 VARIABLES DE ENTORNO (Agregar a .env)

```bash
# Firebase Storage
VITE_FIREBASE_STORAGE_BUCKET=club-738-app.appspot.com

# Email (Cloud Functions)
FIREBASE_EMAIL_USER=tiropracticoyucatan@gmail.com
FIREBASE_EMAIL_PASSWORD=tu_password_aqui

# URLs
VITE_APP_URL=https://yucatanctp.org
VITE_AVISO_PRIVACIDAD_URL=/legal/aviso-privacidad-integral.pdf
```

---

## 📋 TAREAS ESPECÍFICAS PARA COPILOT

Copilot, **por favor implementa en este orden:**

### TAREA 1: Crear componente DocumentoUpload
- [x] Crear `src/components/DocumentoUpload.jsx`
- [x] Crear `src/components/DocumentoUpload.css`
- Validar archivo: JPG, PDF, máx 5MB
- Usar Firebase Storage para guardar: `socios/{socioID}/documentos/{tipoDocumento}_{timestamp}.jpg`
- Actualizar Firestore: `socios/{socioID}/documentosPETA/{tipo}/uploadDigital`
- Mostrar progreso con barra visual
- Manejar errores (archivo muy grande, tipo inválido, sin conexión)
- Permite eliminar documento (solo si no verificado)

### TAREA 2: Crear vista MiDocumentos
- [x] Crear `src/components/MiDocumentos.jsx`
- [x] Crear `src/components/MiDocumentos.css`
- Obtener documentos de Firestore: `socios/{socioID}/documentosPETA`
- Mostrar tabla: Documento | Estado Digital | Estado Original | Acciones
- Colores: Pendiente (rojo), Cargado (azul), Verificado (verde)
- Para cada documento: mostrar fecha upload, archivo, botón upload
- Progress bar: X/14 documentos
- Info box explicando sistema híbrido
- Responsive (móvil + desktop)

### TAREA 3: Crear Dashboard del Secretario
- [x] Crear `src/components/DashboardSecretario.jsx`
- [x] Crear `src/components/DashboardSecretario.css`
- Obtener todos los socios: `socios` collection
- Tabla: Socio | % Completitud | Docs Subidos | Docs Verificados | Acciones
- Calcular % completitud: (docs verificados / 14) * 100
- Filtros: "Falta certificado médico", "Listos para SEDENA", etc.
- Alertas: socios sin documentos por >7 días
- Botones por socio:
  * "Ver expediente" → abre modal
  * "Enviar recordatorio" → llama email function
  * "Marcar original verificado" → abre formulario
- Modal expediente: lista todos los documentos + historial auditoría
- Botón: "Descargar ZIP" (descarga todos los PDFs del socio)

### TAREA 4: Crear página Aviso de Privacidad
- [x] Crear `src/pages/PrivacyPolicy.jsx`
- Mostrar aviso en iframe desde `/legal/aviso-privacidad-integral.html`
- Botón "Descargar PDF"
- Botón "Versión Simplificada"
- Breadcrumb: Home > Aviso de Privacidad
- Link a "Derechos ARCO"

### TAREA 5: Actualizar Firestore Rules
- [x] Actualizar `firebaseConfig.js` (Security Rules)
- Solo socio ve sus documentos + secretario ve todo
- Solo socio puede escribir sus documentos
- Solo secretario puede marcar como "verificado"
- Logs inmutables (no se pueden borrar)

### TAREA 6: Crear Cloud Functions
- [x] Crear `functions/index.js`
- Función 1: Recordatorio automático (cada día, si >7 días sin envío)
- Función 2: Confirmación (cuando socio sube documento)
- Función 3: Notificación (cuando secretario verifica original)
- Usar nodemailer para enviar emails

### TAREA 7: Agregar rutas en App.jsx
- [x] Actualizar `src/App.jsx`
- Agregar rutas nuevas:
  * `/aviso-privacidad` → PrivacyPolicy
  * `/derechos-arco` → DerechosARCO
  * `/mis-documentos` → MiDocumentos (privada)
  * `/dashboard-secretario` → DashboardSecretario (privada, solo secretario)
- Agregar links en menú + footer

### TAREA 8: Agregar links en footer/menú
- [x] Actualizar footer en App.jsx
- Link: "Aviso de Privacidad" → `/aviso-privacidad`
- Link: "Derechos ARCO" → `/derechos-arco`
- Link: "Contacto" → `tiropracticoyucatan@gmail.com`

### TAREA 9: Convertir y subir avisos
- [x] Convertir `Aviso-Privacidad-Integral.md` → HTML/PDF
- [x] Convertir `Aviso-Privacidad-Simplificado.md` → HTML/PDF
- [x] Crear carpeta `public/legal/`
- [x] Guardar archivos: 
  * `public/legal/aviso-privacidad-integral.html`
  * `public/legal/aviso-privacidad-integral.pdf`
  * `public/legal/aviso-privacidad-simplificado.html`
- [x] Deploy: `firebase deploy --only hosting`

---

## ✅ CHECKLIST FINAL (Para verificar)

Antes de "npm run build" y deploy:

- [ ] DocumentoUpload funciona: puedo subir, ver progreso, confirmar
- [ ] MiDocumentos muestra estado correcto de mis documentos
- [ ] DashboardSecretario muestra los 75 socios con % correcto
- [ ] Puedo "Marcar original verificado" como secretario
- [ ] Email de recordatorio se envía automáticamente (después de 7 días)
- [ ] Email de confirmación se envía cuando subo documento
- [ ] Aviso de Privacidad se ve bien en `/aviso-privacidad`
- [ ] Links en footer funcionan
- [ ] Derechos ARCO formulario envía email a tiropracticoyucatan@gmail.com
- [ ] Firestore Rules protegen datos (socio no ve otros, secretario ve todo)
- [ ] Storage Rules permiten upload solo del socio dueño
- [ ] `npm run build` sin errores
- [ ] `firebase deploy` sin errores
- [ ] Web en vivo: https://yucatanctp.org funciona

---

## 🎯 PASOS SIGUIENTES DESPUÉS DE ESTO

1. **Pruebas:**
   - Crear 2 usuarios de prueba (socio + secretario)
   - Socio sube documento → verificar Firebase Storage
   - Secretario marca como verificado → verificar Firestore
   - Recibir email de confirmación

2. **Capacitación:**
   - Entrenar a socios: cómo subir documentos
   - Entrenar al Secretario: cómo usar dashboard
   - Mostrar dónde entregar originales

3. **Producción:**
   - Importar 75 socios reales desde Excel
   - Enviar invitaciones a socios
   - Empezar recolección de documentos

4. **SEDENA:**
   - Cuando todo esté completo, llevar originales a 32 ZM
   - Presentar expediente digital como respaldo

---

## 📞 CONTACTOS IMPORTANTES

- **Secretario:** tiropracticoyucatan@gmail.com
- **32 Zona Militar (SEDENA):** Requiere consultar
- **Autoridad de Privacidad:** Secretaría Anticorrupción y Buen Gobierno
- **Support:** GitHub Copilot / VS Code

---

**INSTRUCCIÓN FINAL PARA COPILOT:**

```
Revisa todo este documento. 

Basándote en:
- CONTEXT.md (contexto general del Club)
- Este documento (requisitos de privacidad y documentos)
- Tu análisis anterior de la estructura

Dame un plan detallado de:
1. Qué archivos necesito crear/actualizar
2. En qué orden implementarlos
3. Dependencias entre componentes
4. Posibles problemas/riesgos
5. Pasos exactos para cada tarea

¿Preguntas antes de empezar?
```

---

**Documento creado:** 3 de enero de 2026  
**Versión:** 1.0 (IMPLEMENTACIÓN)  
**Estado:** Listo para Copilot  
**Prioridad:** CRÍTICA

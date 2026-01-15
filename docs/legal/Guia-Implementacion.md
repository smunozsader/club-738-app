# GUÍA DE IMPLEMENTACIÓN: PROTECCIÓN DE DATOS PERSONALES
## Club de Caza, Tiro y Pesca de Yucatán, A.C.

---

## 📋 RESUMEN EJECUTIVO

Has creado **4 documentos legales** para cumplir con la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** vigente desde el 21 de marzo de 2025:

1. ✅ **Aviso de Privacidad Integral** (completo, 13 secciones)
2. ✅ **Aviso de Privacidad Simplificado** (versión corta)
3. ✅ **Componente React** (checkbox de consentimiento)
4. ✅ **CSS personalizado** (estilos del componente)

---

## 🎯 OBLIGACIONES LEGALES QUE CUMPLES

### Artículo 15 LFPDPPP - Contenido del Aviso de Privacidad ✅
- ✅ Identidad y domicilio del responsable
- ✅ Datos personales que serán tratados (identificando sensibles)
- ✅ Finalidades del tratamiento (distinguiendo primarias y secundarias)
- ✅ Opciones para limitar uso/divulgación
- ✅ Medios para ejercer derechos ARCO
- ✅ Transferencias de datos
- ✅ Procedimiento para cambios al aviso

### Artículo 8 LFPDPPP - Datos Sensibles ✅
- ✅ **Consentimiento expreso** para datos sensibles (certificados médicos, antecedentes penales, etc.)
- ✅ Explicación clara de por qué se requieren (trámites SEDENA)

### Artículo 16 LFPDPPP - Modalidades del Aviso ✅
- ✅ **Aviso Integral:** Documento completo con todos los requisitos
- ✅ **Aviso Simplificado:** Versión resumida para lectura rápida
- ✅ **Aviso Corto:** Checkbox en formulario con link a avisos completos

---

## 📂 ARCHIVOS DESCARGABLES

### 1. Aviso de Privacidad Integral
**Archivo:** `Aviso-Privacidad-Integral.md`  
**Uso:** Publicar en sitio web, entregar impreso en instalaciones  
**Secciones:**
1. Identidad del Responsable
2. Datos que recabamos (5 categorías)
3. Finalidades (primarias y secundarias)
4. Opciones para limitar uso
5. Derechos ARCO
6. Revocación del consentimiento
7. Transferencias de datos
8. Medidas de seguridad
9. Cookies y web beacons
10. Cambios al aviso
11. Consentimiento
12. Autoridad competente
13. Declaración de consentimiento

### 2. Aviso de Privacidad Simplificado
**Archivo:** `Aviso-Privacidad-Simple.md`  
**Uso:** Mostrar en modal al registrarse, enviar por email  
**Contenido:** Resumen ejecutivo de 2 páginas

### 3. Componente React
**Archivo:** `ConsentimientoPriv.jsx`  
**Uso:** Integrar en formulario de registro de socios  
**Características:**
- 3 checkboxes (primario obligatorio, sensibles obligatorio, secundario opcional)
- Validación en tiempo real
- Link a aviso completo
- Botón de descarga PDF
- Iframe para leer aviso sin salir del formulario

### 4. Estilos CSS
**Archivo:** `ConsentimientoPriv.css`  
**Uso:** Estilos del componente React  
**Características:**
- Diseño responsive (móvil + desktop)
- Colores diferenciados (obligatorio rojo, opcional azul)
- Animaciones suaves
- Accesibilidad (WCAG 2.1)

---

## 🚀 CÓMO IMPLEMENTAR EN TU SITIO WEB

### PASO 1: Convertir Markdown a HTML/PDF

**Opción A: Usar Pandoc (recomendado)**
```bash
# Instalar Pandoc
# macOS: brew install pandoc
# Windows: choco install pandoc

# Convertir a HTML
pandoc Aviso-Privacidad-Integral.md -o aviso-privacidad-integral.html --standalone

# Convertir a PDF
pandoc Aviso-Privacidad-Integral.md -o aviso-privacidad-integral.pdf --pdf-engine=wkhtmltopdf
```

**Opción B: Usar herramienta online**
- https://www.markdowntopdf.com/
- https://dillinger.io/ (exportar a HTML/PDF)

### PASO 2: Subir a Firebase Hosting

```bash
# En tu carpeta club-738-web
mkdir public/legal

# Copiar archivos
cp aviso-privacidad-integral.html public/legal/
cp aviso-privacidad-integral.pdf public/legal/
cp aviso-privacidad-simplificado.html public/legal/

# Deploy
firebase deploy --only hosting
```

**URLs resultantes:**
- `https://yucatanctp.org/legal/aviso-privacidad-integral.html`
- `https://yucatanctp.org/legal/aviso-privacidad-integral.pdf`

### PASO 3: Integrar componente React

**En tu formulario de registro (`RegistroSocio.jsx`):**

```javascript
import React, { useState } from 'react';
import ConsentimientoPrivacidad from './ConsentimientoPrivacidad';

export default function RegistroSocio() {
  const [consentimientos, setConsentimientos] = useState({
    primario: false,
    secundario: false,
    sensibles: false
  });

  const handleConsentChange = (consents) => {
    setConsentimientos(consents);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar consentimientos obligatorios
    if (!consentimientos.primario || !consentimientos.sensibles) {
      alert('Debe aceptar el tratamiento de datos personales y datos sensibles');
      return;
    }

    // Guardar en Firestore
    const nuevoSocio = {
      // ... otros datos del socio
      consentimientos: {
        primario: consentimientos.primario,
        secundario: consentimientos.secundario,
        sensibles: consentimientos.sensibles,
        fechaConsentimiento: new Date(),
        ipAddress: '192.168.1.1' // Obtener IP real
      }
    };

    // Guardar en base de datos
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Otros campos del formulario */}
      
      <ConsentimientoPrivacidad onConsentChange={handleConsentChange} />
      
      <button type="submit">Registrarse</button>
    </form>
  );
}
```

### PASO 4: Estructura en Firestore

**Guardar consentimientos en cada documento de socio:**

```javascript
// Estructura en Firestore: socios/{socioID}
{
  datosPersonales: { ... },
  consentimientos: {
    primario: true,              // Finalidades primarias
    secundario: false,           // Finalidades secundarias (opcional)
    sensibles: true,             // Datos sensibles (obligatorio)
    fechaConsentimiento: timestamp,
    ipAddress: "192.168.1.1",
    navegador: "Chrome 120.0",
    versionAvisoPrivacidad: "1.0",
    avisoAceptado: "https://yucatanctp.org/legal/aviso-privacidad-integral.pdf"
  }
}
```

---

## 📍 DÓNDE PUBLICAR LOS AVISOS

### 1. Sitio Web (OBLIGATORIO)
- ✅ Página dedicada: `/aviso-privacidad`
- ✅ Link en footer de todas las páginas
- ✅ Modal al registrarse (con checkbox)
- ✅ PDF descargable

### 2. Instalaciones del Club (OBLIGATORIO)
- ✅ Impreso en recepción (visible)
- ✅ Impreso en área de registro de socios
- ✅ Copia disponible a solicitud

### 3. Correos Electrónicos (RECOMENDADO)
- ✅ Email de bienvenida a nuevos socios
- ✅ Notificación de cambios al aviso
- ✅ Firma de correos institucionales con link

### 4. Formularios Físicos (SI APLICA)
- ✅ Incluir aviso simplificado en solicitudes de membresía
- ✅ Checkbox de consentimiento en formatos impresos

---

## ⚖️ DERECHOS ARCO - PROCEDIMIENTO

Cuando un socio solicite ejercer sus derechos ARCO:

### 1. ACCESO (Ver sus datos)
- Plazo de respuesta: 20 días hábiles
- Entregar: Copia de sus datos en PDF o impreso

### 2. RECTIFICACIÓN (Corregir datos)
- Plazo de respuesta: 20 días hábiles
- Efectividad: 15 días hábiles después de respuesta

### 3. CANCELACIÓN (Eliminar datos)
- **Importante:** No puedes eliminar datos necesarios para SEDENA
- Solo puedes cancelar si el socio se da de baja del Club
- Conservar logs de auditoría (inmutables)

### 4. OPOSICIÓN (Dejar de usar datos)
- Permitir oposición a finalidades secundarias
- No permitir oposición a finalidades primarias (necesarias)

**Buzón de solicitudes:**
- Email: tiropracticoyucatan@gmail.com
- Domicilio: Calle 50 No. 531-E x 69 y 71, Centro, Mérida

---

## 🔐 MEDIDAS DE SEGURIDAD IMPLEMENTADAS

Según tu Firebase setup:

✅ **Encriptación en tránsito:** HTTPS/TLS (automático Firebase)  
✅ **Encriptación en reposo:** Firestore encripta datos automáticamente  
✅ **Control de acceso:** Firestore Rules (solo secretario ve todo)  
✅ **Autenticación:** Firebase Auth (email/password + MFA opcional)  
✅ **Respaldos:** Firestore backup automático diario  
✅ **Logs de auditoría:** Registro de accesos en `logs/{socioID}`

---

## 📅 RECORDATORIOS IMPORTANTES

### Cada 12 meses:
- ✅ Revisar y actualizar Aviso de Privacidad
- ✅ Verificar cumplimiento de medidas de seguridad
- ✅ Auditoría de transferencias de datos

### Cuando hay cambios:
- ✅ Notificar a socios 5 días hábiles antes
- ✅ Publicar nueva versión en sitio web
- ✅ Enviar email a todos los socios
- ✅ Actualizar versión en Firestore

### Ante solicitudes ARCO:
- ✅ Responder en 20 días hábiles
- ✅ Hacer efectivo en 15 días adicionales
- ✅ Documentar cada solicitud

---

## 🚨 SANCIONES POR INCUMPLIMIENTO

Según LFPDPPP 2025, las multas van de:

- **100 a 320,000 UMAs** (Unidades de Medida y Actualización)
- UMA 2026: ~$108.57 pesos
- **Multa mínima:** ~$10,857 pesos
- **Multa máxima:** ~$34,742,400 pesos

**Infracciones graves:**
- No publicar Aviso de Privacidad
- No obtener consentimiento para datos sensibles
- Transferir datos sin consentimiento
- No atender derechos ARCO
- Vulneración de seguridad

---

## ✅ CHECKLIST DE CUMPLIMIENTO

- [ ] Aviso de Privacidad Integral publicado en sitio web
- [ ] Aviso de Privacidad Simplificado disponible
- [ ] Checkbox de consentimiento en formulario de registro
- [ ] Aviso impreso en instalaciones del Club
- [ ] Procedimiento documentado para derechos ARCO
- [ ] Email de contacto activo (tiropracticoyucatan@gmail.com)
- [ ] Medidas de seguridad implementadas (Firebase)
- [ ] Logs de consentimientos en Firestore
- [ ] Política de respaldos activa
- [ ] Capacitación a Mesa Directiva sobre LFPDPPP

---

## 📞 CONTACTO PARA DUDAS LEGALES

**Autoridad competente:**  
Secretaría Anticorrupción y Buen Gobierno  
Web: https://www.gob.mx/sfp  
Tel: 800-ANTICORRUPCIÓN

**Asesoría legal (recomendado):**  
Considera consultar un abogado especializado en protección de datos si:
- Recibes una solicitud ARCO compleja
- Hay una vulneración de seguridad
- Un socio presenta queja ante autoridad
- Necesitas transferir datos a terceros nuevos

---

**Documento creado:** 2 de enero de 2026  
**Versión:** 1.0  
**Actualizado por:** Secretario Club 738

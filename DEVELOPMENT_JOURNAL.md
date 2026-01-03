# 📔 Development Journal - Club 738 Web

## Resumen del Proyecto

**Club 738 Web** es el portal de socios del Club de Caza, Tiro y Pesca de Yucatán, A.C. (SEDENA #738). Permite a los socios gestionar su documentación para trámites PETA ante la 32 Zona Militar de Valladolid.

**URL de Producción**: https://club-738-app.web.app

---

## 📅 Enero 2026

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

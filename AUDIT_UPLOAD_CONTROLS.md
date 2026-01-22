# Bug Audit: Missing Upload Controls in "Mi Expediente Digital"

**Date**: January 21, 2026  
**Component**: DocumentList.jsx / DocumentCard.jsx  
**Issue**: Document upload controls (MultiImageUploader) are not rendering for pending documents  
**Severity**: HIGH - Users cannot upload required documents  

---

## Issue Description

In the "Mi Expediente Digital" page, certain documents show as "Pendiente" (Pending) but have **no upload interface** visible. Specifically:
- "Carta Modo Honesto de Vivir" shows "Pendiente" status
- No upload button or drag-drop zone appears
- The `<div class="multi-image-uploader"></div>` is empty (no children rendered)

### User Reported HTML
```html
<div class="document-card pendiente">
  <div class="card-header">
    <span class="card-icon">✍️</span>
    <div class="card-title-section">
      <h4>Carta Modo Honesto de Vivir</h4>
      <p class="card-description">Formato oficial del club. Original firmado se entrega en 32 ZM.</p>
    </div>
    <div class="card-status" style="background-color: rgb(255, 152, 0);">Pendiente</div>
  </div>
  <div class="card-uploader">
    <div class="mensaje-documento-pendiente">
      <p>Este documento está pendiente de carga. Por favor súbelo para continuar.</p>
    </div>
    <div class="multi-image-uploader "></div>  <!-- ⚠️ EMPTY! -->
  </div>
</div>
```

---

## Root Cause Analysis

### Code Flow
1. **DocumentList.jsx** renders DocumentCard for each document (line 244-256)
2. **DocumentCard.jsx** receives:
   - `documentData` = value from `mergedDocData[doc.id]` (line 172)
   - When document is pending: `documentData = undefined` or empty
3. **DocumentCard.jsx** renders MultiImageUploader only in this condition (line 338):
   ```jsx
   {(!hasDocument || showUploader) && (
     <div className="card-uploader">
       <MultiImageUploader ... />
     </div>
   )}
   ```

### The Problem Chain

#### Issue A: `documentosPETA` Structure in Firestore
When a Socio document is first created or a document hasn't been uploaded yet:
```javascript
// Current Firestore doc: socios/user@email.com
{
  nombre: "...",
  curp: "...",
  // documentosPETA might be MISSING or EMPTY
  documentosPETA: {} // or undefined
}
```

**Result**: When DocumentList.jsx runs:
```jsx
const mergedDocData = { ...documentosData }; // documentosData = {}
// mergedDocData['cartaModoHonesto'] = undefined
```

#### Issue B: `hasDocument` Check in DocumentCard
```jsx
const hasDocument = !!documentData?.url;
// If documentData is undefined, hasDocument = false ✓ (CORRECT)
```

This part **works correctly**.

#### Issue C: Conditional Rendering Logic
```jsx
{(!hasDocument || showUploader) && (
  <div className="card-uploader">
    {/* Message and MultiImageUploader should render here */}
    <MultiImageUploader ... />
  </div>
)}
```

**Expected**: When `hasDocument = false`, the div renders  
**What should appear**: MultiImageUploader component with buttons

#### Issue D: React Component Rendering Check
The issue is that **MultiImageUploader IS rendering**, but might be:
1. **Returning nothing** (empty JSX)
2. **Conditionally showing nothing** based on props
3. **CSS hiding the content** (unlikely, CSS checked)

---

## Deep Inspection: MultiImageUploader Logic

### Props Being Passed (from DocumentCard line 348-357)
```jsx
<MultiImageUploader
  userId={userId}                    // ✓ should have email
  documentType={documentType}        // ✓ 'cartaModoHonesto'
  documentLabel={label}              // ✓ "Carta Modo Honesto de Vivir"
  allowMultiple={allowMultiple}      // ✗ FALSE for this doc (not in MULTI_IMAGE_DOCS)
  imageOnly={imageOnly}              // ✗ FALSE (not in IMAGE_ONLY_DOCS)
  allowPdf={allowPdf}                // ✓ TRUE (in PDF_ALLOWED_DOCS)
  isGovtDoc={isGovtDoc}              // ✗ FALSE
  onUploadComplete={handleUploadComplete}
/>
```

### MultiImageUploader Rendering Decision Tree
**Given props above** for "Carta Modo Honesto de Vivir":
- `imageOnly = false` ✓ Not the image-only branch
- `allowPdf = true` ✓ **GOES INTO PDF BRANCH**
- `isGovtDoc = false` (but allowPdf = true)

**Lines 593-628** (PDF Oficial Section):
```jsx
{isGovtDoc && allowPdf && !uploading && (
  <div className="pdf-oficial-section">
    // Only shows for CURP and Constancia (government docs)
  )}
```
❌ Skipped (isGovtDoc = false)

**Lines 630-640** (Mode Selector):
```jsx
{!allowPdf && !uploadMode && !uploading && images.length === 0 && (
  <div className="upload-mode-selector">
    // Only shows if !allowPdf
  )}
```
❌ **SKIPPED** (allowPdf = true, so condition is FALSE!)

**Lines 641-690** (PDF Upload Section):
```jsx
{!allowPdf && uploadMode === 'pdf' && !uploading && (
  // Only shows if !allowPdf AND mode is 'pdf'
)}
```
❌ **SKIPPED** (allowPdf = true)

**Lines 692-750** (Photo Upload Section):
```jsx
{!allowPdf && uploadMode === 'photo' && !uploading && (
  // Only shows if !allowPdf AND mode is 'photo'
)}
```
❌ **SKIPPED** (allowPdf = true)

**Lines 751-768** (Upload Progress):
```jsx
{(uploading || converting) && (
  // Only shows during active upload
)}
```
❌ Not uploading

**Error Display:**
```jsx
{error && <div className="upload-error">{error}</div>}
```
❌ No error message

### **THE BUG**: No Rendering Path for `allowPdf=true && !isGovtDoc`!

The MultiImageUploader component **doesn't handle the case**:
- `allowPdf = true` (accepts PDF uploads like "Certificado Médico")
- `isGovtDoc = false` (not a government-issued document)

When both conditions are true, **NOTHING RENDERS** except possibly the error.

---

## Affected Documents

All documents with `allowPdf=true` that are NOT government docs (`isGovtDoc=false`):

From DocumentCard.jsx:
```javascript
const PDF_ALLOWED_DOCS = [
  'curp',                    // isGovtDoc: TRUE ✓ (has special path)
  'constanciaAntecedentes', // isGovtDoc: TRUE ✓ (has special path)
  'certificadoMedico',       // isGovtDoc: FALSE ❌ NO RENDERING PATH
  'certificadoPsicologico',  // isGovtDoc: FALSE ❌ NO RENDERING PATH
  'certificadoToxicologico', // isGovtDoc: FALSE ❌ NO RENDERING PATH
  'comprobanteDomicilio',    // isGovtDoc: FALSE ❌ NO RENDERING PATH
  'cartaModoHonesto',        // isGovtDoc: FALSE ❌ NO RENDERING PATH (USER-REPORTED)
  'licenciaCaza',            // isGovtDoc: FALSE ❌ NO RENDERING PATH
  'reciboE5cinco',           // isGovtDoc: FALSE ❌ NO RENDERING PATH
  'permisoAnterior'          // isGovtDoc: FALSE ❌ NO RENDERING PATH
];

const GOVT_DOCS = [
  'curp',
  'constanciaAntecedentes' // Only these two have isGovtDoc=true
];
```

**Missing upload UI for ~8 documents!**

---

## Fix Required

### Option 1: Add Missing Rendering Path (RECOMMENDED)
Add a section in MultiImageUploader.jsx to handle non-government PDFs:

```jsx
{allowPdf && !isGovtDoc && !uploadMode && !uploading && (
  <div className="pdf-upload-section">
    <div className="pdf-requirements">
      <h4>📋 Sube tu documento:</h4>
      <ul>
        <li>✓ Formato: PDF o imagen (JPG/PNG)</li>
        <li>✓ Peso máximo: 5 MB</li>
        <li>✓ Resolución: mínimo 150 DPI</li>
      </ul>
    </div>
    
    <label className="file-select-btn">
      📤 Seleccionar archivo
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => handleFiles(Array.from(e.target.files))}
        hidden
      />
    </label>
  </div>
)}
```

### Option 2: Refactor Upload Logic
Create a unified upload handler that works for all PDF-accepting docs:
- PDF docs that accept direct upload (Certificado Médico, etc.)
- Image-to-PDF conversion (INE, Cartilla)
- JPG-only (Foto Credencial)

---

## Testing Plan

1. **Check database**: Verify `socios/{email}/documentosPETA` structure
   - Is the field empty for all socios?
   - Should it have `{}` or be missing entirely?

2. **Test pending document card**:
   - Open "Mi Expediente Digital"
   - Look for document with "Pendiente" status
   - Verify upload controls appear

3. **Test upload flow**:
   - Upload a document
   - Check Firestore update
   - Check Download URL in UI
   - Verify status changes from "Pendiente" → "En revisión"

4. **Mobile responsive**:
   - Verify upload controls work on mobile

---

## Code Locations

- **DocumentCard.jsx**: line 338 (conditional rendering)
- **MultiImageUploader.jsx**: lines 593-750 (rendering paths - **MISSING CASE**)
- **DocumentCard.css**: Verified - no hidden CSS
- **MultiImageUploader.css**: Verified - should be fine
- **App.jsx**: line 108 (documentosPETA loading from Firestore)

---

## Recommendation

**FIX PRIORITY**: 🔴 CRITICAL

**Immediate Actions**:
1. Add missing rendering path for `allowPdf=true && !isGovtDoc` in MultiImageUploader
2. Test upload for "Carta Modo Honesto de Vivir"
3. Verify all 8 affected documents now show upload UI
4. Update journal and commit

**Follow-up**:
1. Consider refactoring MultiImageUploader logic for clarity
2. Add unit tests for different document type combinations
3. Add console.log debugging for document rendering decisions

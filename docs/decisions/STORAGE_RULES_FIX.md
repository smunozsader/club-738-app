# 🔥 Firebase Storage Access Fix - v1.29.1

## Issue: 403 Forbidden Errors

### What Was Happening

When admin tried to access socios' documents from the VerificadorPETA or ExpedienteImpresor:

```
GET https://firebasestorage.googleapis.com/v0/b/club-738-app.firebasestorage.app/o/documentos%2Fjrgardoni%40gmail.com%2Fcurp.pdf 403 (Forbidden)
```

All PDF/document downloads failed with **403 Forbidden** even though:
- Documents existed in Firebase Storage
- Admin was logged in as `admin@club738.com`
- Documents were needed for PETA processing

### Root Cause

**Firebase Storage Rules** file (`storage.rules`) had TWO problems:

```javascript
// ❌ WRONG - Only one email recognized
function isSecretario() {
  return isAuthenticated() && request.auth.token.email == 'smunozam@gmail.com';
}
```

1. **Wrong Email**: Rules only recognized `'smunozam@gmail.com'` as secretary
   - Admin account `'admin@club738.com'` was NOT authorized
   - Every admin request was rejected with 403 Forbidden

2. **Missing Permissions**: No `list` permission to enumerate document folders
   - VerificadorPETA couldn't list documents
   - ExpedienteImpresor couldn't prepare expedients

### Solution Applied

**Updated `storage.rules` (3 changes)**:

#### 1. Add Both Admin Emails (lines 24-30)
```javascript
// ✅ CORRECT - Both emails recognized
function isSecretario() {
  return isAuthenticated() && (
    request.auth.token.email == 'admin@club738.com' ||    // PRIMARY
    request.auth.token.email == 'smunozam@gmail.com'       // FALLBACK
  );
}
```

#### 2. Add List Permission to Documents (lines 61-73)
```javascript
match /documentos/{email}/{fileName} {
  // Lectura: el propio socio O el secretario
  allow read: if isOwner(email) || isSecretario();
  
  // ✅ NEW: Lista de archivos (para expediente impresor)
  allow list: if isOwner(email) || isSecretario();
  
  // Escritura y eliminar...
}
```

#### 3. Add List Permission to Weapon Documents (lines 80-91)
```javascript
match /documentos/{email}/armas/{armaId}/{fileName} {
  allow read: if isOwner(email) || isSecretario();
  
  // ✅ NEW: Lista para ver registros de armas
  allow list: if isOwner(email) || isSecretario();
  
  // Escritura y eliminar...
}
```

### Deployment

```bash
firebase deploy --only storage

# Output:
# ✔ firebase.storage: rules file storage.rules compiled successfully
# ✔ storage: released rules storage.rules to firebase.storage
# ✔ Deploy complete!
```

### What's Fixed Now

| Feature | Before | After |
|---------|--------|-------|
| **Admin reads docs** | 403 Forbidden ❌ | ✅ Works |
| **List documents** | Permission denied ❌ | ✅ Works |
| **VerificadorPETA** | "Sin Registro" error ❌ | ✅ Shows real status |
| **ExpedienteImpresor** | Can't load documents ❌ | ✅ Loads complete expedient |
| **GeneradorPETA** | Can't find documents ❌ | ✅ Generates PDFs correctly |

### Testing

**In Browser Console** (after fix deployed):

```javascript
// Before - Would get 403 errors:
// GET /documentos/jrgardoni@gmail.com/curp.pdf 403 (Forbidden)

// After - Should load successfully:
// GET /documentos/jrgardoni@gmail.com/curp.pdf 200 (OK)
```

**In App**:

1. Login as `admin@club738.com`
2. Go to **Verificador PETA**
3. Select a socio (e.g., Joaquín Rodolfo Gardoni)
4. Click on a document → **Should load correctly** ✅
5. Go to **Expediente Impresor**
6. Prepare expedient → **Should show all documents** ✅
7. Click "Guardar Progreso" → **Should save without errors** ✅

### Security Notes

- ✅ Socios still can ONLY read their own documents
- ✅ Admin can read all socios' documents (as intended)
- ✅ No one can delete documents except the owner
- ✅ File type validation still enforced (PDF, JPG, PNG only)
- ✅ File size limits still enforced (5MB general, 10MB for weapon records)

### Files Changed

```
Modified: storage.rules
  - isSecretario() function: Added admin@club738.com
  - /documentos/{email}/{fileName}: Added allow list
  - /documentos/{email}/armas/{armaId}/{fileName}: Added allow list
```

### Commits

1. `8d66abc` - fix(storage): CRITICAL - Add admin@club738.com to Storage Rules
2. `05fc031` - docs: Add v1.29.1 journal entry documenting fix

---

**Status**: ✅ DEPLOYED & LIVE  
**Date**: 18 Enero 2026  
**Version**: v1.29.1  
**Impact**: CRITICAL - Restores admin access to all document operations

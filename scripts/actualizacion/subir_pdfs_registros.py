#!/usr/bin/env python3
"""
Subir PDFs de registros de armas a Firebase Storage
17 Enero 2026

PDFS A SUBIR:
- ARECHIGA: K084328, K078999, C647155 (CZ P07 FOLIO: B611940)
- GARDONI: DP25087 (Shadow 2)
"""

import firebase_admin
from firebase_admin import credentials, storage, firestore
import os
from datetime import datetime

# Inicializar Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate('scripts/serviceAccountKey.json')
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'club-738-app.firebasestorage.app'
    })

db = firestore.client()
bucket = storage.bucket()

print("=" * 80)
print("SUBIR PDFs DE REGISTROS DE ARMAS A FIREBASE STORAGE")
print("17 Enero 2026")
print("=" * 80)

# Directorio con los PDFs
pdfs_dir = 'armas_socios/2026. REGISTROS GARDONI Y ARECHIGA'

# Listar archivos
archivos = [f for f in os.listdir(pdfs_dir) if f.endswith('.pdf')]
print(f"\n📁 Archivos PDF encontrados: {len(archivos)}")
for archivo in archivos:
    print(f"   • {archivo}")

# Mapeo de archivos a configuración
uploads = []

print("\n" + "=" * 80)
print("SUBIENDO ARCHIVOS A STORAGE")
print("=" * 80)

for archivo in archivos:
    archivo_path = os.path.join(pdfs_dir, archivo)
    
    # Determinar email y matrícula del nombre del archivo
    email = None
    matricula = None
    arma_id = None
    
    # Detectar a qué arma pertenece cada PDF
    if 'K084328' in archivo or 'k084328' in archivo.lower():
        email = 'arechiga@jogarplastics.com'
        matricula = 'K084328'
    elif 'K078999' in archivo or 'k078999' in archivo.lower():
        email = 'arechiga@jogarplastics.com'
        matricula = 'K078999'
    elif 'C647155' in archivo or 'c647155' in archivo.lower():
        email = 'arechiga@jogarplastics.com'
        matricula = 'C647155'
    elif 'DP25087' in archivo or 'dp25087' in archivo.lower():
        email = 'jrgardoni@gmail.com'
        matricula = 'DP25087'
    
    if email and matricula:
        print(f"\n📤 Subiendo: {archivo}")
        print(f"   Email: {email}")
        print(f"   Matrícula: {matricula}")
        
        # Buscar el ID del documento de arma en Firestore
        socio_ref = db.collection('socios').document(email)
        armas = socio_ref.collection('armas').where('matricula', '==', matricula).get()
        
        if armas:
            arma_doc = armas[0]
            arma_id = arma_doc.id
            
            # Ruta en Storage
            storage_path = f"documentos/{email}/armas/{arma_id}/registro.pdf"
            
            # Subir archivo
            blob = bucket.blob(storage_path)
            blob.upload_from_filename(archivo_path)
            blob.make_public()
            
            # Obtener URL
            url = blob.public_url
            
            # Actualizar Firestore con la URL
            arma_doc.reference.update({
                'documentoRegistro': url,
                'fechaSubidaRegistro': datetime.now()
            })
            
            print(f"   ✅ Subido a: {storage_path}")
            print(f"   🔗 URL: {url}")
            print(f"   ✅ Firestore actualizado")
            
            uploads.append({
                'archivo': archivo,
                'email': email,
                'matricula': matricula,
                'url': url
            })
        else:
            print(f"   ⚠️ Arma no encontrada en Firestore")
    else:
        print(f"\n⚠️ No se pudo identificar: {archivo}")

# ACTUALIZAR FOLIO DE C647155
print("\n" + "=" * 80)
print("ACTUALIZAR FOLIO C647155")
print("=" * 80)

arechiga_ref = db.collection('socios').document('arechiga@jogarplastics.com')
armas_c647155 = arechiga_ref.collection('armas').where('matricula', '==', 'C647155').get()

if armas_c647155:
    print("\n✅ Actualizando FOLIO de C647155 → B611940")
    armas_c647155[0].reference.update({'folio': 'B611940'})
    print("   ✅ Firestore actualizado")
else:
    print("\n⚠️ C647155 no encontrada en Firestore")

# RESUMEN
print("\n" + "=" * 80)
print("📊 RESUMEN DE SUBIDAS")
print("=" * 80)

print(f"\nTotal archivos subidos: {len(uploads)}")
for upload in uploads:
    print(f"\n• {upload['archivo']}")
    print(f"  Socio: {upload['email']}")
    print(f"  Matrícula: {upload['matricula']}")
    print(f"  URL: {upload['url']}")

print("\n" + "=" * 80)
print("✅ PROCESO COMPLETADO")
print("=" * 80)

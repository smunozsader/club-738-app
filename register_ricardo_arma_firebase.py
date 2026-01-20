#!/usr/bin/env python3
"""
Script para registrar la nueva arma en Firestore y subir el PDF a Firebase Storage
"""

import os
import sys
from datetime import datetime
import uuid

# Configurar el path de las credenciales de Firebase
firebase_key_path = "scripts/serviceAccountKey.json"

if not os.path.exists(firebase_key_path):
    print(f"✗ Archivo de credenciales no encontrado: {firebase_key_path}")
    print("  Por favor, coloca el archivo serviceAccountKey.json en la carpeta scripts/")
    sys.exit(1)

try:
    from firebase_admin import credentials, firestore, storage, initialize_app
    print("✓ Firebase Admin SDK disponible\n")
except ImportError:
    print("✗ Firebase Admin SDK no disponible")
    print("  Ejecuta: pip install firebase-admin")
    sys.exit(1)

# Inicializar Firebase
try:
    cred = credentials.Certificate(firebase_key_path)
    if not any(isinstance(app, type(initialize_app(cred))) for app in []):
        initialize_app(cred)
    db = firestore.client()
    bucket = storage.bucket(name="club-738-app.firebasestorage.app")
    print("✓ Firebase inicializado correctamente\n")
except Exception as e:
    print(f"✗ Error inicializando Firebase: {e}")
    sys.exit(1)

# Datos de la nueva arma
email = "rsoberanis11@hotmail.com"
arma_data = {
    "clase": "PISTOLA",
    "calibre": ".40 S&W",
    "marca": "CZ",
    "modelo": "P-10 C",
    "matricula": "EP29710",
    "folio": "A3912487",
    "modalidad": "tiro",
    "fechaRegistro": datetime.now(),
    "documentoRegistro": ""  # Se actualizará después de subir el PDF
}

# Generar ID único para la arma
arma_id = str(uuid.uuid4())[:8]

print(f"📋 REGISTRANDO NUEVA ARMA EN FIRESTORE")
print(f"   Email: {email}")
print(f"   Arma ID: {arma_id}")
print(f"   Datos: {arma_data}\n")

try:
    # Crear documento en Firestore
    db.collection('socios').document(email).collection('armas').document(arma_id).set(arma_data)
    print(f"✓ Arma registrada en Firestore")
    print(f"   Ruta: socios/{email}/armas/{arma_id}\n")
except Exception as e:
    print(f"✗ Error al registrar en Firestore: {e}")
    sys.exit(1)

# Subir PDF a Firebase Storage
pdf_path_local = "armas_socios/2026. nueva arma RICARDO ANTONIO SOBERANIS GAMBOA/CZ P-10 C - EP29710 - A3912487. RICARDO ANTONIO SOBERANIS GAMBOA .pdf"
storage_path = f"documentos/{email}/armas/{arma_id}/registro.pdf"

if not os.path.exists(pdf_path_local):
    print(f"✗ PDF no encontrado: {pdf_path_local}")
    sys.exit(1)

print(f"📄 SUBIENDO PDF A FIREBASE STORAGE")
print(f"   Archivo local: {pdf_path_local}")
print(f"   Ruta Storage: {storage_path}")

try:
    blob = bucket.blob(storage_path)
    blob.upload_from_filename(pdf_path_local)
    
    # Obtener URL de descarga
    pdf_url = blob.public_url
    
    print(f"✓ PDF subido correctamente\n")
    print(f"   URL pública: {pdf_url}\n")
    
    # Actualizar documento en Firestore con la URL del PDF
    db.collection('socios').document(email).collection('armas').document(arma_id).update({
        'documentoRegistro': pdf_url
    })
    
    print(f"✓ URL del PDF actualizada en Firestore\n")
    
except Exception as e:
    print(f"✗ Error al subir PDF: {e}")
    sys.exit(1)

# Resumen final
print("=" * 60)
print("✓ REGISTRO COMPLETADO")
print("=" * 60)
print(f"\n📋 DETALLES DEL ARMA:")
print(f"   Email: {email}")
print(f"   Tipo: PISTOLA")
print(f"   Marca: CZ")
print(f"   Modelo: P-10 C")
print(f"   Matrícula: EP29710")
print(f"   Folio: A3912487")
print(f"   Calibre: .40 S&W")
print(f"   Modalidad: tiro")
print(f"\n🔗 REFERENCIAS:")
print(f"   Firestore ID: {arma_id}")
print(f"   Firestore Path: socios/{email}/armas/{arma_id}")
print(f"   Storage Path: {storage_path}")
print(f"   PDF URL: {pdf_url}")

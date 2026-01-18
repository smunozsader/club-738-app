#!/usr/bin/env python3
"""
Verificar y subir PDFs de Iván Cabo
17 Enero 2026
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
print("VERIFICACIÓN Y SUBIDA - PDFs IVÁN CABO")
print("=" * 80)

# Verificar estado actual
cabo_ref = db.collection('socios').document('ivancabo@gmail.com')
armas = cabo_ref.collection('armas').get()

print(f"\n📊 ESTADO ACTUAL EN FIRESTORE")
print(f"Total armas: {len(armas)}\n")

sin_pdf = []
con_pdf = []

for arma_doc in armas:
    arma = arma_doc.to_dict()
    matricula = arma.get('matricula', 'N/A')
    clase = arma.get('clase', 'N/A')
    tiene_pdf = arma.get('documentoRegistro')
    
    status = "✅ SÍ" if tiene_pdf else "❌ NO"
    print(f"{status} - {clase:25} MAT: {matricula}")
    
    if tiene_pdf:
        con_pdf.append(matricula)
    else:
        sin_pdf.append(matricula)

print(f"\n📈 Con PDF: {len(con_pdf)}/5")
print(f"📉 Sin PDF: {len(sin_pdf)}/5")

# Listar PDFs disponibles
pdfs_dir = 'armas_socios/Registros RFA IVAN'
archivos_pdf = [f for f in os.listdir(pdfs_dir) if f.endswith('.pdf')]

print("\n" + "=" * 80)
print(f"📁 PDFs DISPONIBLES EN CARPETA: {len(archivos_pdf)}")
print("=" * 80)

for archivo in archivos_pdf:
    print(f"   • {archivo}")

# Mapeo manual de archivos (por matrícula detectada en nombre)
print("\n" + "=" * 80)
print("📤 SUBIENDO PDFs FALTANTES")
print("=" * 80)

uploads = []

for archivo in archivos_pdf:
    archivo_path = os.path.join(pdfs_dir, archivo)
    matricula = None
    
    # Detectar matrícula del nombre del archivo
    archivo_lower = archivo.lower()
    
    # Mapeo preciso basado en nombres de archivo reales
    if 'czp10c' in archivo_lower or 'p10c' in archivo_lower or 'p-10c' in archivo_lower:
        matricula = 'DP23540'  # CZ P-10 C
    elif 'buckmark' in archivo_lower:
        matricula = 'US515YY19935'  # Browning Buck Mark
    elif 'puma' in archivo_lower:
        matricula = '27280'  # Mendoza Puma
    elif 'retay' in archivo_lower or 'gordion' in archivo_lower:
        matricula = '73-H21YT-001717'  # Retay Gordion
    elif 'shadow' in archivo_lower:
        matricula = 'FP40104'  # CZ Shadow 2
    # Fallback a detección por matrícula directa
    elif 'dp23540' in archivo_lower:
        matricula = 'DP23540'
    elif 'us515yy19935' in archivo_lower:
        matricula = 'US515YY19935'
    elif '27280' in archivo_lower:
        matricula = '27280'
    elif '73-h21yt-001717' in archivo_lower:
        matricula = '73-H21YT-001717'
    elif 'fp40104' in archivo_lower:
        matricula = 'FP40104'
    
    if matricula:
        print(f"\n📄 Procesando: {archivo}")
        print(f"   Matrícula detectada: {matricula}")
        
        # Buscar arma en Firestore
        armas_match = cabo_ref.collection('armas').where('matricula', '==', matricula).get()
        
        if armas_match:
            arma_doc = armas_match[0]
            arma_data = arma_doc.to_dict()
            arma_id = arma_doc.id
            
            # Verificar si ya tiene PDF
            if arma_data.get('documentoRegistro'):
                print(f"   ⚠️  Ya tiene PDF registrado - SALTANDO")
                continue
            
            # Subir a Storage
            storage_path = f"documentos/ivancabo@gmail.com/armas/{arma_id}/registro.pdf"
            
            blob = bucket.blob(storage_path)
            blob.upload_from_filename(archivo_path)
            blob.make_public()
            
            url = blob.public_url
            
            # Actualizar Firestore
            arma_doc.reference.update({
                'documentoRegistro': url,
                'fechaSubidaRegistro': datetime.now()
            })
            
            print(f"   ✅ Subido: {storage_path}")
            print(f"   🔗 URL: {url}")
            
            uploads.append({
                'archivo': archivo,
                'matricula': matricula,
                'url': url
            })
        else:
            print(f"   ❌ Arma no encontrada en Firestore")
    else:
        print(f"\n⚠️  No se pudo detectar matrícula: {archivo}")

# VERIFICACIÓN FINAL
print("\n" + "=" * 80)
print("🔍 VERIFICACIÓN FINAL")
print("=" * 80)

armas_final = cabo_ref.collection('armas').get()

print(f"\n✅ IVÁN CABO")
print(f"Total armas: {len(armas_final)}\n")

for arma_doc in armas_final:
    arma = arma_doc.to_dict()
    clase = arma.get('clase', 'N/A')
    matricula = arma.get('matricula', 'N/A')
    pdf = '✅ SÍ' if arma.get('documentoRegistro') else '❌ NO'
    print(f"  {pdf} - {clase:25} MAT: {matricula}")

# Resumen
con_pdf_final = sum(1 for arma in armas_final if arma.to_dict().get('documentoRegistro'))

print("\n" + "=" * 80)
print("📊 RESUMEN")
print("=" * 80)
print(f"\nPDFs subidos en esta sesión: {len(uploads)}")
print(f"PDFs completos en Firestore: {con_pdf_final}/5")

if con_pdf_final == 5:
    print("\n✅ TODOS LOS PDFs COMPLETOS")
else:
    print(f"\n⚠️  Faltan {5 - con_pdf_final} PDFs")

print("=" * 80)

#!/usr/bin/env python3
"""
Actualizar Firestore con folios y correcciones de Arechiga
17 Enero 2026
"""

import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('scripts/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("=" * 80)
print("ACTUALIZAR FIRESTORE - ARMAS DE ARECHIGA")
print("=" * 80)

arechiga_ref = db.collection('socios').document('arechiga@jogarplastics.com')
armas = arechiga_ref.collection('armas').get()

cambios = []

for arma_doc in armas:
    arma_data = arma_doc.to_dict()
    matricula = arma_data.get('matricula')
    
    updates = {}
    
    # K078999 - Agregar folio
    if matricula == 'K078999':
        if not arma_data.get('folio'):
            updates['folio'] = 'A3601943'
            cambios.append(f"✅ K078999 - FOLIO agregado: A3601943")
    
    # K084328 - Corregir modelo
    elif matricula == 'K084328':
        if arma_data.get('modelo') == 'P380':
            updates['modelo'] = 'LP380'
            cambios.append(f"✅ K084328 - Modelo corregido: P380 → LP380")
    
    # Aplicar cambios
    if updates:
        arma_doc.reference.update(updates)

print("\n📝 CAMBIOS APLICADOS EN FIRESTORE:")
for cambio in cambios:
    print(f"   {cambio}")

# Verificación final
print("\n" + "=" * 80)
print("🔍 VERIFICACIÓN FINAL - FIRESTORE")
print("=" * 80)

armas_final = arechiga_ref.collection('armas').get()
print(f"\n✅ MARIA FERNANDA ARECHIGA (arechiga@jogarplastics.com)")
print(f"Total armas: {len(armas_final)}")

for arma_doc in armas_final:
    arma = arma_doc.to_dict()
    folio = arma.get('folio', '')
    folio_display = folio if folio else '⚠️ PENDIENTE'
    print(f"   • {arma.get('clase', 'N/A'):20} {arma.get('marca', 'N/A'):20} {arma.get('modelo', 'N/A'):10} MAT: {arma.get('matricula', 'N/A'):15} FOLIO: {folio_display}")

print("\n" + "=" * 80)
print("✅ FIRESTORE ACTUALIZADO")
print("=" * 80)
print("\n⚠️  C647155 (CZ P07) - FOLIO aún pendiente")
print("=" * 80)

#!/usr/bin/env python3
"""
Sincronizar Firestore con Excel Maestro
17 Enero 2026

CAMBIOS A APLICAR EN FIRESTORE:
1. JOAQUIN GARDONI:
   - Agregar Shadow 2 DP25087
   - TRANSFERIR K078999 a Arechiga (eliminar de Gardoni)
   - TRANSFERIR K084328 a Arechiga (eliminar de Gardoni)
   
2. MARIA FERNANDA ARECHIGA:
   - Agregar K084328 (transferida desde Gardoni)
   - Agregar K078999 (transferida desde Gardoni)
   - Agregar CZ P07 C647155 (nueva)
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import sys

# Inicializar Firebase Admin SDK
cred = credentials.Certificate('scripts/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("=" * 80)
print("SINCRONIZACIÓN FIRESTORE ↔ EXCEL MAESTRO")
print("17 Enero 2026")
print("=" * 80)

# Referencias
gardoni_ref = db.collection('socios').document('jrgardoni@gmail.com')
arechiga_ref = db.collection('socios').document('arechiga@jogarplastics.com')

# ============================================================================
# PARTE 1: AGREGAR SHADOW 2 DP25087 A GARDONI
# ============================================================================
print("\n1️⃣  JOAQUIN GARDONI - Agregar Shadow 2 DP25087")
print("=" * 80)

# Verificar si ya existe
armas_gardoni = gardoni_ref.collection('armas').get()
dp25087_existe = False

for arma_doc in armas_gardoni:
    arma = arma_doc.to_dict()
    if arma.get('matricula') == 'DP25087':
        dp25087_existe = True
        print("⚠️  Shadow 2 DP25087 ya existe en Firestore para Gardoni")
        break

if not dp25087_existe:
    print("➕ Agregando Shadow 2 DP25087 a Gardoni...")
    nueva_arma_gardoni = {
        'clase': 'PISTOLA',
        'calibre': '.380"',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'CZ SHADOW 2',
        'matricula': 'DP25087',
        'folio': '',  # Se agregará cuando esté disponible
        'modalidad': 'tiro',
        'fechaRegistro': datetime.now()
    }
    
    gardoni_ref.collection('armas').add(nueva_arma_gardoni)
    print("✅ Shadow 2 DP25087 agregada exitosamente")

# ============================================================================
# PARTE 2: TRANSFERIR K078999 Y K084328 DE GARDONI A ARECHIGA
# ============================================================================
print("\n2️⃣  TRANSFERENCIA DE ARMAS: Gardoni → Arechiga")
print("=" * 80)

# Buscar y transferir K078999
print("\n🔄 Transferencia K078999...")
k078999_doc = None
k078999_data = None

for arma_doc in armas_gardoni:
    arma = arma_doc.to_dict()
    if arma.get('matricula') == 'K078999':
        k078999_doc = arma_doc
        k078999_data = arma
        print(f"   Encontrada en Gardoni: {arma['clase']} {arma['marca']} {arma.get('modelo', 'N/A')}")
        break

if k078999_data:
    # Agregar a Arechiga
    print("   ➕ Agregando a Arechiga...")
    k078999_arechiga = {
        'clase': k078999_data['clase'],
        'calibre': k078999_data.get('calibre', '.380" AUTO'),
        'marca': k078999_data['marca'],
        'modelo': k078999_data.get('modelo', 'LP380'),
        'matricula': 'K078999',
        'folio': '',  # PENDIENTE
        'modalidad': k078999_data.get('modalidad', 'caza'),
        'fechaRegistro': datetime.now(),
        'transferidaDesde': 'jrgardoni@gmail.com',
        'fechaTransferencia': datetime.now()
    }
    arechiga_ref.collection('armas').add(k078999_arechiga)
    print("   ✅ K078999 agregada a Arechiga")
    
    # Eliminar de Gardoni
    print("   🗑️  Eliminando de Gardoni...")
    k078999_doc.reference.delete()
    print("   ✅ K078999 eliminada de Gardoni")
else:
    print("   ⚠️  K078999 no encontrada en Gardoni (puede que ya fue transferida)")

# Buscar y transferir K084328
print("\n🔄 Transferencia K084328...")
k084328_doc = None
k084328_data = None

# Refrescar lista de armas de Gardoni
armas_gardoni = gardoni_ref.collection('armas').get()

for arma_doc in armas_gardoni:
    arma = arma_doc.to_dict()
    if arma.get('matricula') == 'K084328':
        k084328_doc = arma_doc
        k084328_data = arma
        print(f"   Encontrada en Gardoni: {arma['clase']} {arma['marca']} {arma.get('modelo', 'N/A')}")
        break

if k084328_data:
    # Agregar a Arechiga
    print("   ➕ Agregando a Arechiga...")
    k084328_arechiga = {
        'clase': k084328_data['clase'],
        'calibre': k084328_data.get('calibre', '0.380"'),
        'marca': k084328_data['marca'],
        'modelo': k084328_data.get('modelo', 'P380'),
        'matricula': 'K084328',
        'folio': k084328_data.get('folio', 'A3714371'),
        'modalidad': k084328_data.get('modalidad', 'caza'),
        'fechaRegistro': datetime.now(),
        'transferidaDesde': 'jrgardoni@gmail.com',
        'fechaTransferencia': datetime.now()
    }
    arechiga_ref.collection('armas').add(k084328_arechiga)
    print("   ✅ K084328 agregada a Arechiga")
    
    # Eliminar de Gardoni
    print("   🗑️  Eliminando de Gardoni...")
    k084328_doc.reference.delete()
    print("   ✅ K084328 eliminada de Gardoni")
else:
    print("   ⚠️  K084328 no encontrada en Gardoni (puede que ya fue transferida)")

# ============================================================================
# PARTE 3: AGREGAR CZ P07 C647155 A ARECHIGA
# ============================================================================
print("\n3️⃣  MARIA FERNANDA ARECHIGA - Agregar CZ P07 C647155")
print("=" * 80)

# Verificar si ya existe
armas_arechiga = arechiga_ref.collection('armas').get()
c647155_existe = False

for arma_doc in armas_arechiga:
    arma = arma_doc.to_dict()
    if arma.get('matricula') == 'C647155':
        c647155_existe = True
        print("⚠️  CZ P07 C647155 ya existe en Firestore para Arechiga")
        break

if not c647155_existe:
    print("➕ Agregando CZ P07 C647155 a Arechiga...")
    nueva_arma_arechiga = {
        'clase': 'PISTOLA',
        'calibre': '.380"',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'CZ P07',
        'matricula': 'C647155',
        'folio': '',  # PENDIENTE
        'modalidad': 'caza',
        'fechaRegistro': datetime.now()
    }
    
    arechiga_ref.collection('armas').add(nueva_arma_arechiga)
    print("✅ CZ P07 C647155 agregada exitosamente")

# ============================================================================
# PARTE 4: ACTUALIZAR TOTALES DE ARMAS
# ============================================================================
print("\n4️⃣  ACTUALIZAR TOTALES DE ARMAS")
print("=" * 80)

# Actualizar total de Gardoni
armas_gardoni_final = gardoni_ref.collection('armas').get()
total_gardoni = len(armas_gardoni_final)
gardoni_ref.update({'totalArmas': total_gardoni})
print(f"✅ Gardoni - Total armas actualizado: {total_gardoni}")

# Actualizar total de Arechiga
armas_arechiga_final = arechiga_ref.collection('armas').get()
total_arechiga = len(armas_arechiga_final)
arechiga_ref.update({'totalArmas': total_arechiga})
print(f"✅ Arechiga - Total armas actualizado: {total_arechiga}")

# ============================================================================
# VERIFICACIÓN FINAL
# ============================================================================
print("\n" + "=" * 80)
print("🔍 VERIFICACIÓN FINAL")
print("=" * 80)

print("\n✅ JOAQUIN GARDONI (jrgardoni@gmail.com):")
print(f"   Total armas: {total_gardoni}")
for arma_doc in armas_gardoni_final:
    arma = arma_doc.to_dict()
    print(f"   • {arma.get('clase', 'N/A'):20} {arma.get('marca', 'N/A'):20} MAT: {arma.get('matricula', 'N/A')}")

print("\n✅ MARIA FERNANDA ARECHIGA (arechiga@jogarplastics.com):")
print(f"   Total armas: {total_arechiga}")
for arma_doc in armas_arechiga_final:
    arma = arma_doc.to_dict()
    folio = arma.get('folio', '')
    folio_status = '⚠️ PENDIENTE' if not folio else folio
    print(f"   • {arma.get('clase', 'N/A'):20} {arma.get('marca', 'N/A'):20} MAT: {arma.get('matricula', 'N/A'):15} FOLIO: {folio_status}")

print("\n" + "=" * 80)
print("✅ SINCRONIZACIÓN COMPLETADA")
print("=" * 80)
print("\n📊 RESUMEN:")
print(f"   • Gardoni: {total_gardoni} armas")
print(f"   • Arechiga: {total_arechiga} armas")
print("\n⚠️  PENDIENTE: Agregar folios de armas de Arechiga (C647155 y K078999)")
print("=" * 80)

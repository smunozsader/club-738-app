#!/usr/bin/env python3
"""
Agregar 2 armas nuevas de Iván Cabo a Firestore
17 Enero 2026

ARMAS NUEVAS:
1. ESCOPETA 12 GA RETAY GORDION 73-H21YT-001717
2. PISTOLA .380" CZ SHADOW 2 FP40104
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Inicializar Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate('scripts/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("=" * 80)
print("AGREGAR ARMAS NUEVAS DE IVÁN CABO")
print("17 Enero 2026")
print("=" * 80)

cabo_ref = db.collection('socios').document('ivancabo@gmail.com')

# Verificar estado actual
print("\n📊 Estado actual de Iván Cabo:")
armas_actuales = cabo_ref.collection('armas').get()
print(f"Total armas ANTES: {len(armas_actuales)}")

for arma_doc in armas_actuales:
    arma = arma_doc.to_dict()
    print(f"   • {arma.get('clase', 'N/A'):25} {arma.get('marca', 'N/A'):20} MAT: {arma.get('matricula', 'N/A')}")

# Verificar si ya existen las nuevas armas
matriculas_existentes = [arma.to_dict().get('matricula') for arma in armas_actuales]

print("\n" + "=" * 80)
print("AGREGANDO ARMAS NUEVAS")
print("=" * 80)

# Arma 1: ESCOPETA RETAY GORDION
if '73-H21YT-001717' not in matriculas_existentes:
    print("\n➕ Agregando: ESCOPETA RETAY GORDION 73-H21YT-001717")
    arma_1 = {
        'clase': 'ESCOPETA',
        'calibre': '12 GA',
        'marca': 'RETAY',
        'modelo': 'GORDION',
        'matricula': '73-H21YT-001717',
        'folio': 'A3905284',
        'modalidad': 'caza',
        'fechaRegistro': datetime.now()
    }
    cabo_ref.collection('armas').add(arma_1)
    print("✅ ESCOPETA RETAY GORDION agregada")
else:
    print("\n⚠️  ESCOPETA 73-H21YT-001717 ya existe")

# Arma 2: PISTOLA CZ SHADOW 2
if 'FP40104' not in matriculas_existentes:
    print("\n➕ Agregando: PISTOLA CZ SHADOW 2 FP40104")
    arma_2 = {
        'clase': 'PISTOLA',
        'calibre': '.380"',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'SHADOW 2',
        'matricula': 'FP40104',
        'folio': 'A3901317',
        'modalidad': 'tiro',
        'fechaRegistro': datetime.now()
    }
    cabo_ref.collection('armas').add(arma_2)
    print("✅ PISTOLA CZ SHADOW 2 agregada")
else:
    print("\n⚠️  PISTOLA FP40104 ya existe")

# Actualizar total de armas
armas_final = cabo_ref.collection('armas').get()
total = len(armas_final)
cabo_ref.update({'totalArmas': total})

print("\n" + "=" * 80)
print("🔍 VERIFICACIÓN FINAL")
print("=" * 80)

print(f"\n✅ IVÁN CABO (ivancabo@gmail.com)")
print(f"Total armas: {total}")

for arma_doc in armas_final:
    arma = arma_doc.to_dict()
    print(f"   • {arma.get('clase', 'N/A'):25} {arma.get('marca', 'N/A'):20} MAT: {arma.get('matricula', 'N/A'):20} FOLIO: {arma.get('folio', 'N/A')}")

print("\n" + "=" * 80)
print("✅ ACTUALIZACIÓN COMPLETADA")
print("=" * 80)
print(f"📊 Total armas de Iván Cabo: {total}")
print("=" * 80)

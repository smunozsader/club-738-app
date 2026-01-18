#!/usr/bin/env python3
"""
Verificar solicitudes de transferencia/baja de armas en Firestore
17 Enero 2026
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Inicializar Firebase Admin SDK
cred = credentials.Certificate('scripts/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("=" * 80)
print("VERIFICACIÓN DE SOLICITUDES DE TRANSFERENCIA/BAJA DE ARMAS")
print("17 Enero 2026")
print("=" * 80)

# Buscar solicitudes de Gardoni
print("\n🔍 Buscando solicitudes de JOAQUIN GARDONI (jrgardoni@gmail.com)...")
gardoni_ref = db.collection('socios').document('jrgardoni@gmail.com')

# Verificar subcolecciones de bajas
bajas_gardoni = gardoni_ref.collection('bajas_arsenal').get()
print(f"\n📋 Solicitudes de BAJA encontradas para Gardoni: {len(bajas_gardoni)}")

if bajas_gardoni:
    for baja in bajas_gardoni:
        data = baja.to_dict()
        print(f"\n   ID: {baja.id}")
        print(f"   Estado: {data.get('estado', 'N/A')}")
        print(f"   Fecha solicitud: {data.get('fechaSolicitud', 'N/A')}")
        print(f"   Armas:")
        armas = data.get('armas', [])
        for arma in armas:
            print(f"      • {arma.get('clase', 'N/A')} {arma.get('marca', 'N/A')} MAT: {arma.get('matricula', 'N/A')}")
            print(f"        Motivo: {arma.get('motivoBaja', 'N/A')}")
            if arma.get('motivoBaja') == 'transferencia':
                print(f"        → Transferir a: {arma.get('nuevoTitular', 'N/A')}")

# Buscar solicitudes de Arechiga
print("\n" + "=" * 80)
print("\n🔍 Buscando solicitudes de MARIA FERNANDA ARECHIGA (arechiga@jogarplastics.com)...")
arechiga_ref = db.collection('socios').document('arechiga@jogarplastics.com')

# Verificar subcolecciones de altas
altas_arechiga = arechiga_ref.collection('altas_arsenal').get()
print(f"\n📋 Solicitudes de ALTA encontradas para Arechiga: {len(altas_arechiga)}")

if altas_arechiga:
    for alta in altas_arechiga:
        data = alta.to_dict()
        print(f"\n   ID: {alta.id}")
        print(f"   Estado: {data.get('estado', 'N/A')}")
        print(f"   Fecha solicitud: {data.get('fechaSolicitud', 'N/A')}")
        print(f"   Armas:")
        armas = data.get('armas', [])
        for arma in armas:
            print(f"      • {arma.get('clase', 'N/A')} {arma.get('marca', 'N/A')} MAT: {arma.get('matricula', 'N/A')}")
            print(f"        Origen: {arma.get('origenArma', 'N/A')}")

# Verificar armas actuales en Firestore
print("\n" + "=" * 80)
print("\n📊 ARMAS ACTUALES EN FIRESTORE")
print("=" * 80)

print("\n✅ JOAQUIN GARDONI:")
armas_gardoni = gardoni_ref.collection('armas').get()
print(f"   Total armas en Firestore: {len(armas_gardoni)}")
for arma_doc in armas_gardoni:
    arma = arma_doc.to_dict()
    print(f"   • {arma.get('clase', 'N/A'):20} {arma.get('marca', 'N/A'):20} MAT: {arma.get('matricula', 'N/A')}")

print("\n✅ MARIA FERNANDA ARECHIGA:")
armas_arechiga = arechiga_ref.collection('armas').get()
print(f"   Total armas en Firestore: {len(armas_arechiga)}")
if armas_arechiga:
    for arma_doc in armas_arechiga:
        arma = arma_doc.to_dict()
        print(f"   • {arma.get('clase', 'N/A'):20} {arma.get('marca', 'N/A'):20} MAT: {arma.get('matricula', 'N/A')}")
else:
    print("   ⚠️ SIN ARMAS EN FIRESTORE")

# Buscar K078999 y K084328 en toda la base de datos
print("\n" + "=" * 80)
print("\n🔍 BUSCANDO K078999 Y K084328 EN FIRESTORE")
print("=" * 80)

# Buscar en todos los socios
todos_socios = db.collection('socios').get()

for socio_doc in todos_socios:
    email = socio_doc.id
    armas = socio_doc.reference.collection('armas').get()
    
    for arma_doc in armas:
        arma = arma_doc.to_dict()
        matricula = arma.get('matricula', '')
        
        if matricula in ['K078999', 'K084328']:
            print(f"\n📍 {matricula} encontrada:")
            print(f"   Propietario: {socio_doc.to_dict().get('nombre', 'N/A')} ({email})")
            print(f"   Clase: {arma.get('clase', 'N/A')}")
            print(f"   Marca: {arma.get('marca', 'N/A')}")
            print(f"   Modelo: {arma.get('modelo', 'N/A')}")

print("\n" + "=" * 80)
print("✅ VERIFICACIÓN COMPLETADA")
print("=" * 80)

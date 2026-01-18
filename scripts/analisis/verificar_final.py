#!/usr/bin/env python3
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('scripts/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

print('=' * 80)
print('VERIFICACIÓN FINAL - ARECHIGA')
print('=' * 80)

arechiga_ref = db.collection('socios').document('arechiga@jogarplastics.com')
armas = arechiga_ref.collection('armas').get()

print(f'\n✅ MARIA FERNANDA ARECHIGA')
print(f'Total armas: {len(armas)}\n')

for arma_doc in armas:
    arma = arma_doc.to_dict()
    print(f"  • {arma.get('clase', 'N/A'):20} {arma.get('marca', 'N/A'):20} {arma.get('modelo', 'N/A'):10}")
    print(f"    MAT: {arma.get('matricula', 'N/A'):15} FOLIO: {arma.get('folio', '⚠️ PENDIENTE')}")
    pdf_status = '✅ Subido' if arma.get('documentoRegistro') else '❌ Falta'
    print(f"    PDF: {pdf_status}\n")

print('=' * 80)
print('VERIFICACIÓN FINAL - GARDONI DP25087')
print('=' * 80)

gardoni_ref = db.collection('socios').document('jrgardoni@gmail.com')
dp25087 = gardoni_ref.collection('armas').where('matricula', '==', 'DP25087').get()

if dp25087:
    arma = dp25087[0].to_dict()
    print(f"\n✅ JOAQUIN GARDONI - Shadow 2 DP25087")
    print(f"  FOLIO: {arma.get('folio', 'N/A')}")
    pdf_status = '✅ Subido' if arma.get('documentoRegistro') else '❌ Falta'
    print(f"  PDF: {pdf_status}")
    if arma.get('documentoRegistro'):
        print(f"  URL: {arma['documentoRegistro']}")

print('\n' + '=' * 80)

#!/usr/bin/env python3
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('scripts/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

print('=' * 80)
print('VERIFICACIÓN PDFs RFA - JOAQUIN GARDONI')
print('=' * 80)

gardoni_ref = db.collection('socios').document('jrgardoni@gmail.com')
armas = gardoni_ref.collection('armas').get()

print(f'\n✅ JOAQUIN RODOLFO GARDONI NUÑEZ')
print(f'Total armas: {len(armas)}\n')

sin_pdf = []
con_pdf = []

for arma_doc in armas:
    arma = arma_doc.to_dict()
    matricula = arma.get('matricula', 'N/A')
    clase = arma.get('clase', 'N/A')
    marca = arma.get('marca', 'N/A')
    modelo = arma.get('modelo', 'N/A')
    tiene_pdf = arma.get('documentoRegistro')
    
    if tiene_pdf:
        con_pdf.append(matricula)
        print(f"✅ {clase:20} {marca:20} {modelo:15} MAT: {matricula:15} - PDF RFA: SÍ")
    else:
        sin_pdf.append(matricula)
        print(f"❌ {clase:20} {marca:20} {modelo:15} MAT: {matricula:15} - PDF RFA: NO")

print('\n' + '=' * 80)
print('RESUMEN')
print('=' * 80)
print(f'\n✅ Con PDF RFA: {len(con_pdf)}/{len(armas)}')
for mat in con_pdf:
    print(f'   • {mat}')

print(f'\n❌ Sin PDF RFA: {len(sin_pdf)}/{len(armas)}')
for mat in sin_pdf:
    print(f'   • {mat}')

print('\n' + '=' * 80)

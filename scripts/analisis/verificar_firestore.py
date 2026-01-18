#!/usr/bin/env python3
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Inicializar Firebase
cred = credentials.Certificate('scripts/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print("=" * 100)
print("VERIFICACIÓN DE DATOS: ARCHIVO MAESTRO vs FIRESTORE")
print("=" * 100)
print()

# Cargar archivo maestro
maestro = pd.read_excel('data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx')

def verificar_socio(email, nombre):
    print("=" * 100)
    print(f"VERIFICANDO: {nombre}")
    print(f"Email: {email}")
    print("=" * 100)
    
    # Datos en Excel
    print("\n📁 ARCHIVO MAESTRO EXCEL:")
    excel_data = maestro[maestro['EMAIL'] == email]
    if len(excel_data) > 0:
        print(f"  Total armas: {len(excel_data)}")
        for idx, row in excel_data.iterrows():
            mat = str(row['MATRÍCULA']).strip() if pd.notna(row['MATRÍCULA']) else 'SIN MATRÍCULA'
            print(f"  ✓ {row['CLASE']:12} {row.get('CALIBRE', 'N/A'):10} {row.get('MARCA', 'N/A'):15} {row.get('MODELO', 'N/A'):25} MAT: {mat}")
    else:
        print("  ❌ NO ENCONTRADO EN EXCEL")
    
    # Datos en Firestore
    print("\n🔥 FIRESTORE (PORTAL):")
    try:
        # Obtener datos del socio
        socio_ref = db.collection('socios').document(email)
        socio_doc = socio_ref.get()
        
        if socio_doc.exists:
            socio_data = socio_doc.to_dict()
            print(f"  Nombre: {socio_data.get('nombre', 'N/A')}")
            print(f"  CURP: {socio_data.get('curp', 'N/A')}")
            print(f"  Total armas registradas: {socio_data.get('totalArmas', 0)}")
            
            # Obtener armas
            armas_ref = socio_ref.collection('armas')
            armas = armas_ref.stream()
            
            armas_list = []
            for arma in armas:
                armas_list.append(arma.to_dict())
            
            print(f"  Armas en colección: {len(armas_list)}")
            for arma in sorted(armas_list, key=lambda x: x.get('clase', '')):
                mat = arma.get('matricula', 'SIN MATRÍCULA')
                print(f"  ✓ {arma.get('clase', 'N/A'):12} {arma.get('calibre', 'N/A'):10} {arma.get('marca', 'N/A'):15} {arma.get('modelo', 'N/A'):25} MAT: {mat}")
                
        else:
            print("  ❌ SOCIO NO ENCONTRADO EN FIRESTORE")
    
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    # Comparación
    print("\n📊 COMPARACIÓN:")
    excel_count = len(excel_data)
    firestore_count = len(armas_list) if socio_doc.exists else 0
    
    if excel_count == firestore_count:
        print(f"  ✅ Coinciden: {excel_count} armas en ambos lados")
    else:
        print(f"  ⚠️ DISCREPANCIA: Excel={excel_count}, Firestore={firestore_count}")
    
    print()

# Verificar los tres socios
verificar_socio('jrgardoni@gmail.com', 'JOAQUIN GARDONI')
verificar_socio('arechiga@jogarplastics.com', 'MARIA FERNANDA GUADALUPE ARECHIGA RAMOS')
verificar_socio('ivancabo@gmail.com', 'IVAN TSUIS CABO TORRES')

print("=" * 100)
print("FIN DE VERIFICACIÓN")
print("=" * 100)

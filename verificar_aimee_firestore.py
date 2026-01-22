#!/usr/bin/env python3

from google.cloud import firestore
import os

# Asegurar que la variable de entorno esté configurada
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Applications/club-738-web/scripts/serviceAccountKey.json'

# Conectar a Firestore
db_fs = firestore.Client()

# Email del socio nuevo
email = "oso.guigam@gmail.com"

print("=" * 80)
print(f"BUSCANDO EN FIRESTORE: socios/{email.lower()}")
print("=" * 80)

try:
    socio_doc = db_fs.collection('socios').document(email.lower()).get()
    
    if socio_doc.exists:
        print("\n✅ DOCUMENTO ENCONTRADO EN FIRESTORE\n")
        datos = socio_doc.to_dict()
        
        # Mostrar todos los campos
        for clave, valor in sorted(datos.items()):
            if clave not in ['pagos', 'petas', 'armas']:  # Omitir subcollections
                print(f"{clave:35} | {valor}")
        
        # Verificar si tienen armas
        armas = list(db_fs.collection('socios').document(email.lower()).collection('armas').stream())
        print(f"\n{'armasCount':35} | {len(armas)}")
        
    else:
        print("\n❌ DOCUMENTO NO ENCONTRADO EN FIRESTORE")
        print(f"\nEl documento socios/{email.lower()} NO existe\n")
        print("Datos esperados en Firestore:")
        print("  - credencial: 236")
        print("  - nombre: LUIS FERNANDO GUILLERMO GAMBOA")
        print("  - email: oso.guigam@gmail.com")
        print("  - curp: GUGL750204HYNLMS04")
        print("  - domicilio: Calle 32 x 9 Cedro, Tablaje 23222, Loc. Tixcuytun, Mérida, YUCATÁN")
        print("  - armasCount: 0")
        
except Exception as e:
    print(f"\nError: {type(e).__name__}: {e}")

import firebase_admin as admin
from firebase_admin import credentials, firestore
import json
from pathlib import Path

# Initialize Firebase Admin
serviceAccountPath = Path(__file__).parent / 'scripts' / 'serviceAccountKey.json'
serviceAccount = credentials.Certificate(str(serviceAccountPath))

app = admin.initialize_app(serviceAccount)
db = firestore.client()

email = "sysaventas@hotmail.com"

print("=" * 150)
print(f"📋 VERIFICACIÓN FIRESTORE: {email}")
print("=" * 150)

# Obtener documento del socio
socio_ref = db.collection('socios').document(email)
socio_doc = socio_ref.get()

if socio_doc.exists:
    socio_data = socio_doc.to_dict()
    print(f"\n✅ SOCIO EN FIRESTORE:")
    print(f"   Credencial: {socio_data.get('credencial')}")
    print(f"   Nombre: {socio_data.get('nombre')}")
    print(f"   Email: {socio_data.get('email')}")
    print(f"   Total Armas: {socio_data.get('armasCount', 0)}\n")
    
    # Obtener armas del subcollection
    armas_collection = socio_ref.collection('armas')
    armas_docs = armas_collection.stream()
    
    armas_list = []
    blaser_found = False
    
    for arma_doc in armas_docs:
        arma_data = arma_doc.to_dict()
        arma_id = arma_doc.id
        
        armas_list.append({
            'id': arma_id,
            'data': arma_data
        })
        
        # Verificar si es el BLASER R8
        if arma_data.get('marca') == 'BLASER' and arma_data.get('modelo') == 'R8':
            blaser_found = True
            print(f"🔍 BLASER R8 ENCONTRADO EN FIRESTORE:")
            print(f"   Document ID: {arma_id}")
            print(f"   CLASE:      {arma_data.get('clase')}")
            print(f"   CALIBRE:    {arma_data.get('calibre')}")
            print(f"   MARCA:      {arma_data.get('marca')}")
            print(f"   MODELO:     {arma_data.get('modelo')}")
            print(f"   MATRÍCULA:  {arma_data.get('matricula')}")
            print(f"   FOLIO:      {arma_data.get('folio')}")
            print(f"   MODALIDAD:  {arma_data.get('modalidad')}\n")
    
    if not blaser_found:
        print(f"❌ BLASER R8 NO ENCONTRADO EN FIRESTORE\n")
    
    # Listar todas las armas
    print(f"📊 TOTAL ARMAS EN FIRESTORE: {len(armas_list)}\n")
    if len(armas_list) > 0:
        print("   Listado:")
        for arma in armas_list:
            data = arma['data']
            print(f"   • {data.get('clase'):20} | {data.get('marca'):15} {data.get('modelo'):15} | {data.get('folio')}")
else:
    print(f"\n❌ SOCIO NO ENCONTRADO EN FIRESTORE: {email}")

print("=" * 150)

admin.delete_app(app)

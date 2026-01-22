import firebase_admin as admin
from firebase_admin import credentials, firestore
from pathlib import Path

# Initialize Firebase
serviceAccountPath = Path(__file__).parent / 'scripts' / 'serviceAccountKey.json'
serviceAccount = credentials.Certificate(str(serviceAccountPath))

app = admin.initialize_app(serviceAccount)
db = firestore.client()

email = "jgheredia@hotmail.com"

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
    print(f"   Total Armas (armasCount): {socio_data.get('armasCount', 'NO TIENE')}")
    print(f"   CURP: {socio_data.get('curp')}\n")
    
    # Obtener armas del subcollection
    armas_collection = socio_ref.collection('armas')
    armas_docs = list(armas_collection.stream())
    
    print(f"🔫 ARMAS EN FIRESTORE: {len(armas_docs)} documentos\n")
    
    if len(armas_docs) > 0:
        for i, arma_doc in enumerate(armas_docs, 1):
            arma_data = arma_doc.to_dict()
            print(f"   #{i} {arma_data.get('clase'):20} | {arma_data.get('marca'):15} {arma_data.get('modelo'):20} | {arma_data.get('folio')}")
    else:
        print("   ⚠️  SIN ARMAS EN FIRESTORE")
else:
    print(f"\n❌ SOCIO NO ENCONTRADO EN FIRESTORE: {email}")

print("=" * 150)

admin.delete_app(app)

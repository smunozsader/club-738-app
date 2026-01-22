import firebase_admin
from firebase_admin import credentials, firestore
import json

# Inicializar Firebase
cred = credentials.Certificate('scripts/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Buscar Luis Fernando Guillermo Gamboa
email_luis = 'oso.guigam@gmail.com'
print("="*60)
print(f"VERIFICANDO LUIS FERNANDO: {email_luis}")
print("="*60)

doc_luis = db.collection('socios').document(email_luis.lower()).get()
if doc_luis.exists:
    data = doc_luis.to_dict()
    print(f"\nDocumento base:")
    print(f"  Nombre: {data.get('nombre', '?')}")
    print(f"  Credencial: {data.get('credencial', '?')}")
    print(f"\nrenovacion2026:")
    print(json.dumps(data.get('renovacion2026', {}), indent=2, default=str))
    print(f"\nMembresia2026:")
    print(json.dumps(data.get('membresia2026', {}), indent=2, default=str))
else:
    print("NO ENCONTRADO EN FIRESTORE")

# Buscar Eduardo Jose Arzamendi Montejo
email_eduardo = 'mayayuc3006@gmail.com'
print("\n" + "="*60)
print(f"VERIFICANDO EDUARDO ARZAMENDI: {email_eduardo}")
print("="*60)

doc_eduardo = db.collection('socios').document(email_eduardo.lower()).get()
if doc_eduardo.exists:
    data = doc_eduardo.to_dict()
    print(f"\nDocumento base:")
    print(f"  Nombre: {data.get('nombre', '?')}")
    print(f"  Credencial: {data.get('credencial', '?')}")
    print(f"\nrenovacion2026:")
    print(json.dumps(data.get('renovacion2026', {}), indent=2, default=str))
    print(f"\nMembresia2026:")
    print(json.dumps(data.get('membresia2026', {}), indent=2, default=str))
else:
    print("NO ENCONTRADO EN FIRESTORE")

firebase_admin.delete_app(firebase_admin.get_app())

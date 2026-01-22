import firebase_admin as admin
from firebase_admin import credentials, firestore
from pathlib import Path
import json

# Initialize Firebase
serviceAccountPath = Path(__file__).parent / 'scripts' / 'serviceAccountKey.json'
serviceAccount = credentials.Certificate(str(serviceAccountPath))

app = admin.initialize_app(serviceAccount)
db = firestore.client()

email = "sysaventas@hotmail.com"

print("=" * 150)
print(f"🔍 VERIFICACIÓN DETALLADA FIRESTORE: {email}")
print("=" * 150)

# Obtener documento del socio
socio_ref = db.collection('socios').document(email)
socio_doc = socio_ref.get()

print(f"\n📋 DOCUMENTO BASE:")
if socio_doc.exists:
    socio_data = socio_doc.to_dict()
    print(f"   ✅ Existe")
    print(f"   Credencial: {socio_data.get('credencial')}")
    print(f"   Nombre: {socio_data.get('nombre')}")
    print(f"   armasCount: {socio_data.get('armasCount')}")
else:
    print(f"   ❌ NO EXISTE")

# Obtener todas las armas
armas_collection = socio_ref.collection('armas')
armas_docs = list(armas_collection.stream())

print(f"\n🔫 ARMAS EN FIRESTORE: {len(armas_docs)} documentos\n")

for i, arma_doc in enumerate(armas_docs, 1):
    arma_data = arma_doc.to_dict()
    arma_id = arma_doc.id
    
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"ARMA #{i} - Document ID: {arma_id}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # Verificar cada campo
    campos = ['clase', 'calibre', 'marca', 'modelo', 'matricula', 'folio', 'modalidad', 'documentoRegistro']
    
    for campo in campos:
        valor = arma_data.get(campo)
        if valor:
            # Si es muy largo, truncar
            if isinstance(valor, str) and len(valor) > 80:
                print(f"   {campo:20} | {valor[:77]}...")
            else:
                print(f"   {campo:20} | {valor}")
        else:
            print(f"   {campo:20} | ⚠️  VACÍO/FALTA")
    
    print()

print("=" * 150)

# Comparación visual con el listado esperado
print("\n📊 LISTA ESPERADA vs FIRESTORE:\n")

expected = [
    ("RIFLE", "BLASER", "R8", "A 3421384"),
    ("RIFLE", "STEYRS", "1950", "B 462699"),
    ("RIFLE", "RUGER", "19/22", "A 3420314"),
    ("ESCOPETA", "BROWNING", "DUCKS UNLIMITED", "A 2673993"),
    ("RIFLE", "WINCHESTER", "70", "A 3502535"),
    ("RIFLE", "BANSNERs", "X-TREME SHEEP HUNTER", "B 405163"),
    ("RIFLE", "KIMBER", "82", "B 485374"),
    ("RIFLE", "CZ", "452 ZKM", "A 3420757"),
    ("ESCOPETA", "BROWNING", "B-80", "B 488347"),
    ("ESCOPETA", "BROWNING", "CITORI", "A 2673992"),
]

# Extraer datos de Firestore
firestore_armas = []
for arma_doc in armas_docs:
    arma_data = arma_doc.to_dict()
    firestore_armas.append((
        arma_data.get('clase'),
        arma_data.get('marca'),
        arma_data.get('modelo'),
        arma_data.get('folio')
    ))

# Comparar
print(f"{'#':3} {'ESPERADO':50} {'FIRESTORE':50} {'✓/✗':3}")
print("─" * 150)

for i, exp in enumerate(expected, 1):
    exp_str = f"{exp[0]:12} | {exp[1]:15} {exp[2]:20} | {exp[3]}"
    
    # Buscar en firestore
    found = False
    for fs in firestore_armas:
        if fs[0] == exp[0] and fs[1] == exp[1] and fs[2] == exp[2] and fs[3] == exp[3]:
            status = "✅"
            found = True
            break
    
    if not found:
        status = "❌"
    
    print(f"{i:3} {exp_str:50} {status:3}")

print("\n" + "=" * 150)

admin.delete_app(app)

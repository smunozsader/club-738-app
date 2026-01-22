import firebase_admin
from firebase_admin import credentials, firestore
import json

# Inicializar Firebase
cred = credentials.Certificate('scripts/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Lista de emails de los socios "pagados" que salieron con $0
emails_a_revisar = [
    'lalodenis23@hotmail.com',  # Eduardo Denis Herrera
    'mayayuc3006@gmail.com',     # Eduardo Jose Arzamendi
    'padilla_079@hotmail.com',   # Daniel de Jesus Padilla
    'rdesquens@yahoo.com.mx',    # Ricardo Alberto Desquens
    'rsoberanis11@hotmail.com',  # Ricardo Antonio Soberanis
    'squintal158@gmail.com',     # Santiago Alejandro Quintal
    'ivancabo@gmail.com'         # Ivan Tsuis Cabo
]

print("=" * 80)
print("VERIFICANDO SOCIOS 'PAGADOS' CON MONTO $0")
print("=" * 80)

for email in emails_a_revisar:
    doc = db.collection('socios').document(email.lower()).get()
    if doc.exists:
        data = doc.to_dict()
        nombre = data.get('nombre', '?')
        renovacion = data.get('renovacion2026', {})
        
        print(f"\n{nombre} ({email})")
        print(f"  estado: {renovacion.get('estado', '?')}")
        print(f"  monto: {renovacion.get('monto', 'FALTA')}")
        print(f"  montoTotal: {renovacion.get('montoTotal', 'FALTA')}")
        print(f"  montoPagado: {renovacion.get('montoPagado', 'FALTA')}")
        print(f"  cuotaClub: {renovacion.get('cuotaClub', 'FALTA')}")
        print(f"  cuotaFemeti: {renovacion.get('cuotaFemeti', 'FALTA')}")
        print(f"  pagos[]: {renovacion.get('pagos', 'FALTA')}")
        print(f"  desglose: {renovacion.get('desglose', 'FALTA')}")
    else:
        print(f"\nNO ENCONTRADO: {email}")

firebase_admin.delete_app(firebase_admin.get_app())

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Inicializar Firebase
cred = credentials.Certificate('scripts/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

email_ivan = 'ivancabo@gmail.com'

print("CORRIGIENDO: Ivan Tsuis Cabo Torres")
print("=" * 60)

# Datos correctos
fecha_pago = datetime(2026, 1, 15)

actualizacion = {
    'renovacion2026': {
        'estado': 'pagado',
        'monto': 6350,  # CORREGIDO: fue 9650 incorrectamente
        'montoTotal': 6350,
        'cuotaClub': 6000,
        'cuotaFemeti': 350,  # CORREGIDO: fue 3650 incorrectamente
        'desglose': {
            'cuota_anual': 6000,
            'femeti': 350
        },
        'pagos': [
            {
                'concepto': 'cuota_anual',
                'monto': 6000,
                'fecha': fecha_pago,
                'metodo': 'efectivo',
                'comprobante': ''
            },
            {
                'concepto': 'femeti',
                'monto': 350,
                'fecha': fecha_pago,
                'metodo': 'efectivo',
                'comprobante': ''
            }
        ],
        'fechaPago': fecha_pago,
        'metodoPago': 'efectivo',
        'exento': False,
        'motivoExencion': None,
        'notas': 'Corrección: cuota $6,000 + FEMETI $350 = $6,350 (NO $9,650)'
    }
}

db.collection('socios').document(email_ivan.lower()).update(actualizacion)

print(f"✅ CORREGIDO - Ivan Tsuis Cabo Torres")
print(f"   Monto ANTES: $9,650")
print(f"   Monto AHORA: $6,350")
print(f"   Cuota: $6,000")
print(f"   FEMETI: $350")

firebase_admin.delete_app(firebase_admin.get_app())

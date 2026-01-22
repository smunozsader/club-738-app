import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# Inicializar Firebase
cred = credentials.Certificate('scripts/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

email_eduardo = 'mayayuc3006@gmail.com'

print("CORRIGIENDO FIRESTORE: Eduardo José Arzamendi Montejo")
print("=" * 60)

# Obtener documento actual
doc = db.collection('socios').document(email_eduardo.lower()).get()
if doc.exists:
    data = doc.to_dict()
    print(f"Nombre: {data.get('nombre')}")
    print(f"\nEstado ACTUAL en renovacion2026:")
    print(f"  {data.get('renovacion2026', {})}")
    
    # CORREGIR: Pagó $6,000 de cuota_anual pero NO pagó $350 de FEMETI
    # Estado debe ser PAGADO con lo que SÍ pagó
    fecha_pago = datetime(2026, 1, 13)  # Fecha que aparece en Firestore
    
    actualizacion = {
        'renovacion2026': {
            'estado': 'pagado',  # PAGÓ lo que debía (sin FEMETI)
            'monto': 6000,  # Lo que realmente pagó
            'cuotaClub': 6000,
            'cuotaFemeti': 0,  # No pagó FEMETI
            'montoTotal': 6000,  # Total de lo que pagó
            'desglose': {
                'cuota_anual': 6000,
                'femeti': 0  # NO pagó FEMETI
            },
            'pagos': [
                {
                    'concepto': 'cuota_anual',
                    'monto': 6000,
                    'fecha': fecha_pago,
                    'metodo': 'efectivo',
                    'comprobante': 'REC-2026-01-7436'
                }
            ],
            'fechaPago': fecha_pago,
            'metodoPago': 'efectivo',
            'comprobante': 'REC-2026-01-7436',
            'exento': False,
            'motivoExencion': None,
            'notas': 'Socio PAGÓ $6,000 cuota anual. NO pagó $350 de FEMETI (opcional para renovación)'
        }
    }
    
    # Actualizar en Firestore
    db.collection('socios').document(email_eduardo.lower()).update(actualizacion)
    
    print(f"\n✅ ACTUALIZADO - Nuevo estado en renovacion2026:")
    print(f"  estado: pagado")
    print(f"  monto: 6000 (lo que pagó)")
    print(f"  cuotaClub: 6000")
    print(f"  cuotaFemeti: 0 (NO pagó)")
    print(f"  desglose: {{cuota_anual: 6000, femeti: 0}}")
    print(f"  montoTotal: 6000")
    print(f"  metodoPago: efectivo")
    print(f"  comprobante: REC-2026-01-7436")
    
    # Verificar que se escribió correctamente
    doc_verificar = db.collection('socios').document(email_eduardo.lower()).get()
    data_nueva = doc_verificar.to_dict()
    print(f"\n✅ VERIFICACIÓN POST-UPDATE:")
    print(f"  {data_nueva.get('renovacion2026', {})}")
else:
    print(f"ERROR: No encontrado {email_eduardo}")

firebase_admin.delete_app(firebase_admin.get_app())

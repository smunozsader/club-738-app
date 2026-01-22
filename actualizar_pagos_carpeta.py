import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Inicializar Firebase
cred = credentials.Certificate('scripts/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Datos de pagos según la carpeta del usuario
pagos_data = [
    {
        'nombre': 'SANTIAGO ALEJANDRO QUINTAL PAREDES',
        'email': 'squintal158@gmail.com',
        'fecha_pago': datetime(2025, 12, 31),
        'inscripcion': 0,
        'cuota': 6000,
        'femeti': 350,
        'total': 6350,
        'comprobante': ''
    },
    {
        'nombre': 'IVAN TSUIS CABO TORRES',
        'email': 'ivancabo@gmail.com',
        'fecha_pago': datetime(2026, 1, 15),
        'inscripcion': 0,
        'cuota': 6000,
        'femeti': 3650,
        'total': 9650,
        'comprobante': ''
    },
    {
        'nombre': 'RICARDO ALBERTO DESQUENS BONILLA',
        'email': 'ridesquens@yahoo.com.mx',
        'fecha_pago': datetime(2026, 1, 16),
        'inscripcion': 0,
        'cuota': 6000,
        'femeti': 350,
        'total': 6350,
        'comprobante': ''
    },
    {
        'nombre': 'EDUARDO DENIS HERRERA',
        'email': 'lalodenis23@hotmail.com',
        'fecha_pago': datetime(2026, 1, 18),
        'inscripcion': 0,
        'cuota': 6000,
        'femeti': 350,
        'total': 6350,
        'comprobante': ''
    },
    {
        'nombre': 'DANIEL DE JESUS PADILLA ROBLES',
        'email': 'padilla_079@hotmail.com',
        'fecha_pago': datetime(2026, 1, 18),
        'inscripcion': 0,
        'cuota': 6000,
        'femeti': 350,
        'total': 6350,
        'comprobante': ''
    },
    {
        'nombre': 'RICARDO ANTONIO SOBERANIS GAMBOA',
        'email': 'rsoberanis11@hotmail.com',
        'fecha_pago': datetime(2026, 1, 18),
        'inscripcion': 0,
        'cuota': 6000,
        'femeti': 350,
        'total': 6350,
        'comprobante': ''
    },
    {
        'nombre': 'ARIEL ANTONIO PAREDES CETINA',
        'email': 'lic.arielparedescetina@hotmail.com',
        'fecha_pago': datetime(2026, 1, 19),
        'inscripcion': 0,
        'cuota': 6500,
        'femeti': 350,
        'total': 6850,
        'comprobante': ''
    }
]

print("=" * 80)
print("ACTUALIZANDO FIRESTORE CON PAGOS DE LA CARPETA")
print("=" * 80)

total_recaudado = 0

for pago in pagos_data:
    email = pago['email'].lower()
    nombre = pago['nombre']
    
    # Construir array de pagos
    pagos_array = []
    if pago['inscripcion'] > 0:
        pagos_array.append({
            'concepto': 'inscripcion',
            'monto': pago['inscripcion'],
            'fecha': pago['fecha_pago'],
            'metodo': 'efectivo',
            'comprobante': pago['comprobante']
        })
    
    if pago['cuota'] > 0:
        pagos_array.append({
            'concepto': 'cuota_anual',
            'monto': pago['cuota'],
            'fecha': pago['fecha_pago'],
            'metodo': 'efectivo',
            'comprobante': pago['comprobante']
        })
    
    if pago['femeti'] > 0:
        # Diferenciar entre FEMETI nuevo vs renovación
        concepto_femeti = 'femeti_nuevo' if pago['inscripcion'] > 0 else 'femeti'
        pagos_array.append({
            'concepto': concepto_femeti,
            'monto': pago['femeti'],
            'fecha': pago['fecha_pago'],
            'metodo': 'efectivo',
            'comprobante': pago['comprobante']
        })
    
    # Actualizar en Firestore
    actualizacion = {
        'renovacion2026': {
            'estado': 'pagado',
            'monto': pago['total'],
            'montoTotal': pago['total'],
            'cuotaClub': pago['cuota'],
            'cuotaFemeti': pago['femeti'],
            'desglose': {
                'inscripcion': pago['inscripcion'],
                'cuota_anual': pago['cuota'],
                'femeti' if pago['inscripcion'] == 0 else 'femeti_nuevo': pago['femeti']
            },
            'pagos': pagos_array,
            'fechaPago': pago['fecha_pago'],
            'metodoPago': 'efectivo',
            'exento': False,
            'motivoExencion': None,
            'notas': 'Pago registrado según carpeta de cobranza'
        }
    }
    
    try:
        db.collection('socios').document(email).update(actualizacion)
        print(f"\n✅ {nombre}")
        print(f"   Email: {email}")
        print(f"   Fecha: {pago['fecha_pago'].strftime('%d/%m/%Y')}")
        print(f"   Total: ${pago['total']:,}")
        total_recaudado += pago['total']
    except Exception as e:
        print(f"\n❌ {nombre}: {str(e)}")

print("\n" + "=" * 80)
print(f"TOTAL RECAUDADO: ${total_recaudado:,}")
print("=" * 80)

firebase_admin.delete_app(firebase_admin.get_app())

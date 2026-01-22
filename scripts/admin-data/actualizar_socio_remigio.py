import pandas as pd
import firebase_admin as admin
from firebase_admin import credentials, firestore
from pathlib import Path

# Leer Excel
EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"
df = pd.read_excel(EXCEL_PATH)

# Buscar socio
email = "sysaventas@hotmail.com"
socio_excel = df[df['EMAIL'] == email]

if len(socio_excel) == 0:
    print(f"❌ Socio no encontrado: {email}")
    exit(1)

# Obtener datos del socio (primera fila)
primer_registro = socio_excel.iloc[0]

nombre = primer_registro['NOMBRE SOCIO']
credencial = str(primer_registro['No. CREDENCIAL']).strip()
curp = str(primer_registro.get('CURP', '')).strip() or None
telefono = str(primer_registro.get('TELÉFONO', '')).strip() or ''
domicilio = str(primer_registro.get('DOMICILIO', '')).strip() or ''

# Contar armas válidas del socio
armas_validas = socio_excel[(socio_excel['CLASE'].notna()) & (socio_excel['CLASE'] != '0')]
armas_count = len(armas_validas)

print("=" * 150)
print(f"📋 ACTUALIZAR DOCUMENTO BASE: {email}")
print("=" * 150)
print(f"\n📊 Datos del Excel:")
print(f"   Credencial: {credencial}")
print(f"   Nombre: {nombre}")
print(f"   Email: {email}")
print(f"   CURP: {curp}")
print(f"   Teléfono: {telefono}")
print(f"   Domicilio: {domicilio}")
print(f"   Total Armas: {armas_count}\n")

# Initialize Firebase
serviceAccountPath = Path(__file__).parent / 'scripts' / 'serviceAccountKey.json'
serviceAccount = credentials.Certificate(str(serviceAccountPath))

app = admin.initialize_app(serviceAccount)
db = firestore.client()

# Obtener documento actual
socio_ref = db.collection('socios').document(email)
socio_doc = socio_ref.get()

if socio_doc.exists:
    print(f"✅ Documento existe, actualizando...\n")
    current_data = socio_doc.to_dict()
else:
    print(f"⚠️  Documento no existe, creando...\n")
    current_data = {}

# Preparar datos para actualizar
update_data = {
    'nombre': nombre,
    'credencial': credencial,
    'email': email,
    'curp': curp,
    'telefono': telefono,
    'domicilio': domicilio,
    'armasCount': armas_count,
    'fechaAlta': current_data.get('fechaAlta'),
    'renovacion2026': current_data.get('renovacion2026', {'estado': 'pendiente', 'monto': 0}),
    'membresia2026': current_data.get('membresia2026', {'estado': 'pendiente', 'monto': 0})
}

# Actualizar documento
socio_ref.set(update_data, merge=True)

print(f"✅ Documento actualizado:")
print(f"   • credencial: {credencial}")
print(f"   • nombre: {nombre}")
print(f"   • armasCount: {armas_count}")
print(f"   • email: {email}")
print(f"   • curp: {curp}")
print(f"   • telefono: {telefono}")
print(f"   • domicilio: {domicilio}")

# Verificar
socio_verificar = socio_ref.get()
data_verificar = socio_verificar.to_dict()

print(f"\n✨ VERIFICACIÓN POST-UPDATE:")
print(f"   credencial: {data_verificar.get('credencial')}")
print(f"   armasCount: {data_verificar.get('armasCount')}")
print(f"   nombre: {data_verificar.get('nombre')}")

print("=" * 150)

admin.delete_app(app)

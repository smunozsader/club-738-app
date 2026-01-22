import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"
df = pd.read_excel(EXCEL_PATH)

# Buscar por nombre Gil Heredia
busqueda = df[df['NOMBRE SOCIO'].str.contains('GIL|HEREDIA', case=False, na=False)]

print("=" * 150)
print("📋 BÚSQUEDA: GIL HEREDIA")
print("=" * 150)

if len(busqueda) > 0:
    # Agrupar por email único para obtener información del socio
    socio_info = busqueda.iloc[0]
    
    email = socio_info['EMAIL']
    nombre = socio_info['NOMBRE SOCIO']
    credencial = socio_info['No. CREDENCIAL']
    curp = socio_info.get('CURP', '')
    
    print(f"\n✅ SOCIO ENCONTRADO:")
    print(f"   Credencial: {credencial}")
    print(f"   Nombre: {nombre}")
    print(f"   Email: {email}")
    print(f"   CURP: {curp}\n")
    
    # Buscar todas las armas del socio
    armas_socio = df[df['EMAIL'] == email]
    armas_validas = armas_socio[(armas_socio['CLASE'].notna()) & (armas_socio['CLASE'] != '0')]
    
    print(f"📊 TOTAL DE ARMAS REGISTRADAS: {len(armas_validas)}\n")
    
    if len(armas_validas) > 0:
        print("   Listado completo:")
        for idx, arma in armas_validas.iterrows():
            print(f"   • {arma['CLASE']:20} | {arma['MARCA']:15} {arma['MODELO']:20} | {arma['FOLIO']}")
    else:
        print("   ⚠️  Sin armas registradas")
else:
    print(f"\n❌ NO ENCONTRADO: GIL HEREDIA")

print("=" * 150)

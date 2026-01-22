import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"
df = pd.read_excel(EXCEL_PATH)

# Búsqueda específica: GIL HEREDIA HAGAR
print("=" * 150)
print("📋 BÚSQUEDA: GIL HEREDIA HAGAR")
print("=" * 150)

# Búsqueda exacta
busqueda = df[df['NOMBRE SOCIO'].str.contains('GIL.*HEREDIA.*HAGAR|HAGAR.*GIL.*HEREDIA', case=False, na=False, regex=True)]

if len(busqueda) == 0:
    # Intentar búsqueda más flexible
    busqueda = df[df['NOMBRE SOCIO'].str.contains('HEREDIA', case=False, na=False)]
    busqueda = busqueda[busqueda['NOMBRE SOCIO'].str.contains('HAGAR', case=False, na=False)]

if len(busqueda) == 0:
    # Intentar otra variación
    busqueda = df[df['NOMBRE SOCIO'].str.contains('HAGAR', case=False, na=False)]

if len(busqueda) > 0:
    print(f"\n✅ ENCONTRADOS: {len(busqueda)} registro(s)\n")
    
    for idx, row in busqueda.iterrows():
        email = row['EMAIL']
        nombre = row['NOMBRE SOCIO']
        credencial = row['No. CREDENCIAL']
        curp = row.get('CURP', '')
        
        print(f"Credencial: {credencial}")
        print(f"Nombre: {nombre}")
        print(f"Email: {email}")
        print(f"CURP: {curp}\n")
        
        # Armas del socio
        armas_socio = df[df['EMAIL'] == email]
        armas_validas = armas_socio[(armas_socio['CLASE'].notna()) & (armas_socio['CLASE'] != '0')]
        
        print(f"📊 TOTAL DE ARMAS REGISTRADAS: {len(armas_validas)}\n")
        
        if len(armas_validas) > 0:
            print("   Listado completo:")
            for idx_arma, arma in armas_validas.iterrows():
                print(f"   • {arma['CLASE']:20} | {arma['MARCA']:15} {arma['MODELO']:20} | {arma['FOLIO']}")
        else:
            print("   ⚠️  Sin armas registradas")
        print()
else:
    print(f"\n❌ NO ENCONTRADO: GIL HEREDIA HAGAR")

print("=" * 150)

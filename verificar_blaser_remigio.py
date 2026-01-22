import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"
df = pd.read_excel(EXCEL_PATH)

# Buscar registros para este socio
email = "sysaventas@hotmail.com"
socio = df[df['EMAIL'] == email]

print("=" * 150)
print(f"📋 VERIFICACIÓN: {email}")
print("=" * 150)

if len(socio) > 0:
    # Obtener nombre y credencial
    nombre = socio.iloc[0]['NOMBRE SOCIO']
    credencial = socio.iloc[0]['No. CREDENCIAL']
    curp = socio.iloc[0]['CURP']
    
    print(f"\n✅ SOCIO ENCONTRADO:")
    print(f"   Credencial: {credencial}")
    print(f"   Nombre: {nombre}")
    print(f"   Email: {email}")
    print(f"   CURP: {curp}\n")
    
    # Buscar armas del BLASER R8
    armas_blaser = df[(df['EMAIL'] == email) & (df['MARCA'] == 'BLASER') & (df['MODELO'] == 'R8')]
    
    print(f"🔍 BÚSQUEDA: BLASER R8")
    print(f"   Registros encontrados: {len(armas_blaser)}\n")
    
    if len(armas_blaser) > 0:
        for idx, arma in armas_blaser.iterrows():
            print(f"   CLASE:     {arma['CLASE']}")
            print(f"   CALIBRE:   {arma['CALIBRE']}")
            print(f"   MARCA:     {arma['MARCA']}")
            print(f"   MODELO:    {arma['MODELO']}")
            print(f"   MATRÍCULA: {arma['MATRÍCULA']}")
            print(f"   FOLIO:     {arma['FOLIO']}\n")
    else:
        print("   ❌ NO ENCONTRADO - Verificar detalles\n")
    
    # Mostrar todas las armas del socio
    armas_socio = df[df['EMAIL'] == email]
    armas_validas = armas_socio[(armas_socio['CLASE'].notna()) & (armas_socio['CLASE'] != '0')]
    
    print(f"📊 TOTAL DE ARMAS REGISTRADAS: {len(armas_validas)}\n")
    
    if len(armas_validas) > 0:
        print("   Listado completo:")
        for idx, arma in armas_validas.iterrows():
            print(f"   • {arma['CLASE']:20} | {arma['MARCA']:15} {arma['MODELO']:15} | {arma['FOLIO']}")
else:
    print(f"\n❌ NO ENCONTRADO: {email}")

print("=" * 150)

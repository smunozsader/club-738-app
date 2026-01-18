#!/usr/bin/env python3
import pandas as pd

# Cargar el archivo maestro (fuente de verdad según copilot instructions)
maestro = pd.read_excel('data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx')

print("=" * 80)
print("ARCHIVO MAESTRO: Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx")
print("=" * 80)
print(f"Total de registros: {len(maestro)}")
print()

# Buscar GARDONI
print("=" * 80)
print("JOAQUIN GARDONI")
print("=" * 80)
gardoni = maestro[maestro['NOMBRE DEL SOCIO'].str.contains('GARDONI', case=False, na=False)]
if len(gardoni) > 0:
    print(f"Total armas encontradas: {len(gardoni)}")
    print(f"Email: {gardoni.iloc[0]['EMAIL']}")
    print(f"Teléfono: {gardoni.iloc[0].get('TELEFONO', 'N/A')}")
    print()
    for idx, row in gardoni.iterrows():
        print(f"  {row['CLASE']:12} {row['CALIBRE']:8} {row['MARCA']:12} {row['MODELO']:25} MAT: {row['MATRÍCULA']}")
else:
    print("❌ NO ENCONTRADO")

print()

# Buscar ARECHIGA
print("=" * 80)
print("MARIA FERNANDA ARECHIGA")
print("=" * 80)
arechiga = maestro[maestro['NOMBRE DEL SOCIO'].str.contains('ARECHIGA', case=False, na=False)]
if len(arechiga) > 0:
    print(f"Total armas encontradas: {len(arechiga)}")
    print(f"Nombre completo: {arechiga.iloc[0]['NOMBRE DEL SOCIO']}")
    print(f"Email: {arechiga.iloc[0]['EMAIL']}")
    print(f"Teléfono: {arechiga.iloc[0].get('TELEFONO', 'N/A')}")
    print()
    for idx, row in arechiga.iterrows():
        print(f"  {row['CLASE']:12} {row['CALIBRE']:8} {row['MARCA']:12} {row['MODELO']:25} MAT: {row['MATRÍCULA']}")
else:
    print("❌ NO ENCONTRADO")

print()

# Buscar IVAN CABO
print("=" * 80)
print("IVAN CABO")
print("=" * 80)
cabo = maestro[maestro['NOMBRE DEL SOCIO'].str.contains('CABO', case=False, na=False)]
if len(cabo) > 0:
    print(f"Total armas encontradas: {len(cabo)}")
    print(f"Nombre completo: {cabo.iloc[0]['NOMBRE DEL SOCIO']}")
    print(f"Email: {cabo.iloc[0]['EMAIL']}")
    print(f"Teléfono: {cabo.iloc[0].get('TELEFONO', 'N/A')}")
    print()
    for idx, row in cabo.iterrows():
        print(f"  {row['CLASE']:12} {row['CALIBRE']:8} {row['MARCA']:12} {row['MODELO']:25} MAT: {row['MATRÍCULA']}")
else:
    print("❌ NO ENCONTRADO")

print()
print("=" * 80)

# Ahora verificar en el archivo de Iván Cabo actualizado
print("\nVERIFICANDO ARCHIVO ACTUALIZADO DE IVAN CABO...")
print("=" * 80)
try:
    cabo_nuevo = pd.read_excel('data/socios/RELACION IVAN CABO  738-01-DE-ENERO-2026_RELACION_ACTUALIZADA.xlsx')
    print(f"Archivo de Iván Cabo - Total registros: {len(cabo_nuevo)}")
    print(f"Columnas: {cabo_nuevo.columns.tolist()}")
    if 'NOMBRE DEL SOCIO' in cabo_nuevo.columns:
        cabo_data = cabo_nuevo[cabo_nuevo['NOMBRE DEL SOCIO'].str.contains('CABO', case=False, na=False)]
        if len(cabo_data) > 0:
            print(f"\nArmas de Iván Cabo en archivo actualizado: {len(cabo_data)}")
            for idx, row in cabo_data.iterrows():
                print(f"  {row.get('CLASE', 'N/A'):12} {row.get('CALIBRE', 'N/A'):8} {row.get('MARCA', 'N/A'):12} {row.get('MODELO', 'N/A'):25} MAT: {row.get('MATRÍCULA', 'N/A')}")
except Exception as e:
    print(f"Error al leer archivo de Iván Cabo: {e}")

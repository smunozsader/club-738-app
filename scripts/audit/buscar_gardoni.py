#!/usr/bin/env python3
"""Buscar armas de Joaquín Gardoni"""

import openpyxl
import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"

# Cargar con pandas
df = pd.read_excel(EXCEL_PATH)

# Buscar a Joaquín Gardoni (variantes del nombre)
search_terms = ['JOAQUIN', 'GARDONI', 'JOAQUÍN', 'GARDOÑI']

print("=" * 150)
print("🔍 BÚSQUEDA: JOAQUÍN GARDONI")
print("=" * 150)

# Buscar filas que contengan el nombre
mask = df['NOMBRE SOCIO'].astype(str).str.upper().str.contains('JOAQUIN', na=False) & \
       df['NOMBRE SOCIO'].astype(str).str.upper().str.contains('GARDONI', na=False)

gardoni_rows = df[mask]

if len(gardoni_rows) > 0:
    print(f"\n✅ Encontradas {len(gardoni_rows)} arma(s) para Joaquín Gardoni:\n")
    
    cols = ['No. CREDENCIAL', 'NOMBRE SOCIO', 'EMAIL', 'CLASE', 'CALIBRE', 'MARCA', 'MODELO', 'MATRÍCULA', 'FOLIO']
    result = gardoni_rows[cols].copy()
    
    for idx, row in result.iterrows():
        print(f"Arma #{idx+1}:")
        for col in cols:
            print(f"  {col}: {row[col]}")
        print()
    
    cred = gardoni_rows['No. CREDENCIAL'].iloc[0]
    email = gardoni_rows['EMAIL'].iloc[0]
    
    print(f"\n📋 RESUMEN:")
    print(f"   Credencial: {cred}")
    print(f"   Email: {email}")
    print(f"   Total de armas: {len(gardoni_rows)}")
else:
    print("❌ No encontrado con ese nombre exacto")
    print("\nBuscando variantes...")
    
    # Buscar solo por apellido
    mask2 = df['NOMBRE SOCIO'].astype(str).str.upper().str.contains('GARDONI', na=False)
    results = df[mask2]
    
    if len(results) > 0:
        print(f"\n✅ Encontrados {len(results)} socio(s) con apellido GARDONI:\n")
        print(results[['No. CREDENCIAL', 'NOMBRE SOCIO', 'EMAIL']].drop_duplicates().to_string(index=False))
    else:
        print("❌ No hay socios con apellido GARDONI en el sistema")

print("\n" + "=" * 150)

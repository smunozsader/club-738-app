#!/usr/bin/env python3
"""Extrae datos de FEMETI y genera archivo JS con todas las modalidades"""
import pandas as pd
import json

# Leer CSV
df = pd.read_csv('docs/MATRIZ_FEMETI_2026.csv')

print("=== MODALIDADES FEMETI 2026 ===\n")
modalidades = df['MODALIDAD'].unique()

for m in modalidades:
    count = len(df[df['MODALIDAD'] == m])
    estados = df[df['MODALIDAD'] == m]['ESTADO'].nunique()
    print(f"{m}: {count} eventos en {estados} estados")

# Generar estructura de datos
data = {}

for modalidad in modalidades:
    df_mod = df[df['MODALIDAD'] == modalidad]
    
    # Obtener tipo de arma y calibres de esta modalidad
    tipo_arma = df_mod['TIPO_ARMA'].iloc[0] if 'TIPO_ARMA' in df_mod.columns else ''
    calibres = df_mod['CALIBRES'].iloc[0] if 'CALIBRES' in df_mod.columns else ''
    
    estados_data = {}
    
    for estado in sorted(df_mod['ESTADO'].unique()):
        df_estado = df_mod[df_mod['ESTADO'] == estado]
        
        # Obtener clubes únicos con su lugar
        clubes = []
        for club in df_estado['CLUB'].unique():
            lugar = df_estado[df_estado['CLUB'] == club]['LUGAR'].iloc[0]
            clubes.append({
                'club': club,
                'domicilio': lugar
            })
        
        estados_data[estado] = {
            'clubes': clubes,
            'totalEventos': len(df_estado)
        }
    
    data[modalidad] = {
        'tipoArma': tipo_arma,
        'calibres': calibres,
        'estados': estados_data,
        'totalEstados': len(estados_data),
        'totalEventos': len(df_mod)
    }

print("\n=== ESTRUCTURA GENERADA ===\n")
for mod, info in data.items():
    print(f"\n{mod}:")
    print(f"  Tipo Arma: {info['tipoArma']}")
    print(f"  Calibres: {info['calibres']}")
    print(f"  Estados: {info['totalEstados']}")
    for estado, est_info in list(info['estados'].items())[:3]:
        print(f"    {estado}: {len(est_info['clubes'])} clubes")
        for c in est_info['clubes'][:2]:
            print(f"      - {c['club']} ({c['domicilio']})")

# Guardar como JSON para revisión
with open('docs/temp/femeti_data_full.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n\n✅ Datos guardados en docs/temp/femeti_data_full.json")

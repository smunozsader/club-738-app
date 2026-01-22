#!/usr/bin/env python3
import pandas as pd
import json

excel_file = '/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx'

try:
    # Leer el archivo Excel
    df = pd.read_excel(excel_file, sheet_name=0)
    
    print("=== INFORMACIÓN GENERAL ===")
    print(f"Total de filas: {len(df)}")
    print(f"Columnas: {list(df.columns)}\n")
    
    # Buscar filas que coincidan con Ricardo Soberanis
    print("=== BUSCANDO A RICARDO ANTONIO SOBERANIS GAMBOA ===\n")
    
    # Convertir todo a string para búsqueda
    df_str = df.astype(str)
    
    # Buscar en todas las columnas
    mask = df_str.apply(lambda x: x.str.contains('RICARDO|SOBERANIS|rsoberanis', case=False, na=False).any(), axis=1)
    matching_df = df[mask]
    
    print(f"Filas encontradas: {len(matching_df)}\n")
    
    if len(matching_df) > 0:
        # Mostrar todas las columnas
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', None)
        pd.set_option('display.max_colwidth', None)
        
        print(matching_df.to_string())
        print("\n=== DETALLE JSON ===")
        print(json.dumps(matching_df.to_dict(orient='records'), indent=2, ensure_ascii=False))
    else:
        print("No se encontraron coincidencias.")
        print("\nEjemplo de primeras filas:")
        print(df.head(3).to_string())

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

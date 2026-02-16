#!/usr/bin/env python3
"""
Analizar Excel de pagos 2025
"""
import pandas as pd

file_path = 'data/socios/2025. DONATIVOS Y relacion socios CLUB 738, con fecha de ingreso y antiguedad (para socio activo) y FEMETI (PETAS).xlsx'

# Leer primera hoja SIN header para ver estructura real
df_raw = pd.read_excel(file_path, sheet_name=0, header=None)
print('📊 ESTRUCTURA DEL EXCEL:')
print(f'Dimensiones: {df_raw.shape}')
print('\nPrimeras 5 filas (raw):')
print(df_raw.head(5).to_string())

# La fila 2 tiene los headers
headers = df_raw.iloc[2].tolist()
print(f'\nHeaders (fila 2): {headers}')

# Usar fila 2 como header, datos desde fila 3
df = df_raw.iloc[3:].copy()
df.columns = headers
df = df.reset_index(drop=True)

# Renombrar columnas para fácil acceso
col_map = {
    0: 'registro',
    1: 'nombre', 
    2: 'curp',
    3: 'armas_cortas',
    4: 'fecha_alta',
    5: 'antiguedad_dias',
    6: 'antiguedad_texto',
    7: 'inscripcion_2025',
    8: 'donativo_2025',
    9: 'femeti_2025',
    10: 'col10'
}

# Usar índices numéricos
df.columns = range(len(df.columns))

print(f'\nTotal socios: {len(df)}')

# Mostrar quienes pagaron donativo 2025 (columna 8)
print('\n' + '='*80)
print('✅ SOCIOS QUE PAGARON DONATIVO 2025:')
print('='*80)

pagaron = []
no_pagaron = []

for idx, row in df.iterrows():
    nombre = str(row[1]) if pd.notna(row[1]) else ''
    if not nombre or nombre == 'nan':
        continue
    
    donativo = row[8] if len(row) > 8 else None
    femeti = row[9] if len(row) > 9 else None
    fecha_alta = row[4] if len(row) > 4 else None
    armas = row[3] if len(row) > 3 else 0
    
    # Limpiar nombre (quitar número inicial)
    nombre_limpio = nombre
    if '. ' in nombre:
        nombre_limpio = nombre.split('. ', 1)[1] if '. ' in nombre else nombre
    
    socio = {
        'nombre': nombre_limpio,
        'nombre_raw': nombre,
        'fecha_alta': fecha_alta,
        'armas': armas,
        'donativo': donativo,
        'femeti': femeti
    }
    
    if pd.notna(donativo) and str(donativo) not in ['np', 'nan', 'NaN', '']:
        pagaron.append(socio)
    else:
        no_pagaron.append(socio)

# Mostrar pagaron
for s in pagaron:
    don = f"${s['donativo']}" if pd.notna(s['donativo']) else '-'
    fem = f"${s['femeti']}" if pd.notna(s['femeti']) else '-'
    print(f"  {s['nombre'][:42].ljust(42)} | {don.ljust(7)} | FEMETI: {fem}")

print(f'\nTotal pagaron 2025: {len(pagaron)}')

# Segunda hoja - los que no pagaron
print('\n' + '='*80)
print('❌ SEGUNDA HOJA: SOCIOS QUE NO PAGARON 2025')
print('='*80)
df2 = pd.read_excel(file_path, sheet_name=1)
print(df2.to_string())

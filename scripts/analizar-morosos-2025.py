#!/usr/bin/env python3
"""
Analizar morosos 2025 del Excel
"""
import pandas as pd

file_path = 'data/socios/2025. DONATIVOS Y relacion socios CLUB 738, con fecha de ingreso y antiguedad (para socio activo) y FEMETI (PETAS).xlsx'

# Leer sin header para ver todo
df = pd.read_excel(file_path, sheet_name=0, header=None)

print('📊 ANÁLISIS DE MOROSOS 2025')
print('='*80)

# Buscar quienes tienen 'np' o vacío en columna 8 (DONATIVO 2025)
morosos = []
pagaron = []

for i in range(3, len(df)):
    row = df.iloc[i]
    nombre = str(row[1]) if pd.notna(row[1]) else ''
    if not nombre or nombre == 'nan':
        continue
    
    donativo = row[8] if len(row) > 8 else None
    
    # Limpiar nombre
    nombre_limpio = nombre
    if '. ' in nombre:
        nombre_limpio = nombre.split('. ', 1)[1]
    
    if pd.isna(donativo) or str(donativo).lower() == 'np' or str(donativo).strip() == '':
        morosos.append(nombre_limpio)
    else:
        try:
            monto = float(donativo)
            pagaron.append({'nombre': nombre_limpio, 'monto': monto})
        except:
            morosos.append(nombre_limpio)

print(f'Total socios en lista: {len(morosos) + len(pagaron)}')
print(f'✅ Pagaron 2025: {len(pagaron)}')
print(f'❌ NO pagaron 2025 (morosos): {len(morosos)}')

print('\n' + '='*80)
print('❌ MOROSOS 2025 - NO PAGARON DONATIVO:')
print('='*80)
for i, m in enumerate(morosos, 1):
    print(f'{i:2}. {m}')

# Segunda hoja
print('\n' + '='*80)
print('📋 SEGUNDA HOJA: Lista de emails de morosos')
print('='*80)
df2 = pd.read_excel(file_path, sheet_name=1, header=None)
for i, row in df2.iterrows():
    val = row[2] if len(row) > 2 and pd.notna(row[2]) else None
    if val:
        print(f'  {val}')

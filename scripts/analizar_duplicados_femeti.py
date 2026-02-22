#!/usr/bin/env python3
"""
Analiza el Excel de FEMETI para identificar clubes con nombres duplicados/variantes.
Genera reporte de correcciones necesarias.
"""

import pandas as pd
import re
from collections import defaultdict

xlsx_path = 'data/referencias/femeti_tiradas_2026/PA 26 BLOQUEADO femeti.xlsx'
xlsx = pd.ExcelFile(xlsx_path)

modalidades = ['BLANCOS EN MOVIMIENTO', 'RECORRIDOS DE CAZA', 'TIRO OLIMPICO', 
               'SILUETAS METALICAS', 'TIRO PRACTICO', 'TIRO NEUMATICO']

def normalizar_para_comparar(s):
    """Normaliza string para comparación (sin tildes, puntuación, mayúsculas)"""
    s = s.upper()
    s = re.sub(r'[,.\s\-\"\']+', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    # Quitar tildes
    for orig, repl in [('Á','A'),('É','E'),('Í','I'),('Ó','O'),('Ú','U'),('Ñ','N')]:
        s = s.replace(orig, repl)
    # Quitar sufijos comunes
    s = re.sub(r'\s*(A\s*C|AC|S\s*C|SC)\s*$', '', s)
    return s

def extraer_clubes_de_hoja(df):
    """Extrae nombres de club de una hoja del Excel"""
    clubes = []
    
    # Buscar filas con "Club" en cualquier columna
    for idx, row in df.iterrows():
        for col in df.columns:
            val = str(row[col]) if pd.notna(row[col]) else ''
            # Detectar si es nombre de club
            if 'club' in val.lower() and len(val) > 15 and len(val) < 200:
                # Limpiar: solo primera línea, quitar extras
                lineas = val.split('\n')
                nombre = lineas[0].strip()
                if nombre and 'club' in nombre.lower():
                    clubes.append(nombre)
    
    return clubes

# Recopilar todos los nombres de club por modalidad
todos_clubes = []
clubes_por_modalidad = defaultdict(list)

print("Analizando hojas del Excel...")
for mod in modalidades:
    df = pd.read_excel(xlsx, sheet_name=mod, header=None)
    clubes = extraer_clubes_de_hoja(df)
    for club in clubes:
        todos_clubes.append((mod, club))
        clubes_por_modalidad[mod].append(club)
    print(f"  {mod}: {len(clubes)} menciones de clubes")

# Agrupar por nombre normalizado
grupos = defaultdict(list)
for mod, club in todos_clubes:
    key = normalizar_para_comparar(club)
    if len(key) > 10:
        grupos[key].append((mod, club))

# Identificar grupos con variantes
print("\n" + "="*80)
print("CLUBES CON VARIANTES A CORREGIR EN EL EXCEL")
print("="*80)

problemas = []
for key, variantes in sorted(grupos.items()):
    nombres_unicos = sorted(set(v[1] for v in variantes))
    if len(nombres_unicos) > 1:
        problemas.append({
            'key': key,
            'variantes': nombres_unicos,
            'modalidades': list(set(v[0] for v in variantes))
        })

for i, prob in enumerate(problemas, 1):
    print(f"\n🔴 PROBLEMA #{i}")
    print(f"   Modalidades: {', '.join(prob['modalidades'])}")
    print(f"   VARIANTES ENCONTRADAS:")
    for var in prob['variantes']:
        print(f"     → \"{var[:80]}\"")
    # Sugerir nombre canónico (el más largo/completo)
    sugerido = max(prob['variantes'], key=len)
    print(f"   ✅ SUGERIDO: \"{sugerido[:80]}\"")

print(f"\n{'='*80}")
print(f"RESUMEN: {len(problemas)} clubes necesitan unificación de nombre")
print("="*80)

# Generar lista de buscar/reemplazar para Excel
print("\n" + "="*80)
print("TABLA BUSCAR/REEMPLAZAR PARA EXCEL")
print("="*80)
print("\nBUSCAR (exacto) → REEMPLAZAR CON\n")

for prob in problemas:
    sugerido = max(prob['variantes'], key=len)
    for var in prob['variantes']:
        if var != sugerido:
            print(f'"{var}"')
            print(f'  → "{sugerido}"\n')

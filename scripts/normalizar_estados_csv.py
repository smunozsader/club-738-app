#!/usr/bin/env python3
"""
Script para normalizar nombres de estados en MATRIZ_FEMETI_2026.csv
"""
import csv
import shutil
from datetime import datetime

# Backup del archivo original
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy('docs/MATRIZ_FEMETI_2026.csv', f'docs/MATRIZ_FEMETI_2026_backup_{timestamp}.csv')
print(f"✅ Backup creado: MATRIZ_FEMETI_2026_backup_{timestamp}.csv")

# Mapeo de normalización de estados
NORMALIZACION = {
    # Abreviaciones
    'DGO.': 'DURANGO',
    'HGO.': 'HIDALGO',
    'JAL.': 'JALISCO',
    'CHIS.': 'CHIAPAS',
    'CHIH.': 'CHIHUAHUA',
    'VER.': 'VERACRUZ',
    'ZAC.': 'ZACATECAS',
    'Q ROO': 'QUINTANA ROO',
    'MÉX': 'ESTADO DE MÉXICO',
    
    # Sin acentos a Con acentos (forma oficial)
    'MEXICO': 'ESTADO DE MÉXICO',
    'MÉXICO': 'ESTADO DE MÉXICO',
    'NUEVO LEON': 'NUEVO LEÓN',
    'YUCATAN': 'YUCATÁN',
    'MICHOACAN': 'MICHOACÁN',
    'QUERETARO': 'QUERÉTARO',
    'SAN LUIS POTOSI': 'SAN LUIS POTOSÍ',
}

# Leer CSV
rows = []
with open('docs/MATRIZ_FEMETI_2026.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

# Contar cambios
cambios = {}
for row in rows:
    estado_original = row['ESTADO'].strip()
    estado_normalizado = NORMALIZACION.get(estado_original, estado_original)
    
    if estado_original != estado_normalizado:
        key = f"{estado_original} -> {estado_normalizado}"
        cambios[key] = cambios.get(key, 0) + 1
        row['ESTADO'] = estado_normalizado

# Mostrar cambios
print("\n📊 CAMBIOS REALIZADOS:")
for cambio, count in sorted(cambios.items()):
    print(f"  {cambio}: {count} registros")

print(f"\n📝 Total registros modificados: {sum(cambios.values())}")

# Guardar CSV normalizado
with open('docs/MATRIZ_FEMETI_2026.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("\n✅ CSV normalizado guardado exitosamente")

# Verificar estados finales
estados_finales = set(row['ESTADO'] for row in rows)
print("\n📋 ESTADOS NORMALIZADOS (únicos):")
for e in sorted(estados_finales):
    print(f"  - {e}")

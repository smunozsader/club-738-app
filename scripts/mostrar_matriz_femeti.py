#!/usr/bin/env python3
"""Muestra la matriz de la base de datos FEMETI 2026"""
import json

with open('data/referencias/femeti_tiradas_2026/competencias_femeti_2026.json', 'r') as f:
    data = json.load(f)

print("=" * 80)
print("MATRIZ BASE DE DATOS FEMETI 2026 - COMPETENCIAS NACIONALES")
print("=" * 80)

for modalidad, info in data.items():
    print(f"\n{'='*80}")
    print(f"MODALIDAD: {modalidad}")
    print(f"Tipo de arma: {info['tipo_arma']}")
    print(f"Calibres: {', '.join(info['calibres'])}")
    print(f"Descripción: {info.get('descripcion', 'N/A')}")
    print("-" * 80)
    
    total_eventos_modalidad = 0
    for estado, eventos in sorted(info['estados'].items()):
        total_eventos_modalidad += len(eventos)
        print(f"\n  📍 {estado} ({len(eventos)} eventos)")
        print("  " + "-" * 60)
        
        # Mostrar todos los eventos de este estado
        for i, evento in enumerate(eventos, 1):
            fecha = evento['fecha']
            club = evento['club'][:45] if len(evento['club']) > 45 else evento['club']
            lugar = evento['lugar']
            print(f"    {i:2}. {fecha} | {club}")
            print(f"        Lugar: {lugar}")
    
    print(f"\n  TOTAL {modalidad}: {total_eventos_modalidad} eventos")

# Resumen final
print("\n" + "=" * 80)
print("RESUMEN GENERAL")
print("=" * 80)
total_general = 0
for modalidad, info in data.items():
    total = sum(len(eventos) for eventos in info['estados'].values())
    estados = len(info['estados'])
    total_general += total
    print(f"  {modalidad}: {estados} estados, {total} eventos")

print(f"\nTOTAL GENERAL: {total_general} eventos en {len(data)} modalidades")
print("=" * 80)

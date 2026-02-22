#!/usr/bin/env python3
"""
Genera reportes MD y CSV de clubes FEMETI 2026 por Estado y Modalidad
"""
import json
import os

# Ruta base
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data/referencias/femeti_tiradas_2026")

with open(os.path.join(DATA_DIR, "competencias_femeti_2026.json")) as f:
    data = json.load(f)

# Reorganizar: ESTADO → MODALIDAD → CLUBES
por_estado = {}
for modalidad, mod_data in data.items():
    for estado, clubes in mod_data.get("estados", {}).items():
        if estado not in por_estado:
            por_estado[estado] = {}
        if modalidad not in por_estado[estado]:
            por_estado[estado][modalidad] = set()
        por_estado[estado][modalidad].update(clubes)

# Generar Markdown
md_lines = ["# FEMETI 2026 - Clubes por Estado y Modalidad", ""]
md_lines.append(f"**Total: {len(por_estado)} Estados**")
md_lines.append("")

for estado in sorted(por_estado.keys()):
    md_lines.append(f"## {estado}")
    md_lines.append("")
    for modalidad in sorted(por_estado[estado].keys()):
        clubes = sorted(por_estado[estado][modalidad])
        md_lines.append(f"### {modalidad}")
        md_lines.append("")
        for club in clubes:
            md_lines.append(f"- {club}")
        md_lines.append("")

with open(os.path.join(DATA_DIR, "FEMETI_2026_CLUBES.md"), "w") as f:
    f.write("\n".join(md_lines))

# Generar CSV
csv_lines = ["ESTADO,MODALIDAD,CLUB"]
for estado in sorted(por_estado.keys()):
    for modalidad in sorted(por_estado[estado].keys()):
        for club in sorted(por_estado[estado][modalidad]):
            club_escaped = club.replace('"', '""')
            csv_lines.append(f'"{estado}","{modalidad}","{club_escaped}"')

with open(os.path.join(DATA_DIR, "FEMETI_2026_CLUBES.csv"), "w") as f:
    f.write("\n".join(csv_lines))

print("✅ Archivos generados:")
print(f"   📋 {DATA_DIR}/FEMETI_2026_CLUBES.md")
print(f"   📊 {DATA_DIR}/FEMETI_2026_CLUBES.csv")
print(f"\n📈 Resumen: {len(por_estado)} estados, {len(csv_lines)-1} registros")

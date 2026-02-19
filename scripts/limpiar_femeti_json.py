#!/usr/bin/env python3
"""
Limpia y normaliza los estados del JSON FEMETI 2026
"""
import json

# Leer el JSON generado
with open('data/referencias/femeti_tiradas_2026/modalidades_estados_2026.json', 'r') as f:
    data = json.load(f)

# Normalizar estados (quitar duplicados por acentos)
norm_map = {
    'NUEVO LEÓN': 'NUEVO LEON',
    'MÉXICO': 'MEXICO',
    'YUCATÁN': 'YUCATAN',
    'TAMPS': 'TAMAULIPAS',
    'Q ROO': 'QUINTANA ROO',
    'DEFINIR': None  # Eliminar
}

for modalidad, info in data.items():
    estados_limpios = set()
    for estado in info['estados']:
        estado_norm = norm_map.get(estado, estado)
        if estado_norm:
            estados_limpios.add(estado_norm)
    info['estados'] = sorted(list(estados_limpios))

# Guardar versión limpia
with open('data/referencias/femeti_tiradas_2026/modalidades_femeti_2026.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('MODALIDADES FEMETI 2026 - VERSION FINAL')
print('='*60)
for modalidad, info in data.items():
    print(modalidad)
    calibres = ', '.join(info['calibres'])
    estados = ', '.join(info['estados'])
    print(f"  Arma: {info['tipo_arma']} | Calibres: {calibres}")
    print(f"  Estados ({len(info['estados'])}): {estados}")
    print()

print("JSON guardado en: data/referencias/femeti_tiradas_2026/modalidades_femeti_2026.json")

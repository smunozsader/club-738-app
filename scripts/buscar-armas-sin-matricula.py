#!/usr/bin/env python3
"""
Busca armas con matrícula vacía en el CSV normalizado.
"""

import csv

csv_path = "data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv"

print("🔍 Buscando armas sin matrícula...\n")

armas_sin_matricula = []

with open(csv_path, 'r', encoding='utf-8') as f:
    lector = csv.reader(f)
    next(lector)  # Saltar header
    
    for idx, fila in enumerate(lector, start=2):  # Empezar en 2 (línea 1 es header)
        email = fila[14] if len(fila) > 14 else ''
        nombre = fila[3] if len(fila) > 3 else ''
        matricula = fila[19] if len(fila) > 19 else ''
        clase = fila[15] if len(fila) > 15 else ''
        calibre = fila[16] if len(fila) > 16 else ''
        marca = fila[17] if len(fila) > 17 else ''
        modelo = fila[18] if len(fila) > 18 else ''
        folio = fila[20] if len(fila) > 20 else ''
        
        if not matricula or matricula.strip() == '':
            armas_sin_matricula.append({
                'linea': idx,
                'email': email,
                'nombre': nombre,
                'clase': clase,
                'calibre': calibre,
                'marca': marca,
                'modelo': modelo,
                'folio': folio
            })

print(f"❌ Encontradas {len(armas_sin_matricula)} armas sin matrícula:\n")

for arma in armas_sin_matricula:
    print(f"📍 Línea {arma['linea']} del CSV")
    print(f"   Socio: {arma['nombre']}")
    print(f"   Email: {arma['email']}")
    print(f"   Arma: {arma['clase']} {arma['calibre']} {arma['marca']} {arma['modelo']}")
    print(f"   Folio: {arma['folio']}")
    print(f"   ⚠️  MATRÍCULA: [VACÍA]\n")

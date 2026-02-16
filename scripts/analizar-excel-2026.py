#!/usr/bin/env python3
"""
Comparar Excel de pagos 2026 vs Firestore
"""

import pandas as pd
import json
from datetime import datetime

# Leer Excel - fila 0 es header
df = pd.read_excel('data/socios/2026. SOCIOS PAGARON ANUALIDAD Y FECHA (1).xlsx', header=0)

# Renombrar columnas para facilitar
df.columns = ['nombre', 'curp', 'domicilio', 'telefono', 'email', 'no_socio', 'consec', 
              'fecha_pago', 'inscripcion', 'cuota', 'femeti', 'total']

print("=" * 90)
print("📊 ANÁLISIS EXCEL DE PAGOS 2026")
print("=" * 90)

pagos_excel = []
sin_pago_excel = []

for idx, row in df.iterrows():
    nombre = str(row['nombre']).strip() if pd.notna(row['nombre']) else None
    if not nombre or nombre == 'nan' or 'numero de socios' in nombre.lower():
        continue
    
    email = str(row['email']).strip().lower() if pd.notna(row['email']) else None
    fecha = row['fecha_pago'] if pd.notna(row['fecha_pago']) else None
    inscripcion = float(row['inscripcion']) if pd.notna(row['inscripcion']) else 0
    cuota = float(row['cuota']) if pd.notna(row['cuota']) else 0
    femeti = float(row['femeti']) if pd.notna(row['femeti']) else 0
    total = float(row['total']) if pd.notna(row['total']) else 0
    
    # Formato fecha
    fecha_str = None
    if fecha:
        if isinstance(fecha, datetime):
            fecha_str = fecha.strftime('%Y-%m-%d')
        else:
            fecha_str = str(fecha)[:10]
    
    socio = {
        'nombre': nombre,
        'email': email,
        'fecha': fecha_str,
        'inscripcion': inscripcion,
        'cuota': cuota,
        'femeti': femeti,
        'total': total
    }
    
    if total > 0:
        pagos_excel.append(socio)
    else:
        sin_pago_excel.append(socio)

print(f"\n✅ SOCIOS CON PAGO EN EXCEL 2026: {len(pagos_excel)}\n")
print("-" * 90)
print(f"{'#':<3} {'Nombre':<40} {'Fecha':<12} {'Inscr':>8} {'Cuota':>8} {'FEMETI':>8} {'Total':>10}")
print("-" * 90)

total_inscripcion = 0
total_cuota = 0
total_femeti = 0
total_recaudado = 0

for i, p in enumerate(pagos_excel, 1):
    total_inscripcion += p['inscripcion']
    total_cuota += p['cuota']
    total_femeti += p['femeti']
    total_recaudado += p['total']
    
    print(f"{i:<3} {p['nombre'][:39]:<40} {p['fecha'] or 'N/A':<12} ${p['inscripcion']:>7,.0f} ${p['cuota']:>7,.0f} ${p['femeti']:>7,.0f} ${p['total']:>9,.0f}")

print("-" * 90)
print(f"{'TOTALES':<56} ${total_inscripcion:>7,.0f} ${total_cuota:>7,.0f} ${total_femeti:>7,.0f} ${total_recaudado:>9,.0f}")
print("=" * 90)

# Guardar para comparar con Firestore
with open('/tmp/pagos_excel_2026.json', 'w') as f:
    json.dump(pagos_excel, f, indent=2, ensure_ascii=False)

print(f"\n📁 Datos guardados en /tmp/pagos_excel_2026.json")
print(f"\n❌ Socios SIN pago en Excel: {len(sin_pago_excel)}")

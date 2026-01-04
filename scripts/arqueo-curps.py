#!/usr/bin/env python3
"""
Arqueo de CURPs: Compara archivos PDF contra Excel
"""

import openpyxl
import subprocess
import os
import re

# Cargar datos del Excel
wb = openpyxl.load_workbook('../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx')
sheet = wb.active

# Extraer socios únicos del Excel
excel_socios = {}
for row_num in range(2, sheet.max_row + 1):
    row = [cell.value for cell in sheet[row_num]]
    nombre = row[2]
    curp = str(row[3] or '').strip()
    email = row[7]
    if nombre and curp and email and 'TOTAL' not in str(row[5] or ''):
        key = email.lower()
        if key not in excel_socios:
            # Limpiar nombre (quitar número de credencial)
            nombre_limpio = nombre
            if nombre and nombre[0].isdigit():
                partes = nombre.split('. ', 1)
                if len(partes) > 1:
                    nombre_limpio = partes[1]
                else:
                    nombre_limpio = ' '.join(nombre.split()[1:])
            excel_socios[key] = {
                'nombre': nombre_limpio.strip(),
                'curp': curp.upper(),
                'email': email
            }

print(f"📊 Socios en Excel: {len(excel_socios)}")

# Listar archivos PDF en curp_socios
curp_dir = '../curp_socios'
archivos_curp = [f for f in os.listdir(curp_dir) if f.endswith('.pdf')]
print(f"📁 Archivos CURP: {len(archivos_curp)}")

# Crear mapeo de CURP -> email desde Excel
curp_to_email = {}
for email, data in excel_socios.items():
    curp_to_email[data['curp']] = email

# Verificar cada archivo
print("\n" + "=" * 80)
print("🔍 ARQUEO DE CURPs - COMPARANDO ARCHIVOS vs EXCEL")
print("=" * 80)

encontrados = []
no_encontrados = []

for archivo in sorted(archivos_curp):
    curp_archivo = archivo.replace('.pdf', '').upper()
    
    if curp_archivo in curp_to_email:
        email = curp_to_email[curp_archivo]
        encontrados.append({
            'curp': curp_archivo,
            'email': email,
            'nombre': excel_socios[email]['nombre']
        })
    else:
        no_encontrados.append(curp_archivo)

# Mostrar CURPs no encontrados en Excel
if no_encontrados:
    print("\n" + "=" * 80)
    print("❌ CURPs EN ARCHIVOS PDF QUE NO COINCIDEN CON EXCEL:")
    print("   (El archivo PDF tiene una CURP diferente a lo que dice el Excel)")
    print("=" * 80)
    
    for curp in no_encontrados:
        # Buscar CURP similar en Excel (primeros 10 caracteres)
        similar = [(c, curp_to_email[c]) for c in curp_to_email.keys() if c[:10] == curp[:10]]
        
        print(f"\n  📄 Archivo PDF: {curp}.pdf")
        
        if similar:
            for curp_excel, email in similar:
                nombre = excel_socios[email]['nombre']
                print(f"     Excel dice:  {curp_excel}")
                print(f"     Socio:       {nombre}")
                print(f"     Email:       {email}")
                
                # Mostrar diferencias caracter por caracter
                diffs = []
                for i, (a, b) in enumerate(zip(curp, curp_excel)):
                    if a != b:
                        diffs.append(f"pos {i}: archivo='{a}' vs excel='{b}'")
                if len(curp) != len(curp_excel):
                    diffs.append(f"longitud: archivo={len(curp)} vs excel={len(curp_excel)}")
                if diffs:
                    print(f"     ⚠️  Diferencias: {', '.join(diffs)}")
        else:
            # Buscar por nombre parcial
            print(f"     ⚠️  No hay CURP similar en Excel")

# Verificar CURPs en Excel sin archivo PDF
print("\n" + "=" * 80)
print("📂 CURPs EN EXCEL QUE NO TIENEN ARCHIVO PDF:")
print("=" * 80)

curps_archivos = set(a.replace('.pdf', '').upper() for a in archivos_curp)
curps_excel = set(curp_to_email.keys())
faltantes = curps_excel - curps_archivos

if faltantes:
    for curp in sorted(faltantes):
        email = curp_to_email[curp]
        nombre = excel_socios[email]['nombre']
        print(f"  {curp} → {nombre}")
else:
    print("  ✅ Todos los CURPs del Excel tienen archivo PDF")

# Ahora extraer datos de cada PDF para verificar contra Excel
print("\n" + "=" * 80)
print("🔬 VERIFICACIÓN DETALLADA: DATOS DEL PDF vs EXCEL")
print("=" * 80)

inconsistencias = []

for archivo in sorted(archivos_curp):
    curp_archivo = archivo.replace('.pdf', '').upper()
    filepath = os.path.join(curp_dir, archivo)
    
    try:
        result = subprocess.run(['pdftotext', '-layout', filepath, '-'], 
                              capture_output=True, text=True, timeout=10)
        texto = result.stdout
        
        # Extraer datos del PDF
        nombre_pdf = None
        curp_pdf = None
        
        lines = [l.strip() for l in texto.split('\n') if l.strip()]
        
        for i, line in enumerate(lines):
            # Buscar CURP en el PDF
            match = re.search(r'[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}', line)
            if match:
                curp_pdf = match.group()
            
            # El nombre suele estar después de "NOMBRE:" o en mayúsculas
            if 'NOMBRE' in line.upper() and ':' in line:
                nombre_pdf = line.split(':', 1)[1].strip()
        
        # Si encontramos CURP en el PDF, verificar que coincida con el nombre del archivo
        if curp_pdf and curp_pdf != curp_archivo:
            inconsistencias.append({
                'archivo': archivo,
                'curp_archivo': curp_archivo,
                'curp_pdf': curp_pdf,
                'tipo': 'CURP en PDF diferente al nombre del archivo'
            })
            
    except Exception as e:
        pass

if inconsistencias:
    print("\n⚠️  INCONSISTENCIAS ENCONTRADAS:")
    for inc in inconsistencias:
        print(f"\n  Archivo: {inc['archivo']}")
        print(f"  Problema: {inc['tipo']}")
        if 'curp_pdf' in inc:
            print(f"  CURP en archivo: {inc['curp_archivo']}")
            print(f"  CURP en PDF:     {inc['curp_pdf']}")

# Resumen final
print("\n" + "=" * 80)
print("📊 RESUMEN DEL ARQUEO")
print("=" * 80)
print(f"  📁 Archivos PDF:        {len(archivos_curp)}")
print(f"  📋 Socios en Excel:     {len(excel_socios)}")
print(f"  ✅ Coinciden exacto:    {len(encontrados)}")
print(f"  ❌ No coinciden:        {len(no_encontrados)}")
print(f"  📂 Faltan PDF:          {len(faltantes)}")
print(f"  ⚠️  Inconsistencias:    {len(inconsistencias)}")

if len(no_encontrados) > 0:
    print("\n" + "=" * 80)
    print("🔧 CORRECCIONES SUGERIDAS PARA EL EXCEL:")
    print("=" * 80)
    for curp in no_encontrados:
        similar = [(c, curp_to_email[c]) for c in curp_to_email.keys() if c[:10] == curp[:10]]
        if similar:
            for curp_excel, email in similar:
                nombre = excel_socios[email]['nombre']
                print(f"\n  {nombre}:")
                print(f"    Excel actual: {curp_excel}")
                print(f"    Corregir a:   {curp}")

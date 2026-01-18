#!/usr/bin/env python3
"""
Buscar armas de Arechiga en archivos Excel históricos
17 Enero 2026

BUSCANDO:
- C647155 (CZ P07) - FOLIO pendiente
- K078999 (Grand Power LP380) - FOLIO pendiente
"""

import openpyxl
import os

print("=" * 80)
print("BÚSQUEDA DE FOLIOS EN ARCHIVOS HISTÓRICOS")
print("17 Enero 2026")
print("=" * 80)

# Directorio de archivos históricos
historicos_dir = 'data/socios/referencia_historica'

# Matrículas a buscar
matriculas_buscar = ['C647155', 'K078999']

# Listar archivos Excel
archivos_excel = [f for f in os.listdir(historicos_dir) if f.endswith('.xlsx')]

print(f"\n📁 Archivos encontrados: {len(archivos_excel)}")
for archivo in archivos_excel:
    print(f"   • {archivo}")

print("\n" + "=" * 80)
print("🔍 BUSCANDO MATRÍCULAS...")
print("=" * 80)

resultados = {}

for archivo in archivos_excel:
    ruta_completa = os.path.join(historicos_dir, archivo)
    print(f"\n📄 Analizando: {archivo}")
    
    try:
        wb = openpyxl.load_workbook(ruta_completa)
        ws = wb.active
        
        for row in ws.iter_rows(min_row=2):
            # La columna de matrícula puede variar, buscar en varias posiciones
            for col_idx in range(len(row)):
                cell_value = row[col_idx].value
                
                if cell_value in matriculas_buscar:
                    matricula = cell_value
                    
                    # Intentar obtener datos de la fila
                    nombre = row[3].value if len(row) > 3 else None
                    email = row[13].value if len(row) > 13 else None
                    clase = row[14].value if len(row) > 14 else None
                    marca = row[16].value if len(row) > 16 else None
                    modelo = row[17].value if len(row) > 17 else None
                    folio = row[19].value if len(row) > 19 else None
                    
                    if matricula not in resultados:
                        resultados[matricula] = []
                    
                    resultados[matricula].append({
                        'archivo': archivo,
                        'nombre': nombre,
                        'email': email,
                        'clase': clase,
                        'marca': marca,
                        'modelo': modelo,
                        'folio': folio
                    })
                    
                    print(f"   ✅ ENCONTRADA: {matricula}")
                    print(f"      Propietario: {nombre} ({email})")
                    print(f"      Arma: {clase} {marca} {modelo}")
                    print(f"      FOLIO: {folio if folio else '❌ NO ENCONTRADO'}")
        
        wb.close()
        
    except Exception as e:
        print(f"   ⚠️ Error al leer archivo: {str(e)}")

# RESUMEN FINAL
print("\n" + "=" * 80)
print("📊 RESUMEN DE HALLAZGOS")
print("=" * 80)

for matricula in matriculas_buscar:
    print(f"\n🔍 Matrícula: {matricula}")
    
    if matricula in resultados and resultados[matricula]:
        print(f"   Encontrada en {len(resultados[matricula])} archivo(s):")
        
        for idx, resultado in enumerate(resultados[matricula], 1):
            print(f"\n   [{idx}] {resultado['archivo']}")
            print(f"       Propietario: {resultado['nombre']}")
            print(f"       Email: {resultado['email']}")
            print(f"       Arma: {resultado['clase']} {resultado['marca']} {resultado['modelo']}")
            
            if resultado['folio']:
                print(f"       ✅ FOLIO: {resultado['folio']}")
            else:
                print(f"       ❌ FOLIO: No encontrado")
    else:
        print("   ❌ NO ENCONTRADA en archivos históricos")

print("\n" + "=" * 80)
print("✅ BÚSQUEDA COMPLETADA")
print("=" * 80)

# Mostrar folios encontrados para actualización
print("\n📝 FOLIOS PARA ACTUALIZAR:")
folios_encontrados = False

for matricula in matriculas_buscar:
    if matricula in resultados:
        for resultado in resultados[matricula]:
            if resultado['folio']:
                print(f"   • {matricula} → FOLIO: {resultado['folio']}")
                folios_encontrados = True

if not folios_encontrados:
    print("   ⚠️ No se encontraron folios en archivos históricos")
    print("   📌 Los folios deberán obtenerse de los registros físicos RFA")

print("=" * 80)

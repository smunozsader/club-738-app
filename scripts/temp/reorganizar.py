#!/usr/bin/env python3
"""
Organizar archivos en scripts/ por función
"""
import os
import shutil
from pathlib import Path

# Mapeo de archivos a carpetas
mapeo = {
    'generacion': [
        'generar-', 'crear-', 'regenerar-', 'crear_pdfs',
        'convertir-', 'subir-', 'registrar-'
    ],
    'importacion': [
        'importar-', 'repoblar-', 'agregar-', 'sincronizar-',
        'actualizar-curps', 'actualizar-domicilios', 'actualizar-modalidad'
    ],
    'validacion': [
        'verificar-', 'verificar_', 'validar-', 'validar_',
        'auditar-', 'auditoria-', 'revisar-', 'revisar_',
        'inspeccionar-', 'comparar-', 'check-', 'check_'
    ],
    'limpieza': [
        'limpiar-', 'eliminar-', 'resetear-', 'corregir-',
        'fix-', 'corregir_'
    ],
    'analisis': [
        'arqueo-', 'arqueo_', 'buscar-', 'buscar_',
        'domicilios-', 'normalizar-', 'normalizar_',
        'separar-', 'identificar-'
    ],
    'email_whatsapp': [
        'enviar-', 'generar-mail', 'generar-mensajes',
        'generar-csv', 'generar-excel-wapi', 'generar-wapi',
        'generar-whatsapp', 'regenerar-csvs', 'regenerar-urls'
    ]
}

scripts_dir = Path('/Applications/club-738-web/scripts')
movidos = 0
no_movidos = []

print("🔧 Reorganizando scripts/...\n")

for archivo in sorted(scripts_dir.glob('*')):
    if not archivo.is_file() or archivo.name == 'README.md' or archivo.name == 'serviceAccountKey.json':
        continue
    
    # Buscar categoría
    categorizado = False
    for carpeta, prefijos in mapeo.items():
        for prefijo in prefijos:
            if archivo.name.lower().startswith(prefijo):
                destino = scripts_dir / carpeta / archivo.name
                try:
                    shutil.move(str(archivo), str(destino))
                    print(f"✓ {archivo.name:45} → {carpeta}/")
                    movidos += 1
                    categorizado = True
                    break
                except Exception as e:
                    print(f"✗ {archivo.name}: {e}")
        if categorizado:
            break
    
    if not categorizado:
        no_movidos.append(archivo.name)

print(f"\n📊 Resumen:")
print(f"   Movidos: {movidos}")
print(f"   No categorizados: {len(no_movidos)}")

if no_movidos:
    print(f"\n⚠️  Archivos sin categoría:")
    for f in no_movidos:
        print(f"   • {f}")

print(f"\n✅ Reorganización completada!")

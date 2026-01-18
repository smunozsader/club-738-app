#!/usr/bin/env python3
"""
Organizar scripts del root a subcarpetas
"""
import os
import shutil
from pathlib import Path

# Definir categorías
categorias = {
    'analisis': [
        'analisis_', 'analizar_', 'comparar_', 'verificar_', 'inspeccionar_',
        'arqueo_', 'buscar_', 'identificar_', 'leer_', 'extraer_', 'ver_'
    ],
    'actualizacion': [
        'actualizar_', 'agregar_', 'corregir_', 'crear_', 'fix_',
        'reasignar_', 'subir_', 'sincronizar_'
    ],
    'normalizacion': [
        'normalizar_', 'mostrar_normalizacion', 'verificacion_final',
        'verificar_comas', 'verificar_formatos'
    ],
    'migracion': ['migrar-'],
    'debug': ['debug-', 'check-', 'buscar-', 'check_']
}

root = Path('/Applications/club-738-web')
movidos = 0

print("🔧 Organizando scripts...\n")

for categoria, prefijos in categorias.items():
    carpeta_destino = root / 'scripts' / categoria
    carpeta_destino.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 {categoria}/")
    
    for archivo in root.glob('*'):
        if not archivo.is_file():
            continue
        
        for prefijo in prefijos:
            if archivo.name.startswith(prefijo):
                destino = carpeta_destino / archivo.name
                try:
                    shutil.move(str(archivo), str(destino))
                    print(f"   ✓ {archivo.name}")
                    movidos += 1
                except Exception as e:
                    print(f"   ✗ {archivo.name}: {e}")
                break

print(f"\n✅ {movidos} scripts organizados!")

# Listar archivos .py y .cjs que quedan en root
print("\n📋 Scripts restantes en root:")
restantes = list(root.glob('*.py')) + list(root.glob('*.cjs'))
if restantes:
    for f in restantes:
        print(f"   • {f.name}")
else:
    print("   (ninguno)")

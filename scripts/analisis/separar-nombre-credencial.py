#!/usr/bin/env python3
"""
Separa la columna "NOMBRE DEL SOCIO (No. CREDENCIAL)" en dos columnas:
1. No. CREDENCIAL (ej: "1", "30", "46")
2. NOMBRE DEL SOCIO (ej: "RICARDO JESÚS FERNÁNDEZ Y GASQUE")
"""

import csv
import re

def separar_nombre_credencial(texto):
    """
    Separa "1. RICARDO JESÚS FERNÁNDEZ Y GASQUE" en ("1", "RICARDO JESÚS FERNÁNDEZ Y GASQUE")
    """
    # Buscar patrón: número seguido de punto y espacio
    match = re.match(r'^(\d+)\.\s+(.+)$', texto)
    
    if match:
        numero = match.group(1)
        nombre = match.group(2).strip()
        return numero, nombre
    else:
        # Si no coincide el patrón, devolver vacío para número y todo el texto para nombre
        return '', texto.strip()

def procesar_csv(archivo_entrada, archivo_salida):
    """
    Lee CSV y separa la columna 3 (índice 2) en dos columnas.
    """
    filas_procesadas = 0
    
    print(f"📖 Leyendo: {archivo_entrada}")
    
    with open(archivo_entrada, 'r', encoding='utf-8') as f_in:
        with open(archivo_salida, 'w', encoding='utf-8', newline='') as f_out:
            lector = csv.reader(f_in)
            escritor = csv.writer(f_out)
            
            for idx, fila in enumerate(lector):
                if idx == 0:
                    # Header: reemplazar columna 3 por dos nuevas
                    nueva_fila = fila[:2] + ['No. CREDENCIAL', 'NOMBRE DEL SOCIO'] + fila[3:]
                    escritor.writerow(nueva_fila)
                    filas_procesadas += 1
                else:
                    # Separar columna 3 (índice 2)
                    nombre_completo = fila[2] if len(fila) > 2 else ''
                    numero, nombre = separar_nombre_credencial(nombre_completo)
                    
                    # Construir nueva fila: columnas 0-1, luego número y nombre, luego resto
                    nueva_fila = fila[:2] + [numero, nombre] + fila[3:]
                    escritor.writerow(nueva_fila)
                    filas_procesadas += 1
                    
                    # Mostrar muestra de las primeras 3
                    if idx <= 3:
                        print(f"   Fila {idx}: '{nombre_completo}' → No: '{numero}', Nombre: '{nombre}'")
    
    print(f"\n✅ Archivo procesado guardado en: {archivo_salida}")
    print(f"📊 Total de filas: {filas_procesadas}")

if __name__ == "__main__":
    archivo_entrada = "data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_NORMALIZADO.csv"
    archivo_salida = "data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv"
    
    procesar_csv(archivo_entrada, archivo_salida)
    print("\n✨ Listo! Ahora la columna está separada en No. CREDENCIAL y NOMBRE DEL SOCIO")

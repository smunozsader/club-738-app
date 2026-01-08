#!/usr/bin/env python3
"""
Normaliza CSV eliminando saltos de línea dentro de celdas.
Los saltos de línea (\n) dentro de campos CSV rompen el formato.
Este script los reemplaza por espacios.
"""

import csv
import sys

def normalizar_csv(archivo_entrada, archivo_salida):
    """
    Lee un CSV y elimina saltos de línea dentro de las celdas.
    
    Args:
        archivo_entrada: Path al CSV original
        archivo_salida: Path al CSV normalizado
    """
    filas_procesadas = 0
    celdas_modificadas = 0
    filas_eliminadas = 0
    
    print(f"📖 Leyendo: {archivo_entrada}")
    
    with open(archivo_entrada, 'r', encoding='utf-8') as f_in:
        with open(archivo_salida, 'w', encoding='utf-8', newline='') as f_out:
            # Leer CSV con manejo de saltos de línea
            lector = csv.reader(f_in)
            escritor = csv.writer(f_out)
            
            for fila in lector:
                fila_limpia = []
                for celda in fila:
                    # Reemplazar saltos de línea y retornos de carro por espacios
                    celda_limpia = celda.replace('\n', ' ').replace('\r', ' ')
                    
                    # Eliminar espacios múltiples
                    while '  ' in celda_limpia:
                        celda_limpia = celda_limpia.replace('  ', ' ')
                    
                    celda_limpia = celda_limpia.strip()
                    
                    if celda_limpia != celda:
                        celdas_modificadas += 1
                    
                    fila_limpia.append(celda_limpia)
                
                # Eliminar columnas vacías al final (basura)
                while fila_limpia and fila_limpia[-1] == '':
                    fila_limpia.pop()
                
                # Saltar filas completamente vacías o solo con comas
                if not fila_limpia or all(celda == '' for celda in fila_limpia):
                    filas_eliminadas += 1
                    continue
                
                escritor.writerow(fila_limpia)
                filas_procesadas += 1
    
    print(f"✅ Archivo normalizado guardado en: {archivo_salida}")
    print(f"📊 Estadísticas:")
    print(f"   • Filas procesadas: {filas_procesadas}")
    print(f"   • Filas eliminadas (basura): {filas_eliminadas}")
    print(f"   • Celdas modificadas: {celdas_modificadas}")

if __name__ == "__main__":
    archivo_entrada = "data/socios/2025.31.12_RELACION_SOCIOS_ARMAS copia con direccion, para firebase.csv"
    archivo_salida = "data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_NORMALIZADO.csv"
    
    normalizar_csv(archivo_entrada, archivo_salida)
    print("\n✨ Listo! Ahora puedes abrir el archivo normalizado con Text Editor.")

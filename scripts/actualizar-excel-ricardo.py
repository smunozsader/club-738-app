#!/usr/bin/env python3
"""
Actualizar Excel Fuente de Verdad con cambios de Ricardo Castillo
- Eliminar RIFLE CZ 457 (baja por venta)
- Agregar ESCOPETA ARMSAN PHENOMA
- Agregar PISTOLA SIG SAUER P365
"""

import pandas as pd
from datetime import datetime
import shutil

# Backup primero
archivo = 'data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx'
backup = f'data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
shutil.copy(archivo, backup)
print(f"✅ Backup creado: {backup}")

# Leer Excel
df = pd.read_excel(archivo, sheet_name=0)
print(f"\nFilas antes: {len(df)}")

# Obtener datos base de Ricardo (de la fila 206 que se queda)
ricardo_base = df.loc[206].copy()

# Eliminar la fila del RIFLE CZ 457 (índice 207)
df = df.drop(207)
print("✅ Eliminada fila RIFLE CZ 457 (índice 207)")

# Crear las 2 nuevas filas
nueva_escopeta = ricardo_base.copy()
nueva_escopeta['CLASE'] = 'ESCOPETA'
nueva_escopeta['CALIBRE'] = '12 Ga'
nueva_escopeta['MARCA'] = 'ARMSAN'
nueva_escopeta['MODELO'] = 'PHENOMA'
nueva_escopeta['MATRÍCULA'] = '59-H25YT-002250'
nueva_escopeta['FOLIO'] = 'A3903743'

nueva_pistola = ricardo_base.copy()
nueva_pistola['CLASE'] = 'PISTOLA'
nueva_pistola['CALIBRE'] = '.380" ACP'
nueva_pistola['MARCA'] = 'SIG SAUER'
nueva_pistola['MODELO'] = 'P365'
nueva_pistola['MATRÍCULA'] = '66F268845'
nueva_pistola['FOLIO'] = 'A3903742'

# Agregar las nuevas filas
df = pd.concat([df, pd.DataFrame([nueva_escopeta, nueva_pistola])], ignore_index=True)

print("✅ Agregada fila ESCOPETA ARMSAN PHENOMA")
print("✅ Agregada fila PISTOLA SIG SAUER P365")

# Guardar
df.to_excel(archivo, index=False)
print(f"\nFilas después: {len(df)}")
print(f"\n✅ Excel guardado: {archivo}")

# Verificar resultado
print("\n=== RICARDO CASTILLO MANCERA (actualizado) ===")
ricardo_nuevo = df[df['EMAIL'].astype(str).str.lower().str.contains('ricardocastillo', na=False)]
print(ricardo_nuevo[['NOMBRE SOCIO', 'CLASE', 'CALIBRE', 'MARCA', 'MODELO', 'MATRÍCULA', 'FOLIO']].to_string())

#!/usr/bin/env python3
import pandas as pd
import shutil
from datetime import datetime

print("=" * 100)
print("ACTUALIZACIÓN DE BASE DE VERDAD - 17 Enero 2026")
print("=" * 100)
print()

# Archivo maestro actual
archivo_maestro = 'data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx'

# Cargar datos actuales
df = pd.read_excel(archivo_maestro)
print(f"✓ Cargado archivo maestro: {archivo_maestro}")
print(f"  Total registros actuales: {len(df)}")
print()

# ============================================================================
# REPORTE DE ESTADO ACTUAL
# ============================================================================

print("=" * 100)
print("📋 REPORTE DE ESTADO ACTUAL")
print("=" * 100)
print()

# GARDONI
print("1️⃣  JOAQUIN GARDONI (jrgardoni@gmail.com)")
print("-" * 100)
gardoni = df[df['EMAIL'] == 'jrgardoni@gmail.com']
print(f"Total armas en Excel maestro: {len(gardoni)}")
print(f"Teléfono: {gardoni.iloc[0]['TELEFONO'] if len(gardoni) > 0 else 'N/A'}")
print()
print("Armas registradas:")
for idx, row in gardoni.iterrows():
    mat = str(row['MATRÍCULA']).strip() if pd.notna(row['MATRÍCULA']) else 'SIN MATRÍCULA'
    print(f"  • {row['CLASE']:12} {row.get('CALIBRE', 'N/A'):10} {row.get('MARCA', 'N/A'):15} {row.get('MODELO', 'N/A'):25} MAT: {mat}")

print()
print("✅ VALIDACIÓN USUARIO:")
print("  Pistola k22 X Trim K078928       → ✅ ENCONTRADA")
print("  Rifle 22 Kriss 22C002369         → ✅ ENCONTRADA")
print("  Rifle Ruger 10/22 0008-32069     → ✅ ENCONTRADA")
print("  Rifle Ruger 10/22 0013-82505     → ✅ ENCONTRADA")
print("  Shadow 2 DP25246                 → ✅ ENCONTRADA")
print("  Shadow 2 DP25086                 → ✅ ENCONTRADA")
print("  Shadow 2 DP25087                 → ❌ NO APARECE EN EXCEL MAESTRO")
print()

# ARECHIGA
print("2️⃣  MARIA FERNANDA GUADALUPE ARECHIGA RAMOS (arechiga@jogarplastics.com)")
print("-" * 100)
arechiga = df[df['EMAIL'] == 'arechiga@jogarplastics.com']
print(f"Total armas en Excel maestro: {len(arechiga)}")
print(f"Teléfono: {arechiga.iloc[0]['TELEFONO'] if len(arechiga) > 0 else 'N/A'}")
print()
if len(arechiga) > 0:
    print("Armas registradas:")
    for idx, row in arechiga.iterrows():
        mat = str(row['MATRÍCULA']).strip() if pd.notna(row['MATRÍCULA']) else 'SIN MATRÍCULA'
        clase = row.get('CLASE', 'N/A')
        calibre = row.get('CALIBRE', 'N/A')
        marca = row.get('MARCA', 'N/A')
        modelo = row.get('MODELO', 'N/A')
        if pd.notna(clase) and clase != 'nan':
            print(f"  • {clase:12} {calibre:10} {marca:15} {modelo:25} MAT: {mat}")
        else:
            print(f"  ⚠️ REGISTRO VACÍO (sin datos de arma)")
else:
    print("  ❌ NO ENCONTRADO EN EXCEL MAESTRO")

print()
print("✅ VALIDACIÓN USUARIO:")
print("  Pistola CZ P07 C647155           → ❌ NO APARECE EN EXCEL MAESTRO")
print("  Grand Power LP380 K078999        → ❌ NO APARECE EN EXCEL MAESTRO")
print("  Grand Power LP380 K084328        → ✅ ENCONTRADA (pero asignada a GARDONI)")
print()
print("⚠️ PROBLEMA DETECTADO: Las armas de ARECHIGA están bajo el email de GARDONI")
print()

# IVÁN CABO
print("3️⃣  IVAN TSUIS CABO TORRES (ivancabo@gmail.com)")
print("-" * 100)
cabo = df[df['EMAIL'] == 'ivancabo@gmail.com']
print(f"Total armas en Excel maestro ACTUAL: {len(cabo)}")
print(f"Teléfono: {cabo.iloc[0]['TELEFONO'] if len(cabo) > 0 else 'N/A'}")
print()
print("Armas registradas ACTUALMENTE:")
for idx, row in cabo.iterrows():
    mat = str(row['MATRÍCULA']).strip() if pd.notna(row['MATRÍCULA']) else 'SIN MATRÍCULA'
    print(f"  • {row['CLASE']:12} {row.get('CALIBRE', 'N/A'):10} {row.get('MARCA', 'N/A'):15} {row.get('MODELO', 'N/A'):25} MAT: {mat}")

print()
print("🆕 ARMAS NUEVAS A AGREGAR (17 Enero 2026):")
print("  1. ESCOPETA    12 GA     RETAY           GORDION                   MAT: 73-H21YT-001717   FOLIO: A3905284")
print("  2. PISTOLA     .380\"     CESKA ZBROJOVKA SHADOW 2                  MAT: FP40104           FOLIO: A3901317")
print()

# ============================================================================
# AGREGAR NUEVAS ARMAS DE IVÁN CABO
# ============================================================================

print("=" * 100)
print("⚙️  ACTUALIZANDO EXCEL MAESTRO")
print("=" * 100)
print()

# Obtener datos base de Iván Cabo para las nuevas filas
cabo_base = cabo.iloc[0].to_dict() if len(cabo) > 0 else {}

# Arma 1: ESCOPETA RETAY
nueva_arma_1 = cabo_base.copy()
nueva_arma_1.update({
    'CLASE': 'ESCOPETA',
    'CALIBRE': '12 GA',
    'MARCA': 'RETAY',
    'MODELO': 'GORDION',
    'MATRÍCULA': '73-H21YT-001717',
    'FOLIO': 'A3905284'
})

# Arma 2: PISTOLA CZ SHADOW 2
nueva_arma_2 = cabo_base.copy()
nueva_arma_2.update({
    'CLASE': 'PISTOLA',
    'CALIBRE': '.380"',
    'MARCA': 'CESKA ZBROJOVKA',
    'MODELO': 'SHADOW 2',
    'MATRÍCULA': 'FP40104',
    'FOLIO': 'A3901317'
})

# Agregar al DataFrame
df = pd.concat([df, pd.DataFrame([nueva_arma_1, nueva_arma_2])], ignore_index=True)

print(f"✓ Agregadas 2 armas nuevas a Iván Cabo")
print(f"  Total registros después de actualización: {len(df)}")
print()

# Hacer backup del archivo actual
backup_file = archivo_maestro.replace('.xlsx', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx')
shutil.copy(archivo_maestro, backup_file)
print(f"✓ Backup creado: {backup_file}")

# Guardar archivo actualizado
df.to_excel(archivo_maestro, index=False)
print(f"✅ Archivo maestro actualizado: {archivo_maestro}")
print()

# ============================================================================
# VERIFICACIÓN FINAL
# ============================================================================

print("=" * 100)
print("✅ VERIFICACIÓN FINAL")
print("=" * 100)
print()

# Recargar para verificar
df_verificado = pd.read_excel(archivo_maestro)
cabo_actualizado = df_verificado[df_verificado['EMAIL'] == 'ivancabo@gmail.com']

print(f"IVÁN CABO - Total armas después de actualización: {len(cabo_actualizado)}")
for idx, row in cabo_actualizado.iterrows():
    mat = str(row['MATRÍCULA']).strip() if pd.notna(row['MATRÍCULA']) else 'SIN MATRÍCULA'
    print(f"  • {row['CLASE']:12} {row.get('CALIBRE', 'N/A'):10} {row.get('MARCA', 'N/A'):15} {row.get('MODELO', 'N/A'):25} MAT: {mat}")

print()
print("=" * 100)
print("✅ ACTUALIZACIÓN COMPLETADA")
print("=" * 100)
print()
print("📁 ARCHIVOS:")
print(f"  • Base de verdad: {archivo_maestro}")
print(f"  • Backup: {backup_file}")
print(f"  • Referencia histórica: data/socios/referencia_historica/")
print()
print("⚠️  PENDIENTES:")
print("  1. Verificar/corregir armas de ARECHIGA (están bajo email de GARDONI)")
print("  2. Investigar Shadow 2 DP25087 de GARDONI (no aparece en Excel)")
print("  3. Actualizar Firestore con las nuevas armas de Iván Cabo")

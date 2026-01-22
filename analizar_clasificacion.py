#!/usr/bin/env python3
"""Revisar clasificación de armas - qué son los OTROS?"""

import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"

df = pd.read_excel(EXCEL_PATH)

print("=" * 120)
print("🔍 ANÁLISIS DE CLASIFICACIÓN DE ARMAS")
print("=" * 120)

# 1. Ver todas las clases únicas
print("\n📋 CLASES DE ARMAS EN EL SISTEMA:")
clases_unicas = df['CLASE'].value_counts().sort_values(ascending=False)
for clase, count in clases_unicas.items():
    print(f"   • {clase}: {count}")

# 2. Identificar OTROS (que no sean RIFLE, PISTOLA, ESCOPETA, KIT DE CONVERSION, REVOLVER)
armas_principales = ['RIFLE', 'PISTOLA', 'ESCOPETA', 'KIT DE CONVERSION', 'REVOLVER']
otros_df = df[~df['CLASE'].isin(armas_principales)]

print(f"\n\n🔎 REGISTROS QUE NO SON RIFLE, PISTOLA, ESCOPETA, KIT NI REVOLVER:")
print(f"   Total: {len(otros_df)} registros\n")

if len(otros_df) > 0:
    # Agrupar por tipo
    tipos_otros = otros_df['CLASE'].value_counts()
    for tipo, count in tipos_otros.items():
        print(f"\n   {tipo}: {count} registro(s)")
        # Mostrar ejemplos
        ejemplos = otros_df[otros_df['CLASE'] == tipo][['NOMBRE SOCIO', 'MARCA', 'MODELO', 'CALIBRE']].head(3)
        for idx, row in ejemplos.iterrows():
            print(f"      • {row['NOMBRE SOCIO']}: {row['MARCA']} {row['MODELO']} ({row['CALIBRE']})")

# 3. Reclasificación propuesta
print("\n\n" + "=" * 120)
print("📊 ESTADÍSTICAS CORREGIDAS (KITS como ARMAS CORTAS)")
print("=" * 120)

armas_largas_corregidas = df[df['CLASE'].isin(['RIFLE', 'ESCOPETA'])].shape[0]
armas_cortas_corregidas = df[df['CLASE'].isin(['PISTOLA', 'KIT DE CONVERSION', 'REVOLVER'])].shape[0]
otros_total = df[~df['CLASE'].isin(['RIFLE', 'PISTOLA', 'ESCOPETA', 'KIT DE CONVERSION', 'REVOLVER'])].shape[0]

print(f"\n👥 SOCIOS TOTALES: 76")
print(f"🔫 TOTAL DE ARMAS: {len(df)}")

print(f"\n🎯 CLASIFICACIÓN CORRECTA:")
print(f"   • Armas Largas (RIFLE + ESCOPETA): {armas_largas_corregidas}")
print(f"     - RIFLES: {df[df['CLASE'] == 'RIFLE'].shape[0]}")
print(f"     - ESCOPETAS: {df[df['CLASE'] == 'ESCOPETA'].shape[0]}")

print(f"\n   • Armas Cortas (PISTOLA + KIT + REVOLVER): {armas_cortas_corregidas}")
print(f"     - PISTOLAS: {df[df['CLASE'] == 'PISTOLA'].shape[0]}")
print(f"     - KITS DE CONVERSIÓN: {df[df['CLASE'] == 'KIT DE CONVERSION'].shape[0]}")
print(f"     - REVÓLVERES: {df[df['CLASE'] == 'REVOLVER'].shape[0]}")

if otros_total > 0:
    print(f"\n   • OTROS (revisar clasificación): {otros_total}")

print("\n" + "=" * 120)

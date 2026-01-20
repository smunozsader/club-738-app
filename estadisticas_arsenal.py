#!/usr/bin/env python3
"""Estadísticas del arsenal y búsqueda de Agustín Moreno"""

import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"

df = pd.read_excel(EXCEL_PATH)

print("=" * 100)
print("📊 ESTADÍSTICAS DEL ARSENAL - CLUB 738")
print("=" * 100)

# 1. Total de socios únicos
socios_unicos = df['No. CREDENCIAL'].nunique()
print(f"\n👥 SOCIOS TOTALES: {socios_unicos}")

# 2. Total de armas
total_armas = len(df)
print(f"🔫 TOTAL DE ARMAS: {total_armas}")

# 3. Clasificar por tipo
armas_largas = df[df['CLASE'].isin(['RIFLE', 'ESCOPETA', 'KIT DE CONVERSION'])].shape[0]
armas_cortas = df[df['CLASE'] == 'PISTOLA'].shape[0]

print(f"\n🎯 DESGLOSE POR TIPO:")
print(f"   • Armas Largas (RIFLE + ESCOPETA + KIT): {armas_largas}")
print(f"   • Armas Cortas (PISTOLA): {armas_cortas}")

# 4. Detalle por tipo
print(f"\n📋 DETALLE:")
rifles = df[df['CLASE'] == 'RIFLE'].shape[0]
escopetas = df[df['CLASE'] == 'ESCOPETA'].shape[0]
pistolas = df[df['CLASE'] == 'PISTOLA'].shape[0]
kits = df[df['CLASE'] == 'KIT DE CONVERSION'].shape[0]
otros = df[~df['CLASE'].isin(['RIFLE', 'ESCOPETA', 'PISTOLA', 'KIT DE CONVERSION'])].shape[0]

print(f"   • RIFLES: {rifles}")
print(f"   • ESCOPETAS: {escopetas}")
print(f"   • PISTOLAS: {pistolas}")
print(f"   • KITS DE CONVERSIÓN: {kits}")
if otros > 0:
    print(f"   • OTROS: {otros}")

# 5. Promedio de armas por socio
promedio = total_armas / socios_unicos
print(f"\n📈 PROMEDIO ARMAS POR SOCIO: {promedio:.2f}")

print("\n" + "=" * 100)

# Búsqueda de Agustín Moreno
print("\n" + "=" * 100)
print("🔍 BÚSQUEDA: AGUSTÍN MORENO (Credencial 161)")
print("=" * 100)

agustin = df[(df['No. CREDENCIAL'] == 161) | (df['NOMBRE SOCIO'].astype(str).str.contains('AGUSTIN', case=False, na=False))]
if len(agustin) > 0:
    print(f"\n✅ Encontradas {len(agustin)} arma(s):")
    cols = ['No. CREDENCIAL', 'NOMBRE SOCIO', 'EMAIL', 'CLASE', 'CALIBRE', 'MARCA', 'MODELO']
    print(agustin[cols].to_string(index=False))
else:
    print("❌ No encontrado")

print("\n" + "=" * 100)

import pandas as pd

EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"
df = pd.read_excel(EXCEL_PATH)

# Filtrar registros válidos (con CLASE)
validos = df[(df['CLASE'].notna()) & (df['CLASE'] != '0') & (df['CLASE'] != 0)]

print("=" * 100)
print("📊 ESTADÍSTICAS COMPLETAS - CLUB 738 ARSENAL")
print("=" * 100)

# 1. Total de socios
socios_unicos = df['EMAIL'].nunique()
print(f"\n👥 SOCIOS TOTALES: {socios_unicos}\n")

# 2. Armas cortas
pistolas = len(validos[validos['CLASE'].str.contains('PISTOLA', case=False, na=False)])
revolvers = len(validos[validos['CLASE'].str.contains('REVOLVER', case=False, na=False)])
kits = len(validos[validos['CLASE'].str.contains('KIT', case=False, na=False)])
cortas_total = pistolas + revolvers + kits

print("🔫 ARMAS CORTAS:")
print(f"   • PISTOLAS:  {pistolas}")
print(f"   • REVOLVERS: {revolvers}")
print(f"   • KITS:      {kits}")
print(f"   ─────────────────")
print(f"   TOTAL:       {cortas_total}\n")

# 3. Armas largas
rifles = len(validos[validos['CLASE'].str.contains('RIFLE', case=False, na=False) & 
                     ~validos['CLASE'].str.contains('ESCOPETA', case=False, na=False)])
escopetas = len(validos[validos['CLASE'].str.contains('ESCOPETA', case=False, na=False) & 
                        ~validos['CLASE'].str.contains('RIFLE', case=False, na=False)])
especiales = len(validos[validos['CLASE'].str.contains('ESCOPETA.*RIFLE|RIFLE.*ESCOPETA', case=False, na=False, regex=True)])

largas_total = rifles + escopetas + especiales

print("🎯 ARMAS LARGAS:")
print(f"   • RIFLES:         {rifles}")
print(f"   • ESCOPETAS:      {escopetas}")
print(f"   • ESPECIALES*:    {especiales}")
print(f"     (*ESCOPETA RIFLE / DUAL-CALIBER)")
print(f"   ─────────────────")
print(f"   TOTAL:            {largas_total}\n")

# 4. Resumen general
total_armas = cortas_total + largas_total
print("=" * 100)
print(f"📦 TOTAL ARMAS: {total_armas}")
print(f"   Armas Cortas: {cortas_total} ({(cortas_total/total_armas)*100:.1f}%)")
print(f"   Armas Largas: {largas_total} ({(largas_total/total_armas)*100:.1f}%)")
print("=" * 100)

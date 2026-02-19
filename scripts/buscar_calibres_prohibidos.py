#!/usr/bin/env python3
"""
Script para identificar armas con calibres prohibidos por la reforma LFAFE Feb 2026
Calibres prohibidos: .22 W.R.F., .22 WIN MAG, .22 Magnum, .22 Hornet, .22 TCM
"""
import pandas as pd

xlsx = '/Applications/club-738-web/data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx'
df = pd.read_excel(xlsx)

print("=" * 100)
print("ARMAS CON CALIBRES PROHIBIDOS POR LA REFORMA A LA LFAFE (Feb 2026)")
print("Calibres prohibidos: .22 W.R.F., .22 WIN MAG, .22 Magnum, .22 Hornet, .22 TCM")
print("=" * 100)

cols = ['NOMBRE SOCIO', 'EMAIL', 'TELEFONO', 'CLASE', 'MARCA', 'MODELO', 'CALIBRE', 'MATRÍCULA', 'FOLIO']

# 1. Armas con calibres .22 MAG o .22 HORNET
mask1 = df['CALIBRE'].astype(str).str.contains(r'\.22.*MAG|22.*HORNET', case=False, na=False, regex=True)
afectadas1 = df[mask1]

print("\n📍 ARMAS CON CALIBRE .22 MAG / .22 HORNET (PROHIBIDOS):")
print("-" * 100)
for idx, row in afectadas1.iterrows():
    print(f"""
SOCIO: {row['NOMBRE SOCIO']}
EMAIL: {row['EMAIL']}
TEL: {row['TELEFONO']}
ARMA: {row['CLASE']} {row['MARCA']} {row['MODELO']}
CALIBRE: {row['CALIBRE']}
MATRÍCULA: {row['MATRÍCULA']}
FOLIO: {row['FOLIO']}
""")

# 2. Armas con matrícula TCM (indica calibre .22 TCM)
mask2 = df['MATRÍCULA'].astype(str).str.contains('TCM', case=False, na=False)
afectadas2 = df[mask2]

print("\n📍 ARMAS CON MATRÍCULA 'TCM' (posible calibre .22 TCM):")
print("-" * 100)
for idx, row in afectadas2.iterrows():
    print(f"""
SOCIO: {row['NOMBRE SOCIO']}
EMAIL: {row['EMAIL']}
TEL: {row['TELEFONO']}
ARMA: {row['CLASE']} {row['MARCA']} {row['MODELO']}
CALIBRE: {row['CALIBRE']}
MATRÍCULA: {row['MATRÍCULA']}
FOLIO: {row['FOLIO']}
""")

# Resumen
print("\n" + "=" * 100)
print("RESUMEN:")
print("=" * 100)
print(f"Total armas con calibre .22 MAG/.22 HORNET: {len(afectadas1)}")
print(f"Total armas con matrícula TCM: {len(afectadas2)}")
print(f"TOTAL ARMAS AFECTADAS: {len(afectadas1) + len(afectadas2)}")
print("\nOpciones para socios afectados:")
print("1. Trasladar a modalidad de 'Colección'")
print("2. Donar en centro de canje de armas")
print("3. Donar a la SEDENA sin reclamo futuro")

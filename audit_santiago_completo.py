#!/usr/bin/env python3
"""
Auditoría de armas para Santiago Alejandro Quintal Paredes
Compara FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx vs Firestore
"""

import openpyxl

EXCEL_PATH = '/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx'
EMAIL_BUSCADO = 'squintal158@gmail.com'
SOCIO_NOMBRE = 'SANTIAGO ALEJANDRO QUINTAL PAREDES'

# === DATOS DEL EXCEL ===
armas_excel = [
    {
        'clase': 'PISTOLA',
        'calibre': '.380"',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'CZ SHADOW 2',
        'matricula': 'FP41102',
        'folio': 'A3916933'
    },
    {
        'clase': 'RIFLE',
        'calibre': '.22" L.R.',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'CZ 457 MTR',
        'matricula': 'J002602',
        'folio': 'A3916936'
    },
    {
        'clase': 'ESCOPETA SEMIAUTOMATICA',
        'calibre': '12 GA',
        'marca': 'BREDA',
        'modelo': 'TITANIO',
        'matricula': 'BA 12657',
        'folio': 'A3916935'
    }
]

# === DATOS DE FIRESTORE ===
armas_firestore = [
    {
        'clase': 'ESCOPETA SEMIAUTOMATICA',
        'calibre': '12 GA',
        'marca': 'BREDA',
        'modelo': 'TITANIO',
        'matricula': 'BA 12657',
        'folio': 'A3916935'
    },
    {
        'clase': 'PISTOLA',
        'calibre': '.380"',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'CZ SHADOW 2',
        'matricula': 'FP41102',
        'folio': 'A3916933'
    },
    {
        'clase': 'RIFLE',
        'calibre': '.22" L.R.',
        'marca': 'CESKA ZBROJOVKA',
        'modelo': 'CZ 457 MTR',
        'matricula': 'J002602',
        'folio': 'A3916936'
    }
]

def normalizar_arma(arma):
    """Crea una clave única para comparar armas"""
    return (
        arma['clase'].upper().strip(),
        arma['calibre'].upper().strip(),
        arma['marca'].upper().strip(),
        arma['modelo'].upper().strip(),
        arma['matricula'].upper().strip().replace(' ', ''),
        arma['folio'].upper().strip()
    )

def formato_arma(arma):
    """Formatea arma para mostrar"""
    return f"{arma['clase']} {arma['marca']} {arma['modelo']}"

def detalles_arma(arma):
    """Retorna detalles de un arma"""
    return (
        f"  Calibre: {arma['calibre']}\n"
        f"  Matrícula: {arma['matricula']}\n"
        f"  Folio: {arma['folio']}"
    )

# === COMPARACIÓN ===
print("\n" + "="*75)
print("AUDITORÍA DE ARMAS: SANTIAGO ALEJANDRO QUINTAL PAREDES")
print("="*75)
print(f"\nEmail: {EMAIL_BUSCADO}")
print(f"Comparando: Excel vs Firestore\n")

excel_keys = set()
firestore_keys = set()

excel_map = {}
firestore_map = {}

for arma in armas_excel:
    key = normalizar_arma(arma)
    excel_keys.add(key)
    excel_map[key] = arma

for arma in armas_firestore:
    key = normalizar_arma(arma)
    firestore_keys.add(key)
    firestore_map[key] = arma

# Categorías
en_ambos = excel_keys & firestore_keys
solo_en_excel = excel_keys - firestore_keys
solo_en_firestore = firestore_keys - excel_keys

# === REPORTE ===
print(f"📊 FUENTE_DE_VERDAD Excel: {len(armas_excel)} armas")
print(f"📊 Firestore actual: {len(armas_firestore)} armas\n")

print("-" * 75)
print(f"✅ ARMAS EN AMBOS (Excel ∩ Firestore): {len(en_ambos)}")
print("-" * 75)
if en_ambos:
    for idx, key in enumerate(sorted(en_ambos), 1):
        arma = excel_map[key]
        print(f"\n{idx}. {formato_arma(arma)}")
        print(detalles_arma(arma))
else:
    print("(ninguna)")

print("\n" + "-" * 75)
print(f"❌ SOLO EN EXCEL (Faltantes en Firestore): {len(solo_en_excel)}")
print("-" * 75)
if solo_en_excel:
    for idx, key in enumerate(sorted(solo_en_excel), 1):
        arma = excel_map[key]
        print(f"\n{idx}. {formato_arma(arma)}")
        print(detalles_arma(arma))
        print("   ⚠️  FALTA EN FIRESTORE - Requiere acción")
else:
    print("(ninguna - todos los datos están sincronizados)")

print("\n" + "-" * 75)
print(f"⚠️  SOLO EN FIRESTORE (Extras no en Excel): {len(solo_en_firestore)}")
print("-" * 75)
if solo_en_firestore:
    for idx, key in enumerate(sorted(solo_en_firestore), 1):
        arma = firestore_map[key]
        print(f"\n{idx}. {formato_arma(arma)}")
        print(detalles_arma(arma))
        print("   ⚠️  EXTRA EN FIRESTORE - No está en Excel maestro")
else:
    print("(ninguna - sin datos huérfanos)")

# === RESUMEN FINAL ===
print("\n" + "="*75)
print("RESUMEN EJECUTIVO")
print("="*75)
print(f"\n✅ Coincidencias: {len(en_ambos)}/{len(armas_excel)} armas")

if len(en_ambos) == len(armas_excel) and len(solo_en_firestore) == 0:
    print("✓ Estado: SINCRONIZADO - No hay discrepancias")
elif solo_en_excel:
    print(f"❌ Estado: DESINCRONIZADO")
    print(f"   - {len(solo_en_excel)} arma(s) en Excel NO en Firestore")
    if solo_en_firestore:
        print(f"   - {len(solo_en_firestore)} arma(s) en Firestore NO en Excel")
elif solo_en_firestore:
    print(f"⚠️  Estado: DATOS EXTRA EN FIRESTORE")
    print(f"   - {len(solo_en_firestore)} arma(s) huérfana(s) sin registro en Excel")

print("\n" + "="*75 + "\n")

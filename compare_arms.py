#!/usr/bin/env python3
"""
Comparación de armas para Ricardo Antonio Soberanis Gamboa
EXCEL vs FIRESTORE
"""

import pandas as pd
from datetime import datetime

excel_file = '/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx'

# === DATOS DEL EXCEL ===
# Filas encontradas para Ricardo Antonio Soberanis Gamboa (rsoberanis11@hotmail.com)
excel_armas = [
    {
        'nombre_socio': 'RICARDO ANTONIO SOBERANIS GAMBOA',
        'email': 'rsoberanis11@hotmail.com',
        'clase': 'PISTOLA',
        'calibre': '22" L.R.',
        'marca': 'SIG SAUER',
        'modelo': 'P322',
        'matricula': '73A05683',
        'folio': 'A3845138',
        'fuente': 'EXCEL'
    },
    {
        'nombre_socio': 'RICARDO ANTONIO SOBERANIS GAMBOA',
        'email': 'rsoberanis11@hotmail.com',
        'clase': 'RIFLE SEMI-AUTOMATICO',
        'calibre': '22" L.R.',
        'marca': 'RUGER',
        'modelo': '10/22',
        'matricula': '0014-07080',
        'folio': 'B624593',
        'fuente': 'EXCEL'
    },
    {
        'nombre_socio': 'RICARDO ANTONIO SOBERANIS GAMBOA',
        'email': 'rsoberanis11@hotmail.com',
        'clase': 'ESCOPETA DOS CAÑONES',
        'calibre': '20',
        'marca': 'J.B. RONGE FILF A LIEGE',
        'modelo': 'SIN',
        'matricula': '65937',
        'folio': 'B624607',
        'fuente': 'EXCEL'
    }
]

# === DATOS DE FIRESTORE ===
# Estos se leyeron del audit_firestore.js
firestore_armas = [
    {
        'clase': 'PISTOLA',
        'calibre': '22" L.R.',
        'marca': 'SIG SAUER',
        'modelo': 'P322',
        'matricula': '73A05683',
        'folio': 'A3845138',
        'modalidad': 'tiro',
        'fuente': 'FIRESTORE',
        'doc_id': '4b398228-c6af-41e6-8df2-1490a9495361'
    },
    {
        'clase': 'RIFLE SEMI-AUTOMATICO',
        'calibre': '22" L.R.',
        'marca': 'RUGER',
        'modelo': '10/22',
        'matricula': '0014-07080',
        'folio': 'B624593',
        'modalidad': 'tiro',
        'fuente': 'FIRESTORE',
        'doc_id': 'ceb44ea4-3bb6-4611-bb9b-f12b292b91d9'
    },
    {
        'clase': 'ESCOPETA DOS CAÑONES',
        'calibre': '20',
        'marca': 'J.B. RONGE FILF A LIEGE',
        'modelo': 'SIN',
        'matricula': '65937',
        'folio': 'B624607',
        'modalidad': 'tiro',
        'fuente': 'FIRESTORE',
        'doc_id': 'ec19e1d6-9939-4389-91e6-e25f88a95b06'
    }
]

def normalize_key(clase, calibre, marca, matricula):
    """Crea una clave única normalizada para comparación"""
    return f"{clase.upper().strip()}|{calibre.upper().strip()}|{marca.upper().strip()}|{matricula.upper().strip()}"

def print_header(title):
    """Imprime encabezado formateado"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}")

def print_arm_details(arm, source):
    """Imprime detalles de un arma"""
    print(f"\n  📋 {source}")
    print(f"     Clase: {arm.get('clase', 'N/A')}")
    print(f"     Calibre: {arm.get('calibre', 'N/A')}")
    print(f"     Marca: {arm.get('marca', 'N/A')}")
    print(f"     Modelo: {arm.get('modelo', 'N/A')}")
    print(f"     Matrícula: {arm.get('matricula', 'N/A')}")
    print(f"     Folio: {arm.get('folio', 'N/A')}")
    if 'modalidad' in arm:
        print(f"     Modalidad: {arm.get('modalidad', 'N/A')}")
    if 'doc_id' in arm:
        print(f"     Doc ID: {arm.get('doc_id', 'N/A')}")

# === CREAR ÍNDICES PARA COMPARACIÓN ===
excel_keys = {}
for arm in excel_armas:
    key = normalize_key(arm['clase'], arm['calibre'], arm['marca'], arm['matricula'])
    excel_keys[key] = arm

firestore_keys = {}
for arm in firestore_armas:
    key = normalize_key(arm['clase'], arm['calibre'], arm['marca'], arm['matricula'])
    firestore_keys[key] = arm

# === COMPARACIÓN ===
print_header("AUDITORÍA DE ARMAS - RICARDO ANTONIO SOBERANIS GAMBOA")
print(f"\nEmail: rsoberanis11@hotmail.com")
print(f"Fecha del reporte: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"\nFuentes:")
print(f"  • EXCEL: FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx")
print(f"  • FIRESTORE: Aplicación Club 738 (en vivo)")

# Armas en ambas fuentes
coincidencias = []
for key in excel_keys:
    if key in firestore_keys:
        coincidencias.append((key, excel_keys[key], firestore_keys[key]))

# Armas solo en Excel
solo_excel = []
for key in excel_keys:
    if key not in firestore_keys:
        solo_excel.append((key, excel_keys[key]))

# Armas solo en Firestore
solo_firestore = []
for key in firestore_keys:
    if key not in excel_keys:
        solo_firestore.append((key, firestore_keys[key]))

# === RESULTADOS ===
print_header("RESUMEN COMPARATIVO")
print(f"\n  Total en EXCEL: {len(excel_armas)}")
print(f"  Total en FIRESTORE: {len(firestore_armas)}")
print(f"  \n  ✅ Coincidencias: {len(coincidencias)}")
print(f"  ⚠️  Solo en Excel: {len(solo_excel)}")
print(f"  ⚠️  Solo en Firestore: {len(solo_firestore)}")

# === DETALLE: COINCIDENCIAS ===
if len(coincidencias) > 0:
    print_header("✅ ARMAS EN AMBAS FUENTES (SINCRONIZADAS)")
    for idx, (key, excel_arm, firestore_arm) in enumerate(coincidencias, 1):
        print(f"\n  {idx}. {excel_arm['clase']} - {excel_arm['calibre']}")
        print(f"     Matrícula: {excel_arm['matricula']} | Folio: {excel_arm['folio']}")
        print(f"     ✅ SINCRONIZADO en Firestore")
        print(f"     Modalidad en Firestore: {firestore_arm.get('modalidad', 'N/A')}")
else:
    print_header("✅ ARMAS EN AMBAS FUENTES (SINCRONIZADAS)")
    print("\n  ⚠️  No hay coincidencias (ERROR - investigar)")

# === DETALLE: SOLO EN EXCEL ===
if len(solo_excel) > 0:
    print_header("⚠️  ARMAS EN EXCEL PERO NO EN FIRESTORE (FALTANTES EN APP)")
    for idx, (key, excel_arm) in enumerate(solo_excel, 1):
        print(f"\n  {idx}. {excel_arm['clase']} - {excel_arm['calibre']}")
        print(f"     Marca: {excel_arm['marca']} | Modelo: {excel_arm['modelo']}")
        print(f"     Matrícula: {excel_arm['matricula']}")
        print(f"     Folio: {excel_arm['folio']}")
        print(f"     ❌ NO ENCONTRADA en Firestore")
        print(f"     Acción: Verificar si fue eliminada de la app o nunca se cargó")
else:
    print_header("⚠️  ARMAS EN EXCEL PERO NO EN FIRESTORE (FALTANTES EN APP)")
    print("\n  ✅ Todas las armas del Excel están en Firestore")

# === DETALLE: SOLO EN FIRESTORE ===
if len(solo_firestore) > 0:
    print_header("⚠️  ARMAS EN FIRESTORE PERO NO EN EXCEL (EXTRAS/NO SINCRONIZADAS)")
    for idx, (key, fs_arm) in enumerate(solo_firestore, 1):
        print(f"\n  {idx}. {fs_arm['clase']} - {fs_arm['calibre']}")
        print(f"     Marca: {fs_arm['marca']} | Modelo: {fs_arm['modelo']}")
        print(f"     Matrícula: {fs_arm['matricula']}")
        print(f"     Folio: {fs_arm['folio']}")
        print(f"     Doc ID: {fs_arm.get('doc_id', 'N/A')}")
        print(f"     ❌ NO ENCONTRADA en Excel")
        print(f"     Acción: Verificar si es un agregado reciente no sincronizado al Excel maestro")
else:
    print_header("⚠️  ARMAS EN FIRESTORE PERO NO EN EXCEL (EXTRAS/NO SINCRONIZADAS)")
    print("\n  ✅ Todas las armas de Firestore están en el Excel")

# === CONCLUSIÓN ===
print_header("CONCLUSIÓN Y RECOMENDACIONES")
if len(solo_excel) == 0 and len(solo_firestore) == 0:
    print("\n  ✅ ESTADO: SINCRONIZADO CORRECTAMENTE")
    print(f"\n  Todas las {len(excel_armas)} armas del socio están sincronizadas entre")
    print(f"  el Excel maestro y la aplicación Firestore.")
    print(f"\n  No se requieren acciones correctivas.")
else:
    print("\n  ⚠️  ESTADO: DESINCRONIZACIÓN DETECTADA")
    if len(solo_excel) > 0:
        print(f"\n  🔴 CRÍTICO: {len(solo_excel)} arma(s) en Excel pero NO en Firestore")
        print(f"     → Verificar si fueron eliminadas de la app o nunca se cargaron")
        print(f"     → Contactar al socio para confirmar estado actual de las armas")
    if len(solo_firestore) > 0:
        print(f"\n  🟡 ADVERTENCIA: {len(solo_firestore)} arma(s) en Firestore pero NO en Excel")
        print(f"     → Verificar si son agregados recientes")
        print(f"     → Actualizar el Excel maestro si son armas vigentes")

print(f"\n{'='*80}\n")

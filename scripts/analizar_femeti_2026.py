#!/usr/bin/env python3
"""
Analiza el Excel FEMETI 2026 y extrae estados por modalidad
"""
import pandas as pd
import json

xlsx = pd.ExcelFile('data/referencias/femeti_tiradas_2026/PA 26 BLOQUEADO femeti.xlsx')

modalidades_info = {
    'BLANCOS EN MOVIMIENTO': {
        'tipo_arma': 'Escopeta',
        'descripcion': 'Palomas - Colombaire, Jaula Europea/Americana',
        'calibres': ['12', '20', '410']
    },
    'RECORRIDOS DE CAZA': {
        'tipo_arma': 'Escopeta',
        'descripcion': 'Discos en recorridos',
        'calibres': ['12', '20', '410']
    },
    'TIRO OLIMPICO': {
        'tipo_arma': 'Escopeta',
        'descripcion': 'Skeet, Trap, Fosa Olimpica',
        'calibres': ['12']
    },
    'SILUETAS METALICAS': {
        'tipo_arma': 'Rifle/Pistola',
        'descripcion': 'Siluetas metalicas',
        'calibres': ['.22', '.223', 'Alto Poder']
    },
    'TIRO PRACTICO': {
        'tipo_arma': 'Multi',
        'descripcion': 'Tiro Practico Mexicano',
        'calibres': ['.12', '.22', '.38 Spl', '.380', '.223']
    },
    'TIRO NEUMATICO': {
        'tipo_arma': 'Aire',
        'descripcion': 'Silueta Mexicana, Bench Rest',
        'calibres': ['4.5', '5.5']
    }
}

# Mapeo de abreviaturas a nombres completos
estado_map = {
    'JAL': 'JALISCO', 'JAL.': 'JALISCO',
    'COAH': 'COAHUILA', 'COAH.': 'COAHUILA',
    'GRO': 'GUERRERO', 'GRO.': 'GUERRERO',
    'HGO': 'HIDALGO', 'HGO.': 'HIDALGO',
    'MEX': 'MEXICO', 'MEX.': 'MEXICO', 'MÉX': 'MEXICO', 'MÉX.': 'MEXICO',
    'CHIS': 'CHIAPAS', 'CHIS.': 'CHIAPAS',
    'SLP': 'SAN LUIS POTOSI', 'S.L.P.': 'SAN LUIS POTOSI',
    'GTO': 'GUANAJUATO', 'GTO.': 'GUANAJUATO',
    'MOR': 'MORELOS', 'MOR.': 'MORELOS',
    'SON': 'SONORA', 'SON.': 'SONORA',
    'BC': 'BAJA CALIFORNIA', 'B.C.': 'BAJA CALIFORNIA',
    'NL': 'NUEVO LEON', 'N.L.': 'NUEVO LEON',
    'DGO': 'DURANGO', 'DGO.': 'DURANGO',
    'QRO': 'QUERETARO', 'QRO.': 'QUERETARO',
    'MICH': 'MICHOACAN', 'MICH.': 'MICHOACAN',
    'AGS': 'AGUASCALIENTES', 'AGS.': 'AGUASCALIENTES',
    'VER': 'VERACRUZ', 'VER.': 'VERACRUZ',
    'TAM': 'TAMAULIPAS', 'TAM.': 'TAMAULIPAS',
    'CAMP': 'CAMPECHE', 'CAMP.': 'CAMPECHE',
    'YUC': 'YUCATAN', 'YUC.': 'YUCATAN',
    'QROO': 'QUINTANA ROO', 'Q.ROO': 'QUINTANA ROO',
    'TAB': 'TABASCO', 'TAB.': 'TABASCO',
    'OAX': 'OAXACA', 'OAX.': 'OAXACA',
    'PUE': 'PUEBLA', 'PUE.': 'PUEBLA',
    'CDMX': 'CIUDAD DE MEXICO', 'D.F.': 'CIUDAD DE MEXICO',
    'ZAC': 'ZACATECAS', 'ZAC.': 'ZACATECAS',
    'SIN': 'SINALOA', 'SIN.': 'SINALOA',
    'NAY': 'NAYARIT', 'NAY.': 'NAYARIT',
    'CHIH': 'CHIHUAHUA', 'CHIH.': 'CHIHUAHUA',
    'BCS': 'BAJA CALIFORNIA SUR'
}

def normalizar_estado(estado):
    """Normaliza el nombre del estado"""
    estado = str(estado).strip().upper()
    return estado_map.get(estado, estado)

resultados = {}

print("=" * 70)
print("RESUMEN POR MODALIDAD - EVENTOS FEMETI 2026")
print("=" * 70)

for sheet in modalidades_info.keys():
    df = pd.read_excel(xlsx, sheet_name=sheet, header=None)
    
    # Extraer estados (columna 7)
    estados_raw = df.iloc[3:, 7].dropna().astype(str).unique()
    estados = set()
    for e in estados_raw:
        e_norm = normalizar_estado(e)
        if len(e_norm) > 2 and e_norm not in ['NAN', 'ESTADO', 'LUGAR']:
            estados.add(e_norm)
    
    info = modalidades_info[sheet]
    resultados[sheet] = {
        'tipo_arma': info['tipo_arma'],
        'descripcion': info['descripcion'],
        'calibres': info['calibres'],
        'estados': sorted(list(estados)),
        'total_eventos': len(df) - 3
    }
    
    print(f"\n📌 {sheet}")
    print(f"   Tipo de arma: {info['tipo_arma']}")
    print(f"   Calibres: {', '.join(info['calibres'])}")
    print(f"   Descripción: {info['descripcion']}")
    print(f"   Total eventos: {len(df) - 3}")
    print(f"   Estados ({len(estados)}):")
    for estado in sorted(estados):
        print(f"      • {estado}")

# Guardar JSON para usar en la app
output_path = 'data/referencias/femeti_tiradas_2026/modalidades_estados_2026.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(resultados, f, ensure_ascii=False, indent=2)

print(f"\n✅ JSON guardado en: {output_path}")

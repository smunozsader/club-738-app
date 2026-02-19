#!/usr/bin/env python3
"""
Extrae todas las competencias FEMETI 2026 con fechas, clubes y estados.
Formato requerido por SEDENA para PETA de competencia nacional.
"""

import pandas as pd
import json
import re
from datetime import datetime

def normalizar_estado(estado):
    """Normaliza nombres de estados"""
    if pd.isna(estado):
        return None
    estado = str(estado).strip().upper()
    
    mapeo = {
        'AGS': 'AGUASCALIENTES', 'AGS.': 'AGUASCALIENTES', 'AGUASCALIENTES': 'AGUASCALIENTES',
        'BC': 'BAJA CALIFORNIA', 'B.C.': 'BAJA CALIFORNIA', 'B.C': 'BAJA CALIFORNIA', 'BAJA CALIFORNIA': 'BAJA CALIFORNIA',
        'BCS': 'BAJA CALIFORNIA SUR', 'B.C.S.': 'BAJA CALIFORNIA SUR', 'BAJA CALIFORNIA SUR': 'BAJA CALIFORNIA SUR',
        'CAMP': 'CAMPECHE', 'CAMPECHE': 'CAMPECHE',
        'CHIS': 'CHIAPAS', 'CHIAPAS': 'CHIAPAS',
        'CHIH': 'CHIHUAHUA', 'CHIHUAHUA': 'CHIHUAHUA',
        'CDMX': 'CIUDAD DE MEXICO', 'CD. DE MEXICO': 'CIUDAD DE MEXICO', 'CIUDAD DE MEXICO': 'CIUDAD DE MEXICO',
        'COAH': 'COAHUILA', 'COAHUILA': 'COAHUILA', 'COAH.': 'COAHUILA',
        'COL': 'COLIMA', 'COLIMA': 'COLIMA',
        'DGO': 'DURANGO', 'DURANGO': 'DURANGO',
        'GTO': 'GUANAJUATO', 'GTO.': 'GUANAJUATO', 'GUANAJUATO': 'GUANAJUATO',
        'GRO': 'GUERRERO', 'GRO.': 'GUERRERO', 'GUERRERO': 'GUERRERO',
        'HGO': 'HIDALGO', 'HIDALGO': 'HIDALGO',
        'JAL': 'JALISCO', 'JALISCO': 'JALISCO',
        'MEX': 'MEXICO', 'EDO. MEX': 'MEXICO', 'EDO. DE MEXICO': 'MEXICO', 'MEXICO': 'MEXICO',
        'MICH': 'MICHOACAN', 'MICHOACAN': 'MICHOACAN',
        'MOR': 'MORELOS', 'MORELOS': 'MORELOS',
        'NAY': 'NAYARIT', 'NAYARIT': 'NAYARIT',
        'NL': 'NUEVO LEON', 'N.L.': 'NUEVO LEON', 'NUEVO LEON': 'NUEVO LEON',
        'OAX': 'OAXACA', 'OAXACA': 'OAXACA',
        'PUE': 'PUEBLA', 'PUEBLA': 'PUEBLA',
        'QRO': 'QUERETARO', 'QRO.': 'QUERETARO', 'QUERETARO': 'QUERETARO',
        'QROO': 'QUINTANA ROO', 'Q.ROO': 'QUINTANA ROO', 'QUINTANA ROO': 'QUINTANA ROO',
        'SLP': 'SAN LUIS POTOSI', 'S.L.P.': 'SAN LUIS POTOSI', 'SAN LUIS POTOSI': 'SAN LUIS POTOSI',
        'SIN': 'SINALOA', 'SINALOA': 'SINALOA',
        'SON': 'SONORA', 'SONORA': 'SONORA',
        'TAB': 'TABASCO', 'TABASCO': 'TABASCO',
        'TAMPS': 'TAMAULIPAS', 'TAMAULIPAS': 'TAMAULIPAS',
        'TLAX': 'TLAXCALA', 'TLAXCALA': 'TLAXCALA',
        'VER': 'VERACRUZ', 'VERACRUZ': 'VERACRUZ',
        'YUC': 'YUCATAN', 'YUCATAN': 'YUCATAN',
        'ZAC': 'ZACATECAS', 'ZACATECAS': 'ZACATECAS',
    }
    
    return mapeo.get(estado, estado)

def parsear_fecha(fecha_str):
    """Parsea varios formatos de fecha y retorna string ISO"""
    if pd.isna(fecha_str):
        return None
    
    fecha_str = str(fecha_str).strip()
    
    # Si ya es datetime de pandas
    if isinstance(fecha_str, pd.Timestamp):
        return fecha_str.strftime('%Y-%m-%d')
    
    # Patrón: 2026-01-03 00:00:00
    if re.match(r'\d{4}-\d{2}-\d{2}', fecha_str):
        return fecha_str[:10]
    
    # Patrón: 03/01/2026
    if re.match(r'\d{2}/\d{2}/\d{4}', fecha_str):
        try:
            dt = datetime.strptime(fecha_str[:10], '%d/%m/%Y')
            return dt.strftime('%Y-%m-%d')
        except:
            pass
    
    # Patrón: 03/01/2026 04/01/2026 (rango)
    match = re.search(r'(\d{2}/\d{2}/\d{4})\s*(\d{2}/\d{2}/\d{4})?', fecha_str)
    if match:
        try:
            inicio = datetime.strptime(match.group(1), '%d/%m/%Y')
            return inicio.strftime('%Y-%m-%d')
        except:
            pass
    
    return str(fecha_str)[:10] if len(str(fecha_str)) >= 10 else str(fecha_str)

def extraer_club(texto):
    """Extrae nombre del club del texto"""
    if pd.isna(texto):
        return "Club sin especificar"
    texto = str(texto).strip()
    # Eliminar textos como "Competencia Abierta", "Tirada de Invitacion"
    lineas = texto.split('\n')
    return lineas[0].strip() if lineas else texto

def extraer_calibres(texto):
    """Extrae calibres del texto"""
    if pd.isna(texto):
        return []
    texto = str(texto).upper()
    calibres = []
    
    if '12' in texto:
        calibres.append('12')
    if '20' in texto:
        calibres.append('20')
    if '410' in texto:
        calibres.append('.410')
    if '.22' in texto or 'CAL. 22' in texto or 'CAL.22' in texto:
        calibres.append('.22')
    if '.223' in texto:
        calibres.append('.223')
    if '.38' in texto:
        calibres.append('.38 SPL')
    if '.380' in texto:
        calibres.append('.380')
    if '4.5' in texto or '4,5' in texto:
        calibres.append('4.5mm')
    if '5.5' in texto or '5,5' in texto:
        calibres.append('5.5mm')
    if 'ALTO PODER' in texto:
        calibres.append('Alto Poder')
    if 'AIRE' in texto and not calibres:
        calibres.append('4.5mm')
    
    return calibres if calibres else ['12']  # Default escopeta

# Metadatos de cada modalidad
MODALIDAD_INFO = {
    'BLANCOS EN MOVIMIENTO': {
        'tipo_arma': 'Escopeta',
        'descripcion': 'Colombaire, Jaula Europea y Americana',
        'calibres_tipicos': ['12', '20', '.410']
    },
    'RECORRIDOS DE CAZA': {
        'tipo_arma': 'Escopeta',
        'descripcion': 'Sporting Clays y Recorridos',
        'calibres_tipicos': ['12', '20', '.410']
    },
    'TIRO OLIMPICO': {
        'tipo_arma': 'Escopeta',
        'descripcion': 'Skeet, Trap y Fosa Olímpica',
        'calibres_tipicos': ['12']
    },
    'SILUETAS METALICAS': {
        'tipo_arma': 'Rifle/Pistola',
        'descripcion': 'Siluetas Metálicas',
        'calibres_tipicos': ['.22', '.223', 'Alto Poder', '4.5mm']
    },
    'TIRO PRACTICO': {
        'tipo_arma': 'Pistola/Rifle/Escopeta',
        'descripcion': 'Tiro Práctico Mexicano (IDPA/IPSC)',
        'calibres_tipicos': ['.22', '.38 SPL', '.380', '.223', '12']
    },
    'TIRO NEUMATICO': {
        'tipo_arma': 'Rifle/Pistola de Aire',
        'descripcion': 'Silueta Mexicana y Tiro Neumático',
        'calibres_tipicos': ['4.5mm', '5.5mm']
    }
}

def main():
    xlsx = pd.ExcelFile('data/referencias/femeti_tiradas_2026/PA 26 BLOQUEADO femeti.xlsx')
    modalidades = ['BLANCOS EN MOVIMIENTO', 'RECORRIDOS DE CAZA', 'TIRO OLIMPICO', 
                   'SILUETAS METALICAS', 'TIRO PRACTICO', 'TIRO NEUMATICO']
    
    resultado = {}
    
    for mod in modalidades:
        print(f"Procesando: {mod}")
        df = pd.read_excel(xlsx, sheet_name=mod, header=None)
        
        # Encontrar fila de encabezados (DIA, MES, FECHA...)
        header_row = None
        for i, row in df.iterrows():
            if 'DIA' in str(row.values):
                header_row = i
                break
        
        if header_row is None:
            print(f"  ⚠️ No se encontró encabezado en {mod}")
            continue
        
        # Re-leer con encabezados correctos
        df = pd.read_excel(xlsx, sheet_name=mod, header=header_row)
        
        # Normalizar nombres de columnas
        df.columns = ['DIA', 'MES', 'FECHA', 'CLUB', 'CALIBRE', 'LUGAR1', 'LUGAR2', 'ESTADO'] + list(df.columns[8:])
        
        eventos_por_estado = {}
        
        for _, row in df.iterrows():
            # Saltar filas vacías o encabezados
            if pd.isna(row['ESTADO']) or str(row['ESTADO']).upper() == 'ESTADO':
                continue
            
            estado = normalizar_estado(row['ESTADO'])
            if not estado:
                continue
            
            fecha = parsear_fecha(row['FECHA'])
            club = extraer_club(row['CLUB'])
            lugar = str(row['LUGAR1']) if not pd.isna(row['LUGAR1']) else ''
            calibres = extraer_calibres(row['CALIBRE'])
            
            # Limpiar club
            if 'Competencia' in club:
                partes = club.split('Competencia')
                club = partes[0].strip()
            if 'Tirada' in club:
                partes = club.split('Tirada')
                club = partes[0].strip()
            
            if not club or club == 'nan':
                club = "Club FEMETI"
            
            evento = {
                'fecha': fecha,
                'club': club,
                'lugar': lugar if lugar != 'nan' else '',
                'calibres': calibres
            }
            
            if estado not in eventos_por_estado:
                eventos_por_estado[estado] = []
            
            # Evitar duplicados
            duplicado = False
            for e in eventos_por_estado[estado]:
                if e['fecha'] == fecha and e['club'] == club:
                    duplicado = True
                    break
            
            if not duplicado and fecha:
                eventos_por_estado[estado].append(evento)
        
        # Ordenar eventos por fecha
        for estado in eventos_por_estado:
            eventos_por_estado[estado].sort(key=lambda x: x['fecha'] or '')
        
        info = MODALIDAD_INFO[mod]
        resultado[mod] = {
            'tipo_arma': info['tipo_arma'],
            'descripcion': info['descripcion'],
            'calibres': info['calibres_tipicos'],
            'estados': eventos_por_estado,
            'total_eventos': sum(len(e) for e in eventos_por_estado.values())
        }
        
        print(f"  ✓ {len(eventos_por_estado)} estados, {resultado[mod]['total_eventos']} eventos")
    
    # Guardar JSON
    output_path = 'data/referencias/femeti_tiradas_2026/competencias_femeti_2026.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Guardado: {output_path}")
    
    # Mostrar resumen
    print("\n📊 RESUMEN COMPETENCIAS FEMETI 2026:")
    total = 0
    for mod, data in resultado.items():
        print(f"  {mod}: {len(data['estados'])} estados, {data['total_eventos']} eventos")
        total += data['total_eventos']
    print(f"\n  TOTAL: {total} eventos")

if __name__ == '__main__':
    main()

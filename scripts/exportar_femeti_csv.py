#!/usr/bin/env python3
"""Exporta la base de datos FEMETI 2026 a CSV con columnas de año/mes para agrupar"""
import json
import csv
from datetime import datetime

MESES_ES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
}

with open('data/referencias/femeti_tiradas_2026/competencias_femeti_2026.json', 'r') as f:
    data = json.load(f)

with open('docs/MATRIZ_FEMETI_2026.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
    writer = csv.writer(csvfile)
    
    # Encabezados con columnas adicionales para filtrar/agrupar en Excel
    writer.writerow([
        'MODALIDAD', 'TIPO_ARMA', 'CALIBRES', 'ESTADO', 
        'FECHA', 'AÑO', 'MES_NUM', 'MES', 
        'CLUB', 'LUGAR'
    ])
    
    for modalidad, info in data.items():
        tipo_arma = info['tipo_arma']
        calibres = ', '.join(info['calibres'])
        
        for estado, eventos in info['estados'].items():
            for evento in eventos:
                fecha_str = evento['fecha']
                try:
                    fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
                    año = fecha.year
                    mes_num = fecha.month
                    mes_nombre = MESES_ES.get(mes_num, str(mes_num))
                except:
                    año = ''
                    mes_num = ''
                    mes_nombre = ''
                
                writer.writerow([
                    modalidad, tipo_arma, calibres, estado,
                    fecha_str, año, mes_num, mes_nombre,
                    evento['club'], evento['lugar']
                ])

print("CSV generado: docs/MATRIZ_FEMETI_2026.csv")
total = sum(sum(len(e) for e in i['estados'].values()) for i in data.values())
print(f"Total registros: {total}")

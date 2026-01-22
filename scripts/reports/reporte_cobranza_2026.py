#!/usr/bin/env python3

from google.cloud import firestore
import os
from datetime import datetime

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Applications/club-738-web/scripts/serviceAccountKey.json'
db_fs = firestore.Client()

print("=" * 100)
print("REPORTE DE COBRANZA 2026 - CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN")
print("=" * 100)
print(f"\nFecha de Reporte: {datetime.now().strftime('%d de %B de %Y a las %H:%M')}\n")

# Obtener todos los socios
socios = list(db_fs.collection('socios').stream())

# Estadísticas
total_socios = len(socios)
socios_pagados = 0
socios_pendientes = 0
socios_parciales = 0

total_recaudado = 0
total_pendiente = 0

pagos_por_concepto = {
    'inscripcion': {'count': 0, 'monto': 0},
    'cuota_anual': {'count': 0, 'monto': 0},
    'femeti': {'count': 0, 'monto': 0},
    'femeti_nuevo': {'count': 0, 'monto': 0}
}

# Detalles de pagos
socios_con_pagos = []
socios_sin_pagos = []

for socio_doc in socios:
    socio = socio_doc.to_dict()
    email = socio_doc.id
    nombre = socio.get('nombre', 'Desconocido')
    credencial = socio.get('credencial', '?')
    
    renovacion = socio.get('renovacion2026', {})
    estado = renovacion.get('estado', 'pendiente')
    
    if estado == 'pagado':
        socios_pagados += 1
        monto_total = renovacion.get('monto', 0)
        total_recaudado += monto_total
        
        # Desglose por concepto
        pagos_list = renovacion.get('pagos', [])
        for pago in pagos_list:
            concepto = pago.get('concepto')
            monto = pago.get('monto', 0)
            if concepto in pagos_por_concepto:
                pagos_por_concepto[concepto]['count'] += 1
                pagos_por_concepto[concepto]['monto'] += monto
        
        socios_con_pagos.append({
            'nombre': nombre,
            'credencial': credencial,
            'email': email,
            'monto': monto_total,
            'fecha': renovacion.get('fecha'),
            'metodo': renovacion.get('metodo', '?')
        })
    else:
        socios_pendientes += 1
        # Calcular lo que debe
        desglose = renovacion.get('desglose', {})
        monto_esperado = desglose.get('inscripcion', 0) + desglose.get('anualidad', 0) + desglose.get('femeti', 0)
        total_pendiente += monto_esperado
        
        socios_sin_pagos.append({
            'nombre': nombre,
            'credencial': credencial,
            'email': email,
            'deuda': monto_esperado
        })

# === RESUMEN GENERAL ===
print("RESUMEN GENERAL")
print("-" * 100)
print(f"Total de socios:              {total_socios}")
print(f"Socios pagados:               {socios_pagados} ({100*socios_pagados//total_socios}%)")
print(f"Socios pendientes:            {socios_pendientes} ({100*socios_pendientes//total_socios}%)")
print(f"")
print(f"Total recaudado:              ${total_recaudado:,}")
print(f"Total pendiente:              ${total_pendiente:,}")
print(f"Meta total (todos pagan):     ${total_recaudado + total_pendiente:,}")
print(f"Porcentaje de recaudo:        {100*total_recaudado//(total_recaudado+total_pendiente) if (total_recaudado+total_pendiente) > 0 else 0}%")

# === DESGLOSE POR CONCEPTO ===
print("\n" + "=" * 100)
print("DESGLOSE POR CONCEPTO DE PAGO")
print("-" * 100)
for concepto, datos in pagos_por_concepto.items():
    print(f"{concepto.upper():20} | {datos['count']:3} transacciones | ${datos['monto']:>12,}")

# === MÉTODOS DE PAGO ===
print("\n" + "=" * 100)
print("MÉTODOS DE PAGO UTILIZADOS")
print("-" * 100)
metodos = {}
for socio in socios_con_pagos:
    metodo = socio.get('metodo', 'desconocido')
    if metodo not in metodos:
        metodos[metodo] = 0
    metodos[metodo] += 1

for metodo, count in sorted(metodos.items(), key=lambda x: x[1], reverse=True):
    print(f"{metodo.upper():20} | {count:3} pagos")

# === SOCIOS PAGADOS (Últimos 10) ===
print("\n" + "=" * 100)
print("SOCIOS PAGADOS - ÚLTIMOS 10 REGISTROS")
print("-" * 100)
# Simplemente mostrar los primeros 10
for i, socio in enumerate(socios_con_pagos[:10], 1):
    fecha_obj = socio['fecha']
    if hasattr(fecha_obj, 'strftime'):
        fecha = fecha_obj.strftime('%d/%m/%Y %H:%M')
    elif hasattr(fecha_obj, 'date'):
        fecha = str(fecha_obj)
    else:
        fecha = 'Sin fecha'
    print(f"\n{i}. {socio['nombre']} (Cred: {socio['credencial']})")
    print(f"   Monto: ${socio['monto']:,}")
    print(f"   Fecha: {fecha}")
    print(f"   Método: {socio['metodo'].upper()}")

# === SOCIOS PENDIENTES ===
print("\n" + "=" * 100)
print(f"SOCIOS PENDIENTES DE PAGO ({len(socios_sin_pagos)})")
print("-" * 100)
socios_pendientes_ordenados = sorted(socios_sin_pagos, key=lambda x: x['deuda'], reverse=True)

for i, socio in enumerate(socios_pendientes_ordenados, 1):
    print(f"{i:2}. {socio['nombre']:40} (Cred: {socio['credencial']:3}) | Deuda: ${socio['deuda']:>8,}")

print("\n" + "=" * 100)
print("FIN DEL REPORTE")
print("=" * 100)

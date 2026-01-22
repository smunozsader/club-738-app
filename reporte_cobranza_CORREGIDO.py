#!/usr/bin/env python3

from google.cloud import firestore
import os
from datetime import datetime

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Applications/club-738-web/scripts/serviceAccountKey.json'
db_fs = firestore.Client()

print("=" * 100)
print("REPORTE DE COBRANZA 2026 - CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN [CORREGIDO]")
print("=" * 100)
print(f"\nFecha de Reporte: {datetime.now().strftime('%d de %B de %Y a las %H:%M')}\n")

# Obtener todos los socios
socios = list(db_fs.collection('socios').stream())

# Estadísticas
total_socios = len(socios)
socios_pagados = 0
socios_pendientes = 0

total_recaudado = 0
total_pendiente = 0

desglose_pagados = {
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
        
        # Leer de renovacion2026.pagos[] (estructura correcta)
        pagos_list = renovacion.get('pagos', [])
        desglose_display = {}
        
        for pago in pagos_list:
            concepto = pago.get('concepto')
            monto = pago.get('monto', 0)
            
            desglose_display[concepto] = desglose_display.get(concepto, 0) + monto
            
            if concepto in desglose_pagados:
                desglose_pagados[concepto]['count'] += 1
                desglose_pagados[concepto]['monto'] += monto
        
        socios_con_pagos.append({
            'nombre': nombre,
            'credencial': credencial,
            'email': email,
            'monto_total': monto_total,
            'desglose': desglose_display,  # Desglose real de lo que pagó
            'fecha': renovacion.get('fecha'),
            'metodo': renovacion.get('metodo', '?'),
            'notas': renovacion.get('notas', '')
        })
    else:
        socios_pendientes += 1
        # Para pendientes: NO asumir nada
        # El campo 'desglose' en renovacion2026 debería decir cuánto debe
        desglose_esperado = renovacion.get('desglose', {})
        
        # Si NO hay desglose, calcular basado en membresia2026
        if not desglose_esperado:
            membresia = socio.get('membresia2026', {})
            desglose_esperado = membresia.get('desglose', {})
        
        monto_esperado = sum(desglose_esperado.values())
        total_pendiente += monto_esperado
        
        socios_sin_pagos.append({
            'nombre': nombre,
            'credencial': credencial,
            'email': email,
            'deuda_total': monto_esperado,
            'desglose': desglose_esperado
        })

# === RESUMEN GENERAL ===
print("RESUMEN GENERAL")
print("-" * 100)
print(f"Total de socios:              {total_socios}")
print(f"Socios pagados:               {socios_pagados} ({100*socios_pagados//total_socios if total_socios > 0 else 0}%)")
print(f"Socios pendientes:            {socios_pendientes} ({100*socios_pendientes//total_socios if total_socios > 0 else 0}%)")
print(f"")
print(f"Total recaudado:              ${total_recaudado:,}")
print(f"Total pendiente:              ${total_pendiente:,}")
total_meta = total_recaudado + total_pendiente
print(f"Meta total (todos pagan):     ${total_meta:,}")
print(f"Porcentaje de recaudo:        {100*total_recaudado//total_meta if total_meta > 0 else 0}%")

# === DESGLOSE POR CONCEPTO (PAGADOS) ===
print("\n" + "=" * 100)
print("DESGLOSE DE PAGOS REALIZADOS")
print("-" * 100)
for concepto in ['inscripcion', 'cuota_anual', 'femeti', 'femeti_nuevo']:
    datos = desglose_pagados[concepto]
    print(f"{concepto.upper():20} | {datos['count']:3} transacciones | ${datos['monto']:>12,}")

# === MÉTODOS DE PAGO ===
print("\n" + "=" * 100)
print("MÉTODOS DE PAGO UTILIZADOS")
print("-" * 100)
metodos = {}
for socio in socios_con_pagos:
    metodo = socio.get('metodo', 'desconocido').upper()
    if metodo not in metodos:
        metodos[metodo] = 0
    metodos[metodo] += 1

for metodo, count in sorted(metodos.items(), key=lambda x: x[1], reverse=True):
    print(f"{metodo:20} | {count:3} pagos")

# === SOCIOS PAGADOS ===
print("\n" + "=" * 100)
print(f"SOCIOS PAGADOS ({len(socios_con_pagos)})")
print("-" * 100)

for i, socio in enumerate(socios_con_pagos, 1):
    fecha_obj = socio['fecha']
    if hasattr(fecha_obj, 'strftime'):
        fecha = fecha_obj.strftime('%d/%m/%Y %H:%M')
    else:
        fecha = str(fecha_obj) if fecha_obj else 'Sin fecha'
    
    # Construir desglose para display
    desglose_str = ", ".join([f"{k}: ${v}" for k, v in sorted(socio['desglose'].items())])
    
    print(f"\n{i}. {socio['nombre']} (Cred: {socio['credencial']})")
    print(f"   Monto total: ${socio['monto_total']:,}")
    print(f"   Desglose: {desglose_str}")
    print(f"   Fecha: {fecha}")
    print(f"   Método: {socio['metodo'].upper()}")

# === SOCIOS PENDIENTES ===
print("\n" + "=" * 100)
print(f"SOCIOS PENDIENTES DE PAGO ({len(socios_sin_pagos)})")
print("-" * 100)

# Ordenar por monto adeudado
socios_pendientes_ordenados = sorted(socios_sin_pagos, key=lambda x: x['deuda_total'], reverse=True)

for i, socio in enumerate(socios_pendientes_ordenados, 1):
    desglose_str = ", ".join([f"{k}: ${v}" for k, v in sorted(socio['desglose'].items())]) if socio['desglose'] else "Sin desglose"
    print(f"{i:2}. {socio['nombre']:40} (Cred: {socio['credencial']:3})")
    print(f"    Deuda: ${socio['deuda_total']:>8,} | Desglose: {desglose_str}")

print("\n" + "=" * 100)
print("FIN DEL REPORTE")
print("=" * 100)

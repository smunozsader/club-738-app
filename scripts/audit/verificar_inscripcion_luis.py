#!/usr/bin/env python3

from google.cloud import firestore
import os
import json

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Applications/club-738-web/scripts/serviceAccountKey.json'
db_fs = firestore.Client()

email = "oso.guigam@gmail.com"

print("=" * 80)
print(f"VERIFICANDO DESGLOSE DE PAGOS - {email}")
print("=" * 80)

socio_doc = db_fs.collection('socios').document(email.lower()).get()

if socio_doc.exists:
    datos = socio_doc.to_dict()
    
    print(f"\n✅ Nombre: {datos.get('nombre')}")
    print(f"   Credencial: {datos.get('credencial')}")
    
    # Verificar membresia2026
    membresia = datos.get('membresia2026', {})
    print(f"\n📋 MEMBRESIA 2026:")
    print(f"   Monto Total: ${membresia.get('monto'):,.0f}")
    
    desglose = membresia.get('desglose', {})
    print(f"\n💰 DESGLOSE:")
    print(f"   Inscripción:  ${desglose.get('inscripcion', 0):,.0f}")
    print(f"   Cuota Anual:  ${desglose.get('anualidad', 0):,.0f}")
    print(f"   FEMETI:       ${desglose.get('femeti', 0):,.0f}")
    print(f"   ---")
    total_desglose = desglose.get('inscripcion', 0) + desglose.get('anualidad', 0) + desglose.get('femeti', 0)
    print(f"   TOTAL:        ${total_desglose:,.0f}")
    
    # Verificar renovacion2026
    renovacion = datos.get('renovacion2026', {})
    if renovacion:
        print(f"\n📊 RENOVACION 2026:")
        print(f"   Estado: {renovacion.get('estado')}")
        
        desglose_ren = renovacion.get('desglose', {})
        print(f"\n   DESGLOSE RENOVACIÓN:")
        print(f"   Inscripción:  ${desglose_ren.get('inscripcion', 0):,.0f}")
        print(f"   Cuota Anual:  ${desglose_ren.get('anualidad', 0):,.0f}")
        print(f"   FEMETI:       ${desglose_ren.get('femeti', 0):,.0f}")
        
        pagos = renovacion.get('pagos', [])
        if pagos:
            print(f"\n   PAGOS REGISTRADOS ({len(pagos)} transacciones):")
            for i, pago in enumerate(pagos, 1):
                concepto = pago.get('concepto', 'desconocido')
                monto = pago.get('monto', 0)
                print(f"   {i}. {concepto.upper():20} → ${monto:,.0f}")
    
    print("\n" + "=" * 80)
    print("✅ VERIFICACIÓN COMPLETADA")
    print("=" * 80)
    
else:
    print(f"\n❌ Documento no encontrado: {email}")

#!/usr/bin/env python3

from google.cloud import firestore
import os

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Applications/club-738-web/scripts/serviceAccountKey.json'
db_fs = firestore.Client()

email = "oso.guigam@gmail.com"

print("=" * 80)
print(f"VERIFICANDO DATOS COMPLETOS EN FIREBASE - {email}")
print("=" * 80)

socio_doc = db_fs.collection('socios').document(email.lower()).get()

if socio_doc.exists:
    datos = socio_doc.to_dict()
    
    print("\n✅ DOCUMENTO ENCONTRADO EN FIRESTORE\n")
    
    # Verificar campos requeridos
    campos_requeridos = ['nombre', 'credencial', 'email', 'curp', 'telefono', 'domicilio']
    
    print("VERIFICACIÓN DE CAMPOS REQUERIDOS:")
    print("-" * 80)
    
    for campo in campos_requeridos:
        valor = datos.get(campo)
        estado = "✅" if valor else "❌"
        print(f"{estado} {campo:20} | {valor}")
    
    print("\n" + "-" * 80)
    
    # Verificar domicilio desglosado
    domicilio = datos.get('domicilio', {})
    if isinstance(domicilio, dict):
        print("\nDOMICILIO (Desglosado):")
        for clave, valor in domicilio.items():
            print(f"  - {clave:15} | {valor}")
    else:
        print(f"\nDOMICILIO (String): {domicilio}")
    
    # Resumen
    print("\n" + "=" * 80)
    print("RESUMEN:")
    print("=" * 80)
    
    todos_completos = all(datos.get(c) for c in campos_requeridos)
    
    if todos_completos:
        print("\n✅ TODOS LOS DATOS ESTÁN COMPLETOS Y CORRECTOS EN FIREBASE\n")
        print(f"   Nombre:     {datos.get('nombre')}")
        print(f"   Credencial: {datos.get('credencial')}")
        print(f"   Email:      {datos.get('email')}")
        print(f"   Celular:    {datos.get('telefono')}")
        print(f"   CURP:       {datos.get('curp')}")
        print(f"   Domicilio:  {domicilio.get('calle', '')}, {domicilio.get('municipio', '')}, {domicilio.get('ciudad', '')}, {domicilio.get('estado', '')} CP {domicilio.get('cp', '')}")
    else:
        print("\n⚠️  FALTAN CAMPOS EN FIREBASE:")
        for campo in campos_requeridos:
            if not datos.get(campo):
                print(f"   ❌ {campo}")
    
else:
    print(f"\n❌ DOCUMENTO NO ENCONTRADO EN FIREBASE")
    print(f"   Ruta esperada: socios/{email}")

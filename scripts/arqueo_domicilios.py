#!/usr/bin/env python3
"""
ARQUEO DE DOMICILIOS: FUENTE DE VERDAD vs FIRESTORE
Compara los datos de domicilio del Excel maestro contra Firestore
"""
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from pathlib import Path
import sys
import json

# Rutas
EXCEL_PATH = Path(__file__).parent.parent / "data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"
SERVICE_ACCOUNT = Path(__file__).parent / "serviceAccountKey.json"

def normalizar_texto(texto):
    """Normaliza texto para comparación"""
    if pd.isna(texto) or texto is None:
        return ""
    return str(texto).strip()

def normalizar_cp(cp):
    """Normaliza código postal"""
    if pd.isna(cp) or cp is None:
        return ""
    # Convertir a entero si es float (ej: 97138.0 -> 97138)
    try:
        return str(int(float(cp)))
    except:
        return str(cp).strip()

def main(modo="audit"):
    print("=" * 100)
    print("🔍 ARQUEO DE DOMICILIOS: FUENTE DE VERDAD vs FIRESTORE")
    print("=" * 100)
    
    # 1. Leer Excel
    print("\n📊 Leyendo Excel fuente de verdad...")
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=0)
    except Exception as e:
        print(f"❌ Error leyendo Excel: {e}")
        sys.exit(1)
    
    # Agrupar por email (cada fila es un arma, queremos socios únicos)
    socios_excel = {}
    for _, row in df.iterrows():
        email = normalizar_texto(row.get('EMAIL', '')).lower()
        if not email or '@' not in email:
            continue
        
        if email not in socios_excel:
            socios_excel[email] = {
                'nombre': normalizar_texto(row.get('NOMBRE SOCIO', '')),
                'credencial': str(row.get('No. CREDENCIAL', '')),
                'domicilio': {
                    'calle': normalizar_texto(row.get('CALLE', '')),
                    'colonia': normalizar_texto(row.get('COLONIA', '')),
                    'ciudad': normalizar_texto(row.get('CIUDAD', '')),
                    'estado': normalizar_texto(row.get('ESTADO', '')),
                    'cp': normalizar_cp(row.get('CP', ''))
                }
            }
    
    print(f"   Socios únicos en Excel: {len(socios_excel)}")
    
    # 2. Conectar a Firestore
    print("\n🔥 Conectando a Firestore...")
    cred = credentials.Certificate(str(SERVICE_ACCOUNT))
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    # 3. Leer todos los socios de Firestore
    print("📥 Leyendo socios de Firestore...")
    socios_ref = db.collection('socios')
    socios_docs = list(socios_ref.stream())
    print(f"   Socios en Firestore: {len(socios_docs)}")
    
    # 4. Comparar
    print("\n" + "=" * 100)
    print("📋 RESULTADOS DEL ARQUEO")
    print("=" * 100)
    
    sin_domicilio = []
    domicilio_vacio = []
    domicilio_incompleto = []
    domicilio_ok = []
    no_en_firestore = []
    
    for email, datos_excel in socios_excel.items():
        # Buscar en Firestore
        socio_doc = db.collection('socios').document(email).get()
        
        if not socio_doc.exists:
            no_en_firestore.append({
                'email': email,
                'nombre': datos_excel['nombre'],
                'domicilio_excel': datos_excel['domicilio']
            })
            continue
        
        data = socio_doc.to_dict()
        domicilio_fs = data.get('domicilio')
        
        # Caso 1: No existe campo domicilio
        if domicilio_fs is None:
            sin_domicilio.append({
                'email': email,
                'nombre': datos_excel['nombre'],
                'domicilio_excel': datos_excel['domicilio']
            })
            continue
        
        # Caso 2: domicilio es string vacío o no es dict
        if not isinstance(domicilio_fs, dict):
            domicilio_vacio.append({
                'email': email,
                'nombre': datos_excel['nombre'],
                'domicilio_excel': datos_excel['domicilio'],
                'domicilio_firestore': str(domicilio_fs)
            })
            continue
        
        # Caso 3: Es dict pero campos vacíos
        calle_fs = normalizar_texto(domicilio_fs.get('calle', ''))
        colonia_fs = normalizar_texto(domicilio_fs.get('colonia', ''))
        ciudad_fs = normalizar_texto(domicilio_fs.get('ciudad', ''))
        municipio_fs = normalizar_texto(domicilio_fs.get('municipio', ''))
        estado_fs = normalizar_texto(domicilio_fs.get('estado', ''))
        cp_fs = normalizar_cp(domicilio_fs.get('cp', ''))
        
        if not calle_fs and not colonia_fs and not ciudad_fs and not estado_fs:
            domicilio_incompleto.append({
                'email': email,
                'nombre': datos_excel['nombre'],
                'domicilio_excel': datos_excel['domicilio'],
                'domicilio_firestore': domicilio_fs
            })
            continue
        
        # Caso 4: OK
        domicilio_ok.append(email)
    
    # Resumen
    print(f"\n✅ Domicilios correctos:     {len(domicilio_ok)}")
    print(f"❌ Sin campo domicilio:      {len(sin_domicilio)}")
    print(f"❌ Domicilio vacío/string:   {len(domicilio_vacio)}")
    print(f"⚠️  Domicilio incompleto:    {len(domicilio_incompleto)}")
    print(f"⚠️  No existe en Firestore:  {len(no_en_firestore)}")
    
    # Detalle de problemas
    problemas = sin_domicilio + domicilio_vacio + domicilio_incompleto
    
    if problemas:
        print("\n" + "-" * 100)
        print("📍 SOCIOS CON PROBLEMAS DE DOMICILIO (a corregir):")
        print("-" * 100)
        
        for i, p in enumerate(problemas, 1):
            print(f"\n{i}. {p['nombre']} ({p['email']})")
            print(f"   📧 Credencial: {socios_excel[p['email']]['credencial']}")
            dom = p['domicilio_excel']
            print(f"   📍 FUENTE: {dom['calle']}, {dom['colonia']}, {dom['ciudad']}, {dom['estado']}, CP {dom['cp']}")
            if 'domicilio_firestore' in p:
                print(f"   🔥 FIRESTORE: {p['domicilio_firestore']}")
    
    # Modo FIX
    if modo == "fix" and problemas:
        print("\n" + "=" * 100)
        print("🔧 MODO FIX: Corrigiendo domicilios...")
        print("=" * 100)
        
        corregidos = 0
        errores = 0
        
        for p in problemas:
            email = p['email']
            dom_correcto = p['domicilio_excel']
            
            # Agregar municipio = ciudad si no existe
            dom_correcto['municipio'] = dom_correcto.get('ciudad', '')
            dom_correcto['numero'] = ''  # Campo esperado por GeneradorPETA
            
            try:
                db.collection('socios').document(email).update({
                    'domicilio': dom_correcto
                })
                corregidos += 1
                print(f"   ✅ {email}")
            except Exception as e:
                errores += 1
                print(f"   ❌ {email}: {e}")
        
        print(f"\n📊 Resultado: {corregidos} corregidos, {errores} errores")
    
    elif problemas and modo == "audit":
        print(f"\n💡 Para corregir, ejecuta: python3 {__file__} fix")
    
    firebase_admin.delete_app(app)
    print("\n" + "=" * 100)
    
    return problemas

if __name__ == "__main__":
    modo = sys.argv[1] if len(sys.argv) > 1 else "audit"
    main(modo)

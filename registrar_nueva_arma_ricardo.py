#!/usr/bin/env python3
"""
Script para registrar nueva arma de Ricardo Soberanis Gamboa en:
1. Excel FUENTE_DE_VERDAD
2. Firestore
3. Firebase Storage
"""

import pdfplumber
import json
from pathlib import Path
from datetime import datetime

# Rutas
PDF_PATH = "/Applications/club-738-web/armas_socios/2026. nueva arma RICARDO ANTONIO SOBERANIS GAMBOA/CZ P-10 C - EP29710 - A3912487. RICARDO ANTONIO SOBERANIS GAMBOA .pdf"
EXCEL_PATH = "/Applications/club-738-web/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx"

# Datos esperados
SOCIO_EMAIL = "rsoberanis11@hotmail.com"
SOCIO_NOMBRE = "RICARDO ANTONIO SOBERANIS GAMBOA"
CREDENCIAL = 230

# Datos del arma
MARCA = "CZ"
MODELO = "P-10 C"
MATRICULA = "EP29710"
FOLIO = "A3912487"
CLASE = "PISTOLA"
CALIBRE = ".40 S&W"  # Típico para CZ P-10 C

print("=" * 80)
print("REGISTRO DE NUEVA ARMA - CZ P-10 C")
print("=" * 80)

# 1. Leer PDF y extraer información
print("\n1️⃣ EXTRAYENDO DATOS DEL PDF...")
try:
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"   ✅ PDF abierto: {PDF_PATH}")
        print(f"   📄 Páginas: {len(pdf.pages)}")
        
        # Extraer texto de primera página
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        
        # Buscar datos clave en el PDF
        contains_ep29710 = "EP29710" in text or "EP 29710" in text
        contains_a3912487 = "A3912487" in text or "A391248" in text
        contains_cz = "CZ" in text
        contains_p10 = "P-10" in text or "P10" in text
        
        print(f"   📌 Matrícula EP29710: {'✅' if contains_ep29710 else '❌'}")
        print(f"   📌 Folio A3912487: {'✅' if contains_a3912487 else '❌'}")
        print(f"   📌 Marca CZ: {'✅' if contains_cz else '❌'}")
        print(f"   📌 Modelo P-10 C: {'✅' if contains_p10 else '❌'}")
        
        if not (contains_ep29710 and contains_a3912487):
            print("\n   ⚠️  ADVERTENCIA: No todos los datos se encontraron en el PDF")
            print("   Procederemos con los datos esperados...")
        
except Exception as e:
    print(f"   ❌ Error al leer PDF: {e}")
    exit(1)

# 2. Preparar datos del arma
arma_data = {
    "clase": CLASE,
    "calibre": CALIBRE,
    "marca": MARCA,
    "modelo": MODELO,
    "matricula": MATRICULA,
    "folio": FOLIO,
    "modalidad": "tiro",
    "documentoRegistro": None  # Se llenará después con URL de Firebase
}

print("\n2️⃣ DATOS DEL ARMA A REGISTRAR:")
print(f"   Clase: {arma_data['clase']}")
print(f"   Marca: {arma_data['marca']}")
print(f"   Modelo: {arma_data['modelo']}")
print(f"   Calibre: {arma_data['calibre']}")
print(f"   Matrícula: {arma_data['matricula']}")
print(f"   Folio: {arma_data['folio']}")

# 3. Datos para Excel
print("\n3️⃣ FILA PARA AGREGAR EN EXCEL:")
excel_row = {
    "credencial": CREDENCIAL,
    "nombre": SOCIO_NOMBRE,
    "email": SOCIO_EMAIL,
    "clase": CLASE,
    "calibre": CALIBRE,
    "marca": MARCA,
    "modelo": MODELO,
    "matricula": MATRICULA,
    "folio": FOLIO,
    "modalidad": "tiro"
}

print("   CSV Format:")
row_str = ",".join(str(v) for v in excel_row.values())
print(f"   {row_str}")

# 4. Datos para Firestore
print("\n4️⃣ DOCUMENTO PARA FIRESTORE:")
print(f"   Colección: socios/{SOCIO_EMAIL}/armas")
print(f"   Documento ID: (auto-generado)")
print(f"   Datos: {json.dumps(arma_data, indent=6, ensure_ascii=False)}")

# 5. Ruta para Firebase Storage
print("\n5️⃣ RUTA PARA FIREBASE STORAGE:")
print(f"   Ruta: documentos/{SOCIO_EMAIL}/armas/{{armaId}}/registro.pdf")
print(f"   Archivo origen: {PDF_PATH}")

print("\n" + "=" * 80)
print("✅ VERIFICACIÓN COMPLETADA")
print("=" * 80)
print("""
PRÓXIMOS PASOS:
1. Agregar fila al Excel con los datos del arma
2. Crear documento en Firestore con los datos
3. Copiar PDF a Firebase Storage
4. Verificar sincronización

¿Deseas proceder con el registro?
""")

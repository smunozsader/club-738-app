#!/usr/bin/env python3
"""
Script para verificar OCR del PDF de la nueva arma de Ricardo Antonio Soberanis Gamboa
y extraer datos relevantes.
"""

import os
import sys

try:
    import pdfplumber
    print("✓ pdfplumber disponible")
except ImportError:
    print("⚠ pdfplumber no disponible, intentando pytesseract...")
    try:
        import pytesseract
        from pdf2image import convert_from_path
        print("✓ pytesseract y pdf2image disponibles")
    except ImportError:
        print("✗ Ni pdfplumber ni pytesseract disponibles")

pdf_path = "/Applications/club-738-web/armas_socios/2026. nueva arma RICARDO ANTONIO SOBERANIS GAMBOA/CZ P-10 C - EP29710 - A3912487. RICARDO ANTONIO SOBERANIS GAMBOA .pdf"

if not os.path.exists(pdf_path):
    print(f"✗ Archivo no existe: {pdf_path}")
    sys.exit(1)

print(f"\n📄 Procesando: {os.path.basename(pdf_path)}")
print(f"   Tamaño: {os.path.getsize(pdf_path) / (1024*1024):.2f} MB\n")

# Intentar con pdfplumber primero
try:
    import pdfplumber
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"✓ PDF abierto. Páginas: {len(pdf.pages)}\n")
        
        for i, page in enumerate(pdf.pages):
            print(f"--- PÁGINA {i+1} ---")
            text = page.extract_text()
            if text:
                print(text[:1500])  # Primeros 1500 caracteres
            else:
                print("(Sin texto extraíble)")
            print()
            
except Exception as e:
    print(f"✗ Error con pdfplumber: {e}\n")
    
    # Intentar con pytesseract
    try:
        import pytesseract
        from pdf2image import convert_from_path
        
        print("Intentando con pytesseract...\n")
        images = convert_from_path(pdf_path)
        
        for i, image in enumerate(images):
            print(f"--- PÁGINA {i+1} (OCR con Tesseract) ---")
            text = pytesseract.image_to_string(image, lang='spa')
            print(text[:1500])
            print()
            
    except Exception as e2:
        print(f"✗ Error con pytesseract: {e2}")
        print("\n⚠ No se pudo extraer texto del PDF automáticamente.")
        print("   Posible razón: PDF sin OCR o protegido")

print("\n📋 RESUMEN ESPERADO:")
print("   - Tipo: PISTOLA")
print("   - Marca: CZ")
print("   - Modelo: P-10 C")
print("   - Matrícula: EP29710")
print("   - Folio: A3912487")
print("   - Calibre: .40 S&W (por confirmar en OCR)")

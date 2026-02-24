#!/usr/bin/env python3
"""
Buscar sección PETA en Manual DN27
"""
from pdf2image import convert_from_path
import pytesseract

print("Buscando sección de Transportación de Armas para Caza/Tiro...")

# Buscar en bloques de 20 páginas
for start in range(0, 200, 20):
    try:
        pages = convert_from_path(
            'docs/legal/DN27/DN27. Manual_de_Serv._Pub.pdf', 
            dpi=200, 
            first_page=start+1, 
            last_page=min(start+20, 200)
        )
        
        for i, page in enumerate(pages, start=start+1):
            text = pytesseract.image_to_string(page, lang='spa')
            text_lower = text.lower()
            
            # Buscar sección específica de PETA
            if ('transportación de armas' in text_lower or 'permiso extraordinario' in text_lower) and \
               ('caza' in text_lower or 'tiro' in text_lower or 'competencia' in text_lower):
                print(f'\n=== PÁGINA {i} ===')
                print(text)
                print('='*80)
                
    except Exception as e:
        print(f"Error en páginas {start+1}-{start+20}: {e}")
        break

print("\nBúsqueda completada.")

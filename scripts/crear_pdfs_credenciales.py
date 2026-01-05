#!/usr/bin/env python3
"""
Crear PDFs de impresión para credenciales del Club 738
Layout: 2 columnas x 4 filas = 8 credenciales por hoja
Volteo: Por borde largo (columnas invertidas en reverso)
"""

from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import os
import re

# Configuración
carpeta = "(Bulk 1) 2026 CREDENCIAL Club de Caza, Tiro y Pesca de Yucatan, AC"
output_dir = "Credencial-Club-2026/PDFs_Impresion"
os.makedirs(output_dir, exist_ok=True)

# Tamaño hoja carta
PAGE_WIDTH, PAGE_HEIGHT = letter  # 8.5 x 11 inches

# Layout: 2 columnas x 4 filas = 8 credenciales por hoja
COLS = 2
ROWS = 4
CREDS_PER_PAGE = COLS * ROWS

# Calcular tamaño de cada credencial (con margen)
MARGIN = 0.25 * inch
USABLE_WIDTH = PAGE_WIDTH - 2 * MARGIN
USABLE_HEIGHT = PAGE_HEIGHT - 2 * MARGIN

CARD_WIDTH = USABLE_WIDTH / COLS
CARD_HEIGHT = USABLE_HEIGHT / ROWS

print(f"Tamaño hoja: {PAGE_WIDTH/inch:.1f} x {PAGE_HEIGHT/inch:.1f} inches")
print(f"Tamaño credencial: {CARD_WIDTH/inch:.2f} x {CARD_HEIGHT/inch:.2f} inches")
print(f"Layout: {COLS} x {ROWS} = {CREDS_PER_PAGE} por hoja")

# Obtener lista de archivos ordenados
def get_sorted_files(tipo):
    files = [f for f in os.listdir(carpeta) if f.startswith(f"Credencial 2026 {tipo}")]
    def get_num(f):
        match = re.search(r'\((\d+)\)', f)
        return int(match.group(1)) if match else 0
    return sorted(files, key=get_num)

anversos = get_sorted_files("ANVERSO")
reversos = get_sorted_files("REVERSO")

print(f"\nAnversos: {len(anversos)}")
print(f"Reversos: {len(reversos)}")

# Función para crear PDF
def crear_pdf(filename, imagenes, invertir_columnas=False):
    c = canvas.Canvas(filename, pagesize=letter)
    
    total_pages = (len(imagenes) + CREDS_PER_PAGE - 1) // CREDS_PER_PAGE
    
    for page_num in range(total_pages):
        start_idx = page_num * CREDS_PER_PAGE
        page_images = imagenes[start_idx:start_idx + CREDS_PER_PAGE]
        
        for i, img_file in enumerate(page_images):
            row = i // COLS
            col = i % COLS
            
            # Si invertir_columnas, intercambiar columnas para el reverso
            if invertir_columnas:
                col = (COLS - 1) - col
            
            # Calcular posición (origen en esquina inferior izquierda)
            x = MARGIN + col * CARD_WIDTH
            y = PAGE_HEIGHT - MARGIN - (row + 1) * CARD_HEIGHT
            
            # Dibujar imagen
            img_path = os.path.join(carpeta, img_file)
            c.drawImage(img_path, x, y, width=CARD_WIDTH, height=CARD_HEIGHT, preserveAspectRatio=True)
        
        if page_num < total_pages - 1:
            c.showPage()
    
    c.save()
    print(f"✅ Creado: {filename}")

# Crear PDFs
crear_pdf(f"{output_dir}/ANVERSOS.pdf", anversos, invertir_columnas=False)
crear_pdf(f"{output_dir}/REVERSOS.pdf", reversos, invertir_columnas=True)

print(f"\n🖨️  PDFs listos en: {output_dir}/")
print(f"\nInstrucciones de impresión:")
print("1. Imprime ANVERSOS.pdf")
print("2. Voltea las hojas por el BORDE LARGO")
print("3. Imprime REVERSOS.pdf en el reverso")
print("4. Corta las credenciales")

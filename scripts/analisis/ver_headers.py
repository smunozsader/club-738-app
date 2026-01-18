import openpyxl
wb = openpyxl.load_workbook('/Applications/club-738-web/2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS_NORMALIZADO.xlsx')
ws = wb.active
headers = [cell.value for cell in ws[1]]
for i, h in enumerate(headers, 1):
    if h:
        print(f'Col {i}: {h}')

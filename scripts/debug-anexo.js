#!/usr/bin/env node

import XLSX from 'xlsx';

const dicFile = 'data/referencias/2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_ANEXOS A, B Y C_CORREGIDO_FINAL.xlsx';
const wb = XLSX.readFile(dicFile);
const ws = wb.Sheets['Anexo A'];

// Buscar la fila con RICARDO
for (let row = 1; row <= 30; row++) {
  const cellB = ws['B' + row];
  if (cellB && (cellB.v || cellB.w)) {
    const val = String(cellB.v || cellB.w);
    if (val.includes('RICARDO')) {
      console.log(`Encontrado en fila ${row}: ${val}`);
      console.log('Fila completa:');
      for (let col = 0; col < 10; col++) {
        const c = ws[XLSX.utils.encode_col(col) + row];
        if (c) {
          console.log(`  ${XLSX.utils.encode_col(col)}${row}: ${c.v || c.w}`);
        }
      }
      break;
    }
  }
}

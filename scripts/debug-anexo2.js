#!/usr/bin/env node

import XLSX from 'xlsx';

const file = 'data/referencias/2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_ANEXOS A, B Y C.xlsx';
const wb = XLSX.readFile(file);
const ws = wb.Sheets['Anexo A'];

console.log('Fila 6 (headers):');
for (let col = 0; col < 12; col++) {
  const cell = ws[XLSX.utils.encode_col(col) + '6'];
  const val = cell ? (cell.v || cell.w || '') : '';
  console.log(`  ${XLSX.utils.encode_col(col)}6: ${val}`);
}

console.log('\nFila 7 (datos):');
for (let col = 0; col < 12; col++) {
  const cell = ws[XLSX.utils.encode_col(col) + '7'];
  if (cell) {
    const val = cell.v || cell.w || '';
    console.log(`  ${XLSX.utils.encode_col(col)}7: ${val}`);
  }
}

console.log('\nFila 8 (datos):');
for (let col = 0; col < 12; col++) {
  const cell = ws[XLSX.utils.encode_col(col) + '8'];
  if (cell) {
    const val = cell.v || cell.w || '';
    console.log(`  ${XLSX.utils.encode_col(col)}8: ${val}`);
  }
}

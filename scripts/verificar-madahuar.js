#!/usr/bin/env node

import XLSX from 'xlsx';

console.log('\n📅 VERIFICAR FECHA DE MADAHUAR\n');
console.log('='.repeat(90));

// Función para convertir serial
function excelSerialToDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const excelEpoch = new Date(1900, 0, 1);
  const date = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000);
  const año = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const día = String(date.getDate()).padStart(2, '0');
  return `${año}-${mes}-${día}`;
}

// Revisar ANEXO A
console.log('\n1️⃣  ANEXO A (diciembre 2025):\n');
const wbAnexo = XLSX.readFile('data/referencias/2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_ANEXOS A, B Y C.xlsx');
const wsAnexo = wbAnexo.Sheets['Anexo A'];

let encontradoAnexo = false;
for (let row = 7; row <= 100; row++) {
  const cellE = wsAnexo['E' + row];
  const email = cellE ? (cellE.v || cellE.w || '').toString().toLowerCase().trim() : '';
  
  if (email.includes('madahuar')) {
    const cellB = wsAnexo['B' + row];
    const cellI = wsAnexo['I' + row];
    const nombre = cellB ? (cellB.v || cellB.w) : 'N/A';
    const fechaSerial = cellI ? cellI.v : null;
    const fechaFormato = excelSerialToDate(fechaSerial);
    
    console.log('✅ ENCONTRADO en ANEXO A:');
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${nombre}`);
    console.log(`   Fecha (serial): ${fechaSerial}`);
    console.log(`   Fecha (formato): ${fechaFormato}`);
    encontradoAnexo = true;
    break;
  }
}

if (!encontradoAnexo) {
  console.log('❌ NO ENCONTRADO en ANEXO A');
}

// Revisar FUENTE DE VERDAD
console.log('\n' + '='.repeat(90));
console.log('\n2️⃣  FUENTE DE VERDAD (actual):\n');

const wbFuente = XLSX.readFile('data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
const wsFuente = wbFuente.Sheets[wbFuente.SheetNames[0]];
const dataFuente = XLSX.utils.sheet_to_json(wsFuente);

const madahuar = dataFuente.find(f => 
  (f.EMAIL || '').toLowerCase().includes('madahuar')
);

if (madahuar) {
  console.log('✅ ENCONTRADO en FUENTE DE VERDAD:');
  console.log(`   Email: ${madahuar.EMAIL}`);
  console.log(`   Nombre: ${madahuar['NOMBRE SOCIO']}`);
  console.log(`   Credencial: ${madahuar['No. CREDENCIAL']}`);
  console.log(`   Teléfono: ${madahuar.TELEFONO}`);
  console.log(`   Fecha ALTA: ${madahuar['FECHA ALTA']}`);
} else {
  console.log('❌ NO ENCONTRADO en FUENTE DE VERDAD');
}

console.log('\n' + '='.repeat(90));
console.log('\n3️⃣  COMPARACIÓN:\n');
console.log('Fecha esperada según usuario: 31-Oct-2012');
console.log('Fecha encontrada: ' + (madahuar ? madahuar['FECHA ALTA'] : 'N/A'));

console.log('\n' + '='.repeat(90) + '\n');

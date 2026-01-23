#!/usr/bin/env node

import XLSX from 'xlsx';

const fuenteFile = 'data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx';

console.log('\n🔧 CORREGIR FECHA DE MADAHUAR\n');
console.log('='.repeat(90) + '\n');

const wbFuente = XLSX.readFile(fuenteFile);
const wsFuente = wbFuente.Sheets[wbFuente.SheetNames[0]];
const dataFuente = XLSX.utils.sheet_to_json(wsFuente);

console.log('ANTES:');
const madahuarBefore = dataFuente.find(f => f.EMAIL && f.EMAIL.toLowerCase().includes('madahuar'));
if (madahuarBefore) {
  console.log(`  Email: ${madahuarBefore.EMAIL}`);
  console.log(`  Nombre: ${madahuarBefore['NOMBRE SOCIO']}`);
  console.log(`  Fecha ALTA: ${madahuarBefore['FECHA ALTA']}\n`);
}

// Buscar y corregir Madahuar
dataFuente.forEach(fila => {
  if (fila.EMAIL && fila.EMAIL.toLowerCase().includes('madahuar')) {
    fila['FECHA ALTA'] = '2012-10-31';
  }
});

console.log('DESPUÉS:');
const madahuarAfter = dataFuente.find(f => f.EMAIL && f.EMAIL.toLowerCase().includes('madahuar'));
if (madahuarAfter) {
  console.log(`  Email: ${madahuarAfter.EMAIL}`);
  console.log(`  Nombre: ${madahuarAfter['NOMBRE SOCIO']}`);
  console.log(`  Fecha ALTA: ${madahuarAfter['FECHA ALTA']}\n`);
}

// Guardar
const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(dataFuente);
XLSX.utils.book_append_sheet(newWb, newWs, 'SOCIOS_ENERO_2026');
XLSX.writeFile(newWb, fuenteFile);

console.log('='.repeat(90));
console.log('\n✅ FECHA DE MADAHUAR CORREGIDA A 2012-10-31\n');

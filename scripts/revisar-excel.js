#!/usr/bin/env node

import XLSX from 'xlsx';

const wb = XLSX.readFile('data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('Total filas en Excel:', data.length);
console.log('\nPrimeras 3 filas:');
data.slice(0, 3).forEach((fila, i) => {
  console.log(`\nFila ${i+1}:`);
  Object.entries(fila).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });
});

// Agrupar por socio (EMAIL)
const porSocio = {};
data.forEach(fila => {
  const email = (fila.EMAIL || '').toLowerCase().trim();
  if (!email) return;
  
  if (!porSocio[email]) {
    porSocio[email] = {
      nombre: fila['NOMBRE SOCIO'],
      credencial: fila['NO. CREDENCIAL'],
      telefono: fila.TELEFONO,
      armas: []
    };
  }
  
  // Agregar arma
  porSocio[email].armas.push({
    clase: fila.CLASE,
    calibre: fila.CALIBRE,
    marca: fila.MARCA,
    modelo: fila.MODELO,
    matricula: fila.MATRÍCULA,
    folio: fila.FOLIO
  });
});

console.log('\n\n='.repeat(90));
console.log(`\n✅ Socios ÚNICOS en Excel: ${Object.keys(porSocio).length}`);
console.log('\nPrimeros 5 socios:');

Object.entries(porSocio).slice(0, 5).forEach(([email, datos]) => {
  console.log(`\n📌 ${email} (${datos.credencial})`);
  console.log(`   Nombre: ${datos.nombre}`);
  console.log(`   Teléfono: ${datos.telefono || 'SIN TELÉFONO'}`);
  console.log(`   Armas: ${datos.armas.length}`);
  datos.armas.forEach((arma, i) => {
    console.log(`      ${i+1}. ${arma.clase} ${arma.calibre} - ${arma.marca} ${arma.modelo}`);
  });
});

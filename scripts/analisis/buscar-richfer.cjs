const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('=== BUSCANDO EMAILS CON "richfer" ===\n');

for (let i = 1; i < data.length; i++) {
  const email = (data[i][7] || '').toLowerCase();
  if (email.includes('richfer')) {
    console.log('Fila:', i + 1);
    console.log('  Email:', data[i][7]);
    console.log('  Nombre:', data[i][2]);
    console.log('  Domicilio:', data[i][5]);
    console.log('');
  }
}

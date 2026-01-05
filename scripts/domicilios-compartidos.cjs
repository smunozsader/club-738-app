const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Agrupar socios por domicilio
const domiciliosSocios = new Map();

for (let i = 1; i < data.length; i++) {
  const nombre = data[i][2]; // Columna C
  const domicilio = data[i][5]; // Columna F
  
  if (nombre && domicilio) {
    if (!domiciliosSocios.has(domicilio)) {
      domiciliosSocios.set(domicilio, new Set());
    }
    domiciliosSocios.get(domicilio).add(nombre);
  }
}

// Mostrar domicilios con más de 1 socio
console.log('=== DOMICILIOS COMPARTIDOS ===\n');
let repetidos = 0;

domiciliosSocios.forEach((socios, domicilio) => {
  if (socios.size > 1) {
    repetidos++;
    console.log('DOMICILIO:', domicilio);
    console.log('SOCIOS:');
    socios.forEach(s => console.log('  -', s));
    console.log('');
  }
});

console.log('Total domicilios compartidos:', repetidos);

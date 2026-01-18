const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const MODE = process.argv[2] || 'audit';

console.log(`=== ELIMINAR FILAS DE TOTALES (modo: ${MODE}) ===\n`);

// Buscar filas con "TOTAL" en columna F (domicilio)
const filasAEliminar = [];
for (let i = 1; i < data.length; i++) {
  const domicilio = data[i][5];
  if (domicilio && (
    domicilio.includes('TOTAL POR PERSONA') ||
    domicilio.includes('TOTAL CORTAS Y LARGAS') ||
    domicilio === 'TOTAL POR PERSONA' ||
    domicilio === 'TOTAL CORTAS Y LARGAS'
  )) {
    filasAEliminar.push(i);
    console.log(`Fila ${i + 1}: "${domicilio}" - ELIMINAR`);
  }
}

console.log(`\nTotal filas a eliminar: ${filasAEliminar.length}`);

if (MODE === 'fix' && filasAEliminar.length > 0) {
  // Eliminar de atrás hacia adelante para no afectar índices
  for (let i = filasAEliminar.length - 1; i >= 0; i--) {
    data.splice(filasAEliminar[i], 1);
  }
  
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  XLSX.writeFile(workbook, excelPath);
  
  console.log(`\n✅ ${filasAEliminar.length} filas eliminadas y archivo guardado.`);
  console.log(`   Filas restantes: ${data.length - 1} (sin contar encabezado)`);
} else if (MODE === 'audit') {
  console.log('\n📋 Modo auditoría. Para eliminar: node scripts/eliminar-filas-totales.cjs fix');
}

const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const MODE = process.argv[2] || 'audit'; // 'audit' o 'fix'

console.log(`=== NORMALIZACIÓN DE DOMICILIOS (modo: ${MODE}) ===\n`);

let cambiosRealizados = 0;

// Función para contar separadores (comas + saltos de línea)
function contarSeparadores(dom) {
  const comas = (dom.match(/,/g) || []).length;
  const saltos = (dom.match(/\n/g) || []).length;
  return { comas, saltos, total: comas + saltos };
}

// Función para normalizar domicilio
function normalizar(dom) {
  // Reemplazar saltos de línea por comas
  let normalizado = dom.replace(/\n/g, ', ');
  // Limpiar espacios múltiples
  normalizado = normalizado.replace(/\s+/g, ' ').trim();
  // Limpiar comas dobles
  normalizado = normalizado.replace(/,\s*,/g, ',');
  return normalizado;
}

// Procesar cada fila
for (let i = 1; i < data.length; i++) {
  if (data[i][5]) {
    const dom = data[i][5];
    const { comas, saltos, total } = contarSeparadores(dom);
    
    if (saltos > 0) {
      const normalizado = normalizar(dom);
      console.log(`Fila ${i + 1}: ${saltos} saltos de línea encontrados`);
      console.log(`  ANTES:   "${dom.replace(/\n/g, '↵')}"`);
      console.log(`  DESPUÉS: "${normalizado}"`);
      console.log('');
      
      if (MODE === 'fix') {
        data[i][5] = normalizado;
        cambiosRealizados++;
      }
    }
  }
}

if (MODE === 'fix' && cambiosRealizados > 0) {
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  XLSX.writeFile(workbook, excelPath);
  console.log(`\n✅ ${cambiosRealizados} domicilios normalizados y guardados.`);
} else if (MODE === 'audit') {
  console.log('\n📋 Modo auditoría. Para aplicar cambios ejecuta: node scripts/normalizar-domicilios.cjs fix');
}

// Mostrar resumen final
console.log('\n=== RESUMEN FINAL ===');
const domicilios = new Map();
for (let i = 1; i < data.length; i++) {
  if (data[i][5]) {
    const dom = data[i][5];
    if (!domicilios.has(dom)) {
      domicilios.set(dom, []);
    }
    domicilios.get(dom).push(i + 1);
  }
}

let correctos = 0;
let pendientes = [];
let idx = 1;
domicilios.forEach((filas, dom) => {
  const { comas, saltos } = contarSeparadores(dom);
  if (comas === 4 && saltos === 0) {
    correctos++;
  } else {
    pendientes.push({ idx, dom, comas, saltos, filas });
  }
  idx++;
});

console.log(`Total domicilios únicos: ${domicilios.size}`);
console.log(`Correctos (4 comas, sin saltos): ${correctos}`);
console.log(`Pendientes: ${pendientes.length}`);

if (pendientes.length > 0 && MODE === 'audit') {
  console.log('\n=== PENDIENTES DE AJUSTAR ===');
  pendientes.forEach(p => {
    console.log(`\n[${p.idx}] (${p.comas} comas) Filas: ${p.filas.join(', ')}`);
    console.log(`   "${p.dom}"`);
  });
}

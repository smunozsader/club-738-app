const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const MODE = process.argv[2] || 'audit';

console.log(`=== PASO 2: NORMALIZACIÓN FINA (modo: ${MODE}) ===\n`);

// Mapa de correcciones específicas
const correcciones = {
  // [7] 5 comas → 4 comas (quitar coma extra después de "BECANCHEN")
  'DOMICILIO CONOCIDO ANEXO 3, CERCA DE LA COCINA, BECANCHEN, TEKAX, YUC.,  CP 97960':
    'DOMICILIO CONOCIDO ANEXO 3 CERCA DE LA COCINA, BECANCHEN, TEKAX, YUC., CP 97960',

  // [11] 3 comas → 4 comas (agregar coma antes de CP, quitar doble punto)
  'CALLE 47-C S/N x 2-A y 4, COL. LEANDRO VALLE DE CHICHI DÍAZ, MÉRIDA, YUC.. CP 97143':
    'CALLE 47-C S/N x 2-A y 4, COL. LEANDRO VALLE DE CHICHI DÍAZ, MÉRIDA, YUC., CP 97143',

  // [23] 2 comas → 4 comas
  'CALLE 26 No. 246 x 15 DEPTO. B COL VISTA ALEGRE, MÉRIDA, YUC. C.P. 97130':
    'CALLE 26 No. 246 x 15 DEPTO. B, COL VISTA ALEGRE, MÉRIDA, YUC., CP 97130',

  // [25] 3 comas → 4 comas
  'CALLE 17 No. 87 x 16 y 18, COL. MÉXICO NORTE, MÉRIDA, YUC. C.P. 97128':
    'CALLE 17 No. 87 x 16 y 18, COL. MÉXICO NORTE, MÉRIDA, YUC., CP 97128',

  // [26] 3 comas → 4 comas
  'CALLE 41 No. 162 x 36-D y 38, COL. BENITO JUÁREZ NORTE, MÉRIDA, YUC. C.P. 97119':
    'CALLE 41 No. 162 x 36-D y 38, COL. BENITO JUÁREZ NORTE, MÉRIDA, YUC., CP 97119',

  // [27] 3 comas → 4 comas
  'CALLE 29 No. 471 x 42 y 46-A, COL. GONZALO GUERRERO, MÉRIDA, YUC. C.P. 97118':
    'CALLE 29 No. 471 x 42 y 46-A, COL. GONZALO GUERRERO, MÉRIDA, YUC., CP 97118',

  // [28] 3 comas → 4 comas
  'CALLE 2 No. 343 x 29 y 31, COL. SALVADOR ALVARADO SUR, MÉRIDA, YUC. C.P. 97196':
    'CALLE 2 No. 343 x 29 y 31, COL. SALVADOR ALVARADO SUR, MÉRIDA, YUC., CP 97196',

  // [29] 3 comas → 4 comas
  'CALLE 31 No. 197 x 20 y 22, FRACC. LIMONES, MÉRIDA, YUC. C.P. 97219':
    'CALLE 31 No. 197 x 20 y 22, FRACC. LIMONES, MÉRIDA, YUC., CP 97219',

  // [30] 3 comas → 4 comas
  'CALLE 16 S/N x 19 y 21, CENTRO, CANDELARIA, CAMP. C.P. 24330':
    'CALLE 16 S/N x 19 y 21, CENTRO, CANDELARIA, CAMP., CP 24330',

  // [31] 2 comas → 4 comas
  'CALLE 12 No. 404-C x 15-A y 17 COL. DÍAZ ORDAZ, MÉRIDA, YUC. C.P. 97130':
    'CALLE 12 No. 404-C x 15-A y 17, COL. DÍAZ ORDAZ, MÉRIDA, YUC., CP 97130',

  // [32] 3 comas → 4 comas
  'CALLE 28 No. 168-A x 21-A y 21-B, FRACC. SAN PEDRO CHOLUL, MÉRIDA, YUC. C.P. 97138':
    'CALLE 28 No. 168-A x 21-A y 21-B, FRACC. SAN PEDRO CHOLUL, MÉRIDA, YUC., CP 97138',

  // [33] 3 comas → 4 comas
  'C. 19-B No. 602 x 88, FRACC. ALGARROBOS, MÉRIDA, YUC. C.P. 97300':
    'C. 19-B No. 602 x 88, FRACC. ALGARROBOS, MÉRIDA, YUC., CP 97300',

  // [35] 3 comas → 4 comas
  'CALLE 20 No. 11399 x 29 y 29-B, SAN JOSE CHOLUL, MÉRIDA, YUC. C.P. 97305':
    'CALLE 20 No. 11399 x 29 y 29-B, SAN JOSE CHOLUL, MÉRIDA, YUC., CP 97305',

  // [36] 3 comas → 4 comas
  'CALLE 23-A x 16 y 18 No. 220, COL. SAN MIGUEL, MÉRIDA, YUC. C.P. 97140':
    'CALLE 23-A x 16 y 18 No. 220, COL. SAN MIGUEL, MÉRIDA, YUC., CP 97140',

  // [37] 3 comas → 4 comas
  'CALLE 30-A No. 502-N x 69-A y 71, COL. AZCORRA, MÉRIDA, YUC. C.P. 97177':
    'CALLE 30-A No. 502-N x 69-A y 71, COL. AZCORRA, MÉRIDA, YUC., CP 97177',

  // [39] 2 comas → 4 comas
  'C. 27 No. 331 x 40 y 42 SODZIL NORTE, MÉRIDA, YUC. C.P. 97115':
    'C. 27 No. 331 x 40 y 42, SODZIL NORTE, MÉRIDA, YUC., CP 97115',

  // [40] 3 comas → 4 comas
  'C. 12-A No. 61, SANTA GERTRUDIS COPO, MÉRIDA, YUC. C.P. 97305':
    'C. 12-A No. 61, SANTA GERTRUDIS COPO, MÉRIDA, YUC., CP 97305',

  // [41] 3 comas → 4 comas
  'C. 137 No. 1295, FRACC. DIAMANTE OPICHEN, MÉRIDA, YUC. C.P. 97249':
    'C. 137 No. 1295, FRACC. DIAMANTE OPICHEN, MÉRIDA, YUC., CP 97249',

  // [42] 3 comas → 4 comas (C.P. sin espacio)
  'C. 29 No. 216 x 4 y 6, SANTA MARIA CHI, MÉRIDA, YUC. C.P.97306':
    'C. 29 No. 216 x 4 y 6, SANTA MARIA CHI, MÉRIDA, YUC., CP 97306',

  // [44] 3 comas → 4 comas
  'C. 26 S/N x 53 y 55, TEKAX DE ALVARO OBREGON, TEKAX, YUC. C.P. 97970':
    'C. 26 S/N x 53 y 55, TEKAX DE ALVARO OBREGON, TEKAX, YUC., CP 97970',

  // [45] 3 comas → 4 comas
  'C. 18-A x 31-D y 35, COL. NUEVA ALEMÁN, MÉRIDA, YUC. C.P. 97146':
    'C. 18-A x 31-D y 35, COL. NUEVA ALEMÁN, MÉRIDA, YUC., CP 97146',

  // [47] 2 comas → 4 comas (punto mal ubicado)
  'C. 103 # 624 X 142 Y 144, FRACC. LOS HEROES. MÉRIDA, YUCATÁN. CP 97306':
    'C. 103 # 624 X 142 Y 144, FRACC. LOS HEROES, MÉRIDA, YUCATÁN, CP 97306',

  // [48] 3 comas → 4 comas (espacios extra)
  'CALLE 129 NO. 584 X 138 Y 140 , FRACC LOS HEROES , MÉRIDA, YUCATÁN CP 97306':
    'CALLE 129 NO. 584 X 138 Y 140, FRACC LOS HEROES, MÉRIDA, YUCATÁN, CP 97306',

  // [51] 5 comas → 4 comas (DEPTO tiene coma innecesaria)
  'TABLAJE 13037 DEPTO, 19 GRAND VIEW 6 Y 8 , CHOLUL, MÉRIDA, YUCATÁN, C.P. 97305':
    'TABLAJE 13037 DEPTO 19 GRAND VIEW 6 Y 8, CHOLUL, MÉRIDA, YUCATÁN, CP 97305',

  // [53] 2 comas → 4 comas
  'C 40 POR 67 Y 69 234 , COL MONTES DE AME. MÉRIDA, YUC. CP 97115':
    'C 40 POR 67 Y 69 234, COL MONTES DE AME, MÉRIDA, YUC., CP 97115',

  // [54] 3 comas → 4 comas (falta CP)
  'TABLAJE 15687 LOTE 35 COMPOSTELA, XCANATUN, MÉRIDA, YUCATÁN':
    'TABLAJE 15687 LOTE 35 COMPOSTELA, XCANATUN, MÉRIDA, YUCATÁN, CP 97302',

  // [56] 3 comas → 4 comas
  'Calle 51-C # 643 x 72 y 72-A, Real Montejo, MÉRIDA, YUCATÁN CP 97302':
    'Calle 51-C # 643 x 72 y 72-A, Real Montejo, MÉRIDA, YUCATÁN, CP 97302',

  // [57] 3 comas → 4 comas
  'Calle 74 No. 629 x 37-A y 39, Fracc. Jardines de Caucel, MÉRIDA, Yuc. CP 97314':
    'Calle 74 No. 629 x 37-A y 39, Fracc. Jardines de Caucel, MÉRIDA, Yuc., CP 97314',

  // [58] 3 comas → 4 comas (orden incorrecto CP antes de ciudad)
  'Calle 20A Núm 407 x 33 y 35. , Colonia Nueva Alemán , C.P. 97145 MÉRIDA, Yuc.':
    'Calle 20A Núm 407 x 33 y 35, Colonia Nueva Alemán, MÉRIDA, Yuc., CP 97145',

  // [59] 3 comas → 4 comas (formato Google)
  'C. 81 112-2, Temozon Norte, 97302 MÉRIDA, Yuc.':
    'C. 81 112-2, Temozon Norte, MÉRIDA, Yuc., CP 97302',

  // [61] 3 comas → 4 comas
  'Calle 15 NÚM 314 x 32 y 34 Montecarlo, MÉRIDA, Yucatán, CP 97130':
    'Calle 15 NÚM 314 x 32 y 34, Montecarlo, MÉRIDA, Yucatán, CP 97130',

  // [62] 3 comas → 4 comas (formato Google)
  'C. 65 87, Col. Justo Sierra, 24114 Ciudad del Carmen, Campeche':
    'C. 65 87, Col. Justo Sierra, Ciudad del Carmen, Campeche, CP 24114',

  // [63] 3 comas → 4 comas (formato Google)
  'C. 43 322 X 36 Y 36A, San Ramón Norte, 97117 MÉRIDA, Yucatán':
    'C. 43 322 X 36 Y 36A, San Ramón Norte, MÉRIDA, Yucatán, CP 97117',

  // [68] 1 coma → 4 comas
  'Calle 35 SN INT. townhouse Temozón Norte, Mérida Yucatán 97302':
    'Calle 35 SN INT. townhouse, Temozón Norte, Mérida, Yucatán, CP 97302',

  // [69] 3 comas → 4 comas (CP en medio)
  'Calle 28 x 5 y 7 48-A Col Granjas Cholul, CP 97305, Merida, Yucatan':
    'Calle 28 x 5 y 7 48-A, Col Granjas Cholul, Merida, Yucatan, CP 97305',

  // [70] 5 comas → 4 comas
  'Calle Tzolkin Num 48, Privada Kinish, Cholul, Merida, Yucatan, CP 97305 ':
    'Calle Tzolkin Num 48 Privada Kinish, Cholul, Merida, Yucatan, CP 97305',

  // [71] 5 comas → 4 comas (T.C. es tablaje catastral)
  'Calle 23 S/N, T.C. 50641, Colonia San Antonio Hool, CP 97302, Mérida, Yucatán':
    'Calle 23 S/N T.C. 50641, Colonia San Antonio Hool, Mérida, Yucatán, CP 97302',

  // [72] 3 comas → 4 comas (espacios extra, CP en colonia)
  'C 13 POR 62 Y 64 655 , RESIDENCIAL PENSIONES 97219 , MERIDA, YUC.':
    'C 13 POR 62 Y 64 655, RESIDENCIAL PENSIONES, MERIDA, YUC., CP 97219',

  // [73] 3 comas → 4 comas
  'C. 37-A # 311 X 24 FRACC. MONTEALBAN , MERIDA, YUCATAN, CP 97114':
    'C. 37-A # 311 X 24, FRACC. MONTEALBAN, MERIDA, YUCATAN, CP 97114',

  // [74] 2 comas → 4 comas (falta CP)
  'Calle 111 No 514 x 132 y 134A Fraccionamiento los Héroes. , Mérida, Yucatán':
    'Calle 111 No 514 x 132 y 134A, Fraccionamiento los Héroes, Mérida, Yucatán, CP 97306',

  // [75] 3 comas → 4 comas (CP en colonia)
  'C 63 D POR 88 TAB 42155 , LOC DZITYA 97302 , MERIDA, YUC.':
    'C 63 D POR 88 TAB 42155, LOC DZITYA, MERIDA, YUC., CP 97302',
};

let cambiosRealizados = 0;

for (let i = 1; i < data.length; i++) {
  const domActual = data[i][5];
  if (domActual && correcciones[domActual]) {
    const nuevo = correcciones[domActual];
    console.log(`Fila ${i + 1}:`);
    console.log(`  ANTES:   "${domActual}"`);
    console.log(`  DESPUÉS: "${nuevo}"`);
    console.log('');
    
    if (MODE === 'fix') {
      data[i][5] = nuevo;
      cambiosRealizados++;
    }
  }
}

if (MODE === 'fix' && cambiosRealizados > 0) {
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  XLSX.writeFile(workbook, excelPath);
  console.log(`\n✅ ${cambiosRealizados} domicilios normalizados y guardados.`);
} else if (MODE === 'audit') {
  console.log(`📋 Modo auditoría. ${Object.keys(correcciones).length} correcciones definidas.`);
  console.log('   Para aplicar: node scripts/normalizar-domicilios-paso2.cjs fix');
}

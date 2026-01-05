/**
 * Script para importar domicilios normalizados del Excel a Firestore
 * 
 * Parsea la columna F (DOMICILIO DEL SOCIO) con formato:
 * "CALLE, COLONIA, MUNICIPIO, ESTADO, CP XXXXX"
 * 
 * Y actualiza cada documento de socio en Firestore con:
 * {
 *   domicilio: {
 *     calle: "...",
 *     colonia: "...",
 *     municipio: "...",
 *     estado: "...",
 *     cp: "..."
 *   }
 * }
 */

const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const MODE = process.argv[2] || 'audit'; // 'audit' o 'fix'

async function parsearDomicilio(domicilioCompleto) {
  if (!domicilioCompleto) return null;
  
  const partes = domicilioCompleto.split(',').map(p => p.trim());
  
  if (partes.length !== 5) {
    console.warn(`  ⚠️  Domicilio con ${partes.length} partes (esperadas 5): ${domicilioCompleto.substring(0, 50)}...`);
    return null;
  }
  
  // Extraer CP (quitar prefijo "CP " o "C.P. ")
  let cpRaw = partes[4];
  let cp = cpRaw.replace(/^C\.?P\.?\s*/i, '').trim();
  
  return {
    calle: partes[0],
    colonia: partes[1],
    municipio: partes[2],
    estado: partes[3],
    cp: cp
  };
}

async function importarDomicilios() {
  console.log(`\n=== IMPORTAR DOMICILIOS A FIRESTORE (modo: ${MODE}) ===\n`);
  
  // Leer Excel
  const excelPath = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Crear mapa email -> domicilio (para evitar duplicados)
  const sociosDomicilio = new Map();
  
  for (let i = 1; i < data.length; i++) {
    const email = data[i][7]; // Columna H
    const domicilioCompleto = data[i][5]; // Columna F
    
    if (email && domicilioCompleto && !sociosDomicilio.has(email.toLowerCase())) {
      const domicilioParsed = await parsearDomicilio(domicilioCompleto);
      if (domicilioParsed) {
        sociosDomicilio.set(email.toLowerCase(), {
          email: email.toLowerCase(),
          domicilioOriginal: domicilioCompleto,
          domicilio: domicilioParsed
        });
      }
    }
  }
  
  console.log(`Socios con domicilio parseado: ${sociosDomicilio.size}\n`);
  
  // Procesar cada socio
  let actualizados = 0;
  let errores = 0;
  
  for (const [email, datos] of sociosDomicilio) {
    console.log(`[${actualizados + errores + 1}] ${email}`);
    console.log(`    Calle: ${datos.domicilio.calle}`);
    console.log(`    Colonia: ${datos.domicilio.colonia}`);
    console.log(`    Municipio: ${datos.domicilio.municipio}`);
    console.log(`    Estado: ${datos.domicilio.estado}`);
    console.log(`    CP: ${datos.domicilio.cp}`);
    
    if (MODE === 'fix') {
      try {
        const socioRef = db.collection('socios').doc(email);
        const docSnap = await socioRef.get();
        
        if (docSnap.exists) {
          await socioRef.update({
            domicilio: datos.domicilio
          });
          console.log(`    ✅ Actualizado en Firestore`);
          actualizados++;
        } else {
          console.log(`    ⚠️  No existe en Firestore`);
          errores++;
        }
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        errores++;
      }
    }
    console.log('');
  }
  
  console.log('\n=== RESUMEN ===');
  console.log(`Total socios procesados: ${sociosDomicilio.size}`);
  
  if (MODE === 'fix') {
    console.log(`Actualizados en Firestore: ${actualizados}`);
    console.log(`Errores: ${errores}`);
  } else {
    console.log('\n📋 Modo auditoría. Para importar a Firestore ejecuta:');
    console.log('   node scripts/importar-domicilios-firestore.cjs fix');
  }
}

importarDomicilios()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

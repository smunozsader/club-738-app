/**
 * Script para actualizar domicilios de socios en Firestore con 6 campos
 * 
 * Lee del Excel normalizado con columnas F-L:
 * F: CALLE
 * G: COLONIA
 * H: CIUDAD
 * I: CIUDAD (duplicada)
 * J: MUNICIPIO
 * K: ESTADO
 * L: CODIGO POSTAL
 * 
 * Actualiza Firestore con estructura:
 * {
 *   domicilio: {
 *     calle: "...",
 *     colonia: "...",
 *     ciudad: "...",
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

async function actualizarDomicilios() {
  console.log(`\n📍 ACTUALIZAR DOMICILIOS EN FIRESTORE (6 CAMPOS)`);
  console.log(`   Modo: ${MODE === 'fix' ? 'ESCRITURA' : 'SOLO LECTURA'}`);
  console.log('=' .repeat(80) + '\n');
  
  // Leer Excel
  const excelPath = path.join(__dirname, '../data/socios/2025.31.12_RELACION_SOCIOS_ARMAS copia con direccion.xlsx');
  console.log('📖 Leyendo Excel:', excelPath);
  
  const workbook = XLSX.readFile(excelPath);
  const sheetName = 'CLUB 738. RELACION SOCIOS 31 DI';
  const sheet = workbook.Sheets[sheetName];
  
  if (!sheet) {
    console.error('❌ No se encontró la hoja:', sheetName);
    process.exit(1);
  }
  
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`✅ Filas leídas: ${data.length}\n`);
  
  // Crear mapa email -> domicilio (evitar duplicados)
  const sociosDomicilio = new Map();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Columnas del Excel (0-indexed)
    const email = row[13];     // N: EMAIL
    const calle = row[5];      // F: CALLE
    const colonia = row[6];    // G: COLONIA
    const ciudad = row[7];     // H: CIUDAD
    const municipio = row[9];  // J: MUNICIPIO
    const estado = row[10];    // K: ESTADO
    const cp = row[11];        // L: CODIGO POSTAL
    
    // Validar email y calle
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      continue;
    }
    
    if (!calle) {
      continue;
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Solo guardar el primer registro de cada socio
    if (!sociosDomicilio.has(emailLower)) {
      sociosDomicilio.set(emailLower, {
        email: emailLower,
        domicilio: {
          calle: calle ? String(calle).trim() : '',
          colonia: colonia ? String(colonia).trim() : '',
          ciudad: ciudad ? String(ciudad).trim() : '',
          municipio: municipio ? String(municipio).trim() : '',
          estado: estado ? String(estado).trim() : '',
          cp: cp ? String(cp).trim() : ''
        }
      });
    }
  }
  
  console.log(`📊 Socios únicos con domicilio: ${sociosDomicilio.size}\n`);
  
  // Mostrar muestra
  console.log('📋 Muestra de datos (primeros 3):');
  console.log('-'.repeat(80));
  let count = 0;
  for (const [email, datos] of sociosDomicilio) {
    if (count >= 3) break;
    console.log(`\n${email}:`);
    console.log(`  Calle:     ${datos.domicilio.calle.substring(0, 50)}${datos.domicilio.calle.length > 50 ? '...' : ''}`);
    console.log(`  Colonia:   ${datos.domicilio.colonia}`);
    console.log(`  Ciudad:    ${datos.domicilio.ciudad}`);
    console.log(`  Municipio: ${datos.domicilio.municipio}`);
    console.log(`  Estado:    ${datos.domicilio.estado}`);
    console.log(`  CP:        ${datos.domicilio.cp}`);
    count++;
  }
  console.log('-'.repeat(80) + '\n');
  
  if (MODE === 'audit') {
    console.log('ℹ️  MODO AUDIT - No se modificará Firestore');
    console.log('   Para actualizar Firestore, ejecuta: node actualizar-domicilios-6-campos.cjs fix\n');
    return;
  }
  
  // Modo FIX - Actualizar Firestore
  console.log('🔄 Actualizando Firestore...\n');
  
  let actualizados = 0;
  let errores = 0;
  let noExisten = 0;
  
  for (const [email, datos] of sociosDomicilio) {
    const socioRef = db.collection('socios').doc(email);
    
    try {
      const docSnap = await socioRef.get();
      
      if (!docSnap.exists) {
        console.log(`⚠️  [${actualizados + errores + noExisten + 1}] ${email} - No existe en Firestore`);
        noExisten++;
        continue;
      }
      
      // Actualizar domicilio
      await socioRef.update({
        domicilio: datos.domicilio
      });
      
      actualizados++;
      
      if (actualizados % 10 === 0) {
        console.log(`   ✓ ${actualizados} socios actualizados...`);
      }
      
    } catch (error) {
      console.error(`❌ [${actualizados + errores + noExisten + 1}] ${email} - Error:`, error.message);
      errores++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN:');
  console.log('-'.repeat(80));
  console.log(`Total procesados:      ${sociosDomicilio.size}`);
  console.log(`✅ Actualizados:       ${actualizados}`);
  console.log(`⚠️  No existen:         ${noExisten}`);
  console.log(`❌ Errores:            ${errores}`);
  console.log('='.repeat(80) + '\n');
  
  if (actualizados > 0) {
    console.log('✅ Domicilios actualizados en Firestore con 6 campos');
    console.log('📝 Los socios ahora tienen: calle, colonia, ciudad, municipio, estado, cp\n');
  }
}

// Ejecutar
actualizarDomicilios()
  .then(() => {
    console.log('✅ Proceso completado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

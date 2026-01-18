#!/usr/bin/env node

/**
 * Script: Repoblar ARMAS y FECHA DE INGRESO desde Excel maestro
 * 
 * Fuente: /Applications/club-738-web/data/socios/2025.31.12_RELACION_SOCIOS_ARMAS.xlsx
 * 
 * Acciones:
 * 1. Lee el Excel (CLUB 738. RELACION SOCIOS + Anexo A)
 * 2. Limpia socios/{email}/armas/{armaId}
 * 3. Repuebla con datos correctos
 * 4. Actualiza socios/{email}.fechaAlta
 * 
 * Uso:
 *   node scripts/repoblar-armas-y-fechas.cjs
 */

const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// ============================================================================
// INICIALIZACIÓN FIREBASE
// ============================================================================

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://club-738-app.firebaseio.com'
});

const db = admin.firestore();

// ============================================================================
// LEER EXCEL
// ============================================================================

async function leerExcel() {
  console.log('📖 Leyendo Excel...');
  
  const excelPath = '/Applications/club-738-web/data/socios/2025.31.12_RELACION_SOCIOS_ARMAS.xlsx';
  const workbook = XLSX.readFile(excelPath);
  
  // Leer hoja principal
  const wsMain = workbook.Sheets['CLUB 738. RELACION SOCIOS 31 DI'];
  const dataMain = XLSX.utils.sheet_to_json(wsMain);
  
  // Leer Anexo A (para fechas)
  const wsAnexo = workbook.Sheets['Anexo A'];
  const dataAnexo = XLSX.utils.sheet_to_json(wsAnexo);
  
  // Crear mapa de fechas: email -> fecha
  const fechasMap = {};
  dataAnexo.forEach(row => {
    const email = (row.EMAIL || '').toLowerCase().trim();
    if (email && row['FECHA ALTA']) {
      // Excel devuelve fechas como número serial
      let fecha = row['FECHA ALTA'];
      if (typeof fecha === 'number') {
        // Convertir número serial de Excel a fecha
        const excelEpoch = new Date(1900, 0, 1);
        fecha = new Date(excelEpoch.getTime() + (fecha - 1) * 24 * 60 * 60 * 1000);
      } else if (typeof fecha === 'string') {
        fecha = new Date(fecha);
      }
      fechasMap[email] = fecha;
    }
  });
  
  console.log(`✅ Fechas cargadas: ${Object.keys(fechasMap).length} socios`);
  
  // Agrupar armas por socio
  const armasPorSocio = {};
  dataMain.forEach((row, idx) => {
    const email = (row.EMAIL || '').toLowerCase().trim();
    const clase = (row.CLASE || '').trim();
    const calibre = (row.CALIBRE || '').trim();
    const marca = (row.MARCA || '').trim();
    const modelo = (row.MODELO || '').trim();
    const matricula = (row.MATRÍCULA || '').trim();
    const folio = (row.FOLIO || '').trim();
    
    // Solo procesar si tiene email y datos de arma
    if (!email || !clase || !calibre || !matricula) return;
    
    if (!armasPorSocio[email]) {
      armasPorSocio[email] = [];
    }
    
    armasPorSocio[email].push({
      clase,
      calibre,
      marca,
      modelo,
      matricula,
      folio,
      rowNum: idx + 2
    });
  });
  
  console.log(`✅ Armas cargadas: ${Object.keys(armasPorSocio).length} socios`);
  
  return { armasPorSocio, fechasMap };
}

// ============================================================================
// VALIDAR EXISTENCIA EN FIRESTORE
// ============================================================================

async function validarSocios(emails) {
  console.log('\n🔍 Validando socios en Firestore...');
  
  const sociosRef = db.collection('socios');
  const validos = [];
  const invalidos = [];
  
  for (const email of emails) {
    const doc = await sociosRef.doc(email).get();
    if (doc.exists) {
      validos.push(email);
    } else {
      invalidos.push(email);
    }
  }
  
  if (invalidos.length > 0) {
    console.log(`⚠️  Socios NO encontrados en Firestore: ${invalidos.length}`);
    invalidos.slice(0, 5).forEach(e => console.log(`   - ${e}`));
  }
  
  console.log(`✅ Socios válidos: ${validos.length}/${emails.length}`);
  return validos;
}

// ============================================================================
// LIMPIAR ARMAS ACTUALES
// ============================================================================

async function limpiarArmas(emails) {
  console.log('\n🗑️  Limpiando colecciones de armas actuales...');
  
  let totalEliminadas = 0;
  
  for (const email of emails) {
    const armasRef = db.collection('socios').doc(email).collection('armas');
    const snapshot = await armasRef.get();
    
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
      totalEliminadas++;
    }
  }
  
  console.log(`✅ Armas eliminadas: ${totalEliminadas}`);
}

// ============================================================================
// REPOBLAR ARMAS
// ============================================================================

async function repoblarArmas(armasPorSocio, sociosValidos) {
  console.log('\n📝 Repoblando armas...');
  
  let totalInsertadas = 0;
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;
  
  for (const email of sociosValidos) {
    if (!armasPorSocio[email]) continue;
    
    const armas = armasPorSocio[email];
    
    for (const arma of armas) {
      const armaId = `${arma.matricula}`.toLowerCase().replace(/\s+/g, '_');
      const armaRef = db.collection('socios').doc(email).collection('armas').doc(armaId);
      
      batch.set(armaRef, {
        clase: arma.clase,
        calibre: arma.calibre,
        marca: arma.marca,
        modelo: arma.modelo,
        matricula: arma.matricula,
        folio: arma.folio,
        modalidad: determinarModalidad(arma.clase),
        fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
      });
      
      batchCount++;
      totalInsertadas++;
      
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`   ✓ ${totalInsertadas} armas insertadas...`);
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }
  
  console.log(`✅ Total de armas insertadas: ${totalInsertadas}`);
}

// ============================================================================
// ACTUALIZAR FECHAS DE INGRESO
// ============================================================================

async function actualizarFechas(fechasMap, sociosValidos) {
  console.log('\n📅 Actualizando fechas de ingreso...');
  
  let actualizadas = 0;
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;
  
  for (const email of sociosValidos) {
    if (!fechasMap[email]) {
      console.log(`   ⚠️  Sin fecha para: ${email}`);
      continue;
    }
    
    const socioRef = db.collection('socios').doc(email);
    batch.update(socioRef, {
      fechaAlta: admin.firestore.Timestamp.fromDate(fechasMap[email]),
      fechaActualizacionFecha: admin.firestore.FieldValue.serverTimestamp()
    });
    
    batchCount++;
    actualizadas++;
    
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`   ✓ ${actualizadas} fechas actualizadas...`);
      batch = db.batch();
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }
  
  console.log(`✅ Total de fechas actualizadas: ${actualizadas}`);
}

// ============================================================================
// DETERMINAR MODALIDAD
// ============================================================================

function determinarModalidad(clase) {
  const claseUpper = (clase || '').toUpperCase();
  
  // Armas largas
  if (claseUpper.includes('RIFLE') || 
      claseUpper.includes('CARABINA') || 
      claseUpper.includes('ESCOPETA') ||
      claseUpper.includes('SHOTGUN')) {
    return 'tiro'; // O 'caza' dependiendo del contexto
  }
  
  // Pistolas = tiro
  if (claseUpper.includes('PISTOLA') || 
      claseUpper.includes('REVOLVER')) {
    return 'tiro';
  }
  
  // Default
  return 'tiro';
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    console.log('🚀 REPOBLACIÓN DE ARMAS Y FECHAS DE INGRESO');
    console.log('==========================================\n');
    
    // 1. Leer Excel
    const { armasPorSocio, fechasMap } = await leerExcel();
    
    // 2. Validar socios
    const emails = Object.keys(armasPorSocio);
    const sociosValidos = await validarSocios(emails);
    
    // 3. Limpiar armas actuales
    await limpiarArmas(sociosValidos);
    
    // 4. Repoblar armas
    await repoblarArmas(armasPorSocio, sociosValidos);
    
    // 5. Actualizar fechas
    await actualizarFechas(fechasMap, sociosValidos);
    
    console.log('\n✅ ¡REPOBLACIÓN COMPLETADA!\n');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

main();

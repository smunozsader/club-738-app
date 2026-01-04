/**
 * Script para agregar los 16 socios faltantes a Firebase
 * 1. Crear cuenta en Firebase Auth
 * 2. Crear documento en colección socios
 * 3. Importar sus armas
 * 4. Subir CURP a Storage
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const auth = getAuth();
const db = getFirestore();
const bucket = getStorage().bucket();

// Los 16 socios faltantes
const SOCIOS_FALTANTES = [
  'AERF781223MDFRMR07',
  'CAPG891110HYNMCD00',
  'CECR890104HYNRBL02',
  'COWA700106HTCRLR02',
  'FEPR920403HYNRRC06',
  'GANJ740807HMCRXQ09',
  'GOAE840623HYNMRD00',
  'GOMA940118MVZMNM00',
  'GOXK740906HNERXR09',
  'LIAJ750609HYNZVC08',
  'MECR871030HYNNRG05',
  'PUSJ000131HYNCSSA4',
  'RODP940625HYNMSB06',
  'RUES971109HCCDSN07',
  'SAGS611114HDFNRR03',
  'XARC701106HYNCVH07'
];

async function leerExcel() {
  const excelPath = path.join(__dirname, '..', 'Base datos', 'CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Estructura: socio -> {datos, armas[]}
  const socios = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[3] || row[3].length !== 18) continue;
    if (row[5] && row[5].toString().includes('TOTAL')) continue;
    
    const curp = row[3].trim();
    
    // Limpiar nombre (quitar número inicial)
    let nombre = row[2] ? row[2].trim() : '';
    if (nombre.match(/^\d+\.\s*/)) {
      nombre = nombre.replace(/^\d+\.\s*/, '');
    }
    
    if (!socios[curp]) {
      socios[curp] = {
        curp,
        nombre,
        email: row[7] ? row[7].trim().toLowerCase() : '',
        telefono: row[6] ? row[6].toString().trim() : '',
        domicilio: row[5] ? row[5].trim() : '',
        armas: []
      };
    }
    
    // Agregar arma si tiene matrícula
    const matricula = row[12];
    if (matricula) {
      socios[curp].armas.push({
        clase: row[8] || '',
        calibre: row[9] || '',
        marca: row[10] || '',
        modelo: row[11] || '',
        matricula: matricula.toString(),
        folio: row[13] || '',
        tipo: row[14] ? 'corta' : (row[15] ? 'larga' : '')
      });
    }
  }
  
  return socios;
}

async function main() {
  console.log('='.repeat(80));
  console.log('🚀 AGREGANDO 16 SOCIOS FALTANTES A FIREBASE');
  console.log('='.repeat(80));
  
  // Leer datos del Excel
  const todosLosSocios = await leerExcel();
  
  // Filtrar solo los 16 faltantes
  const sociosFaltantes = {};
  for (const curp of SOCIOS_FALTANTES) {
    if (todosLosSocios[curp]) {
      sociosFaltantes[curp] = todosLosSocios[curp];
    }
  }
  
  console.log(`\n📊 Datos de los 16 socios:`);
  console.log('-'.repeat(80));
  
  let sinArmas = 0;
  let conArmas = 0;
  
  for (const [curp, socio] of Object.entries(sociosFaltantes)) {
    const numArmas = socio.armas.length;
    if (numArmas === 0) sinArmas++;
    else conArmas++;
    
    console.log(`${curp} | ${socio.email.padEnd(35)} | ${numArmas} armas | ${socio.nombre.substring(0, 25)}`);
  }
  
  console.log('-'.repeat(80));
  console.log(`   Con armas: ${conArmas}`);
  console.log(`   Sin armas: ${sinArmas}`);
  console.log();
  
  // Procesar cada socio
  let authCreados = 0;
  let firestoreCreados = 0;
  let armasImportadas = 0;
  let curpsSubidos = 0;
  let errores = [];
  
  for (const [curp, socio] of Object.entries(sociosFaltantes)) {
    console.log(`\n📌 Procesando: ${socio.nombre}`);
    console.log(`   Email: ${socio.email}`);
    
    // 1. Crear cuenta en Firebase Auth
    try {
      const userRecord = await auth.createUser({
        email: socio.email,
        password: 'Club738*2026',
        displayName: socio.nombre
      });
      console.log(`   ✅ Auth: Usuario creado (${userRecord.uid})`);
      authCreados++;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`   ⚠️  Auth: Usuario ya existe`);
      } else {
        console.log(`   ❌ Auth: ${error.message}`);
        errores.push({ socio: socio.email, paso: 'Auth', error: error.message });
      }
    }
    
    // 2. Crear documento en Firestore
    try {
      const socioDoc = {
        nombre: socio.nombre,
        curp: socio.curp,
        telefono: socio.telefono,
        domicilio: socio.domicilio,
        totalArmas: socio.armas.length,
        fechaRegistro: new Date().toISOString(),
        bienvenidaVista: false
      };
      
      await db.collection('socios').doc(socio.email).set(socioDoc);
      console.log(`   ✅ Firestore: Documento socio creado`);
      firestoreCreados++;
    } catch (error) {
      console.log(`   ❌ Firestore socio: ${error.message}`);
      errores.push({ socio: socio.email, paso: 'Firestore socio', error: error.message });
    }
    
    // 3. Importar armas
    if (socio.armas.length > 0) {
      try {
        const armasRef = db.collection('socios').doc(socio.email).collection('armas');
        
        for (const arma of socio.armas) {
          await armasRef.add({
            ...arma,
            fechaImportacion: new Date().toISOString()
          });
          armasImportadas++;
        }
        console.log(`   ✅ Armas: ${socio.armas.length} importadas`);
      } catch (error) {
        console.log(`   ❌ Armas: ${error.message}`);
        errores.push({ socio: socio.email, paso: 'Armas', error: error.message });
      }
    } else {
      console.log(`   ℹ️  Armas: Sin armas registradas`);
    }
    
    // 4. Subir CURP a Storage
    const curpPath = path.join(__dirname, '..', 'curp_socios', `${curp}.pdf`);
    if (fs.existsSync(curpPath)) {
      try {
        await bucket.upload(curpPath, {
          destination: `documentos/${socio.email}/curp.pdf`,
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              curp: curp,
              tipo: 'curp',
              fechaSubida: new Date().toISOString()
            }
          }
        });
        console.log(`   ✅ Storage: CURP subido`);
        curpsSubidos++;
      } catch (error) {
        console.log(`   ❌ Storage: ${error.message}`);
        errores.push({ socio: socio.email, paso: 'Storage', error: error.message });
      }
    } else {
      console.log(`   ⚠️  Storage: PDF de CURP no encontrado`);
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN');
  console.log('='.repeat(80));
  console.log(`   ✅ Usuarios Auth creados: ${authCreados}`);
  console.log(`   ✅ Documentos Firestore: ${firestoreCreados}`);
  console.log(`   ✅ Armas importadas: ${armasImportadas}`);
  console.log(`   ✅ CURPs subidos: ${curpsSubidos}`);
  
  if (errores.length > 0) {
    console.log(`\n   ❌ Errores (${errores.length}):`);
    for (const e of errores) {
      console.log(`      ${e.socio} - ${e.paso}: ${e.error}`);
    }
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado');
  process.exit(0);
}).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

/**
 * Script para subir CURPs a Firebase Storage
 * Estructura: documentos/{email}/curp.pdf
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const storage = getStorage();
const bucket = storage.bucket();
const db = getFirestore();

const CURPS_DIR = path.join(__dirname, '..', 'curp_socios');

async function obtenerMapaCurpEmail() {
  console.log('📋 Obteniendo mapeo CURP → Email desde Firestore...\n');
  
  const sociosRef = db.collection('socios');
  const snapshot = await sociosRef.get();
  
  const mapaCurpEmail = {};
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const email = doc.id;
    const curp = data.curp;
    
    if (curp) {
      mapaCurpEmail[curp] = email;
    }
  });
  
  console.log(`   Encontrados ${Object.keys(mapaCurpEmail).length} socios con CURP en Firestore\n`);
  return mapaCurpEmail;
}

async function subirCurps() {
  console.log('======================================================================');
  console.log('📤 SUBIDA DE CURPs A FIREBASE STORAGE');
  console.log('======================================================================\n');
  
  // Obtener mapeo CURP → Email
  const mapaCurpEmail = await obtenerMapaCurpEmail();
  
  // Leer archivos PDF de la carpeta
  const archivos = fs.readdirSync(CURPS_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`📁 Encontrados ${archivos.length} archivos PDF\n`);
  
  let subidos = 0;
  let noEncontrados = [];
  let errores = [];
  
  for (const archivo of archivos) {
    const curp = archivo.replace('.pdf', '');
    const email = mapaCurpEmail[curp];
    
    if (!email) {
      noEncontrados.push(curp);
      continue;
    }
    
    const rutaLocal = path.join(CURPS_DIR, archivo);
    const rutaStorage = `documentos/${email}/curp.pdf`;
    
    try {
      await bucket.upload(rutaLocal, {
        destination: rutaStorage,
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            curp: curp,
            tipo: 'curp',
            fechaSubida: new Date().toISOString()
          }
        }
      });
      
      subidos++;
      console.log(`   ✅ ${curp} → ${email}`);
    } catch (error) {
      errores.push({ curp, email, error: error.message });
      console.log(`   ❌ Error subiendo ${curp}: ${error.message}`);
    }
  }
  
  // Resumen
  console.log('\n======================================================================');
  console.log('📊 RESUMEN');
  console.log('======================================================================');
  console.log(`   ✅ Subidos: ${subidos}`);
  console.log(`   ⚠️  Sin email en Firestore: ${noEncontrados.length}`);
  console.log(`   ❌ Errores: ${errores.length}`);
  
  if (noEncontrados.length > 0) {
    console.log('\n⚠️  CURPs sin socio en Firestore:');
    noEncontrados.forEach(curp => console.log(`   - ${curp}`));
  }
  
  if (errores.length > 0) {
    console.log('\n❌ Errores de subida:');
    errores.forEach(e => console.log(`   - ${e.curp} (${e.email}): ${e.error}`));
  }
}

subirCurps().then(() => {
  console.log('\n✨ Proceso completado');
  process.exit(0);
}).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

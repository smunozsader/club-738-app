/**
 * Script para dar de alta 2 pistolas nuevas a Juan Carlos Briceño González
 * Email: jcb197624@hotmail.com
 * 
 * Pistolas:
 * 1. SIG SAUER P365 - Cal. .380" ACP - Mat. 6F407226 - Folio B619498
 * 2. CESKA ZBROJOVKA CZ SHADOW 2 - Cal. .380" - Mat. EP34131 - Folio B630577
 * 
 * Uso: node scripts/alta-armas-briceno.cjs
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ No se encontró serviceAccountKey.json en scripts/');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Configuración del socio
const SOCIO_EMAIL = 'jcb197624@hotmail.com';
const SOCIO_NOMBRE = 'JUAN CARLOS BRICEÑO GONZALEZ';

// Armas a registrar
const ARMAS = [
  {
    id: 'pistola-sig-sauer-p365-6f407226',
    clase: 'PISTOLA',
    marca: 'SIG SAUER',
    modelo: 'P365',
    calibre: '.380" ACP',
    matricula: '6F407226',
    folio: 'B619498',
    modalidad: 'tiro',
    type_group: 'PISTOLA',
    rfaFile: 'BRICEÑO. SIG SAUER P365. MAT. 66F407226, B619498 .pdf'
  },
  {
    id: 'pistola-cz-shadow2-ep34131',
    clase: 'PISTOLA',
    marca: 'CESKA ZBROJOVKA',
    modelo: 'CZ SHADOW 2',
    calibre: '.380"',
    matricula: 'EP34131',
    folio: 'B630577',
    modalidad: 'tiro',
    type_group: 'PISTOLA',
    rfaFile: 'BRICEÑO. SHADOW 2 EP34131, B630577.pdf'
  }
];

async function subirRFA(arma) {
  const localPath = path.join(__dirname, '..', 'data', 'LIC. BRICEÑO PISTOLAS NUEVAS', arma.rfaFile);
  
  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠️  No encontrado: ${arma.rfaFile}`);
    return null;
  }
  
  const storagePath = `documentos/${SOCIO_EMAIL}/armas/${arma.id}/registro.pdf`;
  
  try {
    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          socioEmail: SOCIO_EMAIL,
          armaId: arma.id,
          folio: arma.folio,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    
    // Obtener URL pública
    const file = bucket.file(storagePath);
    await file.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    
    console.log(`   ✅ RFA subido: ${arma.folio}`);
    return url;
  } catch (error) {
    console.log(`   ❌ Error subiendo RFA: ${error.message}`);
    return null;
  }
}

async function registrarArma(arma, rfaUrl) {
  const armaRef = db.collection('socios').doc(SOCIO_EMAIL).collection('armas').doc(arma.id);
  
  const armaData = {
    clase: arma.clase,
    marca: arma.marca,
    modelo: arma.modelo,
    calibre: arma.calibre,
    matricula: arma.matricula,
    folio: arma.folio,
    modalidad: arma.modalidad,
    type_group: arma.type_group,
    documentoRegistro: rfaUrl || null,
    fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
    activa: true,
    registradoPor: 'admin@club738.com',
    notas: 'Alta nueva pistola - Febrero 2026'
  };
  
  await armaRef.set(armaData);
  console.log(`   ✅ Firestore: ${arma.marca} ${arma.modelo} (${arma.matricula})`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📦 ALTA DE ARMAS - JUAN CARLOS BRICEÑO GONZÁLEZ');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  console.log(`👤 Socio: ${SOCIO_NOMBRE}`);
  console.log(`📧 Email: ${SOCIO_EMAIL}`);
  console.log(`🔫 Armas a registrar: ${ARMAS.length}\n`);
  
  for (const arma of ARMAS) {
    console.log(`\n🔧 Procesando: ${arma.marca} ${arma.modelo}`);
    console.log(`   Calibre: ${arma.calibre}`);
    console.log(`   Matrícula: ${arma.matricula}`);
    console.log(`   Folio RFA: ${arma.folio}`);
    
    // 1. Subir RFA a Storage
    const rfaUrl = await subirRFA(arma);
    
    // 2. Registrar en Firestore
    await registrarArma(arma, rfaUrl);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ PROCESO COMPLETADO');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  console.log('📋 SIGUIENTE PASO - Actualizar Excel fuente de verdad:');
  console.log('   Archivo: data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
  console.log('   Buscar: JUAN CARLOS BRICEÑO GONZALEZ');
  console.log('   Añadir filas:\n');
  console.log('   | Nombre | Email | Clase | Marca | Modelo | Calibre | Matrícula | Folio | Modalidad |');
  console.log('   |--------|-------|-------|-------|--------|---------|-----------|-------|-----------|');
  console.log('   | JUAN CARLOS BRICEÑO GONZALEZ | jcb197624@hotmail.com | PISTOLA | SIG SAUER | P365 | .380" ACP | 6F407226 | B619498 | tiro |');
  console.log('   | JUAN CARLOS BRICEÑO GONZALEZ | jcb197624@hotmail.com | PISTOLA | CESKA ZBROJOVKA | CZ SHADOW 2 | .380" | EP34131 | B630577 | tiro |');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

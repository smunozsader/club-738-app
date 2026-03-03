/**
 * Script para dar de alta 2 armas nuevas a Santiago A. Quintal Paredes
 * Email: squintal158@gmail.com
 * 
 * Armas:
 * 1. PISTOLA SIG SAUER P322 - Cal. .22 L.R. - Mat. 73A191703 - Folio A3935566
 * 2. RIFLE CZ 600 LUX - Cal. .223" REM - Mat. J011498 - Folio A3935568
 * 
 * Uso: node scripts/alta-armas-quintal.cjs
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
const SOCIO_EMAIL = 'squintal158@gmail.com';
const SOCIO_NOMBRE = 'SANTIAGO ALEJANDRO QUINTAL PAREDES';

// Armas a registrar
const ARMAS = [
  {
    id: 'pistola-sig-sauer-p322-73a191703',
    clase: 'PISTOLA',
    marca: 'SIG SAUER',
    modelo: 'P322',
    calibre: '.22 L.R.',
    matricula: '73A191703',
    folio: 'A3935566',
    modalidad: 'tiro',
    type_group: 'PISTOLA',
    rfaFile: 'REGISTRO .223 Y SIGSAUER .22 copy.pdf'
  },
  {
    id: 'rifle-ceska-zbrojovka-cz600lux-j011498',
    clase: 'RIFLE DE REPETICION',
    marca: 'CESKA ZBROJOVKA',
    modelo: 'CZ 600 LUX',
    calibre: '.223" REM',
    matricula: 'J011498',
    folio: 'A3935568',
    modalidad: 'tiro',
    type_group: 'RIFLE',
    rfaFile: 'REGISTRO .223 Y SIGSAUER .22 copy.pdf'
  }
];

async function subirRFA(arma) {
  const localPath = path.join(__dirname, '..', 'data', 'santiago nuevas armas 2026', arma.rfaFile);
  
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
    notas: 'Alta de arma nueva - Marzo 2026'
  };
  
  await armaRef.set(armaData);
  console.log(`   ✅ Firestore: ${arma.marca} ${arma.modelo} (${arma.matricula})`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📦 ALTA DE ARMAS - SANTIAGO A. QUINTAL PAREDES');
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
  console.log('═══════════════════════════════════════════════════════════════════');
    
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

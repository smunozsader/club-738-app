/**
 * Script para dar de alta 1 pistola nueva a Adolfo Xacur Rivera
 * Email: fit.x66@hotmail.com
 * 
 * Pistola:
 * CESKA ZBROJOVKA CZ SHADOW 2 - Cal. .380" - Mat. EP35012 - Folio A3911331
 * 
 * Uso: node scripts/alta-arma-xacur.cjs
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
const SOCIO_EMAIL = 'fit.x66@hotmail.com';
const SOCIO_NOMBRE = 'ADOLFO XACUR RIVERA';

// Arma a registrar
const ARMA = {
  id: 'pistola-cz-shadow2-ep35012',
  clase: 'PISTOLA',
  marca: 'CESKA ZBROJOVKA',
  modelo: 'CZ SHADOW 2',
  calibre: '.380"',
  matricula: 'EP35012',
  folio: 'A3911331',
  modalidad: 'tiro',
  type_group: 'PISTOLA',
  rfaFile: 'FITO XACURcz shadow 2; EP35012; A3911331 .pdf'
};

async function subirRFA(arma) {
  const localPath = path.join(__dirname, '..', 'data', 'pistola shadow 2 fito xacur', arma.rfaFile);
  
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
  console.log('📦 ALTA DE ARMA - ADOLFO XACUR RIVERA');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  console.log(`👤 Socio: ${SOCIO_NOMBRE}`);
  console.log(`📧 Email: ${SOCIO_EMAIL}`);
  console.log(`🔫 Arma a registrar: 1\n`);
  
  console.log(`\n🔧 Procesando: ${ARMA.marca} ${ARMA.modelo}`);
  console.log(`   Calibre: ${ARMA.calibre}`);
  console.log(`   Matrícula: ${ARMA.matricula}`);
  console.log(`   Folio RFA: ${ARMA.folio}`);
  
  // 1. Subir RFA a Storage
  const rfaUrl = await subirRFA(ARMA);
  
  // 2. Registrar en Firestore
  await registrarArma(ARMA, rfaUrl);
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ PROCESO COMPLETADO');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  console.log('📋 SIGUIENTE PASO - Actualizar Excel fuente de verdad:');
  console.log('   Archivo: data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
  console.log('   Buscar: ADOLFO XACUR RIVERA');
  console.log('   Añadir fila:\n');
  console.log('   | Nombre | Email | Clase | Marca | Modelo | Calibre | Matrícula | Folio | Modalidad |');
  console.log('   |--------|-------|-------|-------|--------|---------|-----------|-------|-----------|');
  console.log('   | ADOLFO XACUR RIVERA | fit.x66@hotmail.com | PISTOLA | CESKA ZBROJOVKA | CZ SHADOW 2 | .380" | EP35012 | A3911331 | tiro |');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

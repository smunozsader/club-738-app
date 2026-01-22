#!/usr/bin/env node

/**
 * Corrección crítica en Firestore: CZ P-10 C de Ricardo Soberanis
 * Cambiar calibre de .40 S&W → .380" ACP (cumplimiento SEDENA)
 */

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar credenciales de Firebase Admin
const serviceAccountPath = path.join(__dirname, 'scripts', 'serviceAccountKey.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'club-738-app'
  });
} catch (error) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  console.error('   Asegúrate de que existe en: ./scripts/serviceAccountKey.json');
  process.exit(1);
}

const db = admin.firestore();

async function corregirFirestore() {
  console.log('='.repeat(80));
  console.log('🚨 CORRECCIÓN EN FIRESTORE - CZ P-10 C');
  console.log('='.repeat(80));

  const socioEmail = 'rsoberanis11@hotmail.com';
  const armaId = '8d1f8140';
  const docRef = db.collection('socios').doc(socioEmail).collection('armas').doc(armaId);

  try {
    // Actualizar documento
    await docRef.update({
      calibre: '.380"',
      marca: 'CESKA ZBROJOVKA'
    });

    console.log('\n✅ Firestore actualizado correctamente');
    console.log(`   Documento: socios/${socioEmail}/armas/${armaId}`);
    console.log('   Cambios:');
    console.log('     • calibre: .380" ACP (✅ CORRECTO - cumplimiento SEDENA)');
    console.log('     • marca: CESKA ZBROJOVKA');

    // Verificar cambios
    const updatedDoc = await docRef.get();
    if (updatedDoc.exists) {
      const data = updatedDoc.data();
      console.log('\n📋 Verificación - Datos en Firestore:');
      console.log(`     • clase: ${data.clase}`);
      console.log(`     • marca: ${data.marca}`);
      console.log(`     • modelo: ${data.modelo}`);
      console.log(`     • calibre: ${data.calibre}`);
      console.log(`     • matrícula: ${data.matricula}`);
      console.log(`     • folio: ${data.folio}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ CORRECCIÓN COMPLETADA');
    console.log('='.repeat(80));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error al actualizar Firestore: ${error.message}`);
    process.exit(1);
  }
}

corregirFirestore();

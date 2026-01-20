#!/usr/bin/env node

/**
 * Corrección de transferencias en Firestore: Gardoni ↔ Arechiga
 * Basado en commit d5c3733 - v1.23.0
 */

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'scripts', 'serviceAccountKey.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'club-738-app'
  });
} catch (error) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  process.exit(1);
}

const db = admin.firestore();

async function corregirTransferencias() {
  console.log('='.repeat(100));
  console.log('🔄 CORRECCIÓN DE TRANSFERENCIAS EN FIRESTORE: GARDONI ↔ ARECHIGA');
  console.log('='.repeat(100));

  const gardoniEmail = 'jrgardoni@gmail.com';
  const arechiagEmail = 'arechiga@jogarplastics.com';

  try {
    // PASO 1: Eliminar armas incorrectas de Gardoni (que son de Arechiga)
    console.log('\n1️⃣ ELIMINAR DE GARDONI:');
    
    const gardoniArmasRef = db.collection('socios').doc(gardoniEmail).collection('armas');
    const gardoniSnapshot = await gardoniArmasRef.get();
    
    let deletedFromGardoni = 0;
    const armasAEliminarDeGardoni = [
      { marca: 'GRAND POWER', modelo: 'LP380', matricula: 'K078999' },
      { marca: 'GRAND POWER', modelo: 'LP380', matricula: 'K084328' }
    ];

    for (const doc of gardoniSnapshot.docs) {
      const data = doc.data();
      const shouldDelete = armasAEliminarDeGardoni.some(arma =>
        data.matricula === arma.matricula
      );

      if (shouldDelete) {
        await doc.ref.delete();
        console.log(`   ❌ Eliminada: ${data.marca} ${data.modelo} (${data.matricula})`);
        deletedFromGardoni++;
      }
    }
    
    console.log(`   ✅ Total eliminadas: ${deletedFromGardoni}`);

    // PASO 2: Agregar arma faltante a Gardoni (CZ SHADOW 2 DP25087)
    console.log('\n2️⃣ AGREGAR A GARDONI:');
    
    const newCZId = 'dp25087_cz_shadow2';
    const newCZData = {
      clase: 'PISTOLA',
      calibre: '.380"',
      marca: 'CESKA ZBROJOVKA',
      modelo: 'CZ SHADOW 2',
      matricula: 'DP25087',
      folio: 'A 3782098',
      modalidad: 'tiro'
    };

    await db.collection('socios').doc(gardoniEmail).collection('armas').doc(newCZId).set(newCZData);
    console.log(`   ✅ Agregada: ${newCZData.marca} ${newCZData.modelo} (${newCZData.matricula})`);

    // PASO 3: Agregar armas a Arechiga
    console.log('\n3️⃣ AGREGAR A ARECHIGA:');

    const armasAgregarArechiga = [
      { id: 'k078999_gp', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'GRAND POWER', modelo: 'LP380', matricula: 'K078999', folio: 'A 3601943' },
      { id: 'k084328_gp', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'GRAND POWER', modelo: 'LP380', matricula: 'K084328', folio: 'A3714371' },
      { id: 'c647155_cz', clase: 'PISTOLA', calibre: '.380"', marca: 'CESKA ZBROJOVKA', modelo: 'CZ P-07', matricula: 'C647155', folio: 'B 611940' }
    ];

    for (const arma of armasAgregarArechiga) {
      const armaData = {
        clase: arma.clase,
        calibre: arma.calibre,
        marca: arma.marca,
        modelo: arma.modelo,
        matricula: arma.matricula,
        folio: arma.folio,
        modalidad: 'tiro'
      };

      await db.collection('socios').doc(arechiagEmail).collection('armas').doc(arma.id).set(armaData);
      console.log(`   ✅ Agregada: ${arma.marca} ${arma.modelo} (${arma.matricula})`);
    }

    // PASO 4: Verificar
    console.log('\n4️⃣ VERIFICACIÓN:');

    const gardoniCheck = await gardoniArmasRef.get();
    const arechiagArmasRef = db.collection('socios').doc(arechiagEmail).collection('armas');
    const arechiagCheck = await arechiagArmasRef.get();

    console.log(`\n   GARDONI: ${gardoniCheck.size} armas`);
    gardoniCheck.docs.forEach(doc => {
      const data = doc.data();
      console.log(`     • ${data.marca} ${data.modelo} (${data.matricula})`);
    });

    console.log(`\n   ARECHIGA: ${arechiagCheck.size} armas`);
    arechiagCheck.docs.forEach(doc => {
      const data = doc.data();
      console.log(`     • ${data.marca} ${data.modelo} (${data.matricula})`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('✅ TRANSFERENCIAS COMPLETADAS EN FIRESTORE');
    console.log('='.repeat(100));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

corregirTransferencias();

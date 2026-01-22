#!/usr/bin/env node

/**
 * LIMPIEZA Y CORRECCIÓN COMPLETA DE FIRESTORE
 * Detectar y eliminar duplicados, luego crear estructura correcta
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

async function limpiarYCorregir() {
  console.log('='.repeat(100));
  console.log('🧹 LIMPIEZA Y CORRECCIÓN DE FIRESTORE');
  console.log('='.repeat(100));

  const gardoniEmail = 'jrgardoni@gmail.com';
  const arechiagEmail = 'arechiga@jogarplastics.com';

  try {
    // PASO 1: Eliminar TODOS los documentos de GARDONI y ARECHIGA
    console.log('\n1️⃣ ELIMINANDO TODAS LAS ARMAS ACTUALES...');

    const gardoniArmasRef = db.collection('socios').doc(gardoniEmail).collection('armas');
    const gardoniSnapshot = await gardoniArmasRef.get();
    let gardoniCount = 0;
    for (const doc of gardoniSnapshot.docs) {
      await doc.ref.delete();
      gardoniCount++;
    }
    console.log(`   ✅ Gardoni: ${gardoniCount} armas eliminadas`);

    const arechiagArmasRef = db.collection('socios').doc(arechiagEmail).collection('armas');
    const arechiagSnapshot = await arechiagArmasRef.get();
    let arechiagCount = 0;
    for (const doc of arechiagSnapshot.docs) {
      await doc.ref.delete();
      arechiagCount++;
    }
    console.log(`   ✅ Arechiga: ${arechiagCount} armas eliminadas`);

    // PASO 2: Agregar armas CORRECTAS a GARDONI (7 armas)
    console.log('\n2️⃣ AGREGANDO ARMAS CORRECTAS A GARDONI (7 armas):');

    const gardoniArmas = [
      { id: 'gp_k22_xtrim', clase: 'PISTOLA', calibre: '.22" L.R.', marca: 'GRAND POWER', modelo: 'K22 X-TRIM', matricula: 'K078928', folio: 'A 3601944' },
      { id: 'kriss_dmk22c', clase: 'RIFLE', calibre: '.22" L.R.', marca: 'KRISS', modelo: 'DMK22C', matricula: '22C002369', folio: '3722287' },
      { id: 'ruger_10_22_001', clase: 'RIFLE', calibre: '.22" L.R.', marca: 'RUGER', modelo: '10/22', matricula: '0008-32069', folio: 'A 3722288' },
      { id: 'ruger_10_22_002', clase: 'RIFLE', calibre: '.22" L.R.', marca: 'RUGER', modelo: '10/22', matricula: '0013-82505', folio: 'A 3605099' },
      { id: 'cz_shadow2_dp25086', clase: 'PISTOLA', calibre: '.380"', marca: 'CESKA ZBROJOVKA', modelo: 'CZ SHADOW 2', matricula: 'DP25086', folio: 'A 3782099' },
      { id: 'cz_shadow2_dp25246', clase: 'PISTOLA', calibre: '.380"', marca: 'CESKA ZBROJOVKA', modelo: 'CZ SHADOW 2', matricula: 'DP25246', folio: 'A 3792515' },
      { id: 'cz_shadow2_dp25087', clase: 'PISTOLA', calibre: '.380"', marca: 'CESKA ZBROJOVKA', modelo: 'CZ SHADOW 2', matricula: 'DP25087', folio: 'A 3782098' }
    ];

    for (const arma of gardoniArmas) {
      const armaData = {
        clase: arma.clase,
        calibre: arma.calibre,
        marca: arma.marca,
        modelo: arma.modelo,
        matricula: arma.matricula,
        folio: arma.folio,
        modalidad: 'tiro'
      };
      await gardoniArmasRef.doc(arma.id).set(armaData);
      console.log(`   ✅ ${arma.marca} ${arma.modelo} (${arma.matricula})`);
    }

    // PASO 3: Agregar armas CORRECTAS a ARECHIGA (3 armas)
    console.log('\n3️⃣ AGREGANDO ARMAS CORRECTAS A ARECHIGA (3 armas):');

    const arechiagArmas = [
      { id: 'gp_lp380_k084328', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'GRAND POWER', modelo: 'LP380', matricula: 'K084328', folio: 'A3714371' },
      { id: 'gp_lp380_k078999', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'GRAND POWER', modelo: 'LP380', matricula: 'K078999', folio: 'A 3601943' },
      { id: 'cz_p07_c647155', clase: 'PISTOLA', calibre: '.380"', marca: 'CESKA ZBROJOVKA', modelo: 'CZ P-07', matricula: 'C647155', folio: 'B 611940' }
    ];

    for (const arma of arechiagArmas) {
      const armaData = {
        clase: arma.clase,
        calibre: arma.calibre,
        marca: arma.marca,
        modelo: arma.modelo,
        matricula: arma.matricula,
        folio: arma.folio,
        modalidad: 'tiro'
      };
      await arechiagArmasRef.doc(arma.id).set(armaData);
      console.log(`   ✅ ${arma.marca} ${arma.modelo} (${arma.matricula})`);
    }

    // PASO 4: Verificar
    console.log('\n4️⃣ VERIFICACIÓN FINAL:');

    const gardoniCheck = await gardoniArmasRef.get();
    const arechiagCheck = await arechiagArmasRef.get();

    console.log(`\n   GARDONI: ${gardoniCheck.size} armas ✅`);
    gardoniCheck.docs.forEach(doc => {
      const data = doc.data();
      console.log(`     • ${data.marca} ${data.modelo} (${data.matricula})`);
    });

    console.log(`\n   ARECHIGA: ${arechiagCheck.size} armas ✅`);
    arechiagCheck.docs.forEach(doc => {
      const data = doc.data();
      console.log(`     • ${data.marca} ${data.modelo} (${data.matricula})`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('✅ FIRESTORE CORREGIDO Y SINCRONIZADO CON EXCEL');
    console.log('='.repeat(100));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

limpiarYCorregir();

#!/usr/bin/env node

/**
 * Agregar 4 armas nuevas a Celestino Sánchez Fernández en Firestore
 * Credencial 183, email: tinosanchezf@yahoo.com.mx
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

async function agregarArmas() {
  console.log('='.repeat(120));
  console.log('🔫 AGREGAR 4 ARMAS A CELESTINO SÁNCHEZ (Credencial 183)');
  console.log('='.repeat(120));

  const socioEmail = 'tinosanchezf@yahoo.com.mx';

  const armas = [
    { id: 'winchester_9422', clase: 'RIFLE', calibre: '.22" L.R.', marca: 'WINCHESTER', modelo: '9422', matricula: 'F11281', folio: 'A3917581' },
    { id: 'cz_p07_d207727', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'CESKA ZBROJOVKA', modelo: 'CZ P-07', matricula: 'D207727', folio: 'A3747924' },
    { id: 'cz_p10c_cp18665', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'CESKA ZBROJOVKA', modelo: 'CZ P-10 C', matricula: 'CP18665', folio: 'A3747922' },
    { id: 'sigsauer_p250', clase: 'PISTOLA', calibre: '.380" AUTO', marca: 'SIG SAUER', modelo: 'P250', matricula: '57C048858', folio: 'B596607' }
  ];

  try {
    console.log(`\n1️⃣ AGREGANDO ${armas.length} ARMAS A FIRESTORE...`);

    const armasRef = db.collection('socios').doc(socioEmail).collection('armas');

    for (const arma of armas) {
      const armaData = {
        clase: arma.clase,
        calibre: arma.calibre,
        marca: arma.marca,
        modelo: arma.modelo,
        matricula: arma.matricula,
        folio: arma.folio,
        modalidad: 'tiro'
      };

      await armasRef.doc(arma.id).set(armaData);
      console.log(`   ✅ ${arma.marca} ${arma.modelo} (${arma.matricula})`);
    }

    // Verificar
    console.log('\n2️⃣ VERIFICACIÓN...');
    const snapshot = await armasRef.get();
    console.log(`\n   CELESTINO en Firestore: ${snapshot.size} armas`);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`     • ${data.marca} ${data.modelo} (${data.matricula})`);
    });

    console.log('\n' + '='.repeat(120));
    console.log('✅ FIRESTORE ACTUALIZADO');
    console.log('='.repeat(120));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

agregarArmas();

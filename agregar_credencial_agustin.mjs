#!/usr/bin/env node

/**
 * Agregar credencial faltante a Agustín Moreno
 * Credencial: 161
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

async function agregarCredencial() {
  console.log('='.repeat(120));
  console.log('🆔 AGREGAR CREDENCIAL FALTANTE A AGUSTÍN MORENO');
  console.log('='.repeat(120));

  const socioEmail = 'agus_tin1_@hotmail.com';
  const credencialCorrecta = 161;

  try {
    const socioRef = db.collection('socios').doc(socioEmail);
    const socioSnap = await socioRef.get();

    if (!socioSnap.exists) {
      console.log(`❌ No se encontró documento para ${socioEmail}`);
      process.exit(1);
    }

    const datosActuales = socioSnap.data();

    console.log(`\n📋 DATOS ACTUALES:`);
    console.log(`   Email: ${socioEmail}`);
    console.log(`   Nombre: ${datosActuales.nombre}`);
    console.log(`   Credencial: ${datosActuales.credencial || '❌ FALTANTE'}`);

    // Agregar credencial
    console.log(`\n✏️  CORRIGIENDO...`);
    await socioRef.update({
      credencial: credencialCorrecta
    });

    console.log(`   ✅ Credencial ${credencialCorrecta} agregada`);

    // Verificar
    console.log(`\n✅ VERIFICACIÓN:`);
    const socioSnapActualizado = await socioRef.get();
    const datosActualizados = socioSnapActualizado.data();
    console.log(`   Nombre: ${datosActualizados.nombre}`);
    console.log(`   Credencial: ${datosActualizados.credencial}`);

    console.log('\n' + '='.repeat(120));
    console.log('✅ FIRESTORE ACTUALIZADO CORRECTAMENTE');
    console.log('='.repeat(120));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

agregarCredencial();

#!/usr/bin/env node

/**
 * Verificar y corregir nombre de Agustín Moreno en Firestore
 * Credencial 161, email: agus_tin1_@hotmail.com
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

async function corregirNombre() {
  console.log('='.repeat(120));
  console.log('🔧 VERIFICAR Y CORREGIR NOMBRE DE AGUSTÍN MORENO');
  console.log('='.repeat(120));

  const socioEmail = 'agus_tin1_@hotmail.com';

  try {
    // 1. Obtener documento actual
    console.log('\n1️⃣ OBTENIENDO DOCUMENTO ACTUAL...');
    const socioRef = db.collection('socios').doc(socioEmail);
    const socioSnap = await socioRef.get();

    if (!socioSnap.exists) {
      console.log(`❌ No se encontró documento para ${socioEmail}`);
      process.exit(1);
    }

    const datosActuales = socioSnap.data();
    console.log(`\n   Email: ${socioEmail}`);
    console.log(`   Nombre actual: ${datosActuales.nombre}`);
    console.log(`   Credencial actual: ${datosActuales.credencial}`);

    // 2. Verificar si el nombre tiene el número de credencial al inicio
    const nombreActual = datosActuales.nombre || '';
    
    if (nombreActual.match(/^\d+\./)) {
      console.log(`\n   ⚠️  PROBLEMA DETECTADO: Nombre comienza con número (credencial)`);
      
      // 3. Corregir
      const nombreLimpio = nombreActual.replace(/^\d+\.\s*/, '').trim();
      
      console.log(`\n2️⃣ CORRIGIENDO...`);
      console.log(`   Nombre anterior: "${nombreActual}"`);
      console.log(`   Nombre correcto: "${nombreLimpio}"`);
      
      // Actualizar en Firestore
      await socioRef.update({
        nombre: nombreLimpio
      });
      
      console.log(`\n   ✅ Nombre actualizado en Firestore`);
      
      // 4. Verificar cambio
      console.log(`\n3️⃣ VERIFICACIÓN...`);
      const socioSnapActualizado = await socioRef.get();
      const datosActualizados = socioSnapActualizado.data();
      console.log(`   Nombre actualizado: "${datosActualizados.nombre}"`);
      console.log(`   Credencial: ${datosActualizados.credencial}`);
      
    } else {
      console.log(`\n   ✅ Nombre correcto, sin cambios necesarios`);
    }

    console.log('\n' + '='.repeat(120));
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(120));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

corregirNombre();

#!/usr/bin/env node

/**
 * actualizar-telefonos-correctos.js
 * Actualiza los teléfonos correctos para Gardoni y Arechiga
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initFirebase() {
  const serviceAccountKeyPath = path.join(__dirname, '../../scripts/serviceAccountKey.json');
  const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
    });
  }
  
  return admin.firestore();
}

async function main() {
  console.log('\n🔄 ACTUALIZAR TELÉFONOS CORRECTOS\n');
  console.log('='.repeat(90) + '\n');

  try {
    const db = initFirebase();

    const actualizaciones = [
      {
        email: 'jrgardoni@gmail.com',
        telefono: '5530565722',
        nombre: 'JOAQUIN RODOLFO GARDONI NUÑEZ'
      },
      {
        email: 'arechiga@jogarplastics.com',
        telefono: '5537340096',
        nombre: 'MARIA FERNANDA GUADALUPE ARECHIGA RAMOS'
      }
    ];

    for (const datos of actualizaciones) {
      const docRef = db.collection('socios').doc(datos.email);
      await docRef.update({ telefono: datos.telefono });
      console.log(`✅ ${datos.email}`);
      console.log(`   Nombre: ${datos.nombre}`);
      console.log(`   Teléfono: ${datos.telefono}\n`);
    }

    console.log('='.repeat(90) + '\n');
    console.log('✅ Teléfonos actualizados correctamente\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

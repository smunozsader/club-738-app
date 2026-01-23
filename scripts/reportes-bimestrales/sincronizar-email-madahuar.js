#!/usr/bin/env node

/**
 * sincronizar-email-madahuar.js
 * Sincroniza el email corregido de Roberto Madahuar a Firebase
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
  console.log('\n🔄 SINCRONIZAR: Email de Roberto Madahuar\n');
  console.log('='.repeat(90) + '\n');

  try {
    const db = initFirebase();

    // Buscar documento con el email antiguo
    const oldEmail = 'madahuar@cotexsa.com.mx';
    const newEmail = 'rmadahuar@cotexsa.com.mx';
    const credencial = 115;

    console.log('Paso 1: Obtener datos del documento antiguo...\n');
    
    const oldDocRef = db.collection('socios').doc(oldEmail);
    const oldDocSnap = await oldDocRef.get();

    if (!oldDocSnap.exists) {
      console.log(`⚠️  No existe documento con email: ${oldEmail}`);
      console.log('\nVerificando si ya existe con email correcto...\n');
      
      const newDocRef = db.collection('socios').doc(newEmail);
      const newDocSnap = await newDocRef.get();
      
      if (newDocSnap.exists) {
        console.log(`✅ El documento YA existe con email correcto: ${newEmail}`);
        console.log(`   Credencial: ${newDocSnap.data().credencial}`);
        console.log(`   Nombre: ${newDocSnap.data().nombre}\n`);
      } else {
        console.log(`❌ No existe documento para Roberto Madahuar\n`);
      }
      process.exit(0);
    }

    const oldData = oldDocSnap.data();
    console.log(`✅ Encontrado documento:`);
    console.log(`   Email: ${oldEmail}`);
    console.log(`   Nombre: ${oldData.nombre}`);
    console.log(`   Credencial: ${oldData.credencial}\n`);

    // Crear nuevo documento con email correcto
    console.log('Paso 2: Crear nuevo documento con email correcto...\n');
    
    const newDocRef = db.collection('socios').doc(newEmail);
    await newDocRef.set(oldData);

    console.log(`✅ Documento creado en: ${newEmail}\n`);

    // Eliminar documento antiguo
    console.log('Paso 3: Eliminar documento antiguo...\n');
    
    await oldDocRef.delete();
    console.log(`✅ Documento eliminado: ${oldEmail}\n`);

    console.log('='.repeat(90));
    console.log(`\n✅ Email sincronizado exitosamente\n`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

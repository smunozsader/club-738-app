#!/usr/bin/env node
/**
 * Buscar solicitudes de modificación de arsenal de Enrique Gaona
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const EMAIL = 'quiquis77@hotmail.com';

async function buscarSolicitudes() {
  console.log('🔍 Buscando solicitudes de Enrique Gaona...\n');
  
  // 1. Solicitudes de ALTA
  console.log('📋 Solicitudes de ALTA (socios/{email}/solicitudesAlta):');
  console.log('-'.repeat(60));
  const solicitudesAlta = await db.collection('socios').doc(EMAIL).collection('solicitudesAlta').get();
  if (solicitudesAlta.empty) {
    console.log('   (ninguna)');
  } else {
    solicitudesAlta.forEach(doc => {
      console.log('\n   ID:', doc.id);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
    });
  }
  
  // 2. Solicitudes de BAJA
  console.log('\n📋 Solicitudes de BAJA (socios/{email}/solicitudesBaja):');
  console.log('-'.repeat(60));
  const solicitudesBaja = await db.collection('socios').doc(EMAIL).collection('solicitudesBaja').get();
  if (solicitudesBaja.empty) {
    console.log('   (ninguna)');
  } else {
    solicitudesBaja.forEach(doc => {
      console.log('\n   ID:', doc.id);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
    });
  }
  
  // 3. Solicitudes de arsenal generales
  console.log('\n📋 Solicitudes de ARSENAL (socios/{email}/solicitudesArsenal):');
  console.log('-'.repeat(60));
  const solicitudesArsenal = await db.collection('socios').doc(EMAIL).collection('solicitudesArsenal').get();
  if (solicitudesArsenal.empty) {
    console.log('   (ninguna)');
  } else {
    solicitudesArsenal.forEach(doc => {
      console.log('\n   ID:', doc.id);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
    });
  }
  
  // 4. PETAs pendientes
  console.log('\n📋 PETAs (socios/{email}/petas):');
  console.log('-'.repeat(60));
  const petas = await db.collection('socios').doc(EMAIL).collection('petas').get();
  if (petas.empty) {
    console.log('   (ninguna)');
  } else {
    petas.forEach(doc => {
      console.log('\n   ID:', doc.id);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
    });
  }
  
  console.log('\n✅ Búsqueda completada');
  process.exit(0);
}

buscarSolicitudes().catch(e => { console.error(e); process.exit(1); });

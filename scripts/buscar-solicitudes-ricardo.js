#!/usr/bin/env node
/**
 * Buscar solicitudes de modificación de arsenal de Ricardo
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const RICARDO_EMAIL = 'dr.ricardocastillo@me.com';

async function buscarSolicitudes() {
  console.log('🔍 Buscando solicitudes de Ricardo...\n');
  
  // 1. Buscar en la subcolección de solicitudes arsenal
  console.log('📋 Solicitudes en socios/{email}/solicitudesArsenal:');
  console.log('-'.repeat(70));
  
  const solicitudesSnap = await db.collection('socios').doc(RICARDO_EMAIL)
    .collection('solicitudesArsenal').get();
  
  if (solicitudesSnap.empty) {
    console.log('   (ninguna)');
  } else {
    solicitudesSnap.forEach(doc => {
      console.log(`\n   📄 ID: ${doc.id}`);
      const data = doc.data();
      console.log(`      Estado: ${data.estado || 'N/A'}`);
      console.log(`      Tipo: ${data.tipo || 'N/A'}`);
      console.log(`      Fecha: ${data.fechaSolicitud?.toDate?.() || data.fechaSolicitud || 'N/A'}`);
      if (data.armas) {
        console.log('      Armas:');
        data.armas.forEach((a, i) => {
          console.log(`         ${i+1}. ${a.marca || ''} ${a.modelo || ''} - Mat: ${a.matricula || 'N/A'} - Folio: ${a.folio || 'N/A'}`);
        });
      }
      if (data.arma) {
        console.log(`      Arma: ${data.arma.marca || ''} ${data.arma.modelo || ''} - Mat: ${data.arma.matricula || 'N/A'}`);
      }
      console.log('      Data completa:', JSON.stringify(data, null, 2).substring(0, 500));
    });
  }
  
  // 2. Buscar en colección global de solicitudes
  console.log('\n\n📋 Solicitudes globales (solicitudesArsenal collection):');
  console.log('-'.repeat(70));
  
  const globalSnap = await db.collection('solicitudesArsenal')
    .where('email', '==', RICARDO_EMAIL).get();
  
  if (globalSnap.empty) {
    // Intentar sin filtro y buscar manualmente
    const allSnap = await db.collection('solicitudesArsenal').get();
    let found = false;
    allSnap.forEach(doc => {
      const data = doc.data();
      if ((data.email || '').toLowerCase() === RICARDO_EMAIL.toLowerCase() ||
          (data.socioEmail || '').toLowerCase() === RICARDO_EMAIL.toLowerCase()) {
        found = true;
        console.log(`\n   📄 ID: ${doc.id}`);
        console.log('      Data:', JSON.stringify(data, null, 2).substring(0, 800));
      }
    });
    if (!found) console.log('   (ninguna)');
  } else {
    globalSnap.forEach(doc => {
      console.log(`\n   📄 ID: ${doc.id}`);
      console.log('      Data:', JSON.stringify(doc.data(), null, 2).substring(0, 800));
    });
  }
  
  // 3. Verificar PETAs
  console.log('\n\n📋 PETAs de Ricardo:');
  console.log('-'.repeat(70));
  
  const petasSnap = await db.collection('socios').doc(RICARDO_EMAIL)
    .collection('petas').get();
  
  if (petasSnap.empty) {
    console.log('   (ninguno)');
  } else {
    petasSnap.forEach(doc => {
      const data = doc.data();
      console.log(`\n   📄 PETA ID: ${doc.id}`);
      console.log(`      Estado: ${data.estado || 'N/A'}`);
      console.log(`      Tipo: ${data.tipo || 'N/A'}`);
      if (data.armas) {
        console.log('      Armas:');
        data.armas.forEach((a, i) => {
          console.log(`         ${i+1}. ${a.clase || a.type_group || ''} ${a.marca || ''} ${a.modelo || ''}`);
          console.log(`            Mat: ${a.matricula || 'N/A'} | Folio: ${a.folio || 'N/A'}`);
        });
      }
    });
  }
  
  // 4. Ver todas las subcolecciones del socio
  console.log('\n\n📋 Listando todas las subcolecciones de Ricardo:');
  console.log('-'.repeat(70));
  
  const socioRef = db.collection('socios').doc(RICARDO_EMAIL);
  const collections = await socioRef.listCollections();
  
  for (const col of collections) {
    console.log(`\n   📁 ${col.id}:`);
    const docs = await col.get();
    docs.forEach(doc => {
      console.log(`      - ${doc.id}`);
    });
  }
  
  process.exit(0);
}

buscarSolicitudes().catch(console.error);

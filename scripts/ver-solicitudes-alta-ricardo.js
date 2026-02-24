#!/usr/bin/env node
/**
 * Ver solicitudes de alta de Ricardo
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const RICARDO_EMAIL = 'dr.ricardocastillo@me.com';

async function verSolicitudes() {
  console.log('🔍 Solicitudes de Alta de Ricardo\n');
  console.log('='.repeat(70));
  
  const altasSnap = await db.collection('socios').doc(RICARDO_EMAIL)
    .collection('solicitudesAlta').get();
  
  altasSnap.forEach(doc => {
    const data = doc.data();
    console.log(`\n📄 Solicitud ID: ${doc.id}`);
    console.log('-'.repeat(70));
    console.log(`   Estado: ${data.estado || 'N/A'}`);
    console.log(`   Fecha solicitud: ${data.fechaSolicitud?.toDate?.() || data.fechaSolicitud || 'N/A'}`);
    console.log(`   Fecha autorización: ${data.fechaAutorizacion?.toDate?.() || data.fechaAutorizacion || 'N/A'}`);
    console.log(`   Autorizado por: ${data.autorizadoPor || 'N/A'}`);
    
    console.log('\n   📋 ARMA SOLICITADA:');
    console.log(`      Clase: ${data.clase || data.type_group || 'N/A'}`);
    console.log(`      Marca: ${data.marca || 'N/A'}`);
    console.log(`      Modelo: ${data.modelo || 'N/A'}`);
    console.log(`      Calibre: ${data.calibre || 'N/A'}`);
    console.log(`      Matrícula: ${data.matricula || 'N/A'}`);
    console.log(`      Folio: ${data.folio || 'N/A'}`);
    console.log(`      Modalidad: ${data.modalidad || 'N/A'}`);
    
    console.log('\n   📎 Data completa:');
    console.log(JSON.stringify(data, null, 2));
  });
  
  console.log('\n\n🔍 Solicitudes de Baja de Ricardo\n');
  console.log('='.repeat(70));
  
  const bajasSnap = await db.collection('socios').doc(RICARDO_EMAIL)
    .collection('solicitudesBaja').get();
  
  bajasSnap.forEach(doc => {
    const data = doc.data();
    console.log(`\n📄 Solicitud Baja ID: ${doc.id}`);
    console.log('-'.repeat(70));
    console.log(`   Estado: ${data.estado || 'N/A'}`);
    console.log(`   Arma: ${data.marca || ''} ${data.modelo || ''}`);
    console.log(`   Matrícula: ${data.matricula || 'N/A'}`);
    console.log('   Data:', JSON.stringify(data, null, 2));
  });
  
  process.exit(0);
}

verSolicitudes().catch(console.error);

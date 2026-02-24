#!/usr/bin/env node
/**
 * Ver todas las solicitudes de baja de Ricardo y buscar socios receptores
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const RICARDO_EMAIL = 'dr.ricardocastillo@me.com';

async function verBajas() {
  console.log('🔍 Solicitudes de Baja de Ricardo Castillo\n');
  console.log('='.repeat(70));
  
  // Ver todas las solicitudes de baja
  const bajasSnap = await db.collection('socios').doc(RICARDO_EMAIL)
    .collection('solicitudesBaja').get();
  
  console.log(`Total solicitudes de baja: ${bajasSnap.size}\n`);
  
  bajasSnap.forEach(doc => {
    const data = doc.data();
    const arma = data.armaDetalles || {};
    console.log(`📄 ID: ${doc.id}`);
    console.log(`   Estado: ${data.estado || 'N/A'}`);
    console.log(`   Arma: ${arma.marca || ''} ${arma.modelo || ''}`);
    console.log(`   Calibre: ${arma.calibre || 'N/A'}`);
    console.log(`   Matrícula: ${arma.matricula || 'N/A'}`);
    console.log(`   Folio: ${arma.folio || 'N/A'}`);
    console.log(`   Motivo: ${data.motivo || 'N/A'}`);
    console.log(`   Receptor: ${data.receptor?.nombre || 'N/A'}`);
    console.log(`   Es socio club: ${data.receptor?.esSocioClub || 'N/A'}`);
    console.log('-'.repeat(70));
  });
  
  // Ver armas actuales de Ricardo
  console.log('\n\n📋 Armas actuales de Ricardo en Firebase:');
  console.log('='.repeat(70));
  
  const armasSnap = await db.collection('socios').doc(RICARDO_EMAIL)
    .collection('armas').get();
  
  armasSnap.forEach(doc => {
    const a = doc.data();
    console.log(`   ID: ${doc.id}`);
    console.log(`   ${a.marca} ${a.modelo} | ${a.calibre} | Mat: ${a.matricula} | Folio: ${a.folio}`);
    console.log('');
  });
  
  // Buscar socios receptores
  console.log('\n\n🔍 Buscando socios receptores:');
  console.log('='.repeat(70));
  
  const sociosSnap = await db.collection('socios').get();
  
  console.log('\n📌 Buscando "ROSADO" o "SERGIO IVAN":');
  sociosSnap.forEach(doc => {
    const nombre = (doc.data().nombre || '').toUpperCase();
    if (nombre.includes('ROSADO') || (nombre.includes('SERGIO') && nombre.includes('IVAN'))) {
      console.log(`   ✅ ${doc.id} → ${doc.data().nombre}`);
    }
  });
  
  console.log('\n📌 Buscando "DESQUENS" o "RICARDO":');
  sociosSnap.forEach(doc => {
    const nombre = (doc.data().nombre || '').toUpperCase();
    if (nombre.includes('DESQUENS')) {
      console.log(`   ✅ ${doc.id} → ${doc.data().nombre}`);
    }
  });
  
  // Buscar el Ruger 10-22 si existe
  console.log('\n\n📌 Buscando Ruger 10-22 en sistema:');
  armasSnap.forEach(doc => {
    const a = doc.data();
    if ((a.marca || '').toUpperCase().includes('RUGER') || 
        (a.modelo || '').toUpperCase().includes('10-22') ||
        (a.modelo || '').toUpperCase().includes('10/22')) {
      console.log(`   ✅ Encontrado: ${a.marca} ${a.modelo} | Mat: ${a.matricula}`);
    }
  });
  
  process.exit(0);
}

verBajas().catch(console.error);

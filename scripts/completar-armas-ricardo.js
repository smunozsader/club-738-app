#!/usr/bin/env node
/**
 * Completar registro de armas aprobadas de Ricardo
 * Las solicitudes fueron aprobadas pero las armas no se crearon en la subcolección
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const RICARDO_EMAIL = 'dr.ricardocastillo@me.com';

const ARMAS_A_REGISTRAR = [
  {
    clase: 'ESCOPETA',
    type_group: 'ESCOPETA',
    calibre: '12 Ga',
    marca: 'ARMSAN',
    modelo: 'PHENOMA',
    matricula: '59-H25YT-002250',
    folio: 'A3903743',
    modalidad: 'caza',
    fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
    registradoPor: 'admin@club738.com',
    origenSolicitud: 'iKsmwjwZTf4japYJt29d'
  },
  {
    clase: 'PISTOLA',
    type_group: 'PISTOLA',
    calibre: '.380" ACP',
    marca: 'SIG SAUER',
    modelo: 'P365',
    matricula: '66F268845',
    folio: 'A3903742',
    modalidad: 'tiro',
    fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
    registradoPor: 'admin@club738.com',
    origenSolicitud: 'tT1tZmaxDP4V45jhzPRc'
  }
];

async function completarRegistro() {
  console.log('🔧 Completando registro de armas aprobadas de Ricardo\n');
  console.log(`📧 Email: ${RICARDO_EMAIL}`);
  console.log('='.repeat(70));
  
  const batch = db.batch();
  
  for (const arma of ARMAS_A_REGISTRAR) {
    const armaId = uuidv4();
    const armaRef = db.collection('socios').doc(RICARDO_EMAIL).collection('armas').doc(armaId);
    
    console.log(`\n✅ Registrando: ${arma.marca} ${arma.modelo}`);
    console.log(`   ID: ${armaId}`);
    console.log(`   Matrícula: ${arma.matricula}`);
    console.log(`   Folio: ${arma.folio}`);
    
    batch.set(armaRef, arma);
  }
  
  await batch.commit();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Armas registradas exitosamente en Firebase');
  
  // Verificar
  console.log('\n🔍 Verificando registro...');
  const armasSnap = await db.collection('socios').doc(RICARDO_EMAIL).collection('armas').get();
  console.log(`   Total armas de Ricardo ahora: ${armasSnap.size}`);
  
  armasSnap.forEach(doc => {
    const a = doc.data();
    console.log(`   - ${a.marca} ${a.modelo} (${a.matricula})`);
  });
  
  console.log('\n⚠️  PENDIENTE: Agregar estas armas al Excel "Fuente de Verdad"');
  
  process.exit(0);
}

completarRegistro().catch(console.error);

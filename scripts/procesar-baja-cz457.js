#!/usr/bin/env node
/**
 * Procesar baja del CZ 457 de Ricardo Castillo
 * Venta a Sergio Iván Rosado Sosa
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const RICARDO_EMAIL = 'dr.ricardocastillo@me.com';
const ARMA_ID = '0bde7093-548b-47d1-9969-0b1af27dd6bf';
const SOLICITUD_BAJA_ID = 'Qo6aYHGFBgEd7NN85b85';

async function procesarBaja() {
  console.log('🔧 Procesando baja del CZ 457 de Ricardo Castillo\n');
  console.log('='.repeat(70));
  
  // 1. Verificar que el arma existe
  const armaRef = db.collection('socios').doc(RICARDO_EMAIL).collection('armas').doc(ARMA_ID);
  const armaDoc = await armaRef.get();
  
  if (!armaDoc.exists) {
    console.log('❌ Arma no encontrada');
    process.exit(1);
  }
  
  const armaData = armaDoc.data();
  console.log('📋 Arma a dar de baja:');
  console.log(`   Marca: ${armaData.marca}`);
  console.log(`   Modelo: ${armaData.modelo}`);
  console.log(`   Calibre: ${armaData.calibre}`);
  console.log(`   Matrícula: ${armaData.matricula}`);
  console.log(`   Folio: ${armaData.folio}`);
  
  // 2. Verificar solicitud de baja
  const solicitudRef = db.collection('socios').doc(RICARDO_EMAIL)
    .collection('solicitudesBaja').doc(SOLICITUD_BAJA_ID);
  const solicitudDoc = await solicitudRef.get();
  
  if (!solicitudDoc.exists) {
    console.log('❌ Solicitud de baja no encontrada');
    process.exit(1);
  }
  
  const solicitudData = solicitudDoc.data();
  console.log('\n📋 Solicitud de baja:');
  console.log(`   Motivo: ${solicitudData.motivo}`);
  console.log(`   Receptor: ${solicitudData.receptor?.nombre || 'N/A'}`);
  console.log(`   Es socio club: ${solicitudData.receptor?.esSocioClub}`);
  
  // 3. Ejecutar baja
  console.log('\n' + '='.repeat(70));
  console.log('⚡ Ejecutando baja...\n');
  
  const batch = db.batch();
  
  // Eliminar arma de Ricardo
  batch.delete(armaRef);
  console.log('   ✅ Eliminando arma de Ricardo Castillo');
  
  // Actualizar solicitud a aprobada
  batch.update(solicitudRef, {
    estado: 'aprobada',
    fechaAprobacion: admin.firestore.FieldValue.serverTimestamp(),
    aprobadoPor: 'admin@club738.com'
  });
  console.log('   ✅ Actualizando estado de solicitud a "aprobada"');
  
  await batch.commit();
  
  // 4. Verificar resultado
  console.log('\n' + '='.repeat(70));
  console.log('🔍 Verificando resultado...\n');
  
  const armasSnap = await db.collection('socios').doc(RICARDO_EMAIL).collection('armas').get();
  console.log(`   Armas de Ricardo ahora: ${armasSnap.size}`);
  armasSnap.forEach(doc => {
    const a = doc.data();
    console.log(`   - ${a.marca} ${a.modelo} (${a.matricula})`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ BAJA COMPLETADA');
  console.log('\n⚠️  NOTA: Sergio Iván Rosado Sosa no está en Firebase como socio.');
  console.log('   Si es nuevo socio, hay que darlo de alta primero y luego');
  console.log('   registrarle esta arma.');
  console.log('\n⚠️  PENDIENTE EXCEL:');
  console.log('   - Eliminar CZ 457 (H228675) de Ricardo Castillo');
  console.log('   - Si Sergio es socio nuevo, agregar su registro con esta arma');
  
  process.exit(0);
}

procesarBaja().catch(console.error);

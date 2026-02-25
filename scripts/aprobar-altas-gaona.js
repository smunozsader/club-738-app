#!/usr/bin/env node
/**
 * Aprobar solicitudes de alta y añadir armas al arsenal de Enrique Gaona
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const EMAIL = 'quiquis77@hotmail.com';

async function aprobarSolicitudes() {
  console.log('🔄 Aprobando solicitudes de alta de Enrique Gaona...\n');
  
  const solicitudesRef = db.collection('socios').doc(EMAIL).collection('solicitudesAlta');
  const solicitudesSnap = await solicitudesRef.where('estado', '==', 'pendiente').get();
  
  if (solicitudesSnap.empty) {
    console.log('❌ No hay solicitudes pendientes');
    process.exit(1);
  }
  
  const armasRef = db.collection('socios').doc(EMAIL).collection('armas');
  const batch = db.batch();
  
  const armasAgregadas = [];
  
  for (const docSnap of solicitudesSnap.docs) {
    const solicitud = docSnap.data();
    const arma = solicitud.armaDetalles;
    
    // Crear documento de arma
    const nuevoArmaRef = armasRef.doc();
    batch.set(nuevoArmaRef, {
      clase: arma.clase,
      type_group: arma.clase.split(' ')[0], // PISTOLA, RIFLE, etc.
      calibre: arma.calibre,
      marca: arma.marca,
      modelo: arma.modelo,
      matricula: arma.matricula,
      folio: arma.folio,
      modalidad: arma.modalidad || 'tiro',
      fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
      origenAdquisicion: solicitud.origenAdquisicion,
      fechaAdquisicion: solicitud.fechaAdquisicion
    });
    
    // Actualizar estado de solicitud
    batch.update(docSnap.ref, {
      estado: 'aprobado',
      fechaAprobacion: admin.firestore.FieldValue.serverTimestamp(),
      aprobadoPor: 'admin@club738.com'
    });
    
    armasAgregadas.push(arma);
    console.log(`✅ ${arma.clase} ${arma.marca} ${arma.modelo} (${arma.matricula})`);
  }
  
  await batch.commit();
  
  console.log(`\n✅ ${armasAgregadas.length} armas añadidas al arsenal de Enrique Gaona`);
  
  // Mostrar datos para fuente de verdad
  console.log('\n📋 DATOS PARA FUENTE DE VERDAD (copiar a Excel):');
  console.log('='.repeat(80));
  console.log('CLASE\tCALIBRE\tMARCA\tMODELO\tMATRÍCULA\tFOLIO');
  console.log('-'.repeat(80));
  
  for (const arma of armasAgregadas) {
    console.log(`${arma.clase}\t${arma.calibre}\t${arma.marca}\t${arma.modelo}\t${arma.matricula}\t${arma.folio}`);
  }
  
  console.log('='.repeat(80));
  
  process.exit(0);
}

aprobarSolicitudes().catch(e => { console.error('❌ Error:', e); process.exit(1); });

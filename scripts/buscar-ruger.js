#!/usr/bin/env node
/**
 * Buscar Ruger 10-22 en todo el sistema
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

async function buscarRuger() {
  console.log('🔍 Buscando Ruger 10-22 en todo el sistema\n');
  console.log('='.repeat(70));
  
  const sociosSnap = await db.collection('socios').get();
  let encontrado = false;
  
  for (const socioDoc of sociosSnap.docs) {
    const armasSnap = await db.collection('socios').doc(socioDoc.id)
      .collection('armas').get();
    
    armasSnap.forEach(armaDoc => {
      const a = armaDoc.data();
      const marca = String(a.marca || '').toUpperCase();
      const modelo = String(a.modelo || '').toUpperCase();
      
      if (marca.includes('RUGER') || modelo.includes('10-22') || modelo.includes('10/22')) {
        encontrado = true;
        console.log(`\n✅ ENCONTRADO:`);
        console.log(`   Socio: ${socioDoc.data().nombre}`);
        console.log(`   Email: ${socioDoc.id}`);
        console.log(`   Arma ID: ${armaDoc.id}`);
        console.log(`   Marca: ${a.marca}`);
        console.log(`   Modelo: ${a.modelo}`);
        console.log(`   Calibre: ${a.calibre}`);
        console.log(`   Matrícula: ${a.matricula}`);
        console.log(`   Folio: ${a.folio}`);
      }
    });
  }
  
  if (!encontrado) {
    console.log('❌ No se encontró ningún Ruger 10-22 en Firebase');
  }
  
  // Buscar también en solicitudes de baja globales
  console.log('\n\n🔍 Buscando en solicitudes de baja de todos los socios:');
  console.log('='.repeat(70));
  
  for (const socioDoc of sociosSnap.docs) {
    const bajasSnap = await db.collection('socios').doc(socioDoc.id)
      .collection('solicitudesBaja').get();
    
    bajasSnap.forEach(bajaDoc => {
      const b = bajaDoc.data();
      const arma = b.armaDetalles || {};
      const marca = String(arma.marca || '').toUpperCase();
      const modelo = String(arma.modelo || '').toUpperCase();
      
      if (marca.includes('RUGER') || modelo.includes('10-22') || modelo.includes('10/22')) {
        console.log(`\n✅ Solicitud de baja encontrada:`);
        console.log(`   Socio: ${socioDoc.data().nombre}`);
        console.log(`   Email: ${socioDoc.id}`);
        console.log(`   Estado: ${b.estado}`);
        console.log(`   Arma: ${arma.marca} ${arma.modelo}`);
        console.log(`   Receptor: ${b.receptor?.nombre || 'N/A'}`);
      }
    });
  }
  
  process.exit(0);
}

buscarRuger().catch(console.error);

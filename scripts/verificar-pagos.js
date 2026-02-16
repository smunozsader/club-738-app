#!/usr/bin/env node
/**
 * Verificar estructura de pagos en Firestore
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function verificar() {
  console.log('🔍 VERIFICACIÓN DE ESTRUCTURA DE PAGOS\n');
  
  // Listar colecciones
  const cols = await db.listCollections();
  console.log('📁 Colecciones en Firestore:');
  for (const c of cols) console.log('  -', c.id);
  
  // Revisar colección pagos
  const pagosSnap = await db.collection('pagos').get();
  console.log('\n📊 Colección "pagos":', pagosSnap.size, 'documentos');
  if (pagosSnap.size > 0) {
    pagosSnap.docs.slice(0, 3).forEach(doc => {
      console.log('  Ejemplo:', doc.id, JSON.stringify(doc.data()).substring(0, 100));
    });
  }
  
  // Buscar socios con campo pagos no vacío
  console.log('\n🔍 Socios con array "pagos" no vacío:');
  const sociosSnap = await db.collection('socios').get();
  let conPagos = 0;
  sociosSnap.forEach(doc => {
    const pagos = doc.data().pagos;
    if (pagos && pagos.length > 0) {
      conPagos++;
      console.log(`  ${doc.data().nombre || doc.id}: ${pagos.length} pagos`);
      console.log('    Último pago:', JSON.stringify(pagos[pagos.length-1]).substring(0, 150));
    }
  });
  console.log(`Total socios con pagos registrados: ${conPagos}`);
  
  // Revisar si hay subcolección pagos
  console.log('\n🔍 Revisando subcolecciones de primer socio...');
  const firstSocio = sociosSnap.docs[0];
  const subCols = await firstSocio.ref.listCollections();
  console.log('Subcolecciones:', subCols.map(c => c.id).join(', '));
  
  await admin.app().delete();
}

verificar();

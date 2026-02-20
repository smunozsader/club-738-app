/**
 * Script para listar y eliminar PETAs y citas en Firestore
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function listarYEliminar() {
  console.log('=== SOLICITUDES PETA EXISTENTES ===');
  const sociosSnap = await db.collection('socios').get();
  
  let totalPetas = 0;
  let totalCitas = 0;
  const petasAEliminar = [];
  const citasAEliminar = [];
  
  for (const socioDoc of sociosSnap.docs) {
    // Listar PETAs
    const petasSnap = await db.collection('socios').doc(socioDoc.id).collection('petas').get();
    if (!petasSnap.empty) {
      console.log('\nSocio:', socioDoc.id);
      petasSnap.forEach(peta => {
        const data = peta.data();
        console.log('  PETA:', peta.id, '- Tipo:', data.tipo, '- Estado:', data.estado);
        petasAEliminar.push({ socioId: socioDoc.id, petaId: peta.id });
        totalPetas++;
      });
    }
    
    // Listar Citas
    const citasSnap = await db.collection('socios').doc(socioDoc.id).collection('citas').get();
    if (!citasSnap.empty) {
      console.log('\nSocio (citas):', socioDoc.id);
      citasSnap.forEach(cita => {
        const data = cita.data();
        console.log('  Cita:', cita.id, '- Tipo:', data.tipo || 'N/A', '- Estado:', data.estado || 'N/A', '- CalendarEventId:', data.calendarEventId || 'N/A');
        citasAEliminar.push({ socioId: socioDoc.id, citaId: cita.id, calendarEventId: data.calendarEventId });
        totalCitas++;
      });
    }
  }
  
  console.log('\n========================================');
  console.log('Total PETAs encontrados:', totalPetas);
  console.log('Total Citas encontradas:', totalCitas);
  console.log('========================================\n');
  
  // Si se pasa --delete como argumento, eliminar
  if (process.argv.includes('--delete')) {
    console.log('🗑️  ELIMINANDO...\n');
    
    // Eliminar PETAs
    for (const { socioId, petaId } of petasAEliminar) {
      await db.collection('socios').doc(socioId).collection('petas').doc(petaId).delete();
      console.log('  ✓ Eliminado PETA:', petaId, 'de', socioId);
    }
    
    // Eliminar Citas
    for (const { socioId, citaId, calendarEventId } of citasAEliminar) {
      await db.collection('socios').doc(socioId).collection('citas').doc(citaId).delete();
      console.log('  ✓ Eliminada Cita:', citaId, 'de', socioId, calendarEventId ? `(Calendar: ${calendarEventId})` : '');
    }
    
    console.log('\n✅ Eliminación completada');
    console.log('  PETAs eliminados:', petasAEliminar.length);
    console.log('  Citas eliminadas:', citasAEliminar.length);
    
    // Retornar IDs de calendario para cancelar eventos
    return citasAEliminar.filter(c => c.calendarEventId).map(c => c.calendarEventId);
  } else {
    console.log('Para eliminar, ejecuta: node limpiar_petas_citas.js --delete');
    return [];
  }
}

listarYEliminar()
  .then(calendarIds => {
    if (calendarIds.length > 0) {
      console.log('\n⚠️  IDs de eventos de calendario a cancelar manualmente:');
      calendarIds.forEach(id => console.log('  -', id));
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

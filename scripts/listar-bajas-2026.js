#!/usr/bin/env node
/**
 * Listar bajas de armas del arsenal del club en 2026
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

async function listarBajas2026() {
  console.log('🔍 Buscando bajas de armas en 2026...\n');
  
  const sociosSnap = await db.collection('socios').get();
  
  const bajas2026 = [];
  
  for (const socioDoc of sociosSnap.docs) {
    const socioData = socioDoc.data();
    
    // Buscar en solicitudesBaja
    const bajasSnap = await db.collection('socios').doc(socioDoc.id).collection('solicitudesBaja').get();
    
    for (const bajaDoc of bajasSnap.docs) {
      const baja = bajaDoc.data();
      
      let fechaBaja = null;
      if (baja.fechaAprobacion) {
        if (baja.fechaAprobacion._seconds) {
          fechaBaja = new Date(baja.fechaAprobacion._seconds * 1000);
        } else if (baja.fechaAprobacion.toDate) {
          fechaBaja = baja.fechaAprobacion.toDate();
        }
      } else if (baja.fechaSolicitud) {
        if (baja.fechaSolicitud._seconds) {
          fechaBaja = new Date(baja.fechaSolicitud._seconds * 1000);
        } else if (baja.fechaSolicitud.toDate) {
          fechaBaja = baja.fechaSolicitud.toDate();
        }
      }
      
      const es2026 = fechaBaja && fechaBaja.getFullYear() === 2026;
      
      if (es2026 || baja.estado === 'aprobado') {
        const arma = baja.armaDetalles || baja.arma || {};
        bajas2026.push({
          socio: baja.nombreSolicitante || socioData.nombre || socioDoc.id,
          email: socioDoc.id,
          clase: arma.clase || arma.type_group || 'N/A',
          calibre: arma.calibre || 'N/A',
          marca: arma.marca || 'N/A',
          modelo: arma.modelo || 'N/A',
          matricula: arma.matricula || 'N/A',
          folio: arma.folio || 'N/A',
          fechaBaja: fechaBaja ? fechaBaja.toISOString().split('T')[0] : 'N/A',
          motivo: baja.motivo || baja.tipoBaja || 'N/A',
          estado: baja.estado || 'N/A',
          receptor: baja.receptor ? baja.receptor.nombre : null
        });
      }
    }
  }
  
  // Ordenar por fecha
  bajas2026.sort((a, b) => {
    const fechaA = a.fechaBaja !== 'N/A' ? new Date(a.fechaBaja) : new Date(0);
    const fechaB = b.fechaBaja !== 'N/A' ? new Date(b.fechaBaja) : new Date(0);
    return fechaA - fechaB;
  });
  
  console.log('=' .repeat(140));
  console.log('📋 BAJAS DE ARMAS DEL ARSENAL EN 2026');
  console.log('=' .repeat(140));
  console.log();
  
  if (bajas2026.length === 0) {
    console.log('No se encontraron bajas de armas en 2026.');
  } else {
    console.log(`Total: ${bajas2026.length} bajas\n`);
    
    // Formato JSON para fácil procesamiento
    console.log('JSON_START');
    console.log(JSON.stringify(bajas2026, null, 2));
    console.log('JSON_END');
  }
  
  console.log('\n' + '=' .repeat(140));
  
  process.exit(0);
}

listarBajas2026().catch(e => { console.error('❌ Error:', e); process.exit(1); });

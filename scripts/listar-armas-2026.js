#!/usr/bin/env node
/**
 * Listar armas ingresadas al arsenal del club en 2026
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

async function listarArmas2026() {
  console.log('🔍 Buscando armas ingresadas en 2026...\n');
  
  const sociosSnap = await db.collection('socios').get();
  
  const armas2026 = [];
  
  for (const socioDoc of sociosSnap.docs) {
    const socioData = socioDoc.data();
    const armasSnap = await db.collection('socios').doc(socioDoc.id).collection('armas').get();
    
    for (const armaDoc of armasSnap.docs) {
      const arma = armaDoc.data();
      
      // Verificar fecha de registro en 2026
      let fechaRegistro = null;
      if (arma.fechaRegistro) {
        if (arma.fechaRegistro._seconds) {
          fechaRegistro = new Date(arma.fechaRegistro._seconds * 1000);
        } else if (arma.fechaRegistro.toDate) {
          fechaRegistro = arma.fechaRegistro.toDate();
        } else if (typeof arma.fechaRegistro === 'string') {
          fechaRegistro = new Date(arma.fechaRegistro);
        }
      }
      
      // También revisar fechaAdquisicion
      let fechaAdquisicion = null;
      if (arma.fechaAdquisicion) {
        if (typeof arma.fechaAdquisicion === 'string') {
          fechaAdquisicion = new Date(arma.fechaAdquisicion);
        }
      }
      
      const es2026Registro = fechaRegistro && fechaRegistro.getFullYear() === 2026;
      const es2026Adquisicion = fechaAdquisicion && fechaAdquisicion.getFullYear() >= 2025; // 2025-2026
      
      if (es2026Registro || (arma.fechaAdquisicion && arma.fechaAdquisicion.startsWith('202'))) {
        armas2026.push({
          socio: socioData.nombre || socioDoc.id,
          email: socioDoc.id,
          credencial: socioData.numeroCredencial || 'N/A',
          clase: arma.clase || arma.type_group || 'N/A',
          calibre: arma.calibre || 'N/A',
          marca: arma.marca || 'N/A',
          modelo: arma.modelo || 'N/A',
          matricula: arma.matricula || 'N/A',
          folio: arma.folio || 'N/A',
          fechaRegistro: fechaRegistro ? fechaRegistro.toISOString().split('T')[0] : 'N/A',
          fechaAdquisicion: arma.fechaAdquisicion || 'N/A',
          origen: arma.origenAdquisicion || 'N/A'
        });
      }
    }
    
    // También revisar solicitudes de alta aprobadas en 2026
    const solicitudesSnap = await db.collection('socios').doc(socioDoc.id).collection('solicitudesAlta').get();
    for (const solDoc of solicitudesSnap.docs) {
      const sol = solDoc.data();
      if (sol.estado === 'aprobado' && sol.fechaAprobacion) {
        let fechaAprobacion = null;
        if (sol.fechaAprobacion._seconds) {
          fechaAprobacion = new Date(sol.fechaAprobacion._seconds * 1000);
        } else if (sol.fechaAprobacion.toDate) {
          fechaAprobacion = sol.fechaAprobacion.toDate();
        }
        
        if (fechaAprobacion && fechaAprobacion.getFullYear() === 2026) {
          const arma = sol.armaDetalles || {};
          // Verificar que no esté ya en la lista
          const yaExiste = armas2026.some(a => a.matricula === arma.matricula);
          if (!yaExiste) {
            armas2026.push({
              socio: sol.nombreSolicitante || socioDoc.id,
              email: socioDoc.id,
              credencial: socioData.numeroCredencial || 'N/A',
              clase: arma.clase || 'N/A',
              calibre: arma.calibre || 'N/A',
              marca: arma.marca || 'N/A',
              modelo: arma.modelo || 'N/A',
              matricula: arma.matricula || 'N/A',
              folio: arma.folio || 'N/A',
              fechaRegistro: fechaAprobacion.toISOString().split('T')[0],
              fechaAdquisicion: sol.fechaAdquisicion || 'N/A',
              origen: sol.origenAdquisicion || 'N/A'
            });
          }
        }
      }
    }
  }
  
  // Ordenar por fecha
  armas2026.sort((a, b) => {
    const fechaA = a.fechaRegistro !== 'N/A' ? new Date(a.fechaRegistro) : new Date(0);
    const fechaB = b.fechaRegistro !== 'N/A' ? new Date(b.fechaRegistro) : new Date(0);
    return fechaA - fechaB;
  });
  
  console.log('=' .repeat(140));
  console.log('📋 ARMAS INGRESADAS AL ARSENAL EN 2026');
  console.log('=' .repeat(140));
  console.log();
  
  if (armas2026.length === 0) {
    console.log('No se encontraron armas registradas en 2026.');
  } else {
    console.log(`Total: ${armas2026.length} armas\n`);
    console.log('FECHA REG.\tSOCIO\t\t\t\t\tCLASE\t\tCALIBRE\t\tMARCA\t\t\tMODELO\t\tMATRÍCULA\tFOLIO');
    console.log('-'.repeat(140));
    
    for (const arma of armas2026) {
      const socioCorto = arma.socio.substring(0, 30).padEnd(30);
      const clase = arma.clase.substring(0, 12).padEnd(12);
      const calibre = arma.calibre.substring(0, 10).padEnd(10);
      const marca = arma.marca.substring(0, 18).padEnd(18);
      const modelo = arma.modelo.substring(0, 12).padEnd(12);
      console.log(`${arma.fechaRegistro}\t${socioCorto}\t${clase}\t${calibre}\t${marca}\t${modelo}\t${arma.matricula}\t${arma.folio}`);
    }
  }
  
  console.log('\n' + '=' .repeat(140));
  
  process.exit(0);
}

listarArmas2026().catch(e => { console.error('❌ Error:', e); process.exit(1); });

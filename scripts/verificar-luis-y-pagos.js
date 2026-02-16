#!/usr/bin/env node
/**
 * Verifica Luis Fernando y registra pagos de febrero 2026
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Pagos del PDF (01-16 feb 2026)
const PAGOS_FEBRERO = [
  { nombre: 'ADOLFO XACUR RIVERA', fecha: '2026-02-07', cuota: 6500, femeti: 350, total: 6850 },
  { nombre: 'JOSE VICENTE TRUJILLO LUCIC', fecha: '2026-02-12', cuota: 6500, femeti: 350, total: 6850 },
  { nombre: 'JUAN CARLOS BRICEÑO GONZALEZ', fecha: '2026-02-06', cuota: 6500, femeti: 350, total: 6850 },
  { nombre: 'GADDI OTHONIEL CAAMAL PUC', fecha: '2026-02-06', cuota: 6500, femeti: 350, total: 6850 },
  { nombre: 'JOSE GIL HEREDIA HAGAR', fecha: '2026-02-02', cuota: 6500, femeti: 0, total: 6500 }
];

async function main() {
  console.log('🔍 Verificando Luis Fernando Guillermo Gamboa...\n');
  
  // Buscar a Luis Fernando
  const allSnap = await db.collection('socios').get();
  let luisFernando = null;
  
  allSnap.forEach(doc => {
    const nombre = (doc.data().nombre || '').toUpperCase();
    if (nombre.includes('LUIS FERNANDO') && nombre.includes('GUILLERMO')) {
      luisFernando = { id: doc.id, ...doc.data() };
    }
  });
  
  if (luisFernando) {
    console.log('✅ Encontrado:', luisFernando.nombre);
    console.log('   Email:', luisFernando.id);
    console.log('   Fecha alta:', luisFernando.fechaAlta || luisFernando.fechaRegistro || 'No registrada');
    console.log('   Pagos:', luisFernando.pagos?.length || 0);
    
    // Verificar si tiene fecha de inscripción 2026
    const fechaAlta = luisFernando.fechaAlta || luisFernando.fechaRegistro;
    if (fechaAlta) {
      const fecha = fechaAlta._seconds ? new Date(fechaAlta._seconds * 1000) : new Date(fechaAlta);
      console.log('   Año inscripción:', fecha.getFullYear());
      if (fecha.getFullYear() === 2026) {
        console.log('   → ✅ Confirmado: Es socio nuevo 2026');
      }
    }
  } else {
    console.log('❌ No encontrado Luis Fernando Guillermo Gamboa');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📝 Registrando 5 pagos de febrero 2026...\n');
  
  // Buscar emails de los socios a pagar
  const sociosMap = {};
  allSnap.forEach(doc => {
    const nombre = (doc.data().nombre || '').toUpperCase();
    sociosMap[nombre] = doc.id;
  });
  
  for (const pago of PAGOS_FEBRERO) {
    // Buscar email del socio
    let email = null;
    for (const [nombre, id] of Object.entries(sociosMap)) {
      if (nombre.includes(pago.nombre.split(' ')[0]) && nombre.includes(pago.nombre.split(' ').slice(-1)[0])) {
        email = id;
        break;
      }
    }
    
    if (!email) {
      // Búsqueda más flexible
      for (const [nombre, id] of Object.entries(sociosMap)) {
        const palabras = pago.nombre.split(' ');
        const matches = palabras.filter(p => nombre.includes(p)).length;
        if (matches >= 3) {
          email = id;
          break;
        }
      }
    }
    
    if (!email) {
      console.log(`❌ No encontrado: ${pago.nombre}`);
      continue;
    }
    
    // Verificar si ya tiene pago 2026
    const socioRef = db.collection('socios').doc(email);
    const socioSnap = await socioRef.get();
    const socioData = socioSnap.data();
    const pagosExistentes = socioData.pagos || [];
    
    const yaPago2026 = pagosExistentes.some(p => {
      if (!p.fecha) return false;
      const fecha = p.fecha._seconds ? new Date(p.fecha._seconds * 1000) : new Date(p.fecha);
      return fecha.getFullYear() === 2026;
    });
    
    if (yaPago2026) {
      console.log(`⚠️  ${pago.nombre} ya tiene pago 2026 registrado - saltando`);
      continue;
    }
    
    // Registrar pago
    const nuevoPago = {
      fecha: admin.firestore.Timestamp.fromDate(new Date(pago.fecha)),
      total: pago.total,
      conceptos: {
        anualidad: pago.cuota,
        femeti: pago.femeti
      },
      metodoPago: 'efectivo',
      registradoPor: 'admin@club738.com',
      notas: `Pago registrado del corte 01-16 feb 2026`
    };
    
    await socioRef.update({
      pagos: admin.firestore.FieldValue.arrayUnion(nuevoPago),
      'membresia2026.estado': 'pagado',
      'membresia2026.fechaPago': nuevoPago.fecha,
      'membresia2026.monto': pago.total
    });
    
    console.log(`✅ ${pago.nombre} → $${pago.total.toLocaleString()} (${pago.fecha})`);
  }
  
  console.log('\n✅ Pagos registrados exitosamente');
  
  await admin.app().delete();
}

main();

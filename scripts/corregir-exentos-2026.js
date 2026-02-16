#!/usr/bin/env node
/**
 * Corregir motivos de exención y agregar Gardoni + Arechiga
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const EXENTOS_CORRECTOS = [
  // Secretario
  { email: 'smunozam@gmail.com', razon: 'Secretario del Club' },
  // Familia del Presidente
  { email: 'richfegas@icloud.com', razon: 'Familia del Presidente' },
  { email: 'gfernandez63@gmail.com', razon: 'Familia del Presidente' },
  { email: 'richfer1020@gmail.com', razon: 'Familia del Presidente' },
  { email: 'richfer0304@gmail.com', razon: 'Familia del Presidente' },
  // Tesorero y esposa
  { email: 'jrgardoni@gmail.com', razon: 'Tesorero del Club' },
  { email: 'arechiga@jogarplastics.com', razon: 'Placeholder armas extras Tesorero' },
];

async function corregir() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('     🏅 ACTUALIZANDO EXENTOS CON MOTIVOS CORRECTOS');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const batch = db.batch();
  const fecha = admin.firestore.Timestamp.now();

  for (const socio of EXENTOS_CORRECTOS) {
    const docRef = db.doc('socios/' + socio.email.toLowerCase());
    const snap = await docRef.get();
    
    if (!snap.exists) {
      console.log('❌ No encontrado:', socio.email);
      continue;
    }

    const nombre = snap.data().nombre || socio.email;
    const pagosActuales = snap.data().pagos || [];
    
    // Filtrar pagos previos de exento para reemplazar
    const pagosLimpios = pagosActuales.filter(p => p.metodoPago !== 'exento');
    
    const pagoExento = {
      fecha: fecha,
      conceptos: [{ concepto: 'exento', nombre: 'Exención de cuota 2026', monto: 0 }],
      total: 0,
      metodoPago: 'exento',
      notas: socio.razon,
      registradoPor: 'admin@club738.com',
      esExento: true
    };

    pagosLimpios.push(pagoExento);

    batch.update(docRef, {
      pagos: pagosLimpios,
      membresia2026: {
        estado: 'exento',
        monto: 0,
        fechaRegistro: fecha,
        razon: socio.razon,
        registradoPor: 'admin@club738.com'
      }
    });

    console.log('✅', nombre.substring(0,40).padEnd(40), '→', socio.razon);
  }

  await batch.commit();
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ 7 socios exentos actualizados correctamente');
  console.log('═══════════════════════════════════════════════════════════════════');

  await admin.app().delete();
}

corregir();

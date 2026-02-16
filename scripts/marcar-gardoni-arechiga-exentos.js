#!/usr/bin/env node
/**
 * Marcar a Gardoni y Arechiga como exentos 2026
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const NUEVOS_EXENTOS = [
  { email: 'jrgardoni@gmail.com', nombre: 'JOAQUIN RODOLFO GARDONI NUÑEZ', razon: 'Presidente del Club' },
  { email: 'arechiga@jogarplastics.com', nombre: 'MARIA FERNANDA GUADALUPE ARECHIGA RAMOS', razon: 'Familia del Presidente' },
];

async function marcar() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('     🏅 MARCANDO GARDONI Y ARECHIGA COMO EXENTOS');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const batch = db.batch();
  const fecha = admin.firestore.Timestamp.now();

  for (const socio of NUEVOS_EXENTOS) {
    const docRef = db.doc('socios/' + socio.email.toLowerCase());
    const snap = await docRef.get();
    
    if (!snap.exists) {
      console.log('❌ No encontrado:', socio.email);
      continue;
    }

    const pagoExento = {
      fecha: fecha,
      conceptos: [{ concepto: 'exento', nombre: 'Exención de cuota 2026', monto: 0 }],
      total: 0,
      metodoPago: 'exento',
      notas: socio.razon,
      registradoPor: 'admin@club738.com',
      esExento: true
    };

    batch.update(docRef, {
      pagos: admin.firestore.FieldValue.arrayUnion(pagoExento),
      membresia2026: {
        estado: 'exento',
        monto: 0,
        fechaRegistro: fecha,
        razon: socio.razon,
        registradoPor: 'admin@club738.com'
      }
    });

    console.log('✅', socio.nombre.padEnd(45), '→ EXENTO (' + socio.razon + ')');
  }

  await batch.commit();
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ Gardoni y Arechiga marcados como exentos');
  console.log('═══════════════════════════════════════════════════════════════════');

  await admin.app().delete();
}

marcar();

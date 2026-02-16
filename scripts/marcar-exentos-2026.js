#!/usr/bin/env node
/**
 * Marcar socios exentos de pago 2026
 * - Sergio Muñoz de Alba (Admin/Secretario)
 * - Familia Fernández (miembros fundadores)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const db = admin.firestore();

const SOCIOS_EXENTOS = [
  { email: 'smunozam@gmail.com', nombre: 'SERGIO MUÑOZ DE ALBA MEDRANO', razon: 'Secretario del Club' },
  { email: 'richfegas@icloud.com', nombre: 'RICARDO JESÚS FERNÁNDEZ Y GASQUE', razon: 'Miembro fundador' },
  { email: 'gfernandez63@gmail.com', nombre: 'GERARDO ANTONIO FERNÁNDEZ QUIJANO', razon: 'Miembro fundador' },
  { email: 'richfer1020@gmail.com', nombre: 'RICARDO MANUEL FERNÁNDEZ QUIJANO', razon: 'Miembro fundador' },
  { email: 'richfer0304@gmail.com', nombre: 'RICARDO DANIEL FERNÁNDEZ PÉREZ', razon: 'Miembro fundador' },
];

async function marcarExentos() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('     🏅 MARCANDO SOCIOS EXENTOS DE PAGO 2026');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const batch = db.batch();
  const fecha = admin.firestore.Timestamp.now();

  for (const socio of SOCIOS_EXENTOS) {
    const docRef = db.doc(`socios/${socio.email.toLowerCase()}`);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      console.log(`❌ No encontrado: ${socio.nombre} (${socio.email})`);
      continue;
    }

    const pagoExento = {
      fecha: fecha,
      conceptos: [{
        concepto: 'exento',
        nombre: 'Exención de cuota 2026',
        monto: 0
      }],
      total: 0,
      metodoPago: 'exento',
      notas: socio.razon,
      registradoPor: 'admin@club738.com',
      esExento: true
    };

    // Agregar al array de pagos y actualizar membresia2026
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

    console.log(`✅ ${socio.nombre.padEnd(40)} → EXENTO (${socio.razon})`);
  }

  await batch.commit();
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ Socios exentos actualizados correctamente');
  console.log('═══════════════════════════════════════════════════════════════════');

  await admin.app().delete();
}

marcarExentos();

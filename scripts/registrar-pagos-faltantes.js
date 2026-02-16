#!/usr/bin/env node
/**
 * Registrar pagos faltantes en Firestore (del Excel 2026)
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const PAGOS_FALTANTES = [
  {
    email: 'oso.guigam@gmail.com',
    nombre: 'LUIS FERNANDO GUILLERMO GAMBOA',
    fecha: '2026-01-08',
    inscripcion: 2000,
    cuota: 6000,
    femeti: 700,  // FEMETI nuevo socio es $700
    total: 8700,
    notas: 'Socio nuevo 2026. Pago corregido desde Excel.'
  },
  {
    email: 'lic.arielparedescetina@hotmail.com',
    nombre: 'ARIEL ANTONIO PAREDES CETINA',
    fecha: '2026-01-19',  // Usuario dijo 19 de enero
    inscripcion: 0,
    cuota: 6500,
    femeti: 350,
    total: 6850,
    notas: 'Pago corregido desde Excel. Fecha confirmada por secretario.'
  }
];

async function registrarPagos() {
  console.log('📝 Registrando pagos faltantes...\n');
  
  for (const pago of PAGOS_FALTANTES) {
    const socioRef = db.collection('socios').doc(pago.email);
    const socioSnap = await socioRef.get();
    
    if (!socioSnap.exists) {
      console.log(`❌ No existe socio: ${pago.email}`);
      continue;
    }
    
    const nuevoPago = {
      fecha: admin.firestore.Timestamp.fromDate(new Date(pago.fecha)),
      conceptos: {
        inscripcion: pago.inscripcion,
        anualidad: pago.cuota,
        femeti: pago.femeti
      },
      total: pago.total,
      metodoPago: 'efectivo',
      registradoPor: 'admin@club738.com',
      notas: pago.notas,
      fechaRegistro: admin.firestore.Timestamp.now()
    };
    
    await socioRef.update({
      pagos: admin.firestore.FieldValue.arrayUnion(nuevoPago),
      'membresia2026.estado': 'pagado',
      'membresia2026.activa': true,
      'membresia2026.fechaPago': nuevoPago.fecha,
      'membresia2026.monto': pago.total,
      'membresia2026.desglose': {
        inscripcion: pago.inscripcion,
        anualidad: pago.cuota,
        femeti: pago.femeti
      }
    });
    
    console.log(`✅ ${pago.nombre}`);
    console.log(`   Email: ${pago.email}`);
    console.log(`   Fecha: ${pago.fecha}`);
    console.log(`   Inscripción: $${pago.inscripcion.toLocaleString()}`);
    console.log(`   Cuota: $${pago.cuota.toLocaleString()}`);
    console.log(`   FEMETI: $${pago.femeti.toLocaleString()}`);
    console.log(`   Total: $${pago.total.toLocaleString()}`);
    console.log();
  }
  
  console.log('✅ Pagos registrados exitosamente');
  
  await admin.app().delete();
}

registrarPagos();

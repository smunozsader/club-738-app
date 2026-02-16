#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function marcarAimee() {
  const fecha = admin.firestore.Timestamp.now();
  const docRef = db.doc('socios/aimeegomez615@gmail.com');
  const snap = await docRef.get();
  
  if (snap.exists === false) {
    console.log('No encontrada');
    return;
  }

  const pagosActuales = snap.data().pagos || [];
  const pagosLimpios = pagosActuales.filter(p => p.metodoPago !== 'exento');
  
  pagosLimpios.push({
    fecha: fecha,
    conceptos: [{ concepto: 'exento', nombre: 'Exención de cuota 2026', monto: 0 }],
    total: 0,
    metodoPago: 'exento',
    notas: 'Inscripción dic 2025 cubre 2026',
    registradoPor: 'admin@club738.com',
    esExento: true
  });

  await docRef.update({
    pagos: pagosLimpios,
    membresia2026: {
      estado: 'exento',
      monto: 0,
      fechaRegistro: fecha,
      razon: 'Inscripción dic 2025 cubre 2026',
      registradoPor: 'admin@club738.com'
    }
  });

  console.log('✅ AIMEE GOMEZ MENDOZA → EXENTA (Inscripción dic 2025 cubre 2026)');
  await admin.app().delete();
}

marcarAimee();

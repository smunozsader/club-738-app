#!/usr/bin/env node
/**
 * Ver y corregir dirección de Ricardo Desquens
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const EMAIL = 'ridesquens@yahoo.com.mx';

// Datos correctos
const DATOS_CORRECTOS = {
  domicilio: {
    calle: 'Calle 51-C # 634 x 72 y 72-A',
    colonia: 'Real Montejo',
    ciudad: 'MÉRIDA',
    municipio: 'MÉRIDA',
    estado: 'YUCATÁN',
    cp: '97302'
  },
  curp: 'DEBR700911HDFSNC06',
  telefono: '9993940909'
};

async function verificarYCorregir() {
  console.log('🔍 Ricardo Alberto Desquens Bonilla');
  console.log('📧 Email:', EMAIL);
  console.log('='.repeat(70));
  
  const docRef = db.collection('socios').doc(EMAIL);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    console.log('❌ Socio no encontrado');
    process.exit(1);
  }
  
  const d = doc.data();
  
  console.log('\n📋 DATOS ACTUALES EN FIREBASE:');
  console.log('   Nombre:', d.nombre);
  console.log('   CURP:', d.curp);
  console.log('   Teléfono:', d.telefono || d.celular || 'N/A');
  console.log('   Domicilio:', JSON.stringify(d.domicilio, null, 2));
  
  console.log('\n📋 DATOS CORRECTOS:');
  console.log('   Calle: Calle 51-C # 634 x 72 y 72-A');
  console.log('   Colonia: Real Montejo');
  console.log('   Ciudad: MÉRIDA');
  console.log('   Estado: YUCATÁN');
  console.log('   CP: 97302');
  console.log('   CURP: DEBR700911HDFSNC06');
  console.log('   Teléfono: 9993940909');
  
  // Aplicar corrección
  console.log('\n' + '='.repeat(70));
  console.log('⚡ Aplicando corrección en Firebase...\n');
  
  await docRef.update(DATOS_CORRECTOS);
  
  console.log('✅ Domicilio actualizado');
  console.log('✅ CURP actualizado');
  console.log('✅ Teléfono actualizado');
  
  // Verificar
  const docNuevo = await docRef.get();
  const dNuevo = docNuevo.data();
  
  console.log('\n📋 VERIFICACIÓN - Datos actualizados:');
  console.log('   Domicilio:', JSON.stringify(dNuevo.domicilio, null, 2));
  console.log('   CURP:', dNuevo.curp);
  console.log('   Teléfono:', dNuevo.telefono);
  
  process.exit(0);
}

verificarYCorregir().catch(console.error);

#!/usr/bin/env node
/**
 * Verificar pagos de los Arieles
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function verificar() {
  console.log('🔍 Buscando socios con nombre ARIEL...\n');
  
  const snap = await db.collection('socios').get();
  
  snap.forEach(doc => {
    const nombre = (doc.data().nombre || '').toUpperCase();
    if (nombre.includes('ARIEL')) {
      console.log('='.repeat(60));
      console.log('📧 Email:', doc.id);
      console.log('👤 Nombre:', doc.data().nombre);
      console.log('📱 Teléfono:', doc.data().telefono || doc.data().celular || 'N/A');
      
      const pagos = doc.data().pagos || [];
      console.log('\n💰 Pagos registrados:', pagos.length);
      
      pagos.forEach((p, i) => {
        const fecha = p.fecha?._seconds 
          ? new Date(p.fecha._seconds * 1000) 
          : new Date(p.fecha);
        
        console.log(`\n  Pago ${i + 1}:`);
        console.log(`    Fecha: ${fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}`);
        console.log(`    Total: $${p.total?.toLocaleString('es-MX') || 0}`);
        console.log(`    Conceptos:`, JSON.stringify(p.conceptos || {}, null, 2).split('\n').join('\n    '));
        console.log(`    Método: ${p.metodoPago || 'N/A'}`);
        console.log(`    Notas: ${p.notas || '-'}`);
      });
      
      // Verificar membresia2026
      const membresia = doc.data().membresia2026;
      if (membresia) {
        console.log('\n📋 Membresía 2026:', JSON.stringify(membresia, null, 2));
      }
      
      console.log('\n');
    }
  });
  
  await admin.app().delete();
}

verificar();

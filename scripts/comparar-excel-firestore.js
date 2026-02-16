#!/usr/bin/env node
/**
 * Compara pagos del Excel 2026 vs Firestore
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Pagos del Excel 2026
const pagosExcel = JSON.parse(readFileSync('/tmp/pagos_excel_2026.json', 'utf8'));

async function comparar() {
  console.log('=' .repeat(90));
  console.log('📊 COMPARACIÓN: EXCEL 2026 vs FIRESTORE');
  console.log('='.repeat(90));
  
  const sociosSnap = await db.collection('socios').get();
  
  // Mapear socios de Firestore por email
  const firestoreMap = {};
  sociosSnap.forEach(doc => {
    const data = doc.data();
    const pagos = data.pagos || [];
    
    // Buscar pagos 2026
    const pagos2026 = pagos.filter(p => {
      if (!p.fecha) return false;
      const fecha = p.fecha._seconds ? new Date(p.fecha._seconds * 1000) : new Date(p.fecha);
      // Incluir dic 2025 si tiene concepto 2026
      if (fecha.getFullYear() === 2026) return true;
      if (fecha.getFullYear() === 2025 && fecha.getMonth() === 11) {
        const conceptos = p.conceptos || [];
        return conceptos.some(c => (c.nombre || '').includes('2026'));
      }
      return false;
    });
    
    firestoreMap[doc.id.toLowerCase()] = {
      nombre: data.nombre,
      email: doc.id,
      pago2026: pagos2026.length > 0 ? pagos2026[pagos2026.length - 1] : null
    };
  });
  
  const enExcelNoFirestore = [];
  const enAmbos = [];
  const diferencias = [];
  
  for (const pExcel of pagosExcel) {
    const email = pExcel.email?.toLowerCase();
    const fsData = firestoreMap[email];
    
    if (!fsData) {
      enExcelNoFirestore.push({ ...pExcel, razon: 'Email no encontrado en Firestore' });
      continue;
    }
    
    if (!fsData.pago2026) {
      enExcelNoFirestore.push({ ...pExcel, razon: 'Sin pago 2026 en Firestore' });
    } else {
      enAmbos.push({
        nombre: pExcel.nombre,
        email: email,
        excel: pExcel.total,
        firestore: fsData.pago2026.total || 0
      });
      
      // Verificar diferencias de monto
      const diff = Math.abs(pExcel.total - (fsData.pago2026.total || 0));
      if (diff > 10) {
        diferencias.push({
          nombre: pExcel.nombre,
          email: email,
          excel: pExcel.total,
          firestore: fsData.pago2026.total || 0,
          diferencia: diff
        });
      }
    }
  }
  
  // Buscar pagos en Firestore que NO están en Excel
  const emailsExcel = new Set(pagosExcel.map(p => p.email?.toLowerCase()));
  const enFirestoreNoExcel = [];
  
  for (const [email, data] of Object.entries(firestoreMap)) {
    if (data.pago2026 && !emailsExcel.has(email)) {
      enFirestoreNoExcel.push({
        nombre: data.nombre,
        email: email,
        total: data.pago2026.total || 0
      });
    }
  }
  
  // Reportes
  console.log(`\n✅ COINCIDEN (Excel y Firestore): ${enAmbos.length}`);
  
  if (enExcelNoFirestore.length > 0) {
    console.log(`\n❌ EN EXCEL PERO NO EN FIRESTORE: ${enExcelNoFirestore.length}`);
    console.log('-'.repeat(90));
    enExcelNoFirestore.forEach((p, i) => {
      console.log(`${i+1}. ${p.nombre} (${p.email}) - $${p.total.toLocaleString()} - ${p.razon}`);
    });
  }
  
  if (enFirestoreNoExcel.length > 0) {
    console.log(`\n⚠️  EN FIRESTORE PERO NO EN EXCEL: ${enFirestoreNoExcel.length}`);
    console.log('-'.repeat(90));
    enFirestoreNoExcel.forEach((p, i) => {
      console.log(`${i+1}. ${p.nombre} (${p.email}) - $${p.total.toLocaleString()}`);
    });
  }
  
  if (diferencias.length > 0) {
    console.log(`\n⚠️  DIFERENCIAS DE MONTO: ${diferencias.length}`);
    console.log('-'.repeat(90));
    diferencias.forEach((p, i) => {
      console.log(`${i+1}. ${p.nombre}: Excel $${p.excel} vs Firestore $${p.firestore} (diff: $${p.diferencia})`);
    });
  }
  
  console.log('\n' + '='.repeat(90));
  console.log('RESUMEN:');
  console.log(`  Excel: ${pagosExcel.length} pagos ($${pagosExcel.reduce((s,p) => s + p.total, 0).toLocaleString()})`);
  console.log(`  Firestore: ${Object.values(firestoreMap).filter(f => f.pago2026).length} pagos`);
  console.log('='.repeat(90));
  
  await admin.app().delete();
}

comparar();

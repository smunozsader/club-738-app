#!/usr/bin/env node
/**
 * Verificar armas de Ricardo Castillo en Firebase
 * Email: dr.ricardocastillo@me.com
 * 
 * Buscando:
 * 1. Escopeta Armasan 12 ga, matrícula 59-H25YT-002250, folio A3903743
 * 2. Pistola .380 Sig Sauer P365, matrícula 66F.268845, folio A3903742
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const RICARDO_EMAIL = 'dr.ricardocastillo@me.com';
const MATRICULAS_BUSCAR = ['59-H25YT-002250', '66F.268845'];
const FOLIOS_BUSCAR = ['A3903743', 'A3903742'];

async function verificar() {
  console.log('🔍 Verificando armas de Ricardo Castillo\n');
  console.log(`📧 Email: ${RICARDO_EMAIL}`);
  console.log('='.repeat(70));
  
  // 1. Verificar documento del socio
  const socioDoc = await db.collection('socios').doc(RICARDO_EMAIL).get();
  
  if (!socioDoc.exists) {
    console.log('❌ Socio NO encontrado en Firebase');
    process.exit(1);
  }
  
  const socioData = socioDoc.data();
  console.log('\n✅ Socio encontrado:');
  console.log(`   Nombre: ${socioData.nombre}`);
  console.log(`   Teléfono: ${socioData.telefono || socioData.celular || 'N/A'}`);
  console.log(`   CURP: ${socioData.curp || 'N/A'}`);
  
  // 2. Obtener todas las armas de Ricardo
  console.log('\n📋 Armas registradas actualmente:');
  console.log('-'.repeat(70));
  
  const armasSnap = await db.collection('socios').doc(RICARDO_EMAIL).collection('armas').get();
  
  if (armasSnap.empty) {
    console.log('   ⚠️ No tiene armas registradas');
  } else {
    armasSnap.forEach(doc => {
      const arma = doc.data();
      console.log(`\n   🔫 ID: ${doc.id}`);
      console.log(`      Clase: ${arma.clase || arma.type_group || 'N/A'}`);
      console.log(`      Marca: ${arma.marca || 'N/A'}`);
      console.log(`      Modelo: ${arma.modelo || 'N/A'}`);
      console.log(`      Calibre: ${arma.calibre || 'N/A'}`);
      console.log(`      Matrícula: ${arma.matricula || 'N/A'}`);
      console.log(`      Folio: ${arma.folio || 'N/A'}`);
      console.log(`      Modalidad: ${arma.modalidad || 'N/A'}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🔎 Buscando matrículas específicas:');
  console.log('   - 59-H25YT-002250 (Escopeta Armasan 12 ga, folio A3903743)');
  console.log('   - 66F.268845 (Pistola .380 Sig Sauer P365, folio A3903742)');
  console.log('='.repeat(70));
  
  let encontradas = [];
  let noEncontradas = [];
  
  armasSnap.forEach(doc => {
    const arma = doc.data();
    const matricula = (arma.matricula || '').toUpperCase().trim();
    const folio = (arma.folio || '').toUpperCase().trim();
    
    for (const m of MATRICULAS_BUSCAR) {
      if (matricula.includes(m.toUpperCase()) || m.toUpperCase().includes(matricula)) {
        encontradas.push({ tipo: 'matricula', valor: m, arma: arma });
      }
    }
    
    for (const f of FOLIOS_BUSCAR) {
      if (folio.includes(f.toUpperCase()) || f.toUpperCase().includes(folio)) {
        encontradas.push({ tipo: 'folio', valor: f, arma: arma });
      }
    }
  });
  
  // Determinar cuáles NO fueron encontradas
  for (const m of MATRICULAS_BUSCAR) {
    const existe = armasSnap.docs.some(doc => {
      const matricula = (doc.data().matricula || '').toUpperCase().trim();
      return matricula === m.toUpperCase();
    });
    if (!existe) noEncontradas.push(`Matrícula: ${m}`);
  }
  
  for (const f of FOLIOS_BUSCAR) {
    const existe = armasSnap.docs.some(doc => {
      const folio = (doc.data().folio || '').toUpperCase().trim();
      return folio === f.toUpperCase();
    });
    if (!existe) noEncontradas.push(`Folio: ${f}`);
  }
  
  // Resumen
  console.log('\n📊 RESUMEN:');
  console.log('-'.repeat(70));
  console.log(`   Total armas de Ricardo: ${armasSnap.size}`);
  
  if (encontradas.length > 0) {
    console.log('\n   ✅ ENCONTRADAS en Firebase:');
    encontradas.forEach(e => {
      console.log(`      - ${e.tipo}: ${e.valor} → ${e.arma.marca} ${e.arma.modelo}`);
    });
  }
  
  if (noEncontradas.length > 0) {
    console.log('\n   ❌ NO encontradas en Firebase:');
    noEncontradas.forEach(n => {
      console.log(`      - ${n}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (noEncontradas.length > 0) {
    console.log('\n⚠️  ACCIÓN REQUERIDA:');
    console.log('   Las armas con matrículas 59-H25YT-002250 y 66F.268845');
    console.log('   NO están en Firebase. Si deben estar, hay que agregarlas');
    console.log('   tanto a Firebase como al Excel "Fuente de Verdad".');
  } else {
    console.log('\n✅ Todas las armas buscadas están en Firebase.');
    console.log('   → Verificar si están en Excel "Fuente de Verdad".');
  }
  
  process.exit(0);
}

verificar().catch(console.error);

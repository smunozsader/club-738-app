#!/usr/bin/env node

/**
 * diagnostico-firestore.js
 * Auditar integridad de datos en Firestore
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initFirebase() {
  try {
    const serviceAccountKeyPath = path.join(__dirname, '../../scripts/serviceAccountKey.json');
    const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, 'utf8'));
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
      });
    }
    
    return admin.firestore();
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error.message);
    process.exit(1);
  }
}

async function main() {
  const db = initFirebase();

  console.log('\n📊 DIAGNÓSTICO DE INTEGRIDAD - Firestore\n');
  console.log('='.repeat(70));

  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.limit(10).get();

    if (snapshot.empty) {
      console.log('❌ No hay socios en Firestore');
      process.exit(1);
    }

    console.log(`\n📋 Analizando primeros 10 socios...\n`);

    let conCredencial = 0;
    let conTelefono = 0;
    let conNumeroSocio = 0;
    let faltanCredenciales = [];
    let faltanTelefonos = [];

    const socios = [];

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;

      socios.push({
        email,
        nombre: socio.nombre || 'N/A',
        credencial: socio.credencial || 'FALTA',
        numero_socio: socio.numero_socio || 'FALTA',
        telefono: socio.telefono || 'FALTA',
      });

      if (socio.credencial) conCredencial++;
      if (socio.numero_socio) conNumeroSocio++;
      if (socio.telefono) conTelefono++;

      if (!socio.credencial && !socio.numero_socio) {
        faltanCredenciales.push(email);
      }

      if (!socio.telefono) {
        faltanTelefonos.push(email);
      }
    }

    // Mostrar tabla
    console.log('📌 CAMPOS ENCONTRADOS:\n');
    socios.forEach((s, idx) => {
      console.log(`${(idx + 1).toString().padStart(2, '0')}. ${s.email}`);
      console.log(`    Nombre: ${s.nombre}`);
      console.log(`    Credencial: ${s.credencial}`);
      console.log(`    Número Socio: ${s.numero_socio}`);
      console.log(`    Teléfono: ${s.telefono}`);
      console.log('');
    });

    // Resumen
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE INTEGRIDAD:\n');
    console.log(`Total socios analizados: ${snapshot.size}`);
    console.log(`Socios con 'credencial': ${conCredencial} ✅`);
    console.log(`Socios con 'numero_socio': ${conNumeroSocio} ✅`);
    console.log(`Socios con 'telefono': ${conTelefono} ✅`);
    console.log('');
    console.log(`Socios SIN credencial/numero_socio: ${faltanCredenciales.length} ❌`);
    console.log(`Socios SIN teléfono: ${faltanTelefonos.length} ❌`);

    if (faltanCredenciales.length > 0) {
      console.log('\n❌ FALTAN CREDENCIALES:');
      faltanCredenciales.forEach(email => console.log(`   - ${email}`));
    }

    if (faltanTelefonos.length > 0) {
      console.log('\n❌ FALTAN TELÉFONOS:');
      faltanTelefonos.slice(0, 10).forEach(email => console.log(`   - ${email}`));
      if (faltanTelefonos.length > 10) {
        console.log(`   ... y ${faltanTelefonos.length - 10} más`);
      }
    }

    console.log('\n' + '='.repeat(70));

    // Contar en toda la colección
    console.log('\n📈 CONTEO TOTAL EN FIRESTORE:\n');
    const allSnap = await sociosRef.get();
    
    let totalConCredencial = 0;
    let totalConTelefono = 0;
    let listaSinCredencial = [];
    let listaSinTelefono = [];

    for (const doc of allSnap.docs) {
      const data = doc.data();
      if (data.credencial || data.numero_socio) totalConCredencial++;
      if (data.telefono) totalConTelefono++;
      
      if (!data.credencial && !data.numero_socio) {
        listaSinCredencial.push(doc.id);
      }
      if (!data.telefono) {
        listaSinTelefono.push(doc.id);
      }
    }

    console.log(`Total socios: ${allSnap.size}`);
    console.log(`Socios CON credencial: ${totalConCredencial} (${((totalConCredencial/allSnap.size)*100).toFixed(1)}%) ✅`);
    console.log(`Socios CON teléfono: ${totalConTelefono} (${((totalConTelefono/allSnap.size)*100).toFixed(1)}%) ✅`);
    console.log('');
    console.log(`Socios SIN credencial: ${listaSinCredencial.length} (${((listaSinCredencial.length/allSnap.size)*100).toFixed(1)}%) ❌`);
    console.log(`Socios SIN teléfono: ${listaSinTelefono.length} (${((listaSinTelefono.length/allSnap.size)*100).toFixed(1)}%) ❌`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Diagnóstico completado\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

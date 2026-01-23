#!/usr/bin/env node

/**
 * auditoria-correcta.js
 * Auditoría CORRECTA: Excel tiene 293 ARMAS de 77 socios
 * Firebase tiene 77 socios con 285 armas
 */

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initFirebase() {
  const serviceAccountKeyPath = path.join(__dirname, '../../scripts/serviceAccountKey.json');
  const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
    });
  }
  
  return admin.firestore();
}

async function main() {
  console.log('\n🔍 AUDITORÍA CORRECTA: FUENTE DE VERDAD vs Firebase\n');
  console.log('='.repeat(90));

  try {
    // Leer FUENTE DE VERDAD
    const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datosArmasExcel = XLSX.utils.sheet_to_json(worksheet);

    console.log('\n📊 EXCEL (FUENTE DE VERDAD):\n');
    console.log(`Total de ARMAS: ${datosArmasExcel.length}`);

    // Agrupar por socio
    const socioPorEmail = {};
    datosArmasExcel.forEach(fila => {
      const email = (fila.EMAIL || '').toLowerCase().trim();
      const credencial = fila['No. CREDENCIAL'];
      const nombre = fila['NOMBRE SOCIO'];
      const telefono = fila.TELEFONO;

      if (!email) return;

      if (!socioPorEmail[email]) {
        socioPorEmail[email] = {
          credencial,
          nombre,
          telefono: telefono ? String(telefono).trim() : null,
          armas: 0,
        };
      }
      socioPorEmail[email].armas++;
    });

    console.log(`Total de SOCIOS únicos: ${Object.keys(socioPorEmail).length}`);

    // Estadísticas de Excel
    const excelStats = {
      socios: Object.keys(socioPorEmail).length,
      conCredencial: 0,
      conTelefono: 0,
      sinTelefono: [],
      armasPorSocio: [],
    };

    Object.entries(socioPorEmail).forEach(([email, datos]) => {
      if (datos.credencial) excelStats.conCredencial++;
      if (datos.telefono) excelStats.conTelefono++;
      if (!datos.telefono) excelStats.sinTelefono.push(email);
      excelStats.armasPorSocio.push(datos.armas);
    });

    console.log(`  ✅ Con Credencial: ${excelStats.conCredencial}/${excelStats.socios} (${((excelStats.conCredencial/excelStats.socios)*100).toFixed(1)}%)`);
    console.log(`  ✅ Con Teléfono: ${excelStats.conTelefono}/${excelStats.socios} (${((excelStats.conTelefono/excelStats.socios)*100).toFixed(1)}%)`);
    console.log(`  ❌ Sin Teléfono: ${excelStats.sinTelefono.length}`);

    if (excelStats.sinTelefono.length > 0) {
      console.log(`\n  Socios sin teléfono en Excel:`);
      excelStats.sinTelefono.forEach(email => {
        const s = socioPorEmail[email];
        console.log(`    • ${email} - ${s.nombre} (${s.armas} armas)`);
      });
    }

    // Comparar con Firebase
    console.log('\n' + '='.repeat(90));
    console.log('\n🔥 FIREBASE:\n');

    const db = initFirebase();
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    console.log(`Total de SOCIOS: ${snapshot.size}`);

    const fbStats = {
      socios: snapshot.size,
      conCredencial: 0,
      conTelefono: 0,
      sinCredencial: [],
      sinTelefono: [],
      armas: 0,
      sinArmas: [],
    };

    const sociosFB = {};

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;
      const credencial = socio.credencial || socio.numero_socio;
      const telefono = socio.telefono;

      if (credencial) fbStats.conCredencial++;
      if (telefono) fbStats.conTelefono++;
      if (!credencial) fbStats.sinCredencial.push(email);
      if (!telefono) fbStats.sinTelefono.push(email);

      // Contar armas
      const armasRef = db.collection('socios').doc(email).collection('armas');
      const armasSnap = await armasRef.get();
      
      fbStats.armas += armasSnap.size;
      if (armasSnap.size === 0) {
        fbStats.sinArmas.push(email);
      }

      sociosFB[email] = {
        credencial,
        nombre: socio.nombre,
        telefono,
        armasCount: armasSnap.size,
      };
    }

    console.log(`Total de ARMAS: ${fbStats.armas}`);
    console.log(`  ✅ Con Credencial: ${fbStats.conCredencial}/${fbStats.socios} (${((fbStats.conCredencial/fbStats.socios)*100).toFixed(1)}%)`);
    console.log(`  ✅ Con Teléfono: ${fbStats.conTelefono}/${fbStats.socios} (${((fbStats.conTelefono/fbStats.socios)*100).toFixed(1)}%)`);
    console.log(`  ❌ Sin Credencial: ${fbStats.sinCredencial.length}`);
    console.log(`  ❌ Sin Teléfono: ${fbStats.sinTelefono.length}`);
    console.log(`  ❌ Sin Armas: ${fbStats.sinArmas.length}`);

    if (fbStats.sinCredencial.length > 0) {
      console.log(`\n  Socios sin credencial en Firebase:`);
      fbStats.sinCredencial.slice(0, 10).forEach(email => {
        console.log(`    • ${email}`);
      });
      if (fbStats.sinCredencial.length > 10) {
        console.log(`    ... y ${fbStats.sinCredencial.length - 10} más`);
      }
    }

    if (fbStats.sinTelefono.length > 0) {
      console.log(`\n  Socios sin teléfono en Firebase:`);
      fbStats.sinTelefono.forEach(email => {
        console.log(`    • ${email}`);
      });
    }

    // Resumen comparativo
    console.log('\n' + '='.repeat(90));
    console.log('\n📊 RESUMEN COMPARATIVO:\n');

    console.log('ESTRUCTURA:');
    console.log(`  Excel:     ${excelStats.armasPorSocio.reduce((a,b)=>a+b,0)} armas / ${excelStats.socios} socios`);
    console.log(`  Firebase:  ${fbStats.armas} armas / ${fbStats.socios} socios`);
    console.log(`  Diferencia: ${excelStats.armasPorSocio.reduce((a,b)=>a+b,0) - fbStats.armas} armas`);

    console.log('\nDATA ACCESORIOS:');
    console.log(`  Credencial - Excel: ${excelStats.conCredencial}/${excelStats.socios} | Firebase: ${fbStats.conCredencial}/${fbStats.socios}`);
    console.log(`  Teléfono   - Excel: ${excelStats.conTelefono}/${excelStats.socios} | Firebase: ${fbStats.conTelefono}/${fbStats.socios}`);

    // Diagnóstico
    console.log('\n' + '='.repeat(90));
    console.log('\n⚠️  DIAGNÓSTICO:\n');

    const problemas = [];
    
    if (fbStats.conCredencial < fbStats.socios) {
      problemas.push(`${fbStats.socios - fbStats.conCredencial} socios sin credencial en Firebase`);
    }
    if (fbStats.conTelefono < fbStats.socios) {
      problemas.push(`${fbStats.socios - fbStats.conTelefono} socios sin teléfono en Firebase`);
    }
    if (fbStats.armas < excelStats.armasPorSocio.reduce((a,b)=>a+b,0)) {
      problemas.push(`Firebase tiene ${excelStats.armasPorSocio.reduce((a,b)=>a+b,0) - fbStats.armas} armas menos que Excel`);
    }
    if (fbStats.sinArmas.length > 0) {
      problemas.push(`${fbStats.sinArmas.length} socios sin armas en Firebase`);
    }

    if (problemas.length === 0) {
      console.log('✅ DATOS COINCIDEN PERFECTAMENTE');
    } else {
      console.log('❌ PROBLEMAS ENCONTRADOS:\n');
      problemas.forEach((p, i) => console.log(`${i + 1}. ${p}`));
    }

    console.log('\n' + '='.repeat(90) + '\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

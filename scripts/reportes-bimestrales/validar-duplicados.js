#!/usr/bin/env node

/**
 * validar-duplicados.js
 * Busca emails y teléfonos duplicados en Excel y Firebase
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
  console.log('\n🔍 VALIDACIÓN DE DUPLICADOS: Emails y Teléfonos\n');
  console.log('='.repeat(90));

  try {
    // Leer Excel
    const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datosExcel = XLSX.utils.sheet_to_json(worksheet);

    console.log('\n📊 EXCEL (FUENTE DE VERDAD):\n');

    // Consolidar por email
    const socioPorEmail = {};
    datosExcel.forEach(fila => {
      const email = (fila.EMAIL || '').toLowerCase().trim();
      const telefono = fila.TELEFONO ? String(fila.TELEFONO).trim() : null;
      const nombre = fila['NOMBRE SOCIO'];

      if (!email) return;
      
      if (!socioPorEmail[email]) {
        socioPorEmail[email] = {
          nombre,
          telefonos: new Set(),
          count: 0
        };
      }
      if (telefono) {
        socioPorEmail[email].telefonos.add(telefono);
      }
      socioPorEmail[email].count++;
    });

    // Buscar teléfonos duplicados (mismo teléfono en múltiples socios)
    const telefonosPorSocio = {};
    Object.entries(socioPorEmail).forEach(([email, datos]) => {
      datos.telefonos.forEach(tel => {
        if (!telefonosPorSocio[tel]) {
          telefonosPorSocio[tel] = [];
        }
        telefonosPorSocio[tel].push(email);
      });
    });

    const telsRepetidosExcel = Object.entries(telefonosPorSocio)
      .filter(([tel, emails]) => emails.length > 1)
      .reduce((acc, [tel, emails]) => { acc[tel] = emails; return acc; }, {});

    if (Object.keys(telsRepetidosExcel).length > 0) {
      console.log('❌ TELÉFONOS DUPLICADOS EN EXCEL:');
      Object.entries(telsRepetidosExcel).forEach(([tel, emails]) => {
        console.log(`\n   ${tel}:`);
        emails.forEach(email => {
          console.log(`      • ${email}`);
        });
      });
    } else {
      console.log('✅ No hay teléfonos duplicados en Excel');
    }

    // Buscar emails duplicados (no debería haber)
    const emailsRepetidosExcel = Object.keys(socioPorEmail).filter(
      email => Object.keys(socioPorEmail).filter(e => e === email).length > 1
    );
    if (emailsRepetidosExcel.length === 0) {
      console.log('✅ No hay emails duplicados en Excel');
    }

    // Firebase
    console.log('\n' + '='.repeat(90));
    console.log('\n🔥 FIREBASE:\n');

    const db = initFirebase();
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    const sociosFB = {};
    const telefonosPorSocioFB = {};

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;
      const telefono = socio.telefono ? String(socio.telefono).trim() : null;

      sociosFB[email] = {
        nombre: socio.nombre,
        credencial: socio.credencial,
        telefono
      };

      if (telefono) {
        if (!telefonosPorSocioFB[telefono]) {
          telefonosPorSocioFB[telefono] = [];
        }
        telefonosPorSocioFB[telefono].push(email);
      }
    }

    const telsRepetidosFB = Object.entries(telefonosPorSocioFB)
      .filter(([tel, emails]) => emails.length > 1)
      .reduce((acc, [tel, emails]) => { acc[tel] = emails; return acc; }, {});

    if (Object.keys(telsRepetidosFB).length > 0) {
      console.log('❌ TELÉFONOS DUPLICADOS EN FIREBASE:');
      Object.entries(telsRepetidosFB).forEach(([tel, emails]) => {
        console.log(`\n   ${tel}:`);
        emails.forEach(email => {
          const s = sociosFB[email];
          console.log(`      • ${email} (${s.nombre})`);
        });
      });
    } else {
      console.log('✅ No hay teléfonos duplicados en Firebase');
    }

    // Resumen de socios sin teléfono
    console.log('\n' + '='.repeat(90));
    console.log('\n⚠️  SOCIOS SIN TELÉFONO:\n');

    const sinTelExcel = Object.entries(socioPorEmail)
      .filter(([_, datos]) => datos.telefonos.size === 0)
      .map(([email, datos]) => ({ email, nombre: datos.nombre }));

    const sinTelFB = Object.entries(sociosFB)
      .filter(([_, datos]) => !datos.telefono);

    console.log(`Excel: ${sinTelExcel.length} socios`);
    sinTelExcel.forEach(s => {
      console.log(`   • ${s.email} - ${s.nombre}`);
    });

    console.log(`\nFirebase: ${sinTelFB.length} socios`);
    sinTelFB.forEach(([email, datos]) => {
      console.log(`   • ${email} - ${datos.nombre}`);
    });

    // Verificar correspondencia
    console.log('\n' + '='.repeat(90));
    console.log('\n✅ RESUMEN:\n');
    console.log(`Total socios: ${Object.keys(sociosFB).length}`);
    console.log(`Con teléfono Excel: ${Object.values(socioPorEmail).filter(s => s.telefonos.size > 0).length}/77`);
    console.log(`Con teléfono Firebase: ${Object.values(sociosFB).filter(s => s.telefono).length}/77`);

    console.log('\n' + '='.repeat(90) + '\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

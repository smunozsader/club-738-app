#!/usr/bin/env node

/**
 * sincronizar-credenciales.js
 * Sincroniza credencial y teléfono desde Excel a Firestore
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
  console.log('\n🔄 SINCRONIZACIÓN: Excel → Firebase (Credenciales)\n');

  try {
    const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datosExcel = XLSX.utils.sheet_to_json(worksheet);

    const db = initFirebase();

    let actualizados = 0;
    let sinEncontrar = 0;
    let errores = 0;

    console.log(`📊 Procesando ${datosExcel.length} registros de Excel...\n`);

    // Agrupar por EMAIL para consolidar filas duplicadas
    const socioPorEmail = {};

    datosExcel.forEach(fila => {
      const email = (fila.EMAIL || '').toLowerCase().trim();
      const credencial = fila['NO. CREDENCIAL'];
      const nombre = fila['NOMBRE SOCIO'];
      const telefono = (fila.TELEFONO || '').trim();

      if (!email) return; // Saltar sin email

      if (!socioPorEmail[email]) {
        socioPorEmail[email] = {
          credencial,
          nombre,
          telefono: telefono || null,
        };
      } else {
        // Si hay duplicados, actualizar con teléfono si existe
        if (telefono && !socioPorEmail[email].telefono) {
          socioPorEmail[email].telefono = telefono;
        }
      }
    });

    console.log(`🔍 Encontrados ${Object.keys(socioPorEmail).length} socios únicos en Excel\n`);
    console.log('Sincronizando datos...\n');

    // Sincronizar cada socio
    for (const [email, datosExcel] of Object.entries(socioPorEmail)) {
      try {
        const docRef = db.collection('socios').doc(email);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const datosActuales = docSnap.data();

          // Solo actualizar si está vacío en Firestore
          const actualizacion = {};
          
          if (!datosActuales.credencial && datosExcel.credencial) {
            actualizacion.credencial = datosExcel.credencial;
          }
          
          if (!datosActuales.telefono && datosExcel.telefono) {
            actualizacion.telefono = datosExcel.telefono;
          }

          if (Object.keys(actualizacion).length > 0) {
            await docRef.update(actualizacion);
            actualizados++;
            console.log(`✅ ${email.padEnd(40)} | Credencial: ${datosExcel.credencial} | Teléfono: ${datosExcel.telefono || 'N/A'}`);
          }
        } else {
          sinEncontrar++;
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error actualizando ${email}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(90));
    console.log(`\n✅ Sincronización completada:`);
    console.log(`   • Actualizados: ${actualizados}`);
    console.log(`   • No encontrados en Firebase: ${sinEncontrar}`);
    console.log(`   • Errores: ${errores}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

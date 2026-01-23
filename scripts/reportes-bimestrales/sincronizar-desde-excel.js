#!/usr/bin/env node

/**
 * sincronizar-desde-excel.js
 * Sincroniza credenciales y teléfono desde Excel a Firebase
 * Solo actualiza campos vacíos - no sobrescribe datos existentes
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
  console.log('\n🔄 SINCRONIZACIÓN: Excel → Firebase (Credenciales + Teléfono)\n');
  console.log('='.repeat(90) + '\n');

  try {
    // Leer Excel
    const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datosExcel = XLSX.utils.sheet_to_json(worksheet);

    // Agrupar por email (usar último registro de cada socio)
    const socioPorEmail = {};
    datosExcel.forEach(fila => {
      const email = (fila.EMAIL || '').toLowerCase().trim();
      if (!email) return;
      
      // Usar el último registro (que probablemente tenga más datos completos)
      socioPorEmail[email] = {
        credencial: fila['No. CREDENCIAL'],
        nombre: fila['NOMBRE SOCIO'],
        telefono: fila.TELEFONO ? String(fila.TELEFONO).trim() : null,
      };
    });

    console.log(`📊 Datos desde Excel: ${Object.keys(socioPorEmail).length} socios`);
    console.log(`   • Con Credencial: ${Object.values(socioPorEmail).filter(s => s.credencial).length}`);
    console.log(`   • Con Teléfono: ${Object.values(socioPorEmail).filter(s => s.telefono).length}\n`);

    // Sincronizar
    const db = initFirebase();
    let actualizados = 0;
    let sinEncontrar = 0;
    let yaTeIa = 0;
    let errores = 0;

    console.log('Sincronizando...\n');

    for (const [email, datosExcel] of Object.entries(socioPorEmail)) {
      try {
        const docRef = db.collection('socios').doc(email);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          sinEncontrar++;
          continue;
        }

        const docActual = docSnap.data();
        const actualizacion = {};

        // Actualizar credencial si está vacía
        if (!docActual.credencial && datosExcel.credencial) {
          actualizacion.credencial = datosExcel.credencial;
        }

        // Actualizar teléfono si está vacío
        if (!docActual.telefono && datosExcel.telefono) {
          actualizacion.telefono = datosExcel.telefono;
        }

        if (Object.keys(actualizacion).length > 0) {
          await docRef.update(actualizacion);
          actualizados++;
          console.log(`✅ ${email.padEnd(40)} | Cred: ${datosExcel.credencial || 'N/A'} | Tel: ${datosExcel.telefono || 'N/A'}`);
        } else {
          yaTeIa++;
        }

      } catch (error) {
        errores++;
        console.error(`❌ ${email}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(90));
    console.log(`\n✅ SINCRONIZACIÓN COMPLETADA:\n`);
    console.log(`   ✅ Actualizados: ${actualizados}`);
    console.log(`   ℹ️  Ya tenían datos: ${yaTeIa}`);
    console.log(`   ⚠️  No encontrados en Firebase: ${sinEncontrar}`);
    console.log(`   ❌ Errores: ${errores}\n`);
    console.log('='.repeat(90) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

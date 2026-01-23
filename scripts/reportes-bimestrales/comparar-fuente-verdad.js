#!/usr/bin/env node

/**
 * comparar-fuente-verdad.js
 * Compara Firestore con la FUENTE DE VERDAD (Excel maestro)
 */

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
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
  console.log('\n📊 COMPARACIÓN: Firestore vs FUENTE DE VERDAD\n');
  console.log('='.repeat(80));

  try {
    // Leer FUENTE DE VERDAD
    const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error('❌ No encontrado: FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datosExcel = XLSX.utils.sheet_to_json(worksheet);

    console.log(`\n📋 FUENTE DE VERDAD: ${path.basename(excelPath)}`);
    console.log(`Total socios en Excel: ${datosExcel.length}\n`);

    // Analizar estructura del Excel
    if (datosExcel.length > 0) {
      const primerSocio = datosExcel[0];
      console.log('Columnas encontradas:');
      Object.keys(primerSocio).forEach((col, idx) => {
        console.log(`  ${(idx + 1).toString().padStart(2, '0')}. ${col}`);
      });
      console.log('');
    }

    // Contar campos en Excel
    let conCredencial = 0;
    let conTelefono = 0;
    let ejemplosSinCredencial = [];
    let ejemplosSinTelefono = [];

    datosExcel.forEach((socio, idx) => {
      const credencial = socio['Credencial'] || socio['credencial'] || socio['CREDENCIAL'] || socio['Número'];
      const telefono = socio['Teléfono'] || socio['telefono'] || socio['TELÉFONO'] || socio['Telefono'];

      if (credencial && credencial.toString().trim()) conCredencial++;
      if (telefono && telefono.toString().trim()) conTelefono++;

      if (!credencial || !credencial.toString().trim()) {
        ejemplosSinCredencial.push(idx);
      }
      if (!telefono || !telefono.toString().trim()) {
        ejemplosSinTelefono.push(idx);
      }
    });

    console.log('📈 ANÁLISIS DEL EXCEL:\n');
    console.log(`Socios con Credencial: ${conCredencial}/${datosExcel.length}`);
    console.log(`Socios con Teléfono: ${conTelefono}/${datosExcel.length}`);
    
    if (ejemplosSinCredencial.length > 0) {
      console.log(`\n❌ SIN CREDENCIAL (${ejemplosSinCredencial.length}):`);
      ejemplosSinCredencial.slice(0, 5).forEach(idx => {
        const row = datosExcel[idx];
        console.log(`   Fila ${idx + 2}: ${row.Nombre || row.nombre || 'N/A'}`);
      });
      if (ejemplosSinCredencial.length > 5) {
        console.log(`   ... y ${ejemplosSinCredencial.length - 5} más`);
      }
    }

    if (ejemplosSinTelefono.length > 0) {
      console.log(`\n❌ SIN TELÉFONO (${ejemplosSinTelefono.length}):`);
      ejemplosSinTelefono.slice(0, 5).forEach(idx => {
        const row = datosExcel[idx];
        console.log(`   Fila ${idx + 2}: ${row.Nombre || row.nombre || 'N/A'}`);
      });
      if (ejemplosSinTelefono.length > 5) {
        console.log(`   ... y ${ejemplosSinTelefono.length - 5} más`);
      }
    }

    // Analizar primeros 5 socios
    console.log('\n' + '='.repeat(80));
    console.log('\n📌 PRIMEROS 5 SOCIOS DEL EXCEL:\n');
    
    datosExcel.slice(0, 5).forEach((socio, idx) => {
      console.log(`${idx + 1}. ${socio.Nombre || socio.nombre || 'N/A'}`);
      Object.entries(socio).forEach(([col, val]) => {
        if (col !== 'Nombre' && col !== 'nombre') {
          console.log(`   ${col}: ${val || 'VACÍO'}`);
        }
      });
      console.log('');
    });

    console.log('='.repeat(80));

    // Obtener datos de Firestore
    console.log('\n🔥 DATOS EN FIRESTORE:\n');
    const db = initFirebase();
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.limit(5).get();

    let fbConCredencial = 0;
    let fbConTelefono = 0;

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;
      
      console.log(`${email}`);
      console.log(`  Nombre: ${socio.nombre || 'N/A'}`);
      console.log(`  Credencial: ${socio.credencial || socio.numero_socio || 'FALTA ❌'}`);
      console.log(`  Teléfono: ${socio.telefono || 'FALTA ❌'}`);

      if (socio.credencial || socio.numero_socio) fbConCredencial++;
      if (socio.telefono) fbConTelefono++;
      console.log('');
    }

    // Resumen
    console.log('='.repeat(80));
    console.log('\n🆚 COMPARACIÓN RÁPIDA:\n');
    console.log(`EXCEL:`)
    console.log(`  ✅ Socios con Credencial: ${conCredencial}/${datosExcel.length}`);
    console.log(`  ✅ Socios con Teléfono: ${conTelefono}/${datosExcel.length}`);
    console.log(`\nFIREBASE (primeros 5):`);
    console.log(`  ${fbConCredencial > 0 ? '✅' : '❌'} Socios con Credencial: ${fbConCredencial}/5`);
    console.log(`  ${fbConTelefono > 0 ? '✅' : '❌'} Socios con Teléfono: ${fbConTelefono}/5`);

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 RECOMENDACIÓN:\n');
    
    if (conCredencial === datosExcel.length && conTelefono === datosExcel.length) {
      console.log('El Excel FUENTE DE VERDAD tiene TODOS los datos.');
      console.log('Necesitamos sincronizar Firestore desde este archivo.\n');
    } else {
      console.log('⚠️  El Excel FUENTE DE VERDAD también tiene datos incompletos.');
      console.log('Revisar primero el archivo Excel.\n');
    }

    console.log('='.repeat(80) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

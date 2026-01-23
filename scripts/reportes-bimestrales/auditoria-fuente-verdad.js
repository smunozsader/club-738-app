#!/usr/bin/env node

/**
 * auditoria-fuente-verdad.js
 * Auditoría completa: FUENTE DE VERDAD vs Firestore (Socios + Armas)
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
  console.log('\n🔍 AUDITORÍA COMPLETA: FUENTE DE VERDAD vs Firestore\n');
  console.log('='.repeat(90));

  try {
    // Leer FUENTE DE VERDAD
    const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error('❌ No encontrado: FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
      process.exit(1);
    }

    console.log('📊 PASO 1: Analizando FUENTE DE VERDAD (Excel)\n');

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datosExcel = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Hoja: "${sheetName}"`);
    console.log(`Total filas: ${datosExcel.length}\n`);

    // Analizar estructura
    if (datosExcel.length > 0) {
      const primerSocio = datosExcel[0];
      console.log('Columnas en Excel:');
      const columnas = Object.keys(primerSocio);
      columnas.forEach((col, idx) => {
        console.log(`  ${(idx + 1).toString().padStart(2, '0')}. ${col}`);
      });
    }

    // Normalizar nombres de columnas
    const normalizarColumna = (obj, posibilidades) => {
      for (const key of posibilidades) {
        for (const objKey in obj) {
          if (objKey.toLowerCase().includes(key.toLowerCase())) {
            return obj[objKey];
          }
        }
      }
      return null;
    };

    console.log('\n' + '='.repeat(90));
    console.log('\n📈 PASO 2: Validando datos en Excel\n');

    // Analizar integridad de Excel
    const estadisticas = {
      total: datosExcel.length,
      conCredencial: 0,
      conTelefono: 0,
      conEmail: 0,
      conArmas: 0,
      sinCredencial: [],
      sinTelefono: [],
      sinEmail: [],
    };

    const socioseExcel = {};

    datosExcel.forEach((fila, idx) => {
      const credencial = normalizarColumna(fila, ['credencial', 'número socio', 'numero', 'id socio']);
      const nombre = normalizarColumna(fila, ['nombre', 'socio']) || 'N/A';
      const telefono = normalizarColumna(fila, ['telefono', 'teléfono', 'phone']);
      const email = normalizarColumna(fila, ['email', 'e-mail', 'mail']);
      const armas = normalizarColumna(fila, ['armas', 'rifles', 'escopetas', 'pistolas']);

      if (credencial) estadisticas.conCredencial++;
      if (telefono) estadisticas.conTelefono++;
      if (email) estadisticas.conEmail++;
      if (armas) estadisticas.conArmas++;

      if (!credencial) estadisticas.sinCredencial.push(`Fila ${idx + 2}: ${nombre}`);
      if (!telefono) estadisticas.sinTelefono.push(`Fila ${idx + 2}: ${nombre}`);
      if (!email) estadisticas.sinEmail.push(`Fila ${idx + 2}: ${nombre}`);

      const key = String(credencial || email || nombre).toLowerCase();
      socioseExcel[key] = {
        credencial,
        nombre,
        telefono,
        email,
        armas,
        row: idx + 2,
      };
    });

    console.log(`✅ Socios con Credencial: ${estadisticas.conCredencial}/${estadisticas.total}`);
    console.log(`✅ Socios con Teléfono: ${estadisticas.conTelefono}/${estadisticas.total}`);
    console.log(`✅ Socios con Email: ${estadisticas.conEmail}/${estadisticas.total}`);
    console.log(`✅ Socios con datos de Armas: ${estadisticas.conArmas}/${estadisticas.total}`);

    if (estadisticas.sinCredencial.length > 0) {
      console.log(`\n❌ SIN CREDENCIAL (${estadisticas.sinCredencial.length}):`);
      estadisticas.sinCredencial.slice(0, 5).forEach(s => console.log(`   ${s}`));
      if (estadisticas.sinCredencial.length > 5) {
        console.log(`   ... y ${estadisticas.sinCredencial.length - 5} más`);
      }
    }

    if (estadisticas.sinTelefono.length > 0) {
      console.log(`\n❌ SIN TELÉFONO (${estadisticas.sinTelefono.length}):`);
      estadisticas.sinTelefono.slice(0, 5).forEach(s => console.log(`   ${s}`));
      if (estadisticas.sinTelefono.length > 5) {
        console.log(`   ... y ${estadisticas.sinTelefono.length - 5} más`);
      }
    }

    // Comparar con Firestore
    console.log('\n' + '='.repeat(90));
    console.log('\n🔥 PASO 3: Analizando datos en Firestore\n');

    const db = initFirebase();
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    console.log(`Total socios en Firestore: ${snapshot.size}\n`);

    let comparacion = {
      totalFirebase: snapshot.size,
      conCredencial: 0,
      conTelefono: 0,
      conArmas: 0,
      sinCredencial: [],
      sinTelefono: [],
      conArmasCount: 0,
      sinArmasCount: 0,
    };

    const sociosFB = {};

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;

      const credencial = socio.credencial || socio.numero_socio;
      const telefono = socio.telefono;

      if (credencial) comparacion.conCredencial++;
      if (telefono) comparacion.conTelefono++;

      if (!credencial) comparacion.sinCredencial.push(email);
      if (!telefono) comparacion.sinTelefono.push(email);

      // Contar armas
      const armasRef = db.collection('socios').doc(email).collection('armas');
      const armasSnap = await armasRef.get();
      
      if (armasSnap.size > 0) {
        comparacion.conArmasCount++;
        comparacion.conArmas += armasSnap.size;
      } else {
        comparacion.sinArmasCount++;
      }

      const key = String(credencial || email).toLowerCase();
      sociosFB[key] = {
        email,
        credencial,
        nombre: socio.nombre,
        telefono,
        armasCount: armasSnap.size,
      };
    }

    console.log(`✅ Socios con Credencial: ${comparacion.conCredencial}/${comparacion.totalFirebase}`);
    console.log(`✅ Socios con Teléfono: ${comparacion.conTelefono}/${comparacion.totalFirebase}`);
    console.log(`✅ Socios CON Armas: ${comparacion.conArmasCount}/${comparacion.totalFirebase}`);
    console.log(`❌ Socios SIN Armas: ${comparacion.sinArmasCount}/${comparacion.totalFirebase}`);
    console.log(`Total Armas en Firebase: ${comparacion.conArmas}`);

    if (comparacion.sinCredencial.length > 0) {
      console.log(`\n❌ SIN CREDENCIAL EN FIREBASE (${comparacion.sinCredencial.length}):`);
      comparacion.sinCredencial.slice(0, 5).forEach(e => console.log(`   ${e}`));
    }

    if (comparacion.sinTelefono.length > 0) {
      console.log(`\n❌ SIN TELÉFONO EN FIREBASE (${comparacion.sinTelefono.length}):`);
      comparacion.sinTelefono.slice(0, 5).forEach(e => console.log(`   ${e}`));
    }

    // Resumen comparativo
    console.log('\n' + '='.repeat(90));
    console.log('\n🆚 PASO 4: Resumen Comparativo\n');

    console.log('EXCEL (FUENTE DE VERDAD):');
    console.log(`  • Total Socios: ${estadisticas.total}`);
    console.log(`  • Con Credencial: ${estadisticas.conCredencial} (${((estadisticas.conCredencial/estadisticas.total)*100).toFixed(1)}%)`);
    console.log(`  • Con Teléfono: ${estadisticas.conTelefono} (${((estadisticas.conTelefono/estadisticas.total)*100).toFixed(1)}%)`);
    console.log(`  • Con Email: ${estadisticas.conEmail} (${((estadisticas.conEmail/estadisticas.total)*100).toFixed(1)}%)`);

    console.log('\nFIREBASE:');
    console.log(`  • Total Socios: ${comparacion.totalFirebase}`);
    console.log(`  • Con Credencial: ${comparacion.conCredencial} (${((comparacion.conCredencial/comparacion.totalFirebase)*100).toFixed(1)}%)`);
    console.log(`  • Con Teléfono: ${comparacion.conTelefono} (${((comparacion.conTelefono/comparacion.totalFirebase)*100).toFixed(1)}%)`);
    console.log(`  • Con Armas: ${comparacion.conArmasCount} (${((comparacion.conArmasCount/comparacion.totalFirebase)*100).toFixed(1)}%)`);
    console.log(`  • Total Armas: ${comparacion.conArmas}`);

    // Diagnóstico final
    console.log('\n' + '='.repeat(90));
    console.log('\n⚠️  DIAGNÓSTICO:\n');

    const problemas = [];

    if (estadisticas.conCredencial < estadisticas.total) {
      problemas.push(`Excel: ${estadisticas.total - estadisticas.conCredencial} socios sin credencial`);
    }
    if (estadisticas.conTelefono < estadisticas.total) {
      problemas.push(`Excel: ${estadisticas.total - estadisticas.conTelefono} socios sin teléfono`);
    }
    if (comparacion.conCredencial < comparacion.totalFirebase) {
      problemas.push(`Firebase: ${comparacion.totalFirebase - comparacion.conCredencial} socios sin credencial`);
    }
    if (comparacion.conTelefono < comparacion.totalFirebase) {
      problemas.push(`Firebase: ${comparacion.totalFirebase - comparacion.conTelefono} socios sin teléfono`);
    }
    if (comparacion.sinArmasCount > 0) {
      problemas.push(`Firebase: ${comparacion.sinArmasCount} socios sin armas registradas`);
    }

    if (problemas.length === 0) {
      console.log('✅ TODAS LAS VALIDACIONES PASARON');
    } else {
      console.log('❌ PROBLEMAS ENCONTRADOS:\n');
      problemas.forEach((p, i) => {
        console.log(`${i + 1}. ${p}`);
      });
    }

    console.log('\n' + '='.repeat(90) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

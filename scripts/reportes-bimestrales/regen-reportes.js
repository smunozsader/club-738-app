#!/usr/bin/env node

/**
 * regen-reportes.js
 * Script simple para regenerar reportes RELACIÓN y ANEXO A
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar generadores
import generarRelacion from './generadores/relacion.js';
import generarAnexoA from './generadores/anexoA.js';

const mes = 2;
const año = 2026;
const outputDir = path.join(__dirname, '../../data/reportes-bimestrales', año.toString(), mes.toString().padStart(2, '0'));

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
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function main() {
  const db = initFirebase();

  try {
    console.log('⏳ Regenerando RELACIÓN...');
    const wb1 = await generarRelacion(db, mes, año);
    const f1 = path.join(outputDir, `RELACION_${año}_${mes.toString().padStart(2, '0')}.xlsx`);
    XLSX.writeFile(wb1, f1);
    console.log(`✅ RELACIÓN actualizada`);

    console.log('⏳ Regenerando ANEXO A...');
    const wb2 = await generarAnexoA(db, mes, año);
    const f2 = path.join(outputDir, `ANEXO_A_${año}_${mes.toString().padStart(2, '0')}.xlsx`);
    XLSX.writeFile(wb2, f2);
    console.log(`✅ ANEXO A actualizado`);

    console.log(`\n✅ Reportes regenerados con credencial, teléfono y ordenamiento ascendente`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

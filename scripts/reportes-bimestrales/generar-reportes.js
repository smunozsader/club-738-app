#!/usr/bin/env node

/**
 * generar-reportes.js
 * Script principal para generar reportes bimestrales SEDENA
 * Uso: node generar-reportes.js --mes 2 --año 2026 --tipo relacion
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
import generarAnexoB from './generadores/anexoB.js';
import generarAnexoC from './generadores/anexoC.js';

// Parsear argumentos
const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i += 2) {
  params[args[i].replace('--', '')] = args[i + 1];
}

const mes = parseInt(params.mes) || new Date().getMonth() + 1;
const año = parseInt(params.año) || new Date().getFullYear();
const tipo = params.tipo || 'relacion'; // relacion, anexoA, anexoB, anexoC, todos
const formato = params.formato || 'xlsx'; // xlsx, pdf

// Validar mes válido para bimestres
const bimestresValidos = [2, 4, 6, 8, 10, 12];
if (!bimestresValidos.includes(mes)) {
  console.error(
    `❌ Mes inválido. Use: ${bimestresValidos.join(', ')}`
  );
  process.exit(1);
}

// Inicializar Firebase Admin
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
    console.error('💡 Asegúrate de que scripts/serviceAccountKey.json exista');
    process.exit(1);
  }
}

async function main() {
  console.log(`\n📊 Generador de Reportes Bimestrales SEDENA`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Mes: ${mes.toString().padStart(2, '0')} | Año: ${año} | Tipo: ${tipo} | Formato: ${formato}`);
  console.log(`${'='.repeat(50)}\n`);

  const db = initFirebase();
  const outputDir = path.join(__dirname, '../../data/reportes-bimestrales', año.toString(), mes.toString().padStart(2, '0'));
  
  // Crear directorio si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    if (tipo === 'relacion' || tipo === 'todos') {
      console.log('⏳ Generando RELACIÓN...');
      const workbook = await generarRelacion(db, mes, año);
      const filename = path.join(outputDir, `RELACION_${año}_${mes.toString().padStart(2, '0')}.xlsx`);
      XLSX.writeFile(workbook, filename);
      console.log(`✅ RELACIÓN guardada: ${filename}`);
    }

    if (tipo === 'anexoA' || tipo === 'todos') {
      console.log('⏳ Generando ANEXO A...');
      const workbook = await generarAnexoA(db, mes, año);
      const filename = path.join(outputDir, `ANEXO_A_${año}_${mes.toString().padStart(2, '0')}.xlsx`);
      XLSX.writeFile(workbook, filename);
      console.log(`✅ ANEXO A guardado: ${filename}`);
    }

    if (tipo === 'anexoB' || tipo === 'todos') {
      console.log('⏳ Generando ANEXO B...');
      const workbook = await generarAnexoB(db, mes, año);
      const filename = path.join(outputDir, `ANEXO_B_${año}_${mes.toString().padStart(2, '0')}.xlsx`);
      XLSX.writeFile(workbook, filename);
      console.log(`✅ ANEXO B guardado: ${filename}`);
    }

    if (tipo === 'anexoC' || tipo === 'todos') {
      console.log('⏳ Generando ANEXO C...');
      const workbook = await generarAnexoC(db, mes, año);
      const filename = path.join(outputDir, `ANEXO_C_${año}_${mes.toString().padStart(2, '0')}.xlsx`);
      XLSX.writeFile(workbook, filename);
      console.log(`✅ ANEXO C guardado: ${filename}`);
    }

    console.log(`\n✅ Reportes generados en: ${outputDir}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante generación:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

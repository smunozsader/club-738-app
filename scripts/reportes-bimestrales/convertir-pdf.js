#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function convertirAuto() {
  const mdPath = '../data/reportes-bimestrales/2026/02/REPORTE_CONTABLE_2026-01-23.md';
  const pdfPath = '../data/reportes-bimestrales/2026/02/REPORTE_CONTABLE_2026-01-23.pdf';
  
  const absoluteMdPath = path.join(__dirname, mdPath);
  const absolutePdfPath = path.join(__dirname, pdfPath);

  try {
    console.log('🔄 Convirtiendo markdown a PDF...\n');
    
    // Verificar si existe md-to-pdf
    try {
      const cmd = `npx md-to-pdf --as-pdf "${absoluteMdPath}" --out="${absolutePdfPath}" --launch-options '{"headless": true}'`;
      const { stdout, stderr } = await execPromise(cmd);
      
      if (stderr && !stderr.includes('npm warn')) {
        console.warn('⚠️ Advertencia:', stderr);
      }
      
      if (fs.existsSync(absolutePdfPath)) {
        console.log('✅ PDF generado en:');
        console.log(`📄 ${absolutePdfPath}\n`);
      } else {
        console.log('❌ Error: PDF no fue creado');
      }
    } catch (cmdError) {
      console.log('ℹ️ md-to-pdf no está disponible. Usando método alternativo...\n');
      console.log('Puedes convertir el markdown a PDF con uno de estos métodos:');
      console.log('1. Copiar el contenido del markdown en Obsidian y exportar a PDF');
      console.log('2. Usar VS Code extension "Markdown PDF"');
      console.log('3. Abrir en navegador y guardar como PDF (Cmd+P → Print → Save as PDF)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

convertirAuto();

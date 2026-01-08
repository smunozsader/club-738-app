#!/usr/bin/env node
/**
 * Importa/actualiza Firestore desde CSV normalizado.
 * 
 * CSV: 2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv
 * 
 * Estructura:
 * - Columna 2: No. CREDENCIAL
 * - Columna 3: NOMBRE DEL SOCIO
 * - Columna 4: CURP
 * - Columna 6-11: CALLE, COLONIA, CIUDAD (2x), MUNICIPIO, ESTADO, CODIGO POSTAL
 * - Columna 13: TELEFONO
 * - Columna 14: EMAIL
 * - Columna 15-22: Datos de arma (CLASE, CALIBRE, MARCA, MODELO, MATRÍCULA, FOLIO)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Leer CSV normalizado
const csvPath = path.join(__dirname, '../data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv');

function parsearCSV(filePath) {
  const contenido = fs.readFileSync(filePath, 'utf-8');
  const lineas = contenido.split('\n').filter(l => l.trim());
  
  // Parsear CSV manualmente (respetando comillas)
  const filas = lineas.map(linea => {
    const valores = [];
    let enComillas = false;
    let valorActual = '';
    
    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      
      if (char === '"') {
        enComillas = !enComillas;
      } else if (char === ',' && !enComillas) {
        valores.push(valorActual.trim());
        valorActual = '';
      } else {
        valorActual += char;
      }
    }
    valores.push(valorActual.trim()); // Último valor
    
    return valores;
  });
  
  return filas;
}

async function importarCSV(modo = 'audit') {
  console.log('📖 Leyendo CSV normalizado...');
  const filas = parsearCSV(csvPath);
  
  // Saltar header
  const header = filas[0];
  const datosFilas = filas.slice(1);
  
  console.log(`📊 Encontradas ${datosFilas.length} filas de armas\n`);
  
  // Agrupar por email
  const sociosPorEmail = {};
  
  for (const fila of datosFilas) {
    const email = fila[14]; // Columna EMAIL (índice 14)
    
    if (!email || email === '') continue;
    
    if (!sociosPorEmail[email]) {
      sociosPorEmail[email] = {
        numeroCredencial: fila[2],   // Columna 2: No. CREDENCIAL
        nombre: fila[3],              // Columna 3: NOMBRE DEL SOCIO
        curp: fila[4],                // Columna 4: CURP
        domicilio: {
          calle: fila[6],             // Columna 6: CALLE
          colonia: fila[7],           // Columna 7: COLONIA
          ciudad: fila[8],            // Columna 8: CIUDAD
          municipio: fila[10],        // Columna 10: MUNICIPIO
          estado: fila[11],           // Columna 11: ESTADO
          cp: fila[12]                // Columna 12: CODIGO POSTAL
        },
        telefono: fila[13],           // Columna 13: TELEFONO
        armas: []
      };
    }
    
    // Agregar arma solo si tiene matrícula (socio con armas registradas)
    const matricula = fila[19];
    
    if (matricula && matricula.trim() !== '') {
      const arma = {
        clase: fila[15],       // CLASE
        calibre: fila[16],     // CALIBRE
        marca: fila[17],       // MARCA
        modelo: fila[18],      // MODELO
        matricula: matricula,  // MATRÍCULA
        folio: fila[20]        // FOLIO
      };
      
      sociosPorEmail[email].armas.push(arma);
    }
  }
  
  const totalSocios = Object.keys(sociosPorEmail).length;
  console.log(`👥 Socios únicos: ${totalSocios}\n`);
  
  if (modo === 'audit') {
    // Modo audit: solo mostrar muestra
    console.log('🔍 MODO AUDIT - Mostrando muestra de 3 socios:\n');
    
    let contador = 0;
    for (const [email, datos] of Object.entries(sociosPorEmail)) {
      if (contador >= 3) break;
      
      console.log(`📧 ${email}`);
      console.log(`   No. Credencial: ${datos.numeroCredencial}`);
      console.log(`   Nombre: ${datos.nombre}`);
      console.log(`   CURP: ${datos.curp}`);
      console.log(`   Teléfono: ${datos.telefono}`);
      console.log(`   Domicilio:`);
      console.log(`     Calle: ${datos.domicilio.calle}`);
      console.log(`     Colonia: ${datos.domicilio.colonia}`);
      console.log(`     Ciudad: ${datos.domicilio.ciudad}`);
      console.log(`     Municipio: ${datos.domicilio.municipio}`);
      console.log(`     Estado: ${datos.domicilio.estado}`);
      console.log(`     CP: ${datos.domicilio.cp}`);
      console.log(`   Armas: ${datos.armas.length}`);
      datos.armas.forEach((arma, idx) => {
        console.log(`     ${idx + 1}. ${arma.clase} ${arma.calibre} ${arma.marca} ${arma.modelo}`);
      });
      console.log('');
      
      contador++;
    }
    
    console.log(`\n💡 Para actualizar Firestore, ejecuta: node ${path.basename(__filename)} fix\n`);
    
  } else if (modo === 'fix') {
    // Modo fix: actualizar Firestore
    console.log('🔄 MODO FIX - Actualizando Firestore...\n');
    
    let sociosActualizados = 0;
    let armasActualizadas = 0;
    
    for (const [email, datos] of Object.entries(sociosPorEmail)) {
      const socioRef = db.collection('socios').doc(email);
      
      try {
        // Actualizar datos del socio
        await socioRef.set({
          numeroCredencial: datos.numeroCredencial,
          nombre: datos.nombre,
          curp: datos.curp,
          domicilio: datos.domicilio,
          telefono: datos.telefono,
          totalArmas: datos.armas.length
        }, { merge: true });
        
        sociosActualizados++;
        
        // Actualizar armas (subcollection) solo si el socio tiene armas
        if (datos.armas.length > 0) {
          const armasRef = socioRef.collection('armas');
          
          for (const arma of datos.armas) {
            // Usar matrícula como ID único
            const armaId = arma.matricula.replace(/[^a-zA-Z0-9]/g, '_');
            
            await armasRef.doc(armaId).set({
              clase: arma.clase,
              calibre: arma.calibre,
              marca: arma.marca,
              modelo: arma.modelo,
              matricula: arma.matricula,
              folio: arma.folio
            }, { merge: true });
            
            armasActualizadas++;
          }
        }
        
        if (sociosActualizados % 10 === 0) {
          console.log(`✓ ${sociosActualizados} socios actualizados...`);
        }
        
      } catch (error) {
        console.error(`❌ Error actualizando ${email}:`, error.message);
      }
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   ✅ Socios actualizados:  ${sociosActualizados}`);
    console.log(`   ✅ Armas actualizadas:   ${armasActualizadas}`);
    console.log(`\n✨ ¡Firestore actualizado con éxito!`);
  }
  
  process.exit(0);
}

// Ejecutar
const modo = process.argv[2] || 'audit';

if (modo !== 'audit' && modo !== 'fix') {
  console.error('❌ Modo inválido. Usa: audit o fix');
  process.exit(1);
}

importarCSV(modo);

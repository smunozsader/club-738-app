#!/usr/bin/env node

/**
 * Normalizar clasificaciones en Firestore
 * Excel: mantiene verbatim de registros
 * Firestore: categorías estándar (RIFLE, PISTOLA, ESCOPETA, REVOLVER, KIT)
 */

import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'scripts', 'serviceAccountKey.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'club-738-app'
  });
} catch (error) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  process.exit(1);
}

const db = admin.firestore();

// Mapa de normalización: variación en Excel → categoría estándar en Firebase
const claseNormalizacionMap = {
  'RIFLE': 'RIFLE',
  'RIFLE SEMI-AUTOMÁTICO': 'RIFLE',
  'RIFLE SEMI-AUTOMATICO': 'RIFLE',
  'RIFLE SEMIAUTOMATICO': 'RIFLE',
  'RIFLE SEMI-AUTOM ÁTICO': 'RIFLE',
  'RIFLE SEMI AUTOMATICO': 'RIFLE',
  'RIFLE DE REPETICIÓN': 'RIFLE',
  'RIFE': 'RIFLE',
  'RIFLE ': 'RIFLE',
  
  'PISTOLA': 'PISTOLA',
  
  'REVOLVER': 'REVOLVER',
  
  'ESCOPETA': 'ESCOPETA',
  'ESCOPETA SEMIAUTOMATICA': 'ESCOPETA',
  'ESCOPETA DOS CAÑONES': 'ESCOPETA',
  'ESCOPETA UN CAÑON CON SISTEMA DE BOMBA': 'ESCOPETA',
  'ESCOPETA RIFLE': 'ESCOPETA',
  
  'KIT DE CONVERSION': 'KIT DE CONVERSION'
};

async function normalizarClasificaciones() {
  console.log('='.repeat(120));
  console.log('🔧 NORMALIZAR CLASIFICACIONES EN FIRESTORE');
  console.log('='.repeat(120));

  let contadorActualizadas = 0;
  let contadorErrores = 0;
  let contadorVacias = 0;

  try {
    // Obtener todos los socios
    const sociosSnapshot = await db.collection('socios').get();

    console.log(`\n📋 Procesando ${sociosSnapshot.docs.length} socios...`);

    for (const socioDoc of sociosSnapshot.docs) {
      const socioEmail = socioDoc.id;
      
      // Obtener todas las armas del socio
      const armasSnapshot = await socioDoc.ref.collection('armas').get();

      for (const armaDoc of armasSnapshot.docs) {
        const armaData = armaDoc.data();
        const claseOriginal = armaData.clase || '0';
        
        // Si es vacía o "0", reportar
        if (!claseOriginal || claseOriginal === '0' || claseOriginal.trim() === '') {
          contadorVacias++;
          console.log(`\n   ⚠️  VACÍA - ${socioEmail}: ${armaData.marca || 'SIN MARCA'} ${armaData.modelo || 'SIN MODELO'}`);
          continue;
        }

        // Buscar normalización
        const claseNormalizada = claseNormalizacionMap[claseOriginal];

        if (claseNormalizada && claseNormalizada !== claseOriginal) {
          // Actualizar en Firestore
          await armaDoc.ref.update({
            clase: claseNormalizada
          });
          
          console.log(`   ✅ ${socioEmail}: "${claseOriginal}" → "${claseNormalizada}"`);
          contadorActualizadas++;
        } else if (!claseNormalizada) {
          console.log(`   ❌ NO MAPEADA - ${socioEmail}: "${claseOriginal}"`);
          contadorErrores++;
        }
      }
    }

    console.log('\n' + '='.repeat(120));
    console.log('📊 RESUMEN');
    console.log('='.repeat(120));
    console.log(`   ✅ Actualizadas: ${contadorActualizadas}`);
    console.log(`   ⚠️  Vacías/sin datos: ${contadorVacias}`);
    console.log(`   ❌ No mapeadas (revisar): ${contadorErrores}`);

    if (contadorErrores > 0) {
      console.log(`\n   ⚠️  Hay ${contadorErrores} clase(s) que no se pudieron mapear`);
    }

    console.log('\n' + '='.repeat(120));
    console.log('✅ NORMALIZACIÓN COMPLETADA');
    console.log('='.repeat(120));
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

normalizarClasificaciones();

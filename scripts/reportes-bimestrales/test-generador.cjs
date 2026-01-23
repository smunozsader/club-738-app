#!/usr/bin/env node

/**
 * test-generador.js
 * Script de prueba para los generadores de reportes
 * Uso: node test-generador.js
 */

const path = require('path');
const admin = require('firebase-admin');
const fs = require('fs');

async function testGenerador() {
  console.log('\n🧪 TEST - Generador de Reportes\n');

  try {
    // Inicializar Firebase
    console.log('1️⃣ Inicializando Firebase Admin SDK...');
    const serviceAccountKey = require(path.join(__dirname, '../../scripts/serviceAccountKey.json'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
      });
    }

    const db = admin.firestore();
    console.log('✅ Firebase Admin SDK inicializado\n');

    // Contar documentos
    console.log('2️⃣ Contando documentos en Firestore...');
    const sociosSnapshot = await db.collection('socios').get();
    console.log(`✅ Total de socios: ${sociosSnapshot.size}\n`);

    // Obtener primer socio
    if (sociosSnapshot.size > 0) {
      console.log('3️⃣ Verificando estructura de datos...');
      const primerSocio = sociosSnapshot.docs[0];
      const email = primerSocio.id;
      const socioData = primerSocio.data();

      console.log(`   Email: ${email}`);
      console.log(`   Nombre: ${socioData.nombre}`);

      // Obtener armas
      const armasSnapshot = await db
        .collection('socios')
        .doc(email)
        .collection('armas')
        .get();

      console.log(`   Armas: ${armasSnapshot.size}`);

      if (armasSnapshot.size > 0) {
        const primerArma = armasSnapshot.docs[0].data();
        console.log(`   - Clase: ${primerArma.clase}`);
        console.log(`   - Calibre: ${primerArma.calibre}`);
        console.log(`   - Marca: ${primerArma.marca}\n`);
      }
    }

    // Verificar que exista el directorio de salida
    console.log('4️⃣ Verificando directorio de salida...');
    const outputDir = path.join(__dirname, '../../data/reportes-bimestrales/2026/02');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Creado: ${outputDir}\n`);
    } else {
      console.log(`✅ Existe: ${outputDir}\n`);
    }

    console.log('✅ PRUEBA COMPLETADA CORRECTAMENTE\n');
    console.log('Ahora puedes ejecutar:');
    console.log('  node scripts/reportes-bimestrales/generar-reportes.js --mes 2 --año 2026 --tipo relacion\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en prueba:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testGenerador();

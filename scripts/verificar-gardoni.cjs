/**
 * Script para verificar datos de Joaquín Rodolfo Gardoni Nuñez
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarGardoni() {
  try {
    console.log('🔍 Buscando datos de Gardoni...\n');

    // Buscar por email exacto
    const emailGardoni = 'jrgardoni@gmail.com';
    
    // 1. Verificar documento del socio
    const socioRef = db.collection('socios').doc(emailGardoni);
    const socioDoc = await socioRef.get();

    if (!socioDoc.exists) {
      console.log('❌ No se encontró el documento del socio');
      return;
    }

    console.log('✅ Documento del socio encontrado');
    const socioData = socioDoc.data();
    console.log('\n📋 Datos básicos:');
    console.log('  Nombre:', socioData.nombre);
    console.log('  CURP:', socioData.curp);
    console.log('  Email:', emailGardoni);

    // 2. Verificar documentos PETA
    console.log('\n📄 Documentos PETA:');
    if (socioData.documentosPETA) {
      const docs = socioData.documentosPETA;
      console.log('  CURP:', docs.curp?.url ? '✅ Subido' : '❌ NO subido');
      console.log('  INE:', docs.ine?.url ? '✅ Subido' : '❌ NO subido');
      console.log('  Constancia:', docs.constanciaAntecedentes?.url ? '✅ Subido' : '❌ NO subido');
      
      // Mostrar todos los documentos
      Object.keys(docs).forEach(key => {
        if (docs[key]?.url) {
          console.log(`  ${key}: ${docs[key].url.substring(0, 80)}...`);
        }
      });
    } else {
      console.log('  ❌ No hay objeto documentosPETA');
    }

    // 3. Verificar armas
    console.log('\n🔫 Arsenal:');
    const armasRef = socioRef.collection('armas');
    const armasSnap = await armasRef.get();
    
    console.log(`  Total de armas: ${armasSnap.size}`);
    
    armasSnap.forEach(doc => {
      const arma = doc.data();
      console.log(`\n  ID: ${doc.id}`);
      console.log(`    Clase: ${arma.clase}`);
      console.log(`    Marca: ${arma.marca}`);
      console.log(`    Modelo: ${arma.modelo}`);
      console.log(`    Matrícula: ${arma.matricula}`);
      console.log(`    Registro PDF: ${arma.documentoRegistro ? '✅ Sí' : '❌ NO'}`);
      if (arma.documentoRegistro) {
        console.log(`    URL: ${arma.documentoRegistro.substring(0, 80)}...`);
      }
    });

    // 4. Verificar Storage
    console.log('\n📦 Verificando Firebase Storage...');
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({
      prefix: `documentos/${emailGardoni}/`
    });

    console.log(`\n  Archivos encontrados en Storage: ${files.length}`);
    files.forEach(file => {
      console.log(`    - ${file.name}`);
    });

    // 5. Verificar armas en Storage
    const [armasFiles] = await bucket.getFiles({
      prefix: `documentos/${emailGardoni}/armas/`
    });

    console.log(`\n  PDFs de armas en Storage: ${armasFiles.length}`);
    armasFiles.forEach(file => {
      console.log(`    - ${file.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

verificarGardoni();

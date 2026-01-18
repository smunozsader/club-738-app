const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.appspot.com'
});

const db = admin.firestore();
const storage = admin.storage();

async function verificarIvanCabo() {
  const email = 'ivancabo@gmail.com';
  
  console.log('\n🔍 VERIFICACIÓN COMPLETA: IVAN TSUIS CABO TORRES');
  console.log('='.repeat(80));
  console.log(`📧 Email: ${email}\n`);
  
  try {
    // 1. Datos básicos del socio
    const socioRef = db.collection('socios').doc(email);
    const socioDoc = await socioRef.get();
    
    if (!socioDoc.exists) {
      console.log('❌ Socio NO encontrado en Firestore\n');
      return;
    }
    
    const socioData = socioDoc.data();
    console.log('✅ DATOS BÁSICOS:');
    console.log(`   Nombre: ${socioData.nombre || 'N/A'}`);
    console.log(`   CURP: ${socioData.curp || 'N/A'}`);
    console.log(`   Fecha Alta: ${socioData.fechaAlta?.toDate() || 'N/A'}`);
    console.log(`   Total Armas: ${socioData.totalArmas || 0}`);
    console.log('');
    
    // 2. Documentos PETA
    console.log('📄 DOCUMENTOS PETA:');
    if (socioData.documentosPETA) {
      const docs = socioData.documentosPETA;
      const tiposDoc = [
        'curp', 'constanciaAntecedentes', 'ine', 'comprobantedomicilio',
        'certificadomedico', 'certificadopsicologico', 'certificadotoxicologico',
        'modohonesto', 'licenciacaza', 'fotocredencial', 'reciboe5cinco',
        'permisoanterior', 'cartilla'
      ];
      
      let conteoVerificados = 0;
      let conteoConURL = 0;
      
      for (const tipo of tiposDoc) {
        const doc = docs[tipo];
        if (doc) {
          const estado = doc.verificado ? '✅' : '⏳';
          const url = doc.url ? '🔗' : '❌';
          console.log(`   ${estado} ${url} ${tipo}: ${doc.url ? 'URL presente' : 'Sin URL'}`);
          if (doc.verificado) conteoVerificados++;
          if (doc.url) conteoConURL++;
        }
      }
      
      console.log(`\n   RESUMEN: ${conteoConURL} documentos con URL, ${conteoVerificados} verificados`);
    } else {
      console.log('   ⚠️  Campo documentosPETA no existe');
    }
    console.log('');
    
    // 3. Armas registradas
    console.log('🔫 ARMAS REGISTRADAS:');
    const armasSnapshot = await socioRef.collection('armas').get();
    
    if (armasSnapshot.empty) {
      console.log('   ⚠️  No tiene armas registradas\n');
    } else {
      console.log(`   Total: ${armasSnapshot.size} armas\n`);
      
      armasSnapshot.forEach((doc, index) => {
        const arma = doc.data();
        console.log(`   ${index + 1}. ${arma.clase || 'N/A'} ${arma.marca || 'N/A'} ${arma.modelo || 'N/A'}`);
        console.log(`      Calibre: ${arma.calibre || 'N/A'}`);
        console.log(`      Matrícula: ${arma.matricula || 'N/A'}`);
        console.log(`      Folio: ${arma.folio || 'N/A'}`);
        console.log(`      Modalidad: ${arma.modalidad || 'N/A'}`);
        console.log(`      Registro PDF: ${arma.documentoRegistro ? '✅ SÍ' : '❌ NO'}`);
        if (arma.documentoRegistro) {
          console.log(`      URL: ${arma.documentoRegistro.substring(0, 60)}...`);
        }
        console.log('');
      });
    }
    
    // 4. Verificar archivos en Storage
    console.log('☁️  ARCHIVOS EN STORAGE:');
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({
      prefix: `documentos/${email}/`
    });
    
    if (files.length === 0) {
      console.log('   ⚠️  No hay archivos en Storage\n');
    } else {
      console.log(`   Total archivos: ${files.length}\n`);
      
      files.forEach(file => {
        const fileName = file.name.replace(`documentos/${email}/`, '');
        console.log(`   📁 ${fileName}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

verificarIvanCabo();

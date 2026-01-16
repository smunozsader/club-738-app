const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage().bucket();

async function checkSergioMartinez() {
  const email = 'martinezasergio@hotmail.com';
  
  console.log('=== SERGIO FERNANDO MARTINEZ AGUILAR ===');
  console.log('Email:', email);
  console.log('');
  
  // Verificar documento del socio
  const socioDoc = await db.collection('socios').doc(email).get();
  if (!socioDoc.exists) {
    console.log('❌ NO existe en Firestore');
    return;
  }
  
  const socioData = socioDoc.data();
  console.log('✅ Socio encontrado en Firestore');
  console.log('Total armas:', socioData.totalArmas || 0);
  console.log('');
  
  // Listar armas
  const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
  console.log('--- ARMAS EN FIRESTORE ---');
  if (armasSnapshot.empty) {
    console.log('❌ No tiene armas registradas');
  } else {
    armasSnapshot.forEach(doc => {
      const arma = doc.data();
      console.log(`${doc.id}:`);
      console.log(`  ${arma.clase} - ${arma.marca} ${arma.modelo} (${arma.calibre})`);
      console.log(`  Matrícula: ${arma.matricula}`);
      console.log(`  Registro PDF: ${arma.documentoRegistro || '❌ NO CONFIGURADO'}`);
      console.log('');
    });
  }
  
  // Verificar Storage - TODOS los archivos
  console.log('--- TODOS LOS ARCHIVOS EN STORAGE ---');
  const [allFiles] = await storage.getFiles({ 
    prefix: `documentos/${email}/`,
    autoPaginate: true 
  });
  
  console.log(`Total de archivos: ${allFiles.length}`);
  console.log('');
  
  if (allFiles.length === 0) {
    console.log('❌ No hay archivos en Storage para este socio');
  } else {
    allFiles.forEach((file, index) => {
      const fileName = file.name;
      const isArmaFile = fileName.includes('/armas/');
      
      if (isArmaFile) {
        console.log(`🔫 [${index + 1}] ${fileName}`);
        console.log(`    Fecha: ${file.metadata.timeCreated}`);
      } else {
        console.log(`📄 [${index + 1}] ${fileName}`);
      }
    });
  }
  
  console.log('');
  console.log('--- PDFs DE ARMAS ESPECÍFICAMENTE ---');
  const [armaFiles] = await storage.getFiles({ 
    prefix: `documentos/${email}/armas/` 
  });
  
  if (armaFiles.length === 0) {
    console.log('❌ NO hay PDFs de armas en Storage');
  } else {
    console.log(`✅ Se encontraron ${armaFiles.length} PDFs de armas:`);
    armaFiles.forEach(file => {
      console.log(`  ✅ ${file.name}`);
      console.log(`     Fecha: ${file.metadata.timeCreated}`);
    });
  }
}

checkSergioMartinez()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

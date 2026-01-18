const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage().bucket();

async function checkRicardoDesquens() {
  const email = 'ridesquens@yahoo.com.mx';
  
  console.log('=== RICARDO ALBERTO DESQUENS BONILLA ===');
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
  armasSnapshot.forEach(doc => {
    const arma = doc.data();
    console.log(`${doc.id}: ${arma.clase} - ${arma.marca} ${arma.modelo} (${arma.calibre}) - Mat: ${arma.matricula}`);
    console.log(`   Registro PDF: ${arma.documentoRegistro || 'NO CONFIGURADO'}`);
  });
  console.log('');
  
  // Verificar Storage
  console.log('--- ARCHIVOS EN FIREBASE STORAGE ---');
  const [files] = await storage.getFiles({ prefix: `documentos/${email}/` });
  
  if (files.length === 0) {
    console.log('❌ No hay archivos en Storage para este socio');
  } else {
    files.forEach(file => {
      const fileName = file.name.split('/').pop();
      const ext = fileName.split('.').pop().toUpperCase();
      const size = (file.metadata.size / 1024).toFixed(2);
      console.log(`✅ ${file.name} [${ext}, ${size} KB]`);
    });
  }
  
  // Buscar documentos médicos en JPG
  console.log('');
  console.log('--- DOCUMENTOS MÉDICOS (JPG/JPEG) ---');
  const medicosJpg = files.filter(f => {
    const name = f.name.toLowerCase();
    return (name.includes('.jpg') || name.includes('.jpeg')) && 
           (name.includes('medico') || name.includes('toxico') || name.includes('psico'));
  });
  
  if (medicosJpg.length > 0) {
    medicosJpg.forEach(file => {
      console.log(`📄 ${file.name}`);
      console.log(`   Tamaño: ${(file.metadata.size / 1024).toFixed(2)} KB`);
      console.log(`   Fecha: ${file.metadata.timeCreated}`);
    });
  } else {
    console.log('⚠️ No se encontraron certificados médicos en JPG');
  }
  
  // Buscar PDFs de armas específicamente
  console.log('');
  console.log('--- BUSCANDO PDFs DE ARMAS ---');
  const [armaFiles] = await storage.getFiles({ prefix: `documentos/${email}/armas/` });
  
  if (armaFiles.length === 0) {
    console.log('❌ No hay PDFs de armas en Storage');
  } else {
    armaFiles.forEach(file => {
      console.log(`✅ ${file.name}`);
    });
  }
}

checkRicardoDesquens()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar con Storage bucket correcto
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function verificarStorageIvan() {
  const email = 'ivancabo@gmail.com';
  
  console.log('\n☁️  VERIFICACIÓN STORAGE: IVAN TSUIS CABO TORRES');
  console.log('='.repeat(80));
  console.log(`📧 Email: ${email}\n`);
  
  try {
    // 1. Listar TODOS los archivos en su carpeta
    console.log('📁 ARCHIVOS EN STORAGE:');
    const [files] = await bucket.getFiles({
      prefix: `documentos/${email}/`
    });
    
    if (files.length === 0) {
      console.log('   ❌ No hay archivos en Storage\n');
    } else {
      console.log(`   Total archivos: ${files.length}\n`);
      
      const armasPDFs = [];
      const documentosPDFs = [];
      
      files.forEach(file => {
        const fullPath = file.name;
        const fileName = fullPath.replace(`documentos/${email}/`, '');
        
        if (fullPath.includes('/armas/')) {
          armasPDFs.push({ fullPath, fileName });
          console.log(`   🔫 ${fileName}`);
        } else {
          documentosPDFs.push({ fullPath, fileName });
          console.log(`   📄 ${fileName}`);
        }
      });
      
      console.log('\n' + '='.repeat(80));
      
      // 2. Verificar armas en Firestore
      console.log('\n🔫 ARMAS EN FIRESTORE:');
      const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
      
      if (armasSnapshot.empty) {
        console.log('   ❌ No hay armas registradas\n');
      } else {
        console.log(`   Total: ${armasSnapshot.size} armas\n`);
        
        for (const armaDoc of armasSnapshot.docs) {
          const arma = armaDoc.data();
          const armaId = armaDoc.id;
          
          console.log(`   ID: ${armaId}`);
          console.log(`   ${arma.clase} ${arma.marca} ${arma.modelo}`);
          console.log(`   Matrícula: ${arma.matricula}`);
          console.log(`   documentoRegistro: ${arma.documentoRegistro || '❌ NULL'}`);
          
          // Buscar si existe PDF en Storage para esta arma
          const expectedPath = `documentos/${email}/armas/${armaId}/registro.pdf`;
          const pdfEnStorage = armasPDFs.find(pdf => pdf.fullPath === expectedPath);
          
          if (pdfEnStorage && !arma.documentoRegistro) {
            console.log(`   ⚠️  PROBLEMA DE MAPEO: PDF existe en Storage pero no está vinculado`);
            console.log(`   📍 Path en Storage: ${expectedPath}`);
          }
          
          console.log('');
        }
      }
      
      // 3. Buscar PDFs huérfanos (en Storage pero sin arma correspondiente)
      console.log('='.repeat(80));
      console.log('\n🔍 ANÁLISIS DE PDFs HUÉRFANOS:\n');
      
      for (const pdf of armasPDFs) {
        // Extraer armaId del path: documentos/email/armas/ARMAID/registro.pdf
        const match = pdf.fullPath.match(/\/armas\/([^\/]+)\//);
        if (match) {
          const armaIdEnPath = match[1];
          
          // Verificar si existe esta arma en Firestore
          const armaDoc = await db.collection('socios').doc(email).collection('armas').doc(armaIdEnPath).get();
          
          if (!armaDoc.exists) {
            console.log(`❌ PDF HUÉRFANO: ${pdf.fileName}`);
            console.log(`   Path: ${pdf.fullPath}`);
            console.log(`   Arma ID esperado: ${armaIdEnPath}`);
            console.log(`   Status: Arma NO existe en Firestore`);
            console.log('');
          } else {
            const armaData = armaDoc.data();
            if (!armaData.documentoRegistro) {
              console.log(`⚠️  PDF DESVINCULADO: ${pdf.fileName}`);
              console.log(`   Path: ${pdf.fullPath}`);
              console.log(`   Arma: ${armaData.clase} ${armaData.marca} ${armaData.modelo}`);
              console.log(`   Matrícula: ${armaData.matricula}`);
              console.log(`   Status: PDF existe pero campo documentoRegistro es NULL`);
              console.log('');
            }
          }
        }
      }
    }
    
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

verificarStorageIvan();

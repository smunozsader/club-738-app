/**
 * Script para subir fotos de credencial existentes a Firebase Storage
 * Las fotos están nombradas: {secuencia}_{numCredencial}_{NOMBRE}.jpeg
 * Se suben a: documentos/{email}/fotoCredencial_{timestamp}.jpg
 * Y se actualiza Firestore con la referencia
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Cargar mapeo credencial -> email
const credencialesPath = path.join(__dirname, '..', 'data', 'socios', 'credenciales_socios.json');
const { users } = require(credencialesPath);

// Crear mapeo de número de credencial a email
const credencialToEmail = {};
users.forEach(user => {
  credencialToEmail[user.credencial] = user.email.toLowerCase();
});

// Carpeta de fotos
const fotosDir = path.join(__dirname, '..', 'data', 'fotos', 'fotos infantiles socios', 'fotos_para_canva_bis');

async function subirFotos() {
  console.log('🚀 Iniciando subida de fotos de credencial...\n');
  
  // Leer archivos de la carpeta
  const files = fs.readdirSync(fotosDir).filter(f => 
    f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png')
  );
  
  console.log(`📁 Encontradas ${files.length} fotos\n`);
  
  let subidas = 0;
  let errores = 0;
  let sinMapeo = 0;
  
  for (const file of files) {
    // Extraer número de credencial del nombre: XX_NNN_NOMBRE.jpeg
    const match = file.match(/^\d+_(\d+)_/);
    if (!match) {
      console.log(`⚠️  No se pudo extraer credencial de: ${file}`);
      errores++;
      continue;
    }
    
    const numCredencial = parseInt(match[1], 10);
    const email = credencialToEmail[numCredencial];
    
    if (!email) {
      console.log(`⚠️  No hay email para credencial ${numCredencial}: ${file}`);
      sinMapeo++;
      continue;
    }
    
    // Verificar que el socio existe en Firestore
    const socioRef = db.collection('socios').doc(email);
    const socioDoc = await socioRef.get();
    
    if (!socioDoc.exists) {
      console.log(`⚠️  Socio no existe en Firestore: ${email} (cred ${numCredencial})`);
      sinMapeo++;
      continue;
    }
    
    // Preparar archivo para subir
    const filePath = path.join(fotosDir, file);
    const timestamp = Date.now();
    const storagePath = `documentos/${email}/fotoCredencial_${timestamp}.jpg`;
    
    try {
      // Subir a Storage
      await bucket.upload(filePath, {
        destination: storagePath,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            uploadedBy: 'admin-script',
            originalFileName: file,
            credencial: numCredencial.toString()
          }
        }
      });
      
      // Obtener URL pública
      const fileRef = bucket.file(storagePath);
      await fileRef.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      
      // Actualizar Firestore
      await socioRef.update({
        'documentosPETA.fotoCredencial': {
          url: publicUrl,
          fileName: `fotoCredencial_${timestamp}.jpg`,
          uploadDate: admin.firestore.FieldValue.serverTimestamp(),
          estado: 'precargado',
          fileSize: fs.statSync(filePath).size,
          fileType: 'image/jpeg',
          originalFileName: file
        }
      });
      
      console.log(`✅ Cred ${numCredencial.toString().padStart(3, '0')} → ${email}`);
      subidas++;
      
    } catch (err) {
      console.log(`❌ Error con ${file}: ${err.message}`);
      errores++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Subidas exitosas: ${subidas}`);
  console.log(`   ⚠️  Sin mapeo/socio: ${sinMapeo}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log('='.repeat(50));
}

// Ejecutar
subirFotos()
  .then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

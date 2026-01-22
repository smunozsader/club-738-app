import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'scripts', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: serviceAccountKey.json no encontrado en:', serviceAccountPath);
  console.error('Verifica que el archivo exista.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function getArmasFromFirestore() {
  const email = 'rsoberanis11@hotmail.com';
  const armasPath = `socios/${email}/armas`;
  
  console.log(`\n=== LEYENDO FIRESTORE ===`);
  console.log(`Path: ${armasPath}`);
  console.log(`Email (normalizado): ${email.toLowerCase()}\n`);
  
  try {
    const armasSnapshot = await db.collection(`socios/${email}/armas`).get();
    
    if (armasSnapshot.empty) {
      console.log('⚠️  No hay armas encontradas en Firestore para este socio.');
      return [];
    }
    
    console.log(`✅ Armas en Firestore: ${armasSnapshot.size}\n`);
    
    const armas = [];
    armasSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n📋 Documento ID: ${doc.id}`);
      console.log(JSON.stringify(data, null, 2));
      armas.push({
        id: doc.id,
        ...data
      });
    });
    
    return armas;
    
  } catch (error) {
    console.error('❌ Error al leer Firestore:', error.message);
    console.error('Stack:', error.stack);
    return [];
  } finally {
    await admin.app().delete();
  }
}

getArmasFromFirestore();

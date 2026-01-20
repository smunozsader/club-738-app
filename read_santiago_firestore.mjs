import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, 'scripts', 'serviceAccountKey.json');

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function main() {
  const email = 'squintal158@gmail.com';
  
  console.log('\n======================================');
  console.log('ARMAS EN FIRESTORE PARA SANTIAGO');
  console.log('======================================\n');
  
  const snapshot = await db.collection('socios').doc(email).collection('armas').get();
  
  console.log(`Email: ${email}`);
  console.log(`Total de armas: ${snapshot.size}\n`);
  
  const armas = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    armas.push({
      id: doc.id,
      clase: data.clase,
      calibre: data.calibre,
      marca: data.marca,
      modelo: data.modelo,
      matricula: data.matricula,
      folio: data.folio
    });
    
    console.log(`${data.clase} ${data.marca} ${data.modelo}`);
    console.log(`  Calibre: ${data.calibre}`);
    console.log(`  Matrícula: ${data.matricula}`);
    console.log(`  Folio: ${data.folio}\n`);
  });
  
  await admin.app().delete();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

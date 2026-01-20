import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'scripts', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://club-738-app.firebaseio.com'
});

const db = admin.firestore();

// Leer Excel
const excelPath = path.join(__dirname, 'socios', 'FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');
const workbook = xlsx.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

// Identificar socios sin armas (CLASE vacío o '0')
const sociosSinArmas = data.filter(row => {
  const clase = String(row['CLASE'] || '').trim();
  return clase === '' || clase === '0';
});

console.log(`\n✅ Encontrados ${sociosSinArmas.length} socios sin armas\n`);

// Agrupar por email para obtener datos únicos del socio
const sociosMap = {};
sociosSinArmas.forEach(row => {
  const email = String(row['EMAIL'] || '').toLowerCase().trim();
  if (email && !sociosMap[email]) {
    sociosMap[email] = {
      nombre: String(row['NOMBRE SOCIO'] || '').trim(),
      credencial: String(row['No. CREDENCIAL'] || '').trim(),
      email: email,
      telefono: String(row['TELÉFONO'] || '').trim() || '',
      domicilio: String(row['DOMICILIO'] || '').trim() || '',
      curp: String(row['CURP'] || '').trim() || ''
    };
  }
});

console.log(`📋 Insertando ${Object.keys(sociosMap).length} socios sin armas en Firestore:\n`);

let count = 0;
for (const [email, socioData] of Object.entries(sociosMap)) {
  try {
    const socioRef = db.collection('socios').doc(email);
    
    // Verificar si el documento ya existe
    const docSnap = await socioRef.get();
    
    if (docSnap.exists) {
      console.log(`⏭️  ${socioData.credencial} - ${socioData.nombre} (${email}) - YA EXISTE`);
    } else {
      // Crear documento con datos básicos del socio
      await socioRef.set({
        nombre: socioData.nombre,
        credencial: socioData.credencial,
        email: socioData.email,
        telefono: socioData.telefono,
        domicilio: socioData.domicilio,
        curp: socioData.curp,
        fechaAlta: new Date().toISOString(),
        armasCount: 0,
        renovacion2026: {
          estado: 'pendiente',
          monto: 0,
          fechaPago: null
        },
        membresia2026: {
          estado: 'pendiente',
          monto: 0,
          fechaPago: null
        }
      });
      
      console.log(`✅ ${socioData.credencial} - ${socioData.nombre} (${email})`);
      count++;
    }
  } catch (error) {
    console.error(`❌ Error insertando ${socioData.credencial}: ${error.message}`);
  }
}

console.log(`\n✨ Completado: ${count} socios sin armas agregados a Firestore\n`);

await admin.app().delete();

#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const serviceAccountRaw = readFileSync(new URL('./serviceAccountKey.json', import.meta.url));
const serviceAccount = JSON.parse(serviceAccountRaw);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function explorarPagos() {
  console.log('🔍 Explorando estructura de pagos...\n');

  try {
    // Buscar un socio como ejemplo
    const socioSnap = await db.collection('socios').limit(1).get();
    
    if (socioSnap.empty) {
      console.log('❌ No hay socios en la base de datos');
      return;
    }

    const socioDoc = socioSnap.docs[0];
    const email = socioDoc.id;
    const socioData = socioDoc.data();

    console.log(`📧 Socio de ejemplo: ${email}`);
    console.log(`📝 Datos socio: ${JSON.stringify(socioData, null, 2)}\n`);

    // Buscar sub-colecciones
    console.log('🔍 Sub-colecciones disponibles:\n');
    
    const collections = await socioDoc.ref.listCollections();
    
    if (collections.length === 0) {
      console.log('❌ No hay sub-colecciones\n');
    } else {
      for (const coll of collections) {
        console.log(`├─ ${coll.id}`);
        const docs = await coll.limit(1).get();
        if (!docs.empty) {
          console.log(`   └─ Ejemplo: ${JSON.stringify(docs.docs[0].data(), null, 2)}\n`);
        }
      }
    }

    // Buscar en colecciones de alto nivel para pagos
    console.log('🔍 Buscando colecciones de alto nivel para pagos:\n');
    
    const collections_high_level = await db.listCollections();
    for (const coll of collections_high_level) {
      console.log(`├─ ${coll.id}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await admin.app().delete();
  }
}

explorarPagos();

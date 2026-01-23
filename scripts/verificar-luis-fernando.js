#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('./scripts/serviceAccountKey.json'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function verificar() {
  console.log('🔍 Buscando LUIS FERNANDO GUILLERMO GAMBOA...\n');

  const snap = await db.collection('socios').where('nombre', '==', 'LUIS FERNANDO GUILLERMO GAMBOA').get();
  
  if (snap.empty) {
    console.log('❌ No encontrado');
    process.exit(1);
  }

  const doc = snap.docs[0];
  const email = doc.id;
  const data = doc.data();

  console.log('📧 EMAIL:', email);
  console.log('📋 CREDENCIAL:', data.numeroCredencial || data.credencial);
  console.log('\n🏦 REGISTRO RENOVACIÓN 2026:');
  console.log(JSON.stringify(data.renovacion2026, null, 2));

  process.exit(0);
}

verificar();

#!/usr/bin/env node
/**
 * Verificar si los receptores de bajas son socios del club
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

async function verificar() {
  const sociosSnap = await db.collection('socios').get();
  const nombres = [];
  const emails = [];
  
  sociosSnap.forEach(doc => {
    const data = doc.data();
    if (data.nombre) nombres.push(data.nombre.toUpperCase());
    emails.push(doc.id.toLowerCase());
  });
  
  console.log('Verificando receptores de transferencias/ventas:\n');
  console.log('- Arechiga (arechiga@jogarplastics.com):', emails.includes('arechiga@jogarplastics.com') ? '✅ ES SOCIO' : '❌ NO ES SOCIO');
  console.log('- Soberanis:', nombres.some(n => n.includes('SOBERANIS')) ? '✅ ES SOCIO' : '❌ NO ES SOCIO');
  console.log('- Sergio Rosado:', nombres.some(n => n.includes('ROSADO')) ? '✅ ES SOCIO' : '❌ NO ES SOCIO');
  
  process.exit(0);
}
verificar();

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountKeyPath = path.join(__dirname, '../../scripts/serviceAccountKey.json');
const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
}

const db = admin.firestore();

const docRef = db.collection('socios').doc('rmadahuar@cotexsa.com.mx');
await docRef.update({ credencial: 115 });

console.log('✅ Credencial 115 actualizada para rmadahuar@cotexsa.com.mx');
process.exit(0);

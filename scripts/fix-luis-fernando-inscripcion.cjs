#!/usr/bin/env node
/**
 * Fix contabilidad para LUIS FERNANDO GUILLERMO GAMBOA
 * 
 * Problema: Socio nuevo registrado solo con total $8,700 sin desglose de inscripción
 * Solución: Agregar campos esNuevo=true y desglosar monto:
 * - Inscripción: $2,000
 * - Cuota 2026: $6,000
 * - FEMETI: $700
 * - Total: $8,700
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://club-738-app.firebaseio.com'
});

const db = admin.firestore();
const email = 'oso.guigam@gmail.com';

async function fixContabilidad() {
  try {
    console.log('🔧 Arreglando contabilidad para LUIS FERNANDO GUILLERMO GAMBOA...');
    console.log(`📧 Email: ${email}\n`);

    // Obtener documento actual
    const socioRef = db.collection('socios').doc(email);
    const docSnap = await socioRef.get();

    if (!docSnap.exists) {
      console.error('❌ Socio no encontrado');
      process.exit(1);
    }

    const socioData = docSnap.data();
    console.log('📋 Datos actuales:');
    console.log(JSON.stringify(socioData.membresia2026, null, 2));

    // Actualizar con desglose correcto
    const nuevosDatos = {
      'membresia2026.esNuevo': true,
      'membresia2026.inscripcion': 2000,
      'membresia2026.cuotaClub': 6000,
      'membresia2026.cuotaFemeti': 700,
    };

    // Guardar
    await socioRef.update(nuevosDatos);

    console.log('\n✅ Datos actualizados correctamente:');
    console.log(JSON.stringify(nuevosDatos, null, 2));
    console.log('\n✨ Contabilidad arreglada:');
    console.log('  ✓ Inscripción: $2,000');
    console.log('  ✓ Cuota 2026: $6,000');
    console.log('  ✓ FEMETI: $700');
    console.log('  ✓ Total: $8,700');
    console.log('\n📱 El reporte de caja ahora mostrará el desglose correcto.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixContabilidad();

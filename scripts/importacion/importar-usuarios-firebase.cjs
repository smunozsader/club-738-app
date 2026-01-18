/**
 * Script para importar usuarios a Firebase Authentication
 * Club de Caza, Tiro y Pesca de Yucatán A.C.
 * 
 * USO:
 * 1. Primero instalar: npm install firebase-admin
 * 2. Descargar serviceAccountKey.json desde Firebase Console:
 *    - Ir a Project Settings → Service accounts → Generate new private key
 *    - Guardar como: scripts/serviceAccountKey.json
 * 3. Ejecutar: node scripts/importar-usuarios-firebase.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Cargar credenciales de servicio
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: No se encontró serviceAccountKey.json');
  console.log('\n📋 Instrucciones:');
  console.log('1. Ve a Firebase Console → Project Settings → Service accounts');
  console.log('2. Click en "Generate new private key"');
  console.log('3. Guarda el archivo como: scripts/serviceAccountKey.json');
  console.log('4. Vuelve a ejecutar este script');
  process.exit(1);
}

const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Cargar usuarios desde JSON
const credencialesPath = path.join(__dirname, '..', 'credenciales_socios.json');
const { users } = require(credencialesPath);

console.log(`\n🎯 Club 738 - Importador de Usuarios`);
console.log(`📊 Total usuarios a crear: ${users.length}\n`);

async function crearUsuario(userData, index) {
  try {
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.nombre,
      disabled: false
    });
    
    console.log(`✅ ${index}/${users.length} - ${userData.email} (Cred. ${userData.credencial})`);
    return { success: true, email: userData.email, uid: userRecord.uid };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  ${index}/${users.length} - ${userData.email} ya existe`);
      return { success: true, email: userData.email, existing: true };
    }
    console.error(`❌ ${index}/${users.length} - ${userData.email}: ${error.message}`);
    return { success: false, email: userData.email, error: error.message };
  }
}

async function importarTodos() {
  const resultados = {
    exitosos: 0,
    existentes: 0,
    fallidos: 0,
    errores: []
  };

  console.log('🚀 Iniciando importación...\n');

  for (let i = 0; i < users.length; i++) {
    const resultado = await crearUsuario(users[i], i + 1);
    
    if (resultado.success) {
      if (resultado.existing) {
        resultados.existentes++;
      } else {
        resultados.exitosos++;
      }
    } else {
      resultados.fallidos++;
      resultados.errores.push(resultado);
    }

    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Usuarios creados: ${resultados.exitosos}`);
  console.log(`⚠️  Ya existían: ${resultados.existentes}`);
  console.log(`❌ Errores: ${resultados.fallidos}`);
  console.log(`📊 Total procesados: ${users.length}`);
  
  if (resultados.errores.length > 0) {
    console.log('\n❌ Usuarios con errores:');
    resultados.errores.forEach(e => {
      console.log(`   - ${e.email}: ${e.error}`);
    });
  }

  console.log('\n✅ ¡Importación completada!');
  process.exit(0);
}

// Ejecutar
importarTodos().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

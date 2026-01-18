const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarCuentas() {
  console.log('🔍 Verificando cuentas de Agustín Moreno en Firebase:\n');
  
  // 1. Verificar galvani@hotmail.com (email correcto según Excel)
  const galvaniDoc = await db.collection('socios').doc('galvani@hotmail.com').get();
  
  console.log('📧 galvani@hotmail.com (email correcto en Excel):');
  if (galvaniDoc.exists) {
    const data = galvaniDoc.data();
    console.log(`   ✅ Existe`);
    console.log(`   Nombre: ${data.nombre}`);
    const armas = await db.collection('socios').doc('galvani@hotmail.com').collection('armas').get();
    console.log(`   Armas: ${armas.size}`);
    if (armas.size > 0) {
      console.log('   Detalle de armas:');
      armas.forEach(a => {
        const arma = a.data();
        console.log(`     - ${arma.clase} ${arma.calibre} ${arma.marca} (${arma.matricula})`);
      });
    }
  } else {
    console.log('   ❌ NO existe en Firebase');
  }
  
  console.log();
  
  // 2. Verificar agus_tin1_@hotmail.com (email incorrecto)
  const agustinDoc = await db.collection('socios').doc('agus_tin1_@hotmail.com').get();
  
  console.log('📧 agus_tin1_@hotmail.com (email incorrecto):');
  if (agustinDoc.exists) {
    const data = agustinDoc.data();
    console.log(`   ✅ Existe`);
    console.log(`   Nombre: ${data.nombre}`);
    const armas = await db.collection('socios').doc('agus_tin1_@hotmail.com').collection('armas').get();
    console.log(`   Armas: ${armas.size}`);
    if (armas.size > 0) {
      console.log('   Detalle de armas:');
      armas.forEach(a => {
        const arma = a.data();
        console.log(`     - ${arma.clase} ${arma.calibre} ${arma.marca} (${arma.matricula})`);
      });
    }
  } else {
    console.log('   ❌ NO existe en Firebase');
  }
  
  await admin.app().delete();
}

verificarCuentas();

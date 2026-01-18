/**
 * Script para actualizar modalidad de armas de Sergio
 * 2 armas de caza: BROWNING PHOENIX y CZ452-2E ZKM
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function actualizarModalidadCaza() {
  const email = 'smunozam@gmail.com';
  
  const armasCaza = [
    {
      id: '861ad5b1-589f-44ce-9cca-7b94d8ce3764',
      nombre: 'ESCOPETA BROWNING PHOENIX',
      matricula: '113MP17119'
    },
    {
      id: 'd3eab24e-3a49-4b6b-b5f1-50e658ed065f',
      nombre: 'RIFLE CZ452-2E ZKM',
      matricula: 'A800214'
    }
  ];
  
  try {
    console.log('\n🔄 Actualizando modalidad de armas a "caza"...\n');
    
    const batch = db.batch();
    const armasRef = db.collection('socios').doc(email).collection('armas');
    
    for (const arma of armasCaza) {
      const armaRef = armasRef.doc(arma.id);
      batch.update(armaRef, { modalidad: 'caza' });
      
      console.log(`✅ ${arma.nombre}`);
      console.log(`   ID: ${arma.id}`);
      console.log(`   Matrícula: ${arma.matricula}`);
      console.log(`   Modalidad: tiro → caza\n`);
    }
    
    await batch.commit();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ MODALIDADES ACTUALIZADAS');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Tu arsenal actualizado:\n');
    console.log('ARMAS DE CAZA (2):');
    console.log('  1. ESCOPETA BROWNING PHOENIX - 12 GA');
    console.log('  2. RIFLE CZ452-2E ZKM - .22 LR\n');
    console.log('ARMAS DE TIRO (4):');
    console.log('  3. KIT DE CONVERSIÓN CZ SHADOW 2 - 22 LR');
    console.log('  4. RIFLE CZ 600 ALPHA - .223 REM');
    console.log('  5. PISTOLA CZ SHADOW 2 - .380');
    console.log('  6. ESCOPETA P. BERETTA 682 GOLD E. - 12 GA\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

actualizarModalidadCaza();

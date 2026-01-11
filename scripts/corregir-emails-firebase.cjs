const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function corregirFirebase() {
  console.log('🔧 Corrigiendo Firebase para que coincida con Excel...\n');
  
  try {
    // 1. CORREGIR galvani@hotmail.com
    console.log('📧 Corrigiendo galvani@hotmail.com (EZEQUIEL GALVAN VAZQUEZ)...\n');
    
    const galvaniRef = db.collection('socios').doc('galvani@hotmail.com');
    const galvaniDoc = await galvaniRef.get();
    
    if (galvaniDoc.exists) {
      // Actualizar nombre del socio
      await galvaniRef.update({
        nombre: 'EZEQUIEL GALVAN VAZQUEZ',
        totalArmas: 1
      });
      console.log('   ✅ Nombre actualizado a: EZEQUIEL GALVAN VAZQUEZ');
      console.log('   ✅ totalArmas actualizado a: 1');
      
      // Obtener todas las armas
      const armasSnapshot = await galvaniRef.collection('armas').get();
      console.log(`\n   📋 Armas actuales: ${armasSnapshot.size}`);
      
      // Identificar qué eliminar (todas excepto TANFOGLIO AA23257)
      const armasAEliminar = [];
      const armasAMantener = [];
      
      armasSnapshot.forEach(armaDoc => {
        const arma = armaDoc.data();
        const matricula = arma.matricula;
        
        // MANTENER solo TANFOGLIO AA23257 (de Ezequiel)
        if (matricula === 'AA23257') {
          armasAMantener.push({
            id: armaDoc.id,
            ...arma
          });
        } else {
          // Eliminar las 4 armas de Agustín
          armasAEliminar.push({
            id: armaDoc.id,
            matricula: arma.matricula,
            clase: arma.clase,
            marca: arma.marca
          });
        }
      });
      
      console.log(`\n   ✅ Armas a mantener (Ezequiel): ${armasAMantener.length}`);
      armasAMantener.forEach(a => {
        console.log(`      - ${a.clase} ${a.marca} (${a.matricula})`);
      });
      
      console.log(`\n   ❌ Armas a eliminar (de Agustín): ${armasAEliminar.length}`);
      armasAEliminar.forEach(a => {
        console.log(`      - ${a.clase} ${a.marca} (${a.matricula})`);
      });
      
      // Eliminar armas de Agustín
      console.log('\n   🗑️  Eliminando armas de Agustín...');
      for (const arma of armasAEliminar) {
        await galvaniRef.collection('armas').doc(arma.id).delete();
        console.log(`      ✓ Eliminada: ${arma.clase} ${arma.marca} (${arma.matricula})`);
      }
      
      console.log('\n   ✅ galvani@hotmail.com corregido exitosamente');
    }
    
    // 2. VERIFICAR agus_tin1_@hotmail.com
    console.log('\n' + '='.repeat(80));
    console.log('\n📧 Verificando agus_tin1_@hotmail.com (AGUSTIN MORENO VILLALOBOS)...\n');
    
    const agustinRef = db.collection('socios').doc('agus_tin1_@hotmail.com');
    const agustinDoc = await agustinRef.get();
    
    if (agustinDoc.exists) {
      const data = agustinDoc.data();
      const armasSnapshot = await agustinRef.collection('armas').get();
      
      console.log(`   ✅ Existe en Firebase`);
      console.log(`   Nombre: ${data.nombre}`);
      console.log(`   Armas: ${armasSnapshot.size}`);
      
      console.log('\n   Detalle de armas:');
      armasSnapshot.forEach(a => {
        const arma = a.data();
        console.log(`      - ${arma.clase} ${arma.calibre} ${arma.marca} (${arma.matricula})`);
      });
      
      // Verificar si necesita corrección
      if (armasSnapshot.size === 4) {
        console.log('\n   ✅ agus_tin1_@hotmail.com ya está correcto (4 armas)');
      } else {
        console.log(`\n   ⚠️  Tiene ${armasSnapshot.size} armas, debería tener 4`);
      }
    } else {
      console.log('   ❌ NO existe en Firebase');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ CORRECCIÓN COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await admin.app().delete();
  }
}

corregirFirebase();

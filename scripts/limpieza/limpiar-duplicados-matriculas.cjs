const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function normalizarMatricula(matricula) {
  if (!matricula) return '';
  // Eliminar comas y espacios extras
  return String(matricula).replace(/,/g, '').trim();
}

async function limpiarDuplicadosMatriculas() {
  console.log('\n🔧 LIMPIEZA DE DUPLICADOS POR FORMATO DE MATRÍCULA\n');
  console.log('=' .repeat(100));
  
  try {
    const sociosSnapshot = await db.collection('socios').get();
    
    let totalSociosProcesados = 0;
    let totalSociosConDuplicados = 0;
    let totalDuplicadosEliminados = 0;
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const socioData = socioDoc.data();
      
      const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
      
      if (armasSnapshot.size === 0) continue;
      
      totalSociosProcesados++;
      
      // Agrupar armas por matrícula normalizada
      const armasPorMatricula = new Map();
      
      armasSnapshot.forEach(armaDoc => {
        const arma = armaDoc.data();
        const matriculaNormalizada = normalizarMatricula(arma.matricula);
        
        if (!armasPorMatricula.has(matriculaNormalizada)) {
          armasPorMatricula.set(matriculaNormalizada, []);
        }
        
        armasPorMatricula.get(matriculaNormalizada).push({
          id: armaDoc.id,
          ...arma
        });
      });
      
      // Identificar duplicados
      const duplicados = [];
      let armasUnicas = 0;
      
      for (const [matriculaNormalizada, armas] of armasPorMatricula) {
        if (armas.length > 1) {
          // Hay duplicados para esta matrícula
          
          // Elegir cuál mantener:
          // 1. Preferir la que ya tiene matrícula sin comas
          // 2. Si todas tienen comas, normalizar la primera y eliminar el resto
          let armaAMantener = armas.find(a => a.matricula === matriculaNormalizada);
          
          if (!armaAMantener) {
            // Ninguna tiene formato sin comas, elegir la primera
            armaAMantener = armas[0];
          }
          
          // Las demás son duplicados
          const armasAEliminar = armas.filter(a => a.id !== armaAMantener.id);
          
          duplicados.push({
            matricula: matriculaNormalizada,
            mantener: armaAMantener,
            eliminar: armasAEliminar
          });
        }
        armasUnicas++;
      }
      
      if (duplicados.length > 0) {
        totalSociosConDuplicados++;
        
        console.log(`\n[${socioData.nombre?.split('.')[0] || '???'}] ${socioData.nombre}`);
        console.log(`📧 ${email}`);
        console.log(`   Armas totales: ${armasSnapshot.size}`);
        console.log(`   Armas únicas: ${armasUnicas}`);
        console.log(`   Duplicados encontrados: ${duplicados.length} matrículas con múltiples versiones\n`);
        
        let eliminadosEsteSocio = 0;
        
        for (const dup of duplicados) {
          console.log(`   Matrícula: ${dup.matricula}`);
          console.log(`      ✅ MANTENER: ${dup.mantener.clase} ${dup.mantener.marca} (${dup.mantener.matricula})`);
          
          for (const arma of dup.eliminar) {
            console.log(`      ❌ ELIMINAR: ${arma.clase} ${arma.marca} (${arma.matricula})`);
            
            // ELIMINAR del Firebase
            await db.collection('socios').doc(email).collection('armas').doc(arma.id).delete();
            eliminadosEsteSocio++;
            totalDuplicadosEliminados++;
          }
          
          // Si la arma que mantenemos tiene comas, normalizarla
          if (dup.mantener.matricula !== dup.matricula) {
            await db.collection('socios').doc(email).collection('armas').doc(dup.mantener.id).update({
              matricula: dup.matricula
            });
            console.log(`      🔧 NORMALIZADO: Matrícula actualizada a "${dup.matricula}"`);
          }
          
          console.log();
        }
        
        // Actualizar totalArmas del socio
        await db.collection('socios').doc(email).update({
          totalArmas: armasUnicas
        });
        
        console.log(`   💾 ${eliminadosEsteSocio} duplicados eliminados, totalArmas actualizado a ${armasUnicas}\n`);
      }
    }
    
    // RESUMEN FINAL
    console.log('=' .repeat(100));
    console.log('\n📊 RESUMEN DE LIMPIEZA:\n');
    console.log(`   Socios procesados: ${totalSociosProcesados}`);
    console.log(`   Socios con duplicados: ${totalSociosConDuplicados}`);
    console.log(`   Socios sin cambios: ${totalSociosProcesados - totalSociosConDuplicados}`);
    console.log(`   Total de duplicados eliminados: ${totalDuplicadosEliminados}`);
    console.log();
    
    if (totalDuplicadosEliminados === 0) {
      console.log('✅ No se encontraron duplicados por formato de matrícula');
    } else {
      console.log(`✅ Limpieza completada: ${totalDuplicadosEliminados} armas duplicadas eliminadas`);
    }
    
    console.log();
    console.log('=' .repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await admin.app().delete();
  }
}

limpiarDuplicadosMatriculas();

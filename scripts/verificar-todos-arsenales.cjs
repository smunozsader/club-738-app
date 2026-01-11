const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarTodosArsenales() {
  console.log('\n🔍 Verificando arsenales de todos los socios...\n');
  
  try {
    const sociosSnapshot = await db.collection('socios').get();
    
    const estadisticas = {
      totalSocios: 0,
      sociosConDuplicados: [],
      sociosSinDuplicados: [],
      totalArmas: 0,
      totalDuplicados: 0
    };

    for (const socioDoc of sociosSnapshot.docs) {
      const socioEmail = socioDoc.id;
      const socioData = socioDoc.data();
      
      estadisticas.totalSocios++;
      
      // Obtener armas del socio
      const armasSnapshot = await db.collection(`socios/${socioEmail}/armas`).get();
      
      if (armasSnapshot.empty) {
        console.log(`  ⚪ ${socioData.nombre || socioEmail}: Sin armas registradas`);
        continue;
      }
      
      const armas = {};
      armasSnapshot.forEach(doc => {
        const arma = doc.data();
        const matricula = arma.matricula;
        
        if (!armas[matricula]) {
          armas[matricula] = [];
        }
        
        armas[matricula].push({
          id: doc.id,
          clase: arma.clase,
          marca: arma.marca,
          modalidad: arma.modalidad || 'N/A'
        });
      });
      
      // Buscar duplicados
      const duplicados = Object.entries(armas).filter(([_, copies]) => copies.length > 1);
      
      estadisticas.totalArmas += armasSnapshot.size;
      
      if (duplicados.length > 0) {
        const numDuplicados = duplicados.reduce((sum, [_, copies]) => sum + (copies.length - 1), 0);
        estadisticas.totalDuplicados += numDuplicados;
        
        estadisticas.sociosConDuplicados.push({
          email: socioEmail,
          nombre: socioData.nombre,
          totalArmas: armasSnapshot.size,
          duplicados: duplicados.map(([matricula, copies]) => ({
            matricula,
            cantidad: copies.length,
            detalles: copies
          }))
        });
        
        console.log(`  🔴 ${socioData.nombre || socioEmail}:`);
        console.log(`     Total registros: ${armasSnapshot.size}`);
        console.log(`     Duplicados encontrados: ${numDuplicados}`);
        
        duplicados.forEach(([matricula, copies]) => {
          console.log(`     - Matrícula ${matricula}: ${copies.length} copias`);
        });
      } else {
        estadisticas.sociosSinDuplicados.push({
          email: socioEmail,
          nombre: socioData.nombre,
          totalArmas: armasSnapshot.size
        });
        
        console.log(`  ✅ ${socioData.nombre || socioEmail}: ${armasSnapshot.size} armas (sin duplicados)`);
      }
    }
    
    // Reporte final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN GENERAL');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total socios analizados: ${estadisticas.totalSocios}`);
    console.log(`Total registros de armas: ${estadisticas.totalArmas}`);
    console.log(`Socios con duplicados: ${estadisticas.sociosConDuplicados.length}`);
    console.log(`Socios sin duplicados: ${estadisticas.sociosSinDuplicados.length}`);
    console.log(`Total duplicados detectados: ${estadisticas.totalDuplicados}`);
    
    if (estadisticas.sociosConDuplicados.length > 0) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('🔴 SOCIOS AFECTADOS:');
      console.log('═══════════════════════════════════════════════════════════');
      
      estadisticas.sociosConDuplicados.forEach(socio => {
        console.log(`\n${socio.nombre} (${socio.email})`);
        console.log(`  Registros totales: ${socio.totalArmas}`);
        socio.duplicados.forEach(dup => {
          console.log(`  - ${dup.matricula}: ${dup.cantidad} copias`);
          dup.detalles.forEach(det => {
            console.log(`    * ID: ${det.id} | ${det.clase} ${det.marca} | Modalidad: ${det.modalidad}`);
          });
        });
      });
      
      console.log('\n⚠️  Se recomienda ejecutar: node scripts/limpiar-todos-duplicados.cjs');
    } else {
      console.log('\n✅ ¡Todos los arsenales están limpios!');
    }
    
    // Guardar reporte JSON
    const fs = require('fs');
    fs.writeFileSync(
      './docs/reporte-arsenales.json',
      JSON.stringify(estadisticas, null, 2)
    );
    console.log('\n📄 Reporte guardado en: docs/reporte-arsenales.json');
    
  } catch (error) {
    console.error('❌ Error al verificar arsenales:', error);
  } finally {
    await admin.app().delete();
  }
}

verificarTodosArsenales();

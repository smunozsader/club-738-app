/**
 * Script para actualizar CURPs corregidos en Firestore
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// CURPs corregidos (viejo → nuevo)
const CORRECCIONES = {
  'GACE770131HDFNFN04': 'GACE770131HDFNSN04',
  'AERF781023MDFRMR09': 'AERF781223MDFRMR07',
  'DEHE890423HDFNRD03': 'DEHE890423HMCNRD08',
  'GANJ740807HDFRXQ04': 'GANJ740807HMCRXQ09',
  'GAPC790619HYNRRR09': 'GAPC790606HYNRRR06',
  'MAHH810329HYNRRG09': 'MAHH810329HCCRRG06',
  'MAOF620504HDFRRB06': 'MAOF720504HDFRRB02',
  'RIPR580721HYNVLF06': 'RIPR580720HYNVLF05',
  'RODY940625HYNMSL01': 'RODP940625HYNMSB06'
};

async function actualizarCurps() {
  console.log('======================================================================');
  console.log('🔄 ACTUALIZAR CURPs EN FIRESTORE');
  console.log('======================================================================\n');

  const sociosRef = db.collection('socios');
  const snapshot = await sociosRef.get();
  
  let actualizados = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const email = doc.id;
    const curpActual = data.curp;
    
    if (curpActual && CORRECCIONES[curpActual]) {
      const curpNuevo = CORRECCIONES[curpActual];
      
      await sociosRef.doc(email).update({ curp: curpNuevo });
      
      console.log(`   ✅ ${email}`);
      console.log(`      ${curpActual} → ${curpNuevo}\n`);
      
      actualizados++;
    }
  }
  
  console.log('======================================================================');
  console.log(`📊 RESUMEN: ${actualizados} socios actualizados en Firestore`);
  console.log('======================================================================');
}

actualizarCurps().then(() => {
  console.log('\n✨ Proceso completado');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

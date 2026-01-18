const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function identificarMorosos() {
  try {
    console.log('🔍 Buscando socios morosos de 2025...\n');
    
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    const morosos = [];
    const alCorriente = [];
    const sinInfo = [];
    
    for (const doc of snapshot.docs) {
      const socio = doc.data();
      const email = doc.id;
      
      // Verificar estado de renovación 2026
      if (socio.renovacion2026) {
        const estado = socio.renovacion2026.estado;
        const exento = socio.renovacion2026.exento || false;
        
        if (estado === 'pendiente' && !exento) {
          // Moroso real (pendiente y NO exento)
          morosos.push({
            email,
            nombre: socio.nombre || 'Sin nombre',
            credencial: socio.credencial || 'N/A',
            estado: 'MOROSO 2025'
          });
        } else if (estado === 'pagado' || estado === 'exento' || exento) {
          // Al corriente (pagado o exento)
          alCorriente.push({
            email,
            nombre: socio.nombre,
            fechaPago: socio.renovacion2026.fechaPago?.toDate() || null,
            exento: exento,
            motivoExencion: socio.renovacion2026.motivoExencion || null
          });
        }
      } else {
        // Sin información de renovación
        sinInfo.push({
          email,
          nombre: socio.nombre || 'Sin nombre',
          credencial: socio.credencial || 'N/A'
        });
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE COBRANZA 2026');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`✅ Socios al corriente: ${alCorriente.length}`);
    console.log(`❌ Socios morosos 2025: ${morosos.length}`);
    console.log(`⚠️  Sin información: ${sinInfo.length}`);
    console.log(`📈 Total socios: ${snapshot.size}\n`);
    
    if (morosos.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('❌ SOCIOS MOROSOS 2025 (Borrón y Cuenta Nueva)');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      morosos.sort((a, b) => (a.credencial || 0) - (b.credencial || 0));
      
      morosos.forEach((socio, index) => {
        console.log(`${index + 1}. [${socio.credencial}] ${socio.nombre}`);
        console.log(`   Email: ${socio.email}`);
        console.log('');
      });
    }
    
    // Guardar lista de morosos en CSV
    const csvLines = ['Credencial,Nombre,Email,Estado'];
    morosos.forEach(socio => {
      csvLines.push(`${socio.credencial},"${socio.nombre}",${socio.email},MOROSO 2025`);
    });
    
    const outputPath = path.join(__dirname, '../emails-socios/morosos-2025.csv');
    fs.writeFileSync(outputPath, csvLines.join('\n'));
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Lista de morosos guardada en: emails-socios/morosos-2025.csv`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Guardar JSON para email personalizado
    const jsonPath = path.join(__dirname, '../emails-socios/morosos-2025.json');
    fs.writeFileSync(jsonPath, JSON.stringify(morosos, null, 2));
    
    console.log(`✅ Datos JSON guardados en: emails-socios/morosos-2025.json\n`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

identificarMorosos();

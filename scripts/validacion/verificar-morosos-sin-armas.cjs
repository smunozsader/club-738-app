const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Lista de 19 morosos confirmados
const morososEmails = [
  'jacintolizarraga@hotmail.com',
  'sysaventas@hotmail.com',
  'manuel.chaidez@valledelsur.com.mx',
  'humh4@hotmail.com',
  'josebadz@outlook.com',
  'david_xolz@hotmail.com',
  'josegilbertohernandezcarrillo@gmail.com',
  'galvani@hotmail.com',
  'agus_tin1_@hotmail.com',
  'marcotonyjr@hotmail.com',
  'tonysantacruz@hotmail.com',
  'd@azarcorp.mx',
  'armando.pard@gmail.com',
  'valenciarojasjjesus@gmail.com',
  'mjtzab@yahoo.com',
  'lolita@concepthaus.mx',
  'santiago100100@hotmail.com',
  'egpiccolo@gmail.com',
  'alejandro18sosa@gmail.com'
];

async function verificarMorososSinArmas() {
  try {
    console.log('🔍 Verificando cuáles de los 19 morosos NO tienen armas...\n');
    
    const sinArmas = [];
    const conArmas = [];
    
    for (const email of morososEmails) {
      const socioRef = db.collection('socios').doc(email);
      const doc = await socioRef.get();
      
      if (doc.exists) {
        const socio = doc.data();
        const totalArmas = socio.totalArmas || 0;
        
        if (totalArmas === 0) {
          sinArmas.push({
            nombre: socio.nombre,
            email: email,
            totalArmas: 0
          });
          console.log(`❌ SIN ARMAS: ${socio.nombre}`);
        } else {
          conArmas.push({
            nombre: socio.nombre,
            email: email,
            totalArmas: totalArmas
          });
          console.log(`✅ ${totalArmas} arma(s): ${socio.nombre}`);
        }
      } else {
        console.log(`⚠️  No encontrado: ${email}`);
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`Total morosos: ${morososEmails.length}`);
    console.log(`Morosos SIN armas: ${sinArmas.length}`);
    console.log(`Morosos CON armas: ${conArmas.length}\n`);
    
    if (sinArmas.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('❌ MOROSOS SIN ARMAS (Candidatos para DN27)');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      sinArmas.forEach((socio, i) => {
        console.log(`${i + 1}. ${socio.nombre}`);
        console.log(`   Email: ${socio.email}\n`);
      });
      
      // Guardar lista
      const fs = require('fs');
      const path = require('path');
      
      const csvLines = ['Email,Nombre,TotalArmas'];
      sinArmas.forEach(s => {
        csvLines.push(`${s.email},"${s.nombre}",0`);
      });
      
      const outputPath = path.join(__dirname, '../emails-socios/morosos-sin-armas-DN27.csv');
      fs.writeFileSync(outputPath, csvLines.join('\n'));
      
      console.log('✅ Lista guardada: emails-socios/morosos-sin-armas-DN27.csv\n');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

verificarMorososSinArmas();

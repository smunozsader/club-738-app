/**
 * Script para subir constancias de antecedentes penales a Firebase Storage
 * y actualizar Firestore con las URLs
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Mapeo de nombres a emails (normalizado para matching)
const sociosData = `
1,RICARDO JESÚS FERNÁNDEZ Y GASQUE,richfegas@icloud.com
2,JOSE JACINTO LIZARRAGA AVILA,jacintolizarraga@hotmail.com
3,ADOLFO XACUR RIVERA,fit.x66@hotmail.com
4,REMIGIO BEETHOVEN AGUILAR CANTO,sysaventas@hotmail.com
5,MANUEL JESÚS CHAIDEZ PALACIOS,manuel.chaidez@valledelsur.com.mx
6,PAULINO EDILBERTO MONFORTE TRAVA,talleresmonforte@hotmail.com
7,RIGOMAR HINOJOSA SHIELDS,recosadecv@prodigy.net.mx
8,JUAN CARLOS JORDAN LOPEZ,jordan910@hotmail.com
9,JORGE ALFREDO DAWN MEDINA,jorgedawn@prodigy.net.mx
10,SERGIO SANTINELLI GRAJALES,ssg@santinelli.com.mx
11,CLAUDIO MAURICIO CANAVATI FARAH,cc@secure.mx
12,ALEJANDRO FRANCISCO RIVAS PINTADO,al3xrivas@gmail.com
13,JOSE VICENTE TRUJILLO LUCIC,jvtl@hotmail.com
14,EDGAR EDILBERTO MONFORTE ESCOBEDO,monfo87_@hotmail.com
15,JUAN CARLOS BRICEÑO GONZALEZ,jcb197624@hotmail.com
16,CARLOS ANTONIO GRANJA PEREZ,carlosgranja@gmail.com
17,ROBERTO JOSE MADAHUAR BOEHM,madahuar@cotexsa.com.mx
18,HUGO MARTINEZ HERNANDEZ,humh4@hotmail.com
19,JOSE HIPOLITO BARRERA AKE,josebadz@outlook.com
20,ALEJANDRO JAVIER GARCÍA GAMBOA,cudaosj@hotmail.com
21,SERGIO MUÑOZ DE ALBA MEDRANO,smunozam@gmail.com
22,ALEJANDRO GOMORY MARTINEZ,agm@galletasdonde.com
23,JAVIER RUZ PERAZA,javier_ruzperaza@hotmail.com
24,HANS JURGEN THIES BARBACHANO,hanstb@gmail.com
25,DAVID HOMERO SCHOLZ MORENO,david_xolz@hotmail.com
26,JOSE GILBERTO HERNANDEZ CARRILLO,josegilbertohernandezcarrillo@gmail.com
27,EZEQUIEL GALVAN VAZQUEZ,galvani@hotmail.com
28,AGUSTIN MORENO VILLALOBOS,agustin.moreno@email.com
29,RAFAEL RIVAS POLANCO,rafael-rivas-p@hotmail.com
30,ALEJANDRA GEORGINA PINTADO VILLAFAÑA,alejandrapintado@yahoo.com.mx
31,ANTONIO RAMÓN SANTA CRUZ POLANCO CABRALES,tonysantacruz@hotmail.com
32,MARCO ANTONIO SANTA CRUZ POLANCO CORDOVA,marcotonyjr@hotmail.com
33,CHAFI XACUR RIVERA,chafi70@hotmail.com
34,JUAN CARLOS MAÑE ORTIZ,jcmaneo@hotmail.com
35,CELESTINO SÁNCHEZ FERNÁNDEZ,tinosanchezf@yahoo.com.mx
36,EDUARDO DENIS HERRERA,lalodenis23@hotmail.com
37,EDUARDO JOSE ARZAMENDI MONTEJO,mayayuc3006@gmail.com
38,RODRIGO GARCÍA ESCALANTE,rodrigo.garcia.e@live.com.mx
39,JULIO RETANA VILLARREAL,jretana@live.com.mx
40,DAVID AZAR CÁMARA,d@azarcorp.mx
41,ENRIQUE GAONA CASTAÑEDA,quiquis77@hotmail.com
42,ARMANDO PARDIÑAZ ALCANTARA,armando.pard@gmail.com
43,JOAQUIN RODOLFO GARDONI NUÑEZ,jrgardoni@gmail.com
44,J. JESÚS VALENCIA ROJAS,valenciarojasjjesus@gmail.com
45,BRAYER KERMITH VERDE CHIN,brayerbyv@gmail.com
46,ROGER IRÁN MÉNDEZ CARRILLO,rafle_30@hotmail.com
47,MANUEL JESÚS TZAB CHUC,mjtzab@yahoo.com
48,ARIEL ANTONIO PAREDES CETINA,lic.arielparedescetina@hotmail.com
49,RICARDO ERNESTO CASTILLO MANCERA,dr.ricardocastillo@me.com
50,EDGARDO RAUL GÓMEZ ARZAMENDI,cpedgardo_gomez@hotmail.com
51,MARIA DOLORES DAVIS BETANZOS,lolita@concepthaus.mx
52,SANTIAGO LAMAS RINGENBACH,santiago100100@hotmail.com
53,ERNESTO GONZALEZ PICCOLO,egpiccolo@gmail.com
54,MARIA FERNANDA GUADALUPE ARECHIGA RAMOS,arechiga@jogarplastics.com
55,GERARDO ANTONIO FERNÁNDEZ QUIJANO,gfernandez63@gmail.com
56,RICARDO ALBERTO DESQUENS BONILLA,ridesquens@yahoo.com.mx
57,SERGIO FERNANDO MARTINEZ AGUILAR,martinezasergio@hotmail.com
58,ALEJANDRO OLIVER ROBERT EASTMOND,arobert01@protonmail.com
59,JUAN CARLOS RAMIREZ GOMEZ,olga.garcia@mayaseguridad.mx
60,GADDI OTHONIEL CAAMAL PUC,gocaamal@hotmail.com
61,GUIDO RENY CUEVAS ABRAHAM,guidorcuevasabraham@gmail.com
62,SANTIAGO RUEDA ESCOBEDO,santiagorueda2@gmail.com
63,IVAN TSUIS CABO TORRES,ivancabo@gmail.com
64,JESUS ALEJANDRO PUC SOSA,alejandro18sosa@gmail.com
65,JOSE GIL HEREDIA HAGAR,jgheredia@hotmail.com
66,SANTIAGO ALEJANDRO QUINTAL PAREDES,squintal158@gmail.com
67,ARIEL BALTAZAR CÓRDOBA WILSON,atietzbabam@gmail.com
68,KRISZTIAN GOR,ttok09136@gmail.com
69,FABIAN MARQUEZ ORTEGA,fabian.sievers3548@gmail.com
70,DANIEL DE JESUS PADILLA ROBLES,padilla_079@hotmail.com
71,RICARDO ANTONIO SOBERANIS GAMBOA,rsoberanis11@hotmail.com
72,RAÚL CERVANTES CEBALLOS,rcervantes@live.com.mx
73,RICARDO DANIEL FERNÁNDEZ PÉREZ,richfer0304@gmail.com
74,RICARDO MANUEL FERNÁNDEZ QUIJANO,richfer1020@gmail.com
75,YAEL ROMERO DE DIOS,licyaelromero@gmail.com
76,AIMEE GOMEZ MENDOZA,aimeegomez615@gmail.com
`.trim().split('\n').map(line => {
  const parts = line.split(',');
  return {
    nombre: parts[1],
    email: parts[2]
  };
});

// Función para normalizar nombres (quitar acentos, mayúsculas, etc.)
function normalizarNombre(nombre) {
  return nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^A-Z\s]/g, '') // Solo letras y espacios
    .replace(/\s+/g, ' ')
    .trim();
}

// Buscar email por nombre del archivo
function buscarEmailPorNombre(nombreArchivo) {
  // Extraer nombre del archivo (antes de CDAPF o .)
  let nombreExtraido = nombreArchivo
    .replace(/\.(pdf|jpg|jpeg|png)$/i, '')
    .replace(/\.?\s*CDAPF.*$/i, '')
    .replace(/,\s*CDAPF.*$/i, '')
    .trim();
  
  const nombreNorm = normalizarNombre(nombreExtraido);
  
  // Buscar coincidencia exacta o parcial
  for (const socio of sociosData) {
    const socioNorm = normalizarNombre(socio.nombre);
    
    // Coincidencia exacta
    if (socioNorm === nombreNorm) {
      return { email: socio.email, nombre: socio.nombre, match: 'exacto' };
    }
    
    // Buscar si el nombre del archivo contiene al socio o viceversa
    if (socioNorm.includes(nombreNorm) || nombreNorm.includes(socioNorm)) {
      return { email: socio.email, nombre: socio.nombre, match: 'parcial' };
    }
    
    // Buscar por apellidos coincidentes
    const palabrasArchivo = nombreNorm.split(' ');
    const palabrasSocio = socioNorm.split(' ');
    const coincidencias = palabrasArchivo.filter(p => palabrasSocio.includes(p) && p.length > 2);
    
    if (coincidencias.length >= 2) {
      return { email: socio.email, nombre: socio.nombre, match: 'apellidos', coincidencias };
    }
  }
  
  return null;
}

async function subirConstancias() {
  const constanciasDir = path.join(__dirname, '..', '2025. 738. CONSTANCIAS NO ANTECEDENTES');
  
  // Listar archivos
  const archivos = fs.readdirSync(constanciasDir)
    .filter(f => /\.(pdf|jpg|jpeg|png)$/i.test(f));
  
  console.log(`\n📂 Encontrados ${archivos.length} archivos de constancias\n`);
  
  let subidos = 0;
  let noEncontrados = [];
  let errores = [];
  
  for (const archivo of archivos) {
    const resultado = buscarEmailPorNombre(archivo);
    
    if (!resultado) {
      noEncontrados.push(archivo);
      console.log(`❌ No encontrado: ${archivo}`);
      continue;
    }
    
    console.log(`📤 ${archivo}`);
    console.log(`   → ${resultado.nombre} (${resultado.email}) [${resultado.match}]`);
    
    try {
      const filePath = path.join(constanciasDir, archivo);
      const ext = path.extname(archivo).toLowerCase();
      const destPath = `documentos/${resultado.email}/constancia_antecedentes${ext}`;
      
      // Subir a Storage
      await bucket.upload(filePath, {
        destination: destPath,
        metadata: {
          contentType: ext === '.pdf' ? 'application/pdf' : `image/${ext.slice(1)}`,
          metadata: {
            nombreOriginal: archivo,
            socioNombre: resultado.nombre,
            fechaSubida: new Date().toISOString()
          }
        }
      });
      
      // Obtener URL pública
      const file = bucket.file(destPath);
      await file.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
      
      // Actualizar Firestore
      const socioRef = db.collection('socios').doc(resultado.email.toLowerCase());
      await socioRef.set({
        constanciaAntecedentes: url,
        constanciaFecha: new Date().toISOString(),
        constanciaArchivoOriginal: archivo
      }, { merge: true });
      
      console.log(`   ✅ Subido y registrado\n`);
      subidos++;
      
    } catch (error) {
      console.log(`   ⚠️ Error: ${error.message}\n`);
      errores.push({ archivo, error: error.message });
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE CARGA DE CONSTANCIAS');
  console.log('='.repeat(60));
  console.log(`✅ Subidas exitosamente: ${subidos}`);
  console.log(`❌ Socios no encontrados: ${noEncontrados.length}`);
  console.log(`⚠️  Errores: ${errores.length}`);
  
  if (noEncontrados.length > 0) {
    console.log('\n❌ Archivos sin socio identificado:');
    noEncontrados.forEach(f => console.log(`   - ${f}`));
  }
  
  if (errores.length > 0) {
    console.log('\n⚠️  Errores durante la carga:');
    errores.forEach(e => console.log(`   - ${e.archivo}: ${e.error}`));
  }
  
  process.exit(0);
}

subirConstancias().catch(console.error);

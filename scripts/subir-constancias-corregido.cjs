/**
 * Script CORREGIDO para subir constancias usando el nombre EXACTO del PDF
 * Extrae el nombre del contenido del PDF para evitar confusiones por homonimia
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Mapeo COMPLETO de nombres a emails desde el Excel (con CURP para referencia)
const sociosData = [
  { nombre: "RICARDO JESÚS FERNÁNDEZ Y GASQUE", curp: "FEGR350218HYNRSC04", email: "richfegas@icloud.com" },
  { nombre: "JOSE JACINTO LIZARRAGA AVILA", curp: "LIAJ531001HSLZVS05", email: "jacintolizarraga@hotmail.com" },
  { nombre: "ADOLFO XACUR RIVERA", curp: "XARA661008HYNCVD08", email: "fit.x66@hotmail.com" },
  { nombre: "REMIGIO BEETHOVEN AGUILAR CANTO", curp: "AUCR710203HYNGMM06", email: "sysaventas@hotmail.com" },
  { nombre: "MANUEL JESÚS CHAIDEZ PALACIOS", curp: "CAPM650410HSLHLN09", email: "manuel.chaidez@valledelsur.com.mx" },
  { nombre: "PAULINO EDILBERTO MONFORTE TRAVA", curp: "MOTP610622HYNNRL09", email: "talleresmonforte@hotmail.com" },
  { nombre: "RIGOMAR HINOJOSA SHIELDS", curp: "HISR510812HDGNHG01", email: "recosadecv@prodigy.net.mx" },
  { nombre: "JUAN CARLOS JORDAN LOPEZ", curp: "JOLJ720624HYNRPN04", email: "jordan910@hotmail.com" },
  { nombre: "JORGE ALFREDO DAWN MEDINA", curp: "DAMJ530827HYNWDR07", email: "jorgedawn@prodigy.net.mx" },
  { nombre: "SERGIO SANTINELLI GRAJALES", curp: "SAGS631123HDFNRR06", email: "ssg@santinelli.com.mx" },
  { nombre: "CLAUDIO MAURICIO CANAVATI FARAH", curp: "CAFC770115HYNNAL02", email: "cc@secure.mx" },
  { nombre: "ALEJANDRO FRANCISCO RIVAS PINTADO", curp: "RIPA860831HYNVNL05", email: "al3xrivas@gmail.com" },
  { nombre: "JOSE VICENTE TRUJILLO LUCIC", curp: "TULV540405HDFRCCO2", email: "jvtl@hotmail.com" },
  { nombre: "EDGAR EDILBERTO MONFORTE ESCOBEDO", curp: "MOEE870627HYNNSD04", email: "monfo87_@hotmail.com" },
  { nombre: "JUAN CARLOS BRICEÑO GONZALEZ", curp: "BIGJ760724HYNRNN06", email: "jcb197624@hotmail.com" },
  { nombre: "CARLOS ANTONIO GRANJA PEREZ", curp: "GAPC641016HYNRRR07", email: "carlosgranja@gmail.com" },
  { nombre: "ROBERTO JOSE MADAHUAR BOEHM", curp: "MABR581219HYNDLB01", email: "madahuar@cotexsa.com.mx" },
  { nombre: "HUGO MARTINEZ HERNANDEZ", curp: "MAHH650316HDFRG07", email: "humh4@hotmail.com" },
  { nombre: "JOSE HIPOLITO BARRERA AKE", curp: "BAAH610113HYNRKP03", email: "josebadz@outlook.com" },
  { nombre: "ALEJANDRO JAVIER GARCÍA GAMBOA", curp: "GAGA791223HYNRML00", email: "cudaosj@hotmail.com" },
  { nombre: "SERGIO MUÑOZ DE ALBA MEDRANO", curp: "MUMS730930HDFXDR06", email: "smunozam@gmail.com" },
  { nombre: "ALEJANDRO GOMORY MARTINEZ", curp: "GOMA680415HYNMRL02", email: "agm@galletasdonde.com" },
  { nombre: "JAVIER RUZ PERAZA", curp: "RUPJ710730HYNZRV09", email: "javier_ruzperaza@hotmail.com" },
  { nombre: "HANS JURGEN THIES BARBACHANO", curp: "TIBH650725HYNHRN04", email: "hanstb@gmail.com" },
  { nombre: "DAVID HOMERO SCHOLZ MORENO", curp: "SOMD500911HDGCRV04", email: "david_xolz@hotmail.com" },
  { nombre: "JOSE GILBERTO HERNANDEZ CARRILLO", curp: "HECG710818HYNRRL08", email: "josegilbertohernandezcarrillo@gmail.com" },
  { nombre: "EZEQUIEL GALVAN VAZQUEZ", curp: "GAVE650911HYNLZZ08", email: "galvani@hotmail.com" },
  { nombre: "AGUSTIN MORENO VILLALOBOS", curp: "MOVA671018HYNRLG03", email: "agustin.moreno@email.com" },
  { nombre: "RAFAEL RIVAS POLANCO", curp: "RIPR660416HYNVLF03", email: "rafael-rivas-p@hotmail.com" },
  { nombre: "ALEJANDRA GEORGINA PINTADO VILLAFAÑA", curp: "PIVA631020MYNNLL04", email: "alejandrapintado@yahoo.com.mx" },
  { nombre: "ANTONIO RAMÓN SANTA CRUZ POLANCO CABRALES", curp: "SACA740719HDFNBN03", email: "tonysantacruz@hotmail.com" },
  { nombre: "MARCO ANTONIO SANTA CRUZ POLANCO CORDOVA", curp: "SACM001023HYNNRRA7", email: "marcotonyjr@hotmail.com" },
  { nombre: "CHAFI XACUR RIVERA", curp: "XACR701106HYNCVH07", email: "chafi70@hotmail.com" },
  { nombre: "JUAN CARLOS MAÑE ORTIZ", curp: "MAOJ741116HYNXRN02", email: "jcmaneo@hotmail.com" },
  { nombre: "CELESTINO SÁNCHEZ FERNÁNDEZ", curp: "SAFC680731HDFNRL07", email: "tinosanchezf@yahoo.com.mx" },
  { nombre: "EDUARDO DENIS HERRERA", curp: "DEHE760510HYNNRD08", email: "lalodenis23@hotmail.com" },
  { nombre: "EDUARDO JOSE ARZAMENDI MONTEJO", curp: "AAME751219HYNRND03", email: "mayayuc3006@gmail.com" },
  { nombre: "RODRIGO GARCÍA ESCALANTE", curp: "GAER821103HYNRSD08", email: "rodrigo.garcia.e@live.com.mx" },
  { nombre: "JULIO RETANA VILLARREAL", curp: "REVJ600414HYNTLL04", email: "jretana@live.com.mx" },
  { nombre: "DAVID AZAR CÁMARA", curp: "AACD701218HYNZMV00", email: "d@azarcorp.mx" },
  { nombre: "ENRIQUE GAONA CASTAÑEDA", curp: "GACE770304HDFNNS02", email: "quiquis77@hotmail.com" },
  { nombre: "ARMANDO PARDIÑAZ ALCANTARA", curp: "PAAA701101HDFRLR03", email: "armando.pard@gmail.com" },
  { nombre: "JOAQUIN RODOLFO GARDONI NUÑEZ", curp: "GANR870924HYNRXQ06", email: "jrgardoni@gmail.com" },
  { nombre: "J. JESÚS VALENCIA ROJAS", curp: "VARJ610522HGTLJS08", email: "valenciarojasjjesus@gmail.com" },
  { nombre: "BRAYER KERMITH VERDE CHIN", curp: "VECB901027HYNRHR04", email: "brayerbyv@gmail.com" },
  { nombre: "ROGER IRÁN MÉNDEZ CARRILLO", curp: "MECR790906HDFNRG06", email: "rafle_30@hotmail.com" },
  { nombre: "MANUEL JESÚS TZAB CHUC", curp: "TACM891222HYNZHN09", email: "mjtzab@yahoo.com" },
  { nombre: "ARIEL ANTONIO PAREDES CETINA", curp: "PACA831002HYNRTR02", email: "lic.arielparedescetina@hotmail.com" },
  { nombre: "RICARDO ERNESTO CASTILLO MANCERA", curp: "CAMR720915HYNSEC03", email: "dr.ricardocastillo@me.com" },
  { nombre: "EDGARDO RAUL GÓMEZ ARZAMENDI", curp: "GOAE680621HYNMRD04", email: "cpedgardo_gomez@hotmail.com" },
  { nombre: "MARIA DOLORES DAVIS BETANZOS", curp: "DABD591129MDFVTL00", email: "lolita@concepthaus.mx" },
  { nombre: "SANTIAGO LAMAS RINGENBACH", curp: "LARS780725HDFMNN00", email: "santiago100100@hotmail.com" },
  { nombre: "ERNESTO GONZALEZ PICCOLO", curp: "GOPE640519HDFNVR09", email: "egpiccolo@gmail.com" },
  { nombre: "MARIA FERNANDA GUADALUPE ARECHIGA RAMOS", curp: "AERF920614MJCRMR02", email: "arechiga@jogarplastics.com" },
  { nombre: "GERARDO ANTONIO FERNÁNDEZ QUIJANO", curp: "FEQG630819HCCRJR06", email: "gfernandez63@gmail.com" },
  { nombre: "RICARDO ALBERTO DESQUENS BONILLA", curp: "DEBR741018HYNSNN03", email: "ridesquens@yahoo.com.mx" },
  { nombre: "SERGIO FERNANDO MARTINEZ AGUILAR", curp: "MAAS730201HYNRGR03", email: "martinezasergio@hotmail.com" },
  { nombre: "ALEJANDRO OLIVER ROBERT EASTMOND", curp: "ROEA890922HYNBSL01", email: "arobert01@protonmail.com" },
  { nombre: "JUAN CARLOS RAMIREZ GOMEZ", curp: "RAGJ831020HDFMMN08", email: "olga.garcia@mayaseguridad.mx" },
  { nombre: "GADDI OTHONIEL CAAMAL PUC", curp: "CAPG860523HYNMCD06", email: "gocaamal@hotmail.com" },
  { nombre: "GUIDO RENY CUEVAS ABRAHAM", curp: "CUAG840819HVZVBD03", email: "guidorcuevasabraham@gmail.com" },
  { nombre: "SANTIAGO RUEDA ESCOBEDO", curp: "RUES900725HMCDSCN04", email: "santiagorueda2@gmail.com" },
  { nombre: "IVAN TSUIS CABO TORRES", curp: "CATI890906HYNBRV08", email: "ivancabo@gmail.com" },
  { nombre: "JESUS ALEJANDRO PUC SOSA", curp: "PUSJ971018HYNCSS09", email: "alejandro18sosa@gmail.com" },
  { nombre: "JOSE GIL HEREDIA HAGAR", curp: "HEHG730219HYNRGL08", email: "jgheredia@hotmail.com" },
  { nombre: "SANTIAGO ALEJANDRO QUINTAL PAREDES", curp: "QUPS910905HYNNRN00", email: "squintal158@gmail.com" },
  { nombre: "ARIEL BALTAZAR CÓRDOBA WILSON", curp: "COWA850826HYNRLR09", email: "atietzbabam@gmail.com" },
  { nombre: "KRISZTIAN GOR", curp: "GOXK850815HNERXR01", email: "ttok09136@gmail.com" },
  { nombre: "FABIAN MARQUEZ ORTEGA", curp: "MAOF911028HYNRRB05", email: "fabian.sievers3548@gmail.com" },
  { nombre: "DANIEL DE JESUS PADILLA ROBLES", curp: "PARD790219HYNDBN02", email: "padilla_079@hotmail.com" },
  { nombre: "RICARDO ANTONIO SOBERANIS GAMBOA", curp: "SOGR930321HYNBMC06", email: "rsoberanis11@hotmail.com" },
  { nombre: "RAÚL CERVANTES CEBALLOS", curp: "CECR670113HYNRBL05", email: "rcervantes@live.com.mx" },
  { nombre: "RICARDO DANIEL FERNÁNDEZ PÉREZ", curp: "FEPR920403HYNRRC06", email: "richfer0304@gmail.com" },
  { nombre: "RICARDO MANUEL FERNÁNDEZ QUIJANO", curp: "FEQR591020HCCRJC07", email: "richfer1020@gmail.com" },
  { nombre: "YAEL ROMERO DE DIOS", curp: "RODY900929HYNMSL01", email: "licyaelromero@gmail.com" },
  { nombre: "AIMEE GOMEZ MENDOZA", curp: "GOMA850615MDFMNM09", email: "aimeegomez615@gmail.com" }
];

// Función para normalizar nombres
function normalizarNombre(nombre) {
  return nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extraer nombre del contenido del PDF
function extraerNombreDePDF(filePath) {
  try {
    const output = execSync(`pdftotext "${filePath}" - 2>/dev/null`, { encoding: 'utf8' });
    // Buscar patrón "contra de NOMBRE COMPLETO"
    const match = output.match(/contra de ([A-ZÁÉÍÓÚÑ ]+)/i);
    if (match) {
      return match[1].trim();
    }
  } catch (e) {
    // Si falla pdftotext, puede ser JPG
  }
  return null;
}

// Buscar email por nombre EXACTO
function buscarEmailPorNombreExacto(nombreBuscado) {
  const nombreNorm = normalizarNombre(nombreBuscado);
  
  for (const socio of sociosData) {
    const socioNorm = normalizarNombre(socio.nombre);
    
    // Coincidencia exacta (después de normalizar)
    if (socioNorm === nombreNorm) {
      return { email: socio.email, nombre: socio.nombre, curp: socio.curp, match: 'exacto' };
    }
  }
  
  // Si no hay exacta, buscar parcial (nombre contenido)
  for (const socio of sociosData) {
    const socioNorm = normalizarNombre(socio.nombre);
    
    // El nombre del PDF contiene al socio o viceversa
    if (nombreNorm.includes(socioNorm) || socioNorm.includes(nombreNorm)) {
      return { email: socio.email, nombre: socio.nombre, curp: socio.curp, match: 'parcial' };
    }
  }
  
  return null;
}

async function subirConstancias() {
  const constanciasDir = path.join(__dirname, '..', '2025. 738. CONSTANCIAS NO ANTECEDENTES');
  
  const archivos = fs.readdirSync(constanciasDir)
    .filter(f => /\.(pdf|jpg|jpeg|png)$/i.test(f));
  
  console.log(`\n📂 Encontrados ${archivos.length} archivos de constancias\n`);
  console.log('=' .repeat(70));
  
  let subidos = 0;
  let actualizados = 0;
  let noEncontrados = [];
  let errores = [];
  
  for (const archivo of archivos) {
    const filePath = path.join(constanciasDir, archivo);
    const ext = path.extname(archivo).toLowerCase();
    
    // Extraer nombre del contenido del PDF
    let nombreDelPDF = null;
    if (ext === '.pdf') {
      nombreDelPDF = extraerNombreDePDF(filePath);
    }
    
    // Si no pudimos extraer del PDF, usar nombre del archivo
    if (!nombreDelPDF) {
      nombreDelPDF = archivo
        .replace(/\.(pdf|jpg|jpeg|png)$/i, '')
        .replace(/\.?\s*CDAPF.*$/i, '')
        .replace(/,\s*CDAPF.*$/i, '')
        .trim();
    }
    
    const resultado = buscarEmailPorNombreExacto(nombreDelPDF);
    
    if (!resultado) {
      noEncontrados.push({ archivo, nombreExtraido: nombreDelPDF });
      console.log(`❌ ${archivo}`);
      console.log(`   Nombre extraído: "${nombreDelPDF}"`);
      console.log(`   NO ENCONTRADO EN BASE DE DATOS\n`);
      continue;
    }
    
    console.log(`📤 ${archivo}`);
    console.log(`   Nombre en PDF: "${nombreDelPDF}"`);
    console.log(`   → ${resultado.nombre}`);
    console.log(`   → CURP: ${resultado.curp}`);
    console.log(`   → Email: ${resultado.email} [${resultado.match}]`);
    
    try {
      const destPath = `documentos/${resultado.email.toLowerCase()}/constancia_antecedentes${ext}`;
      
      // Subir a Storage
      await bucket.upload(filePath, {
        destination: destPath,
        metadata: {
          contentType: ext === '.pdf' ? 'application/pdf' : `image/${ext.slice(1)}`,
          metadata: {
            nombreOriginal: archivo,
            nombreEnPDF: nombreDelPDF,
            socioNombre: resultado.nombre,
            socioCURP: resultado.curp,
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
        constanciaArchivoOriginal: archivo,
        constanciaNombreEnPDF: nombreDelPDF
      }, { merge: true });
      
      console.log(`   ✅ Subido y registrado\n`);
      subidos++;
      
    } catch (error) {
      console.log(`   ⚠️ Error: ${error.message}\n`);
      errores.push({ archivo, error: error.message });
    }
  }
  
  // Resumen
  console.log('='.repeat(70));
  console.log('📊 RESUMEN DE CARGA DE CONSTANCIAS (CORREGIDO)');
  console.log('='.repeat(70));
  console.log(`✅ Subidas exitosamente: ${subidos}`);
  console.log(`❌ Socios no encontrados: ${noEncontrados.length}`);
  console.log(`⚠️  Errores: ${errores.length}`);
  
  if (noEncontrados.length > 0) {
    console.log('\n❌ Archivos sin socio identificado:');
    noEncontrados.forEach(f => {
      console.log(`   - ${f.archivo}`);
      console.log(`     Nombre extraído: "${f.nombreExtraido}"`);
    });
  }
  
  process.exit(0);
}

subirConstancias().catch(console.error);

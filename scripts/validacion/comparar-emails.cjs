const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function comparar() {
  // Emails del Excel
  const emailsExcel = {
    'AACD910605HYNZMV00': 'd@azarcorp.mx',
    'AAME760820HYNRND04': 'mayayuc3006@gmail.com',
    'AERF781223MDFRMR07': 'arechiga@jogarplastics.com',
    'AUCR770225HYNGNM08': 'sysaventas@hotmail.com',
    'BAAH530514HCCRKP07': 'josebadz@outlook.com',
    'BIGJ760724HYNRNN06': 'jcb197624@hotmail.com',
    'CAFC660725HDFNRL03': 'cc@secure.mx',
    'CAMR840315HYNSNC08': 'dr.ricardocastillo@me.com',
    'CAPG891110HYNMCD00': 'gocaamal@hotmail.com',
    'CAPM841222HSLHLN09': 'manuel.chaidez@valledelsur.com.mx',
    'CATI771216HNEBRV03': 'ivancabo@gmail.com',
    'CECR890104HYNRBL02': 'rcervantes@live.com.mx',
    'COWA700106HTCRLR02': 'atietzbabam@gmail.com',
    'CUAG750301HYNVBD00': 'guidorcuevasabraham@gmail.com',
    'DABD900923MDFVTL03': 'lolita@concepthaus.mx',
    'DAMJ690611HYNWDR03': 'jorgedawn@prodigy.net.mx',
    'DEBR700911HDFSNC06': 'ridesquens@yahoo.com.mx',
    'DEHE890423HMCNRD08': 'lalodenis23@hotmail.com',
    'FEGR350218HYNRSC04': 'richfegas@icloud.com',
    'FEPR920403HYNRRC06': 'richfer0304@gmail.com',
    'FEQG630819HCCRJR06': 'gfernandez63@gmail.com',
    'FEQR591020HCCRJC07': 'richfer1020@gmail.com',
    'GACE770131HDFNSN04': 'quiquis77@hotmail.com',
    'GAER870129HYNRSD09': 'rodrigo.garcia.e@live.com.mx',
    'GAGA590307HYNRML03': 'cudaosj@hotmail.com',
    'GANJ740807HMCRXQ09': 'jrgardoni@gmail.com',
    'GAPC790606HYNRRR06': 'carlosgranja@gmail.com',
    'GAVE680401HTSLZZ02': 'galvani@hotmail.com',
    'GOAE840623HYNMRD00': 'cpedgardo_gomez@hotmail.com',
    'GOMA780511HYNMRL05': 'agm@galletasdonde.com',
    'GOMA940118MVZMNM00': 'aimeegomez615@gmail.com',
    'GOPE850306HDFNCR03': 'egpiccolo@gmail.com',
    'GOXK740906HNERXR09': 'ttok09136@gmail.com',
    'HECG720131HYNRRL06': 'josegilbertohernandezcarrillo@gmail.com',
    'HEHG860310HYNRGL05': 'jgheredia@hotmail.com',
    'HISR591125HCCNHG06': 'recosadecv@prodigy.net.mx',
    'JOLJ720624HYNRPN04': 'jordan910@hotmail.com',
    'LARS970906HYNMNN09': 'santiago100100@hotmail.com',
    'LIAJ750609HYNZVC08': 'jacintolizarraga@hotmail.com',
    'MAAS720901HCCRGR07': 'martinezasergio@hotmail.com',
    'MABR671122HYNDHB07': 'madahuar@cotexsa.com.mx',
    'MAHH810329HCCRRG06': 'humh4@hotmail.com',
    'MAOF720504HDFRRB02': 'fabian.sievers3548@gmail.com',
    'MAOJ741116HYNXRN02': 'jcmaneo@hotmail.com',
    'MECR871030HYNNRG05': 'rafle_30@hotmail.com',
    'MOEE870627HYNNSD04': 'monfo87_@hotmail.com',
    'MOTP610622HYNNRL09': 'talleresmonforte@hotmail.com',
    'MOVA910904HCCRLG09': 'agus_tin1_@hotmail.com',
    'MUMS640728HDFXDR02': 'smunozam@gmail.com',
    'PAAA710213HDFRLR07': 'armando.pard@gmail.com',
    'PACA840803HYNRTR08': 'lic.arielparedescetina@hotmail.com',
    'PARD850710HCCDBN05': 'padilla_079@hotmail.com',
    'PIVA591215MDFNLL09': 'alejandrapintado@yahoo.com.mx',
    'PUSJ000131HYNCSSA4': 'alejandro18sosa@gmail.com',
    'QUPS901102HYNNRN04': 'squintal158@gmail.com',
    'RAGJ831020HDFMMN08': 'olga.garcia@mayaseguridad.mx',
    'REVJ510801HDGTLL01': 'jretana@live.com.mx',
    'RIPA800807HYNVNL07': 'al3xrivas@gmail.com',
    'RIPR580720HYNVLF05': 'rafael-rivas-p@hotmail.com',
    'RODP940625HYNMSB06': 'licyaelromero@gmail.com',
    'ROEA841021HYNBSL09': 'arobert01@protonmail.com',
    'RUES971109HCCDSN07': 'santiagorueda2@gmail.com',
    'RUPJ920129HYNZRV07': 'javier_ruzperaza@hotmail.com',
    'SACA740719HDFNBN03': 'tonysantacruz@hotmail.com',
    'SACM001023HYNNRRA7': 'marcotonyjr@hotmail.com',
    'SAFC680731HDFNRL07': 'tinosanchezf@yahoo.com.mx',
    'SAGS611114HDFNRR03': 'ssg@santinelli.com.mx',
    'SOGR701015HYNBMC04': 'rsoberanis11@hotmail.com',
    'SOMD831110HTSCRV04': 'david_xolz@hotmail.com',
    'TACM750410HYNZHN05': 'mjtzab@yahoo.com',
    'TIBH730728HQRHRN08': 'hanstb@gmail.com',
    'TULV760925HYNRCC04': 'jvtl@hotmail.com',
    'VARJ861111HMNLJS03': 'valenciarojasjjesus@gmail.com',
    'VECB750917HYNRHR03': 'brayerbyv@gmail.com',
    'XARA661008HYNCVD08': 'fit.x66@hotmail.com',
    'XARC701106HYNCVH07': 'chafi70@hotmail.com'
  };

  // Obtener datos de Firestore
  const snapshot = await db.collection('socios').get();
  
  const firestoreByCurp = {};
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const email = doc.id.toLowerCase();
    const curp = data.curp;
    if (curp) {
      firestoreByCurp[curp] = email;
    }
  });

  console.log('='.repeat(80));
  console.log('🔍 COMPARACIÓN EXCEL vs FIRESTORE');
  console.log('='.repeat(80));
  console.log(`\nExcel: ${Object.keys(emailsExcel).length} socios`);
  console.log(`Firestore: ${snapshot.size} socios\n`);

  // Comparar
  let coinciden = 0;
  let emailDiferente = [];
  let noEnFirestore = [];
  
  for (const [curp, emailExcel] of Object.entries(emailsExcel)) {
    const emailFirestore = firestoreByCurp[curp];
    
    if (!emailFirestore) {
      noEnFirestore.push({ curp, emailExcel });
    } else if (emailFirestore.toLowerCase() !== emailExcel.toLowerCase()) {
      emailDiferente.push({ curp, emailExcel, emailFirestore });
    } else {
      coinciden++;
    }
  }

  console.log(`✅ Coinciden exactamente: ${coinciden}`);
  
  if (emailDiferente.length > 0) {
    console.log(`\n⚠️  EMAIL DIFERENTE (${emailDiferente.length}):`);
    for (const d of emailDiferente) {
      console.log(`   ${d.curp}`);
      console.log(`      Excel:     ${d.emailExcel}`);
      console.log(`      Firestore: ${d.emailFirestore}\n`);
    }
  }
  
  if (noEnFirestore.length > 0) {
    console.log(`\n❌ NO ESTÁN EN FIRESTORE (${noEnFirestore.length}):`);
    for (const d of noEnFirestore) {
      console.log(`   ${d.curp} → ${d.emailExcel}`);
    }
  }
}

comparar().then(() => process.exit(0));

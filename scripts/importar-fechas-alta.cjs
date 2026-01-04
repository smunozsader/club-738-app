/**
 * Script para importar fechas de ALTA desde el Excel a Firestore
 * 
 * Uso: node scripts/importar-fechas-alta.cjs
 */

const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuración
const EXCEL_PATH = path.join(__dirname, '../Base datos/CLUB 738-31-DE-DICIEMBRE-2025_ANEXOS A, B Y C.xlsx');

// Socios exentos de pago de renovación 2026
const SOCIOS_EXENTOS = {
  'smunozam@gmail.com': { motivo: 'Secretario del Club', tipo: 'mesa_directiva' },
  'jrgardoni@gmail.com': { motivo: 'Tesorero del Club', tipo: 'mesa_directiva' },
  'richfegas@icloud.com': { motivo: 'Presidente del Club', tipo: 'mesa_directiva' },
  'richfer1020@gmail.com': { motivo: 'Familiar del Presidente', tipo: 'familia_presidente' },
  'richfer0304@gmail.com': { motivo: 'Familiar del Presidente', tipo: 'familia_presidente' },
  'gfernandez63@gmail.com': { motivo: 'Familiar del Presidente', tipo: 'familia_presidente' },
  // Aimee Gomez se detecta automáticamente por fecha de alta Q4 2025
};

// Fecha límite de pago
const FECHA_LIMITE_PAGO = new Date('2026-02-28');
const FECHA_CORTE_EXENCION = new Date('2025-10-01'); // Q4 2025

async function importarFechasAlta() {
  console.log('📊 Leyendo Excel...');
  
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets['Anexo A'];
  const data = XLSX.utils.sheet_to_json(sheet, { range: 5 }); // Empezar desde fila 6 (header en 5)
  
  console.log(`📋 Encontrados ${data.length} registros\n`);
  
  let actualizados = 0;
  let noEncontrados = [];
  let exentosPorFecha = [];
  
  for (const row of data) {
    const email = row['EMAIL']?.toString().toLowerCase().trim();
    const nombre = row['NOMBRE SOCIO'];
    const fechaAlta = row['FECHA ALTA'];
    const noSocio = row['No. DE SOCIO'];
    
    if (!email || email === 'nan' || !fechaAlta) {
      console.log(`⚠️  Saltando: ${nombre} (sin email o fecha)`);
      continue;
    }
    
    // Convertir fecha de Excel a Date
    let fechaAltaDate;
    if (typeof fechaAlta === 'number') {
      // Fecha en formato numérico de Excel
      fechaAltaDate = new Date((fechaAlta - 25569) * 86400 * 1000);
    } else if (fechaAlta instanceof Date) {
      fechaAltaDate = fechaAlta;
    } else {
      fechaAltaDate = new Date(fechaAlta);
    }
    
    // Verificar si es exento por fecha (Q4 2025)
    const esExentoPorFecha = fechaAltaDate >= FECHA_CORTE_EXENCION;
    if (esExentoPorFecha) {
      exentosPorFecha.push({ nombre, email, fechaAlta: fechaAltaDate });
    }
    
    // Verificar si es exento por rol
    const exencionManual = SOCIOS_EXENTOS[email];
    
    // Calcular estado de renovación
    let estadoRenovacion = 'pendiente';
    let motivoExencion = null;
    
    if (exencionManual) {
      estadoRenovacion = 'exento';
      motivoExencion = exencionManual.motivo;
    } else if (esExentoPorFecha) {
      estadoRenovacion = 'exento';
      motivoExencion = 'Alta en Q4 2025 (menos de 3 meses)';
    }
    
    // Buscar socio en Firestore
    const socioRef = db.collection('socios').doc(email);
    const socioDoc = await socioRef.get();
    
    if (!socioDoc.exists) {
      noEncontrados.push({ nombre, email });
      continue;
    }
    
    // Actualizar documento
    await socioRef.update({
      fechaAlta: admin.firestore.Timestamp.fromDate(fechaAltaDate),
      noSocio: noSocio?.toString() || null,
      renovacion2026: {
        estado: estadoRenovacion,
        fechaLimite: admin.firestore.Timestamp.fromDate(FECHA_LIMITE_PAGO),
        exento: estadoRenovacion === 'exento',
        motivoExencion: motivoExencion,
        fechaPago: null,
        montoPagado: null,
        comprobante: null
      }
    });
    
    const statusIcon = estadoRenovacion === 'exento' ? '⚪' : '🟡';
    console.log(`${statusIcon} ${nombre} - Alta: ${fechaAltaDate.toISOString().split('T')[0]} ${motivoExencion ? `(${motivoExencion})` : ''}`);
    actualizados++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Actualizados: ${actualizados} socios`);
  console.log(`❌ No encontrados en Firestore: ${noEncontrados.length}`);
  
  if (noEncontrados.length > 0) {
    console.log('\nSocios no encontrados:');
    noEncontrados.forEach(s => console.log(`   - ${s.nombre} (${s.email})`));
  }
  
  console.log(`\n⚪ Exentos por fecha (Q4 2025): ${exentosPorFecha.length}`);
  exentosPorFecha.forEach(s => console.log(`   - ${s.nombre} (${s.fechaAlta.toISOString().split('T')[0]})`));
  
  console.log(`\n⚪ Exentos por rol: ${Object.keys(SOCIOS_EXENTOS).length}`);
  Object.entries(SOCIOS_EXENTOS).forEach(([email, info]) => {
    console.log(`   - ${email} (${info.motivo})`);
  });
  
  // Resumen de cobranza
  const totalExentos = exentosPorFecha.length + Object.keys(SOCIOS_EXENTOS).length;
  const debenPagar = actualizados - totalExentos;
  
  console.log('\n' + '='.repeat(60));
  console.log('💰 RESUMEN DE COBRANZA 2026');
  console.log('='.repeat(60));
  console.log(`Total socios: ${actualizados}`);
  console.log(`Exentos: ${totalExentos}`);
  console.log(`Deben pagar: ${debenPagar}`);
  console.log(`Cuota anual: $6,500 MXN`);
  console.log(`Ingreso estimado: $${(debenPagar * 6500).toLocaleString()} MXN`);
  console.log(`Fecha límite: 28 de febrero 2026`);
}

importarFechasAlta()
  .then(() => {
    console.log('\n✅ Importación completada');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

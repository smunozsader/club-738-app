const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listarCitas() {
  const citasRef = db.collection('citas');
  const snapshot = await citasRef.get();
  
  console.log('\n=== CITAS EN FIRESTORE ===\n');
  console.log('Total:', snapshot.size, 'citas\n');
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const citas = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const fechaCita = new Date(data.fecha + 'T' + (data.hora || '00:00'));
    const esPasada = fechaCita < hoy;
    const esPrueba = (data.notas && data.notas.toLowerCase().includes('prueba')) || 
                     (data.proposito === 'otro' && data.notas && data.notas.toLowerCase().includes('test'));
    
    citas.push({
      id: doc.id,
      socio: data.socioNombre || data.socioEmail,
      email: data.socioEmail,
      fecha: data.fecha,
      hora: data.hora,
      proposito: data.proposito,
      estado: data.estado || 'pendiente',
      notas: data.notas || '',
      esPasada,
      esPrueba
    });
  });
  
  // Ordenar por fecha
  citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  
  console.log('# | ID | Socio | Fecha | Hora | Estado | Notas | Flags');
  console.log('--|----|----|----|----|----|----|----');
  
  citas.forEach((c, i) => {
    let flags = [];
    if (c.esPasada) flags.push('PASADA');
    if (c.esPrueba) flags.push('PRUEBA');
    const flagStr = flags.length > 0 ? flags.join(', ') : '-';
    const notasCortas = c.notas ? c.notas.substring(0, 15).replace(/\n/g, ' ') : '-';
    console.log(`${i+1} | ${c.id.substring(0,10)} | ${(c.socio || 'N/A').substring(0,25)} | ${c.fecha} | ${c.hora} | ${c.estado} | ${notasCortas} | ${flagStr}`);
  });
  
  const pasadas = citas.filter(c => c.esPasada);
  const pruebas = citas.filter(c => c.esPrueba);
  
  console.log('\n--- RESUMEN ---');
  console.log('Citas pasadas:', pasadas.length);
  console.log('Citas de prueba:', pruebas.length);
  
  const aBorrar = citas.filter(c => c.esPasada || c.esPrueba);
  if (aBorrar.length > 0) {
    console.log('\n--- IDs PARA BORRAR ---\n');
    aBorrar.forEach(c => {
      const flags = [];
      if (c.esPasada) flags.push('PASADA');
      if (c.esPrueba) flags.push('PRUEBA');
      console.log(`  ${c.id} (${c.fecha} ${c.hora}) - ${c.socio} [${flags.join(', ')}]`);
    });
  } else {
    console.log('\nNo hay citas para borrar.');
  }
  
  process.exit(0);
}

listarCitas().catch(e => { console.error(e); process.exit(1); });

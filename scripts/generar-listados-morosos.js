#!/usr/bin/env node
/**
 * Genera listados de pagados/pendientes 2026 
 * Marca específicamente a los morosos 2025 (no pagaron ni 2025 ni 2026)
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import xlsx from 'xlsx';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Emails de socios exentos (no son morosos)
const EXENTOS_EMAILS = [
  'smunozam@gmail.com',
  'richfegas@icloud.com',
  'gfernandez63@gmail.com',
  'richfer1020@gmail.com',
  'richfer0304@gmail.com',
  'jrgardoni@gmail.com',
  'arechiga@jogarplastics.com',
  'aimeegomez615@gmail.com'
];

// Leer Excel de pagos 2025
function leerPagos2025() {
  const workbook = xlsx.readFile('data/socios/2025. DONATIVOS Y relacion socios CLUB 738, con fecha de ingreso y antiguedad (para socio activo) y FEMETI (PETAS).xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  
  const pagos2025 = {};
  const morosos2025 = [];
  
  // Datos empiezan en fila 4 (índice 3)
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1]) continue;
    
    const nombreRaw = String(row[1]);
    const nombre = nombreRaw.replace(/^\d+\.\s*/, '').trim().toUpperCase();
    
    const donativo = row[8];
    
    if (donativo && donativo !== 'np' && !isNaN(donativo)) {
      pagos2025[nombre] = {
        donativo: Number(donativo),
        femeti: row[9] && !isNaN(row[9]) ? Number(row[9]) : 0
      };
    } else {
      morosos2025.push(nombre);
    }
  }
  
  return { pagos2025, morosos2025 };
}

function formatPhone(phone) {
  if (!phone) return 'Sin teléfono';
  return phone.toString().replace(/[^\d+]/g, '');
}

async function generarListados() {
  console.log('📊 Generando listados con morosos 2025 marcados...\n');
  
  const { pagos2025, morosos2025 } = leerPagos2025();
  console.log(`✅ Pagos 2025 cargados: ${Object.keys(pagos2025).length} pagaron`);
  console.log(`❌ Morosos 2025 en Excel: ${morosos2025.length}`);
  
  const sociosSnap = await db.collection('socios').get();
  
  const pagados2026 = [];
  const pendientes = [];
  let totalRecaudado = 0;

  sociosSnap.forEach(doc => {
    const data = doc.data();
    const nombre = (data.nombre || doc.id).toUpperCase();
    const email = doc.id.toLowerCase();
    const pagos = data.pagos || [];
    
    // Verificar si es exento
    const esExento = EXENTOS_EMAILS.includes(email);
    
    // Verificar si fue moroso 2025 (comparar por nombre)
    const esMoroso2025 = morosos2025.some(m => 
      m.toUpperCase().includes(nombre.substring(0, 20)) || 
      nombre.includes(m.toUpperCase().substring(0, 20))
    );
    
    // Buscar pago 2025 en Excel
    const pago2025 = pagos2025[nombre] || null;
    
    const socio = {
      email: doc.id,
      nombre: data.nombre || doc.id,
      telefono: data.telefono || data.celular || '',
      totalArmas: data.totalArmas || 0,
      pago2025: pago2025,
      esMoroso2025: esMoroso2025 && !esExento,
      esExento: esExento
    };

    // Buscar pagos de 2026 en Firebase
    // Incluye pagos de dic 2025 si tienen concepto "2026" (anticipados)
    const pagos2026 = pagos.filter(p => {
      if (!p.fecha) return false;
      const fecha = p.fecha._seconds ? new Date(p.fecha._seconds * 1000) : new Date(p.fecha);
      
      // Pago hecho en 2026
      if (fecha.getFullYear() === 2026) return true;
      
      // Pago anticipado (dic 2025 con concepto 2026)
      if (fecha.getFullYear() === 2025 && fecha.getMonth() === 11) {
        const conceptos = p.conceptos || [];
        const tieneConcepto2026 = conceptos.some(c => 
          (c.nombre || '').includes('2026') || (c.concepto || '').includes('2026')
        );
        if (tieneConcepto2026) return true;
      }
      
      return false;
    });

    if (pagos2026.length > 0) {
      const ultimoPago = pagos2026[pagos2026.length - 1];
      const total = ultimoPago.total || 0;
      const esExentoPago = ultimoPago.esExento || ultimoPago.metodoPago === 'exento';
      
      // Extraer conceptos desglosados
      const conceptos = ultimoPago.conceptos || {};
      
      // Extraer fecha de pago
      const fechaPagoRaw = ultimoPago.fecha;
      const fechaPago = fechaPagoRaw?._seconds 
        ? new Date(fechaPagoRaw._seconds * 1000) 
        : new Date(fechaPagoRaw);
      
      if (!esExentoPago) totalRecaudado += total;
      
      pagados2026.push({
        ...socio,
        totalPagado2026: total,
        conceptos: conceptos,
        fechaPago: fechaPago,
        esExento: esExentoPago,
        razonExento: ultimoPago.notas || ''
      });
    } else {
      pendientes.push(socio);
    }
  });

  // Separar pendientes en categorías
  const morososDobles = pendientes.filter(p => p.esMoroso2025);
  const soloFalta2026 = pendientes.filter(p => !p.esMoroso2025 && p.pago2025);
  const sinHistorial = pendientes.filter(p => !p.esMoroso2025 && !p.pago2025);

  // Ordenar
  morososDobles.sort((a, b) => b.totalArmas - a.totalArmas);
  soloFalta2026.sort((a, b) => b.totalArmas - a.totalArmas);
  sinHistorial.sort((a, b) => b.totalArmas - a.totalArmas);
  pagados2026.sort((a, b) => a.nombre.localeCompare(b.nombre));

  const fecha = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // ==================== MARKDOWN PAGADOS ====================
  // Calcular totales desglosados
  let totalInscripcion = 0;
  let totalCuota = 0;
  let totalFemeti = 0;
  
  pagados2026.filter(p => !p.esExento).forEach(s => {
    totalInscripcion += s.conceptos?.inscripcion || 0;
    totalCuota += s.conceptos?.anualidad || s.conceptos?.cuota || 0;
    totalFemeti += s.conceptos?.femeti || 0;
  });

  let mdPagados = `# ✅ Socios al Corriente 2026 - Club 738

**Fecha de corte:** ${fecha}  
**Total:** ${pagados2026.length} socios  

### 💵 Resumen Recaudación 2026

| Concepto | Monto |
|----------|-------|
| Inscripciones | $${totalInscripcion.toLocaleString('es-MX')} |
| Cuotas 2026 | $${totalCuota.toLocaleString('es-MX')} |
| FEMETI | $${totalFemeti.toLocaleString('es-MX')} |
| **TOTAL** | **$${totalRecaudado.toLocaleString('es-MX')}** |

---

## 💰 Socios que Pagaron (${pagados2026.filter(p => !p.esExento).length})

| # | Nombre | Fecha Pago | Inscripción | Cuota 2026 | FEMETI | Total |
|---|--------|------------|-------------|------------|--------|-------|
`;

  let idx = 1;
  pagados2026.filter(p => !p.esExento).forEach(s => {
    const fechaPagoStr = s.fechaPago ? s.fechaPago.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
    const inscripcion = s.conceptos?.inscripcion || 0;
    const cuota = s.conceptos?.anualidad || s.conceptos?.cuota || 0;
    const femeti = s.conceptos?.femeti || 0;
    const total = s.totalPagado2026;
    mdPagados += `| ${idx++} | ${s.nombre} | ${fechaPagoStr} | $${inscripcion.toLocaleString('es-MX')} | $${cuota.toLocaleString('es-MX')} | $${femeti.toLocaleString('es-MX')} | $${total.toLocaleString('es-MX')} |\n`;
  });

  mdPagados += `
---

## 🏅 Socios Exentos (${pagados2026.filter(p => p.esExento).length})

| # | Nombre | Teléfono | Email | Motivo |
|---|--------|----------|-------|--------|
`;

  idx = 1;
  pagados2026.filter(p => p.esExento).forEach(s => {
    const tel = formatPhone(s.telefono);
    mdPagados += `| ${idx++} | ${s.nombre} | ${tel} | ${s.email} | ${s.razonExento} |\n`;
  });

  mdPagados += `\n---\n\n*Generado automáticamente el ${fecha}*\n`;

  // ==================== MARKDOWN PENDIENTES ====================
  let mdPendientes = `# ❌ Socios con Pago Pendiente 2026 - Club 738

**Fecha de corte:** ${fecha}  
**Total pendientes:** ${pendientes.length} socios  

---

## 📊 Resumen por Categoría

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 **MOROSOS DOBLES** | ${morososDobles.length} | No pagaron 2025 NI 2026 |
| 🟡 Falta solo 2026 | ${soloFalta2026.length} | Pagaron 2025, falta 2026 |
| ⚪ Sin historial | ${sinHistorial.length} | Socios nuevos o sin registro previo |

---

## 🔴 MOROSOS DOBLES: No pagaron 2025 NI 2026 (${morososDobles.length})

⚠️ **ATENCIÓN ESPECIAL** - Estos socios no pagaron el año pasado y siguen sin pagar.  
📧 **Requieren comunicado especial.**

| # | Nombre | Armas | Teléfono | Email |
|---|--------|-------|----------|-------|
`;

  morososDobles.forEach((s, idx) => {
    const tel = formatPhone(s.telefono);
    mdPendientes += `| ${idx + 1} | **${s.nombre}** | ${s.totalArmas} | ${tel} | ${s.email} |\n`;
  });

  mdPendientes += `
---

## 🟡 Pagaron 2025, falta 2026 (${soloFalta2026.length})

Estos socios SÍ pagaron en 2025, solo falta su renovación 2026.

| # | Nombre | Armas | Pagó 2025 | Teléfono | Email |
|---|--------|-------|-----------|----------|-------|
`;

  soloFalta2026.forEach((s, idx) => {
    const tel = formatPhone(s.telefono);
    const pago25 = s.pago2025 ? `$${(s.pago2025.donativo + s.pago2025.femeti).toLocaleString('es-MX')}` : '-';
    mdPendientes += `| ${idx + 1} | ${s.nombre} | ${s.totalArmas} | ${pago25} | ${tel} | ${s.email} |\n`;
  });

  if (sinHistorial.length > 0) {
    mdPendientes += `
---

## ⚪ Sin historial de pago previo (${sinHistorial.length})

Socios sin registro de pago en 2025 (pueden ser nuevos o sin datos migrados).

| # | Nombre | Armas | Teléfono | Email |
|---|--------|-------|----------|-------|
`;

    sinHistorial.forEach((s, idx) => {
      const tel = formatPhone(s.telefono);
      mdPendientes += `| ${idx + 1} | ${s.nombre} | ${s.totalArmas} | ${tel} | ${s.email} |\n`;
    });
  }

  // Separar listas por tipo de comunicado
  const morososDoblesEmails = morososDobles.map(s => s.email);
  const soloFalta2026ConArmas = soloFalta2026.filter(s => s.totalArmas > 0);
  const soloFalta2026SinArmas = soloFalta2026.filter(s => s.totalArmas === 0);
  // También incluir sin historial que no tienen armas
  const sinArmasTotal = [...soloFalta2026SinArmas, ...sinHistorial.filter(s => s.totalArmas === 0)];

  mdPendientes += `
---

## 📋 LISTAS DE EMAILS PARA COMUNICADOS

### 1️⃣ Morosos Dobles 2025+2026 (${morososDobles.length})

⚠️ **COMUNICADO URGENTE** - No pagaron 2025 NI 2026

\`\`\`
${morososDoblesEmails.join(',\n')}
\`\`\`

---

### 2️⃣ Solo Adeudan 2026 - CON ARMAS (${soloFalta2026ConArmas.length})

📧 **RECORDATORIO** - Pagaron 2025, solo falta renovación 2026

\`\`\`
${soloFalta2026ConArmas.map(s => s.email).join(',\n')}
\`\`\`

---

### 3️⃣ Morosos 2026 - SIN ARMAS (${sinArmasTotal.length})

🤝 **APOYO EN GESTIÓN** - No tienen armas registradas, ofrecer apoyo en solicitud de compra

\`\`\`
${sinArmasTotal.map(s => s.email).join(',\n')}
\`\`\`

---

*Generado automáticamente el ${fecha}*
`;

  // Guardar archivos
  writeFileSync('./docs/SOCIOS_PAGADOS_2026.md', mdPagados);
  writeFileSync('./docs/SOCIOS_PENDIENTES_2026.md', mdPendientes);

  console.log('\n✅ Archivos actualizados:');
  console.log('   📄 docs/SOCIOS_PAGADOS_2026.md');
  console.log('   📄 docs/SOCIOS_PENDIENTES_2026.md');
  console.log(`\n📊 Resumen de pendientes:`);
  console.log(`   🔴 Morosos dobles (2025+2026): ${morososDobles.length}`);
  console.log(`   🟡 Solo falta 2026: ${soloFalta2026.length}`);
  console.log(`   ⚪ Sin historial: ${sinHistorial.length}`);

  await admin.app().delete();
}

generarListados();

#!/usr/bin/env node
/**
 * Genera listados de pagados/pendientes 2026 
 * Incluye info de pago 2025 del Excel
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import xlsx from 'xlsx';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Leer Excel de pagos 2025
function leerPagos2025() {
  const workbook = xlsx.readFile('data/socios/2025. DONATIVOS Y relacion socios CLUB 738, con fecha de ingreso y antiguedad (para socio activo) y FEMETI (PETAS).xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  
  const pagos2025 = {};
  
  // Datos empiezan en fila 4 (índice 3)
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1]) continue;
    
    const nombreRaw = String(row[1]);
    // Limpiar nombre (quitar número inicial como "1. ")
    const nombre = nombreRaw.replace(/^\d+\.\s*/, '').trim().toUpperCase();
    
    const donativo = row[8];
    const femeti = row[9];
    
    if (donativo && donativo !== 'np' && !isNaN(donativo)) {
      pagos2025[nombre] = {
        donativo: Number(donativo),
        femeti: femeti && !isNaN(femeti) ? Number(femeti) : 0,
        total: Number(donativo) + (femeti && !isNaN(femeti) ? Number(femeti) : 0)
      };
    }
  }
  
  return pagos2025;
}

function formatPhone(phone) {
  if (!phone) return 'Sin teléfono';
  return phone.toString().replace(/[^\d+]/g, '');
}

async function generarListados() {
  console.log('📊 Generando listados con info de pagos 2025...\n');
  
  // Leer pagos 2025 del Excel
  const pagos2025 = leerPagos2025();
  console.log(`✅ Pagos 2025 cargados: ${Object.keys(pagos2025).length} socios`);
  
  const sociosSnap = await db.collection('socios').get();
  
  const pagados2026 = [];
  const pendientes = [];
  let totalRecaudado = 0;

  sociosSnap.forEach(doc => {
    const data = doc.data();
    const nombre = (data.nombre || doc.id).toUpperCase();
    const pagos = data.pagos || [];
    
    // Buscar pago 2025 en Excel (por nombre)
    const pago2025 = pagos2025[nombre] || null;
    
    const socio = {
      email: doc.id,
      nombre: data.nombre || doc.id,
      telefono: data.telefono || data.celular || '',
      totalArmas: data.totalArmas || 0,
      pago2025: pago2025,
      membresia2026: data.membresia2026 || null
    };

    // Buscar pagos de 2026 en Firebase
    const pagos2026 = pagos.filter(p => {
      if (!p.fecha) return false;
      const fecha = p.fecha._seconds ? new Date(p.fecha._seconds * 1000) : new Date(p.fecha);
      return fecha.getFullYear() === 2026;
    });

    if (pagos2026.length > 0) {
      const ultimoPago = pagos2026[pagos2026.length - 1];
      const total = ultimoPago.total || 0;
      const esExento = ultimoPago.esExento || ultimoPago.metodoPago === 'exento';
      
      if (!esExento) totalRecaudado += total;
      
      pagados2026.push({
        ...socio,
        totalPagado2026: total,
        esExento,
        razonExento: ultimoPago.notas || socio.membresia2026?.razon || '',
        fechaPago2026: ultimoPago.fecha
      });
    } else {
      pendientes.push(socio);
    }
  });

  // Ordenar pendientes: primero los que SÍ pagaron 2025 (más prioritarios)
  pendientes.sort((a, b) => {
    // Primero por si pagaron 2025
    const aPago2025 = a.pago2025 ? 1 : 0;
    const bPago2025 = b.pago2025 ? 1 : 0;
    if (bPago2025 !== aPago2025) return bPago2025 - aPago2025;
    // Luego por cantidad de armas
    return b.totalArmas - a.totalArmas;
  });

  pagados2026.sort((a, b) => a.nombre.localeCompare(b.nombre));

  const fecha = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // ==================== MARKDOWN PAGADOS ====================
  let mdPagados = `# ✅ Socios al Corriente 2026 - Club 738

**Fecha de corte:** ${fecha}  
**Total:** ${pagados2026.length} socios  
**Recaudado 2026:** $${totalRecaudado.toLocaleString('es-MX')} MXN

---

## 💰 Socios que Pagaron (${pagados2026.filter(p => !p.esExento).length})

| # | Nombre | Teléfono | Email | Monto 2026 |
|---|--------|----------|-------|------------|
`;

  let idx = 1;
  pagados2026.filter(p => !p.esExento).forEach(s => {
    const tel = formatPhone(s.telefono);
    const monto = `$${s.totalPagado2026.toLocaleString('es-MX')}`;
    mdPagados += `| ${idx++} | ${s.nombre} | ${tel} | ${s.email} | ${monto} |\n`;
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
  const pagaron2025 = pendientes.filter(p => p.pago2025);
  const noPagaron2025 = pendientes.filter(p => !p.pago2025);

  let mdPendientes = `# ❌ Socios con Pago Pendiente 2026 - Club 738

**Fecha de corte:** ${fecha}  
**Total pendientes:** ${pendientes.length} socios  

## 📊 Resumen
- **Pagaron 2025, NO han pagado 2026:** ${pagaron2025.length} socios ← 🔥 PRIORIDAD
- **No pagaron 2025 NI 2026:** ${noPagaron2025.length} socios

---

## 🔥 PRIORIDAD MÁXIMA: Pagaron 2025, pendientes 2026 (${pagaron2025.length})

Estos socios SÍ pagaron en 2025, por lo que están activos y deberían renovar.

| # | Nombre | Armas | Pagó 2025 | Teléfono | Email |
|---|--------|-------|-----------|----------|-------|
`;

  pagaron2025.forEach((s, idx) => {
    const tel = formatPhone(s.telefono);
    const pago25 = s.pago2025 ? `$${s.pago2025.total.toLocaleString('es-MX')}` : '-';
    mdPendientes += `| ${idx + 1} | ${s.nombre} | ${s.totalArmas} | ${pago25} | ${tel} | ${s.email} |\n`;
  });

  mdPendientes += `
---

## ⚠️ No pagaron 2025 ni 2026 (${noPagaron2025.length})

Estos socios NO pagaron en 2025. Verificar si siguen activos.

| # | Nombre | Armas | Teléfono | Email |
|---|--------|-------|----------|-------|
`;

  noPagaron2025.forEach((s, idx) => {
    const tel = formatPhone(s.telefono);
    mdPendientes += `| ${idx + 1} | ${s.nombre} | ${s.totalArmas} | ${tel} | ${s.email} |\n`;
  });

  mdPendientes += `\n---\n\n*Generado automáticamente el ${fecha}*\n`;

  // Guardar archivos
  writeFileSync('./docs/SOCIOS_PAGADOS_2026.md', mdPagados);
  writeFileSync('./docs/SOCIOS_PENDIENTES_2026.md', mdPendientes);

  console.log('\n✅ Archivos actualizados:');
  console.log('   📄 docs/SOCIOS_PAGADOS_2026.md');
  console.log('   📄 docs/SOCIOS_PENDIENTES_2026.md');
  console.log(`\n📊 Resumen:`);
  console.log(`   - Pagados 2026: ${pagados2026.length}`);
  console.log(`   - Pendientes 2026: ${pendientes.length}`);
  console.log(`     └─ Pagaron 2025: ${pagaron2025.length} (PRIORIDAD)`);
  console.log(`     └─ No pagaron 2025: ${noPagaron2025.length}`);

  await admin.app().delete();
}

generarListados();

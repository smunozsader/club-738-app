#!/usr/bin/env node
/**
 * Genera dos archivos Markdown con listados de pagados y pendientes
 * Incluye datos de contacto (teléfono y email)
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function formatDate(timestamp) {
  if (!timestamp) return 'Sin fecha';
  const d = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPhone(phone) {
  if (!phone) return 'Sin teléfono';
  return phone.toString().replace(/[^\d+]/g, '');
}

async function generarMarkdowns() {
  console.log('📝 Generando archivos Markdown...\n');

  const sociosSnap = await db.collection('socios').get();
  
  const pagados = [];
  const pendientes = [];
  let totalRecaudado = 0;

  sociosSnap.forEach(doc => {
    const data = doc.data();
    const socio = {
      email: doc.id,
      nombre: data.nombre || doc.id,
      telefono: data.telefono || data.celular || data.phone || '',
      pagos: data.pagos || [],
      membresia2026: data.membresia2026 || null,
      totalArmas: data.totalArmas || 0
    };

    // Buscar pagos de 2026
    const pagos2026 = socio.pagos.filter(p => {
      if (!p.fecha) return false;
      const fecha = p.fecha._seconds ? new Date(p.fecha._seconds * 1000) : new Date(p.fecha);
      return fecha.getFullYear() === 2026;
    });

    if (pagos2026.length > 0) {
      const ultimoPago = pagos2026[pagos2026.length - 1];
      const total = ultimoPago.total || ultimoPago.conceptos?.reduce((s, c) => s + (c.monto || 0), 0) || 0;
      const esExento = ultimoPago.esExento || ultimoPago.metodoPago === 'exento';
      
      if (!esExento) {
        totalRecaudado += total;
      }
      
      pagados.push({
        ...socio,
        ultimoPago: ultimoPago,
        totalPagado: total,
        fechaPago: ultimoPago.fecha,
        esExento: esExento,
        razonExento: ultimoPago.notas || socio.membresia2026?.razon || ''
      });
    } else {
      pendientes.push(socio);
    }
  });

  // Ordenar
  pagados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  pendientes.sort((a, b) => b.totalArmas - a.totalArmas); // Por prioridad (más armas primero)

  const fecha = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // ==================== MARKDOWN PAGADOS ====================
  let mdPagados = `# ✅ Socios al Corriente 2026 - Club 738

**Fecha de corte:** ${fecha}  
**Total:** ${pagados.length} socios  
**Recaudado:** $${totalRecaudado.toLocaleString('es-MX')} MXN

---

## 💰 Socios que Pagaron (${pagados.filter(p => !p.esExento).length})

| # | Nombre | Teléfono | Email | Fecha Pago | Monto |
|---|--------|----------|-------|------------|-------|
`;

  let idx = 1;
  pagados.filter(p => !p.esExento).forEach(s => {
    const fecha = formatDate(s.fechaPago);
    const tel = formatPhone(s.telefono);
    const monto = `$${s.totalPagado.toLocaleString('es-MX')}`;
    mdPagados += `| ${idx++} | ${s.nombre} | ${tel} | ${s.email} | ${fecha} | ${monto} |\n`;
  });

  mdPagados += `
---

## 🏅 Socios Exentos (${pagados.filter(p => p.esExento).length})

| # | Nombre | Teléfono | Email | Motivo |
|---|--------|----------|-------|--------|
`;

  idx = 1;
  pagados.filter(p => p.esExento).forEach(s => {
    const tel = formatPhone(s.telefono);
    mdPagados += `| ${idx++} | ${s.nombre} | ${tel} | ${s.email} | ${s.razonExento} |\n`;
  });

  mdPagados += `
---

*Generado automáticamente el ${fecha}*
`;

  // ==================== MARKDOWN PENDIENTES ====================
  let mdPendientes = `# ❌ Socios con Pago Pendiente 2026 - Club 738

**Fecha de corte:** ${fecha}  
**Total pendientes:** ${pendientes.length} socios  
**Ordenado por:** Cantidad de armas (prioridad de cobro)

---

## 📋 Lista de Contacto (ordenada por prioridad)

| # | Nombre | Armas | Teléfono | Email |
|---|--------|-------|----------|-------|
`;

  pendientes.forEach((s, idx) => {
    const tel = formatPhone(s.telefono);
    mdPendientes += `| ${idx + 1} | ${s.nombre} | ${s.totalArmas} | ${tel} | ${s.email} |\n`;
  });

  // Separar por categorías
  const conArmas = pendientes.filter(p => p.totalArmas > 0);
  const sinArmas = pendientes.filter(p => p.totalArmas === 0);

  mdPendientes += `
---

## 🔥 Prioridad Alta (8+ armas) - ${conArmas.filter(p => p.totalArmas >= 8).length} socios

| Nombre | Armas | Teléfono | Email |
|--------|-------|----------|-------|
`;

  conArmas.filter(p => p.totalArmas >= 8).forEach(s => {
    mdPendientes += `| ${s.nombre} | ${s.totalArmas} | ${formatPhone(s.telefono)} | ${s.email} |\n`;
  });

  mdPendientes += `
---

## ⚠️ Prioridad Media (4-7 armas) - ${conArmas.filter(p => p.totalArmas >= 4 && p.totalArmas < 8).length} socios

| Nombre | Armas | Teléfono | Email |
|--------|-------|----------|-------|
`;

  conArmas.filter(p => p.totalArmas >= 4 && p.totalArmas < 8).forEach(s => {
    mdPendientes += `| ${s.nombre} | ${s.totalArmas} | ${formatPhone(s.telefono)} | ${s.email} |\n`;
  });

  mdPendientes += `
---

## 📌 Prioridad Normal (1-3 armas) - ${conArmas.filter(p => p.totalArmas >= 1 && p.totalArmas < 4).length} socios

| Nombre | Armas | Teléfono | Email |
|--------|-------|----------|-------|
`;

  conArmas.filter(p => p.totalArmas >= 1 && p.totalArmas < 4).forEach(s => {
    mdPendientes += `| ${s.nombre} | ${s.totalArmas} | ${formatPhone(s.telefono)} | ${s.email} |\n`;
  });

  mdPendientes += `
---

## ❓ Sin armas registradas - ${sinArmas.length} socios

| Nombre | Teléfono | Email |
|--------|----------|-------|
`;

  sinArmas.forEach(s => {
    mdPendientes += `| ${s.nombre} | ${formatPhone(s.telefono)} | ${s.email} |\n`;
  });

  mdPendientes += `
---

*Generado automáticamente el ${fecha}*
`;

  // Guardar archivos
  writeFileSync('./docs/SOCIOS_PAGADOS_2026.md', mdPagados);
  writeFileSync('./docs/SOCIOS_PENDIENTES_2026.md', mdPendientes);

  console.log('✅ Archivos generados:');
  console.log('   📄 docs/SOCIOS_PAGADOS_2026.md');
  console.log('   📄 docs/SOCIOS_PENDIENTES_2026.md');

  await admin.app().delete();
}

generarMarkdowns();

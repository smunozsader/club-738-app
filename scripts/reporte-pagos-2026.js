#!/usr/bin/env node
/**
 * Reporte de Estatus de Pagos 2026
 * Genera un informe completo del estado de membresías
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccountRaw = readFileSync(new URL('./serviceAccountKey.json', import.meta.url));
const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function generarReportePagos() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('     📊 REPORTE DE ESTATUS DE PAGOS 2026 - CLUB 738');
  console.log('     📅 Fecha: ' + new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }));
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    const sociosSnap = await db.collection('socios').get();
    
    const socios = [];
    const pagados = [];
    const pendientes = [];
    const parciales = [];
    const sinInfo = [];

    sociosSnap.forEach(doc => {
      const data = doc.data();
      const socio = {
        email: doc.id,
        nombre: data.nombre || doc.id,
        membresia2026: data.membresia2026 || null,
        pagos: data.pagos || [],
        fechaAlta: data.fechaAlta,
        totalArmas: data.totalArmas || 0
      };
      socios.push(socio);

      // Clasificar por estado de membresía 2026
      if (socio.membresia2026) {
        const estado = socio.membresia2026.estado?.toLowerCase();
        if (estado === 'pagado' || estado === 'activo') {
          pagados.push(socio);
        } else if (estado === 'parcial') {
          parciales.push(socio);
        } else if (estado === 'pendiente') {
          pendientes.push(socio);
        } else {
          sinInfo.push(socio);
        }
      } else {
        sinInfo.push(socio);
      }
    });

    // Ordenar por nombre
    pagados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    pendientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
    parciales.sort((a, b) => a.nombre.localeCompare(b.nombre));
    sinInfo.sort((a, b) => a.nombre.localeCompare(b.nombre));

    // Calcular totales recaudados
    let totalRecaudado = 0;
    pagados.forEach(s => {
      if (s.membresia2026?.monto) {
        totalRecaudado += s.membresia2026.monto;
      }
    });
    parciales.forEach(s => {
      if (s.membresia2026?.monto) {
        totalRecaudado += s.membresia2026.monto;
      }
    });

    // Resumen ejecutivo
    console.log('📈 RESUMEN EJECUTIVO');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`   Total de socios: ${socios.length}`);
    console.log(`   ✅ Pagados:      ${pagados.length} (${((pagados.length/socios.length)*100).toFixed(1)}%)`);
    console.log(`   ⏳ Pendientes:   ${pendientes.length} (${((pendientes.length/socios.length)*100).toFixed(1)}%)`);
    console.log(`   🔶 Parciales:    ${parciales.length} (${((parciales.length/socios.length)*100).toFixed(1)}%)`);
    console.log(`   ❓ Sin registro: ${sinInfo.length} (${((sinInfo.length/socios.length)*100).toFixed(1)}%)`);
    console.log(`   💰 Total recaudado: $${totalRecaudado.toLocaleString('es-MX')} MXN`);
    console.log('─────────────────────────────────────────────────────────────────\n');

    // Detalle de pagados
    if (pagados.length > 0) {
      console.log('✅ SOCIOS CON MEMBRESÍA 2026 PAGADA');
      console.log('════════════════════════════════════════════════════════════════════');
      pagados.forEach((s, idx) => {
        const fecha = s.membresia2026?.fechaPago 
          ? (s.membresia2026.fechaPago.toDate?.() || new Date(s.membresia2026.fechaPago)).toLocaleDateString('es-MX')
          : 'Sin fecha';
        const monto = s.membresia2026?.monto ? `$${s.membresia2026.monto.toLocaleString('es-MX')}` : 'Sin monto';
        console.log(`${String(idx + 1).padStart(2, '0')}. ${s.nombre.padEnd(35)} | ${fecha.padEnd(12)} | ${monto}`);
      });
      console.log('');
    }

    // Detalle de parciales
    if (parciales.length > 0) {
      console.log('🔶 SOCIOS CON PAGO PARCIAL');
      console.log('════════════════════════════════════════════════════════════════════');
      parciales.forEach((s, idx) => {
        const monto = s.membresia2026?.monto ? `$${s.membresia2026.monto.toLocaleString('es-MX')}` : 'Sin monto';
        const notas = s.membresia2026?.notas || '';
        console.log(`${String(idx + 1).padStart(2, '0')}. ${s.nombre.padEnd(35)} | Abonado: ${monto}`);
        if (notas) console.log(`    📝 ${notas}`);
      });
      console.log('');
    }

    // Detalle de pendientes
    if (pendientes.length > 0) {
      console.log('⏳ SOCIOS CON PAGO PENDIENTE (MEMBRESIA REGISTRADA)');
      console.log('════════════════════════════════════════════════════════════════════');
      pendientes.forEach((s, idx) => {
        console.log(`${String(idx + 1).padStart(2, '0')}. ${s.nombre.padEnd(35)} | ${s.email}`);
      });
      console.log('');
    }

    // Detalle de sin información
    if (sinInfo.length > 0) {
      console.log('❓ SOCIOS SIN REGISTRO DE MEMBRESÍA 2026 (REQUIEREN ATENCIÓN)');
      console.log('════════════════════════════════════════════════════════════════════');
      sinInfo.forEach((s, idx) => {
        const armas = s.totalArmas > 0 ? `${s.totalArmas} armas` : 'Sin armas';
        console.log(`${String(idx + 1).padStart(2, '0')}. ${s.nombre.padEnd(35)} | ${armas.padEnd(10)} | ${s.email}`);
      });
      console.log('');
    }

    // Meta y progreso
    const metaMembresías = socios.length;
    const completados = pagados.length;
    const porcentajeMeta = ((completados / metaMembresías) * 100).toFixed(1);
    
    console.log('🎯 PROGRESO HACIA META');
    console.log('═══════════════════════════════════════════════════════════════════');
    const barraLlena = Math.round(porcentajeMeta / 5);
    const barraVacia = 20 - barraLlena;
    console.log(`   [${'█'.repeat(barraLlena)}${'░'.repeat(barraVacia)}] ${porcentajeMeta}%`);
    console.log(`   ${completados} de ${metaMembresías} socios al corriente`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await admin.app().delete();
  }
}

generarReportePagos();

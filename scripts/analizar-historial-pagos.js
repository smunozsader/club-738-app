#!/usr/bin/env node
/**
 * Analiza historial de pagos de socios pendientes 2026
 * Muestra cuándo fue su último pago registrado
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function formatDate(timestamp) {
  if (!timestamp) return null;
  const d = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
  return d;
}

async function analizarHistorialPagos() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('     📊 ANÁLISIS HISTORIAL DE PAGOS - SOCIOS PENDIENTES 2026');
  console.log('     📅 Fecha: ' + new Date().toLocaleDateString('es-MX'));
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const sociosSnap = await db.collection('socios').get();
  
  const pendientesConHistorial = [];
  const pendientesSinHistorial = [];

  sociosSnap.forEach(doc => {
    const data = doc.data();
    const pagos = data.pagos || [];
    
    // Verificar si tiene pago 2026
    const pagos2026 = pagos.filter(p => {
      if (!p.fecha) return false;
      const fecha = formatDate(p.fecha);
      return fecha && fecha.getFullYear() === 2026;
    });

    // Si NO tiene pago 2026, es pendiente
    if (pagos2026.length === 0) {
      // Buscar pagos anteriores (no 2026)
      const pagosAnteriores = pagos.filter(p => {
        if (!p.fecha) return false;
        const fecha = formatDate(p.fecha);
        return fecha && fecha.getFullYear() < 2026;
      });

      const socioInfo = {
        email: doc.id,
        nombre: data.nombre || doc.id,
        telefono: data.telefono || '',
        totalArmas: data.totalArmas || 0,
        fechaAlta: data.fechaAlta ? formatDate(data.fechaAlta) : null,
        pagosAnteriores: pagosAnteriores.map(p => ({
          fecha: formatDate(p.fecha),
          total: p.total || 0,
          conceptos: p.conceptos?.map(c => c.nombre || c.concepto).join(', ') || ''
        })).sort((a, b) => b.fecha - a.fecha) // Más reciente primero
      };

      if (pagosAnteriores.length > 0) {
        socioInfo.ultimoPago = socioInfo.pagosAnteriores[0];
        pendientesConHistorial.push(socioInfo);
      } else {
        pendientesSinHistorial.push(socioInfo);
      }
    }
  });

  // Ordenar por fecha de último pago (más antiguo primero = más moroso)
  pendientesConHistorial.sort((a, b) => {
    if (!a.ultimoPago?.fecha) return 1;
    if (!b.ultimoPago?.fecha) return -1;
    return a.ultimoPago.fecha - b.ultimoPago.fecha;
  });

  pendientesSinHistorial.sort((a, b) => b.totalArmas - a.totalArmas);

  console.log('📈 RESUMEN');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`   Pendientes con historial de pagos: ${pendientesConHistorial.length}`);
  console.log(`   Pendientes SIN historial de pagos: ${pendientesSinHistorial.length}`);
  console.log(`   Total pendientes: ${pendientesConHistorial.length + pendientesSinHistorial.length}`);
  console.log('─────────────────────────────────────────────────────────────────\n');

  if (pendientesConHistorial.length > 0) {
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('📜 SOCIOS PENDIENTES CON HISTORIAL DE PAGOS (ordenados por antigüedad)');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('No. | Nombre                                | Último Pago  | Monto    | Armas');
    console.log('────┼───────────────────────────────────────┼──────────────┼──────────┼──────');

    pendientesConHistorial.forEach((s, idx) => {
      const fechaStr = s.ultimoPago.fecha 
        ? s.ultimoPago.fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
        : 'N/A';
      const monto = `$${s.ultimoPago.total.toLocaleString('es-MX')}`;
      console.log(`${String(idx + 1).padStart(2)}  │ ${s.nombre.substring(0,37).padEnd(37)} │ ${fechaStr.padEnd(12)} │ ${monto.padEnd(8)} │ ${s.totalArmas}`);
    });

    // Análisis por año
    console.log('\n📊 DESGLOSE POR AÑO DE ÚLTIMO PAGO:');
    const porAnio = {};
    pendientesConHistorial.forEach(s => {
      if (s.ultimoPago?.fecha) {
        const anio = s.ultimoPago.fecha.getFullYear();
        porAnio[anio] = (porAnio[anio] || 0) + 1;
      }
    });
    Object.keys(porAnio).sort().forEach(anio => {
      console.log(`   ${anio}: ${porAnio[anio]} socios`);
    });
  }

  if (pendientesSinHistorial.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('❓ SOCIOS PENDIENTES SIN HISTORIAL DE PAGOS EN FIREBASE');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('No. | Nombre                                | Armas | Fecha Alta   | Email');
    console.log('────┼───────────────────────────────────────┼───────┼──────────────┼──────────────────');

    pendientesSinHistorial.forEach((s, idx) => {
      const fechaAlta = s.fechaAlta 
        ? s.fechaAlta.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
        : 'N/A';
      console.log(`${String(idx + 1).padStart(2)}  │ ${s.nombre.substring(0,37).padEnd(37)} │ ${String(s.totalArmas).padStart(3)}   │ ${fechaAlta.padEnd(12)} │ ${s.email.substring(0,18)}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('📌 FIN DEL ANÁLISIS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  await admin.app().delete();
}

analizarHistorialPagos();

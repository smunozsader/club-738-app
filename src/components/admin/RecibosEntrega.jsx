import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useToastContext } from '../../contexts/ToastContext';
import './RecibosEntrega.css';

/**
 * RecibosEntrega - Reporte de entregas de efectivo
 * 
 * Permite al secretario:
 * - Ver cuánto dinero recibió cada persona (presidente, Elena Torres, etc)
 * - Generar un reporte de ENTREGA/RECIBO de efectivo
 * - Marcar entregas como completadas
 * - Print-out para archivo
 */

export default function RecibosEntrega({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [recibos, setRecibos] = useState({});
  const [filtroPersona, setFiltroPersona] = useState('todas'); // todas, secretario, presidente, elena_torres, otro
  const toast = useToastContext();

  useEffect(() => {
    generarRecibos();
  }, []);

  async function generarRecibos() {
    try {
      setLoading(true);
      const sociosSnapshot = await getDocs(collection(db, 'socios'));
      
      const sociosPagados = [];

      for (const socioDoc of sociosSnapshot.docs) {
        const email = socioDoc.id;
        const socioData = socioDoc.data();
        
        // Solo incluir socios que pagaron en 2026
        if (socioData.renovacion2026 && socioData.renovacion2026.estado === 'pagado') {
          const pago = socioData.renovacion2026;
          
          // Extraer detalles de pago
          let detallesPago = { inscripcion: 0, anualidad: 0, femeti: 0, total: 0 };
          
          if (pago.desglose) {
            detallesPago.inscripcion = pago.desglose.inscripcion || 0;
            detallesPago.anualidad = pago.desglose.anualidad || pago.desglose.cuota_anual || 0;
            detallesPago.femeti = pago.desglose.femeti || 0;
            detallesPago.total = pago.montoTotal || pago.monto || 0;
          } else if (pago.monto && pago.monto > 0) {
            detallesPago.total = pago.monto;
            if (pago.cuotaClub) detallesPago.anualidad = pago.cuotaClub;
            if (pago.cuotaFemeti) detallesPago.femeti = pago.cuotaFemeti;
          }

          const fechaPago = pago.fechaPago ? new Date(pago.fechaPago.toDate()).toLocaleDateString('es-MX') : 'N/A';
          const noSocio = socioData.numeroCredencial || socioData.credencial || socioData.numero_socio || 'N/A';
          const noConsecutivo = socioData.numero_consecutivo || socioData.noConsecutivo || 'N/A';

          sociosPagados.push({
            nombre: socioData.nombre || 'N/A',
            telefono: socioData.telefono || 'N/A',
            email: email,
            noSocio,
            noConsecutivo,
            fechaPago,
            inscripcion: detallesPago.inscripcion,
            cuota: detallesPago.anualidad,
            femeti: detallesPago.femeti,
            total: detallesPago.total,
            recibidoPor: pago.recibidoPor || 'secretario',
            recibidoPorNombre: pago.recibidoPorNombre || 'Secretario',
          });
        }
      }

      // Ordenar por apellido del socio
      sociosPagados.sort((a, b) => a.nombre.localeCompare(b.nombre));

      setRecibos(sociosPagados);
      toast?.showToast('Reporte generado ✓', 'success', 2000);
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast?.showToast('Error al generar reporte', 'error');
    } finally {
      setLoading(false);
    }
  }

  function imprimirRecibo() {
    if (!recibos || recibos.length === 0) return;

    const totalInscripcion = recibos.reduce((sum, r) => sum + (r.inscripcion || 0), 0);
    const totalCuota = recibos.reduce((sum, r) => sum + (r.cuota || 0), 0);
    const totalFemeti = recibos.reduce((sum, r) => sum + (r.femeti || 0), 0);
    const totalGeneral = recibos.reduce((sum, r) => sum + (r.total || 0), 0);

    const contenido = `
╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                           REPORTE DE SOCIOS PAGADOS 2026 - CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.              ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

GENERADO: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
TOTAL DE SOCIOS PAGADOS: ${recibos.length}
MONTO TOTAL RECAUDADO: $${totalGeneral.toLocaleString('es-MX')} MXN

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

TABLA DE PAGOS 2026

${['Nombre', 'Teléfono', 'Email', 'No. Socio', 'No. Cons.', 'Fecha Pago', 'Inscripción', 'Cuota 2026', 'FEMETI 2026', 'Total'].map(h => h.padEnd(15)).join('│')}
${Array(150).fill('─').join('')}
${recibos.map(r => 
  [
    r.nombre.substring(0, 15).padEnd(15),
    (r.telefono || 'N/A').substring(0, 15).padEnd(15),
    r.email.substring(0, 15).padEnd(15),
    r.noSocio.toString().substring(0, 15).padEnd(15),
    r.noConsecutivo.toString().substring(0, 15).padEnd(15),
    r.fechaPago.substring(0, 15).padEnd(15),
    '$' + r.inscripcion.toLocaleString('es-MX').substring(0, 14).padEnd(14),
    '$' + r.cuota.toLocaleString('es-MX').substring(0, 14).padEnd(14),
    '$' + r.femeti.toLocaleString('es-MX').substring(0, 14).padEnd(14),
    '$' + r.total.toLocaleString('es-MX').substring(0, 14).padEnd(14),
  ].join('│')
).join('\n')}
${Array(150).fill('─').join('')}

TOTALES:
  Inscripción 2026: $${totalInscripcion.toLocaleString('es-MX')} MXN
  Cuota 2026:      $${totalCuota.toLocaleString('es-MX')} MXN
  FEMETI 2026:     $${totalFemeti.toLocaleString('es-MX')} MXN
  ─────────────────────────────────
  TOTAL GENERAL:   $${totalGeneral.toLocaleString('es-MX')} MXN

════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

NOTAS:
- Este reporte NO incluye pagos del año 2025
- Los datos se actualizan automáticamente desde Firestore
- Guardar este reporte como archivo de referencia
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head>
          <title>Reporte de Socios Pagados 2026</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              line-height: 1.5;
              background: #f5f5f5;
            }
            pre { 
              white-space: pre-wrap; 
              word-wrap: break-word;
              background: white;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            @media print {
              button { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <pre>${contenido}</pre>
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin: 20px;">🖨️ Imprimir / Guardar como PDF</button>
        </body>
      </html>
    `);
    ventana.document.close();
  }

  if (loading) {
    return <div className="recibos-container"><p>Generando reporte de socios pagados...</p></div>;
  }

  const totalInscripcion = recibos.reduce((sum, r) => sum + (r.inscripcion || 0), 0);
  const totalCuota = recibos.reduce((sum, r) => sum + (r.cuota || 0), 0);
  const totalFemeti = recibos.reduce((sum, r) => sum + (r.femeti || 0), 0);
  const totalGeneral = recibos.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div className="recibos-container">
      <div className="recibos-header">
        <h2>📋 Reporte de Socios Pagados 2026</h2>
        <p>Tabla detallada de pagos - Inscripción, Cuota y FEMETI</p>
        <button className="btn-volver" onClick={onBack}>← Volver</button>
      </div>

      {/* RESUMEN GENERAL */}
      <section className="resumen-entregas">
        <h3>RESUMEN GENERAL</h3>
        <div className="resumen-cards">
          <div className="resumen-card">
            <div className="numero">{recibos.length}</div>
            <div className="label">Total de Socios Pagados</div>
          </div>
          <div className="resumen-card">
            <div className="numero">${totalInscripcion.toLocaleString('es-MX')}</div>
            <div className="label">Total Inscripciones 2026</div>
          </div>
          <div className="resumen-card">
            <div className="numero">${totalCuota.toLocaleString('es-MX')}</div>
            <div className="label">Total Cuotas 2026</div>
          </div>
          <div className="resumen-card">
            <div className="numero">${totalFemeti.toLocaleString('es-MX')}</div>
            <div className="label">Total FEMETI 2026</div>
          </div>
          <div className="resumen-card highlight">
            <div className="numero">${totalGeneral.toLocaleString('es-MX')}</div>
            <div className="label">TOTAL GENERAL</div>
          </div>
        </div>
      </section>

      {/* TABLA DE PAGOS */}
      <section className="tabla-seccion">
        <h3>📊 TABLA DE PAGOS 2026</h3>
        
        {recibos.length === 0 ? (
          <p className="sin-entregas">No hay socios con pagos registrados en 2026</p>
        ) : (
          <div className="tabla-responsive">
            <table className="tabla-pagos">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>No. Socio</th>
                  <th>No. Cons.</th>
                  <th>Fecha Pago</th>
                  <th className="monto">Inscripción</th>
                  <th className="monto">Cuota 2026</th>
                  <th className="monto">FEMETI 2026</th>
                  <th className="monto">Total</th>
                </tr>
              </thead>
              <tbody>
                {recibos.map((socio, idx) => (
                  <tr key={idx}>
                    <td className="nombre">{socio.nombre}</td>
                    <td>{socio.telefono}</td>
                    <td className="email">{socio.email}</td>
                    <td>{socio.noSocio}</td>
                    <td>{socio.noConsecutivo}</td>
                    <td>{socio.fechaPago}</td>
                    <td className="monto">${socio.inscripcion.toLocaleString('es-MX')}</td>
                    <td className="monto">${socio.cuota.toLocaleString('es-MX')}</td>
                    <td className="monto">${socio.femeti.toLocaleString('es-MX')}</td>
                    <td className="monto total-cell">${socio.total.toLocaleString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fila-totales">
                  <td colSpan="6"><strong>TOTALES</strong></td>
                  <td className="monto"><strong>${totalInscripcion.toLocaleString('es-MX')}</strong></td>
                  <td className="monto"><strong>${totalCuota.toLocaleString('es-MX')}</strong></td>
                  <td className="monto"><strong>${totalFemeti.toLocaleString('es-MX')}</strong></td>
                  <td className="monto total-cell"><strong>${totalGeneral.toLocaleString('es-MX')}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="acciones-tabla">
          <button className="btn-imprimir" onClick={() => imprimirRecibo()}>
            🖨️ Imprimir Reporte Completo
          </button>
        </div>
      </section>

      {/* NOTAS */}
      <section className="notas-entregas">
        <h3>📝 INFORMACIÓN IMPORTANTE</h3>
        <ul>
          <li><strong>Alcance:</strong> Este reporte incluye SOLO los socios que pagaron su membresía 2026</li>
          <li><strong>Exclusión:</strong> No incluye pagos del año 2025 (Santiago)</li>
          <li><strong>Desglose:</strong> Inscripción, Cuota anual y FEMETI por socio</li>
          <li><strong>Uso:</strong> Guardar como comprobante contable y de archivo</li>
          <li><strong>Firma:</strong> Secretario debe firmar el reporte impreso antes de entregar a presidencia</li>
        </ul>
      </section>
    </div>
  );
}

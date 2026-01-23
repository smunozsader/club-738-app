import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useToastContext } from '../../contexts/ToastContext';
import './ReporteContable.css';

/**
 * ReporteContable - Reporte consolidado de ingresos 2026
 * 
 * Mostrará:
 * - Resumen ejecutivo (socios pagados vs pendientes)
 * - Desglose de ingresos (inscripción, anual, FEMETI)
 * - Tabla de socios pagados (ordenada por fecha)
 * - Opciones para enviar recordatorios por email/whatsapp
 */

export default function ReporteContable({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [socios, setSocios] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);
  const toast = useToastContext();

  useEffect(() => {
    generarReporte();
  }, []);

  async function generarReporte() {
    try {
      setLoading(true);
      const sociosSnapshot = await getDocs(collection(db, 'socios'));
      
      const datosReporte = {
        socios: [],
        resumen: {
          totalSocios: 0,
          sociosPagados: 0,
          sociosPendientes: 0,
          inscripciones: { cantidad: 0, monto: 0 },
          anuales: { cantidad: 0, monto: 0 },
          femeti: { cantidad: 0, monto: 0 },
          pagosTotales: 0,
        }
      };

      for (const socioDoc of sociosSnapshot.docs) {
        const email = socioDoc.id;
        const socioData = socioDoc.data();
        
        let estado = 'pendiente';
        let detallesPago = { inscripcion: 0, anualidad: 0, femeti: 0, total: 0 };
        let fechaPago = null;

        if (socioData.renovacion2026) {
          const pago = socioData.renovacion2026;
          estado = pago.estado || 'pendiente';
          
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
          
          fechaPago = pago.fechaPago ? new Date(pago.fechaPago.toDate()).toLocaleDateString('es-MX') : null;
        }

        const nombreCompleto = `${socioData.nombre || ''}`.trim();
        const credencial = socioData.numeroCredencial || socioData.credencial || socioData.numero_socio || 'N/A';
        const recibidoPorNombre = socioData.renovacion2026?.recibidoPorNombre || 'Secretario';

        datosReporte.socios.push({
          credencial,
          nombre: nombreCompleto,
          email,
          telefono: socioData.telefono || '',
          estado,
          detallesPago,
          fechaPago,
          recibidoPorNombre,
        });

        datosReporte.resumen.totalSocios++;
        if (estado === 'pagado') {
          datosReporte.resumen.sociosPagados++;
          
          if (detallesPago.inscripcion > 0) {
            datosReporte.resumen.inscripciones.cantidad++;
            datosReporte.resumen.inscripciones.monto += detallesPago.inscripcion;
          }
          if (detallesPago.anualidad > 0) {
            datosReporte.resumen.anuales.cantidad++;
            datosReporte.resumen.anuales.monto += detallesPago.anualidad;
          }
          if (detallesPago.femeti > 0) {
            datosReporte.resumen.femeti.cantidad++;
            datosReporte.resumen.femeti.monto += detallesPago.femeti;
          }
          
          datosReporte.resumen.pagosTotales += detallesPago.total;
        } else {
          datosReporte.resumen.sociosPendientes++;
        }
      }

      // Ordenar socios pagados por fecha
      const sociosPagados = datosReporte.socios.filter(s => s.estado === 'pagado').sort((a, b) => {
        if (!a.fechaPago || !b.fechaPago) return 0;
        const fechaA = new Date(a.fechaPago.split('/').reverse().join('-'));
        const fechaB = new Date(b.fechaPago.split('/').reverse().join('-'));
        return fechaA - fechaB;
      });

      const sociosPendientes = datosReporte.socios.filter(s => s.estado === 'pendiente');

      datosReporte.socios = [...sociosPagados, ...sociosPendientes];

      setSocios(datosReporte.socios);
      setResumen(datosReporte.resumen);
      toast?.showToast('Reporte generado ✓', 'success', 2000);
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast?.showToast('Error al generar reporte', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function enviarRecordatoriosPendientes(tipo) {
    try {
      setEnviandoRecordatorios(true);
      const sociosPendientes = socios.filter(s => s.estado === 'pendiente');

      if (sociosPendientes.length === 0) {
        toast?.showToast('No hay socios pendientes', 'info');
        return;
      }

      // Llamar a Cloud Function para enviar recordatorios
      const response = await fetch(
        'https://us-central1-club-738-app.cloudfunctions.net/enviarRecordatorios',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo, // 'email' o 'whatsapp'
            socios: sociosPendientes.map(s => ({
              email: s.email,
              nombre: s.nombre,
              telefono: s.telefono,
              monto: 6000 // Cuota anual
            }))
          })
        }
      );

      if (!response.ok) throw new Error('Error al enviar recordatorios');

      const data = await response.json();
      toast?.showToast(
        `${data.enviados} recordatorios por ${tipo} ✓`,
        'success',
        3000
      );
    } catch (error) {
      console.error('Error:', error);
      toast?.showToast('Error al enviar recordatorios', 'error');
    } finally {
      setEnviandoRecordatorios(false);
    }
  }

  if (loading) {
    return <div className="reporte-contable-container"><p>Generando reporte...</p></div>;
  }

  const porcentajePagados = ((resumen.sociosPagados / resumen.totalSocios) * 100).toFixed(1);

  return (
    <div className="reporte-contable-container">
      <div className="reporte-header">
        <h2>📊 Reporte Contable Club 738</h2>
        <p>Enero - Febrero 2026</p>
        <button className="btn-volver" onClick={onBack}>← Volver</button>
      </div>

      {/* RESUMEN EJECUTIVO */}
      <section className="resumen-ejecutivo">
        <h3>RESUMEN EJECUTIVO</h3>
        <div className="resumen-grid">
          <div className="resumen-card">
            <div className="numero">{resumen.totalSocios}</div>
            <div className="label">Total Socios</div>
          </div>
          <div className="resumen-card highlight">
            <div className="numero">{resumen.sociosPagados}</div>
            <div className="label">Pagados ({porcentajePagados}%)</div>
          </div>
          <div className="resumen-card pending">
            <div className="numero">{resumen.sociosPendientes}</div>
            <div className="label">Pendientes</div>
          </div>
          <div className="resumen-card">
            <div className="numero">${resumen.pagosTotales.toLocaleString('es-MX')}</div>
            <div className="label">Ingresos Totales</div>
          </div>
        </div>
      </section>

      {/* INGRESOS NETOS */}
      <section className="ingresos-seccion">
        <h3>💰 INGRESOS NETOS DEL CLUB</h3>
        <div className="ingresos-grid">
          <div className="ingreso-card">
            <h4>Inscripciones</h4>
            <p className="monto">${resumen.inscripciones.monto.toLocaleString('es-MX')}</p>
            <p className="detalle">{resumen.inscripciones.cantidad} pago(s)</p>
          </div>
          <div className="ingreso-card">
            <h4>Cuotas Anuales 2026</h4>
            <p className="monto">${resumen.anuales.monto.toLocaleString('es-MX')}</p>
            <p className="detalle">{resumen.anuales.cantidad} pago(s)</p>
          </div>
          <div className="ingreso-card total">
            <h4>INGRESO NETO</h4>
            <p className="monto">${(resumen.inscripciones.monto + resumen.anuales.monto).toLocaleString('es-MX')}</p>
            <p className="detalle">Total club</p>
          </div>
        </div>
      </section>

      {/* FEMETI */}
      <section className="femeti-seccion">
        <h3>🇲🇽 PAGO A FEDERACIÓN (FEMETI)</h3>
        <div className="femeti-card">
          <p className="aviso">⚠️ No es ingreso neto del club - Pase-through a Federación Mexicana de Tiro</p>
          <p className="monto">${resumen.femeti.monto.toLocaleString('es-MX')}</p>
          <p className="detalle">{resumen.femeti.cantidad} pago(s)</p>
        </div>
      </section>

      {/* SOCIOS PAGADOS */}
      <section className="socios-pagados-seccion">
        <h3>✅ SOCIOS PAGADOS ({resumen.sociosPagados})</h3>
        <div className="tabla-responsiva">
          <table>
            <thead>
              <tr>
                <th>Cred.</th>
                <th>Socio</th>
                <th>Inscr.</th>
                <th>Anual</th>
                <th>FEMETI</th>
                <th>Total</th>
                <th>Recibido por</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {socios.filter(s => s.estado === 'pagado').map((socio, idx) => (
                <tr key={idx}>
                  <td>{socio.credencial}</td>
                  <td className="socio-nombre">{socio.nombre}</td>
                  <td>{socio.detallesPago.inscripcion > 0 ? `$${socio.detallesPago.inscripcion}` : '—'}</td>
                  <td>{socio.detallesPago.anualidad > 0 ? `$${socio.detallesPago.anualidad}` : '—'}</td>
                  <td>{socio.detallesPago.femeti > 0 ? `$${socio.detallesPago.femeti}` : '—'}</td>
                  <td className="total"><strong>${socio.detallesPago.total}</strong></td>
                  <td className="recibido-por">{socio.recibidoPorNombre || '—'}</td>
                  <td>{socio.fechaPago || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RECORDATORIOS */}
      <section className="recordatorios-seccion">
        <h3>📢 ENVIAR RECORDATORIOS A PENDIENTES</h3>
        <p className="advertencia">⏰ <strong>Plazo límite: 28 de febrero de 2026</strong></p>
        
        <div className="recordatorios-botones">
          <button 
            className="btn-recordatorio email"
            onClick={() => enviarRecordatoriosPendientes('email')}
            disabled={enviandoRecordatorios}
          >
            📧 Enviar por Email ({resumen.sociosPendientes})
          </button>
          
          <button 
            className="btn-recordatorio whatsapp"
            onClick={() => enviarRecordatoriosPendientes('whatsapp')}
            disabled={enviandoRecordatorios}
          >
            💬 Enviar por WhatsApp ({resumen.sociosPendientes})
          </button>
        </div>
      </section>

      {/* NOTAS */}
      <section className="notas-seccion">
        <h3>📝 NOTAS</h3>
        <ul>
          <li><strong>Cuota Inscripción:</strong> $2,000 MXN (miembros nuevos)</li>
          <li><strong>Cuota Anual 2026:</strong> $6,000 MXN</li>
          <li><strong>FEMETI Nuevos:</strong> $700 MXN | <strong>FEMETI Renovación:</strong> $350 MXN</li>
          <li><strong>FEMETI:</strong> Pase-through a Federación Mexicana de Tiro - No es ingreso neto</li>
        </ul>
      </section>
    </div>
  );
}

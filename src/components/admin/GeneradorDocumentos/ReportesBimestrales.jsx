import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useToastContext } from '../../../contexts/ToastContext';
import './ReportesBimestrales.css';

const ReportesBimestrales = ({ userEmail, onBack }) => {
  const { showToast } = useToastContext();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(2); // Febrero
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(false);

  const bimestres = [
    { mes: 2, nombre: 'Febrero' },
    { mes: 4, nombre: 'Abril' },
    { mes: 6, nombre: 'Junio' },
    { mes: 8, nombre: 'Agosto' },
    { mes: 10, nombre: 'Octubre' },
    { mes: 12, nombre: 'Diciembre' }
  ];

  // Obtener reporte existente del mes seleccionado
  useEffect(() => {
    const reportKey = `${selectedYear}_${selectedMonth.toString().padStart(2, '0')}`;
    const q = query(
      collection(db, 'reportes_bimestrales'),
      where('ano', '==', selectedYear),
      where('bimestre', '==', bimestres.findIndex(b => b.mes === selectedMonth) + 1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setReporteData(snapshot.docs[0].data());
      } else {
        setReporteData(null);
      }
    });

    return () => unsubscribe();
  }, [selectedYear, selectedMonth]);

  const handleGenerarRelacion = async () => {
    setLoading(true);
    try {
      showToast('Generando RELACIÓN...', 'info');
      // Llamar a GeneradorRelacionSocios
      // TODO: implementar
      showToast('RELACIÓN generada ✓', 'success', 3000);
    } catch (error) {
      console.error('Error generando RELACIÓN:', error);
      showToast('Error generando RELACIÓN', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarAnexoA = async () => {
    setLoading(true);
    try {
      showToast('Generando ANEXO A...', 'info');
      // TODO: implementar
      showToast('ANEXO A generado ✓', 'success', 3000);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error generando ANEXO A', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarAnexoB = async () => {
    setLoading(true);
    try {
      showToast('Generando ANEXO B...', 'info');
      // TODO: implementar
      showToast('ANEXO B generado ✓', 'success', 3000);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error generando ANEXO B', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarAnexoC = async () => {
    setLoading(true);
    try {
      showToast('Generando ANEXO C...', 'info');
      // TODO: implementar
      showToast('ANEXO C generado ✓', 'success', 3000);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error generando ANEXO C', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarTodo = async () => {
    setLoading(true);
    try {
      showToast('Generando TODO + Oficios...', 'info');
      // TODO: implementar
      showToast('Reportes y Oficios generados ✓', 'success', 3000);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error generando documentos', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoReporte = () => {
    if (!reporteData) return 'SIN GENERAR';
    if (reporteData.estado === 'enviado') return 'ENVIADO';
    return 'GENERADO';
  };

  return (
    <div className="reportes-bimestrales">
      <div className="header-panel">
        <button className="btn-back" onClick={onBack}>← Atrás</button>
        <h2>📊 Reportes Bimestrales SEDENA</h2>
      </div>

      <div className="selector-panel">
        <div className="selector-group">
          <label>Año</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <div className="selector-group">
          <label>Bimestre</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {bimestres.map(b => (
              <option key={b.mes} value={b.mes}>
                {b.nombre} ({b.mes})
              </option>
            ))}
          </select>
        </div>

        <div className="estado-badge">
          <span className={`badge badge-${getEstadoReporte().toLowerCase()}`}>
            {getEstadoReporte()}
          </span>
        </div>
      </div>

      <div className="generadores-panel">
        <div className="generador-card">
          <h3>📋 RELACIÓN</h3>
          <p>Detallada por arma (una fila por arma)</p>
          <button 
            onClick={handleGenerarRelacion}
            disabled={loading}
            className="btn btn-primary"
          >
            Generar RELACIÓN
          </button>
        </div>

        <div className="generador-card">
          <h3>📊 ANEXO A</h3>
          <p>Resumen por socio con conteos</p>
          <button 
            onClick={handleGenerarAnexoA}
            disabled={loading}
            className="btn btn-primary"
          >
            Generar ANEXO A
          </button>
        </div>

        <div className="generador-card">
          <h3>📈 ANEXO B</h3>
          <p>Cédula de totales con fórmulas</p>
          <button 
            onClick={handleGenerarAnexoB}
            disabled={loading}
            className="btn btn-primary"
          >
            Generar ANEXO B
          </button>
        </div>

        <div className="generador-card">
          <h3>🏢 ANEXO C</h3>
          <p>Información del club + totales dinámicos</p>
          <button 
            onClick={handleGenerarAnexoC}
            disabled={loading}
            className="btn btn-primary"
          >
            Generar ANEXO C
          </button>
        </div>
      </div>

      <div className="btn-group-full">
        <button 
          onClick={handleGenerarTodo}
          disabled={loading}
          className="btn btn-large btn-success"
        >
          ⚡ GENERAR TODO + OFICIOS ADJUNTOS
        </button>
      </div>

      {reporteData && (
        <div className="reportes-info">
          <h4>Documentos Generados</h4>
          <div className="documentos-list">
            {reporteData.documentos?.relacion && (
              <div className="doc-item">
                <span>RELACIÓN</span>
                <a href={reporteData.documentos.relacion.url} download>
                  Descargar
                </a>
              </div>
            )}
            {reporteData.documentos?.anexoA && (
              <div className="doc-item">
                <span>ANEXO A</span>
                <a href={reporteData.documentos.anexoA.url} download>
                  Descargar
                </a>
              </div>
            )}
            {reporteData.documentos?.anexoB && (
              <div className="doc-item">
                <span>ANEXO B</span>
                <a href={reporteData.documentos.anexoB.url} download>
                  Descargar
                </a>
              </div>
            )}
            {reporteData.documentos?.anexoC && (
              <div className="doc-item">
                <span>ANEXO C</span>
                <a href={reporteData.documentos.anexoC.url} download>
                  Descargar
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesBimestrales;

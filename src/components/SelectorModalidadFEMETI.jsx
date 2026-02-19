/**
 * SelectorModalidadFEMETI - Selector de competencias FEMETI para PETA de Competencia Nacional
 * 
 * Según Manual DN27 y oficio 392, SEDENA requiere:
 * - Indicar clubes y periodo donde participará
 * - Máximo 10 competencias por PETA
 * 
 * Flujo: Modalidad → Estado → Competencias específicas (fecha + club)
 */
import { useState, useEffect, useMemo } from 'react';
import './SelectorModalidadFEMETI.css';

// Importar datos de competencias FEMETI 2026
import COMPETENCIAS_FEMETI from '../../data/referencias/femeti_tiradas_2026/competencias_femeti_2026.json';

// Normalizar nombre de estado para mostrar con acentos
const normalizarEstadoDisplay = (estado) => {
  const mapeo = {
    'MEXICO': 'Estado de México',
    'NUEVO LEON': 'Nuevo León',
    'QUERETARO': 'Querétaro',
    'MICHOACAN': 'Michoacán',
    'YUCATAN': 'Yucatán',
    'SAN LUIS POTOSI': 'San Luis Potosí',
    'QUINTANA ROO': 'Quintana Roo',
    'BAJA CALIFORNIA': 'Baja California',
    'BAJA CALIFORNIA SUR': 'Baja California Sur',
    'DURANGO': 'Durango',
    'GUANAJUATO': 'Guanajuato'
  };
  return mapeo[estado] || estado.charAt(0) + estado.slice(1).toLowerCase();
};

// Formatear fecha para mostrar
const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO + 'T12:00:00');
  const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
  return fecha.toLocaleDateString('es-MX', opciones);
};

// Iconos por modalidad
const ICONOS_MODALIDAD = {
  'BLANCOS EN MOVIMIENTO': '🕊️',
  'RECORRIDOS DE CAZA': '🎯',
  'TIRO OLIMPICO': '🏅',
  'SILUETAS METALICAS': '🔫',
  'TIRO PRACTICO': '⚡',
  'TIRO NEUMATICO': '💨'
};

export default function SelectorModalidadFEMETI({ 
  onChange,
  maxCompetencias = 10 
}) {
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState('');
  const [estadosExpandidos, setEstadosExpandidos] = useState({});
  const [competenciasSeleccionadas, setCompetenciasSeleccionadas] = useState([]);

  // Datos de la modalidad actual
  const modalidadActual = modalidadSeleccionada ? COMPETENCIAS_FEMETI[modalidadSeleccionada] : null;
  
  // Lista de estados disponibles para la modalidad
  const estadosDisponibles = useMemo(() => {
    if (!modalidadActual) return [];
    return Object.keys(modalidadActual.estados).sort();
  }, [modalidadActual]);

  // Notificar cambios al padre
  useEffect(() => {
    if (onChange) {
      onChange({
        nombre: modalidadSeleccionada,
        tipo_arma: modalidadActual?.tipo_arma || '',
        descripcion: modalidadActual?.descripcion || '',
        calibres: modalidadActual?.calibres || [],
        competencias: competenciasSeleccionadas,
        estados: [...new Set(competenciasSeleccionadas.map(c => c.estado))]
      });
    }
  }, [modalidadSeleccionada, competenciasSeleccionadas]);

  // Reset al cambiar modalidad
  const handleModalidadChange = (modalidad) => {
    setModalidadSeleccionada(modalidad);
    setEstadosExpandidos({});
    setCompetenciasSeleccionadas([]);
  };

  // Toggle expandir/colapsar estado
  const toggleEstado = (estado) => {
    setEstadosExpandidos(prev => ({
      ...prev,
      [estado]: !prev[estado]
    }));
  };

  // Agregar/quitar competencia
  const toggleCompetencia = (estado, competencia, index) => {
    const id = `${estado}-${index}`;
    const yaSeleccionada = competenciasSeleccionadas.some(c => c.id === id);
    
    if (yaSeleccionada) {
      setCompetenciasSeleccionadas(prev => prev.filter(c => c.id !== id));
    } else {
      if (competenciasSeleccionadas.length >= maxCompetencias) {
        return; // Límite alcanzado
      }
      setCompetenciasSeleccionadas(prev => [...prev, {
        id,
        estado: normalizarEstadoDisplay(estado),
        estadoOriginal: estado,
        fecha: competencia.fecha,
        club: competencia.club,
        lugar: competencia.lugar,
        calibres: competencia.calibres
      }]);
    }
  };

  // Seleccionar todas las competencias de un estado (hasta el límite)
  const seleccionarTodasDeEstado = (estado) => {
    const competenciasEstado = modalidadActual?.estados[estado] || [];
    const seleccionadasIds = new Set(competenciasSeleccionadas.map(c => c.id));
    
    let nuevasCompetencias = [...competenciasSeleccionadas];
    
    for (let i = 0; i < competenciasEstado.length && nuevasCompetencias.length < maxCompetencias; i++) {
      const id = `${estado}-${i}`;
      if (!seleccionadasIds.has(id)) {
        nuevasCompetencias.push({
          id,
          estado: normalizarEstadoDisplay(estado),
          estadoOriginal: estado,
          fecha: competenciasEstado[i].fecha,
          club: competenciasEstado[i].club,
          lugar: competenciasEstado[i].lugar,
          calibres: competenciasEstado[i].calibres
        });
      }
    }
    
    setCompetenciasSeleccionadas(nuevasCompetencias);
  };

  // Quitar todas las competencias de un estado
  const quitarTodasDeEstado = (estado) => {
    setCompetenciasSeleccionadas(prev => 
      prev.filter(c => c.estadoOriginal !== estado)
    );
  };

  // Contar competencias seleccionadas por estado
  const contarPorEstado = (estado) => {
    return competenciasSeleccionadas.filter(c => c.estadoOriginal === estado).length;
  };

  // Limpiar toda la selección
  const limpiarTodo = () => {
    setCompetenciasSeleccionadas([]);
    setEstadosExpandidos({});
  };

  return (
    <div className="selector-modalidad-femeti">
      <div className="selector-header">
        <h4>🎯 Competencia Nacional FEMETI 2026</h4>
        <p className="selector-subtitle">
          Selecciona tu modalidad y las competencias específicas donde participarás
          <br />
          <strong>⚠️ Indica clubes y fechas exactas (requerido por SEDENA - Art. DN27)</strong>
        </p>
      </div>

      {/* Grid de modalidades */}
      <div className="modalidades-grid">
        {Object.entries(COMPETENCIAS_FEMETI).map(([nombre, info]) => (
          <button
            key={nombre}
            type="button"
            className={`modalidad-card ${modalidadSeleccionada === nombre ? 'selected' : ''}`}
            onClick={() => handleModalidadChange(nombre)}
          >
            <span className="modalidad-icono">{ICONOS_MODALIDAD[nombre]}</span>
            <span className="modalidad-nombre">{nombre}</span>
            <span className="modalidad-arma">{info.tipo_arma}</span>
            <span className="modalidad-estados">{Object.keys(info.estados).length} estados</span>
          </button>
        ))}
      </div>

      {/* Panel de selección de competencias */}
      {modalidadActual && (
        <div className="competencias-panel">
          <div className="panel-header">
            <div className="panel-info">
              <h5>{ICONOS_MODALIDAD[modalidadSeleccionada]} {modalidadSeleccionada}</h5>
              <p className="panel-desc">{modalidadActual.descripcion}</p>
              <p className="panel-calibres">
                <strong>Calibres permitidos:</strong> {modalidadActual.calibres.join(', ')}
              </p>
            </div>
            <div className="panel-contador">
              <span className={`contador ${competenciasSeleccionadas.length >= maxCompetencias ? 'limite' : ''}`}>
                {competenciasSeleccionadas.length} / {maxCompetencias}
              </span>
              <span className="contador-label">competencias</span>
              {competenciasSeleccionadas.length >= maxCompetencias && (
                <span className="advertencia-limite">⚠️ Límite máximo</span>
              )}
            </div>
          </div>

          {competenciasSeleccionadas.length > 0 && (
            <button type="button" className="btn-limpiar-todo" onClick={limpiarTodo}>
              🗑️ Limpiar selección
            </button>
          )}

          {/* Lista de estados con competencias */}
          <div className="estados-lista">
            {estadosDisponibles.map(estado => {
              const competenciasEstado = modalidadActual.estados[estado] || [];
              const expandido = estadosExpandidos[estado];
              const seleccionadasEnEstado = contarPorEstado(estado);
              
              return (
                <div key={estado} className={`estado-accordion ${expandido ? 'expandido' : ''}`}>
                  <button 
                    type="button"
                    className="estado-header"
                    onClick={() => toggleEstado(estado)}
                  >
                    <span className="estado-info">
                      <span className="estado-nombre">{normalizarEstadoDisplay(estado)}</span>
                      <span className="estado-meta">
                        {competenciasEstado.length} competencias disponibles
                        {seleccionadasEnEstado > 0 && (
                          <span className="badge-seleccionadas">
                            ✓ {seleccionadasEnEstado} seleccionadas
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="estado-toggle">{expandido ? '▼' : '▶'}</span>
                  </button>
                  
                  {expandido && (
                    <div className="estado-competencias">
                      <div className="competencias-acciones">
                        <button 
                          type="button" 
                          className="btn-seleccionar-estado"
                          onClick={() => seleccionarTodasDeEstado(estado)}
                          disabled={competenciasSeleccionadas.length >= maxCompetencias}
                        >
                          ✅ Agregar todas
                        </button>
                        {seleccionadasEnEstado > 0 && (
                          <button 
                            type="button" 
                            className="btn-quitar-estado"
                            onClick={() => quitarTodasDeEstado(estado)}
                          >
                            ❌ Quitar de {normalizarEstadoDisplay(estado)}
                          </button>
                        )}
                      </div>
                      
                      <div className="competencias-lista">
                        {competenciasEstado.map((comp, idx) => {
                          const id = `${estado}-${idx}`;
                          const seleccionada = competenciasSeleccionadas.some(c => c.id === id);
                          const deshabilitada = !seleccionada && competenciasSeleccionadas.length >= maxCompetencias;
                          
                          return (
                            <label 
                              key={id}
                              className={`competencia-item ${seleccionada ? 'selected' : ''} ${deshabilitada ? 'disabled' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={seleccionada}
                                onChange={() => toggleCompetencia(estado, comp, idx)}
                                disabled={deshabilitada}
                              />
                              <div className="competencia-info">
                                <span className="competencia-fecha">📅 {formatearFecha(comp.fecha)}</span>
                                <span className="competencia-club">🏠 {comp.club}</span>
                                {comp.lugar && <span className="competencia-lugar">📍 {comp.lugar}</span>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen de selección */}
          {competenciasSeleccionadas.length > 0 && (
            <div className="seleccion-resumen">
              <h6>📋 Competencias seleccionadas para tu PETA:</h6>
              <table className="tabla-resumen">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Club</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {competenciasSeleccionadas
                    .sort((a, b) => a.fecha.localeCompare(b.fecha))
                    .map(comp => (
                      <tr key={comp.id}>
                        <td>{formatearFecha(comp.fecha)}</td>
                        <td>{comp.club}</td>
                        <td>{comp.estado}</td>
                        <td>
                          <button 
                            type="button"
                            className="btn-quitar-competencia"
                            onClick={() => toggleCompetencia(comp.estadoOriginal, comp, parseInt(comp.id.split('-')[1]))}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <p className="resumen-nota">
                ℹ️ Esta información se incluirá en tu solicitud PETA según formato SEDENA DN27
              </p>
            </div>
          )}
        </div>
      )}

      {/* Link a calendario FEMETI */}
      <div className="femeti-link">
        <a 
          href="https://www.femeti.org.mx/calendario-anual" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          📅 Ver calendario completo FEMETI 2026 →
        </a>
      </div>
    </div>
  );
}

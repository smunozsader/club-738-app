/**
 * SelectorEstadosFEMETI - Selector simplificado de Modalidad + Estados para PETA
 * 
 * Flujo simplificado:
 * 1. Usuario selecciona MODALIDAD (Tiro Práctico, Recorridos de Caza, etc.)
 * 2. Usuario selecciona ESTADO(S) con checkboxes (máx 10)
 * 3. Sistema auto-muestra TODOS los clubes incluidos automáticamente
 * 
 * Beneficio: El socio queda legalmente cubierto para asistir a cualquier
 * club del estado que ofrezca tiradas de esa modalidad.
 */
import { useState, useEffect, useMemo } from 'react';
import { 
  MODALIDADES_FEMETI_2026, 
  LISTA_MODALIDADES,
  getEstadosPorModalidad,
  getClubesPorEstadoYModalidad,
  calcularTemporalidad 
} from '../data/modalidadesFEMETI2026';
import './SelectorEstadosFEMETI.css';

export default function SelectorEstadosFEMETI({ 
  onChange,
  fechaSolicitud,
  maxEstados = 10 
}) {
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState('');
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);

  // Datos de la modalidad actual
  const modalidadActual = modalidadSeleccionada 
    ? MODALIDADES_FEMETI_2026[modalidadSeleccionada] 
    : null;

  // Lista de estados disponibles para la modalidad
  const estadosDisponibles = useMemo(() => {
    if (!modalidadActual) return [];
    return Object.entries(modalidadActual.estados)
      .map(([key, data]) => ({
        key,
        display: data.display,
        clubes: data.clubes.length,
        eventos: data.totalEventos
      }))
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [modalidadActual]);

  // Calcular temporalidad basada en fecha de solicitud
  const temporalidad = useMemo(() => {
    if (!fechaSolicitud) return null;
    return calcularTemporalidad(fechaSolicitud);
  }, [fechaSolicitud]);

  // Preview de clubes seleccionados
  const clubesPreview = useMemo(() => {
    if (!modalidadActual || estadosSeleccionados.length === 0) return [];
    
    const preview = [];
    for (const estado of estadosSeleccionados) {
      const estadoData = modalidadActual.estados[estado];
      if (estadoData) {
        preview.push({
          estado: estadoData.display,
          estadoKey: estado,
          clubes: estadoData.clubes
        });
      }
    }
    return preview;
  }, [modalidadActual, estadosSeleccionados]);

  // Total de clubes
  const totalClubes = useMemo(() => {
    return clubesPreview.reduce((sum, e) => sum + e.clubes.length, 0);
  }, [clubesPreview]);

  // Notificar cambios al padre
  useEffect(() => {
    if (onChange) {
      onChange({
        modalidad: modalidadSeleccionada,
        tipoArma: modalidadActual?.tipoArma || '',
        calibres: modalidadActual?.calibres || '',
        estadosSeleccionados,
        clubesPreview,
        totalClubes,
        temporalidad
      });
    }
  }, [modalidadSeleccionada, estadosSeleccionados, temporalidad]);

  // Reset estados al cambiar modalidad
  const handleModalidadChange = (modalidad) => {
    setModalidadSeleccionada(modalidad);
    setEstadosSeleccionados([]);
  };

  // Toggle estado
  const toggleEstado = (estadoKey) => {
    setEstadosSeleccionados(prev => {
      if (prev.includes(estadoKey)) {
        return prev.filter(e => e !== estadoKey);
      } else if (prev.length < maxEstados) {
        return [...prev, estadoKey];
      }
      return prev;
    });
  };

  // Seleccionar todos (hasta el límite)
  const seleccionarTodos = () => {
    const primeros = estadosDisponibles.slice(0, maxEstados).map(e => e.key);
    setEstadosSeleccionados(primeros);
  };

  // Limpiar selección
  const limpiarSeleccion = () => {
    setEstadosSeleccionados([]);
  };

  // Obtener info de modalidad para mostrar
  const getModalidadInfo = (key) => {
    return LISTA_MODALIDADES.find(m => m.key === key) || { icono: '🎯', nombre: key };
  };

  return (
    <div className="selector-estados-femeti">
      <div className="selector-header">
        <h4>🎯 Competencia Nacional FEMETI 2026</h4>
        <p className="selector-subtitle">
          Selecciona modalidad y estados donde participarás.
          <br />
          <strong>Se incluirán automáticamente TODOS los clubes del estado.</strong>
        </p>
      </div>

      {/* Grid de modalidades */}
      <div className="modalidades-grid">
        {LISTA_MODALIDADES.map(mod => {
          const data = MODALIDADES_FEMETI_2026[mod.key];
          if (!data) return null;
          
          return (
            <button
              key={mod.key}
              type="button"
              className={`modalidad-card ${modalidadSeleccionada === mod.key ? 'selected' : ''}`}
              onClick={() => handleModalidadChange(mod.key)}
            >
              <span className="modalidad-icono">{mod.icono}</span>
              <span className="modalidad-nombre">{mod.nombre}</span>
              <span className="modalidad-arma">{mod.arma}</span>
              <span className="modalidad-estados">{data.totalEstados} estados</span>
            </button>
          );
        })}
      </div>

      {/* Panel de selección de estados */}
      {modalidadActual && (
        <div className="estados-panel">
          <div className="panel-header">
            <div className="panel-info">
              <h5>{getModalidadInfo(modalidadSeleccionada).icono} {modalidadSeleccionada}</h5>
              <p className="panel-calibres">
                <strong>Tipo de arma:</strong> {modalidadActual.tipoArma}
                {' | '}
                <strong>Calibres:</strong> {modalidadActual.calibres}
              </p>
            </div>
            <div className="panel-contador">
              <span className={`contador ${estadosSeleccionados.length >= maxEstados ? 'limite' : ''}`}>
                {estadosSeleccionados.length} / {maxEstados}
              </span>
              <span className="contador-label">estados</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="estados-acciones">
            <button 
              type="button" 
              className="btn-seleccionar-todos"
              onClick={seleccionarTodos}
              disabled={estadosSeleccionados.length >= maxEstados}
            >
              ✅ Todos los estados
            </button>
            {estadosSeleccionados.length > 0 && (
              <button 
                type="button" 
                className="btn-limpiar"
                onClick={limpiarSeleccion}
              >
                🗑️ Limpiar
              </button>
            )}
          </div>

          {/* Grid de estados con checkboxes */}
          <div className="estados-grid">
            {estadosDisponibles.map(estado => {
              const seleccionado = estadosSeleccionados.includes(estado.key);
              const deshabilitado = !seleccionado && estadosSeleccionados.length >= maxEstados;
              
              return (
                <label 
                  key={estado.key}
                  className={`estado-item ${seleccionado ? 'selected' : ''} ${deshabilitado ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    onChange={() => toggleEstado(estado.key)}
                    disabled={deshabilitado}
                  />
                  <div className="estado-info">
                    <span className="estado-nombre">{estado.display}</span>
                    <span className="estado-meta">{estado.clubes} clubes</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview de clubes incluidos */}
      {clubesPreview.length > 0 && (
        <div className="clubes-preview">
          <div className="preview-header">
            <h5>📋 Clubes a incluir en tu PETA ({totalClubes} total)</h5>
            {temporalidad && (
              <p className="preview-temporalidad">
                📅 <strong>Tiradas Registradas en el Calendario FEMETI período:</strong>
                <br />
                <span className="temporalidad-fechas">{temporalidad.textoCompleto}</span>
              </p>
            )}
          </div>
          
          <div className="preview-estados">
            {clubesPreview.map(estadoInfo => (
              <div key={estadoInfo.estadoKey} className="preview-estado">
                <h6>📍 {estadoInfo.estado}</h6>
                <ul className="preview-clubes-lista">
                  {estadoInfo.clubes.map((club, idx) => (
                    <li key={idx}>
                      <span className="club-nombre">{club.club}</span>
                      <span className="club-domicilio">({club.domicilio})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <p className="preview-nota">
            ℹ️ Esta lista se incluirá automáticamente en tu solicitud PETA según formato RFA-LC-017 (DN27)
          </p>
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

/**
 * SelectorEstadosFEMETI - Selector FEMETI con UI mejorada
 * 
 * Flujo: DROPDOWN Estado → CHECKBOXES Modalidades → AUTO-POBLADO Clubes
 * 
 * Permite seleccionar múltiples modalidades por estado
 * y auto-pobla los clubes/fechas correspondientes
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import './SelectorEstadosFEMETI.css';

// Importar datos de competencias FEMETI 2026
import COMPETENCIAS_FEMETI from '../../data/referencias/femeti_tiradas_2026/competencias_femeti_2026.json';

// Normalizar nombre de estado para mostrar con acentos
const normalizarEstadoDisplay = (estado) => {
  const mapeo = {
    'AGUASCALIENTES': 'Aguascalientes',
    'BAJA CALIFORNIA': 'Baja California',
    'BAJA CALIFORNIA SUR': 'Baja California Sur',
    'CAMPECHE': 'Campeche',
    'CHIAPAS': 'Chiapas',
    'CHIHUAHUA': 'Chihuahua',
    'CIUDAD DE MEXICO': 'Ciudad de México',
    'COAHUILA': 'Coahuila',
    'COLIMA': 'Colima',
    'DURANGO': 'Durango',
    'DGO.': 'Durango',
    'ESTADO DE MEXICO': 'Estado de México',
    'GUANAJUATO': 'Guanajuato',
    'GUERRERO': 'Guerrero',
    'HIDALGO': 'Hidalgo',
    'HGO.': 'Hidalgo',
    'JALISCO': 'Jalisco',
    'MICHOACAN': 'Michoacán',
    'MORELOS': 'Morelos',
    'NAYARIT': 'Nayarit',
    'NUEVO LEON': 'Nuevo León',
    'OAXACA': 'Oaxaca',
    'PUEBLA': 'Puebla',
    'QUERETARO': 'Querétaro',
    'QUINTANA ROO': 'Quintana Roo',
    'Q ROO': 'Quintana Roo',
    'SAN LUIS POTOSI': 'San Luis Potosí',
    'SINALOA': 'Sinaloa',
    'SONORA': 'Sonora',
    'TABASCO': 'Tabasco',
    'TAMAULIPAS': 'Tamaulipas',
    'TLAXCALA': 'Tlaxcala',
    'VERACRUZ': 'Veracruz',
    'VER.': 'Veracruz',
    'YUCATAN': 'Yucatán',
    'ZACATECAS': 'Zacatecas',
    'ZAC.': 'Zacatecas'
  };
  const upper = estado.toUpperCase();
  return mapeo[upper] || estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
};

// Formatear fecha para mostrar
const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';
  try {
    const fecha = new Date(fechaISO + 'T12:00:00');
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return fechaISO;
  }
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

// Colores por modalidad para badges
const COLORES_MODALIDAD = {
  'BLANCOS EN MOVIMIENTO': '#8b5cf6',
  'RECORRIDOS DE CAZA': '#22c55e',
  'TIRO OLIMPICO': '#f59e0b',
  'SILUETAS METALICAS': '#ef4444',
  'TIRO PRACTICO': '#3b82f6',
  'TIRO NEUMATICO': '#06b6d4'
};

// Construir índice invertido: Estado → Modalidades → Competencias
const construirIndiceEstados = () => {
  const indice = {};
  
  for (const [modalidad, datos] of Object.entries(COMPETENCIAS_FEMETI)) {
    for (const [estadoRaw, competencias] of Object.entries(datos.estados)) {
      const estadoNorm = estadoRaw.toUpperCase().trim();
      const estadoDisplay = normalizarEstadoDisplay(estadoRaw);
      
      if (!indice[estadoNorm]) {
        indice[estadoNorm] = {
          display: estadoDisplay,
          modalidades: {}
        };
      }
      
      if (!indice[estadoNorm].modalidades[modalidad]) {
        indice[estadoNorm].modalidades[modalidad] = {
          tipo_arma: datos.tipo_arma,
          descripcion: datos.descripcion,
          calibres: datos.calibres,
          competencias: []
        };
      }
      
      competencias.forEach((comp, idx) => {
        indice[estadoNorm].modalidades[modalidad].competencias.push({
          ...comp,
          estado: estadoNorm,
          estadoDisplay: estadoDisplay,
          modalidad: modalidad,
          id: `${estadoNorm}-${modalidad}-${idx}`
        });
      });
    }
  }
  
  return indice;
};

// Índice pre-calculado
const INDICE_ESTADOS = construirIndiceEstados();

// Lista de estados para dropdown, ordenados alfabéticamente
const ESTADOS_DROPDOWN = Object.entries(INDICE_ESTADOS)
  .map(([key, data]) => ({
    value: key,
    label: data.display,
    modalidades: Object.keys(data.modalidades).length,
    competencias: Object.values(data.modalidades).reduce((sum, m) => sum + m.competencias.length, 0)
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'));

export default function SelectorEstadosFEMETI({ 
  onChange,
  maxCompetencias = 10 
}) {
  // Estado seleccionado en dropdown
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  // Modalidades seleccionadas (checkboxes)
  const [modalidadesSeleccionadas, setModalidadesSeleccionadas] = useState([]);
  // Competencias auto-pobladas y seleccionadas
  const [competenciasSeleccionadas, setCompetenciasSeleccionadas] = useState([]);

  // Ref para onChange (evitar loop infinito)
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Modalidades disponibles para el estado seleccionado
  const modalidadesDisponibles = useMemo(() => {
    if (!estadoSeleccionado || !INDICE_ESTADOS[estadoSeleccionado]) return [];
    return Object.entries(INDICE_ESTADOS[estadoSeleccionado].modalidades).map(([nombre, datos]) => ({
      nombre,
      tipo_arma: datos.tipo_arma,
      calibres: datos.calibres,
      totalCompetencias: datos.competencias.length
    }));
  }, [estadoSeleccionado]);

  // Competencias filtradas por estado + modalidades seleccionadas
  const competenciasFiltradas = useMemo(() => {
    if (!estadoSeleccionado || modalidadesSeleccionadas.length === 0) return [];
    
    const estadoData = INDICE_ESTADOS[estadoSeleccionado];
    if (!estadoData) return [];

    let todas = [];
    modalidadesSeleccionadas.forEach(mod => {
      if (estadoData.modalidades[mod]) {
        todas = [...todas, ...estadoData.modalidades[mod].competencias];
      }
    });

    // Ordenar por fecha
    return todas.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
  }, [estadoSeleccionado, modalidadesSeleccionadas]);

  // Cuando cambia el estado, limpiar modalidades
  useEffect(() => {
    setModalidadesSeleccionadas([]);
  }, [estadoSeleccionado]);

  // Notificar cambios al padre
  useEffect(() => {
    if (onChangeRef.current) {
      const modalidadesUsadas = [...new Set(competenciasSeleccionadas.map(c => c.modalidad))];
      const estadosUsados = [...new Set(competenciasSeleccionadas.map(c => c.estado))];
      
      onChangeRef.current({
        competencias: competenciasSeleccionadas,
        estadosSeleccionados: estadosUsados.map(e => INDICE_ESTADOS[e]?.display || e),
        modalidades: modalidadesUsadas,
        modalidad: modalidadesUsadas[0] || null,
        resumen: competenciasSeleccionadas.map(c => ({
          fecha: c.fecha,
          club: c.club,
          lugar: c.lugar,
          estado: c.estadoDisplay,
          modalidad: c.modalidad
        }))
      });
    }
  }, [competenciasSeleccionadas]);

  // Toggle modalidad
  const toggleModalidad = (modalidad) => {
    setModalidadesSeleccionadas(prev => {
      if (prev.includes(modalidad)) {
        return prev.filter(m => m !== modalidad);
      } else {
        return [...prev, modalidad];
      }
    });
  };

  // Seleccionar/deseleccionar competencia individual
  const toggleCompetencia = (competencia) => {
    setCompetenciasSeleccionadas(prev => {
      const existe = prev.find(c => c.id === competencia.id);
      if (existe) {
        return prev.filter(c => c.id !== competencia.id);
      } else if (prev.length < maxCompetencias) {
        return [...prev, competencia];
      }
      return prev;
    });
  };

  // Seleccionar todas las competencias filtradas
  const seleccionarTodas = () => {
    const disponibles = competenciasFiltradas.filter(
      c => !competenciasSeleccionadas.find(s => s.id === c.id)
    );
    const espacioDisponible = maxCompetencias - competenciasSeleccionadas.length;
    const nuevas = disponibles.slice(0, espacioDisponible);
    setCompetenciasSeleccionadas(prev => [...prev, ...nuevas]);
  };

  // Deseleccionar todas del estado/modalidad actual
  const deseleccionarFiltradas = () => {
    const idsFiltradas = new Set(competenciasFiltradas.map(c => c.id));
    setCompetenciasSeleccionadas(prev => prev.filter(c => !idsFiltradas.has(c.id)));
  };

  // Verificar si competencia está seleccionada
  const estaSeleccionada = (competencia) => {
    return competenciasSeleccionadas.some(c => c.id === competencia.id);
  };

  // Contar seleccionadas en filtro actual
  const seleccionadasEnFiltro = competenciasFiltradas.filter(c => estaSeleccionada(c)).length;

  return (
    <div className="selector-estados-femeti-v2">
      {/* Header */}
      <div className="selector-header">
        <h4>📍 Competencias FEMETI 2026</h4>
        <div className="contador-global">
          <span className={`contador ${competenciasSeleccionadas.length >= maxCompetencias ? 'limite' : ''}`}>
            {competenciasSeleccionadas.length} / {maxCompetencias}
          </span>
          <span className="contador-label">seleccionadas</span>
        </div>
      </div>

      {/* Paso 1: Dropdown de Estados */}
      <div className="selector-paso">
        <label className="paso-label">
          <span className="paso-numero">1</span>
          Selecciona un Estado
        </label>
        <select 
          className="estado-dropdown"
          value={estadoSeleccionado}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
        >
          <option value="">-- Seleccionar Estado --</option>
          {ESTADOS_DROPDOWN.map(estado => (
            <option key={estado.value} value={estado.value}>
              {estado.label} ({estado.modalidades} modalidades, {estado.competencias} fechas)
            </option>
          ))}
        </select>
      </div>

      {/* Paso 2: Checkboxes de Modalidades */}
      {estadoSeleccionado && modalidadesDisponibles.length > 0 && (
        <div className="selector-paso">
          <label className="paso-label">
            <span className="paso-numero">2</span>
            Selecciona Modalidades
          </label>
          <div className="modalidades-grid">
            {modalidadesDisponibles.map(mod => {
              const isChecked = modalidadesSeleccionadas.includes(mod.nombre);
              return (
                <label 
                  key={mod.nombre} 
                  className={`modalidad-checkbox ${isChecked ? 'checked' : ''}`}
                  style={{ '--mod-color': COLORES_MODALIDAD[mod.nombre] || '#6b7280' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleModalidad(mod.nombre)}
                  />
                  <span className="modalidad-icono">{ICONOS_MODALIDAD[mod.nombre] || '🎯'}</span>
                  <span className="modalidad-info">
                    <span className="modalidad-nombre">{mod.nombre}</span>
                    <span className="modalidad-meta">{mod.tipo_arma} • {mod.totalCompetencias} fechas</span>
                    <span className="modalidad-calibres">Calibres: {mod.calibres.join(', ')}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Paso 3: Clubes/Competencias Auto-poblados */}
      {competenciasFiltradas.length > 0 && (
        <div className="selector-paso">
          <label className="paso-label">
            <span className="paso-numero">3</span>
            Clubes y Fechas Disponibles
            <span className="conteo-filtro">
              ({seleccionadasEnFiltro}/{competenciasFiltradas.length} en esta selección)
            </span>
          </label>
          
          {/* Acciones rápidas */}
          <div className="acciones-rapidas">
            <button 
              type="button"
              className="btn-accion btn-seleccionar-todas"
              onClick={seleccionarTodas}
              disabled={competenciasSeleccionadas.length >= maxCompetencias}
            >
              ✓ Seleccionar todas
            </button>
            <button 
              type="button"
              className="btn-accion btn-deseleccionar"
              onClick={deseleccionarFiltradas}
              disabled={seleccionadasEnFiltro === 0}
            >
              ✕ Quitar de esta selección
            </button>
          </div>

          {/* Lista de competencias */}
          <div className="competencias-auto">
            {competenciasFiltradas.map(comp => {
              const seleccionada = estaSeleccionada(comp);
              const disabled = !seleccionada && competenciasSeleccionadas.length >= maxCompetencias;

              return (
                <div 
                  key={comp.id}
                  className={`competencia-card ${seleccionada ? 'seleccionada' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && toggleCompetencia(comp)}
                >
                  <div className="competencia-check">
                    {seleccionada ? '✓' : '○'}
                  </div>
                  <div className="competencia-contenido">
                    <div className="competencia-fecha">{formatearFecha(comp.fecha)}</div>
                    <div className="competencia-club">{comp.club}</div>
                    <div className="competencia-lugar">{comp.lugar}</div>
                  </div>
                  <div 
                    className="competencia-modalidad-badge"
                    style={{ backgroundColor: COLORES_MODALIDAD[comp.modalidad] || '#6b7280' }}
                  >
                    {ICONOS_MODALIDAD[comp.modalidad]} {comp.modalidad.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen de selección global */}
      {competenciasSeleccionadas.length > 0 && (
        <div className="resumen-global">
          <div className="resumen-header">
            <h5>📋 Resumen de Selección</h5>
            <button 
              type="button"
              className="btn-limpiar-todo"
              onClick={() => setCompetenciasSeleccionadas([])}
            >
              🗑️ Limpiar todo
            </button>
          </div>
          
          {/* Agrupar por estado */}
          {Object.entries(
            competenciasSeleccionadas.reduce((acc, c) => {
              if (!acc[c.estadoDisplay]) acc[c.estadoDisplay] = [];
              acc[c.estadoDisplay].push(c);
              return acc;
            }, {})
          ).map(([estado, comps]) => (
            <div key={estado} className="resumen-estado">
              <div className="resumen-estado-header">
                <span className="resumen-estado-nombre">📍 {estado}</span>
                <span className="resumen-estado-count">{comps.length} competencia{comps.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="resumen-competencias">
                {comps.map(comp => (
                  <div key={comp.id} className="resumen-comp-item">
                    <span 
                      className="resumen-modalidad-dot"
                      style={{ backgroundColor: COLORES_MODALIDAD[comp.modalidad] }}
                    />
                    <span className="resumen-comp-fecha">{formatearFecha(comp.fecha)}</span>
                    <span className="resumen-comp-club">{comp.club}</span>
                    <button 
                      type="button"
                      className="btn-quitar-comp"
                      onClick={(e) => { e.stopPropagation(); toggleCompetencia(comp); }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no hay selección */}
      {competenciasSeleccionadas.length === 0 && (
        <div className="mensaje-vacio">
          <p>👆 Selecciona un estado y modalidades para ver los clubes disponibles</p>
        </div>
      )}
    </div>
  );
}

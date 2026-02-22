/**
 * SelectorEstadosFEMETI v2 - Selector con Dropdowns para PETA
 * 
 * Flujo mejorado con dropdowns:
 * 1. Usuario selecciona ESTADO desde dropdown
 * 2. Para ese estado, selecciona MODALIDADES (multi-select)
 * 3. Sistema auto-incluye TODOS los clubes de cada combinación estado+modalidad
 * 
 * Ejemplo: Estado de México con Tiro Práctico + Recorridos de Caza + Blancos
 */
import { useState, useEffect, useMemo } from 'react';
import { 
  MODALIDADES_FEMETI_2026, 
  LISTA_MODALIDADES,
  calcularTemporalidad 
} from '../data/modalidadesFEMETI2026';
import './SelectorEstadosFEMETI.css';

// Obtener todos los estados únicos de todas las modalidades
const obtenerTodosLosEstados = () => {
  const estadosMap = new Map();
  
  for (const [modalidadKey, modalidadData] of Object.entries(MODALIDADES_FEMETI_2026)) {
    for (const [estadoKey, estadoData] of Object.entries(modalidadData.estados)) {
      if (!estadosMap.has(estadoKey)) {
        estadosMap.set(estadoKey, {
          key: estadoKey,
          display: estadoData.display,
          modalidadesDisponibles: []
        });
      }
      estadosMap.get(estadoKey).modalidadesDisponibles.push({
        key: modalidadKey,
        ...LISTA_MODALIDADES.find(m => m.key === modalidadKey),
        clubes: estadoData.clubes,
        eventos: estadoData.totalEventos
      });
    }
  }
  
  return Array.from(estadosMap.values())
    .sort((a, b) => a.display.localeCompare(b.display));
};

const TODOS_LOS_ESTADOS = obtenerTodosLosEstados();

export default function SelectorEstadosFEMETI({ 
  onChange,
  fechaSolicitud,
  maxEstados = 10 
}) {
  // Estado: { estadoKey: string, modalidades: string[] }[]
  const [selecciones, setSelecciones] = useState([]);
  const [estadoDropdownAbierto, setEstadoDropdownAbierto] = useState(false);
  const [modalidadDropdownAbierto, setModalidadDropdownAbierto] = useState(null); // estadoKey
  
  // Estados ya seleccionados (para excluir del dropdown)
  const estadosYaSeleccionados = useMemo(() => 
    selecciones.map(s => s.estadoKey), 
    [selecciones]
  );
  
  // Estados disponibles para agregar
  const estadosDisponibles = useMemo(() => 
    TODOS_LOS_ESTADOS.filter(e => !estadosYaSeleccionados.includes(e.key)),
    [estadosYaSeleccionados]
  );
  
  // Calcular temporalidad
  const temporalidad = useMemo(() => {
    if (!fechaSolicitud) return null;
    return calcularTemporalidad(fechaSolicitud);
  }, [fechaSolicitud]);
  
  // Generar preview de clubes agrupados
  const clubesPreview = useMemo(() => {
    const preview = [];
    
    for (const seleccion of selecciones) {
      const estadoInfo = TODOS_LOS_ESTADOS.find(e => e.key === seleccion.estadoKey);
      if (!estadoInfo) continue;
      
      const modalidadesInfo = [];
      for (const modalidadKey of seleccion.modalidades) {
        const modData = estadoInfo.modalidadesDisponibles.find(m => m.key === modalidadKey);
        if (modData) {
          modalidadesInfo.push({
            key: modalidadKey,
            nombre: modData.nombre,
            icono: modData.icono,
            arma: modData.arma,
            clubes: modData.clubes
          });
        }
      }
      
      if (modalidadesInfo.length > 0) {
        preview.push({
          estadoKey: seleccion.estadoKey,
          estadoDisplay: estadoInfo.display,
          modalidades: modalidadesInfo
        });
      }
    }
    
    return preview;
  }, [selecciones]);
  
  // Total de clubes únicos
  const totalClubes = useMemo(() => {
    const clubesSet = new Set();
    for (const estado of clubesPreview) {
      for (const mod of estado.modalidades) {
        for (const club of mod.clubes) {
          clubesSet.add(`${estado.estadoKey}|${club.club}`);
        }
      }
    }
    return clubesSet.size;
  }, [clubesPreview]);
  
  // Notificar cambios al padre
  useEffect(() => {
    if (onChange) {
      // Aplanar para compatibilidad con GeneradorPETA
      const estadosSeleccionados = selecciones.map(s => s.estadoKey);
      const modalidadesUnicas = [...new Set(selecciones.flatMap(s => s.modalidades))];
      
      onChange({
        selecciones, // Nuevo formato detallado
        estadosSeleccionados, // Compat
        modalidades: modalidadesUnicas, // Compat
        clubesPreview,
        totalClubes,
        temporalidad
      });
    }
  }, [selecciones, temporalidad]);
  
  // Agregar estado
  const agregarEstado = (estadoKey) => {
    if (selecciones.length >= maxEstados) return;
    if (estadosYaSeleccionados.includes(estadoKey)) return;
    
    setSelecciones(prev => [...prev, { estadoKey, modalidades: [] }]);
    setEstadoDropdownAbierto(false);
  };
  
  // Remover estado
  const removerEstado = (estadoKey) => {
    setSelecciones(prev => prev.filter(s => s.estadoKey !== estadoKey));
  };
  
  // Toggle modalidad para un estado
  const toggleModalidad = (estadoKey, modalidadKey) => {
    setSelecciones(prev => prev.map(s => {
      if (s.estadoKey !== estadoKey) return s;
      
      const tieneModalidad = s.modalidades.includes(modalidadKey);
      return {
        ...s,
        modalidades: tieneModalidad
          ? s.modalidades.filter(m => m !== modalidadKey)
          : [...s.modalidades, modalidadKey]
      };
    }));
  };
  
  // Obtener info de estado
  const getEstadoInfo = (estadoKey) => {
    return TODOS_LOS_ESTADOS.find(e => e.key === estadoKey);
  };
  
  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setEstadoDropdownAbierto(false);
        setModalidadDropdownAbierto(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="selector-estados-femeti selector-v2">
      <div className="selector-header">
        <h4>🎯 Competencia Nacional FEMETI 2026</h4>
        <p className="selector-subtitle">
          Agrega estados y selecciona las modalidades en las que competirás.
        </p>
      </div>

      {/* Dropdown para agregar estado */}
      <div className="dropdown-container estado-dropdown">
        <button
          type="button"
          className="dropdown-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setEstadoDropdownAbierto(!estadoDropdownAbierto);
            setModalidadDropdownAbierto(null);
          }}
          disabled={selecciones.length >= maxEstados}
        >
          <span className="dropdown-icon">➕</span>
          <span>Agregar Estado</span>
          <span className="dropdown-counter">
            {selecciones.length}/{maxEstados}
          </span>
          <span className={`dropdown-arrow ${estadoDropdownAbierto ? 'open' : ''}`}>▼</span>
        </button>
        
        {estadoDropdownAbierto && (
          <div className="dropdown-menu estado-menu">
            <div className="dropdown-search">
              <input 
                type="text" 
                placeholder="Buscar estado..." 
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  // Filtrar estados en tiempo real
                  const search = e.target.value.toLowerCase();
                  const items = document.querySelectorAll('.estado-menu .dropdown-item');
                  items.forEach(item => {
                    const texto = item.textContent.toLowerCase();
                    item.style.display = texto.includes(search) ? 'flex' : 'none';
                  });
                }}
              />
            </div>
            <div className="dropdown-items">
              {estadosDisponibles.map(estado => (
                <div
                  key={estado.key}
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    agregarEstado(estado.key);
                  }}
                >
                  <span className="item-nombre">{estado.display}</span>
                  <span className="item-meta">
                    {estado.modalidadesDisponibles.length} modalidades
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de estados seleccionados con sus modalidades */}
      {selecciones.length > 0 && (
        <div className="selecciones-lista">
          {selecciones.map(seleccion => {
            const estadoInfo = getEstadoInfo(seleccion.estadoKey);
            if (!estadoInfo) return null;
            
            return (
              <div key={seleccion.estadoKey} className="seleccion-item">
                <div className="seleccion-header">
                  <div className="seleccion-estado">
                    <span className="estado-icono">📍</span>
                    <span className="estado-nombre">{estadoInfo.display}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-remover"
                    onClick={() => removerEstado(seleccion.estadoKey)}
                    title="Quitar estado"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Dropdown de modalidades para este estado */}
                <div className="dropdown-container modalidad-dropdown">
                  <button
                    type="button"
                    className="dropdown-trigger modalidad-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalidadDropdownAbierto(
                        modalidadDropdownAbierto === seleccion.estadoKey 
                          ? null 
                          : seleccion.estadoKey
                      );
                      setEstadoDropdownAbierto(false);
                    }}
                  >
                    <span>
                      {seleccion.modalidades.length === 0 
                        ? 'Seleccionar modalidades...' 
                        : `${seleccion.modalidades.length} modalidad(es)`}
                    </span>
                    <span className={`dropdown-arrow ${modalidadDropdownAbierto === seleccion.estadoKey ? 'open' : ''}`}>▼</span>
                  </button>
                  
                  {modalidadDropdownAbierto === seleccion.estadoKey && (
                    <div className="dropdown-menu modalidad-menu">
                      {estadoInfo.modalidadesDisponibles.map(mod => {
                        const seleccionada = seleccion.modalidades.includes(mod.key);
                        return (
                          <div
                            key={mod.key}
                            className={`dropdown-item modalidad-item ${seleccionada ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModalidad(seleccion.estadoKey, mod.key);
                            }}
                          >
                            <span className="check-box">
                              {seleccionada ? '☑' : '☐'}
                            </span>
                            <span className="mod-icono">{mod.icono}</span>
                            <div className="mod-info">
                              <span className="mod-nombre">{mod.nombre}</span>
                              <span className="mod-meta">{mod.arma} • {mod.clubes.length} clubes</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Tags de modalidades seleccionadas */}
                {seleccion.modalidades.length > 0 && (
                  <div className="modalidades-tags">
                    {seleccion.modalidades.map(modKey => {
                      const modInfo = estadoInfo.modalidadesDisponibles.find(m => m.key === modKey);
                      if (!modInfo) return null;
                      return (
                        <span 
                          key={modKey} 
                          className="modalidad-tag"
                          onClick={() => toggleModalidad(seleccion.estadoKey, modKey)}
                          title="Clic para quitar"
                        >
                          {modInfo.icono} {modInfo.nombre}
                          <span className="tag-remove">×</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview compacto de clubes */}
      {clubesPreview.length > 0 && clubesPreview.some(e => e.modalidades.length > 0) && (
        <div className="clubes-preview preview-compacto">
          <details open>
            <summary className="preview-header">
              <span>📋 Clubes a incluir ({totalClubes} total)</span>
              {temporalidad && (
                <span className="temporalidad-badge">
                  {temporalidad.textoCorto}
                </span>
              )}
            </summary>
            
            <div className="preview-content">
              {clubesPreview.map(estado => (
                <div key={estado.estadoKey} className="preview-estado-compacto">
                  <div className="estado-header-compacto">
                    <strong>📍 {estado.estadoDisplay}</strong>
                  </div>
                  {estado.modalidades.map(mod => (
                    <div key={mod.key} className="modalidad-clubes">
                      <div className="modalidad-label">
                        {mod.icono} {mod.nombre}:
                      </div>
                      <ul className="clubes-lista-compacta">
                        {mod.clubes.map((club, idx) => (
                          <li key={idx}>
                            {club.club} <span className="club-loc">({club.domicilio})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </details>
          
          {temporalidad && (
            <p className="preview-temporalidad-full">
              📅 Tiradas Registradas en el Calendario FEMETI período: <strong>{temporalidad.textoCompleto}</strong>
            </p>
          )}
        </div>
      )}

      {/* Ayuda */}
      {selecciones.length === 0 && (
        <div className="selector-ayuda">
          <p>💡 <strong>Tip:</strong> Puedes seleccionar múltiples modalidades por estado.</p>
          <p>Ejemplo: Estado de México → Tiro Práctico + Recorridos de Caza + Blancos en Movimiento</p>
        </div>
      )}

      {/* Link FEMETI */}
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

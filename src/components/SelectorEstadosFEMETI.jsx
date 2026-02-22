/**
 * SelectorEstadosFEMETI - Selector simplificado para Competencia Nacional
 * 
 * Muestra: ESTADO, CLUBES, PERIODO
 * NO lista eventos individuales - solo clubes únicos por estado/modalidad
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import './SelectorEstadosFEMETI.css';

// Importar datos de competencias FEMETI 2026 (debe estar en src/ para que Vite lo procese)
import COMPETENCIAS_FEMETI from '../data/femeti/competencias_femeti_2026.json';

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

// Iconos por modalidad
const ICONOS_MODALIDAD = {
  'BLANCOS EN MOVIMIENTO': '🕊️',
  'RECORRIDOS DE CAZA': '🎯',
  'TIRO OLIMPICO': '🏅',
  'SILUETAS METALICAS': '🔫',
  'TIRO PRACTICO': '⚡',
  'TIRO NEUMATICO': '💨'
};

// Colores por modalidad
const COLORES_MODALIDAD = {
  'BLANCOS EN MOVIMIENTO': '#8b5cf6',
  'RECORRIDOS DE CAZA': '#22c55e',
  'TIRO OLIMPICO': '#f59e0b',
  'SILUETAS METALICAS': '#ef4444',
  'TIRO PRACTICO': '#3b82f6',
  'TIRO NEUMATICO': '#06b6d4'
};

// Construir índice: Estado → Modalidades → Clubes únicos
const construirIndiceEstados = () => {
  const indice = {};
  
  for (const [modalidad, datos] of Object.entries(COMPETENCIAS_FEMETI)) {
    for (const [estadoRaw, clubes] of Object.entries(datos.estados)) {
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
          calibres: datos.calibres,
          clubes: new Set()
        };
      }
      
      // Los clubes son un array de strings directamente
      clubes.forEach(club => {
        if (club && typeof club === 'string') {
          indice[estadoNorm].modalidades[modalidad].clubes.add(club);
        }
      });
    }
  }
  
  for (const estado of Object.values(indice)) {
    for (const mod of Object.values(estado.modalidades)) {
      mod.clubes = [...mod.clubes].sort();
    }
  }
  
  return indice;
};

const INDICE_ESTADOS = construirIndiceEstados();

const ESTADOS_DROPDOWN = Object.entries(INDICE_ESTADOS)
  .map(([key, data]) => ({
    value: key,
    label: data.display,
    modalidades: Object.keys(data.modalidades).length
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'));

export default function SelectorEstadosFEMETI({ 
  onChange,
  fechaOficio,
  maxEstados = 10 
}) {
  const [selecciones, setSelecciones] = useState([]);
  const [estadoActual, setEstadoActual] = useState('');
  const [modalidadActual, setModalidadActual] = useState('');

  // Calcular estados únicos para validar límite de 10
  const estadosUnicos = useMemo(() => {
    return new Set(selecciones.map(s => s.estado));
  }, [selecciones]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const modalidadesDisponibles = useMemo(() => {
    if (!estadoActual || !INDICE_ESTADOS[estadoActual]) return [];
    return Object.entries(INDICE_ESTADOS[estadoActual].modalidades).map(([nombre, datos]) => ({
      nombre,
      tipo_arma: datos.tipo_arma,
      calibres: datos.calibres,
      clubes: datos.clubes
    }));
  }, [estadoActual]);

  const periodo = useMemo(() => {
    const hoy = fechaOficio ? new Date(fechaOficio + 'T12:00:00') : new Date();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() + 15);
    
    const year = inicio.getFullYear();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const fechaInicioStr = `${inicio.getDate()} de ${meses[inicio.getMonth()]} del ${year}`;
    
    return {
      inicio: fechaInicioStr,
      fin: `31 de diciembre del ${year}`,
      year: year,
      leyenda: `Tiradas Registradas calendario FEMETI periodo ${fechaInicioStr} - 31 de diciembre del ${year}`
    };
  }, [fechaOficio]);

  useEffect(() => {
    if (onChangeRef.current) {
      const estadosSeleccionados = selecciones.map(s => s.estadoDisplay);
      const modalidades = [...new Set(selecciones.map(s => s.modalidad))];
      const clubesPorEstado = selecciones.map(s => ({
        estado: s.estadoDisplay,
        modalidad: s.modalidad,
        clubes: s.clubes
      }));
      
      onChangeRef.current({
        estadosSeleccionados,
        modalidades,
        modalidad: modalidades[0] || null,
        clubesPorEstado,
        periodo: periodo.leyenda,
        resumen: selecciones
      });
    }
  }, [selecciones, periodo]);

  const agregarSeleccion = () => {
    if (!estadoActual || !modalidadActual) return;
    
    // Verificar si es un estado nuevo (no repetido)
    const esEstadoNuevo = !estadosUnicos.has(estadoActual);
    
    // Solo bloquear si es un estado nuevo y ya tenemos 10 estados únicos
    if (esEstadoNuevo && estadosUnicos.size >= maxEstados) return;
    
    const existe = selecciones.find(
      s => s.estado === estadoActual && s.modalidad === modalidadActual
    );
    if (existe) return;
    
    const estadoData = INDICE_ESTADOS[estadoActual];
    const modData = estadoData.modalidades[modalidadActual];
    
    const nuevaSeleccion = {
      id: `${estadoActual}-${modalidadActual}-${Date.now()}`,
      estado: estadoActual,
      estadoDisplay: estadoData.display,
      modalidad: modalidadActual,
      clubes: modData.clubes,
      calibres: modData.calibres
    };
    
    setSelecciones(prev => [...prev, nuevaSeleccion]);
    setEstadoActual('');
    setModalidadActual('');
  };

  const quitarSeleccion = (id) => {
    setSelecciones(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    setModalidadActual('');
  }, [estadoActual]);

  return (
    <div className="selector-estados-femeti-v2">
      <div className="selector-header">
        <h4>📍 Competencias FEMETI 2026</h4>
        <div className="contador-global">
          <span className={`contador ${estadosUnicos.size >= maxEstados ? 'limite' : ''}`}>
            {estadosUnicos.size} / {maxEstados}
          </span>
          <span className="contador-label">estados únicos</span>
        </div>
      </div>

      <div className="nota-estados" style={{
        background: 'var(--info-bg, #e0f2fe)',
        padding: '10px 15px',
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '13px',
        color: 'var(--info-text, #0369a1)',
        border: '1px solid var(--info-border, #7dd3fc)'
      }}>
        💡 <strong>Nota:</strong> Puedes agregar múltiples modalidades en el mismo estado. El límite de 10 aplica solo a estados diferentes.
        {selecciones.length > estadosUnicos.size && (
          <span style={{ marginLeft: '8px' }}>
            ({selecciones.length} selecciones en {estadosUnicos.size} estados)
          </span>
        )}
      </div>

      <div className="periodo-info" style={{
        background: 'var(--bg-tertiary)',
        padding: '12px 15px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid var(--border-color)'
      }}>
        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>📅 Periodo:</span>
        <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
          {periodo.leyenda}
        </span>
      </div>

      <div className="agregar-seleccion" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <select 
          className="estado-dropdown"
          value={estadoActual}
          onChange={(e) => setEstadoActual(e.target.value)}
        >
          <option value="">-- Estado --</option>
          {ESTADOS_DROPDOWN.map(estado => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>

        <select 
          className="estado-dropdown"
          value={modalidadActual}
          onChange={(e) => setModalidadActual(e.target.value)}
          disabled={!estadoActual}
        >
          <option value="">-- Modalidad --</option>
          {modalidadesDisponibles.map(mod => (
            <option key={mod.nombre} value={mod.nombre}>
              {mod.nombre} ({mod.clubes.length} clubes)
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn-agregar"
          onClick={agregarSeleccion}
          disabled={!estadoActual || !modalidadActual || (!estadosUnicos.has(estadoActual) && estadosUnicos.size >= maxEstados)}
          style={{
            padding: '10px 20px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Agregar
        </button>
      </div>

      {selecciones.length > 0 && (
        <div className="selecciones-lista">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)' }}>Estado</th>
                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)' }}>Clubes</th>
                <th style={{ padding: '10px', borderBottom: '2px solid var(--border-color)', width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {selecciones.map(sel => (
                <tr key={sel.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '600' }}>📍 {sel.estadoDisplay}</div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: COLORES_MODALIDAD[sel.modalidad] || 'var(--text-secondary)',
                      marginTop: '4px'
                    }}>
                      {ICONOS_MODALIDAD[sel.modalidad]} {sel.modalidad}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {sel.clubes.map((club, idx) => (
                        <span key={idx}>
                          • {club}
                          {idx < sel.clubes.length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => quitarSeleccion(sel.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '5px'
                      }}
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selecciones.length === 0 && (
        <div className="mensaje-vacio">
          <p>👆 Selecciona un estado y modalidad para agregar clubes</p>
        </div>
      )}
    </div>
  );
}

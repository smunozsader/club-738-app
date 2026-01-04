import { useState, useMemo } from 'react';
import './CalendarioTiradas.css';
import { 
  TIRADAS_CLUB_738, 
  TIRADAS_REGIONALES, 
  MODALIDADES, 
  ESTADOS_SURESTE,
  getTodasLasTiradas 
} from '../data/tiradasData';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CalendarioTiradas = () => {
  const [mesActual, setMesActual] = useState(new Date().getMonth());
  const [vista, setVista] = useState('calendario'); // 'calendario', 'lista', 'club738'
  const [filtroModalidad, setFiltroModalidad] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [tiradaSeleccionada, setTiradaSeleccionada] = useState(null);

  const todasLasTiradas = useMemo(() => getTodasLasTiradas(), []);

  // Filtrar tiradas según filtros activos
  const tiradasFiltradas = useMemo(() => {
    let resultado = todasLasTiradas;
    
    if (filtroModalidad !== 'todas') {
      resultado = resultado.filter(t => t.modalidad === filtroModalidad);
    }
    
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(t => t.estado === filtroEstado);
    }
    
    return resultado;
  }, [todasLasTiradas, filtroModalidad, filtroEstado]);

  // Tiradas del mes actual
  const tiradasDelMes = useMemo(() => {
    return tiradasFiltradas.filter(t => {
      const fecha = new Date(t.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === 2026;
    });
  }, [tiradasFiltradas, mesActual]);

  // Próximas tiradas (desde hoy)
  const proximasTiradas = useMemo(() => {
    const hoy = new Date();
    return tiradasFiltradas
      .filter(t => new Date(t.fecha) >= hoy)
      .slice(0, 10);
  }, [tiradasFiltradas]);

  // Generar días del mes para el calendario
  const diasDelMes = useMemo(() => {
    const año = 2026;
    const primerDia = new Date(año, mesActual, 1);
    const ultimoDia = new Date(año, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    // Ajustar para que Lunes = 0, Domingo = 6
    let diaInicio = primerDia.getDay() - 1;
    if (diaInicio < 0) diaInicio = 6; // Si es Domingo, ponerlo al final
    
    const dias = [];
    
    // Días vacíos antes del primer día del mes
    for (let i = 0; i < diaInicio; i++) {
      dias.push({ dia: null, tiradas: [] });
    }
    
    // Días del mes con sus tiradas
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaStr = `2026-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const tiradasDelDia = tiradasFiltradas.filter(t => t.fecha === fechaStr);
      dias.push({ dia, tiradas: tiradasDelDia, fecha: fechaStr });
    }
    
    return dias;
  }, [mesActual, tiradasFiltradas]);

  const formatearFecha = (fecha, fechaFin) => {
    const opciones = { day: 'numeric', month: 'short' };
    const f = new Date(fecha + 'T00:00:00');
    if (fechaFin) {
      const ff = new Date(fechaFin + 'T00:00:00');
      return `${f.toLocaleDateString('es-MX', opciones)} - ${ff.toLocaleDateString('es-MX', opciones)}`;
    }
    return f.toLocaleDateString('es-MX', { ...opciones, weekday: 'short' });
  };

  const TarjetaTirada = ({ tirada, compacta = false }) => (
    <div 
      className={`tarjeta-tirada ${tirada.esClub738 ? 'club-738' : ''} ${compacta ? 'compacta' : ''}`}
      onClick={() => setTiradaSeleccionada(tirada)}
      style={{ borderLeftColor: MODALIDADES[tirada.modalidad]?.color }}
    >
      <div className="tarjeta-header">
        <span className="modalidad-badge" style={{ backgroundColor: MODALIDADES[tirada.modalidad]?.color }}>
          {MODALIDADES[tirada.modalidad]?.icon} {tirada.modalidad}
        </span>
        {tirada.esClub738 && <span className="badge-738">Club 738</span>}
      </div>
      <h4 className="tirada-nombre">{tirada.nombre}</h4>
      <p className="tirada-fecha">{formatearFecha(tirada.fecha, tirada.fechaFin)}</p>
      {!compacta && (
        <>
          <p className="tirada-club">{tirada.club}</p>
          <p className="tirada-lugar">📍 {tirada.lugar}</p>
        </>
      )}
    </div>
  );

  const ModalDetalle = () => {
    if (!tiradaSeleccionada) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setTiradaSeleccionada(null)}>
        <div className="modal-contenido" onClick={e => e.stopPropagation()}>
          <button className="modal-cerrar" onClick={() => setTiradaSeleccionada(null)}>×</button>
          
          <div className="modal-header" style={{ backgroundColor: MODALIDADES[tiradaSeleccionada.modalidad]?.color }}>
            <span className="modal-icon">{MODALIDADES[tiradaSeleccionada.modalidad]?.icon}</span>
            <h2>{MODALIDADES[tiradaSeleccionada.modalidad]?.nombre}</h2>
          </div>
          
          <div className="modal-body">
            <h3>{tiradaSeleccionada.nombre}</h3>
            
            {tiradaSeleccionada.esClub738 && (
              <div className="badge-738-grande">
                ⭐ Evento del Club 738
              </div>
            )}
            
            <div className="modal-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div>
                  <strong>Fecha</strong>
                  <p>{formatearFecha(tiradaSeleccionada.fecha, tiradaSeleccionada.fechaFin)}, 2026</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <div>
                  <strong>Especialidad</strong>
                  <p>{tiradaSeleccionada.especialidad}</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">🏛️</span>
                <div>
                  <strong>Club Organizador</strong>
                  <p>{tiradaSeleccionada.club}</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <strong>Ubicación</strong>
                  <p>{tiradaSeleccionada.lugar}</p>
                </div>
              </div>
            </div>
            
            {tiradaSeleccionada.esClub738 && (
              <div className="modal-acciones">
                <p className="nota-inscripcion">
                  Para inscribirte, comunícate con la secretaría del club o asiste al campo de tiro.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendario-tiradas">
      {/* Barra de navegación */}
      <nav className="calendario-nav">
        <a href="/" className="nav-home">← Volver al Portal</a>
        <div className="nav-links">
          <a href="/calculadora">Calculadora PCP</a>
        </div>
      </nav>

      {/* Header */}
      <div className="calendario-header">
        <div className="header-titulo">
          <h1>🎯 Calendario de Tiradas 2026</h1>
          <p>Competencias de Tiro - Región Sureste</p>
        </div>
        
        <div className="header-logos">
          <div className="logo-femeti">
            <span>FEMETI</span>
            <small>Federación Mexicana de Tiro</small>
          </div>
          <div className="logo-club738">
            <span>Club 738</span>
            <small>Yucatán</small>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-grupo">
          <label>Vista:</label>
          <div className="btn-group">
            <button 
              className={vista === 'calendario' ? 'activo' : ''} 
              onClick={() => setVista('calendario')}
            >
              📅 Calendario
            </button>
            <button 
              className={vista === 'lista' ? 'activo' : ''} 
              onClick={() => setVista('lista')}
            >
              📋 Lista
            </button>
            <button 
              className={vista === 'club738' ? 'activo' : ''} 
              onClick={() => setVista('club738')}
            >
              ⭐ Club 738
            </button>
          </div>
        </div>

        <div className="filtros-grupo">
          <label>Modalidad:</label>
          <select value={filtroModalidad} onChange={e => setFiltroModalidad(e.target.value)}>
            <option value="todas">Todas las modalidades</option>
            {Object.entries(MODALIDADES).map(([key, mod]) => (
              <option key={key} value={key}>{mod.icon} {mod.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtros-grupo">
          <label>Estado:</label>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {Object.entries(ESTADOS_SURESTE).map(([key, estado]) => (
              <option key={key} value={key}>{estado.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-numero">{TIRADAS_CLUB_738.length}</span>
          <span className="stat-label">Tiradas Club 738</span>
        </div>
        <div className="stat-item">
          <span className="stat-numero">{TIRADAS_REGIONALES.length}</span>
          <span className="stat-label">Tiradas Regionales</span>
        </div>
        <div className="stat-item">
          <span className="stat-numero">{Object.keys(ESTADOS_SURESTE).length}</span>
          <span className="stat-label">Estados</span>
        </div>
        <div className="stat-item">
          <span className="stat-numero">{tiradasDelMes.length}</span>
          <span className="stat-label">Este mes</span>
        </div>
      </div>

      {/* Vista Club 738 */}
      {vista === 'club738' && (
        <div className="vista-club738">
          <div className="club738-header">
            <h2>⭐ Tiradas del Club de Caza, Tiro y Pesca de Yucatán A.C.</h2>
            <p>Registro SEDENA: 738 | FEMETI: YUC-05 | SEMARNAT: CLUB-CIN-005-YUC-05</p>
          </div>
          
          <div className="club738-grid">
            {TIRADAS_CLUB_738.map(tirada => (
              <TarjetaTirada key={tirada.id} tirada={tirada} />
            ))}
          </div>
          
          <div className="club738-info">
            <h3>📍 Ubicación del Campo de Tiro</h3>
            <p>
              <a 
                href="https://maps.app.goo.gl/AcpqoDN9wN8g8r1Q6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-mapa"
              >
                📌 Ver en Google Maps - Mérida, Yucatán
              </a>
            </p>
            <p>Contacto: tiropracticoyucatan@gmail.com</p>
            <p>Tel: +52 56 6582 4667</p>
          </div>
        </div>
      )}

      {/* Vista Calendario */}
      {vista === 'calendario' && (
        <div className="vista-calendario">
          <div className="navegacion-mes">
            <button 
              onClick={() => setMesActual(m => Math.max(0, m - 1))}
              disabled={mesActual === 0}
            >
              ← Anterior
            </button>
            <h2>{MESES[mesActual]} 2026</h2>
            <button 
              onClick={() => setMesActual(m => Math.min(11, m + 1))}
              disabled={mesActual === 11}
            >
              Siguiente →
            </button>
          </div>

          <div className="calendario-grid">
            <div className="dia-header">Lun</div>
            <div className="dia-header">Mar</div>
            <div className="dia-header">Mié</div>
            <div className="dia-header">Jue</div>
            <div className="dia-header">Vie</div>
            <div className="dia-header fin-semana">Sáb</div>
            <div className="dia-header fin-semana">Dom</div>
            
            {diasDelMes.map((diaInfo, idx) => (
              <div 
                key={idx} 
                className={`dia-celda ${diaInfo.dia ? '' : 'vacio'} ${diaInfo.tiradas.length > 0 ? 'tiene-tiradas' : ''}`}
              >
                {diaInfo.dia && (
                  <>
                    <span className="dia-numero">{diaInfo.dia}</span>
                    <div className="dia-tiradas">
                      {diaInfo.tiradas.slice(0, 3).map(t => (
                        <div 
                          key={t.id}
                          className={`tirada-punto ${t.esClub738 ? 'club738' : ''}`}
                          style={{ backgroundColor: MODALIDADES[t.modalidad]?.color }}
                          onClick={() => setTiradaSeleccionada(t)}
                          title={t.nombre}
                        >
                          {t.esClub738 && '⭐'}
                        </div>
                      ))}
                      {diaInfo.tiradas.length > 3 && (
                        <span className="mas-tiradas">+{diaInfo.tiradas.length - 3}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Tiradas del mes seleccionado */}
          {tiradasDelMes.length > 0 && (
            <div className="tiradas-mes">
              <h3>Tiradas en {MESES[mesActual]}</h3>
              <div className="tiradas-mes-grid">
                {tiradasDelMes.map(tirada => (
                  <TarjetaTirada key={tirada.id} tirada={tirada} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vista Lista */}
      {vista === 'lista' && (
        <div className="vista-lista">
          <h2>📋 Próximas Tiradas</h2>
          <div className="lista-tiradas">
            {proximasTiradas.length > 0 ? (
              proximasTiradas.map(tirada => (
                <TarjetaTirada key={tirada.id} tirada={tirada} />
              ))
            ) : (
              <p className="sin-tiradas">No hay tiradas próximas con los filtros seleccionados</p>
            )}
          </div>
        </div>
      )}

      {/* Leyenda de modalidades */}
      <div className="leyenda">
        <h4>Modalidades:</h4>
        <div className="leyenda-items">
          {Object.entries(MODALIDADES).map(([key, mod]) => (
            <div key={key} className="leyenda-item">
              <span className="leyenda-color" style={{ backgroundColor: mod.color }}></span>
              <span>{mod.icon} {mod.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalle */}
      <ModalDetalle />

      {/* Footer */}
      <div className="calendario-footer">
        <p>Calendario oficial aprobado por FEMETI para el año 2026</p>
        <p>Última actualización: Enero 2026</p>
      </div>
    </div>
  );
};

export default CalendarioTiradas;

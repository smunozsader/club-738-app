import { useState, useMemo } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import ThemeToggle from './ThemeToggle';
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
  const { isDarkMode, toggleDarkMode } = useDarkMode();
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
      {/* Header oficial del club */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <button onClick={() => window.location.href = '/'} className="btn-home" title="Volver al inicio">
              🏠 Inicio
            </button>
            <a href="/" className="logo-home-link">
              <img src="/assets/logo-club-738.jpg" alt="Club de Caza, Tiro y Pesca de Yucatán" className="logo-img" />
            </a>
            <div>
              <h1>Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge">SEDENA 738</span>
            <span className="badge">FEMETI YUC 05/2020</span>
            <span className="badge">SEMARNAT-CLUB-CIN-005-YUC-05</span>
            <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
          </div>
        </div>
      </header>

      {/* Título de la sección */}
      <div className="calendario-header">
        <div className="header-titulo">
          <h2>📅 Calendario de Tiradas 2026</h2>
          <p>Competencias de Tiro - Región Sureste</p>
        </div>
        <nav className="calendario-nav">
          <a href="/" className="nav-link">← Portal</a>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="calendario-content">
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
      </div> {/* Fin calendario-content */}

      {/* Modal de detalle */}
      <ModalDetalle />

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h4>📍 Ubicación</h4>
            <p>Calle 50 No. 531-E x 69 y 71</p>
            <p>Col. Centro, 97000 Mérida, Yucatán</p>
            <a 
              href="https://maps.app.goo.gl/AcpqoDN9wN8g8r1Q6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="map-link"
            >
              Ver en Google Maps
            </a>
          </div>
          <div className="footer-info">
            <h4>📞 Contacto</h4>
            <a 
              href="https://wa.me/525665824667" 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +52 56 6582 4667
            </a>
            <a href="mailto:tiropracticoyucatan@gmail.com" className="email-link">tiropracticoyucatan@gmail.com</a>
          </div>
          <div className="footer-info">
            <h4>📜 Registros Oficiales</h4>
            <p>SEDENA: 738</p>
            <p>FEMETI: YUC-05/2020</p>
            <p>SEMARNAT: CLUB-CIN-005-YUC-05</p>
          </div>
        </div>
        <div className="footer-social">
          <a href="https://www.facebook.com/profile.php?id=61554753867361" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/tiro_practico_yucatan/" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://maps.app.goo.gl/xUfQggW8jAG7gtC19" target="_blank" rel="noopener noreferrer" title="Campo de Tiro">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.403 16.199 0 12 0zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
          </a>
          <a href="https://www.femeti.org.mx/" target="_blank" rel="noopener noreferrer" title="FEMETI">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </a>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Club de Caza, Tiro y Pesca de Yucatán, A.C. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CalendarioTiradas;

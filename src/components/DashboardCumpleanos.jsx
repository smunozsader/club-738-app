/**
 * DashboardCumpleanos - Panel de cumpleaños y demografía de socios
 * Extrae datos de la CURP para mostrar cumpleaños y estadísticas
 */
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  parseCURP, 
  getNombreMes, 
  getSignoZodiacal,
  agruparPorMes, 
  getProximosCumples,
  getEstadisticasDemograficas 
} from '../utils/curpParser';
import './DashboardCumpleanos.css';

export default function DashboardCumpleanos({ userEmail }) {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('proximos'); // proximos, calendario, estadisticas
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);

  const esSecretario = userEmail === 'smunozam@gmail.com';

  useEffect(() => {
    if (esSecretario) {
      cargarSocios();
    }
  }, [esSecretario]);

  const cargarSocios = async () => {
    try {
      const sociosRef = collection(db, 'socios');
      const snapshot = await getDocs(sociosRef);
      
      const sociosData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const curp = data.curp || '';
        const curpData = parseCURP(curp);
        
        // Limpiar nombre
        let nombreLimpio = data.nombre || doc.id;
        nombreLimpio = nombreLimpio.replace(/^\d+\.\s*/, '');
        
        sociosData.push({
          id: doc.id,
          email: doc.id,
          nombre: nombreLimpio,
          telefono: data.telefono || '',
          noSocio: data.noSocio || '-',
          curp,
          curpData, // Datos parseados de la CURP
          tieneCurp: !!curpData
        });
      });
      
      setSocios(sociosData);
    } catch (error) {
      console.error('Error cargando socios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar socios con CURP válida
  const sociosConCurp = socios.filter(s => s.tieneCurp);
  const sociosSinCurp = socios.filter(s => !s.tieneCurp);
  
  // Datos calculados
  const cumplesPorMes = agruparPorMes(sociosConCurp);
  const proximosCumples = getProximosCumples(sociosConCurp, 30);
  const cumpleHoy = sociosConCurp.filter(s => s.curpData?.esCumpleHoy);
  const stats = getEstadisticasDemograficas(sociosConCurp);

  // Generar mensaje de felicitación
  const generarMensajeCumple = (socio) => {
    const signo = getSignoZodiacal(socio.curpData.mes, socio.curpData.dia);
    return `🎂 ¡Feliz Cumpleaños, ${socio.nombre.split(' ')[0]}! 🎉

El Club de Caza, Tiro y Pesca de Yucatán te desea un excelente día en tu cumpleaños.

${signo.emoji} ${signo.nombre}

¡Que siempre des en el blanco! 🎯

—Club 738
SEDENA: 738 | FEMETI: YUC 05/2020`;
  };

  const enviarWhatsApp = (socio) => {
    const mensaje = encodeURIComponent(generarMensajeCumple(socio));
    const telefono = socio.telefono?.replace(/\D/g, '');
    if (telefono) {
      window.open(`https://wa.me/52${telefono}?text=${mensaje}`, '_blank');
    } else {
      alert('Este socio no tiene teléfono registrado');
    }
  };

  const copiarMensaje = (socio) => {
    navigator.clipboard.writeText(generarMensajeCumple(socio));
    alert('Mensaje copiado al portapapeles');
  };

  if (!esSecretario) {
    return (
      <div className="dashboard-cumpleanos acceso-denegado">
        <h2>Acceso Restringido</h2>
        <p>Este panel es exclusivo para el Secretario del Club.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-cumpleanos loading">
        <p>Cargando datos de socios...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-cumpleanos">
      {/* Header */}
      <div className="cumple-header">
        <h2>🎂 Cumpleaños y Demografía</h2>
        <div className="cumple-stats-mini">
          <span className="stat-item">
            <strong>{sociosConCurp.length}</strong> con CURP
          </span>
          <span className="stat-item warning">
            <strong>{sociosSinCurp.length}</strong> sin CURP
          </span>
        </div>
      </div>

      {/* Alerta de cumpleaños hoy */}
      {cumpleHoy.length > 0 && (
        <div className="cumple-hoy-alert">
          <span className="alert-icon">🎉</span>
          <div className="alert-content">
            <strong>¡Cumpleaños hoy!</strong>
            <ul>
              {cumpleHoy.map(s => (
                <li key={s.id}>
                  {s.nombre} - {s.curpData.edad} años
                  <button onClick={() => enviarWhatsApp(s)} className="btn-wa-mini">
                    📱 WhatsApp
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tabs de navegación */}
      <div className="cumple-tabs">
        <button 
          className={vista === 'proximos' ? 'active' : ''}
          onClick={() => setVista('proximos')}
        >
          📅 Próximos 30 días
        </button>
        <button 
          className={vista === 'calendario' ? 'active' : ''}
          onClick={() => setVista('calendario')}
        >
          🗓️ Calendario Anual
        </button>
        <button 
          className={vista === 'estadisticas' ? 'active' : ''}
          onClick={() => setVista('estadisticas')}
        >
          📊 Demografía
        </button>
      </div>

      {/* Vista: Próximos cumpleaños */}
      {vista === 'proximos' && (
        <div className="vista-proximos">
          <h3>Próximos cumpleaños (30 días)</h3>
          {proximosCumples.length === 0 ? (
            <p className="no-cumples">No hay cumpleaños en los próximos 30 días</p>
          ) : (
            <div className="lista-cumples">
              {proximosCumples.map(socio => {
                const signo = getSignoZodiacal(socio.curpData.mes, socio.curpData.dia);
                return (
                  <div key={socio.id} className={`cumple-card ${socio.curpData.diasParaCumple <= 7 ? 'pronto' : ''}`}>
                    <div className="cumple-fecha">
                      <span className="dia">{socio.curpData.dia}</span>
                      <span className="mes">{getNombreMes(socio.curpData.mes).substring(0, 3)}</span>
                    </div>
                    <div className="cumple-info">
                      <h4>{socio.nombre}</h4>
                      <p>Cumple <strong>{socio.curpData.edad + 1}</strong> años</p>
                      <p className="cumple-dias">
                        {socio.curpData.diasParaCumple === 0 
                          ? '¡Es hoy!' 
                          : `En ${socio.curpData.diasParaCumple} días`}
                      </p>
                    </div>
                    <div className="cumple-signo">
                      <span className="signo-emoji">{signo.emoji}</span>
                      <span className="signo-nombre">{signo.nombre}</span>
                    </div>
                    <div className="cumple-acciones">
                      <button onClick={() => enviarWhatsApp(socio)} className="btn-whatsapp" title="Enviar felicitación">
                        📱
                      </button>
                      <button onClick={() => copiarMensaje(socio)} className="btn-copiar" title="Copiar mensaje">
                        📋
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vista: Calendario Anual */}
      {vista === 'calendario' && (
        <div className="vista-calendario">
          <div className="selector-mes">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(mes => (
              <button 
                key={mes}
                className={`mes-btn ${mesSeleccionado === mes ? 'active' : ''} ${cumplesPorMes[mes].socios.length > 0 ? 'tiene-cumples' : ''}`}
                onClick={() => setMesSeleccionado(mes)}
              >
                <span className="mes-nombre">{getNombreMes(mes).substring(0, 3)}</span>
                <span className="mes-count">{cumplesPorMes[mes].socios.length}</span>
              </button>
            ))}
          </div>

          <div className="calendario-mes">
            <h3>{getNombreMes(mesSeleccionado)}</h3>
            {cumplesPorMes[mesSeleccionado].socios.length === 0 ? (
              <p className="no-cumples">No hay cumpleaños en {getNombreMes(mesSeleccionado)}</p>
            ) : (
              <table className="tabla-cumples">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Nombre</th>
                    <th>Edad</th>
                    <th>Origen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cumplesPorMes[mesSeleccionado].socios.map(socio => (
                    <tr key={socio.id}>
                      <td className="col-dia">{socio.curpData.dia}</td>
                      <td className="col-nombre">{socio.nombre}</td>
                      <td className="col-edad">{socio.curpData.edad} años</td>
                      <td className="col-origen">{socio.curpData.estadoAbrev}</td>
                      <td className="col-acciones">
                        <button onClick={() => enviarWhatsApp(socio)} className="btn-mini">📱</button>
                        <button onClick={() => copiarMensaje(socio)} className="btn-mini">📋</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Vista: Estadísticas Demográficas */}
      {vista === 'estadisticas' && (
        <div className="vista-estadisticas">
          {/* Resumen general */}
          <div className="stats-resumen">
            <div className="stat-box">
              <span className="stat-valor">{stats.edadPromedio}</span>
              <span className="stat-etiqueta">Edad Promedio</span>
            </div>
            <div className="stat-box">
              <span className="stat-valor">{stats.edadMinima} - {stats.edadMaxima}</span>
              <span className="stat-etiqueta">Rango de Edad</span>
            </div>
            <div className="stat-box masculino">
              <span className="stat-valor">{stats.porSexo.Masculino}</span>
              <span className="stat-etiqueta">👨 Hombres</span>
            </div>
            <div className="stat-box femenino">
              <span className="stat-valor">{stats.porSexo.Femenino}</span>
              <span className="stat-etiqueta">👩 Mujeres</span>
            </div>
          </div>

          {/* Distribución por Estado */}
          <div className="stats-section">
            <h3>🗺️ Origen por Estado</h3>
            <div className="estados-grid">
              {stats.estadosOrdenados.map(({ estado, cantidad }) => (
                <div key={estado} className="estado-bar">
                  <span className="estado-nombre">{estado}</span>
                  <div className="estado-barra">
                    <div 
                      className="estado-fill" 
                      style={{ width: `${(cantidad / stats.totalConCurp) * 100}%` }}
                    />
                  </div>
                  <span className="estado-cantidad">{cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución por Década */}
          <div className="stats-section">
            <h3>📅 Generaciones (Década de Nacimiento)</h3>
            <div className="decadas-grid">
              {stats.decadasOrdenadas.map(({ decada, cantidad }) => (
                <div key={decada} className="decada-item">
                  <span className="decada-nombre">{decada}</span>
                  <div className="decada-bar">
                    <div 
                      className="decada-fill"
                      style={{ width: `${(cantidad / stats.totalConCurp) * 100}%` }}
                    />
                  </div>
                  <span className="decada-cantidad">{cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Socios destacados */}
          <div className="stats-section destacados">
            <h3>🏆 Socios Destacados</h3>
            <div className="destacados-grid">
              {stats.socioMayor && (
                <div className="destacado-card">
                  <span className="destacado-emoji">👴</span>
                  <div>
                    <h4>Socio con más experiencia</h4>
                    <p>{stats.socioMayor.nombre}</p>
                    <p className="destacado-detalle">{stats.socioMayor.curpData.edad} años - {stats.socioMayor.curpData.estadoNombre}</p>
                  </div>
                </div>
              )}
              {stats.socioMasJoven && (
                <div className="destacado-card">
                  <span className="destacado-emoji">🌟</span>
                  <div>
                    <h4>Socio más joven</h4>
                    <p>{stats.socioMasJoven.nombre}</p>
                    <p className="destacado-detalle">{stats.socioMasJoven.curpData.edad} años - {stats.socioMasJoven.curpData.estadoNombre}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Socios sin CURP */}
          {sociosSinCurp.length > 0 && (
            <div className="stats-section warning">
              <h3>⚠️ Socios sin CURP válida ({sociosSinCurp.length})</h3>
              <p>Estos socios necesitan actualizar su CURP en el sistema:</p>
              <ul className="lista-sin-curp">
                {sociosSinCurp.slice(0, 10).map(s => (
                  <li key={s.id}>{s.nombre} ({s.email})</li>
                ))}
                {sociosSinCurp.length > 10 && (
                  <li className="mas">... y {sociosSinCurp.length - 10} más</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

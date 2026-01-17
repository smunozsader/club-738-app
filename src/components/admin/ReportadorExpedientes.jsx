import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useDarkMode } from '../../hooks/useDarkMode';
import ThemeToggle from '../ThemeToggle';
import './ReportadorExpedientes.css';

/**
 * ReportadorExpedientes - Panel de auditoría de expedientes digitales
 * Muestra estado de documentación de cada socio con enfoque en:
 * - PDFs de armas (prioridad)
 * - INE (prioridad)
 * - CURP
 * - Certificado Antecedentes (con validación de vigencia < 6 meses)
 * OPTIMIZADO: Lee solo desde Firestore para evitar errores 403 de Storage
 */
export default function ReportadorExpedientes() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos | incompletos | sin-armas | sin-ine
  const [ordenar, setOrdenar] = useState('nombre'); // nombre | progreso | armas
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarExpedientes();
  }, []);

  const cargarExpedientes = async () => {
    setLoading(true);
    try {
      const sociosSnapshot = await collection(db, 'socios');
      const socios = await getDocs(sociosSnapshot);
      
      const expedientes = [];
      
      for (const socioDoc of socios.docs) {
        const email = socioDoc.id;
        const socioData = socioDoc.data();
        
        // Cargar armas del socio
        const armasSnapshot = await getDocs(
          collection(db, 'socios', email, 'armas')
        );
        
        const totalArmas = armasSnapshot.size;
        let armasConPDF = 0;
        
        // Contar armas con PDF
        armasSnapshot.forEach(armaDoc => {
          if (armaDoc.data().documentoRegistro) {
            armasConPDF++;
          }
        });
        
        // Verificar documentos en Storage
        const docs = {
          ine: false,
          ineUrl: null,
          curp: false,
          curpUrl: null,
          certificadoAntecedentes: false,
          certificadoUrl: null,
          certificadoVigente: null, // null | true | false
          certificadoFecha: null
        };
        
        // Verificar INE - Usar solo documentosPETA de Firestore (evitar 403s de Storage)
        try {
          const files = socioData.documentosPETA?.ine;
          if (files?.url) {
            docs.ine = true;
            docs.ineUrl = files.url;
          }
        } catch {}
        
        // Verificar CURP - Usar solo documentosPETA de Firestore
        try {
          const files = socioData.documentosPETA?.curp;
          if (files?.url) {
            docs.curp = true;
            docs.curpUrl = files.url;
          }
        } catch {}
        
        // Verificar Certificado Antecedentes con validación de vigencia - Usar solo Firestore
        try {
          const files = socioData.documentosPETA?.constanciaAntecedentes;
          if (files?.url && files?.fechaSubida) {
            docs.certificadoAntecedentes = true;
            docs.certificadoUrl = files.url;
            docs.certificadoFecha = files.fechaSubida.toDate();
            
            // Validar vigencia (6 meses = 180 días)
            const hoy = new Date();
            const diasTranscurridos = Math.floor((hoy - docs.certificadoFecha) / (1000 * 60 * 60 * 24));
            docs.certificadoVigente = diasTranscurridos <= 180;
          }
        } catch {}
        
        // Calcular progreso
        let puntosCompletos = 0;
        let puntosTotales = 4;
        
        if (armasConPDF === totalArmas && totalArmas > 0) puntosCompletos++;
        if (docs.ine) puntosCompletos++;
        if (docs.curp) puntosCompletos++;
        if (docs.certificadoAntecedentes && docs.certificadoVigente) puntosCompletos++;
        
        const progreso = Math.round((puntosCompletos / puntosTotales) * 100);
        
        expedientes.push({
          email,
          nombre: socioData.nombre || email,
          totalArmas,
          armasConPDF,
          ...docs,
          progreso,
          completo: puntosCompletos === puntosTotales
        });
      }
      
      setSocios(expedientes);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
      alert('Error cargando datos de expedientes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar
  const sociosFiltrados = socios
    .filter(s => {
      // Filtro por búsqueda
      if (busqueda && !s.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      
      // Filtros rápidos
      if (filtro === 'incompletos' && s.completo) return false;
      if (filtro === 'sin-armas' && s.armasConPDF === s.totalArmas) return false;
      if (filtro === 'sin-ine' && s.ine) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (ordenar === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (ordenar === 'progreso') return b.progreso - a.progreso;
      if (ordenar === 'armas') return (a.armasConPDF / a.totalArmas || 0) - (b.armasConPDF / b.totalArmas || 0);
      return 0;
    });

  // Estadísticas generales
  const stats = {
    total: socios.length,
    completos: socios.filter(s => s.completo).length,
    sinArmas: socios.filter(s => s.totalArmas > 0 && s.armasConPDF < s.totalArmas).length,
    sinINE: socios.filter(s => !s.ine).length,
    certVencido: socios.filter(s => s.certificadoAntecedentes && s.certificadoVigente === false).length
  };

  const exportarCSV = () => {
    const headers = 'Nombre,Email,Armas con PDF,Total Armas,INE,CURP,Cert. Antecedentes,Vigente,Progreso\n';
    const rows = sociosFiltrados.map(s => 
      `"${s.nombre}",${s.email},${s.armasConPDF},${s.totalArmas},${s.ine ? 'Sí' : 'No'},${s.curp ? 'Sí' : 'No'},${s.certificadoAntecedentes ? 'Sí' : 'No'},${s.certificadoVigente ? 'Sí' : s.certificadoVigente === false ? 'Vencido' : 'N/A'},${s.progreso}%`
    ).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expedientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="reportador-loading">⏳ Cargando expedientes de {socios.length || '...'} socios...</div>;
  }

  return (
    <div className="reportador-expedientes">
      <div className="reportador-header">
        <div className="header-top">
          <div className="header-title">
            <h2>📋 Reportador de Expedientes Digitales</h2>
            <p className="reportador-descripcion">
              Auditoría de documentación PETA - Enfoque: PDFs de Armas e Identificaciones
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="reportador-stats">
        <div className="stat-card">
          <div className="stat-numero">{stats.total}</div>
          <div className="stat-label">Total Socios</div>
        </div>
        <div className="stat-card completo">
          <div className="stat-numero">{stats.completos}</div>
          <div className="stat-label">Completos</div>
        </div>
        <div className="stat-card alerta">
          <div className="stat-numero">{stats.sinArmas}</div>
          <div className="stat-label">Sin PDFs Armas</div>
        </div>
        <div className="stat-card alerta">
          <div className="stat-numero">{stats.sinINE}</div>
          <div className="stat-label">Sin INE</div>
        </div>
        <div className="stat-card peligro">
          <div className="stat-numero">{stats.certVencido}</div>
          <div className="stat-label">Cert. Vencido (&gt;6m)</div>
        </div>
      </div>

      {/* Controles */}
      <div className="reportador-controles">
        <div className="controles-filtros">
          <button 
            className={filtro === 'todos' ? 'activo' : ''}
            onClick={() => setFiltro('todos')}
          >
            Todos
          </button>
          <button 
            className={filtro === 'incompletos' ? 'activo' : ''}
            onClick={() => setFiltro('incompletos')}
          >
            Incompletos
          </button>
          <button 
            className={filtro === 'sin-armas' ? 'activo' : ''}
            onClick={() => setFiltro('sin-armas')}
          >
            Sin PDFs Armas
          </button>
          <button 
            className={filtro === 'sin-ine' ? 'activo' : ''}
            onClick={() => setFiltro('sin-ine')}
          >
            Sin INE
          </button>
        </div>

        <div className="controles-busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
        </div>

        <div className="controles-acciones">
          <select 
            value={ordenar} 
            onChange={(e) => setOrdenar(e.target.value)}
            className="ordenar-select"
          >
            <option value="nombre">Ordenar: Nombre</option>
            <option value="progreso">Ordenar: Progreso</option>
            <option value="armas">Ordenar: Armas</option>
          </select>
          
          <button onClick={exportarCSV} className="btn-exportar">
            📥 Exportar CSV
          </button>
          
          <button onClick={cargarExpedientes} className="btn-refrescar">
            🔄 Refrescar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="reportador-tabla-container">
        <table className="reportador-tabla">
          <thead>
            <tr>
              <th>Socio</th>
              <th className="col-armas">PDFs Armas</th>
              <th className="col-doc">INE</th>
              <th className="col-doc">CURP</th>
              <th className="col-cert">Cert. Antecedentes</th>
              <th className="col-progreso">Progreso</th>
            </tr>
          </thead>
          <tbody>
            {sociosFiltrados.map(socio => (
              <tr key={socio.email} className={socio.completo ? 'completo' : 'incompleto'}>
                <td className="col-nombre">
                  <div className="socio-nombre">{socio.nombre}</div>
                  <div className="socio-email">{socio.email}</div>
                </td>
                
                <td className="col-armas">
                  {socio.totalArmas > 0 ? (
                    <div className="armas-indicador">
                      <span className={socio.armasConPDF === socio.totalArmas ? 'completo' : 'incompleto'}>
                        {socio.armasConPDF === socio.totalArmas ? '✅' : '⚠️'}
                      </span>
                      <span className="armas-numeros">
                        {socio.armasConPDF} / {socio.totalArmas}
                      </span>
                    </div>
                  ) : (
                    <span className="sin-armas">Sin armas</span>
                  )}
                </td>
                
                <td className="col-doc">
                  {socio.ine && socio.ineUrl ? (
                    <a 
                      href={socio.ineUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="doc-estado si"
                      title="Abrir INE"
                    >
                      ✅
                    </a>
                  ) : (
                    <span className="doc-estado no">❌</span>
                  )}
                </td>
                
                <td className="col-doc">
                  {socio.curp && socio.curpUrl ? (
                    <a 
                      href={socio.curpUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="doc-estado si"
                      title="Abrir CURP"
                    >
                      ✅
                    </a>
                  ) : (
                    <span className="doc-estado no">❌</span>
                  )}
                </td>
                
                <td className="col-cert">
                  {socio.certificadoAntecedentes ? (
                    <div className="cert-info">
                      {socio.certificadoUrl ? (
                        <a 
                          href={socio.certificadoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`cert-estado ${socio.certificadoVigente ? 'vigente' : 'vencido'}`}
                          title="Abrir Certificado de Antecedentes"
                        >
                          {socio.certificadoVigente ? '✅ Vigente' : '⚠️ Vencido'}
                        </a>
                      ) : (
                        <span className={`cert-estado ${socio.certificadoVigente ? 'vigente' : 'vencido'}`}>
                          {socio.certificadoVigente ? '✅ Vigente' : '⚠️ Vencido'}
                        </span>
                      )}
                      {socio.certificadoFecha && (
                        <span className="cert-fecha">
                          {socio.certificadoFecha.toLocaleDateString('es-MX')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="doc-estado no">❌</span>
                  )}
                </td>
                
                <td className="col-progreso">
                  <div className="progreso-container">
                    <div className="progreso-barra">
                      <div 
                        className="progreso-fill" 
                        style={{ 
                          width: `${socio.progreso}%`,
                          backgroundColor: socio.progreso === 100 ? '#22c55e' : socio.progreso >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                    <span className="progreso-texto">{socio.progreso}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sociosFiltrados.length === 0 && (
        <div className="reportador-vacio">
          No hay socios que coincidan con los filtros seleccionados
        </div>
      )}

      <div className="reportador-summary">
        Mostrando {sociosFiltrados.length} de {socios.length} socios
      </div>

      {/* Footer Institucional */}
      <footer className="reportador-footer">
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
}

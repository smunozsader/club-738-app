/**
 * VerificadorAntecedentes - Verifica vigencia de Constancias de Antecedentes Penales
 * 
 * Busca socios con certificados de antecedentes penales vencidos (>3 meses)
 * para facilitar renovación antes de tramitar nuevos PETAs
 */

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './VerificadorAntecedentes.css';

export default function VerificadorAntecedentes({ userEmail, onBack }) {
  const [loading, setLoading] = useState(true);
  const [antecedentesData, setAntecedentesData] = useState([]);
  const [filter, setFilter] = useState('all'); // all, expired, warning, valid
  const [searchTerm, setSearchTerm] = useState('');

  // Categorías según días de antigüedad
  const getStatus = (fechaUpload) => {
    if (!fechaUpload) return { status: 'missing', label: 'No disponible', days: null };
    
    const uploadDate = new Date(fechaUpload);
    const now = new Date();
    const daysOld = Math.floor((now - uploadDate) / (1000 * 60 * 60 * 24));
    
    if (daysOld > 90) {
      return { status: 'expired', label: 'VENCIDO', days: daysOld, color: '#dc2626' };
    } else if (daysOld > 75) {
      return { status: 'warning', label: 'PRÓXIMO A VENCER', days: daysOld, color: '#f59e0b' };
    } else {
      return { status: 'valid', label: 'VIGENTE', days: daysOld, color: '#10b981' };
    }
  };

  useEffect(() => {
    const cargarAntecedentes = async () => {
      try {
        setLoading(true);
        const sociosRef = collection(db, 'socios');
        const sociosSnap = await getDocs(sociosRef);
        
        const datos = [];
        
        for (const socioDoc of sociosSnap.docs) {
          const socioData = socioDoc.data();
          const socioEmail = socioDoc.id;
          
          // Buscar documento de antecedentes
          const docRef = doc(db, 'socios', socioEmail, 'documentos', 'constanciaAntecedentes');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const docData = docSnap.data();
            const status = getStatus(docData.fechaUpload);
            
            datos.push({
              email: socioEmail,
              nombre: socioData.nombre || 'N/A',
              apellidos: socioData.apellidos || 'N/A',
              estado: status,
              fechaUpload: docData.fechaUpload ? new Date(docData.fechaUpload).toLocaleDateString('es-MX') : 'N/A',
              url: docData.url || null
            });
          }
        }
        
        // Ordenar por días antigüedad (más antiguos primero)
        datos.sort((a, b) => (b.estado.days || -1) - (a.estado.days || -1));
        
        setAntecedentesData(datos);
      } catch (error) {
        console.error('Error cargando antecedentes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarAntecedentes();
  }, []);

  // Filtrar datos
  const filteredData = antecedentesData.filter(item => {
    const matchFilter = filter === 'all' || item.estado.status === filter;
    const matchSearch = 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Estadísticas
  const stats = {
    total: antecedentesData.length,
    expired: antecedentesData.filter(d => d.estado.status === 'expired').length,
    warning: antecedentesData.filter(d => d.estado.status === 'warning').length,
    valid: antecedentesData.filter(d => d.estado.status === 'valid').length,
    missing: antecedentesData.filter(d => d.estado.status === 'missing').length
  };

  return (
    <div className="verificador-antecedentes">
      <div className="va-header">
        <h2>📜 Vigencia de Antecedentes Penales</h2>
        <button onClick={onBack} className="va-back-button">← Atrás</button>
      </div>

      {/* Estadísticas */}
      <div className="va-stats">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Socios</div>
        </div>
        <div className="stat-card expired">
          <div className="stat-number">{stats.expired}</div>
          <div className="stat-label">Vencidos (&gt;90 días)</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{stats.warning}</div>
          <div className="stat-label">Próximos a vencer (75-90 días)</div>
        </div>
        <div className="stat-card valid">
          <div className="stat-number">{stats.valid}</div>
          <div className="stat-label">Vigentes (menos de 75 días)</div>
        </div>
        <div className="stat-card missing">
          <div className="stat-number">{stats.missing}</div>
          <div className="stat-label">Sin documento</div>
        </div>
      </div>

      {/* Controles de filtro y búsqueda */}
      <div className="va-controls">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="va-search"
        />
        
        <div className="va-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({antecedentesData.length})
          </button>
          <button
            className={`filter-btn expired ${filter === 'expired' ? 'active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Vencidos ({stats.expired})
          </button>
          <button
            className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Próximos ({stats.warning})
          </button>
          <button
            className={`filter-btn valid ${filter === 'valid' ? 'active' : ''}`}
            onClick={() => setFilter('valid')}
          >
            Vigentes ({stats.valid})
          </button>
        </div>
      </div>

      {/* Tabla de resultados */}
      {loading ? (
        <div className="va-loading">Cargando datos...</div>
      ) : filteredData.length === 0 ? (
        <div className="va-empty">No hay resultados</div>
      ) : (
        <div className="va-table-container">
          <table className="va-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Antigüedad</th>
                <th>Fecha Upload</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className={`status-${item.estado.status}`}>
                  <td>
                    <strong>{item.nombre} {item.apellidos}</strong>
                  </td>
                  <td className="email">{item.email}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: item.estado.color }}
                    >
                      {item.estado.label}
                    </span>
                  </td>
                  <td>
                    {item.estado.days !== null ? `${item.estado.days} días` : 'N/A'}
                  </td>
                  <td>{item.fechaUpload}</td>
                  <td>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="va-link"
                        title="Ver documento"
                      >
                        📄 Ver
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notas informativas */}
      <div className="va-notes">
        <h3>ℹ️ Información</h3>
        <ul>
          <li><strong>Vigentes:</strong> Certificados con menos de 75 días de antigüedad</li>
          <li><strong>Próximos a vencer:</strong> Certificados entre 75-90 días (renovar pronto)</li>
          <li><strong>Vencidos:</strong> Certificados con más de 90 días (RENOVACIÓN OBLIGATORIA antes de PETA)</li>
          <li>Se recomienda que los socios con antecedentes vencidos renueven antes de tramitar nuevos PETAs</li>
        </ul>
      </div>
    </div>
  );
}

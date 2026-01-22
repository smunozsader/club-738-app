import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useToastContext } from '../../../contexts/ToastContext';
import OficioTipo1 from './oficios/OficioTipo1';
import OficioTipo2 from './oficios/OficioTipo2';
import OficioTipo3 from './oficios/OficioTipo3';
import OficioTipo4 from './oficios/OficioTipo4';
import './GeneradorOficios.css';

const GeneradorOficios = ({ userEmail, onBack }) => {
  const { showToast } = useToastContext();
  const [tipoOficio, setTipoOficio] = useState(1);
  const [socios, setSocios] = useState([]);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const tipos = [
    { id: 1, nombre: 'Solicitud PETA', desc: 'Se remite solicitud de PETA de un socio' },
    { id: 2, nombre: 'Relación Actualizada', desc: 'Se remite relación actualizada de socios y armas' },
    { id: 3, nombre: 'Anexos A, B, C', desc: 'Se remite información requerida por DN27' },
    { id: 4, nombre: 'Formato Libre', desc: 'Asunto personalizado para comunicaciones especiales' }
  ];

  // Cargar socios de Firebase
  useEffect(() => {
    const q = query(collection(db, 'socios'), where('estado', '==', 'activo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sociosList = snapshot.docs.map(doc => ({
        email: doc.id,
        ...doc.data()
      }));
      setSocios(sociosList);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerarPDF = async () => {
    if (!socioSeleccionado && tipoOficio !== 4) {
      showToast('Selecciona un socio', 'warning', 3000);
      return;
    }

    setLoading(true);
    try {
      showToast('Generando PDF...', 'info');
      // TODO: Implementar generación según tipo
      showToast('PDF generado ✓', 'success', 3000);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error generando PDF', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const renderFormulario = () => {
    switch (tipoOficio) {
      case 1:
        return <OficioTipo1 socio={socioSeleccionado} />;
      case 2:
        return <OficioTipo2 socio={socioSeleccionado} />;
      case 3:
        return <OficioTipo3 />;
      case 4:
        return <OficioTipo4 />;
      default:
        return null;
    }
  };

  return (
    <div className="generador-oficios">
      <div className="header-panel">
        <button className="btn-back" onClick={onBack}>← Atrás</button>
        <h2>📮 Generador de Oficios</h2>
      </div>

      <div className="tipo-selector">
        <h3>Selecciona tipo de oficio</h3>
        <div className="tipos-grid">
          {tipos.map(tipo => (
            <div 
              key={tipo.id}
              className={`tipo-card ${tipoOficio === tipo.id ? 'active' : ''}`}
              onClick={() => setTipoOficio(tipo.id)}
            >
              <div className="tipo-number">Tipo {tipo.id}</div>
              <h4>{tipo.nombre}</h4>
              <p>{tipo.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="form-panel">
        <h3>Datos del Oficio</h3>

        {tipoOficio !== 4 && tipoOficio !== 3 && (
          <div className="form-group">
            <label>Socio</label>
            <select 
              value={socioSeleccionado?.email || ''}
              onChange={(e) => {
                const socio = socios.find(s => s.email === e.target.value);
                setSocioSeleccionado(socio);
              }}
            >
              <option value="">-- Selecciona un socio --</option>
              {socios.map(s => (
                <option key={s.email} value={s.email}>
                  {s.credencial} - {s.nombre} {s.apellidoPaterno}
                </option>
              ))}
            </select>
          </div>
        )}

        {renderFormulario()}

        <div className="btn-group">
          <button 
            onClick={() => setPreview(!preview)}
            className="btn btn-secondary"
          >
            {preview ? '✓ Cerrar Preview' : '👁️ Ver Preview'}
          </button>
          <button 
            onClick={handleGenerarPDF}
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? 'Generando...' : '💾 Generar PDF'}
          </button>
        </div>
      </div>

      {preview && (
        <div className="preview-panel">
          <h3>Preview</h3>
          <div className="preview-content">
            {/* TODO: mostrar preview del oficio */}
            <p>Preview se mostrará aquí</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneradorOficios;

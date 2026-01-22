import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
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
  const formRef = useRef(null);

  const tipos = [
    { id: 1, nombre: 'Solicitud PETA', desc: 'Se remite solicitud de PETA de un socio' },
    { id: 2, nombre: 'Relación Actualizada', desc: 'Se remite relación actualizada de socios y armas' },
    { id: 3, nombre: 'Anexos A, B, C', desc: 'Se remite información requerida por DN27' },
    { id: 4, nombre: 'Formato Libre', desc: 'Asunto personalizado para comunicaciones especiales' }
  ];

  // Cargar socios de Firebase
  useEffect(() => {
    try {
      // Cargar TODOS los socios sin filtro por estado
      const q = query(collection(db, 'socios'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const sociosList = snapshot.docs
          .map(doc => ({
            email: doc.id,
            ...doc.data()
          }))
          .filter(s => s.nombre && s.email) // Filtrar socios con datos básicos
          .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        
        console.log('Socios cargados:', sociosList.length);
        setSocios(sociosList);
      }, (error) => {
        console.error('Error cargando socios:', error);
        showToast('Error al cargar socios', 'error', 3000);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error en useEffect socios:', error);
    }
  }, [showToast]);

  const handleGenerarPDF = async () => {
    if (!socioSeleccionado && tipoOficio !== 4 && tipoOficio !== 3) {
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

  // Generar contenido del preview
  const generarPreview = () => {
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const hora = new Date().toLocaleTimeString('es-MX');

    let contenido = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="/logo.jpg" alt="Club 738" style="width: 80px; height: 80px; margin-bottom: 10px;" />
          <h2 style="margin: 5px 0;">CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN A.C.</h2>
          <p style="margin: 0; color: #666;">Afiliación SEDENA #738</p>
        </div>
        
        <div style="border-top: 2px solid #ccc; border-bottom: 2px solid #ccc; padding: 15px 0; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-weight: bold;">OFICIO TIPO ${tipoOficio}</p>
          <p style="margin: 5px 0; color: #666;">Generado: ${fecha} a las ${hora}</p>
        </div>
    `;

    if (socioSeleccionado) {
      contenido += `
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #007bff;">
          <p><strong>Socio:</strong> ${socioSeleccionado.nombre} ${socioSeleccionado.apellidoPaterno || ''}</p>
          <p><strong>Credencial:</strong> ${socioSeleccionado.credencial || 'N/A'}</p>
          <p><strong>Email:</strong> ${socioSeleccionado.email}</p>
        </div>
      `;
    }

    switch(tipoOficio) {
      case 1:
        contenido += `
          <div style="margin: 20px 0;">
            <h3>SOLICITUD DE PETA</h3>
            <p>Se solicita la emisión de una PETA (Permiso Especial para Tenencia de Arma) conforme a lo dispuesto en la Ley Federal de Armas de Fuego y Explosivos.</p>
            <p><strong>Contexto:</strong> Se realizarán actividades de tiro deportivo.</p>
          </div>
        `;
        break;
      case 2:
        contenido += `
          <div style="margin: 20px 0;">
            <h3>RELACIÓN ACTUALIZADA DE ARMAS</h3>
            <p>Se remite relación actualizada de armas registradas a nombre del socio conforme a los registros del Sistema Nacional de Armas.</p>
            <p style="color: #666; font-size: 13px;"><em>Documento adjunto: RELACIÓN COMPLETA CON DETALLES DE ARMAS</em></p>
          </div>
        `;
        break;
      case 3:
        contenido += `
          <div style="margin: 20px 0;">
            <h3>REMITE ANEXOS A, B, C - DN27</h3>
            <p>Se remiten los documentos requeridos por la Dirección Nacional (DN27) de la SEDENA conforme al formato oficial.</p>
            <ul>
              <li>Anexo A: Relación de Socios Activos</li>
              <li>Anexo B: Cédula de Totales y Estadísticas</li>
              <li>Anexo C: Información del Club con Consolidados</li>
            </ul>
          </div>
        `;
        break;
      case 4:
        const inputAsunto = formRef.current?.querySelector('input[placeholder*="Ej: Solicitud"]')?.value || 'Sin asunto';
        const editorCuerpo = formRef.current?.querySelector('[contentEditable]')?.innerHTML || 'Sin contenido';
        contenido += `
          <div style="margin: 20px 0;">
            <p><strong>ASUNTO:</strong> ${inputAsunto}</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
            <div style="margin: 20px 0;">
              ${editorCuerpo || '<p style="color: #999;"><em>El contenido aparecerá aquí...</em></p>'}
            </div>
          </div>
        `;
        break;
    }

    contenido += `
      <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #ccc;">
        <p style="text-align: center; color: #999; font-size: 12px;">
          Este es un PREVIEW del documento. La versión final incluirá firmas digitales y sellos oficiales.
        </p>
      </div>
    </div>
    `;

    return contenido;
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

      <div className="form-panel" ref={formRef}>
        <h3>Datos del Oficio</h3>

        <div className="form-group">
          <label>Socio {tipoOficio === 1 || tipoOficio === 2 ? '(Opcional)' : '(No aplica)'}</label>
          <select 
            value={socioSeleccionado?.email || ''}
            onChange={(e) => {
              const socio = socios.find(s => s.email === e.target.value);
              setSocioSeleccionado(socio);
            }}
          >
            <option value="">-- Selecciona un socio --</option>
            {socios.length > 0 ? socios.map(s => (
              <option key={s.email} value={s.email}>
                {s.credencial ? `${s.credencial} - ` : ''}{s.nombre} {s.apellidoPaterno || ''}
              </option>
            )) : (
              <option disabled>Cargando socios...</option>
            )}
          </select>
          {socios.length === 0 && (
            <small style={{ color: '#ff6b6b', marginTop: '5px', display: 'block' }}>
              ⚠️ No se encontraron socios. Verifica la conexión con Firestore.
            </small>
          )}
        </div>

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
          <h3>Preview del Oficio</h3>
          <div className="preview-content" dangerouslySetInnerHTML={{ __html: generarPreview() }} />
        </div>
      )}
    </div>
  );
};

export default GeneradorOficios;

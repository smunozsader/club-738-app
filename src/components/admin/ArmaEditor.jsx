import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig';
import { doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import './ArmaEditor.css';

export default function ArmaEditor({ 
  socioEmail, 
  armaData = null, 
  armaId = null, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    clase: '',
    calibre: '',
    marca: '',
    modelo: '',
    matricula: '',
    folio: '',
    modalidad: 'tiro'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modoEdicion = armaData !== null;

  useEffect(() => {
    if (armaData) {
      setFormData({
        clase: armaData.clase || '',
        calibre: armaData.calibre || '',
        marca: armaData.marca || '',
        modelo: armaData.modelo || '',
        matricula: armaData.matricula || '',
        folio: armaData.folio || '',
        modalidad: armaData.modalidad || 'tiro'
      });
    }
  }, [armaData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.clase.trim()) {
      setError('La clase de arma es obligatoria');
      return false;
    }
    if (!formData.calibre.trim()) {
      setError('El calibre es obligatorio');
      return false;
    }
    if (!formData.marca.trim()) {
      setError('La marca es obligatoria');
      return false;
    }
    if (!formData.modelo.trim()) {
      setError('El modelo es obligatorio');
      return false;
    }
    if (!formData.matricula.trim()) {
      setError('La matrícula es obligatoria');
      return false;
    }
    if (!formData.folio.trim()) {
      setError('El folio es obligatorio');
      return false;
    }
    return true;
  };

  const crearLogAuditoria = async (accion, detalles) => {
    try {
      const adminEmail = auth.currentUser?.email || 'sistema';
      await addDoc(collection(db, 'auditoria'), {
        tipo: 'arma',
        accion,
        socioEmail,
        armaId: armaId || 'nueva',
        detalles,
        adminEmail,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Error al crear log de auditoría:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const armasRef = collection(db, 'socios', socioEmail, 'armas');
      
      if (modoEdicion && armaId) {
        // Actualizar arma existente
        const armaDocRef = doc(db, 'socios', socioEmail, 'armas', armaId);
        await updateDoc(armaDocRef, {
          ...formData,
          fechaActualizacion: serverTimestamp()
        });

        // Log de auditoría
        await crearLogAuditoria('editar', {
          antes: armaData,
          despues: formData
        });

        alert('Arma actualizada correctamente');
      } else {
        // Crear nueva arma
        const nuevoArmaDoc = await addDoc(armasRef, {
          ...formData,
          fechaCreacion: serverTimestamp(),
          creadoPorAdmin: auth.currentUser?.email || 'sistema'
        });

        // Log de auditoría
        await crearLogAuditoria('crear', {
          arma: formData,
          armaId: nuevoArmaDoc.id
        });

        alert('Arma agregada correctamente');
      }

      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err) {
      console.error('Error al guardar arma:', err);
      setError('Error al guardar el arma. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arma-editor-overlay" onClick={onClose}>
      <div className="arma-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="arma-editor-header">
          <h2>{modoEdicion ? 'Editar Arma' : 'Agregar Nueva Arma'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="arma-editor-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clase">
                Clase de Arma <span className="required">*</span>
              </label>
              <select
                id="clase"
                name="clase"
                value={formData.clase}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="PISTOLA">PISTOLA</option>
                <option value="REVOLVER">REVOLVER</option>
                <option value="ESCOPETA">ESCOPETA</option>
                <option value="RIFLE">RIFLE</option>
                <option value="CARABINA">CARABINA</option>
                <option value="RIFLE PCP">RIFLE PCP</option>
                <option value="PISTOLA PCP">PISTOLA PCP</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="calibre">
                Calibre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="calibre"
                name="calibre"
                value={formData.calibre}
                onChange={handleChange}
                placeholder="Ej: .22, 9mm, .380"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marca">
                Marca <span className="required">*</span>
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Ej: GLOCK, BERETTA, REMINGTON"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">
                Modelo <span className="required">*</span>
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Ej: 19, 92FS, 870"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="matricula">
                Matrícula <span className="required">*</span>
              </label>
              <input
                type="text"
                id="matricula"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                placeholder="Número de serie del arma"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="folio">
                Folio <span className="required">*</span>
              </label>
              <input
                type="text"
                id="folio"
                name="folio"
                value={formData.folio}
                onChange={handleChange}
                placeholder="Folio de registro SEDENA"
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="modalidad">
              Modalidad <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="modalidad"
                  value="caza"
                  checked={formData.modalidad === 'caza'}
                  onChange={handleChange}
                />
                <span>Caza</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="modalidad"
                  value="tiro"
                  checked={formData.modalidad === 'tiro'}
                  onChange={handleChange}
                />
                <span>Tiro</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="modalidad"
                  value="ambas"
                  checked={formData.modalidad === 'ambas'}
                  onChange={handleChange}
                />
                <span>Ambas</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (modoEdicion ? 'Actualizar Arma' : 'Agregar Arma')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

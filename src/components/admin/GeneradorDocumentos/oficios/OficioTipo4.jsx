import React, { useState } from 'react';

const OficioTipo4 = () => {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  return (
    <div className="oficio-tipo4">
      <div className="form-group">
        <label>ASUNTO</label>
        <input 
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Solicitud de revisión de expediente"
          maxLength="200"
        />
      </div>

      <div className="form-group">
        <label>CUERPO DEL OFICIO</label>
        <textarea 
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Redacta el contenido del oficio aquí..."
          rows="8"
        />
      </div>

      <div className="form-group">
        <label>Documentos Adjuntos (opcional)</label>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" /> RELACIÓN
          </label>
          <label>
            <input type="checkbox" /> ANEXO A
          </label>
          <label>
            <input type="checkbox" /> ANEXO B
          </label>
          <label>
            <input type="checkbox" /> ANEXO C
          </label>
        </div>
      </div>
    </div>
  );
};

export default OficioTipo4;

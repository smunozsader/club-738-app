import React, { useState } from 'react';

const OficioTipo1 = ({ socio }) => {
  const [contexto, setContexto] = useState('TIRO');

  if (!socio) return null;

  return (
    <div className="oficio-tipo1">
      <div className="form-group">
        <label>Contexto PETA</label>
        <select value={contexto} onChange={(e) => setContexto(e.target.value)}>
          <option value="COMPETENCIA">Competencia</option>
          <option value="COMPETENCIA NACIONAL">Competencia Nacional</option>
          <option value="TIRO">Tiro</option>
          <option value="PRÁCTICA TIRO">Práctica Tiro</option>
        </select>
      </div>

      <div className="info-socio">
        <p><strong>Socio:</strong> {socio.nombre} {socio.apellidoPaterno} {socio.apellidoMaterno}</p>
        <p><strong>Credencial:</strong> {socio.credencial}</p>
        <p><strong>CURP:</strong> {socio.curp}</p>
      </div>
    </div>
  );
};

export default OficioTipo1;

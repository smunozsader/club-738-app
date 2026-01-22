import React from 'react';

const OficioTipo2 = ({ socio }) => {
  if (!socio) return null;

  return (
    <div className="oficio-tipo2">
      <div className="info-bloque">
        <h4>Relación Actualizada de Armas</h4>
        <p><strong>Socio:</strong> {socio.nombre} {socio.apellidoPaterno}</p>
        <p><strong>Credencial:</strong> {socio.credencial}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="note">Se incluye información actualizada de armas registradas</p>
      </div>
    </div>
  );
};

export default OficioTipo2;

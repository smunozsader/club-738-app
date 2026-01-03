import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ percent, completed, total }) {
  const getStatusColor = () => {
    if (percent >= 100) return '#4caf50';
    if (percent >= 70) return '#8bc34a';
    if (percent >= 40) return '#ff9800';
    return '#f44336';
  };

  const getStatusMessage = () => {
    if (percent >= 100) return '¡Expediente completo! 🎉';
    if (percent >= 70) return '¡Casi listo! Solo faltan algunos documentos';
    if (percent >= 40) return 'Buen progreso, sigue subiendo documentos';
    return 'Comienza subiendo tus documentos';
  };

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-title">Progreso de tu expediente</span>
        <span className="progress-count">{completed} de {total} documentos</span>
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${percent}%`,
            backgroundColor: getStatusColor()
          }}
        >
          <span className="progress-percent">{percent}%</span>
        </div>
      </div>
      
      <p className="progress-message" style={{ color: getStatusColor() }}>
        {getStatusMessage()}
      </p>
    </div>
  );
}

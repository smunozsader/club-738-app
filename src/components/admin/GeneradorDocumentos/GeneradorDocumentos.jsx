import React, { useState } from 'react';
import ReportesBimestrales from './ReportesBimestrales';
import RegistroDocumentos from './RegistroDocumentos';
import './GeneradorDocumentos.css';

const GeneradorDocumentos = ({ userEmail, onBack }) => {
  const [activeTab, setActiveTab] = useState('reportes'); // reportes | historico

  return (
    <div className="generador-documentos-wrapper">
      <div className="tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'reportes' ? 'active' : ''}`}
          onClick={() => setActiveTab('reportes')}
        >
          📊 Reportes Bimestrales
        </button>
        <button 
          className={`tab-btn ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          📋 Histórico
        </button>
      </div>

      <div className="tabs-content">
        {activeTab === 'reportes' && (
          <ReportesBimestrales userEmail={userEmail} onBack={onBack} />
        )}
        {activeTab === 'historico' && (
          <RegistroDocumentos userEmail={userEmail} onBack={onBack} />
        )}
      </div>
    </div>
  );
};

export default GeneradorDocumentos;

import React, { useState } from 'react';
import ReportesBimestrales from './ReportesBimestrales';
import GeneradorOficios from './GeneradorOficios';
import RegistroDocumentos from './RegistroDocumentos';
import './GeneradorDocumentos.css';

const GeneradorDocumentos = ({ userEmail, onBack }) => {
  const [activeTab, setActiveTab] = useState('reportes'); // reportes | oficios | historico

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
          className={`tab-btn ${activeTab === 'oficios' ? 'active' : ''}`}
          onClick={() => setActiveTab('oficios')}
        >
          📮 Generador de Oficios
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
        {activeTab === 'oficios' && (
          <GeneradorOficios userEmail={userEmail} onBack={() => setActiveTab('reportes')} />
        )}
        {activeTab === 'historico' && (
          <RegistroDocumentos userEmail={userEmail} onBack={onBack} />
        )}
      </div>
    </div>
  );
};

export default GeneradorDocumentos;

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import './RegistroDocumentos.css';

const RegistroDocumentos = ({ userEmail, onBack }) => {
  const [documentos, setDocumentos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    const q = query(
      collection(db, 'reportes_bimestrales'),
      orderBy('fechaReporte', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocumentos(docs);
    });

    return () => unsubscribe();
  }, []);

  const documentosFiltrados = documentos.filter(doc => {
    if (filtroEstado !== 'todos' && doc.estado !== filtroEstado) return false;
    return true;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      'draft': 'BORRADOR',
      'generado': 'GENERADO',
      'enviado': 'ENVIADO'
    };
    return badges[estado] || estado;
  };

  const getMesBimestre = (bimestre) => {
    const meses = ['', 'Febrero', 'Abril', 'Junio', 'Agosto', 'Octubre', 'Diciembre'];
    return meses[bimestre] || '';
  };

  return (
    <div className="registro-documentos">
      <div className="header-panel">
        <button className="btn-back" onClick={onBack}>← Atrás</button>
        <h2>📋 Histórico de Documentos</h2>
      </div>

      <div className="filtros-panel">
        <div className="filtro-group">
          <label>Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="draft">Borrador</option>
            <option value="generado">Generado</option>
            <option value="enviado">Enviado</option>
          </select>
        </div>
      </div>

      {documentosFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>No hay documentos generados aún</p>
        </div>
      ) : (
        <div className="documentos-tabla">
          <table>
            <thead>
              <tr>
                <th>Bimestre</th>
                <th>Año</th>
                <th>Generado Por</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Descargas</th>
              </tr>
            </thead>
            <tbody>
              {documentosFiltrados.map(doc => (
                <tr key={doc.id}>
                  <td>{getMesBimestre(doc.bimestre)}</td>
                  <td>{doc.ano}</td>
                  <td>{doc.generadoPor?.split('@')[0]}</td>
                  <td>{new Date(doc.fechaReporte?.toDate()).toLocaleDateString('es-MX')}</td>
                  <td>
                    <span className={`badge badge-${doc.estado}`}>
                      {getEstadoBadge(doc.estado)}
                    </span>
                  </td>
                  <td className="descargas-cell">
                    {doc.documentos?.relacion && (
                      <a href={doc.documentos.relacion.url} download className="btn-download">
                        REL
                      </a>
                    )}
                    {doc.documentos?.anexoA && (
                      <a href={doc.documentos.anexoA.url} download className="btn-download">
                        A
                      </a>
                    )}
                    {doc.documentos?.anexoB && (
                      <a href={doc.documentos.anexoB.url} download className="btn-download">
                        B
                      </a>
                    )}
                    {doc.documentos?.anexoC && (
                      <a href={doc.documentos.anexoC.url} download className="btn-download">
                        C
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegistroDocumentos;

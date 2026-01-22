import React, { useState, useRef } from 'react';

const OficioTipo1 = ({ socio }) => {
  const [contexto, setContexto] = useState('TIRO');
  const [asunto, setAsunto] = useState('');
  const editorRef = useRef(null);

  const aplicarFormato = (comando, valor = null) => {
    document.execCommand(comando, false, valor);
    editorRef.current?.focus();
  };

  const cambiarTamano = (tamano) => {
    document.execCommand('fontSize', false, tamano);
    editorRef.current?.focus();
  };

  const limpiarFormato = () => {
    document.execCommand('removeFormat', false);
    editorRef.current?.focus();
  };

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

      <div className="form-group">
        <label>ASUNTO (Opcional)</label>
        <input 
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Solicitud de PETA para socio..."
          maxLength="200"
        />
      </div>

      <div className="form-group">
        <label>Notas Adicionales (Opcional)</label>
        
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" title="Negrita" onClick={() => aplicarFormato('bold')}><strong>N</strong></button>
            <button type="button" className="toolbar-btn" title="Itálica" onClick={() => aplicarFormato('italic')}><em>I</em></button>
            <button type="button" className="toolbar-btn" title="Subrayado" onClick={() => aplicarFormato('underline')}><u>S</u></button>
          </div>
          <div className="toolbar-group">
            <select className="toolbar-select" defaultValue="" onChange={(e) => cambiarTamano(e.target.value)}>
              <option value="">Tamaño</option>
              <option value="3">Normal</option>
              <option value="4">Grande</option>
              <option value="5">Muy grande</option>
            </select>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn btn-danger" title="Limpiar" onClick={limpiarFormato}>✕</button>
          </div>
        </div>
        
        <div ref={editorRef} className="text-editor" contentEditable suppressContentEditableWarning />
      </div>

      <div className="info-socio">
        {socio ? (
          <>
            <p><strong>Socio:</strong> {socio.nombre} {socio.apellidoPaterno} {socio.apellidoMaterno}</p>
            <p><strong>Credencial:</strong> {socio.credencial}</p>
            <p><strong>CURP:</strong> {socio.curp}</p>
          </>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Selecciona un socio arriba para ver sus datos</p>
        )}
      </div>
    </div>
  );
};

export default OficioTipo1;

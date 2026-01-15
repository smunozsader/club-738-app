/**
 * ExpedienteAdminView - Vista completa del expediente de un socio
 * 
 * Permite al administrador:
 * - Ver todos los datos del socio
 * - Ver todos los documentos PETA
 * - Ver arsenal completo
 * - Ver solicitudes PETA
 * - Editar datos (próximamente)
 */
import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import ArmaEditor from './ArmaEditor';
import DatosPersonalesEditor from './editors/DatosPersonalesEditor';
import CURPEditor from './editors/CURPEditor';
import DomicilioEditor from './editors/DomicilioEditor';
import EmailEditor from './editors/EmailEditor';
import './ExpedienteAdminView.css';

export default function ExpedienteAdminView({ socioEmail, onBack }) {
  const [socio, setSocio] = useState(null);
  const [armas, setArmas] = useState([]);
  const [petas, setPetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('datos'); // datos, documentos, armas, petas
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [armaSeleccionada, setArmaSeleccionada] = useState(null);
  const [armaIdSeleccionada, setArmaIdSeleccionada] = useState(null);
  
  // Estados para editores de datos
  const [mostrarNombreEditor, setMostrarNombreEditor] = useState(false);
  const [mostrarCURPEditor, setMostrarCURPEditor] = useState(false);
  const [mostrarDomicilioEditor, setMostrarDomicilioEditor] = useState(false);
  const [mostrarEmailEditor, setMostrarEmailEditor] = useState(false);

  useEffect(() => {
    cargarExpediente();
  }, [socioEmail]);

  const cargarExpediente = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del socio
      const socioRef = doc(db, 'socios', socioEmail);
      const socioSnap = await getDoc(socioRef);

      if (!socioSnap.exists()) {
        setError('Socio no encontrado');
        setLoading(false);
        return;
      }

      const socioData = {
        email: socioEmail,
        ...socioSnap.data()
      };
      setSocio(socioData);

      // Cargar armas
      const armasRef = collection(db, 'socios', socioEmail, 'armas');
      const armasSnap = await getDocs(armasRef);
      const armasData = armasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArmas(armasData);

      // Cargar PETAs
      const petasRef = collection(db, 'socios', socioEmail, 'petas');
      const petasSnap = await getDocs(petasRef);
      const petasData = petasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPetas(petasData);

    } catch (err) {
      console.error('Error cargando expediente:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="expediente-loading">
        <div className="spinner">⏳</div>
        <p>Cargando expediente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expediente-error">
        <p>❌ Error: {error}</p>
        <button onClick={onBack} className="btn-back">← Volver</button>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="expediente-error">
        <p>No se encontró el socio</p>
        <button onClick={onBack} className="btn-back">← Volver</button>
      </div>
    );
  }

  // Calcular progreso de documentos
  const docs = socio.documentosPETA || {};
  const totalDocs = 16;
  const docsSubidos = Object.keys(docs).filter(key => docs[key]?.url).length;
  const progresoDocumentos = Math.round((docsSubidos / totalDocs) * 100);

  // Lista de documentos PETA esperados
  const documentosEsperados = [
    { key: 'ine', label: 'INE' },
    { key: 'curp', label: 'CURP' },
    { key: 'cartillaMilitar', label: 'Cartilla Militar / Acta Nacimiento' },
    { key: 'comprobanteDomicilio', label: 'Comprobante de Domicilio' },
    { key: 'constanciaAntecedentes', label: 'Constancia de Antecedentes Penales' },
    { key: 'certificadoMedico', label: 'Certificado Médico' },
    { key: 'certificadoPsicologico', label: 'Certificado Psicológico' },
    { key: 'certificadoToxicologico', label: 'Certificado Toxicológico' },
    { key: 'modoHonesto', label: 'Carta Modo Honesto de Vivir' },
    { key: 'licenciaCaza', label: 'Licencia de Caza' },
    { key: 'fotoCredencial', label: 'Fotografía' },
    { key: 'reciboE5cinco', label: 'Recibo e5cinco' },
    { key: 'permisoAnterior', label: 'Permiso Anterior (renovación)' }
  ];

  return (
    <div className="expediente-admin-view">
      {/* Header */}
      <div className="expediente-header">
        <button onClick={onBack} className="btn-back">← Volver al Dashboard</button>
        <h1>📋 Expediente: {socio.nombre}</h1>
        <p className="expediente-email">{socio.email}</p>
      </div>

      {/* Resumen rápido */}
      <div className="expediente-resumen">
        <div className="resumen-card">
          <div className="resumen-label">CURP</div>
          <div className="resumen-value">{socio.curp || 'Sin registrar'}</div>
        </div>
        <div className="resumen-card">
          <div className="resumen-label">Armas Registradas</div>
          <div className="resumen-value">{armas.length}</div>
        </div>
        <div className="resumen-card">
          <div className="resumen-label">Documentos PETA</div>
          <div className="resumen-value">{docsSubidos}/16 ({progresoDocumentos}%)</div>
        </div>
        <div className="resumen-card">
          <div className="resumen-label">Solicitudes PETA</div>
          <div className="resumen-value">{petas.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="expediente-tabs">
        <button
          className={`tab ${activeTab === 'datos' ? 'active' : ''}`}
          onClick={() => setActiveTab('datos')}
        >
          👤 Datos Personales
        </button>
        <button
          className={`tab ${activeTab === 'documentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('documentos')}
        >
          📄 Documentos ({docsSubidos}/16)
        </button>
        <button
          className={`tab ${activeTab === 'armas' ? 'active' : ''}`}
          onClick={() => setActiveTab('armas')}
        >
          🔫 Arsenal ({armas.length})
        </button>
        <button
          className={`tab ${activeTab === 'petas' ? 'active' : ''}`}
          onClick={() => setActiveTab('petas')}
        >
          📋 Solicitudes PETA ({petas.length})
        </button>
      </div>

      {/* Content */}
      <div className="expediente-content">
        {/* TAB: Datos Personales */}
        {activeTab === 'datos' && (
          <div className="tab-content datos-personales">
            <h2>Datos Personales</h2>
            
            <div className="datos-grid">
              <div className="dato-item editable">
                <label>Nombre Completo</label>
                <div className="dato-value-editable">
                  <span className="valor">{socio.nombre}</span>
                  <button 
                    className="btn-edit-inline"
                    onClick={() => setMostrarNombreEditor(true)}
                    title="Editar nombre"
                  >
                    ✏️
                  </button>
                </div>
              </div>

              <div className="dato-item editable">
                <label>Email</label>
                <div className="dato-value-editable">
                  <span className="valor">{socio.email}</span>
                  <button 
                    className="btn-edit-inline critical"
                    onClick={() => setMostrarEmailEditor(true)}
                    title="Cambiar email (proceso crítico)"
                  >
                    ⚠️
                  </button>
                </div>
              </div>

              <div className="dato-item editable">
                <label>CURP</label>
                <div className="dato-value-editable">
                  <span className="valor">{socio.curp || 'No registrado'}</span>
                  <button 
                    className="btn-edit-inline"
                    onClick={() => setMostrarCURPEditor(true)}
                    title="Editar CURP"
                  >
                    ✏️
                  </button>
                </div>
              </div>

              <div className="dato-item">
                <label>Fecha de Alta</label>
                <div className="dato-value">
                  {socio.fechaAlta?.toDate ? socio.fechaAlta.toDate().toLocaleDateString('es-MX') : 'No registrada'}
                </div>
              </div>

              <div className="dato-item full-width editable">
                <label>Domicilio</label>
                <div className="dato-value-editable">
                  <span className="valor">
                    {socio.domicilio ? (
                      <>
                        {socio.domicilio.calle}<br />
                        {socio.domicilio.colonia}, {socio.domicilio.municipio}<br />
                        {socio.domicilio.estado}, C.P. {socio.domicilio.cp}
                      </>
                    ) : (
                      'No registrado'
                    )}
                  </span>
                  <button 
                    className="btn-edit-inline"
                    onClick={() => setMostrarDomicilioEditor(true)}
                    title="Editar domicilio"
                  >
                    ✏️
                  </button>
                </div>
              </div>

              <div className="dato-item">
                <label>Estado Membresía 2026</label>
                <div className="dato-value">
                  {socio.renovacion2026?.estado === 'pagado' ? (
                    <span className="badge-pagado">✅ Al corriente</span>
                  ) : (
                    <span className="badge-pendiente">⏳ Pendiente</span>
                  )}
                </div>
              </div>

              {socio.renovacion2026?.estado === 'pagado' && (
                <>
                  <div className="dato-item">
                    <label>Fecha de Pago</label>
                    <div className="dato-value">
                      {socio.renovacion2026.fecha?.toDate ? 
                        socio.renovacion2026.fecha.toDate().toLocaleDateString('es-MX') : 
                        'No registrada'}
                    </div>
                  </div>

                  <div className="dato-item">
                    <label>Monto Pagado</label>
                    <div className="dato-value">${socio.renovacion2026.monto} MXN</div>
                  </div>

                  <div className="dato-item">
                    <label>Método de Pago</label>
                    <div className="dato-value">{socio.renovacion2026.metodo}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: Documentos */}
        {activeTab === 'documentos' && (
          <div className="tab-content documentos">
            <h2>Documentos PETA</h2>
            
            <div className="documentos-progreso">
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large" 
                  style={{ width: `${progresoDocumentos}%` }}
                />
              </div>
              <span>{docsSubidos} de {totalDocs} documentos subidos ({progresoDocumentos}%)</span>
            </div>

            <div className="documentos-lista">
              {documentosEsperados.map(({ key, label }) => {
                const doc = docs[key];
                const hasDoc = doc?.url;

                return (
                  <div key={key} className={`documento-item ${hasDoc ? 'completo' : 'pendiente'}`}>
                    <div className="documento-info">
                      <span className="documento-icon">{hasDoc ? '✅' : '⏳'}</span>
                      <span className="documento-label">{label}</span>
                    </div>
                    {hasDoc ? (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-ver-documento"
                      >
                        👁️ Ver
                      </a>
                    ) : (
                      <span className="documento-pendiente-text">Pendiente</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Armas */}
        {activeTab === 'armas' && (
          <div className="tab-content armas">
            <div className="armas-header">
              <h2>Arsenal Registrado</h2>
              <button 
                className="btn-agregar-arma"
                onClick={() => {
                  setArmaSeleccionada(null);
                  setArmaIdSeleccionada(null);
                  setMostrarEditor(true);
                }}
              >
                ➕ Agregar Arma
              </button>
            </div>

            {armas.length === 0 ? (
              <div className="empty-state">
                <p>Este socio no tiene armas registradas en el sistema.</p>
              </div>
            ) : (
              <div className="armas-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Clase</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Calibre</th>
                      <th>Matrícula</th>
                      <th>Folio SEDENA</th>
                      <th>Modalidad</th>
                      <th>Registro Federal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {armas.map(arma => (
                      <tr key={arma.id}>
                        <td>{arma.clase}</td>
                        <td>{arma.marca}</td>
                        <td>{arma.modelo}</td>
                        <td>{arma.calibre}</td>
                        <td className="matricula">{arma.matricula}</td>
                        <td>{arma.folio || '-'}</td>
                        <td>
                          <span className={`badge-modalidad ${arma.modalidad}`}>
                            {arma.modalidad || 'N/A'}
                          </span>
                        </td>
                        <td className="registro-federal">
                          {arma.documentoRegistro ? (
                            <button
                              className="btn-ver-registro"
                              onClick={() => window.open(arma.documentoRegistro, '_blank')}
                              title="Ver Registro Federal de Armas"
                            >
                              📄 Ver PDF
                            </button>
                          ) : (
                            <span className="sin-registro">Sin registro</span>
                          )}
                        </td>
                        <td className="acciones-arma">
                          <button
                            className="btn-editar-arma"
                            onClick={() => {
                              setArmaSeleccionada(arma);
                              setArmaIdSeleccionada(arma.id);
                              setMostrarEditor(true);
                            }}
                            title="Editar arma"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-eliminar-arma"
                            onClick={() => confirmarEliminarArma(arma)}
                            title="Eliminar arma"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Solicitudes PETA */}
        {activeTab === 'petas' && (
          <div className="tab-content petas">
            <h2>Solicitudes PETA</h2>

            {petas.length === 0 ? (
              <div className="empty-state">
                <p>Este socio no ha solicitado trámites PETA.</p>
              </div>
            ) : (
              <div className="petas-lista">
                {petas.map(peta => (
                  <div key={peta.id} className="peta-card">
                    <div className="peta-header">
                      <span className="peta-tipo">{peta.tipo?.toUpperCase() || 'N/A'}</span>
                      <span className={`peta-estado estado-${peta.estado}`}>
                        {peta.estado || 'Sin estado'}
                      </span>
                    </div>
                    <div className="peta-body">
                      <div className="peta-info">
                        <strong>Armas incluidas:</strong> {peta.armasIncluidas?.length || 0}
                      </div>
                      <div className="peta-info">
                        <strong>Estados:</strong> {peta.estadosSeleccionados?.join(', ') || 'N/A'}
                      </div>
                      <div className="peta-info">
                        <strong>Fecha solicitud:</strong> {' '}
                        {peta.fechaSolicitud?.toDate ? 
                          peta.fechaSolicitud.toDate().toLocaleDateString('es-MX') : 
                          'No registrada'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Editor de Arma */}
      {mostrarEditor && (
        <ArmaEditor
          socioEmail={socioEmail}
          armaData={armaSeleccionada}
          armaId={armaIdSeleccionada}
          onClose={() => {
            setMostrarEditor(false);
            setArmaSeleccionada(null);
            setArmaIdSeleccionada(null);
          }}
          onSave={() => {
            cargarExpediente(); // Recargar para ver cambios
          }}
        />
      )}
      
      {/* Editores de Datos Personales */}
      {mostrarNombreEditor && (
        <DatosPersonalesEditor
          socioEmail={socioEmail}
          nombreActual={socio.nombre}
          onClose={() => setMostrarNombreEditor(false)}
          onSave={() => {
            setMostrarNombreEditor(false);
            cargarExpediente(); // Recargar para ver cambios
          }}
        />
      )}

      {mostrarCURPEditor && (
        <CURPEditor
          socioEmail={socioEmail}
          curpActual={socio.curp}
          onClose={() => setMostrarCURPEditor(false)}
          onSave={() => {
            setMostrarCURPEditor(false);
            cargarExpediente(); // Recargar para ver cambios
          }}
        />
      )}

      {mostrarDomicilioEditor && (
        <DomicilioEditor
          socioEmail={socioEmail}
          domicilioActual={socio.domicilio}
          onClose={() => setMostrarDomicilioEditor(false)}
          onSave={() => {
            setMostrarDomicilioEditor(false);
            cargarExpediente(); // Recargar para ver cambios
          }}
        />
      )}

      {mostrarEmailEditor && (
        <EmailEditor
          socioEmail={socioEmail}
          onClose={() => setMostrarEmailEditor(false)}
          onSave={() => {
            setMostrarEmailEditor(false);
            // Nota: Después de cambiar email, el usuario necesita recargar manualmente
            alert('Email actualizado. El expediente se ha migrado al nuevo email.');
            onBack(); // Volver al dashboard
          }}
        />
      )}
    </div>
  );

  // Función para confirmar eliminación de arma
  async function confirmarEliminarArma(arma) {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar esta arma?\n\n` +
      `Clase: ${arma.clase}\n` +
      `Marca: ${arma.marca}\n` +
      `Modelo: ${arma.modelo}\n` +
      `Matrícula: ${arma.matricula}\n\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      // Crear log de auditoría ANTES de eliminar
      const adminEmail = auth.currentUser?.email || 'sistema';
      await addDoc(collection(db, 'auditoria'), {
        tipo: 'arma',
        accion: 'eliminar',
        socioEmail: socioEmail,
        armaId: arma.id,
        detalles: {
          arma: arma,
          eliminadoPor: adminEmail
        },
        adminEmail,
        timestamp: serverTimestamp()
      });

      // Eliminar arma de Firestore
      const armaDocRef = doc(db, 'socios', socioEmail, 'armas', arma.id);
      await deleteDoc(armaDocRef);

      alert('Arma eliminada correctamente');
      
      // Recargar expediente
      cargarExpediente();
    } catch (err) {
      console.error('Error al eliminar arma:', err);
      alert('Error al eliminar el arma. Intenta nuevamente.');
    }
  }
}

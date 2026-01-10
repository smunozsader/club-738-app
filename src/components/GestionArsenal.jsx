import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './GestionArsenal.css';

/**
 * Módulo de Gestión de Arsenal
 * Permite a los socios:
 * - Ver su arsenal actual
 * - Reportar bajas (venta, transferencia)
 * - Solicitar actualización de registros
 * - Generar avisos a 32 ZM y DN27
 */
function GestionArsenal() {
  const [loading, setLoading] = useState(true);
  const [socioData, setSocioData] = useState(null);
  const [armas, setArmas] = useState([]);
  const [armaSeleccionada, setArmaSeleccionada] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'reportar-baja', 'transferencia'
  
  // Formulario de baja
  const [formBaja, setFormBaja] = useState({
    motivo: '', // 'venta', 'transferencia', 'perdida', 'robo', 'destruccion'
    fechaBaja: '',
    observaciones: '',
    // Datos del comprador/receptor (si aplica)
    nombreReceptor: '',
    curpReceptor: '',
    esSocioClub: false,
    emailReceptor: '',
    // Datos del registro de transferencia
    folioTransferencia: '',
    zonaMillitarTransferencia: '',
    fechaTransferencia: ''
  });

  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = '/';
        return;
      }

      // Cargar datos del socio
      const socioRef = doc(db, 'socios', user.email);
      const socioSnap = await getDoc(socioRef);
      
      if (socioSnap.exists()) {
        setSocioData(socioSnap.data());
      }

      // Cargar armas del socio
      const armasRef = collection(db, 'socios', user.email, 'armas');
      const armasSnap = await getDocs(armasRef);
      const armasData = [];
      armasSnap.forEach((doc) => {
        armasData.push({ id: doc.id, ...doc.data() });
      });
      setArmas(armasData);

      // Cargar solicitudes de baja pendientes
      const solicitudesRef = collection(db, 'socios', user.email, 'solicitudesBaja');
      const solicitudesSnap = await getDocs(solicitudesRef);
      const solicitudesData = [];
      solicitudesSnap.forEach((doc) => {
        solicitudesData.push({ id: doc.id, ...doc.data() });
      });
      setSolicitudesPendientes(solicitudesData);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar información. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportarBaja = (arma) => {
    setArmaSeleccionada(arma);
    setVistaActual('reportar-baja');
    setFormBaja({
      motivo: '',
      fechaBaja: new Date().toISOString().split('T')[0],
      observaciones: '',
      nombreReceptor: '',
      curpReceptor: '',
      esSocioClub: false,
      emailReceptor: '',
      folioTransferencia: '',
      zonaMillitarTransferencia: '32',
      fechaTransferencia: ''
    });
  };

  const handleSubmitBaja = async (e) => {
    e.preventDefault();
    
    if (!armaSeleccionada) return;

    // Validaciones
    if (!formBaja.motivo) {
      alert('Selecciona el motivo de la baja');
      return;
    }

    if (!formBaja.fechaBaja) {
      alert('Indica la fecha de la baja');
      return;
    }

    // Si es transferencia o venta, validar datos del receptor
    if ((formBaja.motivo === 'venta' || formBaja.motivo === 'transferencia') && !formBaja.nombreReceptor) {
      alert('Indica el nombre del comprador/receptor');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      // Crear solicitud de baja
      const solicitudRef = collection(db, 'socios', user.email, 'solicitudesBaja');
      await addDoc(solicitudRef, {
        armaId: armaSeleccionada.id,
        armaDetalles: {
          clase: armaSeleccionada.clase,
          calibre: armaSeleccionada.calibre,
          marca: armaSeleccionada.marca,
          modelo: armaSeleccionada.modelo,
          matricula: armaSeleccionada.matricula,
          folio: armaSeleccionada.folio
        },
        motivo: formBaja.motivo,
        fechaBaja: formBaja.fechaBaja,
        observaciones: formBaja.observaciones,
        receptor: formBaja.motivo === 'venta' || formBaja.motivo === 'transferencia' ? {
          nombre: formBaja.nombreReceptor,
          curp: formBaja.curpReceptor,
          esSocioClub: formBaja.esSocioClub,
          email: formBaja.emailReceptor
        } : null,
        transferencia: formBaja.folioTransferencia ? {
          folio: formBaja.folioTransferencia,
          zonaMilitar: formBaja.zonaMillitarTransferencia,
          fecha: formBaja.fechaTransferencia
        } : null,
        estado: 'pendiente', // pendiente, aprobada, procesada
        fechaSolicitud: serverTimestamp(),
        solicitadoPor: user.email,
        nombreSolicitante: socioData?.nombre || ''
      });

      alert('✅ Solicitud de baja registrada.\n\nEl secretario revisará tu solicitud y tramitará los avisos correspondientes a 32 ZM y DN27.');
      
      // Recargar datos
      await cargarDatos();
      setVistaActual('lista');
      setArmaSeleccionada(null);

    } catch (error) {
      console.error('Error al registrar baja:', error);
      alert('Error al registrar la baja. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { text: 'Pendiente revisión', class: 'badge-warning' },
      'aprobada': { text: 'Aprobada por secretario', class: 'badge-info' },
      'procesada': { text: 'Tramitada ante autoridades', class: 'badge-success' }
    };
    const badge = badges[estado] || badges['pendiente'];
    return <span className={`estado-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getMotivoBadge = (motivo) => {
    const motivos = {
      'venta': { text: '💰 Venta', class: 'motivo-venta' },
      'transferencia': { text: '👥 Transferencia familiar', class: 'motivo-transferencia' },
      'perdida': { text: '❓ Extravío', class: 'motivo-perdida' },
      'robo': { text: '⚠️ Robo', class: 'motivo-robo' },
      'destruccion': { text: '🔨 Destrucción', class: 'motivo-destruccion' }
    };
    const m = motivos[motivo] || { text: motivo, class: '' };
    return <span className={`motivo-badge ${m.class}`}>{m.text}</span>;
  };

  if (loading) {
    return (
      <div className="gestion-arsenal-container">
        <div className="loading-spinner">Cargando arsenal...</div>
      </div>
    );
  }

  return (
    <div className="gestion-arsenal-container">
      <header className="arsenal-header">
        <h1>📦 Gestión de Arsenal</h1>
        <p className="subtitle">Mantén actualizado tu registro de armas ante SEDENA</p>
      </header>

      {/* NAVEGACIÓN */}
      <div className="vista-tabs">
        <button
          className={vistaActual === 'lista' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setVistaActual('lista')}
        >
          🔫 Mi Arsenal ({armas.length})
        </button>
        <button
          className={vistaActual === 'solicitudes' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setVistaActual('solicitudes')}
        >
          📋 Solicitudes de Baja ({solicitudesPendientes.length})
        </button>
      </div>

      {/* VISTA: LISTA DE ARMAS */}
      {vistaActual === 'lista' && (
        <div className="vista-lista">
          {armas.length === 0 ? (
            <div className="empty-state">
              <p>No tienes armas registradas en tu arsenal.</p>
            </div>
          ) : (
            <div className="armas-grid">
              {armas.map((arma) => (
                <div key={arma.id} className="arma-card">
                  <div className="arma-header">
                    <h3>{arma.marca} {arma.modelo}</h3>
                    <span className="arma-clase">{arma.clase}</span>
                  </div>
                  <div className="arma-detalles">
                    <div className="detalle-row">
                      <span className="label">Calibre:</span>
                      <span className="value">{arma.calibre}</span>
                    </div>
                    <div className="detalle-row">
                      <span className="label">Matrícula:</span>
                      <span className="value">{arma.matricula}</span>
                    </div>
                    <div className="detalle-row">
                      <span className="label">Folio SEDENA:</span>
                      <span className="value">{arma.folio || 'N/A'}</span>
                    </div>
                    {arma.modalidad && (
                      <div className="detalle-row">
                        <span className="label">Modalidad:</span>
                        <span className="value modalidad-tag">{arma.modalidad}</span>
                      </div>
                    )}
                  </div>
                  <div className="arma-actions">
                    <button
                      className="btn-reportar-baja"
                      onClick={() => handleReportarBaja(arma)}
                    >
                      📤 Reportar Baja
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA: FORMULARIO DE BAJA */}
      {vistaActual === 'reportar-baja' && armaSeleccionada && (
        <div className="vista-formulario">
          <div className="form-header">
            <button className="btn-back" onClick={() => setVistaActual('lista')}>
              ← Volver al arsenal
            </button>
            <h2>Reportar Baja de Arma</h2>
          </div>

          <div className="arma-seleccionada-info">
            <h3>🔫 {armaSeleccionada.marca} {armaSeleccionada.modelo}</h3>
            <p>Matrícula: {armaSeleccionada.matricula} | Folio: {armaSeleccionada.folio}</p>
          </div>

          <form onSubmit={handleSubmitBaja} className="form-baja">
            {/* MOTIVO DE LA BAJA */}
            <div className="form-section">
              <h3>1. Motivo de la Baja</h3>
              <select
                value={formBaja.motivo}
                onChange={(e) => setFormBaja({ ...formBaja, motivo: e.target.value })}
                required
              >
                <option value="">-- Selecciona el motivo --</option>
                <option value="venta">💰 Venta a otra persona</option>
                <option value="transferencia">👥 Transferencia familiar (esposa, hijo, etc.)</option>
                <option value="perdida">❓ Extravío</option>
                <option value="robo">⚠️ Robo</option>
                <option value="destruccion">🔨 Destrucción del arma</option>
              </select>
            </div>

            {/* FECHA DE BAJA */}
            <div className="form-section">
              <h3>2. Fecha de la Baja</h3>
              <input
                type="date"
                value={formBaja.fechaBaja}
                onChange={(e) => setFormBaja({ ...formBaja, fechaBaja: e.target.value })}
                required
              />
            </div>

            {/* DATOS DEL RECEPTOR (solo para venta o transferencia) */}
            {(formBaja.motivo === 'venta' || formBaja.motivo === 'transferencia') && (
              <div className="form-section">
                <h3>3. Datos del Comprador/Receptor</h3>
                <div className="form-row">
                  <label>
                    Nombre completo:
                    <input
                      type="text"
                      value={formBaja.nombreReceptor}
                      onChange={(e) => setFormBaja({ ...formBaja, nombreReceptor: e.target.value })}
                      placeholder="Ej: MARIA FERNANDA GUADALUPE ARECHIGA RAMOS"
                      required
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    CURP:
                    <input
                      type="text"
                      value={formBaja.curpReceptor}
                      onChange={(e) => setFormBaja({ ...formBaja, curpReceptor: e.target.value.toUpperCase() })}
                      placeholder="Ej: AERM850101MDFRMR09"
                      maxLength="18"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formBaja.esSocioClub}
                      onChange={(e) => setFormBaja({ ...formBaja, esSocioClub: e.target.checked })}
                    />
                    El receptor es socio del club
                  </label>
                </div>
                {formBaja.esSocioClub && (
                  <div className="form-row">
                    <label>
                      Email del socio:
                      <input
                        type="email"
                        value={formBaja.emailReceptor}
                        onChange={(e) => setFormBaja({ ...formBaja, emailReceptor: e.target.value })}
                        placeholder="email@ejemplo.com"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* DATOS DE TRANSFERENCIA OFICIAL (opcional) */}
            {(formBaja.motivo === 'venta' || formBaja.motivo === 'transferencia') && (
              <div className="form-section">
                <h3>4. Registro de Transferencia SEDENA (Opcional)</h3>
                <p className="help-text">
                  Si ya tramitaste la transferencia ante SEDENA, proporciona los datos del formato de registro:
                </p>
                <div className="form-row">
                  <label>
                    Folio de Transferencia:
                    <input
                      type="text"
                      value={formBaja.folioTransferencia}
                      onChange={(e) => setFormBaja({ ...formBaja, folioTransferencia: e.target.value })}
                      placeholder="Ej: A3892689"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Zona Militar:
                    <input
                      type="text"
                      value={formBaja.zonaMillitarTransferencia}
                      onChange={(e) => setFormBaja({ ...formBaja, zonaMillitarTransferencia: e.target.value })}
                      placeholder="32"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Fecha de Transferencia:
                    <input
                      type="date"
                      value={formBaja.fechaTransferencia}
                      onChange={(e) => setFormBaja({ ...formBaja, fechaTransferencia: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* OBSERVACIONES */}
            <div className="form-section">
              <h3>5. Observaciones Adicionales</h3>
              <textarea
                value={formBaja.observaciones}
                onChange={(e) => setFormBaja({ ...formBaja, observaciones: e.target.value })}
                rows="4"
                placeholder="Cualquier detalle adicional que sea relevante..."
              />
            </div>

            {/* INFO IMPORTANTE */}
            <div className="info-box">
              <h4>📌 Importante:</h4>
              <ul>
                <li>El secretario revisará tu solicitud</li>
                <li>Se generará el aviso correspondiente a la <strong>32 Zona Militar</strong></li>
                <li>Se informará a <strong>DN27 (Dirección General del Registro Federal de Armas de Fuego)</strong></li>
                <li>El arma quedará marcada como "En proceso de baja" hasta completar el trámite</li>
                {formBaja.esSocioClub && (
                  <li className="highlight">✅ Como el receptor es socio, facilitaremos el trámite de alta en su arsenal</li>
                )}
              </ul>
            </div>

            {/* BOTONES */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setVistaActual('lista')}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Procesando...' : '📤 Enviar Solicitud de Baja'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA: SOLICITUDES PENDIENTES */}
      {vistaActual === 'solicitudes' && (
        <div className="vista-solicitudes">
          {solicitudesPendientes.length === 0 ? (
            <div className="empty-state">
              <p>No tienes solicitudes de baja pendientes.</p>
            </div>
          ) : (
            <div className="solicitudes-list">
              {solicitudesPendientes.map((solicitud) => (
                <div key={solicitud.id} className="solicitud-card">
                  <div className="solicitud-header">
                    <h3>
                      {solicitud.armaDetalles.marca} {solicitud.armaDetalles.modelo}
                    </h3>
                    {getEstadoBadge(solicitud.estado)}
                  </div>
                  <div className="solicitud-body">
                    <div className="detalle-row">
                      <span className="label">Motivo:</span>
                      {getMotivoBadge(solicitud.motivo)}
                    </div>
                    <div className="detalle-row">
                      <span className="label">Fecha de baja:</span>
                      <span className="value">{solicitud.fechaBaja}</span>
                    </div>
                    {solicitud.receptor && (
                      <div className="detalle-row">
                        <span className="label">Receptor:</span>
                        <span className="value">
                          {solicitud.receptor.nombre}
                          {solicitud.receptor.esSocioClub && <span className="socio-tag"> (Socio del club)</span>}
                        </span>
                      </div>
                    )}
                    {solicitud.transferencia && (
                      <div className="detalle-row">
                        <span className="label">Folio transferencia:</span>
                        <span className="value">{solicitud.transferencia.folio}</span>
                      </div>
                    )}
                    {solicitud.observaciones && (
                      <div className="observaciones">
                        <span className="label">Observaciones:</span>
                        <p>{solicitud.observaciones}</p>
                      </div>
                    )}
                    <div className="fecha-solicitud">
                      Solicitado: {solicitud.fechaSolicitud?.toDate?.()?.toLocaleDateString('es-MX') || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GestionArsenal;

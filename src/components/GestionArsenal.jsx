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
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'reportar-baja', 'solicitar-alta', 'solicitudes-baja', 'solicitudes-alta'
  
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
  const [solicitudesAlta, setSolicitudesAlta] = useState([]);
  
  // Formulario de alta
  const [formAlta, setFormAlta] = useState({
    clase: '', // PISTOLA, RIFLE, ESCOPETA, REVOLVER
    calibre: '',
    marca: '',
    modelo: '',
    matricula: '',
    folio: '',
    modalidad: 'tiro', // tiro, caza, ambas
    origenAdquisicion: '', // compra, herencia, donacion, transferencia
    fechaAdquisicion: '',
    vendedor: '',
    curpVendedor: '',
    folioRegistroTransferencia: '',
    observaciones: ''
  });

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

      // Cargar solicitudes de alta pendientes
      const solicitudesAltaRef = collection(db, 'socios', user.email, 'solicitudesAlta');
      const solicitudesAltaSnap = await getDocs(solicitudesAltaRef);
      const solicitudesAltaData = [];
      solicitudesAltaSnap.forEach((doc) => {
        solicitudesAltaData.push({ id: doc.id, ...doc.data() });
      });
      setSolicitudesAlta(solicitudesAltaData);

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

  const handleSolicitarAlta = () => {
    setVistaActual('solicitar-alta');
    setFormAlta({
      clase: '',
      calibre: '',
      marca: '',
      modelo: '',
      matricula: '',
      folio: '',
      modalidad: 'tiro',
      origenAdquisicion: '',
      fechaAdquisicion: new Date().toISOString().split('T')[0],
      vendedor: '',
      curpVendedor: '',
      folioRegistroTransferencia: '',
      observaciones: ''
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
      setVistaActual('solicitudes-baja');
      setArmaSeleccionada(null);

    } catch (error) {
      console.error('Error al registrar baja:', error);
      alert('Error al registrar la baja. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAlta = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formAlta.clase || !formAlta.calibre || !formAlta.marca || !formAlta.matricula) {
      alert('Completa los campos obligatorios: clase, calibre, marca y matrícula');
      return;
    }

    if (!formAlta.origenAdquisicion) {
      alert('Indica cómo adquiriste el arma');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      // Crear solicitud de alta
      const solicitudRef = collection(db, 'socios', user.email, 'solicitudesAlta');
      await addDoc(solicitudRef, {
        armaDetalles: {
          clase: formAlta.clase,
          calibre: formAlta.calibre,
          marca: formAlta.marca,
          modelo: formAlta.modelo,
          matricula: formAlta.matricula,
          folio: formAlta.folio,
          modalidad: formAlta.modalidad
        },
        origenAdquisicion: formAlta.origenAdquisicion,
        fechaAdquisicion: formAlta.fechaAdquisicion,
        vendedor: formAlta.origenAdquisicion === 'compra' || formAlta.origenAdquisicion === 'transferencia' ? {
          nombre: formAlta.vendedor,
          curp: formAlta.curpVendedor
        } : null,
        folioRegistroTransferencia: formAlta.folioRegistroTransferencia || null,
        observaciones: formAlta.observaciones,
        estado: 'pendiente', // pendiente, aprobada, procesada
        fechaSolicitud: serverTimestamp(),
        solicitadoPor: user.email,
        nombreSolicitante: socioData?.nombre || ''
      });

      alert('✅ Solicitud de alta registrada.\n\nEl secretario revisará tu solicitud, verificará la documentación y registrará el arma en tu arsenal.\n\nEl club informará a 32 ZM mediante oficio.');
      
      // Recargar datos
      await cargarDatos();
      setVistaActual('solicitudes-alta');

    } catch (error) {
      console.error('Error al registrar alta:', error);
      alert('Error al registrar la solicitud. Intenta nuevamente.');
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
          className={vistaActual === 'solicitudes-baja' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setVistaActual('solicitudes-baja')}
        >
          📋 Bajas ({solicitudesPendientes.length})
        </button>
        <button
          className={vistaActual === 'solicitudes-alta' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setVistaActual('solicitudes-alta')}
        >
          ➕ Altas ({solicitudesAlta.length})
        </button>
      </div>

      {/* VISTA: LISTA DE ARMAS */}
      {vistaActual === 'lista' && (
        <div className="vista-lista">
          <div className="acciones-arsenal">
            <button className="btn-solicitar-alta" onClick={handleSolicitarAlta}>
              ➕ Solicitar Alta de Arma Nueva
            </button>
          </div>
          
          {armas.length === 0 ? (
            <div className="empty-state">
              <p>No tienes armas registradas en tu arsenal.</p>
              <p className="hint">¿Tienes un arma nueva? Solicita darla de alta.</p>
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

      {/* VISTA: SOLICITAR ALTA */}
      {vistaActual === 'solicitar-alta' && (
        <div className="vista-formulario">
          <div className="form-header">
            <button className="btn-back" onClick={() => setVistaActual('lista')}>
              ← Volver al arsenal
            </button>
            <h2>Solicitar Alta de Arma Nueva</h2>
          </div>

          <form onSubmit={handleSubmitAlta} className="form-alta">
            <div className="form-section">
              <h3>1. Datos del Arma</h3>
              
              <div className="form-row">
                <label>
                  Clase: *
                  <select value={formAlta.clase} onChange={(e) => setFormAlta({ ...formAlta, clase: e.target.value })} required>
                    <option value="">-- Selecciona --</option>
                    <option value="PISTOLA">PISTOLA</option>
                    <option value="RIFLE">RIFLE</option>
                    <option value="ESCOPETA">ESCOPETA</option>
                    <option value="REVOLVER">REVOLVER</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Marca: *
                  <input type="text" value={formAlta.marca} onChange={(e) => setFormAlta({ ...formAlta, marca: e.target.value })} placeholder="Ej: GLOCK, BROWNING" required />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Modelo:
                  <input type="text" value={formAlta.modelo} onChange={(e) => setFormAlta({ ...formAlta, modelo: e.target.value })} placeholder="Ej: G19, PHOENIX" />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Calibre: *
                  <input type="text" value={formAlta.calibre} onChange={(e) => setFormAlta({ ...formAlta, calibre: e.target.value })} placeholder="Ej: 9mm, .22 LR, .308 Win" required />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Matrícula: *
                  <input type="text" value={formAlta.matricula} onChange={(e) => setFormAlta({ ...formAlta, matricula: e.target.value })} placeholder="Matrícula grabada en el arma" required />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Folio SEDENA:
                  <input type="text" value={formAlta.folio} onChange={(e) => setFormAlta({ ...formAlta, folio: e.target.value })} placeholder="Si ya tienes registro federal" />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Modalidad:
                  <select value={formAlta.modalidad} onChange={(e) => setFormAlta({ ...formAlta, modalidad: e.target.value })}>
                    <option value="tiro">Tiro deportivo</option>
                    <option value="caza">Caza deportiva</option>
                    <option value="ambas">Ambas</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h3>2. Origen de la Adquisición</h3>
              
              <div className="form-row">
                <label>
                  ¿Cómo adquiriste el arma?: *
                  <select value={formAlta.origenAdquisicion} onChange={(e) => setFormAlta({ ...formAlta, origenAdquisicion: e.target.value })} required>
                    <option value="">-- Selecciona --</option>
                    <option value="compra">💰 Compra a particular</option>
                    <option value="transferencia">👥 Transferencia familiar</option>
                    <option value="herencia">📜 Herencia</option>
                    <option value="donacion">🎁 Donación</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Fecha de adquisición: *
                  <input type="date" value={formAlta.fechaAdquisicion} onChange={(e) => setFormAlta({ ...formAlta, fechaAdquisicion: e.target.value })} required />
                </label>
              </div>

              {(formAlta.origenAdquisicion === 'compra' || formAlta.origenAdquisicion === 'transferencia') && (
                <>
                  <div className="form-row">
                    <label>
                      Nombre del vendedor/cedente:
                      <input type="text" value={formAlta.vendedor} onChange={(e) => setFormAlta({ ...formAlta, vendedor: e.target.value })} placeholder="Nombre completo" />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      CURP del vendedor/cedente:
                      <input type="text" value={formAlta.curpVendedor} onChange={(e) => setFormAlta({ ...formAlta, curpVendedor: e.target.value })} placeholder="18 caracteres" maxLength="18" />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Folio del registro de transferencia:
                      <input type="text" value={formAlta.folioRegistroTransferencia} onChange={(e) => setFormAlta({ ...formAlta, folioRegistroTransferencia: e.target.value })} placeholder="Si ya tramitaron ante SEDENA" />
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <h3>3. Observaciones</h3>
              <textarea value={formAlta.observaciones} onChange={(e) => setFormAlta({ ...formAlta, observaciones: e.target.value })} placeholder="Información adicional que consideres relevante..." rows="4" />
            </div>

            <div className="info-box">
              <h4>📌 Documentos que deberás presentar al secretario:</h4>
              <ul>
                <li>Registro Federal de Armas (RFA) del arma</li>
                <li>Recibo de compra o contrato de compraventa</li>
                <li>Si aplica: Registro de transferencia de SEDENA</li>
              </ul>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setVistaActual('lista')}>Cancelar</button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Procesando...' : '📤 Enviar Solicitud de Alta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA: SOLICITUDES DE BAJA */}
      {vistaActual === 'solicitudes-baja' && (
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

      {/* VISTA: SOLICITUDES DE ALTA */}
      {vistaActual === 'solicitudes-alta' && (
        <div className="vista-solicitudes">
          {solicitudesAlta.length === 0 ? (
            <div className="empty-state">
              <p>No tienes solicitudes de alta pendientes.</p>
            </div>
          ) : (
            <div className="solicitudes-list">
              {solicitudesAlta.map((solicitud) => (
                <div key={solicitud.id} className="solicitud-card">
                  <div className="solicitud-header">
                    <h3>
                      {solicitud.armaDetalles.marca} {solicitud.armaDetalles.modelo}
                    </h3>
                    {getEstadoBadge(solicitud.estado)}
                  </div>
                  <div className="solicitud-body">
                    <div className="detalle-row">
                      <span className="label">Clase:</span>
                      <span className="value">{solicitud.armaDetalles.clase}</span>
                    </div>
                    <div className="detalle-row">
                      <span className="label">Calibre:</span>
                      <span className="value">{solicitud.armaDetalles.calibre}</span>
                    </div>
                    <div className="detalle-row">
                      <span className="label">Matrícula:</span>
                      <span className="value">{solicitud.armaDetalles.matricula}</span>
                    </div>
                    <div className="detalle-row">
                      <span className="label">Origen:</span>
                      <span className="value">{solicitud.origenAdquisicion}</span>
                    </div>
                    <div className="detalle-row">
                      <span className="label">Fecha adquisición:</span>
                      <span className="value">{solicitud.fechaAdquisicion}</span>
                    </div>
                    {solicitud.vendedor && (
                      <div className="detalle-row">
                        <span className="label">Vendedor:</span>
                        <span className="value">{solicitud.vendedor.nombre}</span>
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

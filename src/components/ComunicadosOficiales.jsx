import './ComunicadosOficiales.css';

export default function ComunicadosOficiales() {
  const comunicados = [
    {
      id: 1,
      titulo: 'Procedimiento para Autorización de Permiso Extraordinario',
      subtitulo: 'Adquisición de Armas de Fuego',
      numero: 'S-1:M-4:006',
      remitente: '32 Zona Militar',
      fecha: 'Enero 2026',
      tipo: 'oficio',
      archivo: '/oficios/Oficio No. S-1:M-4:006, 32ZM notifica procedimiento para autorizacion de Permiso extraordinario para adquisicon de armas de fuego, etc..pdf',
      descripcion: 'Información oficial sobre el procedimiento de autorización de permisos extraordinarios para adquisición de armas de fuego según la 32 Zona Militar.'
    },
    {
      id: 2,
      titulo: 'Notificación de Costos de PETA',
      subtitulo: 'Actualización de aranceles por gestión de permisos',
      numero: 'S-1:M-4:021',
      remitente: '32 Zona Militar',
      fecha: 'Enero 2026',
      tipo: 'oficio',
      archivo: '/oficios/Oficios Oficio No. S-1:M-4:021. 32 zm al club notifica costo PETAS por 3 armas y subsecuentes.pdf',
      descripcion: 'Comunicado oficial de la 32 Zona Militar sobre los costos y aranceles aplicables para gestiones de PETA.'
    }
  ];

  return (
    <div className="comunicados-container">
      <div className="comunicados-header">
        <h2>📢 Comunicados Oficiales</h2>
        <p>Oficios y comunicaciones de la 32 Zona Militar y del Club</p>
      </div>

      <div className="comunicados-grid">
        {comunicados.map((comunicado) => (
          <div key={comunicado.id} className="comunicado-card">
            <div className="comunicado-header">
              <span className="comunicado-type">📄 {comunicado.tipo.toUpperCase()}</span>
              <span className="comunicado-numero">{comunicado.numero}</span>
            </div>
            
            <div className="comunicado-content">
              <h3>{comunicado.titulo}</h3>
              <p className="comunicado-subtitulo">{comunicado.subtitulo}</p>
              
              <div className="comunicado-meta">
                <span className="meta-remitente">📮 {comunicado.remitente}</span>
                <span className="meta-fecha">📅 {comunicado.fecha}</span>
              </div>
              
              <p className="comunicado-descripcion">{comunicado.descripcion}</p>
            </div>
            
            <div className="comunicado-actions">
              <a 
                href={comunicado.archivo} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-leer"
              >
                👁️ Abrir PDF
              </a>
              <a 
                href={comunicado.archivo} 
                download
                className="btn-descargar"
              >
                ⬇️ Descargar
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="comunicados-info">
        <div className="info-box">
          <h4>ℹ️ Sobre estos comunicados</h4>
          <p>
            Los oficios y comunicados publicados aquí provienen de la <strong>32 Zona Militar</strong> 
            y de comunicaciones internas del <strong>Club de Caza, Tiro y Pesca de Yucatán, A.C.</strong>
          </p>
          <p>
            Se recomienda revisar periódicamente esta sección para estar informado sobre cambios 
            en procedimientos, aranceles y requisitos.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import './ConsultasDirectas.css';

export const ConsultasDirectas = ({ irAMisServicios }) => {
  const [servicio, setServicio] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  // Detectar si volvió de la consulta oficial
  useEffect(() => {
    const retorno = localStorage.getItem('retornoConsulta');

    if (retorno === 'true') {
      setServicio(localStorage.getItem('servicioConsulta') || '');
      setModoRegistro(true);
      localStorage.removeItem('retornoConsulta');
    }
  }, []);

  // Ir a consulta oficial
  const irAConsultaOficial = (tipo) => {
    let url = '';

    if (tipo === 'cnel') {
      url = 'https://serviciosenlinea.cnelep.gob.ec/consulta-cuen/';
    }

    if (tipo === 'interagua') {
      url = 'https://www.interagua.com.ec/canales-de-atencion/canales-online';
    }

    localStorage.setItem('servicioConsulta', tipo);
    localStorage.setItem('retornoConsulta', 'true');

    window.open(url, '_blank');
  };

  // 🔥 CAMBIO IMPORTANTE — ahora usa la función del Dashboard
  const irARegistrar = () => {
    irAMisServicios();
  };

  return (
    <div className="consultas-directas">

      <div className="consultas-header">
        <h2 className="consultas-title">Consultas de Servicios</h2>
        <p className="consultas-subtitle">
          Consulta tus valores pendientes en los sitios oficiales
        </p>
      </div>

      {/* LISTA DE SERVICIOS */}
      {!modoRegistro && (
        <div className="consultas-result-container">
          <div className="result-body">

            <h3>Servicios disponibles</h3>

            <p>
              Selecciona un proveedor para ir a su página oficial y consultar tu deuda.
            </p>

            <p style={{ marginTop: '10px', fontWeight: '600' }}>
              ⚠ Esta aplicación no procesa pagos.
              Solo permite registrar gastos para análisis financiero.
            </p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

              <button
                onClick={() => irAConsultaOficial('cnel')}
                className="consultas-form-button"
              >
                🔌 CNEL (Luz)
              </button>

              <button
                onClick={() => irAConsultaOficial('interagua')}
                className="consultas-form-button"
              >
                💧 Interagua (Agua)
              </button>

            </div>

          </div>
        </div>
      )}

      {/* MODO REGISTRO */}
      {modoRegistro && (
        <div className="consultas-result-container">
          <div className="result-body">

            <h3>Consulta realizada ✔</h3>

            <p>
              Servicio consultado:{' '}
              <b>{servicio === 'cnel' ? 'CNEL' : 'Interagua'}</b>
            </p>

            <p style={{ marginTop: '10px' }}>
              Ahora puedes registrar el gasto en Mis Servicios para que
              la IA analice tus hábitos financieros.
            </p>

            <button
              onClick={irARegistrar}
              className="consultas-form-button"
              style={{ marginTop: '15px' }}
            >
              Ir a Mis Servicios 💰
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
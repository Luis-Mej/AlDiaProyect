import { useState } from 'react';
import { asistenteService } from '../../services';
import { handleApiError, formatCurrency } from '../../utils/helpers';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';
import './AsistenteIA.css';

export const AsistenteIA = () => {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analizarServicios = async () => {
    setError('');
    setResultado(null);
    setLoading(true);

    try {
      const response = await asistenteService.analizar();
      setResultado(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asistente-ia">
      {/* Header */}
      <div className="asistente-header">
        <h2 className="asistente-title">
          <FiCpu className="asistente-title-icon" /> Asistente IA
        </h2>
        <p className="asistente-subtitle">
          Análisis inteligente de tus servicios registrados
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={analizarServicios}
        disabled={loading}
        className="asistente-button"
      >
        <FiRefreshCw className={`asistente-button-icon ${loading ? 'spinning' : ''}`} />
        {loading ? 'Analizando servicios...' : 'Analizar Mis Servicios'}
      </button>

      {/* Error */}
      {error && (
        <div className="asistente-error">
          <div className="asistente-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* RESULTADOS */}
      {resultado && (
        <div className="asistente-results">

          {/* 📊 ANALISIS IA */}
          <div className="analysis-section">
            <h3 className="analysis-title">📊 Análisis de IA</h3>
            <p className="analysis-content">
              {resultado.analisis}
            </p>
          </div>

          {/* 📋 DETALLES */}
          {resultado.detalles?.length > 0 && (
            <div className="details-section">
              <h4 className="details-title">📋 Detalles por Servicio</h4>

              <div className="details-grid">
                {resultado.detalles.map((detalle, idx) => (
                  <div
                    key={idx}
                    className={`detail-card ${detalle.ok ? 'success' : 'error'}`}
                  >
                    {/* HEADER */}
                    <div className="detail-card-header success">
                      <h5 className="detail-card-title">
                        {/* icon and name based on servicio value */}
                        {detalle.servicio.toLowerCase().includes('cnel') && '🔌 '}
                        {detalle.servicio.toLowerCase().includes('agua') && '💧 '}
                        {detalle.servicio.toUpperCase()}
                      </h5>
                    </div>

                    {/* BODY */}
                    <div className="detail-card-body">

                      {detalle.ok ? (
                        <>

                          {/* ⭐ PROMEDIO MENSUAL */}
                          {detalle.saldoActual !== null && (
                            <div className="detail-field">
                              <p className="detail-field-label">
                                Promedio mensual estimado
                              </p>
                              <p className="detail-field-value">
                                {formatCurrency(detalle.saldoActual)}
                              </p>
                            </div>
                          )}

                          {/* ⭐ HISTORIAL SI EXISTE */}
                          {detalle.saldoPasado !== null && (
                            <>
                              <div className="detail-field">
                                <p className="detail-field-label">
                                  Promedio anterior
                                </p>
                                <p className="detail-field-value">
                                  {formatCurrency(detalle.saldoPasado)}
                                </p>
                              </div>

                              <div className="detail-field">
                                <p className="detail-field-label">
                                  Tendencia
                                </p>
                                <p className="detail-field-value">
                                  {detalle.variacion > 0
                                    ? "📈 Aumentando"
                                    : "📉 Disminuyendo"}
                                </p>
                              </div>
                            </>
                          )}

                        </>
                      ) : (
                        <div className="detail-error-message">
                          ⚠️ {detalle.mensaje}
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIN SERVICIOS */}
          {(!resultado.detalles || resultado.detalles.length === 0) && (
            <div className="no-services-message">
              <p className="no-services-text">
                ℹ️ No hay servicios registrados para analizar
              </p>
            </div>
          )}
        </div>
      )}

      {/* IDLE */}
      {!resultado && !loading && (
        <div className="asistente-idle">
          <FiCpu className="asistente-idle-icon" />
          <p className="asistente-idle-title">Asistente IA listo</p>
          <p className="asistente-idle-subtitle">
            Haz clic arriba para analizar tus servicios
          </p>
        </div>
      )}
    </div>
  );
};
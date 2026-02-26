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
        <p className="asistente-subtitle">Análisis inteligente de tus servicios registrados</p>
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

      {/* Error Message */}
      {error && (
        <div className="asistente-error">
          <div className="asistente-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {resultado && (
        <div className="asistente-results">
          {/* Analysis Section */}
          <div className="analysis-section">
            <h3 className="analysis-title">📊 Análisis de IA</h3>
            <p className="analysis-content">
              {resultado.analisis}
            </p>
          </div>

          {/* Details Grid */}
          {resultado.detalles && resultado.detalles.length > 0 && (
            <div className="details-section">
              <h4 className="details-title">📋 Detalles por Servicio</h4>
              <div className="details-grid">
                {resultado.detalles.map((detalle, idx) => (
                  <div
                    key={idx}
                    className={`detail-card ${detalle.ok ? 'success' : 'error'}`}
                  >
                    {/* Card Header */}
                    <div className={`detail-card-header ${detalle.ok ? 'success' : 'error'}`}>
                      <h5 className="detail-card-title">
                        {detalle.servicio === 'cnel' ? '🔌 CNEL' : '💧 Interagua'}
                      </h5>
                    </div>

                    {/* Card Body */}
                    <div className="detail-card-body">
                      {detalle.ok ? (
                        <div>
                          {detalle.saldoActual !== null && (
                            <div className="detail-field">
                              <p className="detail-field-label">
                                Saldo Actual
                              </p>
                              <p className="detail-field-value">
                                {formatCurrency(detalle.saldoActual)}
                              </p>
                            </div>
                          )}

                          {detalle.saldoPasado !== null && (
                            <>
                              <div className="detail-field">
                                <p className="detail-field-label">
                                  Saldo Anterior
                                </p>
                                <p className="detail-field-value">
                                  {formatCurrency(detalle.saldoPasado)}
                                </p>
                              </div>

                              <div
                                className={`detail-field ${
                                  detalle.variacion > 0
                                    ? 'warning'
                                    : 'positive'
                                }`}
                              >
                                <p className="detail-field-label">
                                  Variación
                                </p>
                                <p
                                  className="detail-field-value"
                                >
                                  {detalle.variacion > 0 ? '+' : ''}
                                  {formatCurrency(detalle.variacion)}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
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

          {(!resultado.detalles || resultado.detalles.length === 0) && (
            <div className="no-services-message">
              <p className="no-services-text">
                ℹ️ No hay servicios registrados para analizar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Idle State */}
      {!resultado && !loading && (
        <div className="asistente-idle">
          <FiCpu className="asistente-idle-icon" />
          <p className="asistente-idle-title">
            Asistente IA Listo
          </p>
          <p className="asistente-idle-subtitle">
            Haz clic en el botón de arriba para analizar tus servicios con IA
          </p>
        </div>
      )}
    </div>
  );
};

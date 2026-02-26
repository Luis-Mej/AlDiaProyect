import { useState } from 'react';
import { consultasService } from '../../services';
import { handleApiError, formatCurrency } from '../../utils/helpers';
import { FiSearch } from 'react-icons/fi';
import './ConsultasDirectas.css';

export const ConsultasDirectas = () => {
  const [servicio, setServicio] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const consultar = async (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);

    if (!servicio || !cuenta) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await consultasService.consultar(servicio, cuenta);
      setResultado(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultas-directas">
      {/* Header */}
      <div className="consultas-header">
        <h2 className="consultas-title">
          Consultar Servicio
        </h2>
        <p className="consultas-subtitle">Realiza una consulta puntual sin registrar la cuenta</p>
      </div>

      {/* Search Form */}
      <form onSubmit={consultar} className="consultas-form">
        <div className="consultas-form-grid">
          <select
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            className="consultas-form-select"
          >
            <option value="">Selecciona un servicio</option>
            <option value="cnel">🔌 CNEL (Luz)</option>
            <option value="interagua">💧 Interagua (Agua)</option>
          </select>

          <input
            type="text"
            placeholder="Número de cuenta"
            value={cuenta}
            onChange={(e) => setCuenta(e.target.value)}
            className="consultas-form-input"
          />

          <button
            type="submit"
            disabled={loading}
            className="consultas-form-button"
          >
            <FiSearch className="consultas-form-button-icon" /> {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="consultas-error">
          <div className="consultas-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="consultas-loading">
          <div className="consultas-loading-spinner">
            <div className="consultas-spinner-circle"></div>
            <p className="consultas-loading-text">Consultando información...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {resultado && (
        <div className="consultas-result-container">
          {/* Result Header */}
          <div className="result-header">
            <h3 className="result-header-title">
              {resultado.servicio === 'CNEL' ? '🔌 CNEL' : '💧 Interagua'}
            </h3>
            <p className="result-header-account">Cuenta: {resultado.cuenta}</p>
          </div>

          {/* Result Body */}
          <div className="result-body">
            <div className="result-grid">
              {/* Common Fields */}
              <div className="result-field">
                <p className="result-field-label">Cuenta</p>
                <p className="result-field-value">{resultado.cuenta}</p>
              </div>

              {/* CNEL Specific */}
              {resultado.servicio === 'CNEL' ? (
                <>
                  <div className="result-field debt">
                    <p className="result-field-label">Deuda</p>
                    <p className="result-field-value">
                      {resultado.deuda ? formatCurrency(resultado.deuda) : 'Sin deuda'}
                    </p>
                  </div>
                  {resultado.unidadNegocio && (
                    <div className="result-field">
                      <p className="result-field-label">Unidad de Negocio</p>
                      <p className="result-field-value">{resultado.unidadNegocio}</p>
                    </div>
                  )}
                  {resultado.identificacion && (
                    <div className="result-field">
                      <p className="result-field-label">Identificación</p>
                      <p className="result-field-value">{resultado.identificacion}</p>
                    </div>
                  )}
                  {resultado.estado && (
                    <div className="result-field">
                      <p className="result-field-label">Estado</p>
                      <p className="result-field-value">{resultado.estado}</p>
                    </div>
                  )}
                  {resultado.mesesDeuda && (
                    <div className="result-field warning">
                      <p className="result-field-label">Meses de Deuda</p>
                      <p className="result-field-value">{resultado.mesesDeuda}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="result-field debt">
                    <p className="result-field-label">Saldo Actual</p>
                    <p className="result-field-value">
                      {resultado.saldoActual ? formatCurrency(resultado.saldoActual) : 'Sin deuda'}
                    </p>
                  </div>
                  {resultado.planillasAdeudadas && (
                    <div className="result-field warning">
                      <p className="result-field-label">Planillas Adeudadas</p>
                      <p className="result-field-value">{resultado.planillasAdeudadas}</p>
                    </div>
                  )}
                </>
              )}

              {resultado.fechaVencimiento && (
                <div className="result-field info">
                  <p className="result-field-label">Fecha de Vencimiento</p>
                  <p className="result-field-value">{resultado.fechaVencimiento}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

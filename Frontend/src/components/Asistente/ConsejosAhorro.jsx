// Frontend/src/components/Asistente/ConsejosAhorro.jsx

import { useState, useEffect } from 'react';
import { useConsejosStore } from '../../store';
import { consejosService } from '../../services';
import { handleApiError } from '../../utils/helpers';
import './ConsejosAhorro.css';

export const ConsejosAhorro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    analisisCompleto,
    setAnalisisCompleto,
    setLoading: setStoreLoading,
    setError: setStoreError,
  } = useConsejosStore();

  useEffect(() => {
    cargarAnalisis();
  }, []);

  const cargarAnalisis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await consejosService.obtenerAnalisisCompleto();
      setAnalisisCompleto(res.data.data);
    } catch (err) {
      const msg = handleApiError(err);
      setError(msg);
      setStoreError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="consejos-container loading">
        <div className="spinner"></div>
        <p>Analizando tus gastos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consejos-container error">
        <div className="error-box">
          <h3>⚠️ Error al cargar</h3>
          <p>{error}</p>
          <button onClick={cargarAnalisis} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!analisisCompleto || !analisisCompleto.resumen) {
    return (
      <div className="consejos-container empty">
        <p>No hay datos disponibles aún. Crea recordatorios para obtener consejos personalizados.</p>
      </div>
    );
  }

  const { resumen, analisisPorServicio, recomendaciones } = analisisCompleto;

  return (
    <div className="consejos-container">
      {/* Tarjeta de Resumen */}
      <div className="consejos-summary">
        <h2>💡 Análisis de Gastos y Consejos de Ahorro</h2>
        
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Gasto Total</h3>
            <p className="amount">${resumen.gastoTotal.toFixed(2)}</p>
            <span className="period">Últimos 30 días</span>
          </div>

          <div className="summary-card">
            <h3>Gasto Promedio</h3>
            <p className="amount">${resumen.gastoPromedio.toFixed(2)}</p>
            <span className="period">Por pago</span>
          </div>

          <div className="summary-card">
            <h3>Pagos Completados</h3>
            <p className="amount">{resumen.recordatoriosCompletados}/{resumen.totalRecordatorios}</p>
            <span className="period">Tasa de cumplimiento</span>
          </div>

          <div className="summary-card">
            <h3>Puntualidad</h3>
            <p className="amount">
              {resumen.totalRecordatorios > 0 
                ? ((resumen.recordatoriosCompletados / resumen.totalRecordatorios) * 100).toFixed(0)
                : 0}%
            </p>
            <span className="period">Pagos a tiempo</span>
          </div>
        </div>
      </div>

      {/* Análisis por Servicio */}
      {analisisPorServicio && analisisPorServicio.length > 0 && (
        <div className="consejos-section">
          <h3>📊 Desglose por Servicio</h3>
          <div className="servicios-grid">
            {analisisPorServicio.map((servicio, idx) => (
              <div key={idx} className="servicio-card">
                <div className="servicio-header">
                  <h4>
                    {servicio.servicio.includes('cnel') && '⚡'}
                    {servicio.servicio.includes('agua') && '💧'}
                    {servicio.servicio.toUpperCase()}
                  </h4>
                </div>
                <div className="servicio-stats">
                  <div className="stat">
                    <span className="label">Cantidad de pagos</span>
                    <span className="value">{servicio.cantidad}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Gasto total</span>
                    <span className="value">${servicio.gastoTotal.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Por pago</span>
                    <span className="value highlight">${servicio.gastoPorPago.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recomendaciones && recomendaciones.length > 0 && (
        <div className="consejos-section">
          <h3>🎯 Recomendaciones Personalizadas</h3>
          <div className="recomendaciones-list">
            {recomendaciones.map((rec, idx) => (
              <div key={idx} className={`recomendacion-item priority-${rec.prioridad}`}>
                <div className="recomendacion-header">
                  <span className={`priority-badge priority-${rec.prioridad}`}>
                    {rec.prioridad.toUpperCase()}
                  </span>
                  <span className="tipo">{rec.tipo.replace('-', ' ').toUpperCase()}</span>
                </div>
                <p className="mensaje">{rec.mensaje}</p>
                <div className="ahorro-info">
                  <strong>💰 Ahorro estimado:</strong> ${rec.ahorroPotencial.toFixed(2)} por mes
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consejos Generales */}
      <div className="consejos-section general-consejos">
        <h3>💡 Consejos para Maximizar tu Ahorro</h3>
        <ul className="consejos-tips">
          <li>
            <strong>Revisa tus consumos regularmente</strong> - Detecta cambios inusuales que podrían indicar fugas o
            electrodomésticos defectuosos.
          </li>
          <li>
            <strong>Aprovecha promociones</strong> - Muchas empresas ofrecen descuentos por pago automático o
            bundle de servicios.
          </li>
          <li>
            <strong>Mantén tus pagos al día</strong> - Evita intereses por mora y posibles cortes de servicio.
          </li>
          <li>
            <strong>Usa el calendario inteligente</strong> - Configura recordatorios con anticipación para no
            perder fechas de vencimiento.
          </li>
          <li>
            <strong>Compara proveedores</strong> - Algunos servicios tienen alternativas más económicas en tu
            zona.
          </li>
        </ul>
      </div>

      {/* Botón para actualizar análisis */}
      <div className="consejos-actions">
        <button onClick={cargarAnalisis} className="btn-refresh">
          🔄 Actualizar Análisis
        </button>
      </div>
    </div>
  );
};

export default ConsejosAhorro;

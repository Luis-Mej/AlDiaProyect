import { useState, useEffect } from 'react';
import { servicioUsuarioService } from '../../services';
import { useServiciosStore } from '../../store';
import { handleApiError,  formatDate } from '../../utils/helpers';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './MisServicios.css';

export const MisServicios = () => {
  const [nuevoServicio, setNuevoServicio] = useState('');
  const [nuevaCuenta, setNuevaCuenta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { servicios, setServicios, eliminarServicio } = useServiciosStore();

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const response = await servicioUsuarioService.obtenerTodos();
      setServicios(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    setError('');

    if (!nuevoServicio || !nuevaCuenta) {
      setError('Completa todos los campos');
      return;
    }

    try {
      await servicioUsuarioService.crear(nuevoServicio, nuevaCuenta);
      setNuevoServicio('');
      setNuevaCuenta('');
      await cargarServicios();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const eliminarServicioHandler = async (id) => {
    try {
      await servicioUsuarioService.eliminar(id);
      eliminarServicio(id);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <div className="mis-servicios">
      {/* Header */}
      <div className="mis-servicios-header">
        <h2 className="mis-servicios-title">
          Mis Servicios
        </h2>
        <p className="mis-servicios-subtitle">Gestiona tus servicios registrados</p>
      </div>

      {error && (
        <div className="mis-servicios-error">
          <div className="mis-servicios-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {/* Add Service Form */}
      <form onSubmit={agregarServicio} className="mis-servicios-form">
        <h3 className="mis-servicios-form-title">Agregar Nuevo Servicio</h3>
        <div className="mis-servicios-form-grid">
          <select
            value={nuevoServicio}
            onChange={(e) => setNuevoServicio(e.target.value)}
            className="mis-servicios-form-select"
          >
            <option value="">Selecciona un servicio</option>
            <option value="cnel">🔌 CNEL (Luz)</option>
            <option value="interagua">💧 Interagua (Agua)</option>
          </select>

          <input
            type="text"
            placeholder="Número de cuenta"
            value={nuevaCuenta}
            onChange={(e) => setNuevaCuenta(e.target.value)}
            className="mis-servicios-form-input"
          />

          <button
            type="submit"
            className="mis-servicios-form-button"
          >
            <FiPlus className="mis-servicios-form-button-icon" /> Agregar
          </button>
        </div>
      </form>

      {/* Services Grid */}
      {loading ? (
        <div className="mis-servicios-loading">
          <div className="mis-servicios-loading-spinner">
            <div className="mis-servicios-spinner-circle"></div>
            <p className="mis-servicios-loading-text">Cargando servicios...</p>
          </div>
        </div>
      ) : servicios.length === 0 ? (
        <div className="mis-servicios-empty">
          <p className="mis-servicios-empty-title">No tienes servicios guardados aún</p>
          <p className="mis-servicios-empty-subtitle">Agrega uno para empezar a monitorear</p>
        </div>
      ) : (
        <div className="mis-servicios-grid">
          {servicios.map((servicio) => (
            <div
              key={servicio._id}
              className="service-card"
            >
              {/* Card Header */}
              <div className="service-card-header">
                <div className="service-card-header-content">
                  <h4 className="service-card-title">
                    {servicio.servicio === 'cnel' ? '🔌 CNEL' : '💧 Interagua'}
                  </h4>
                  <button
                    onClick={() => eliminarServicioHandler(servicio._id)}
                    className="service-card-delete-btn"
                  >
                    <FiTrash2 className="service-card-delete-icon" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="service-card-body">
                <p className="service-card-account">
                  <span className="service-card-account-label">Cuenta:</span> {servicio.cuenta}
                </p>
                {servicio.ultimoResultado && (
                  <p className="service-card-consulted">
                    <span className="service-card-consulted-label">Consultado:</span> {formatDate(servicio.ultimoResultado.fechaConsulta)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

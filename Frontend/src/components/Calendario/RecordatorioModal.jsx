import { useState, useEffect } from 'react';
import { recordatorioService } from '../../services';
import { useConsejosStore } from '../../store';
import { handleApiError } from '../../utils/helpers';
import { FiX, FiCheck, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './RecordatorioModal.css';

const RecordatorioModal = ({ isOpen, recordatorio, onClose, onSave }) => {
  const { setLoading: setStoreLoading, setError: setStoreError } = useConsejosStore();
  const [formData, setFormData] = useState({
    servicio: '',
    cuenta: '',
    fechaPago: '',
    descripcion: '',
    monto: '',
    notas: '',
    diasAntes: 2,
    horaNotificacion: '09:00',
    categoria: 'servicios_basicos',
    frecuencia: 'mensual',
  });
  
  const [consejos, setConsejos] = useState([]);
  const [mostrarConsejos, setMostrarConsejos] = useState(false);
  const [cargandoConsejos, setCargandoConsejos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recordatorio) {
      // Convertir fechas al formato ISO (YYYY-MM-DD)
      const fechaPago = recordatorio.fechaPago
        ? new Date(recordatorio.fechaPago).toISOString().split('T')[0]
        : '';

      setFormData({
        servicio: recordatorio.servicio || '',
        cuenta: recordatorio.cuenta || '',
        fechaPago: fechaPago,
        descripcion: recordatorio.descripcion || '',
        monto: recordatorio.monto ? recordatorio.monto.toString() : '',
        notas: recordatorio.notas || '',
        diasAntes: recordatorio.diasAntes || 2,
        horaNotificacion: recordatorio.horaNotificacion || '09:00',
        categoria: recordatorio.categoria || 'servicios_basicos',
        frecuencia: recordatorio.frecuencia || 'mensual',
      });
      
      // Cargar consejos si existen
      if (recordatorio.consejosAhorro?.length > 0) {
        setConsejos(recordatorio.consejosAhorro);
      }
    } else {
      setFormData({
        servicio: '',
        cuenta: '',
        fechaPago: '',
        descripcion: '',
        monto: '',
        notas: '',
        diasAntes: 2,
        horaNotificacion: '09:00',
        categoria: 'servicios_basicos',
        frecuencia: 'mensual',
      });
      setConsejos([]);
    }
    setError('');
  }, [recordatorio, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generarConsejos = async () => {
    if (!recordatorio?._id) {
      setError('Guarda el recordatorio primero para generar consejos');
      return;
    }

    setCargandoConsejos(true);
    setStoreLoading(true);
    try {
      const response = await fetch('/api/consejos-ahorro/generar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ recordatorioId: recordatorio._id }),
      });

      if (!response.ok) throw new Error('Error generando consejos');
      
      const data = await response.json();
      setConsejos(data.data.consejos);
      setMostrarConsejos(true);
    } catch (err) {
      setError(handleApiError(err));
      setStoreError(handleApiError(err));
    } finally {
      setCargandoConsejos(false);
      setStoreLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.servicio || !formData.cuenta || !formData.fechaPago) {
      setError('Servicio, cuenta y fecha de pago son requeridos');
      return;
    }

    setLoading(true);
    try {
      const datos = {
        servicio: formData.servicio.toLowerCase(),
        cuenta: formData.cuenta.trim(),
        fechaPago: formData.fechaPago,
        descripcion: formData.descripcion || null,
        monto: formData.monto ? parseFloat(formData.monto) : null,
        notas: formData.notas || null,
        diasAntes: parseInt(formData.diasAntes),
        horaNotificacion: formData.horaNotificacion,
        categoria: formData.categoria,
        frecuencia: formData.frecuencia,
      };

      if (recordatorio?._id) {
        // Actualizar
        await recordatorioService.actualizar(recordatorio._id, datos);
      } else {
        // Crear nuevo
        await recordatorioService.crear(datos);
      }

      onSave();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recordatorio?._id) return;
    
    if (!window.confirm('¿Estás seguro de que deseas eliminar este recordatorio?')) {
      return;
    }

    setLoading(true);
    try {
      await recordatorioService.eliminar(recordatorio._id);
      onSave();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCompletar = async () => {
    if (!recordatorio?._id) return;

    setLoading(true);
    try {
      await recordatorioService.completar(recordatorio._id);
      onSave();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-expanded" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{recordatorio?._id ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Sección Básica */}
          <div className="form-section">
            <h3>Información del Pago</h3>
            
            <div className="form-group">
              <label>Servicio *</label>
              <select
                name="servicio"
                value={formData.servicio}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un servicio</option>
                <option value="cnel">CNEL (Energía Eléctrica)</option>
                <option value="interagua">Interagua (Agua)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Número de Cuenta *</label>
                <input
                  type="text"
                  name="cuenta"
                  value={formData.cuenta}
                  onChange={handleInputChange}
                  placeholder="Ej: 200016357135"
                  required
                />
              </div>

              <div className="form-group">
                <label>Monto (opcional)</label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  placeholder="Ej: 60.50"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Pago *</label>
                <input
                  type="date"
                  name="fechaPago"
                  value={formData.fechaPago}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                >
                  <option value="servicios_basicos">Servicios Básicos</option>
                  <option value="prestamo">Préstamo</option>
                  <option value="suscripcion">Suscripción</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Ej: Pago mensual de electricidad"
              />
            </div>
          </div>

          {/* Sección Notificaciones */}
          <div className="form-section">
            <h3>Configuración de Notificaciones</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Notificar días antes</label>
                <input
                  type="number"
                  name="diasAntes"
                  value={formData.diasAntes}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                />
              </div>

              <div className="form-group">
                <label>Hora de notificación</label>
                <input
                  type="time"
                  name="horaNotificacion"
                  value={formData.horaNotificacion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Frecuencia</label>
                <select
                  name="frecuencia"
                  value={formData.frecuencia}
                  onChange={handleInputChange}
                >
                  <option value="unica">Una sola vez</option>
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>

            <div className="notification-preview">
              <p>📬 Recibirás notificación el <strong>{formData.diasAntes} día(s) antes</strong> a las <strong>{formData.horaNotificacion}</strong></p>
            </div>
          </div>

          {/* Sección Notas */}
          <div className="form-section">
            <h3>Notas Adicionales</h3>
            
            <div className="form-group">
              <label>Notas (opcional)</label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Notas adicionales o recordatorios..."
                rows="3"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="modal-actions">
            <div className="actions-primary">
              <button
                type="submit"
                disabled={loading}
                className="btn-save"
              >
                <FiCheck /> {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>

            {recordatorio?._id && (
              <div className="actions-secondary">
                {recordatorio.estado === 'activo' && (
                  <button
                    type="button"
                    onClick={handleCompletar}
                    disabled={loading}
                    className="btn-complete"
                  >
                    ✓ Marcar como pagado
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="btn-delete"
                >
                  <FiTrash2 /> Eliminar
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Sección de Consejos de Ahorro */}
        {recordatorio?._id && (
          <>
            <div className="consejos-toggle">
              <button
                type="button"
                onClick={() => {
                  if (!mostrarConsejos && consejos.length === 0) {
                    generarConsejos();
                  } else {
                    setMostrarConsejos(!mostrarConsejos);
                  }
                }}
                className="btn-toggle-consejos"
              >
                {mostrarConsejos ? <FiChevronUp /> : <FiChevronDown />}
                💡 Consejos de Ahorro {cargandoConsejos && '(Generando...)'}
              </button>
            </div>

            {mostrarConsejos && (
              <div className="consejos-section">
                {cargandoConsejos ? (
                  <p className="loading-text">Generando consejos personalizados...</p>
                ) : consejos.length > 0 ? (
                  <div className="consejos-list">
                    {consejos.map((consejo, idx) => (
                      <div key={idx} className="consejo-item">
                        <h4>{consejo.titulo}</h4>
                        <p>{consejo.descripcion}</p>
                        <div className="ahorro-potencial">
                          <strong>💰 Ahorro potencial:</strong> {consejo.ahorroPotencial}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-consejos">No hay consejos disponibles. Intenta generar nuevos.</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Info del recordatorio */}
        {recordatorio?._id && (
          <div className="modal-info">
            <p><strong>Estado:</strong> <span className={`estado-${recordatorio.estado}`}>{recordatorio.estado.toUpperCase()}</span></p>
            {recordatorio.notificacionEnviada && (
              <p><strong>Notificación:</strong> ✓ Enviada</p>
            )}
            {recordatorio.createdAt && (
              <p><strong>Creado:</strong> {new Date(recordatorio.createdAt).toLocaleDateString('es-ES')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordatorioModal;

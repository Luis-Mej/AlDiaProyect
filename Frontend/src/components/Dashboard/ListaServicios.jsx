import { useEffect, useState } from 'react';
import { servicioUsuarioService } from '../../services';
import { RegistrarGasto } from './RegistrarGasto';
import { HistorialGastos } from './HistorialGastos';

export const ListaServicios = () => {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const res = await servicioUsuarioService.obtenerTodos();
    setServicios(res.data.data); // importante según tu backend
  };

  const eliminar = async (id, nombre) => {
    const confirmed = window.confirm(`¿Seguro que quieres borrar el servicio "${nombre}"?`);
    if (!confirmed) return;

    try {
      await servicioUsuarioService.eliminar(id);
      cargar();
    } catch (err) {
      console.error('Error al eliminar servicio', err);
      alert('No se pudo eliminar el servicio');
    }
  };

  return (
    <div>
      {servicios.map((s) => (
        <div key={s._id} className="service-card">

          <div className="service-card-header">
            <div className="service-card-header-content">
              <h4 className="service-card-title">{s.nombre}</h4>
              <button
                className="service-card-delete-btn"
                onClick={() => eliminar(s._id, s.nombre)}
              >
                <span className="service-card-delete-icon">🗑️</span>
              </button>
            </div>
          </div>

          <div className="service-card-body">
            <RegistrarGasto servicioId={s._id} />
            <HistorialGastos servicioId={s._id} />
          </div>
        </div>
      ))}
    </div>
  );
};
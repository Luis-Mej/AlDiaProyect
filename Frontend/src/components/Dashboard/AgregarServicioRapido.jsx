import { useState } from 'react';
import { servicioUsuarioService } from '../../services';
import './AgregarServicioRapido.css';

export const AgregarServicioRapido = () => {
  const [seleccionado, setSeleccionado] = useState(null);
  const [error, setError] = useState('');

  // los valores 'categoria' deben coincidir con el enum del servidor; mostramos
  // un label amigable en la UI usando propiedad 'categoriaLabel'
  const servicios = [
    {
      id: 'cnel',
      nombre: 'CNEL',
      categoria: 'servicios_basicos',
      categoriaLabel: 'Luz',
      promedio: '$12 — $25',
      icono: '🔌'
    },
    {
      id: 'interagua',
      nombre: 'Interagua',
      categoria: 'servicios_basicos',
      categoriaLabel: 'Agua',
      promedio: '$7 — $15',
      icono: '💧'
    }
  ];

  const agregar = async () => {
    if (!seleccionado) {
      setError('Selecciona un servicio');
      return;
    }

    // client-side duplicate check to avoid unnecessary request
    try {
      const existentes = await servicioUsuarioService.obtenerTodos();
      const nombres = (existentes.data.data || []).map((x) => x.nombre.toLowerCase());
      if (nombres.includes(seleccionado.nombre.toLowerCase())) {
        setError('Ya tienes ese servicio agregado');
        return;
      }
    } catch (e) {
      console.warn('No se pudo validar duplicado en cliente', e);
      // seguimos de todas formas, el servidor también protegerá
    }

    try {
      await servicioUsuarioService.crear(
        seleccionado.nombre,
        seleccionado.categoria
      );

      window.location.reload(); // por ahora
    } catch (err) {
      console.error('error al agregar servicio rápido', err);
      const msg =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Error al crear servicio';
      setError(msg);
    }
  };

  return (
    <div className="agregar-servicio-container">
      <h3>Agregar servicio rápido</h3>

      <div className="servicios-grid">
        {servicios.map((s) => (
          <div
            key={s.id}
            className={`servicio-card ${
              seleccionado?.id === s.id ? 'seleccionado' : ''
            }`}
            onClick={() => setSeleccionado(s)}
          >
            <div className="servicio-icono">{s.icono}</div>

            <h4>{s.nombre}</h4>
            <p>{s.categoriaLabel || s.categoria}</p>

            <span className="servicio-promedio">
              Promedio: {s.promedio}
            </span>
          </div>
        ))}
      </div>

      <button onClick={agregar} className="agregar-btn">
        Agregar servicio
      </button>

      {error && <p className="error">⚠️ {error}</p>}
    </div>
  );
};
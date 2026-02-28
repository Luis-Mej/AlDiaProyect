import { useEffect, useState } from 'react';
import { gastoMensualService } from '../../services';
import './HistorialGastos.css';

export const HistorialGastos = ({ servicioId }) => {
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    cargar();
  }, [servicioId]);

  const cargar = async () => {
    try {
      const res = await gastoMensualService.obtenerMisGastos();

      const gastosArray = res.data || [];
      const filtrados = gastosArray.filter((g) => {
        // servicioId puede ser objeto poblado, id directo o incluso null
        const id = g.servicioId?._id || g.servicioId;
        return id === servicioId;
      });

      setGastos(filtrados);
    } catch (err) {
      console.error('Error cargando historial de gastos', err);
      setGastos([]);
    }
  };

  // 🔥 MARCAR COMO PAGADO
  const marcarPagado = async (id) => {
    await gastoMensualService.marcarPagado(id);
    cargar(); // 🔄 refrescar lista
  };

  return (
    <div className="historial-container">
      {gastos.length === 0 ? (
        <p className="no-gastos">No hay gastos registrados</p>
      ) : (
        gastos.map((g) => (
          <div key={g._id} className="historial-item">
            <p>
              {g.mes}/{g.anio} — ${g.monto} —{' '}
              {g.pagado ? '✅ Pagado' : '❌ Pendiente'}
            </p>

            {!g.pagado && (
              <button
                className="historial-button"
                onClick={() => marcarPagado(g._id)}
              >
                Marcar como pagado 💰
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};
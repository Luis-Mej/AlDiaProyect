import { useState, useEffect } from 'react';
import { gastoMensualService } from '../../services';

export const RegistrarGasto = ({ servicioId }) => {
  const [monto, setMonto] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // determine current year/month once rather than every click
  const fecha = new Date();
  const anioActual = fecha.getFullYear();
  const mesActual = fecha.getMonth() + 1;

  useEffect(() => {
    // fetch existing gastos to see if we already added one for this servicio + mes/año
    const verificar = async () => {
      try {
        const res = await gastoMensualService.obtenerMisGastos();
        const gastos = res.data || [];

        const ya = gastos.some(
          (g) =>
            g.servicioId === servicioId ||
            g.servicioId?._id === servicioId // populated vs raw
        );

        // When the response is populated with servicioId object we need to
        // check by its _id.  In either case, also check month/year.
        const yaReal = gastos.some((g) => {
          const id = g.servicioId?._id || g.servicioId;
          return (
            id === servicioId &&
            g.anio === anioActual &&
            g.mes === mesActual
          );
        });

        setAlreadyRegistered(yaReal);
      } catch (err) {
        console.error('Error verificando existencia de gasto', err);
      }
    };

    verificar();
  }, [servicioId]);

  const registrar = async () => {
    if (!monto) return alert('Ingresa un monto');

    try {
      await gastoMensualService.crear({
        servicioId,
        anio: anioActual,
        mes: mesActual,
        monto: Number(monto)
      });

      window.location.reload();
    } catch (error) {
      console.error(error);
      // show server-provided message if available
      const msg =
        error.response?.data?.message || 'Error al registrar gasto';
      setErrorMsg(msg);
      alert(msg);
    }
  };

  return (
    <div>
      {alreadyRegistered ? (
        <p className="text-sm text-gray-500">
          Ya registraste un gasto para este servicio en el mes actual.
        </p>
      ) : (
        <>
          <input
            type="number"
            placeholder="Monto del mes"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />

          <button onClick={registrar}>
            Registrar gasto
          </button>
        </>
      )}

      {errorMsg && (
        <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
      )}
    </div>
  );
};
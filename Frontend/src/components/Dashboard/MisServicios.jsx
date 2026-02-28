import { AgregarServicioRapido } from './AgregarServicioRapido';
import { ListaServicios } from './ListaServicios';

export const MisServicios = () => {
  return (
    <div className="mis-servicios">

      <h2>Mis Servicios</h2>

      <AgregarServicioRapido />

      <ListaServicios />

    </div>
  );
};
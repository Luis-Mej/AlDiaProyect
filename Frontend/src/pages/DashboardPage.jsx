import { useState } from 'react';
import { Navbar } from '../components/Common/Navbar';
import { MisServicios } from '../components/Dashboard/MisServicios';
import { ConsultasDirectas } from '../components/Consultas/ConsultasDirectas';
import { AsistenteIA } from '../components/Asistente/AsistenteIA';
import { useAuth } from '../hooks/useAuth';
import { usuarioService } from '../services';
import { handleApiError } from '../utils/helpers';
import { FiGrid, FiSearch, FiCpu, FiStar } from 'react-icons/fi';
import './DashboardPage.css';

export const DashboardPage = () => {
  const [pestaña, setPestaña] = useState('servicios');
  const { usuario, setUsuario } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await usuarioService.actualizarSuscripcion('premium');
      const updatedUser = { ...usuario, suscripcion: 'premium' };
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      setUsuario(updatedUser);
      alert('¡Felicidades! Has actualizado a Premium.');
    } catch (error) {
      alert('Error al actualizar suscripción: ' + handleApiError(error));
    } finally {
      setUpgrading(false);
    }
  };

  const tabs = [
    { id: 'servicios', label: 'Mis Servicios', icon: FiGrid },
    { id: 'consultas', label: 'Consultas', icon: FiSearch },
    { id: 'asistente', label: 'Asistente IA', icon: FiCpu },
  ];

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="subscription-banner">
          <div className="subscription-info">
            <FiStar className="subscription-icon" />
            <span>Suscripción: {usuario?.suscripcion === 'premium' ? 'Premium' : 'Gratuita'}</span>
          </div>
          {usuario?.suscripcion !== 'premium' && (
            <button className="upgrade-btn" onClick={handleUpgrade} disabled={upgrading}>
              <FiStar />
              {upgrading ? 'Actualizando...' : 'Actualizar a Premium'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <div className="dashboard-tabs-container">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPestaña(id)}
                className={`dashboard-tab-btn ${pestaña === id ? 'active' : ''}`}
              >
                <Icon className="dashboard-tab-icon" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="dashboard-content">
          {pestaña === 'servicios' && <MisServicios />}

          {pestaña === 'consultas' && (
            <ConsultasDirectas irAMisServicios={() => setPestaña('servicios')} />
          )}

          {pestaña === 'asistente' && <AsistenteIA />}
        </div>
      </div>
    </div>
  );
};
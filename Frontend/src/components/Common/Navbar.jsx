import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiCalendar } from 'react-icons/fi';
import './Navbar.css';

export const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!usuario) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo-section">
          <div className="navbar-logo-badge">
            AD
          </div>
          <h1 className="navbar-title">Al Día</h1>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <button
            onClick={() => navigate('/dashboard')}
            className="navbar-link"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/calendario')}
            className="navbar-link"
          >
            <FiCalendar /> Calendario
          </button>
        </div>

        {/* User & Logout Section */}
        <div className="navbar-actions">
          {usuario && (
            <div className="navbar-user-info">
              <div className="navbar-user-avatar">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="navbar-user-label">Bienvenido</p>
                <p className="navbar-user-name">{usuario.nombre}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="navbar-logout-btn"
          >
            <FiLogOut className="navbar-logout-icon" /> 
            <span className="navbar-logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

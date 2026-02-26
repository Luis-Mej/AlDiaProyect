import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { handleApiError, isValidPassword, isValidEmail } from '../utils/helpers';
import './AuthPages.css';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilled = location.state?.email || '';

  const [email, setEmail] = useState(prefilled);
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    if (!codigo) {
      setError('Ingresa el código de recuperación');
      return;
    }

    if (!isValidPassword(nuevaContrasena)) {
      setError('Contraseña: mín. 6 caracteres, 1 mayúscula, 1 número');
      return;
    }

    if (nuevaContrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authService.resetearContrasena(email, codigo, nuevaContrasena);
      setSuccess('Contraseña actualizada. Redireccionando a inicio de sesión...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Restablecer Contraseña</h2>
        <p>Ingresa el código que recibiste y tu nueva contraseña</p>
      </div>

      <div className="auth-form-body">
        {error && <div className="auth-error"><p>{error}</p></div>}
        {success && <div className="auth-success"><p>{success}</p></div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-container login">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Código de Recuperación</label>
            <div className="input-container login">
              <input
                type="text"
                placeholder="Código de 6 dígitos"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nueva Contraseña</label>
            <div className="input-container login">
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <div className="input-container login">
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Recibiste el código?{' '}
            <button onClick={() => navigate('/login')}>Volver a iniciar sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
};

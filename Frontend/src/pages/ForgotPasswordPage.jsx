import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { handleApiError, isValidEmail } from '../utils/helpers';
import './AuthPages.css';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Ingrese un email válido');
      return;
    }

    setLoading(true);
    try {
      await authService.solicitarRecuperacion(email);
      setSuccess('Se envió un código a tu correo. Revisa tu bandeja.');
      // Dirigir a la página de reset con el email prellenado
      setTimeout(() => navigate('/resetear', { state: { email } }), 900);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu email para recibir un código de recuperación</p>
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

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Recordaste tu contraseña?{' '}
            <button onClick={() => navigate('/login')}>Iniciar sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
};

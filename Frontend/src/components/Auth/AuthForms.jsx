import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import { useAuthStore } from '../../store';
import { handleApiError, isValidEmail, isValidPassword } from '../../utils/helpers';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthForms.css';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUsuario = useAuthStore((state) => state.setUsuario);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    if (!contrasena) {
      setError('La contraseña es requerida');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, contrasena);
      const { usuario, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      setUsuario(usuario, token);
      navigate('/dashboard');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Al Día</h2>
        <p>Servicios Inteligentes</p>
      </div>

      <div className="auth-form-body">
        {error && (
          <div className="auth-error">
            <p>Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-container login">
              <FiMail />
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
            <label>Contraseña</label>
            <div className="input-container login">
              <FiLock />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="auth-input"
                aria-label="Contraseña"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="forgot-link">
              <button type="button" className="link-button" onClick={() => navigate('/recuperar')}>¿Olvidaste tu contraseña?</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <button onClick={() => navigate('/registrar')}>
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmContrasena, setConfirmContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    if (!isValidPassword(contrasena)) {
      setError('Contraseña: mín. 6 caracteres, 1 mayúscula, 1 número');
      return;
    }

    if (contrasena !== confirmContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.registrar(nombre, email, contrasena);
      // Guardar el email exacto devuelto por el backend en sessionStorage
      const emailParaVerificacion = response.data.email || email;
      sessionStorage.setItem('emailVerification', emailParaVerificacion);
      navigate('/verificar');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header register">
        <h2>Crear Cuenta</h2>
        <p>Únete a Al Día</p>
      </div>

      <div className="auth-form-body">
        {error && (
          <div className="auth-error">
            <p>Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre Completo</label>
            <div className="input-container register">
              <FiUser />
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="auth-input register"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-container register">
              <FiMail />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input register"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <p className="password-helper">Mín. 6 caracteres, 1 mayúscula, 1 número</p>
            <div className="input-container register">
              <FiLock />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="auth-input register"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <div className="input-container register">
              <FiLock />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmContrasena}
                onChange={(e) => setConfirmContrasena(e.target.value)}
                className="auth-input register"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button register">
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer register">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button onClick={() => navigate('/login')}>
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

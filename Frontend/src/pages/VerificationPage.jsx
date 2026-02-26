import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { handleApiError } from '../utils/helpers';
import { FiMail, FiCheck, FiArrowRight } from 'react-icons/fi';
import './VerificationPage.css';

export const VerificationPage = () => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener email del sessionStorage
    const emailStored = sessionStorage.getItem('emailVerification');
    if (!emailStored) {
      navigate('/registrar');
      return;
    }
    setEmail(emailStored);
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!codigo.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    if (codigo.trim().length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      await authService.verificarCodigo(email, codigo);
      setSuccess(true);
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('emailVerification');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendLoading(true);
    try {
      await authService.reenviarCodigo(email);
      setError(''); // Limpiar errores previos
      // Mostrar un mensaje de éxito temporal
      alert('Código reenviado a tu correo');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verification-page">
      <div className="verification-page-content">
        <div className="verification-card">
          {!success ? (
            <>
              <div className="verification-header">
                <div className="verification-icon-container">
                  <FiMail className="verification-icon" />
                </div>
                <h2>Verifica Tu Correo</h2>
                <p>Hemos enviado un código de verificación a:</p>
                <p className="verification-email">{email}</p>
              </div>

              <div className="verification-form-body">
                {error && (
                  <div className="verification-error">
                    <p>⚠️ {error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="verification-form">
                  <div className="form-group">
                    <label>Código de Verificación</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.slice(0, 6))}
                      className="verification-input"
                      maxLength="6"
                      disabled={loading}
                    />
                    <p className="verification-helper">Ingresa los 6 dígitos que recibiste</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="verification-button"
                  >
                    {loading ? (
                      <>
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <span>Verificar Código</span>
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </form>

                <div className="verification-resend">
                  <p>¿No recibiste el código?</p>
                  <button
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="resend-button"
                  >
                    {resendLoading ? 'Reenviando...' : 'Reenviar código'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="verification-success">
              <div className="success-icon-container">
                <FiCheck className="success-icon" />
              </div>
              <h2>¡Verificación Exitosa!</h2>
              <p>Tu cuenta ha sido verificada correctamente.</p>
              <p className="success-subtitle">Redirigiendo al inicio de sesión...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

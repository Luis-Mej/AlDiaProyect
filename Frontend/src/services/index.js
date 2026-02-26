import api from './api';

// Autenticación
export const authService = {
  registrar: (nombre, email, contrasena) =>
    api.post('/usuarios/registrar', { nombre, email, contrasena }),
  
  login: (email, contrasena) =>
    api.post('/usuarios/login', { email, contrasena }),
  
  verificarCodigo: (email, codigo) =>
    api.post('/usuarios/verificar', { email, codigo }),
  
  reenviarCodigo: (email) =>
    api.post('/usuarios/reenviar-codigo', { email }),
  
  // Recuperación de contraseña
  solicitarRecuperacion: (email) =>
    api.post('/usuarios/solicitar-recuperacion', { email }),
  resetearContrasena: (email, codigo, nuevaContrasena) =>
    api.post('/usuarios/resetear-contrasena', { email, codigo, nuevaContrasena }),
};

// Usuarios
export const usuarioService = {
  obtenerTodos: () => api.get('/usuarios'),
  
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
  
  actualizar: (id, datos) =>
    api.put(`/usuarios/actualizar/${id}`, datos),
  
  actualizarSuscripcion: (suscripcion) =>
    api.put('/usuarios/suscripcion', { suscripcion }),
  
  eliminar: (id) => api.delete(`/usuarios/eliminar/${id}`),
};

// Servicios de Usuario
export const servicioUsuarioService = {
  crear: (servicio, cuenta) =>
    api.post('/mis-servicios', { servicio, cuenta }),
  
  obtenerTodos: () => api.get('/mis-servicios'),
  
  eliminar: (id) => api.delete(`/mis-servicios/${id}`),
};

// Consultas
export const consultasService = {
  consultar: (servicio, cuenta) =>
    api.get('/consultas', { params: { servicio, cuenta } }),
  
  consultarMisServicios: () => api.get('/consultas/mis-servicios'),
};

// Asistente IA
export const asistenteService = {
  analizar: () => api.post('/asistente/analizar'),
};

// Recordatorios
export const recordatorioService = {
  obtenerTodos: () => api.get('/recordatorios'),
  
  obtenerPorId: (id) => api.get(`/recordatorios/${id}`),
  
  crear: (datos) => api.post('/recordatorios', datos),
  
  actualizar: (id, datos) => api.put(`/recordatorios/${id}`, datos),
  
  eliminar: (id) => api.delete(`/recordatorios/${id}`),
  
  completar: (id) => api.patch(`/recordatorios/${id}/completar`),
};

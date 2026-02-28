import api from './api';


// 🔐 AUTENTICACIÓN

export const authService = {
  registrar: (nombre, email, contrasena) =>
    api.post('/usuarios/registrar', { nombre, email, contrasena }),
  
  login: (email, contrasena) =>
    api.post('/usuarios/login', { email, contrasena }),
  
  verificarCodigo: (email, codigo) =>
    api.post('/usuarios/verificar', { email, codigo }),
  
  reenviarCodigo: (email) =>
    api.post('/usuarios/reenviar-codigo', { email }),
  
  solicitarRecuperacion: (email) =>
    api.post('/usuarios/solicitar-recuperacion', { email }),
  
  resetearContrasena: (email, codigo, nuevaContrasena) =>
    api.post('/usuarios/resetear-contrasena', { email, codigo, nuevaContrasena }),
};


// 👤 USUARIOS

export const usuarioService = {
  obtenerTodos: () => api.get('/usuarios'),
  
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
  
  actualizar: (id, datos) =>
    api.put(`/usuarios/actualizar/${id}`, datos),
  
  actualizarSuscripcion: (suscripcion) =>
    api.put('/usuarios/suscripcion', { suscripcion }),
  
  eliminar: (id) => api.delete(`/usuarios/eliminar/${id}`),
};


// 🟢 SERVICIOS RECURRENTES

export const servicioUsuarioService = {
  crear: (nombre, categoria) =>
    api.post('/mis-servicios', { nombre, categoria }),

  obtenerTodos: () => api.get('/mis-servicios'),

  eliminar: (id) => api.delete(`/mis-servicios/${id}`),
};


// 🔴 GASTOS MENSUALES

export const gastoMensualService = {

  // 🔥 Crear gasto mensual (usuario se obtiene del token)
  crear: (datos) =>
    api.post('/gastos', datos),

  // 🔥 Obtener gastos del usuario autenticado
  obtenerMisGastos: () =>
    api.get('/gastos/mis-gastos'),

  // 🔥 Marcar gasto como pagado
  marcarPagado: (id) =>
    api.patch(`/gastos/${id}/pagar`)
};


// 🔍 CONSULTAS

export const consultasService = {
  consultar: (servicio, cuenta) =>
    api.get('/consultas', { params: { servicio, cuenta } }),
  
  consultarMisServicios: () =>
    api.get('/consultas/mis-servicios'),
};


// 🤖 ASISTENTE IA

export const asistenteService = {
  analizar: () => api.post('/asistente/analizar'),
};

// servicios para consejos de ahorro (backend en /api/consejos-ahorro)
export const consejosService = {
  generar: (recordatorioId) =>
    api.post('/consejos-ahorro/generar', { recordatorioId }),
  obtenerAnalisisCompleto: () => api.get('/consejos-ahorro/analisis/completo'),
  obtenerTodos: () => api.get('/consejos-ahorro')
};


// ⏰ RECORDATORIOS

export const recordatorioService = {
  obtenerTodos: () => api.get('/recordatorios'),
  
  obtenerPorId: (id) => api.get(`/recordatorios/${id}`),
  
  crear: (datos) => api.post('/recordatorios', datos),
  
  actualizar: (id, datos) =>
    api.put(`/recordatorios/${id}`, datos),
  
  eliminar: (id) =>
    api.delete(`/recordatorios/${id}`),
  
  completar: (id) =>
    api.patch(`/recordatorios/${id}/completar`),
};
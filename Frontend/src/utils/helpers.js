// Función auxiliar para capturar errores
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.mensaje || 'Ocurrió un error en el servidor. Por favor, intente más tarde.';
  }
  if (error.request) {
    return 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
  }
  return 'Error desconocido. Por favor, contacte al soporte.';
};

// Validar email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validar contraseña
export const isValidPassword = (password) => {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

// Formatear moneda
export const formatCurrency = (value) => {
  // Proteger contra valores nulos o no numéricos
  if (value === null || typeof value === 'undefined' || value === '') return 'N/A';
  const num = Number(value);
  if (Number.isNaN(num)) return 'N/A';
  try {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  } catch {
    return 'N/A';
  }
};

// Formatear fecha
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
};

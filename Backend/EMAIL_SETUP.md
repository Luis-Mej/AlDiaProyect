# 📧 Sistema de Verificación de Email - Guía de Configuración

## 🎯 Resumen

El sistema permite enviar códigos de verificación por email a los usuarios en el registro. En **desarrollo**, muestra los códigos en consola. En **producción**, usa Nodemailer con Gmail o cualquier proveedor SMTP.

---

## 🚀 Configuración para Gmail

### Paso 1: Habilitar Autenticación de 2 Factores
1. Abre [myaccount.google.com](https://myaccount.google.com)
2. Ve a **Seguridad** (barra izquierda)
3. Busca "Verificación en dos pasos" y habilítala

### Paso 2: Generar Contraseña de Aplicación
1. En la misma sección de Seguridad, busca "Contraseñas de aplicación"
2. Selecciona:
   - **Aplicación**: Correo
   - **Dispositivo**: Windows / Mac / Linux
3. Google generará una contraseña de 16 caracteres

### Paso 3: Actualizar `.env`

Reemplaza en `Backend/.env`:

```dotenv
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña generada por Google (sin espacios)
NODE_ENV=development
```

---

## 🧪 Modo Desarrollo

**Sin configurar EMAIL_USER/EMAIL_PASSWORD**, el sistema:
- ✅ Genera códigos de 6 dígitos
- ✅ Los muestra en la consola del servidor
- ✅ Los guarda en la BD (con expiración)
- ✅ Permite verificar normalmente

Ideal para **testing local** sin necesidad de SMTP.

---

## 🔄 Flujo de Registro y Verificación

### Frontend (React):

```
1. Usuario: Rellenar formulario (nombre, email, contraseña x2)
2. Click: "Registrarse"
3. Frontend: Valida emails y contraseñas
4. API POST /usuarios/registrar
   ↓
5. Usuario recibe: Pantalla de verificación (/verificar)
6. Usuario ingresa: Código de 6 dígitos
7. API POST /usuarios/verificar
   ↓
8. Éxito: Pantalla de confirmación + Redirección a login
```

### Backend (Node.js):

```javascript
// 1. Registro: genera código y lo guarda
const codigo = generarCodigo(); // "123456"
usuario.codigoVerificacion = codigo;
usuario.codigoVerificacionExpira = new Date() + 15 min;
await usuario.save();

// 2. Email: intenta enviar (o muestra en consola)
await enviarCodigoVerificacion(email, nombre, codigo);

// 3. Verificación: compara código
if (codigo !== req.body.codigo) return error;
if (Date.now() > expiración) return error;

usuario.verificado = true;
usuario.codigoVerificacion = null;
await usuario.save();
```

---

## 📱 Endpoints

### Registro (No requiere token)
```
POST /api/usuarios/registrar
Body: { nombre, email, contrasena }
Response: { mensaje, usuario }
```

### Verificar Código (No requiere token)
```
POST /api/usuarios/verificar
Body: { email, codigo }
Response: { mensaje, usuario }
```

### Reenviar Código (No requiere token)
```
POST /api/usuarios/reenviar-codigo
Body: { email }
Response: { mensaje }
```

---

## 🛡️ Seguridad

- ✅ Códigos válidos por 15 minutos
- ✅ Rate limiting en registro y verificación
- ✅ Códigos no retornan en respuestas de API
- ✅ Contraseña nunca se devuelve (select: false)
- ✅ Email debe ser único
- ✅ Validación de contraseña: mín 6 caracteres, 1 mayúscula, 1 número

---

## 🌐 Otros Proveedores de Email

### SendGrid
```javascript
// Alternativa: SendGrid
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
    to: email,
    from: 'noreply@aldia.com',
    subject: 'Código de Verificación',
    html: `Código: ${codigo}`
});
```

### AWS SES
```javascript
// Alternativa: AWS SES
import AWS from 'aws-sdk';
const ses = new AWS.SES({ region: 'us-east-1' });

await ses.sendEmail({...}).promise();
```

---

## 📝 Pruebas Manuales

### 1. Desarrollo (sin email)
```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Abre navegador
# Ve a http://localhost:5173/registrar
# Rellena: nombre, email, contraseña
# Haz clic en "Registrarse"
# Verifica en la consola del servidor el código generado
# Ingresa el código en la pantalla de verificación
# ¡Listo! Usuario verificado
```

### 2. Producción (con Gmail)
```bash
# Actualiza .env con credenciales de Gmail
# Reinicia el servidor
npm run dev

# Mismo flujo, pero recibe emails reales
```

---

## ❌ Problemas Comunes

### "Error: ENOTFOUND"
→ EMAIL_USER o EMAIL_PASSWORD vacíos. Actualiza `.env`

### "Error: Invalid login"
→ Contraseña incorrecta. Regenera en myaccount.google.com

### "Error: rate limit exceeded"
→ Demasiados intentos. Espera 15 minutos o reinicia.

### "El código ha expirado"
→ El código caduca en 15 minutos. Usa "Reenviar código"

---

## 🎨 Personalización

### Cambiar HTML del Email
Edita `Backend/src/utils/emailService.js`, función `enviarCodigoVerificacion()`

### Cambiar Validez del Código
En `usuariosControllers.js`, búsca `15 * 60000` y cambia a minutos:
```javascript
const expiracion = new Date(ahora.getTime() + 20 * 60000); // 20 minutos
```

### Cambiar Rate Limiting
En `Backend/src/middlewares/rateLimitMiddleware.js`

---

## 🚀 Deploy a Producción

### Heroku / Railway / Render
```bash
# Agrega variables de entorno en el panel:
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxx-xxx-xxx-xxx
NODE_ENV=production
```

### Variables Sensibles
- 🔐 **Nunca** commits `.env` a Git
- 🔐 Usa `.env.example` para documentar campos
- 🔐 En servidor, usa variables de entorno del hosting

---

## 📚 Referencias

- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid](https://sendgrid.com/)
- [AWS SES](https://aws.amazon.com/ses/)

---

**¿Preguntas?** Revisa los logs en la consola del servidor. Todos los errores se muestran ahí.

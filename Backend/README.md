# AlDia Backend API

API para consultar servicios básicos (agua, luz) en Ecuador con análisis de gastos usando IA.

## 🚀 Instalación

```bash
npm install
npm run dev  # Desarrollo con nodemon
npm start    # Producción
npm test     # Ejecutar tests
```

## 📋 Endpoints

### Autenticación

#### Registro
```
POST /api/usuarios/registrar
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contrasena": "Password123"
}

Response: 201
{
  "mensaje": "Usuario creado correctamente",
  "usuario": { "id", "nombre", "email" }
}
```

#### Login
```
POST /api/usuarios/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "contrasena": "Password123"
}

Response: 200
{
  "mensaje": "Inicio de sesión exitoso",
  "usuario": { "id", "nombre", "email" },
  "token": "eyJhbGc..."
}
```

### Usuarios (Requiere Token)

#### Obtener todos
```
GET /api/usuarios
Authorization: Bearer <token>

Response: 200
[
  { "id", "nombre", "email", "createdAt" },
  ...
]
```

#### Obtener por ID
```
GET /api/usuarios/:id
Authorization: Bearer <token>

Response: 200
{ "id", "nombre", "email", "createdAt" }
```

#### Actualizar
```
PUT /api/usuarios/actualizar/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nuevo Nombre",
  "email": "newemail@example.com",
  "contrasena": "NewPassword123"
}

Response: 200
{ "mensaje": "Usuario actualizado", "usuario": {...} }
```

#### Eliminar
```
DELETE /api/usuarios/eliminar/:id
Authorization: Bearer <token>

Response: 200
{ "mensaje": "Usuario eliminado correctamente" }
```

### Servicios de Usuario

#### Crear servicio guardado
```
POST /api/mis-servicios
Authorization: Bearer <token>
Content-Type: application/json

{
  "servicio": "cnel",
  "cuenta": "2000123456"
}

Response: 201
{
  "mensaje": "Servicio guardado",
  "servicio": { "id", "usuarioId", "servicio", "cuenta" }
}
```

#### Obtener servicios
```
GET /api/mis-servicios
Authorization: Bearer <token>

Response: 200
[
  { "id", "servicio", "cuenta", "ultimoResultado", "createdAt" },
  ...
]
```

#### Eliminar servicio
```
DELETE /api/mis-servicios/:id
Authorization: Bearer <token>

Response: 200
{ "mensaje": "Servicio eliminado" }
```

### Consultas

#### Consulta directa (sin guardar)
```
GET /api/consultas?servicio=cnel&cuenta=2000123456

Response: 200
{
  "servicio": "CNEL",
  "cuenta": "2000123456",
  "estado": "ACTIVO",
  "deuda": 45.50,
  "fechaVencimiento": "2025-12-10"
}
```

#### Consultar mis servicios
```
GET /api/consultas/mis-servicios
Authorization: Bearer <token>

Response: 200
{
  "ok": true,
  "data": [
    {
      "servicio": "CNEL",
      "cuenta": "2000123456",
      "ok": true,
      "deuda": 45.50
    },
    ...
  ]
}
```

### Asistente IA

#### Analizar servicios
```
POST /api/asistente/analizar
Authorization: Bearer <token>

Response: 200
{
  "ok": true,
  "analisis": "Durante este mes ha aumentado el consumo de...",
  "detalles": [
    {
      "servicio": "CNEL",
      "saldoActual": 50,
      "saldoPasado": 30,
      "variacion": 20
    }
  ]
}
```

## 🔒 Seguridad

- **Autenticación JWT**: Tokens con expiración de 3 horas
- **Rate Limiting**: 
  - Login: 5 intentos / 15 minutos
  - Registro: 3 registros / hora
  - Consultas: 30 consultas / 10 minutos
- **Validación de entrada**: Express-validator
- **Hashing de contraseñas**: Bcryptjs (10 rondas)

## 📝 Validaciones

### Registro/Actualización
- Nombre: 2-100 caracteres
- Email: Formato válido
- Contraseña: Mín. 6 caracteres, 1 mayúscula, 1 número

### Servicios
- Servicio: "cnel" o "interagua"
- Cuenta: 1-50 caracteres

## 📊 Logging

Los logs se guardan en `/logs/`:
- `error.log`: Solo errores
- `combined.log`: Todos los logs

## 🧪 Testing

```bash
npm test
```

Tests incluidos:
- Autenticación (registro, login)
- Rutas protegidas
- Validación de entrada

## 📦 Dependencias

- Express 5.1.0
- Mongoose 8.19.3
- JWT 9.0.2
- Bcryptjs 3.0.3
- Puppeteer 24.30.0
- Express-validator 7.0.0
- Express-rate-limit 7.1.5
- Winston 3.11.0

## 🌍 Variables de Entorno

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=3h
PORT=4000
NODE_ENV=development
LOG_LEVEL=info
```

## 📄 Licencia

ISC

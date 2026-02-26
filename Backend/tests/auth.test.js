import request from 'supertest';
import app from '../src/app.js';

describe('Auth Endpoints', () => {
  describe('POST /api/usuarios/registrar', () => {
    it('debería crear un nuevo usuario con datos válidos', async () => {
      const res = await request(app)
        .post('/api/usuarios/registrar')
        .send({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          contrasena: 'Password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.usuario.email).toBe('juan@example.com');
      expect(res.body.usuario.contrasena).toBeUndefined();
    });

    it('debería rechazar usuario sin nombre', async () => {
      const res = await request(app)
        .post('/api/usuarios/registrar')
        .send({
          email: 'test@example.com',
          contrasena: 'Password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it('debería rechazar email inválido', async () => {
      const res = await request(app)
        .post('/api/usuarios/registrar')
        .send({
          nombre: 'Test User',
          email: 'invalidemail',
          contrasena: 'Password123',
        });

      expect(res.status).toBe(400);
    });

    it('debería rechazar contraseña débil', async () => {
      const res = await request(app)
        .post('/api/usuarios/registrar')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          contrasena: 'weak',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/usuarios/login', () => {
    it('debería devolver token con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'juan@example.com',
          contrasena: 'Password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('debería rechazar credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'notexist@example.com',
          contrasena: 'wrongpassword',
        });

      expect(res.status).toBe(404);
    });
  });
});

describe('Protected Routes', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'juan@example.com',
        contrasena: 'Password123',
      });

    token = res.body.token;
  });

  it('debería denegar acceso sin token', async () => {
    const res = await request(app)
      .get('/api/usuarios');

    expect(res.status).toBe(401);
  });

  it('debería permitir acceso con token válido', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

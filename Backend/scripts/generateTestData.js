import mongoose from 'mongoose';
import dotenv from 'dotenv';
import usuarioModel from '../src/models/usuarioModel.js';
import recordatorioModel from '../src/models/recordatorioModel.js';
import consejoAhorroModel from '../src/models/consejoAhorroModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a la base de datos');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

const generateTestData = async () => {
  try {
    // Crear usuarios de prueba
    const usuarios = [
      { nombre: 'Juan Pérez', email: 'juan@example.com', contrasena: 'Password123' },
      { nombre: 'Ana López', email: 'ana@example.com', contrasena: 'Password123' },
    ];
    const usuariosCreados = await usuarioModel.insertMany(usuarios);
    console.log('✅ Usuarios de prueba creados');

    // Crear recordatorios de prueba
    const recordatorios = [
      {
        usuarioId: usuariosCreados[0]._id, // Usar el ID del primer usuario creado
        servicio: 'Netflix',
        cuenta: 'juan@example.com',
        fechaPago: new Date(),
        descripcion: 'Pago mensual de Netflix',
        monto: 15.99,
      },
    ];
    await recordatorioModel.insertMany(recordatorios);
    console.log('✅ Recordatorios de prueba creados');

    // Crear consejos de ahorro de prueba
    const consejos = [
      { titulo: 'Apaga las luces', descripcion: 'Ahorra energía apagando las luces que no uses.' },
      { titulo: 'Compra al por mayor', descripcion: 'Reduce costos comprando productos en grandes cantidades.' },
    ];
    await consejoAhorroModel.insertMany(consejos);
    console.log('✅ Consejos de ahorro creados');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al generar datos de prueba:', error.message);
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  await generateTestData();
})();